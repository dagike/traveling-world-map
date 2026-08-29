import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import { config } from "./config.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: config.corsOrigins });

  app.get("/api/health", async () => ({ status: "ok", time: new Date().toISOString() }));

  return app;
}
