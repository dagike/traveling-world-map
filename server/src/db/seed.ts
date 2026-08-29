import type { NewCountryRow } from "./schema.js";
import { runMigrations, db } from "./client.js";
import { countries } from "./schema.js";

runMigrations();

const rows: NewCountryRow[] = [
  { name: "Canada", isoA3: "CAN", notes: "Home base.", visitedYear: 2026, photos: [] },
  { name: "United States of America", isoA3: "USA", visitedYear: 2025, photos: [] },
];

for (const row of rows) {
  db.insert(countries).values(row).onConflictDoNothing({ target: countries.isoA3 }).run();
}

const count = db.select().from(countries).all().length;
console.log(`seeded; countries in db: ${count}`);
