import { asc, eq } from "drizzle-orm";
import { db, links, profiles, socialLinks } from "@/db";
import type { Profile } from "@/lib/types";

/** Profile columns without the avatar bytes. */
export const profileColumns = {
  id: profiles.id,
  username: profiles.username,
  displayName: profiles.displayName,
  bio: profiles.bio,
  avatarType: profiles.avatarType,
  avatarVersion: profiles.avatarVersion,
  theme: profiles.theme,
};

export function avatarUrlFor(p: { id: string; avatarType: string | null; avatarVersion: number }) {
  return p.avatarType ? `/avatar/${p.id}?v=${p.avatarVersion}` : null;
}

export function toProfile(row: {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarType: string | null;
  avatarVersion: number;
  theme: unknown;
}): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    bio: row.bio,
    avatarUrl: avatarUrlFor(row),
    theme: row.theme,
  };
}

export const linkColumns = {
  id: links.id,
  title: links.title,
  url: links.url,
  position: links.position,
  isActive: links.isActive,
};

export const socialColumns = {
  id: socialLinks.id,
  platform: socialLinks.platform,
  url: socialLinks.url,
  position: socialLinks.position,
};

export function linksOf(userId: string) {
  return db
    .select(linkColumns)
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(asc(links.position), asc(links.createdAt));
}

export function socialsOf(userId: string) {
  return db
    .select(socialColumns)
    .from(socialLinks)
    .where(eq(socialLinks.userId, userId))
    .orderBy(asc(socialLinks.position), asc(socialLinks.createdAt));
}

export async function profileById(userId: string) {
  const [row] = await db.select(profileColumns).from(profiles).where(eq(profiles.id, userId)).limit(1);
  return row ? toProfile(row) : null;
}

export async function profileByUsername(username: string) {
  const [row] = await db
    .select(profileColumns)
    .from(profiles)
    .where(eq(profiles.username, username.toLowerCase()))
    .limit(1);
  return row ? toProfile(row) : null;
}
