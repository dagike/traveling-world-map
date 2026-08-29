/**
 * Runtime configuration, read from environment variables.
 * In development, values can be placed in `server/.env` (see `.env.example`);
 * load it with `node --env-file` or your shell before starting.
 */

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  port: num(process.env.PORT, 4000),
  host: process.env.HOST ?? "127.0.0.1",
  /** SQLite database file, relative to the server working directory. */
  dbFile: process.env.DB_FILE ?? "data.sqlite",
  /** Comma-separated list of allowed CORS origins; defaults to the Vite dev server. */
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
