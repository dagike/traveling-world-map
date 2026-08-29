import { createInterface } from "node:readline/promises";

import { hashPassword } from "../src/auth.js";

const fromArgv = process.argv.slice(2).join(" ") || undefined;

const password =
  fromArgv ??
  (await (async () => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    const answer = await rl.question("Password: ");
    rl.close();
    return answer;
  })());

if (!password) {
  console.error("usage: npm run hash-password -w @twm/server -- '<password>'");
  process.exit(1);
}

const hash = hashPassword(password);

console.error("\nAdd this to your environment (Vercel + server/.env):\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
