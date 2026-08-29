// Vercel routes every /api/* request to this optional catch-all function.
// The real handler lives in the server workspace so it can be tested directly.
import type { IncomingMessage, ServerResponse } from "node:http";

import serverless from "../server/src/serverless.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return serverless(req, res);
}
