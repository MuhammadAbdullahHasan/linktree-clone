ALTER TABLE `profiles` ADD `cover` blob;--> statement-breakpoint
ALTER TABLE `profiles` ADD `cover_type` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `cover_version` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `verified` integer DEFAULT false NOT NULL;