import { asc, eq } from "drizzle-orm";
import { db, links, profiles, socialLinks } from "@/db";
import type { Link, Profile } from "@/lib/types";

/** Profile columns without the avatar bytes. */
export const profileColumns = {
  id: profiles.id,
  username: profiles.username,
  displayName: profiles.displayName,
  bio: profiles.bio,
  avatarType: profiles.avatarType,
  avatarVersion: profiles.avatarVersion,
  coverType: profiles.coverType,
  coverVersion: profiles.coverVersion,
  bgImageType: profiles.bgImageType,
  bgImageVersion: profiles.bgImageVersion,
  verified: profiles.verified,
  theme: profiles.theme,
};

export function avatarUrlFor(p: { id: string; avatarType: string | null; avatarVersion: number }) {
  return p.avatarType ? `/avatar/${p.id}?v=${p.avatarVersion}` : null;
}

export function coverUrlFor(p: { id: string; coverType: string | null; coverVersion: number }) {
  return p.coverType ? `/cover/${p.id}?v=${p.coverVersion}` : null;
}

export function bgImageUrlFor(p: { id: string; bgImageType: string | null; bgImageVersion: number }) {
  return p.bgImageType ? `/bg/${p.id}?v=${p.bgImageVersion}` : null;
}

export function toProfile(row: {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarType: string | null;
  avatarVersion: number;
  coverType: string | null;
  coverVersion: number;
  bgImageType: string | null;
  bgImageVersion: number;
  verified: boolean;
  theme: unknown;
}): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    bio: row.bio,
    avatarUrl: avatarUrlFor(row),
    coverUrl: coverUrlFor(row),
    bgImageUrl: bgImageUrlFor(row),
    verified: row.verified,
    theme: row.theme,
  };
}

export const linkColumns = {
  id: links.id,
  title: links.title,
  url: links.url,
  position: links.position,
  isActive: links.isActive,
  imageType: links.imageType,
  imageCheckedAt: links.imageCheckedAt,
};

/** Turns a selected link row into a Link, with the address of its stored preview image. */
export function toLink(row: {
  id: string;
  title: string;
  url: string;
  position: number;
  isActive: boolean;
  imageType: string | null;
  imageCheckedAt: Date | null;
}): Link {
  const { imageType, imageCheckedAt, ...link } = row;
  return {
    ...link,
    imageUrl: imageType && imageCheckedAt ? `/link-image/${row.id}?v=${imageCheckedAt.getTime()}` : null,
  };
}

export const socialColumns = {
  id: socialLinks.id,
  platform: socialLinks.platform,
  url: socialLinks.url,
  position: socialLinks.position,
};

export async function linksOf(userId: string) {
  const rows = await db
    .select(linkColumns)
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(asc(links.position), asc(links.createdAt));
  return rows.map(toLink);
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
