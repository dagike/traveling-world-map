import type { IncomingMessage, ServerResponse } from "node:http";

import { buildApp } from "./app.js";

// Built once per warm function instance and reused across invocations.
const ready = buildApp();

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await ready;
  await app.ready();
  app.server.emit("request", req, res);
}
