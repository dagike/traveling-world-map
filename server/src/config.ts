/**
 * Runtime configuration, read from environment variables.
 * In development, values can be placed in `server/.env` (see `.env.example`);
 * load it with `node --env-file` or your shell before starting.
 */

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

const DEV_TOKEN_SECRET = "dev-insecure-secret";

export const config = {
  port: num(process.env.PORT, 4000),
  host: process.env.HOST ?? "127.0.0.1",
  /** Postgres connection string (Neon pooled endpoint in production). */
  databaseUrl: process.env.DATABASE_URL ?? "",
  /** scrypt hash (`salt:hash`) of the admin password; the production credential. */
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
  /** Plaintext admin password — dev convenience only, ignored in production. */
  devAdminPassword: process.env.ADMIN_PASSWORD ?? (isProduction ? "" : "admin"),
  /** Secret used to sign admin session tokens. */
  tokenSecret: process.env.TOKEN_SECRET ?? DEV_TOKEN_SECRET,
  /** Comma-separated list of allowed CORS origins; defaults to the Vite dev server. */
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

/**
 * In production every secret must be set explicitly. Throws with a clear message
 * so a misconfigured deploy fails fast instead of running wide open.
 */
export function assertConfig(): void {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!isProduction) return;

  const missing: string[] = [];
  if (!process.env.TOKEN_SECRET || config.tokenSecret === DEV_TOKEN_SECRET) {
    missing.push("TOKEN_SECRET");
  }
  if (!config.adminPasswordHash) missing.push("ADMIN_PASSWORD_HASH");
  if (missing.length > 0) {
    throw new Error(`missing required production env vars: ${missing.join(", ")}`);
  }
}
