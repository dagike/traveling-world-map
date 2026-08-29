import type { FastifyInstance, FastifyRequest } from "fastify";

import { checkPassword, createToken } from "../auth.js";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 10;

// Per-IP attempt timestamps. In serverless this is per-instance and resets on a
// cold start, which is an acceptable brute-force speed bump for a single admin.
const attempts = new Map<string, number[]>();

function rateLimited(req: FastifyRequest): boolean {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/api/login",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["password"],
          properties: { password: { type: "string" } },
        },
      },
    },
    async (req, reply) => {
      if (rateLimited(req)) {
        return reply.code(429).send({ error: "too many attempts, try again later" });
      }
      const { password } = req.body as { password: string };
      if (!checkPassword(password)) {
        return reply.code(401).send({ error: "incorrect password" });
      }
      return { token: createToken() };
    },
  );
}
