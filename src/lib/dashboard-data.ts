import { redirect } from "next/navigation";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth";
import { linksOf, profileById, socialsOf } from "@/lib/profile-query";
import type { Profile } from "@/lib/types";

/** The signed-in user, or a redirect to the login page. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** The signed-in user's profile, links and socials. Redirects if signed out or onboarding is unfinished. */
export const getDashboardData = cache(async () => {
  const user = await requireUser();
  const [profile, links, socials] = await Promise.all([
    profileById(user.id),
    linksOf(user.id),
    socialsOf(user.id),
  ]);
  if (!profile?.username) redirect("/onboarding");

  return {
    email: user.email,
    profile: profile as Profile & { username: string },
    links,
    socials,
  };
});
