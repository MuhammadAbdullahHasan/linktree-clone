import { randomBytes } from "node:crypto";
import { and, desc, eq, gt, gte, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { apiTokens, db, events, handoffTokens, links, profiles, sessions, socialLinks, users } from "@/db";
import { getCurrentUser, hashToken } from "@/lib/auth";
import { avatarUrlFor } from "@/lib/profile-query";
import { usernameSchema } from "@/lib/username";

// The site owner runs customer profiles from their own account. Customers never sign in:
// their user row has a placeholder email and an unusable password hash.

const DAY_MS = 24 * 60 * 60 * 1000;
const HANDOFF_MS = 2 * 60 * 1000;
/** How long a dashboard opened from a Control Room link stays signed in. */
export const HANDOFF_SESSION_DAYS = 3;

/** ADMIN_EMAIL holds one or more comma-separated emails that may manage customer profiles. */
export function isAdminEmail(email: string) {
  const list = (process.env.ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}

/** The signed-in admin's own user id (even while switched to a customer profile), or null. */
export async function currentAdminId() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [real] = await db.select({ managedBy: users.managedBy }).from(users).where(eq(users.id, user.realId)).limit(1);
  return real && !real.managedBy && isAdminEmail(user.realEmail) ? user.realId : null;
}

export type ManagedProfile = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  views30d: number;
  clicks30d: number;
  createdAt: string;
};

export async function listManaged(adminId: string): Promise<ManagedProfile[]> {
  const rows = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      displayName: profiles.displayName,
      avatarType: profiles.avatarType,
      avatarVersion: profiles.avatarVersion,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(profiles, eq(profiles.id, users.id))
    .where(eq(users.managedBy, adminId))
    .orderBy(desc(users.createdAt));
  if (!rows.length) return [];

  const stats = await db
    .select({
      profileId: events.profileId,
      views: sql<number>`sum(case when ${events.type} = 'view' then 1 else 0 end)`,
      clicks: sql<number>`sum(case when ${events.type} = 'click' then 1 else 0 end)`,
    })
    .from(events)
    .where(and(inArray(events.profileId, rows.map((r) => r.id)), gte(events.createdAt, new Date(Date.now() - 30 * DAY_MS))))
    .groupBy(events.profileId);
  const byId = new Map(stats.map((s) => [s.profileId, s]));

  return rows.map((r) => ({
    id: r.id,
    username: r.username ?? "",
    displayName: r.displayName,
    avatarUrl: avatarUrlFor(r),
    views30d: Number(byId.get(r.id)?.views ?? 0),
    clicks30d: Number(byId.get(r.id)?.clicks ?? 0),
    createdAt: r.createdAt.toISOString(),
  }));
}

export const newProfileSchema = z.object({
  username: usernameSchema,
  displayName: z.string().trim().max(60, "Keep the name under 60 characters").optional().default(""),
});

export type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export async function createManaged(adminId: string, input: unknown): Promise<Result<{ id: string; username: string }>> {
  const parsed = newProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message, status: 400 };
  const { username, displayName } = parsed.data;

  const id = crypto.randomUUID();
  try {
    await db.batch([
      // Not a real address (.invalid never resolves) and not a real hash, so this user can't sign in.
      db.insert(users).values({ id, email: `managed+${id}@linkfolio.invalid`, passwordHash: "managed", managedBy: adminId }),
      db.insert(profiles).values({ id, username, displayName: displayName || null }),
    ]);
  } catch (err) {
    const text = `${(err as Error)?.message ?? ""} ${(err as { cause?: Error })?.cause?.message ?? ""}`;
    if (text.includes("UNIQUE constraint failed")) return { ok: false, error: "That username is already taken", status: 409 };
    return { ok: false, error: "Couldn't create the profile", status: 500 };
  }
  return { ok: true, data: { id, username } };
}

/** Deletes a managed profile and everything on it. Only the admin who manages it can. */
export async function deleteManaged(adminId: string, id: string): Promise<boolean> {
  const [row] = await db.select({ id: users.id }).from(users).where(and(eq(users.id, id), eq(users.managedBy, adminId))).limit(1);
  if (!row) return false;
  // Explicit rather than relying on cascades, so nothing is left behind even with foreign keys off.
  await db.batch([
    db.update(sessions).set({ actingAs: null }).where(eq(sessions.actingAs, id)),
    db.delete(sessions).where(eq(sessions.userId, id)),
    db.delete(handoffTokens).where(eq(handoffTokens.profileId, id)),
    db.delete(events).where(eq(events.profileId, id)),
    db.delete(links).where(eq(links.userId, id)),
    db.delete(socialLinks).where(eq(socialLinks.userId, id)),
    db.delete(profiles).where(eq(profiles.id, id)),
    db.delete(users).where(eq(users.id, id)),
  ]);
  return true;
}

export async function isManagedBy(adminId: string, id: string) {
  const [row] = await db.select({ id: users.id }).from(users).where(and(eq(users.id, id), eq(users.managedBy, adminId))).limit(1);
  return !!row;
}

// ---------------------------------------------------------------------------
// One-time links into a managed profile's dashboard
// ---------------------------------------------------------------------------

export async function mintHandoff(adminId: string, profileId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + HANDOFF_MS);
  await db.delete(handoffTokens).where(sql`${handoffTokens.expiresAt} < ${Date.now()}`);
  await db.insert(handoffTokens).values({ id: hashToken(token), adminId, profileId, expiresAt });
  return { token, expiresAt };
}

/** Uses up a link: returns the profile it opens, or null if it's unknown, used or expired. */
export async function consumeHandoff(token: string) {
  const [row] = await db
    .delete(handoffTokens)
    .where(and(eq(handoffTokens.id, hashToken(token)), gt(handoffTokens.expiresAt, new Date())))
    .returning({ adminId: handoffTokens.adminId, profileId: handoffTokens.profileId });
  if (!row) return null;
  return (await isManagedBy(row.adminId, row.profileId)) ? row.profileId : null;
}

// ---------------------------------------------------------------------------
// API tokens for the Control Room server
// ---------------------------------------------------------------------------

export async function createApiToken(userId: string, label: string | null) {
  const token = `lfa_${randomBytes(32).toString("base64url")}`;
  await db.insert(apiTokens).values({ id: hashToken(token), userId, label: label?.slice(0, 80) || null });
  return token;
}

/** The admin a `Authorization: Bearer` token belongs to, or null. Admin rights are re-checked on every call. */
export async function apiAdmin(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) return null;
  const id = hashToken(token);
  const [row] = await db
    .select({ userId: users.id, email: users.email, managedBy: users.managedBy, lastUsedAt: apiTokens.lastUsedAt })
    .from(apiTokens)
    .innerJoin(users, eq(users.id, apiTokens.userId))
    .where(eq(apiTokens.id, id))
    .limit(1);
  if (!row || row.managedBy || !isAdminEmail(row.email)) return null;
  if (!row.lastUsedAt || Date.now() - row.lastUsedAt.getTime() > 60 * 60 * 1000) {
    await db.update(apiTokens).set({ lastUsedAt: new Date() }).where(eq(apiTokens.id, id));
  }
  return { adminId: row.userId, tokenId: id };
}

export async function revokeApiToken(tokenId: string) {
  await db.delete(apiTokens).where(eq(apiTokens.id, tokenId));
}
