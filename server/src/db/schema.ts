import type { Photo, RideType } from "@twm/shared";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const photos = () =>
  jsonb("photos").$type<Photo[]>().notNull().default(sql`'[]'::jsonb`);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  /** ISO 3166-1 alpha-3; matches ISO_A3 in the world GeoJSON used for highlighting. */
  isoA3: text("iso_a3").notNull().unique(),
  notes: text("notes"),
  visitedYear: integer("visited_year"),
  photos: photos(),
  createdAt: createdAt(),
});

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  countryId: integer("country_id")
    .notNull()
    .references(() => countries.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  notes: text("notes"),
  visitedYear: integer("visited_year"),
  photos: photos(),
  createdAt: createdAt(),
});

export const themeParks = pgTable("theme_parks", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  info: text("info"),
  visitedYear: integer("visited_year"),
  photos: photos(),
  createdAt: createdAt(),
});

/** Small key/value store for runtime-mutable settings (e.g. the admin password hash). */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  parkId: integer("park_id")
    .notNull()
    .references(() => themeParks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").$type<RideType>().notNull(),
  isFavourite: boolean("is_favourite").notNull().default(false),
  notes: text("notes"),
  createdAt: createdAt(),
});

export const countriesRelations = relations(countries, ({ many }) => ({
  cities: many(cities),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  country: one(countries, { fields: [cities.countryId], references: [countries.id] }),
  themeParks: many(themeParks),
}));

export const themeParksRelations = relations(themeParks, ({ one, many }) => ({
  city: one(cities, { fields: [themeParks.cityId], references: [cities.id] }),
  rides: many(rides),
}));

export const ridesRelations = relations(rides, ({ one }) => ({
  park: one(themeParks, { fields: [rides.parkId], references: [themeParks.id] }),
}));

export type CountryRow = typeof countries.$inferSelect;
export type NewCountryRow = typeof countries.$inferInsert;
export type CityRow = typeof cities.$inferSelect;
export type NewCityRow = typeof cities.$inferInsert;
export type ThemeParkRow = typeof themeParks.$inferSelect;
export type NewThemeParkRow = typeof themeParks.$inferInsert;
export type RideRow = typeof rides.$inferSelect;
export type NewRideRow = typeof rides.$inferInsert;
