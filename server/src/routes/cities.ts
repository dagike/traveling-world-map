import type { City, PlaceStatus } from "@twm/shared";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../db/client.js";
import type { CityRow } from "../db/schema.js";
import { cities, countries } from "../db/schema.js";
import { parseId, photosSchema, statusSchema } from "./util.js";

export function toCity(row: CityRow): City {
  return {
    id: row.id,
    countryId: row.countryId,
    name: row.name,
    lat: row.lat,
    lng: row.lng,
    notes: row.notes ?? undefined,
    visitedYear: row.visitedYear ?? undefined,
    status: row.status,
    photos: row.photos,
  };
}

interface CityInput {
  name: string;
  lat: number;
  lng: number;
  notes?: string | null;
  visitedYear?: number | null;
  status?: PlaceStatus;
  photos?: City["photos"];
}

const properties = {
  name: { type: "string", minLength: 1 },
  lat: { type: "number", minimum: -90, maximum: 90 },
  lng: { type: "number", minimum: -180, maximum: 180 },
  notes: { type: ["string", "null"] },
  visitedYear: { type: ["integer", "null"], minimum: 0 },
  status: statusSchema,
  photos: photosSchema,
} as const;

export async function cityRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/countries/:countryId/cities", async (req, reply) => {
    const countryId = parseId((req.params as { countryId: string }).countryId);
    if (countryId === null) return reply.code(400).send({ error: "invalid id" });
    const [country] = await db
      .select()
      .from(countries)
      .where(eq(countries.id, countryId))
      .limit(1);
    if (!country) return reply.code(404).send({ error: "country not found" });
    return (
      await db.select().from(cities).where(eq(cities.countryId, countryId))
    ).map(toCity);
  });

  app.get("/api/cities/:id", async (req, reply) => {
    const id = parseId((req.params as { id: string }).id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });
    const [row] = await db.select().from(cities).where(eq(cities.id, id)).limit(1);
    if (!row) return reply.code(404).send({ error: "city not found" });
    return toCity(row);
  });

  app.post(
    "/api/countries/:countryId/cities",
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
      const countryId = parseId((req.params as { countryId: string }).countryId);
      if (countryId === null) return reply.code(400).send({ error: "invalid id" });
      const [country] = await db
        .select()
        .from(countries)
        .where(eq(countries.id, countryId))
        .limit(1);
      if (!country) return reply.code(404).send({ error: "country not found" });

      const body = req.body as CityInput;
      const [row] = await db
        .insert(cities)
        .values({
          countryId,
          name: body.name,
          lat: body.lat,
          lng: body.lng,
          notes: body.notes ?? null,
          visitedYear: body.visitedYear ?? null,
          status: body.status ?? "visited",
          photos: body.photos ?? [],
        })
        .returning();
      return reply.code(201).send(toCity(row!));
    },
  );

  app.put(
    "/api/cities/:id",
    { schema: { body: { type: "object", additionalProperties: false, properties } } },
    async (req, reply) => {
      const id = parseId((req.params as { id: string }).id);
      if (id === null) return reply.code(400).send({ error: "invalid id" });
      const body = req.body as Partial<CityInput>;

      const patch: Partial<CityRow> = {};
      if (body.name !== undefined) patch.name = body.name;
      if (body.lat !== undefined) patch.lat = body.lat;
      if (body.lng !== undefined) patch.lng = body.lng;
      if (body.notes !== undefined) patch.notes = body.notes;
      if (body.visitedYear !== undefined) patch.visitedYear = body.visitedYear;
      if (body.status !== undefined) patch.status = body.status;
      if (body.photos !== undefined) patch.photos = body.photos;

      if (Object.keys(patch).length === 0) {
        return reply.code(400).send({ error: "no fields to update" });
      }

      const [row] = await db
        .update(cities)
        .set(patch)
        .where(eq(cities.id, id))
        .returning();
      if (!row) return reply.code(404).send({ error: "city not found" });
      return toCity(row);
    },
  );

  app.delete("/api/cities/:id", async (req, reply) => {
    const id = parseId((req.params as { id: string }).id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });
    const [row] = await db.delete(cities).where(eq(cities.id, id)).returning();
    if (!row) return reply.code(404).send({ error: "city not found" });
    return reply.code(204).send();
  });
}
