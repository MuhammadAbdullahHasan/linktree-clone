import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { resolveTheme } from "@/lib/themes";
import type { PageData, Profile } from "@/lib/types";

export function toPageData(
  profile: Pick<Profile, "username" | "display_name" | "bio" | "avatar_url" | "theme">,
  links: PageData["links"],
  socials: PageData["socials"],
): PageData {
  return {
    username: profile.username ?? "",
    displayName: profile.display_name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    theme: resolveTheme(profile.theme),
    links,
    socials,
  };
}

/** Public page data for a username, or null if nobody has claimed it. */
export const getPublicPage = cache(async (username: string): Promise<PageData | null> => {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, theme")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  if (!profile) return null;

  const [{ data: links }, { data: socials }] = await Promise.all([
    supabase
      .from("links")
      .select("id, title, url")
      .eq("user_id", profile.id)
      .eq("is_active", true)
      .order("position")
      .order("created_at"),
    supabase
      .from("social_links")
      .select("id, platform, url")
      .eq("user_id", profile.id)
      .order("position")
      .order("created_at"),
  ]);

  return toPageData(profile, links ?? [], socials ?? []);
});
