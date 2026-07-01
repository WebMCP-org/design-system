import { spawnSync } from "node:child_process";

if (process.env.WORKERS_CI === "1") {
  process.exit(0);
}

const result = spawnSync("vp", ["config"], {
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
