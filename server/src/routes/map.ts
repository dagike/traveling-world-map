import type { CountryWithChildren } from "@twm/shared";
import type { FastifyInstance } from "fastify";

import { db } from "../db/client.js";
import { toCity } from "./cities.js";
import { toCountry } from "./countries.js";
import { toRide } from "./rides.js";
import { toThemePark } from "./themeParks.js";

export async function mapRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/map", async () => {
    const rows = await db.query.countries.findMany({
      orderBy: (c, { asc }) => asc(c.id),
      with: {
        cities: {
          orderBy: (c, { asc }) => asc(c.id),
          with: {
            themeParks: {
              orderBy: (p, { asc }) => asc(p.id),
              with: {
                rides: { orderBy: (r, { asc }) => asc(r.id) },
              },
            },
          },
        },
      },
    });

    const result: CountryWithChildren[] = rows.map((country) => ({
      ...toCountry(country),
      cities: country.cities.map((city) => ({
        ...toCity(city),
        themeParks: city.themeParks.map((park) => ({
          ...toThemePark(park),
          rides: park.rides.map(toRide),
        })),
      })),
    }));

    return result;
  });
}
