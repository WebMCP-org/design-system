#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const skillDir = resolve(scriptDir, "..");
const scratchRoot = resolve(skillDir, "..", "shadcn-ds-intake-scratch", "project");
const appDir = resolve(scratchRoot, "shadcn-intake");
const components = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

if (components.length === 0) {
  console.error("Usage: stage-shadcn.mjs <component...>");
  process.exit(2);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

await mkdir(scratchRoot, { recursive: true });

if (!existsSync(resolve(appDir, "components.json"))) {
  if (existsSync(appDir)) {
    console.error(`Found ${appDir}, but it is not a shadcn project.`);
    process.exit(1);
  }

  run(
    "npx",
    [
      "-y",
      "shadcn@latest",
      "init",
      "--base",
      "base",
      "--template",
      "vite",
      "--preset",
      "nova",
      "--css-variables",
      "--yes",
      "--no-monorepo",
      "--name",
      "shadcn-intake",
      "--cwd",
      scratchRoot,
    ],
    process.cwd(),
  );
}

run("npx", ["-y", "shadcn@latest", "add", ...components, "--yes"], appDir);

console.log(`\nIntake app: ${appDir}`);
console.log(`Component sources: ${resolve(appDir, "src/components/ui")}`);
console.log(`Theme source: ${resolve(appDir, "src/index.css")}`);
