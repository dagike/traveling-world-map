import type { IncomingMessage, ServerResponse } from "node:http";

import { buildApp } from "./app.js";

// Built once per warm function instance and reused across invocations.
const ready = buildApp().catch((err: unknown) => {
  console.error("buildApp failed:", err);
  return err instanceof Error ? err : new Error(String(err));
});

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const app = await ready;
  if (app instanceof Error) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "startup failed", detail: app.message }));
    return;
  }
  await app.ready();
  app.server.emit("request", req, res);
}
