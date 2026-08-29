CREATE TABLE `cities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`country_id` integer NOT NULL,
	`name` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`notes` text,
	`visited_year` integer,
	`photos` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`park_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`is_favourite` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`park_id`) REFERENCES `theme_parks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `theme_parks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`city_id` integer NOT NULL,
	`name` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`info` text,
	`visited_year` integer,
	`photos` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade
);
