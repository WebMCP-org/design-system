import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirs = ["packages/design-tokens/src", "packages/react-components/src"];
const sourceFiles = sourceDirs.flatMap((dir) => walk(join(root, dir)));
const cssTokenFiles = walk(join(root, "packages/design-tokens/src")).filter((file) =>
  file.endsWith(".css"),
);

const legacyTokens = [
  "accent",
  "background",
  "border",
  "border-color",
  "bg-primary",
  "card",
  "destructive",
  "foreground",
  "input",
  "muted",
  "muted-foreground",
  "primary",
  "primary-foreground",
  "radius",
  "radius-sm",
  "success",
  "success-foreground",
  "text-primary",
  "text-secondary",
  "warning",
  "warning-foreground",
];

const failures = [];
const allSigveloDefs = new Map();

for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/--sigvelo-[\w-]+\s*:/g)) {
    add(allSigveloDefs, match[0].slice(0, -1).trim(), file);
  }
}

for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  const rel = relative(root, file);

  for (const match of text.matchAll(/var\(\s*(--sigvelo-[\w-]+)/g)) {
    if (!allSigveloDefs.has(match[1])) {
      failures.push(`${rel}: references undefined token ${match[1]}`);
    }
  }

  for (const token of legacyTokens) {
    const legacyToken = `--${token}`;
    const legacyUses = [...text.matchAll(/var\(\s*(--[\w-]+)/g)].some(
      (match) => match[1] === legacyToken,
    );
    const legacyDefs = [...text.matchAll(/(^|[\s{;"'])(--[\w-]+)\s*:/gm)].some(
      (match) => match[2] === legacyToken,
    );
    if (legacyUses || legacyDefs) {
      failures.push(`${rel}: uses legacy token ${legacyToken}`);
    }
  }

  if (/hsl\(\s*var\(--/.test(text)) {
    failures.push(`${rel}: uses shadcn-style hsl(var(--...)) tokens`);
  }

  if (/@sigvelo\/(?:design-tokens|react-components)\b/.test(text)) {
    failures.push(`${rel}: imports the retired @sigvelo package scope`);
  }

  if (/@mcp-b\/design-tokens\/(?:compat|public-brand|presets|styles)\b/.test(text)) {
    failures.push(`${rel}: imports a removed design-token compatibility or preset path`);
  }
}

const tokenSourceDefs = new Map();
for (const file of cssTokenFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/--sigvelo-[\w-]+\s*:/g)) {
    add(tokenSourceDefs, match[0].slice(0, -1).trim(), file);
  }
}

for (const [token, files] of tokenSourceDefs) {
  const uniqueFiles = [...new Set(files)];
  if (uniqueFiles.length > 1 && !isLightDarkSemanticPair(uniqueFiles)) {
    failures.push(
      `${token}: duplicate design-token definitions in ${uniqueFiles
        .map((file) => relative(root, file))
        .join(", ")}`,
    );
  }
}

if (failures.length) {
  console.error(
    ["Design token audit failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"),
  );
  process.exit(1);
}

console.log(`Design token audit passed (${tokenSourceDefs.size} tokens).`);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(file);
    }
    return /\.(css|mdx|tsx?)$/.test(entry.name) ? [file] : [];
  });
}

function add(map, key, value) {
  const values = map.get(key) ?? [];
  values.push(value);
  map.set(key, values);
}

function isLightDarkSemanticPair(files) {
  if (files.length !== 2) {
    return false;
  }
  const names = files.map((file) => relative(root, file)).sort();
  return (
    names[0] === "packages/design-tokens/src/semantic-dark.css" &&
    names[1] === "packages/design-tokens/src/semantic-light.css"
  );
}
