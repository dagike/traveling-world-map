import type { ThemePark } from "@twm/shared";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../db/client.js";
import type { ThemeParkRow } from "../db/schema.js";
import { cities, themeParks } from "../db/schema.js";
import { parseId, photosSchema } from "./util.js";

export function toThemePark(row: ThemeParkRow): ThemePark {
  return {
    id: row.id,
    cityId: row.cityId,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    info: row.info ?? undefined,
    visitedYear: row.visitedYear ?? undefined,
    photos: row.photos,
  };
}

interface ThemeParkInput {
  name: string;
  lat: number;
  lng: number;
  info?: string | null;
  visitedYear?: number | null;
  photos?: ThemePark["photos"];
}

const properties = {
  name: { type: "string", minLength: 1 },
  lat: { type: "number", minimum: -90, maximum: 90 },
  lng: { type: "number", minimum: -180, maximum: 180 },
  info: { type: ["string", "null"] },
  visitedYear: { type: ["integer", "null"], minimum: 0 },
  photos: photosSchema,
} as const;

export async function themeParkRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/cities/:cityId/theme-parks", async (req, reply) => {
    const cityId = parseId((req.params as { cityId: string }).cityId);
    if (cityId === null) return reply.code(400).send({ error: "invalid id" });
    const city = db.select().from(cities).where(eq(cities.id, cityId)).get();
    if (!city) return reply.code(404).send({ error: "city not found" });
    return db
      .select()
      .from(themeParks)
      .where(eq(themeParks.cityId, cityId))
      .all()
      .map(toThemePark);
  });

  app.get("/api/theme-parks/:id", async (req, reply) => {
    const id = parseId((req.params as { id: string }).id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });
    const row = db.select().from(themeParks).where(eq(themeParks.id, id)).get();
    if (!row) return reply.code(404).send({ error: "theme park not found" });
    return toThemePark(row);
  });

  app.post(
    "/api/cities/:cityId/theme-parks",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["name", "lat", "lng"],
          properties,
        },
      },
    },
    async (req, reply) => {
      const cityId = parseId((req.params as { cityId: string }).cityId);
      if (cityId === null) return reply.code(400).send({ error: "invalid id" });
      const city = db.select().from(cities).where(eq(cities.id, cityId)).get();
      if (!city) return reply.code(404).send({ error: "city not found" });

      const body = req.body as ThemeParkInput;
      const row = db
        .insert(themeParks)
        .values({
          cityId,
          name: body.name,
          lat: body.lat,
          lng: body.lng,
          info: body.info ?? null,
          visitedYear: body.visitedYear ?? null,
          photos: body.photos ?? [],
        })
        .returning()
        .get();
      return reply.code(201).send(toThemePark(row));
    },
  );

  app.put(
    "/api/theme-parks/:id",
    { schema: { body: { type: "object", additionalProperties: false, properties } } },
    async (req, reply) => {
      const id = parseId((req.params as { id: string }).id);
      if (id === null) return reply.code(400).send({ error: "invalid id" });
      const body = req.body as Partial<ThemeParkInput>;

      const patch: Partial<ThemeParkRow> = {};
      if (body.name !== undefined) patch.name = body.name;
      if (body.lat !== undefined) patch.lat = body.lat;
      if (body.lng !== undefined) patch.lng = body.lng;
      if (body.info !== undefined) patch.info = body.info;
      if (body.visitedYear !== undefined) patch.visitedYear = body.visitedYear;
      if (body.photos !== undefined) patch.photos = body.photos;

      if (Object.keys(patch).length === 0) {
        return reply.code(400).send({ error: "no fields to update" });
      }

      const row = db
        .update(themeParks)
        .set(patch)
        .where(eq(themeParks.id, id))
        .returning()
        .get();
      if (!row) return reply.code(404).send({ error: "theme park not found" });
      return toThemePark(row);
    },
  );

  app.delete("/api/theme-parks/:id", async (req, reply) => {
    const id = parseId((req.params as { id: string }).id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });
    const row = db.delete(themeParks).where(eq(themeParks.id, id)).returning().get();
    if (!row) return reply.code(404).send({ error: "theme park not found" });
    return reply.code(204).send();
  });
}
