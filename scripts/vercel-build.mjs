import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const check = [
  "node_modules/vite",
  "node_modules/@vitejs/plugin-react",
  "node_modules/leaflet",
  "node_modules/@twm/shared",
  "client/node_modules",
];
for (const p of check) console.log(existsSync(p) ? "present" : "ABSENT ", p);

const run = (cmd) => execSync(cmd, { stdio: "inherit" });
run("npm run db:migrate -w @twm/server");
run("npm run build -w @twm/client");
