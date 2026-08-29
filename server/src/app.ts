import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import { config } from "./config.js";
import { runMigrations } from "./db/client.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  runMigrations();

  await app.register(cors, { origin: config.corsOrigins });

  app.get("/api/health", async () => ({ status: "ok", time: new Date().toISOString() }));

  return app;
}
