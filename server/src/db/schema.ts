import type { Photo, RideType } from "@twm/shared";
import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const photos = () =>
  text("photos", { mode: "json" }).$type<Photo[]>().notNull().default(sql`'[]'`);

const createdAt = () =>
  text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`);

export const countries = sqliteTable("countries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  /** ISO 3166-1 alpha-3; matches ISO_A3 in the world GeoJSON used for highlighting. */
  isoA3: text("iso_a3").notNull().unique(),
  notes: text("notes"),
  visitedYear: integer("visited_year"),
  photos: photos(),
  createdAt: createdAt(),
});

export const cities = sqliteTable("cities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  countryId: integer("country_id")
    .notNull()
    .references(() => countries.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  notes: text("notes"),
  visitedYear: integer("visited_year"),
  photos: photos(),
  createdAt: createdAt(),
});

export const themeParks = sqliteTable("theme_parks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  info: text("info"),
  visitedYear: integer("visited_year"),
  photos: photos(),
  createdAt: createdAt(),
});

export const rides = sqliteTable("rides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  parkId: integer("park_id")
    .notNull()
    .references(() => themeParks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").$type<RideType>().notNull(),
  isFavourite: integer("is_favourite", { mode: "boolean" }).notNull().default(false),
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
