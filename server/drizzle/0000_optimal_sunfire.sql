CREATE TABLE `countries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`iso_a3` text NOT NULL,
	`notes` text,
	`visited_year` integer,
	`photos` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `countries_iso_a3_unique` ON `countries` (`iso_a3`);