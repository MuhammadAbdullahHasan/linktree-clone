import { z } from "zod";

// Top-level routes and other names nobody should be able to claim.
export const RESERVED_USERNAMES = new Set([
  "admin", "api", "app", "auth", "dashboard", "go", "help", "login", "logout",
  "onboarding", "privacy", "settings", "signin", "signout", "signup", "static",
  "support", "terms", "www", "about", "blog", "pricing", "root", "favicon.ico",
  "robots.txt", "sitemap.xml", "_next",
]);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(30, "Use 30 characters or fewer")
  .regex(
    /^[a-z0-9_][a-z0-9_.]*[a-z0-9_]$/,
    "Use letters, numbers, underscores and dots (no dot at the start or end)",
  )
  .refine((u) => !RESERVED_USERNAMES.has(u), "That username is reserved");
