// All /api/* requests are rewritten here (see vercel.json). The real handler
// lives in the server workspace so it can be tested directly.
import type { IncomingMessage, ServerResponse } from "node:http";

import serverless from "../server/src/serverless.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return serverless(req, res);
}
