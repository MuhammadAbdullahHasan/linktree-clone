import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Link, Profile, SocialLink } from "@/lib/types";

/** The signed-in user's profile, links and socials. Redirects if signed out or onboarding is unfinished. */
export const getDashboardData = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: links }, { data: socials }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, bio, avatar_url, theme")
      .eq("id", user.id)
      .single<Profile>(),
    supabase
      .from("links")
      .select("id, title, url, position, is_active")
      .eq("user_id", user.id)
      .order("position")
      .order("created_at")
      .returns<Link[]>(),
    supabase
      .from("social_links")
      .select("id, platform, url, position")
      .eq("user_id", user.id)
      .order("position")
      .order("created_at")
      .returns<SocialLink[]>(),
  ]);

  if (!profile?.username) redirect("/onboarding");

  return {
    email: user.email ?? "",
    profile: profile as Profile & { username: string },
    links: links ?? [],
    socials: socials ?? [],
  };
});
