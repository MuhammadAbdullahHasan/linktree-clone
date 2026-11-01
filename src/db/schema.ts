import { sql } from "drizzle-orm";
import { blob, index, integer, sqliteTable, text, uniqueIndex, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  /**
   * Set on customer profiles the site owner runs for them. Those users have a placeholder
   * email and no password, so nobody can sign in as them; only their admin edits them.
   */
  managedBy: text("managed_by").references((): AnySQLiteColumn => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
});

/** Stores a SHA-256 of the session token, never the token itself. */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    /** An admin's session switched to one of their managed profiles; the dashboard edits that profile. */
    actingAs: text("acting_as").references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Long-lived tokens for the Control Room server. Stores a SHA-256 of the token, never the token itself. */
export const apiTokens = sqliteTable(
  "api_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label"),
    lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("api_tokens_user_idx").on(t.userId)],
);

/** One-time sign-in links that open a managed profile's dashboard (in the Control Room app). SHA-256 ids. */
export const handoffTokens = sqliteTable("handoff_tokens", {
  id: text("id").primaryKey(),
  adminId: text("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  profileId: text("profile_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

/** Failed sign-in attempts, for rate limiting. */
export const loginAttempts = sqliteTable(
  "login_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("login_attempts_key_idx").on(t.key, t.createdAt)],
);

export const profiles = sqliteTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  username: text("username").unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatar: blob("avatar", { mode: "buffer" }),
  avatarType: text("avatar_type"),
  avatarVersion: integer("avatar_version").notNull().default(0),
  cover: blob("cover", { mode: "buffer" }),
  coverType: text("cover_type"),
  coverVersion: integer("cover_version").notNull().default(0),
  /** Full-page background photo, used when the theme's background style is "image". */
  bgImage: blob("bg_image", { mode: "buffer" }),
  bgImageType: text("bg_image_type"),
  bgImageVersion: integer("bg_image_version").notNull().default(0),
  // Set by hand by the site owner; there is no self-serve way to become verified.
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  theme: text("theme", { mode: "json" }).notNull().default({}),
  createdAt: createdAt(),
});

export const links = sqliteTable(
  "links",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    position: integer("position").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    /** The linked site's own preview image (og:image), fetched when the link is saved. */
    image: text("image"),
    /** A stored copy of that image, so tiles don't break when the site's own URL expires. */
    imageData: blob("image_data", { mode: "buffer" }),
    imageType: text("image_type"),
    imageCheckedAt: integer("image_checked_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("links_user_position_idx").on(t.userId, t.position)],
);

export const socialLinks = sqliteTable(
  "social_links",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    url: text("url").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("social_links_user_platform_idx").on(t.userId, t.platform),
    index("social_links_user_position_idx").on(t.userId, t.position),
  ],
);

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    // No foreign key: clicks on deleted links still count in analytics.
    linkId: text("link_id"),
    type: text("type", { enum: ["view", "click"] }).notNull(),
    referrer: text("referrer"),
    createdAt: createdAt(),
  },
  (t) => [
    index("events_profile_created_idx").on(t.profileId, t.createdAt),
    index("events_link_idx").on(t.linkId),
  ],
);
