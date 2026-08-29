import { runMigrations, db } from "./client.js";
import { cities, countries, rides, themeParks } from "./schema.js";

runMigrations();

const canada = db
  .insert(countries)
  .values({ name: "Canada", isoA3: "CAN", notes: "Home base.", visitedYear: 2026, photos: [] })
  .onConflictDoNothing({ target: countries.isoA3 })
  .returning()
  .get();

db.insert(countries)
  .values({ name: "United States of America", isoA3: "USA", visitedYear: 2025, photos: [] })
  .onConflictDoNothing({ target: countries.isoA3 })
  .run();

if (canada) {
  const toronto = db
    .insert(cities)
    .values({
      countryId: canada.id,
      name: "Toronto",
      lat: 43.6532,
      lng: -79.3832,
      visitedYear: 2026,
      photos: [],
    })
    .returning()
    .get();

  const canadasWonderland = db
    .insert(themeParks)
    .values({
      cityId: toronto.id,
      name: "Canada's Wonderland",
      lat: 43.8428,
      lng: -79.5394,
      info: "Cedar Fair park north of Toronto.",
      visitedYear: 2026,
      photos: [],
    })
    .returning()
    .get();

  db.insert(rides)
    .values([
      { parkId: canadasWonderland.id, name: "Leviathan", type: "coaster", isFavourite: true },
      { parkId: canadasWonderland.id, name: "WindSeeker", type: "flat", isFavourite: true },
    ])
    .run();
}

console.log(
  `seeded; countries=${db.select().from(countries).all().length}` +
    ` cities=${db.select().from(cities).all().length}` +
    ` parks=${db.select().from(themeParks).all().length}` +
    ` rides=${db.select().from(rides).all().length}`,
);
