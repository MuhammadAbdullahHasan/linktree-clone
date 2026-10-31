"use server";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { after } from "next/server";
import { z } from "zod";
import { db, links, profiles, socialLinks } from "@/db";
import { getCurrentUser } from "@/lib/auth";
import { refreshLinkImage } from "@/lib/link-preview";
import { avatarUrlFor, bgImageUrlFor, coverUrlFor, linkColumns, socialColumns, toLink } from "@/lib/profile-query";
import { socialInputToUrl, SOCIALS_BY_ID } from "@/lib/socials";
import { themeSchema, type Theme } from "@/lib/themes";
import type { ActionResult, Link, SocialLink } from "@/lib/types";
import { normalizeUrl } from "@/lib/url";
import { usernameSchema } from "@/lib/username";

// Every query below is scoped to the signed-in user's id; that is what keeps users out of each other's data.

const BAD_URL = "Enter a valid web address, like example.com";
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AVATAR_BYTES = 512 * 1024;
const MAX_COVER_BYTES = 900 * 1024;

async function requireUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  return user.id;
}

function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

function isUniqueViolation(err: unknown) {
  const text = `${(err as Error)?.message ?? ""} ${((err as { cause?: Error })?.cause)?.message ?? ""}`;
  return text.includes("UNIQUE constraint failed");
}

// ---------------------------------------------------------------------------
// Username
// ---------------------------------------------------------------------------

export async function setUsername(input: string): Promise<ActionResult<string>> {
  const parsed = usernameSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const userId = await requireUserId();
  try {
    await db.update(profiles).set({ username: parsed.data }).where(eq(profiles.id, userId));
  } catch (err) {
    return fail(isUniqueViolation(err) ? "That username is already taken" : "Couldn't save username");
  }
  return { ok: true, data: parsed.data };
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

const titleSchema = z.string().trim().min(1, "Add a title").max(100, "Keep the title under 100 characters");

export async function createLink(title: string, url: string): Promise<ActionResult<Link>> {
  const parsedTitle = titleSchema.safeParse(title);
  if (!parsedTitle.success) return fail(parsedTitle.error.issues[0].message);
  const cleanUrl = normalizeUrl(url);
  if (!cleanUrl) return fail(BAD_URL);

  const userId = await requireUserId();
  // New links go to the top of the list.
  const [first] = await db
    .select({ position: links.position })
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(asc(links.position))
    .limit(1);

  const [link] = await db
    .insert(links)
    .values({ userId, title: parsedTitle.data, url: cleanUrl, position: (first?.position ?? 1) - 1 })
    .returning(linkColumns);
  after(() => refreshLinkImage(link.id, link.url));
  return { ok: true, data: toLink(link) };
}

export async function updateLink(
  id: string,
  patch: { title?: string; url?: string; isActive?: boolean },
): Promise<ActionResult<Link>> {
  const update: Partial<Pick<Link, "title" | "url" | "isActive">> = {};
  if (patch.title !== undefined) {
    const parsed = titleSchema.safeParse(patch.title);
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    update.title = parsed.data;
  }
  if (patch.url !== undefined) {
    const cleanUrl = normalizeUrl(patch.url);
    if (!cleanUrl) return fail(BAD_URL);
    update.url = cleanUrl;
  }
  if (typeof patch.isActive === "boolean") update.isActive = patch.isActive;
  if (Object.keys(update).length === 0) return fail("Nothing to save");

  const userId = await requireUserId();
  const [link] = await db
    .update(links)
    .set(update)
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .returning(linkColumns);
  if (!link) return fail("Couldn't save link");
  if (update.url) after(() => refreshLinkImage(link.id, link.url));
  return { ok: true, data: toLink(link) };
}

export async function deleteLink(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  await db.delete(links).where(and(eq(links.id, id), eq(links.userId, userId)));
  return { ok: true, data: null };
}

export async function reorderLinks(orderedIds: string[]): Promise<ActionResult> {
  const ids = z.array(z.string().uuid()).min(1).max(500).safeParse(orderedIds);
  if (!ids.success) return fail("Invalid order");

  const userId = await requireUserId();
  const [first, ...rest] = ids.data.map((id, position) =>
    db.update(links).set({ position }).where(and(eq(links.id, id), eq(links.userId, userId))),
  );
  await db.batch([first, ...rest]);
  return { ok: true, data: null };
}

// ---------------------------------------------------------------------------
// Profile & appearance
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  displayName: z.string().trim().max(60, "Keep your name under 60 characters"),
  bio: z.string().trim().max(160, "Keep your bio under 160 characters"),
});

export async function updateProfile(input: z.input<typeof profileSchema>): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const userId = await requireUserId();
  await db
    .update(profiles)
    .set({ displayName: parsed.data.displayName || null, bio: parsed.data.bio || null })
    .where(eq(profiles.id, userId));
  return { ok: true, data: null };
}

/** Saves an avatar image. The browser resizes it first, so it arrives small. */
export async function uploadAvatar(formData: FormData): Promise<ActionResult<string>> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || !AVATAR_TYPES.has(file.type)) return fail("Choose a PNG, JPG or WebP image");
  if (file.size > MAX_AVATAR_BYTES) return fail("Image is too large");

  const userId = await requireUserId();
  const [row] = await db
    .update(profiles)
    .set({
      avatar: Buffer.from(await file.arrayBuffer()),
      avatarType: file.type,
      avatarVersion: sql`${profiles.avatarVersion} + 1`,
    })
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id, avatarType: profiles.avatarType, avatarVersion: profiles.avatarVersion });
  return { ok: true, data: avatarUrlFor(row)! };
}

/** Saves a cover photo. The browser crops and resizes it first. */
export async function uploadCover(formData: FormData): Promise<ActionResult<string>> {
  const file = formData.get("cover");
  if (!(file instanceof File) || !AVATAR_TYPES.has(file.type)) return fail("Choose a PNG, JPG or WebP image");
  if (file.size > MAX_COVER_BYTES) return fail("Image is too large");

  const userId = await requireUserId();
  const [row] = await db
    .update(profiles)
    .set({
      cover: Buffer.from(await file.arrayBuffer()),
      coverType: file.type,
      coverVersion: sql`${profiles.coverVersion} + 1`,
    })
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id, coverType: profiles.coverType, coverVersion: profiles.coverVersion });
  return { ok: true, data: coverUrlFor(row)! };
}

export async function removeCover(): Promise<ActionResult> {
  const userId = await requireUserId();
  await db.update(profiles).set({ cover: null, coverType: null }).where(eq(profiles.id, userId));
  return { ok: true, data: null };
}

/** Saves a full-page background photo. The browser resizes it first. */
export async function uploadBackground(formData: FormData): Promise<ActionResult<string>> {
  const file = formData.get("background");
  if (!(file instanceof File) || !AVATAR_TYPES.has(file.type)) return fail("Choose a PNG, JPG or WebP image");
  if (file.size > MAX_COVER_BYTES) return fail("Image is too large");

  const userId = await requireUserId();
  const [row] = await db
    .update(profiles)
    .set({
      bgImage: Buffer.from(await file.arrayBuffer()),
      bgImageType: file.type,
      bgImageVersion: sql`${profiles.bgImageVersion} + 1`,
    })
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id, bgImageType: profiles.bgImageType, bgImageVersion: profiles.bgImageVersion });
  return { ok: true, data: bgImageUrlFor(row)! };
}

export async function removeBackground(): Promise<ActionResult> {
  const userId = await requireUserId();
  await db.update(profiles).set({ bgImage: null, bgImageType: null }).where(eq(profiles.id, userId));
  return { ok: true, data: null };
}

export async function removeAvatar(): Promise<ActionResult> {
  const userId = await requireUserId();
  await db.update(profiles).set({ avatar: null, avatarType: null }).where(eq(profiles.id, userId));
  return { ok: true, data: null };
}

export async function updateTheme(theme: Theme): Promise<ActionResult> {
  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) return fail("Invalid theme");

  const userId = await requireUserId();
  await db.update(profiles).set({ theme: parsed.data }).where(eq(profiles.id, userId));
  return { ok: true, data: null };
}

// ---------------------------------------------------------------------------
// Social icons
// ---------------------------------------------------------------------------

export async function saveSocial(platform: string, input: string): Promise<ActionResult<SocialLink>> {
  if (!SOCIALS_BY_ID.has(platform)) return fail("Unknown platform");
  const converted = socialInputToUrl(platform, input);
  if (converted === null) return fail("Enter your WhatsApp number, like 0300 1234567 or +92 300 1234567");
  const url = normalizeUrl(converted);
  if (!url) return fail(platform === "email" ? "Enter a valid email address" : BAD_URL);

  const userId = await requireUserId();
  const [last] = await db
    .select({ position: socialLinks.position })
    .from(socialLinks)
    .where(eq(socialLinks.userId, userId))
    .orderBy(desc(socialLinks.position))
    .limit(1);

  const [social] = await db
    .insert(socialLinks)
    .values({ userId, platform, url, position: (last?.position ?? -1) + 1 })
    .onConflictDoUpdate({ target: [socialLinks.userId, socialLinks.platform], set: { url } })
    .returning(socialColumns);
  return { ok: true, data: social };
}

export async function deleteSocial(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  await db.delete(socialLinks).where(and(eq(socialLinks.id, id), eq(socialLinks.userId, userId)));
  return { ok: true, data: null };
}
