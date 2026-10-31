import { cache } from "react";
import { linksOf, profileByUsername, socialsOf } from "@/lib/profile-query";
import { resolveTheme } from "@/lib/themes";
import type { PageData, Profile } from "@/lib/types";

export function toPageData(
  profile: Pick<Profile, "username" | "displayName" | "bio" | "avatarUrl" | "coverUrl" | "bgImageUrl" | "verified" | "theme">,
  links: PageData["links"],
  socials: PageData["socials"],
): PageData {
  return {
    username: profile.username ?? "",
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    coverUrl: profile.coverUrl,
    bgImageUrl: profile.bgImageUrl,
    verified: profile.verified,
    theme: resolveTheme(profile.theme),
    links,
    socials,
  };
}

/** Public page data for a username, or null if nobody has claimed it. */
export const getPublicPage = cache(async (username: string) => {
  const profile = await profileByUsername(username);
  if (!profile) return null;

  const [links, socials] = await Promise.all([linksOf(profile.id), socialsOf(profile.id)]);
  return {
    profileId: profile.id,
    page: toPageData(
      profile,
      links.filter((l) => l.isActive).map(({ id, title, url, imageUrl }) => ({ id, title, url, imageUrl })),
      socials.map(({ id, platform, url }) => ({ id, platform, url })),
    ),
  };
});
