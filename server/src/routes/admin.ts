import type { FastifyInstance } from "fastify";

import { setAdminPassword, verifyAdminPassword } from "../adminPassword.js";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/api/admin/password",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 8, maxLength: 200 },
          },
        },
      },
    },
    async (req, reply) => {
      const { currentPassword, newPassword } = req.body as {
        currentPassword: string;
        newPassword: string;
      };
      if (!(await verifyAdminPassword(currentPassword))) {
        return reply.code(403).send({ error: "current password is incorrect" });
      }
      await setAdminPassword(newPassword);
      return reply.code(204).send();
    },
  );
}
