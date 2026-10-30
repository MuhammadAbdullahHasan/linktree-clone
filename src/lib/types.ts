import type { Theme } from "./themes";

export type Profile = {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  theme: unknown;
};

export type Link = {
  id: string;
  title: string;
  url: string;
  position: number;
  isActive: boolean;
  /** Stored copy of the linked site's preview image, or null. */
  imageUrl: string | null;
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
  coverUrl: string | null;
  verified: boolean;
  theme: Theme;
  links: Pick<Link, "id" | "title" | "url" | "imageUrl">[];
  socials: Pick<SocialLink, "id" | "platform" | "url">[];
};

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };
