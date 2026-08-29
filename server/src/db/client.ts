import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { config } from "../config.js";
import * as schema from "./schema.js";

const sqlite = new Database(config.dbFile);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

/** Applies any pending migrations. Safe to call on every startup. */
export function runMigrations(): void {
  migrate(db, { migrationsFolder });
}
