import { createHash, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db, loginAttempts, sessions, users } from "@/db";

import { SESSION_COOKIE } from "./auth-cookie";
export { SESSION_COOKIE };

const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;
// Per account, and per IP address (higher, since people can share a network).
const MAX_FAILED_PER_EMAIL = 10;
const MAX_FAILED_PER_IP = 30;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

function scryptAsync(password: string, salt: Buffer, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, options, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

/** Returns "scrypt$N$r$p$salt$hash" so parameters can be raised later without breaking old hashes. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scryptAsync(password, Buffer.from(salt, "base64"), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// A real hash to compare against when the email doesn't exist, so response
// time doesn't reveal which emails have accounts.
let dummyHash: Promise<string> | undefined;
export function getDummyHash() {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHash;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Starts a session for the user and sets the cookie. Call from a server action or route handler. */
export async function createSession(userId: string, days = SESSION_DAYS) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + days * DAY_MS);
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  await setSessionCookie(token, expiresAt);
}

/** Ends the current session and clears the cookie. */
export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  store.delete(SESSION_COOKIE);
}

export type CurrentUser = {
  /** The profile the dashboard edits: the user's own, or the managed profile an admin switched to. */
  id: string;
  email: string;
  /** The account that actually signed in. Differs from `id` while an admin manages a customer profile. */
  realId: string;
  realEmail: string;
  /** True when `id` is a managed customer profile (switched to, or opened from a Control Room link). */
  managed: boolean;
  /** Set while an admin is switched to one of their managed profiles. */
  actingAs: string | null;
};

/** The signed-in user, or null. Cached for the duration of a request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const id = hashToken(token);
  const [row] = await db
    .select({
      userId: users.id,
      email: users.email,
      managedBy: users.managedBy,
      expiresAt: sessions.expiresAt,
      actingAs: sessions.actingAs,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id))
    .limit(1);
  if (!row) return null;

  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  // Slide the expiry forward once the session is half used up. Sessions opened from a
  // Control Room link are short (a few days) and are not extended.
  if (!row.managedBy && row.expiresAt.getTime() - Date.now() < (SESSION_DAYS / 2) * DAY_MS) {
    const expiresAt = new Date(Date.now() + SESSION_DAYS * DAY_MS);
    await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id));
    // Cookies can only be written from actions and route handlers; elsewhere the DB extension is enough
    // until the next action refreshes the cookie.
    await setSessionCookie(token, expiresAt).catch(() => {});
  }

  const self = { realId: row.userId, realEmail: row.email };
  if (row.actingAs && !row.managedBy) {
    // Only ever a profile this account manages; anything else falls back to the user's own profile.
    const [target] = await db
      .select({ email: users.email })
      .from(users)
      .where(and(eq(users.id, row.actingAs), eq(users.managedBy, row.userId)))
      .limit(1);
    if (target) return { id: row.actingAs, email: target.email, ...self, managed: true, actingAs: row.actingAs };
  }
  return { id: row.userId, email: row.email, ...self, managed: !!row.managedBy, actingAs: null };
});

/** Points the current session at one of the admin's managed profiles, or back at their own (null). */
export async function setActingAs(profileId: string | null) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return;
  await db.update(sessions).set({ actingAs: profileId }).where(eq(sessions.id, hashToken(token)));
}

/** Removes expired sessions and old login attempts. Cheap enough to run on each sign-in. */
export async function pruneAuthTables() {
  const now = new Date();
  await db.delete(sessions).where(lt(sessions.expiresAt, now));
  await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(now.getTime() - ATTEMPT_WINDOW_MS)));
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

export async function isRateLimited(keys: string[]) {
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MS);
  for (const key of keys) {
    const [{ n }] = await db
      .select({ n: count() })
      .from(loginAttempts)
      .where(and(eq(loginAttempts.key, key), gt(loginAttempts.createdAt, since)));
    if (n >= (key.startsWith("ip:") ? MAX_FAILED_PER_IP : MAX_FAILED_PER_EMAIL)) return true;
  }
  return false;
}

export async function recordFailedAttempt(keys: string[]) {
  await db.insert(loginAttempts).values(keys.map((key) => ({ key })));
}

export async function clearFailedAttempts(key: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
}
