ALTER TABLE "cities" ADD COLUMN "status" text DEFAULT 'visited' NOT NULL;--> statement-breakpoint
ALTER TABLE "countries" ADD COLUMN "status" text DEFAULT 'visited' NOT NULL;--> statement-breakpoint
ALTER TABLE "theme_parks" ADD COLUMN "status" text DEFAULT 'visited' NOT NULL;