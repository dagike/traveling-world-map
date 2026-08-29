import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";

import { adminGuard } from "./auth.js";
import { assertConfig, config, isProduction } from "./config.js";
import { authRoutes } from "./routes/auth.js";
import { cityRoutes } from "./routes/cities.js";
import { countryRoutes } from "./routes/countries.js";
import { mapRoutes } from "./routes/map.js";
import { rideRoutes } from "./routes/rides.js";
import { statsRoutes } from "./routes/stats.js";
import { themeParkRoutes } from "./routes/themeParks.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  assertConfig();

  if (!isProduction && !config.adminPasswordHash) {
    app.log.warn(
      "ADMIN_PASSWORD_HASH not set; falling back to plaintext ADMIN_PASSWORD (dev only)",
    );
  }

  await app.register(cors, { origin: config.corsOrigins });

  app.addHook("preHandler", adminGuard);

  app.get("/api/health", async () => ({ status: "ok", time: new Date().toISOString() }));
  await app.register(authRoutes);
  await app.register(countryRoutes);
  await app.register(cityRoutes);
  await app.register(themeParkRoutes);
  await app.register(rideRoutes);
  await app.register(mapRoutes);
  await app.register(statsRoutes);

  return app;
}
