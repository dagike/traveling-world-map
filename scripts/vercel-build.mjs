import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

for (const p of ["leaflet", "vite", "react-dom", "@vitejs/plugin-react", "@twm/shared"]) {
  try {
    require.resolve(`${p}/package.json`);
    console.log("dep ok  ", p);
  } catch {
    console.log("dep MISSING", p);
  }
}

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("npm run db:migrate -w @twm/server");
run("npm run build -w @twm/client");
