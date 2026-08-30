/** Shared helpers for route handlers. */

export function parseId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function isUniqueViolation(err: unknown): boolean {
  // Postgres unique_violation
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

/** JSON schema fragment for a place status. */
export const statusSchema = { type: "string", enum: ["visited", "wishlist"] } as const;

/** JSON schema fragment for a `photos` array of `{ url, caption? }`. */
export const photosSchema = {
  type: "array",
  items: {
    type: "object",
    additionalProperties: false,
    required: ["url"],
    properties: {
      url: { type: "string", minLength: 1 },
      caption: { type: "string" },
    },
  },
} as const;
