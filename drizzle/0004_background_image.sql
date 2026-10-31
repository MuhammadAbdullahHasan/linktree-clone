ALTER TABLE `profiles` ADD `bg_image` blob;--> statement-breakpoint
ALTER TABLE `profiles` ADD `bg_image_type` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `bg_image_version` integer DEFAULT 0 NOT NULL;