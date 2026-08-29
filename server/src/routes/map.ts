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
      with: {
        cities: {
          with: {
            themeParks: {
              with: { rides: true },
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
