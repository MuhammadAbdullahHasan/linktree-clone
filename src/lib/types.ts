import type { Theme } from "./themes";

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  theme: unknown;
};

export type Link = {
  id: string;
  title: string;
  url: string;
  position: number;
  is_active: boolean;
};

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  position: number;
};

/** What the public page and the dashboard preview need to render a profile. */
export type PageData = {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: Theme;
  links: Pick<Link, "id" | "title" | "url">[];
  socials: Pick<SocialLink, "id" | "platform" | "url">[];
};

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };
