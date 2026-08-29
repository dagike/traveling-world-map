import { db } from "./client.js";
import { cities, countries, rides, themeParks } from "./schema.js";

const [canada] = await db
  .insert(countries)
  .values({ name: "Canada", isoA3: "CAN", notes: "Home base.", visitedYear: 2026, photos: [] })
  .onConflictDoNothing({ target: countries.isoA3 })
  .returning();

await db
  .insert(countries)
  .values({ name: "United States of America", isoA3: "USA", visitedYear: 2025, photos: [] })
  .onConflictDoNothing({ target: countries.isoA3 });

if (canada) {
  const [toronto] = await db
    .insert(cities)
    .values({
      countryId: canada.id,
      name: "Toronto",
      lat: 43.6532,
      lng: -79.3832,
      visitedYear: 2026,
      photos: [],
    })
    .returning();

  const [canadasWonderland] = await db
    .insert(themeParks)
    .values({
      cityId: toronto!.id,
      name: "Canada's Wonderland",
      lat: 43.8428,
      lng: -79.5394,
      info: "Cedar Fair park north of Toronto.",
      visitedYear: 2026,
      photos: [],
    })
    .returning();

  await db.insert(rides).values([
    { parkId: canadasWonderland!.id, name: "Leviathan", type: "coaster", isFavourite: true },
    { parkId: canadasWonderland!.id, name: "WindSeeker", type: "flat", isFavourite: true },
  ]);
}

const [c, ci, p, r] = await Promise.all([
  db.select().from(countries),
  db.select().from(cities),
  db.select().from(themeParks),
  db.select().from(rides),
]);
console.log(
  `seeded; countries=${c.length} cities=${ci.length} parks=${p.length} rides=${r.length}`,
);

process.exit(0);
