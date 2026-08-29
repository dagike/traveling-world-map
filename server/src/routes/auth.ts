import type { FastifyInstance } from "fastify";

import { checkPassword, createToken } from "../auth.js";

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
      const { password } = req.body as { password: string };
      if (!checkPassword(password)) {
        return reply.code(401).send({ error: "incorrect password" });
      }
      return { token: createToken() };
    },
  );
}
