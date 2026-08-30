import type { Country, PlaceStatus } from "@twm/shared";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../db/client.js";
import type { CountryRow } from "../db/schema.js";
import { countries } from "../db/schema.js";
import { isUniqueViolation, parseId, photosSchema, statusSchema } from "./util.js";

export function toCountry(row: CountryRow): Country {
  return {
    id: row.id,
    name: row.name,
    isoA3: row.isoA3,
    notes: row.notes ?? undefined,
    visitedYear: row.visitedYear ?? undefined,
    status: row.status,
    photos: row.photos,
  };
}

interface CountryInput {
  name: string;
  isoA3: string;
  notes?: string | null;
  visitedYear?: number | null;
  status?: PlaceStatus;
  photos?: Country["photos"];
}

const properties = {
  name: { type: "string", minLength: 1 },
  isoA3: { type: "string", minLength: 3, maxLength: 3 },
  notes: { type: ["string", "null"] },
  visitedYear: { type: ["integer", "null"], minimum: 0 },
  status: statusSchema,
  photos: photosSchema,
} as const;

export async function countryRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/countries", async () =>
    (await db.select().from(countries)).map(toCountry),
  );

  app.get("/api/countries/:id", async (req, reply) => {
    const id = parseId((req.params as { id: string }).id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });
    const [row] = await db
      .select()
      .from(countries)
      .where(eq(countries.id, id))
      .limit(1);
    if (!row) return reply.code(404).send({ error: "country not found" });
    return toCountry(row);
  });

  app.post(
    "/api/countries",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["name", "isoA3"],
          properties,
        },
      },
    },
    async (req, reply) => {
      const body = req.body as CountryInput;
      try {
        const [row] = await db
          .insert(countries)
          .values({
            name: body.name,
            isoA3: body.isoA3.toUpperCase(),
            notes: body.notes ?? null,
            visitedYear: body.visitedYear ?? null,
            status: body.status ?? "visited",
            photos: body.photos ?? [],
          })
          .returning();
        return reply.code(201).send(toCountry(row!));
      } catch (err) {
        if (isUniqueViolation(err)) {
          return reply.code(409).send({ error: "a country with that ISO code already exists" });
        }
        throw err;
      }
    },
  );

  app.put(
    "/api/countries/:id",
    {
      schema: {
        body: { type: "object", additionalProperties: false, properties },
      },
    },
    async (req, reply) => {
      const id = parseId((req.params as { id: string }).id);
      if (id === null) return reply.code(400).send({ error: "invalid id" });
      const body = req.body as Partial<CountryInput>;

      const patch: Partial<CountryRow> = {};
      if (body.name !== undefined) patch.name = body.name;
      if (body.isoA3 !== undefined) patch.isoA3 = body.isoA3.toUpperCase();
      if (body.notes !== undefined) patch.notes = body.notes;
      if (body.visitedYear !== undefined) patch.visitedYear = body.visitedYear;
      if (body.status !== undefined) patch.status = body.status;
      if (body.photos !== undefined) patch.photos = body.photos;

      if (Object.keys(patch).length === 0) {
        return reply.code(400).send({ error: "no fields to update" });
      }

      try {
        const [row] = await db
          .update(countries)
          .set(patch)
          .where(eq(countries.id, id))
          .returning();
        if (!row) return reply.code(404).send({ error: "country not found" });
        return toCountry(row);
      } catch (err) {
        if (isUniqueViolation(err)) {
          return reply.code(409).send({ error: "a country with that ISO code already exists" });
        }
        throw err;
      }
    },
  );

  app.delete("/api/countries/:id", async (req, reply) => {
    const id = parseId((req.params as { id: string }).id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });
    const [row] = await db
      .delete(countries)
      .where(eq(countries.id, id))
      .returning();
    if (!row) return reply.code(404).send({ error: "country not found" });
    return reply.code(204).send();
  });
}
