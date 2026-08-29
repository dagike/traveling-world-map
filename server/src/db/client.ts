import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { config } from "../config.js";
import * as schema from "./schema.js";

if (!config.databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: config.databaseUrl });

export const db = drizzle(pool, { schema });
