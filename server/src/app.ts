import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import { config } from "./config.js";
import { runMigrations } from "./db/client.js";
import { cityRoutes } from "./routes/cities.js";
import { countryRoutes } from "./routes/countries.js";
import { themeParkRoutes } from "./routes/themeParks.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  runMigrations();

  await app.register(cors, { origin: config.corsOrigins });

  app.get("/api/health", async () => ({ status: "ok", time: new Date().toISOString() }));
  await app.register(countryRoutes);
  await app.register(cityRoutes);
  await app.register(themeParkRoutes);

  return app;
}
