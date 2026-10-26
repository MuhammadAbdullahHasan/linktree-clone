"use server";

import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, profiles, users } from "@/db";
import {
  clearFailedAttempts,
  createSession,
  destroySession,
  getDummyHash,
  hashPassword,
  isRateLimited,
  pruneAuthTables,
  recordFailedAttempt,
  verifyPassword,
} from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);
const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(200, "Use 200 characters or fewer");

function inviteCodeMatches(given: string) {
  const expected = process.env.INVITE_CODE;
  if (!expected) return true;
  const a = Buffer.from(given.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function signUp(input: { email: string; password: string; inviteCode: string }): Promise<ActionResult> {
  const email = emailSchema.safeParse(input.email);
  if (!email.success) return { ok: false, error: email.error.issues[0].message };
  const password = passwordSchema.safeParse(input.password);
  if (!password.success) return { ok: false, error: password.error.issues[0].message };

  const ipKey = `ip:${await clientIp()}`;
  if (await isRateLimited([ipKey])) {
    return { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." };
  }
  if (!inviteCodeMatches(input.inviteCode)) {
    await recordFailedAttempt([ipKey]);
    return { ok: false, error: "That invite code isn't right" };
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email.data)).limit(1);
  if (existing.length) return { ok: false, error: "An account with this email already exists. Try logging in." };

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password.data);
  try {
    await db.batch([
      db.insert(users).values({ id: userId, email: email.data, passwordHash }),
      db.insert(profiles).values({ id: userId }),
    ]);
  } catch {
    return { ok: false, error: "Couldn't create your account. Please try again." };
  }

  await createSession(userId);
  return { ok: true, data: null };
}

export async function signIn(input: { email: string; password: string }): Promise<ActionResult> {
  const generic = { ok: false as const, error: "Email or password is incorrect" };
  const email = emailSchema.safeParse(input.email);
  if (!email.success || typeof input.password !== "string" || input.password.length > 200) return generic;

  const emailKey = `email:${email.data}`;
  const ipKey = `ip:${await clientIp()}`;
  if (await isRateLimited([emailKey, ipKey])) {
    return { ok: false, error: "Too many attempts. Please wait 15 minutes and try again." };
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email.data))
    .limit(1);
  const valid = await verifyPassword(input.password, user?.passwordHash ?? (await getDummyHash()));

  if (!user || !valid) {
    await recordFailedAttempt([emailKey, ipKey]);
    return generic;
  }

  await clearFailedAttempts(emailKey);
  await pruneAuthTables();
  await createSession(user.id);
  return { ok: true, data: null };
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
