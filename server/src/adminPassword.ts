import { eq } from "drizzle-orm";

import { checkEnvPassword, hashPassword, verifyScryptHash } from "./auth.js";
import { db } from "./db/client.js";
import { appSettings } from "./db/schema.js";

const HASH_KEY = "admin_password_hash";

async function storedHash(): Promise<string | null> {
  const [row] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, HASH_KEY))
    .limit(1);
  return row?.value ?? null;
}

/**
 * Verifies a password against the hash stored in the database (set via the
 * in-app "change password" form), falling back to the env-var credential when
 * none has been set yet.
 */
export async function verifyAdminPassword(password: unknown): Promise<boolean> {
  if (typeof password !== "string" || password.length === 0) return false;
  const hash = await storedHash();
  if (hash) return verifyScryptHash(password, hash);
  return checkEnvPassword(password);
}

export async function setAdminPassword(password: string): Promise<void> {
  const value = hashPassword(password);
  await db
    .insert(appSettings)
    .values({ key: HASH_KEY, value })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });
}
