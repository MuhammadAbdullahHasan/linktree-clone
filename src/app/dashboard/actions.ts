"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { socialInputToUrl, SOCIALS_BY_ID } from "@/lib/socials";
import { themeSchema, type Theme } from "@/lib/themes";
import type { ActionResult, Link, SocialLink } from "@/lib/types";
import { normalizeUrl } from "@/lib/url";
import { usernameSchema } from "@/lib/username";

const BAD_URL = "Enter a valid web address, like example.com";

async function getUserClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, userId: user.id };
}

function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

// ---------------------------------------------------------------------------
// Username
// ---------------------------------------------------------------------------

export async function setUsername(input: string): Promise<ActionResult<string>> {
  const parsed = usernameSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { supabase, userId } = await getUserClient();
  const { error } = await supabase.from("profiles").update({ username: parsed.data }).eq("id", userId);
  if (error) {
    return fail(error.code === "23505" ? "That username is already taken" : "Couldn't save username");
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

  const { supabase, userId } = await getUserClient();
  // New links go to the top of the list.
  const { data: first } = await supabase
    .from("links")
    .select("position")
    .eq("user_id", userId)
    .order("position")
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("links")
    .insert({ user_id: userId, title: parsedTitle.data, url: cleanUrl, position: (first?.position ?? 1) - 1 })
    .select("id, title, url, position, is_active")
    .single();
  if (error) return fail("Couldn't add link");
  return { ok: true, data };
}

export async function updateLink(
  id: string,
  patch: { title?: string; url?: string; is_active?: boolean },
): Promise<ActionResult<Link>> {
  const update: Partial<Pick<Link, "title" | "url" | "is_active">> = {};
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
  if (patch.is_active !== undefined) update.is_active = patch.is_active;

  const { supabase, userId } = await getUserClient();
  const { data, error } = await supabase
    .from("links")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, title, url, position, is_active")
    .single();
  if (error) return fail("Couldn't save link");
  return { ok: true, data };
}

export async function deleteLink(id: string): Promise<ActionResult> {
  const { supabase, userId } = await getUserClient();
  const { error } = await supabase.from("links").delete().eq("id", id).eq("user_id", userId);
  if (error) return fail("Couldn't delete link");
  return { ok: true, data: null };
}

export async function reorderLinks(orderedIds: string[]): Promise<ActionResult> {
  const ids = z.array(z.string().uuid()).max(500).safeParse(orderedIds);
  if (!ids.success) return fail("Invalid order");

  const { supabase, userId } = await getUserClient();
  const results = await Promise.all(
    ids.data.map((id, position) =>
      supabase.from("links").update({ position }).eq("id", id).eq("user_id", userId),
    ),
  );
  if (results.some((r) => r.error)) return fail("Couldn't save the new order");
  return { ok: true, data: null };
}

// ---------------------------------------------------------------------------
// Profile & appearance
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  display_name: z.string().trim().max(60, "Keep your name under 60 characters").optional(),
  bio: z.string().trim().max(160, "Keep your bio under 160 characters").optional(),
  avatar_url: z.string().url().max(1024).nullable().optional(),
});

export async function updateProfile(input: z.input<typeof profileSchema>): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { supabase, userId } = await getUserClient();
  const update = { ...parsed.data } as Record<string, string | null | undefined>;
  if (update.display_name === "") update.display_name = null;
  if (update.bio === "") update.bio = null;
  if (update.avatar_url) {
    // Only accept avatars from our own storage bucket.
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${userId}/`;
    if (!update.avatar_url.startsWith(prefix)) return fail("Invalid avatar");
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", userId);
  if (error) return fail("Couldn't save profile");
  return { ok: true, data: null };
}

export async function updateTheme(theme: Theme): Promise<ActionResult> {
  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) return fail("Invalid theme");

  const { supabase, userId } = await getUserClient();
  const { error } = await supabase.from("profiles").update({ theme: parsed.data }).eq("id", userId);
  if (error) return fail("Couldn't save theme");
  return { ok: true, data: null };
}

// ---------------------------------------------------------------------------
// Social icons
// ---------------------------------------------------------------------------

export async function saveSocial(platform: string, input: string): Promise<ActionResult<SocialLink>> {
  if (!SOCIALS_BY_ID.has(platform)) return fail("Unknown platform");
  const url = normalizeUrl(socialInputToUrl(platform, input));
  if (!url) return fail(platform === "email" ? "Enter a valid email address" : BAD_URL);

  const { supabase, userId } = await getUserClient();
  const { data: last } = await supabase
    .from("social_links")
    .select("position")
    .eq("user_id", userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: existing } = await supabase
    .from("social_links")
    .select("position")
    .eq("user_id", userId)
    .eq("platform", platform)
    .maybeSingle();

  const { data, error } = await supabase
    .from("social_links")
    .upsert(
      { user_id: userId, platform, url, position: existing?.position ?? (last?.position ?? -1) + 1 },
      { onConflict: "user_id,platform" },
    )
    .select("id, platform, url, position")
    .single();
  if (error) return fail("Couldn't save social icon");
  return { ok: true, data };
}

export async function deleteSocial(id: string): Promise<ActionResult> {
  const { supabase, userId } = await getUserClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id).eq("user_id", userId);
  if (error) return fail("Couldn't remove social icon");
  return { ok: true, data: null };
}
