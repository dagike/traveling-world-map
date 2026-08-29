import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("npm run db:migrate -w @twm/server");
run("npm run build -w @twm/client");
