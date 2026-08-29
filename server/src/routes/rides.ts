import type { Ride } from "@twm/shared";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../db/client.js";
import type { RideRow } from "../db/schema.js";
import { rides, themeParks } from "../db/schema.js";
import { parseId } from "./util.js";

export function toRide(row: RideRow): Ride {
  return {
    id: row.id,
    parkId: row.parkId,
    name: row.name,
    type: row.type,
    isFavourite: row.isFavourite,
    notes: row.notes ?? undefined,
  };
}

interface RideInput {
  name: string;
  type: Ride["type"];
  isFavourite?: boolean;
  notes?: string | null;
}

const properties = {
  name: { type: "string", minLength: 1 },
  type: { type: "string", enum: ["coaster", "flat"] },
  isFavourite: { type: "boolean" },
  notes: { type: ["string", "null"] },
} as const;

export async function rideRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/theme-parks/:parkId/rides", async (req, reply) => {
    const parkId = parseId((req.params as { parkId: string }).parkId);
    if (parkId === null) return reply.code(400).send({ error: "invalid id" });
    const park = db.select().from(themeParks).where(eq(themeParks.id, parkId)).get();
    if (!park) return reply.code(404).send({ error: "theme park not found" });
    return db.select().from(rides).where(eq(rides.parkId, parkId)).all().map(toRide);
  });

  app.get("/api/rides/:id", async (req, reply) => {
    const id = parseId((req.params as { id: string }).id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });
    const row = db.select().from(rides).where(eq(rides.id, id)).get();
    if (!row) return reply.code(404).send({ error: "ride not found" });
    return toRide(row);
  });

  app.post(
    "/api/theme-parks/:parkId/rides",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["name", "type"],
          properties,
        },
      },
    },
    async (req, reply) => {
      const parkId = parseId((req.params as { parkId: string }).parkId);
      if (parkId === null) return reply.code(400).send({ error: "invalid id" });
      const park = db.select().from(themeParks).where(eq(themeParks.id, parkId)).get();
      if (!park) return reply.code(404).send({ error: "theme park not found" });

      const body = req.body as RideInput;
      const row = db
        .insert(rides)
        .values({
          parkId,
          name: body.name,
          type: body.type,
          isFavourite: body.isFavourite ?? false,
          notes: body.notes ?? null,
        })
        .returning()
        .get();
      return reply.code(201).send(toRide(row));
    },
  );

  app.put(
    "/api/rides/:id",
    { schema: { body: { type: "object", additionalProperties: false, properties } } },
    async (req, reply) => {
      const id = parseId((req.params as { id: string }).id);
      if (id === null) return reply.code(400).send({ error: "invalid id" });
      const body = req.body as Partial<RideInput>;

      const patch: Partial<RideRow> = {};
      if (body.name !== undefined) patch.name = body.name;
      if (body.type !== undefined) patch.type = body.type;
      if (body.isFavourite !== undefined) patch.isFavourite = body.isFavourite;
      if (body.notes !== undefined) patch.notes = body.notes;

      if (Object.keys(patch).length === 0) {
        return reply.code(400).send({ error: "no fields to update" });
      }

      const row = db.update(rides).set(patch).where(eq(rides.id, id)).returning().get();
      if (!row) return reply.code(404).send({ error: "ride not found" });
      return toRide(row);
    },
  );

  app.delete("/api/rides/:id", async (req, reply) => {
    const id = parseId((req.params as { id: string }).id);
    if (id === null) return reply.code(400).send({ error: "invalid id" });
    const row = db.delete(rides).where(eq(rides.id, id)).returning().get();
    if (!row) return reply.code(404).send({ error: "ride not found" });
    return reply.code(204).send();
  });
}
