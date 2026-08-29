import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { config } from "../config.js";
import * as schema from "./schema.js";

let pool: Pool | undefined;
let instance: ReturnType<typeof drizzle<typeof schema>> | undefined;

function getDb() {
  if (!instance) {
    if (!config.databaseUrl) throw new Error("DATABASE_URL is not set");
    pool = new Pool({ connectionString: config.databaseUrl });
    instance = drizzle(pool, { schema });
  }
  return instance;
}

// Proxy so `db.select()` etc. still works, but the pool is created lazily
// (on first query) rather than at import time.
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
