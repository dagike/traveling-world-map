import type { Stats } from "@twm/shared";
import { count, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../db/client.js";
import { cities, countries, rides, themeParks } from "../db/schema.js";

export async function statsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/stats", async (): Promise<Stats> => {
    const [countryRow] = db.select({ n: count() }).from(countries).all();
    const [cityRow] = db.select({ n: count() }).from(cities).all();
    const [parkRow] = db.select({ n: count() }).from(themeParks).all();
    const [coasterRow] = db
      .select({ n: count() })
      .from(rides)
      .where(eq(rides.type, "coaster"))
      .all();

    return {
      countries: countryRow?.n ?? 0,
      cities: cityRow?.n ?? 0,
      themeParks: parkRow?.n ?? 0,
      coasters: coasterRow?.n ?? 0,
    };
  });
}
