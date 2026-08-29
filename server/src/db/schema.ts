import type { Photo } from "@twm/shared";
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const countries = sqliteTable("countries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  /** ISO 3166-1 alpha-3; matches ISO_A3 in the world GeoJSON used for highlighting. */
  isoA3: text("iso_a3").notNull().unique(),
  notes: text("notes"),
  visitedYear: integer("visited_year"),
  photos: text("photos", { mode: "json" }).$type<Photo[]>().notNull().default(sql`'[]'`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type CountryRow = typeof countries.$inferSelect;
export type NewCountryRow = typeof countries.$inferInsert;
