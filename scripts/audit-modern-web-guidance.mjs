import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const files = [
  ...walk(join(root, "packages/design-tokens/src")),
  ...walk(join(root, "packages/react-components/src")),
];

requireText("package.json", '"guidance:search"');
requireText("package.json", '"guidance:retrieve"');
requireText("package.json", "audit:modern-web-guidance");
requireText("AGENTS.md", "Baseline Widely Available");
requireText("packages/design-tokens/src/themes.css", "color-scheme: light dark");
requireText("packages/design-tokens/src/themes.css", "accent-color:");
requireText("packages/react-components/.storybook/preview.tsx", 'meta[name="color-scheme"]');

const scrollbarCss = read("packages/react-components/src/styles/scrollbars.css");
if (scrollbarCss.includes("scrollbar-color")) {
  for (const required of [
    "scrollbar-width: thin",
    "scrollbar-gutter: stable",
    "@media (prefers-contrast: more)",
    "@supports not (scrollbar-color: auto)",
    "::-webkit-scrollbar-thumb",
    "::-webkit-scrollbar-track",
  ]) {
    if (!scrollbarCss.includes(required)) {
      failures.push(`packages/react-components/src/styles/scrollbars.css: missing ${required}`);
    }
  }
}

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const source = stripComments(text);
  const rel = relative(root, file);

  reject(
    source,
    rel,
    /\btabIndex=\{?[1-9]\d*|tabindex=["'][1-9]\d*["']/g,
    "uses positive tabindex",
  );
  reject(source, rel, /\baria-required=/g, "uses redundant aria-required");
  reject(source, rel, /\bscrolling=["']no["']/g, "disables iframe scrolling");
  if (/\.(tsx|mdx)$/.test(rel)) {
    reject(source, rel, /role=["']button["']/g, "uses ARIA button instead of a native button");
  }

  for (const tag of tags(source, "iframe")) {
    if (!/\btitle=/.test(tag)) {
      failures.push(`${rel}: iframe is missing a title`);
    }
  }

  for (const tag of tags(source, "img")) {
    if (!/\balt=/.test(tag)) {
      failures.push(`${rel}: img is missing alt text`);
    }
  }

  if (rel.startsWith("packages/react-components/src/components/")) {
    for (const tag of tags(source, "svg")) {
      if (!/\b(aria-hidden|role|focusable)=/.test(tag) && !tag.includes("{...ariaProps}")) {
        failures.push(`${rel}: component svg needs aria-hidden, role, or focusable`);
      }
    }
  }
}

for (const file of files.filter((file) => file.endsWith(".css"))) {
  const text = readFileSync(file, "utf8");
  if (
    /outline:\s*none/.test(text) &&
    !/:focus-visible|:focus-within|\[data-highlighted\]/.test(text)
  ) {
    failures.push(`${relative(root, file)}: removes outlines without a visible focus replacement`);
  }
}

const hiddenUntilFound = files.some((file) =>
  readFileSync(file, "utf8").includes('hidden="until-found"'),
);
const beforeMatch = files.some((file) => readFileSync(file, "utf8").includes("beforematch"));
if (hiddenUntilFound && !beforeMatch) {
  failures.push('hidden="until-found" is used without a beforematch state sync handler');
}

if (failures.length) {
  console.error(
    ["Modern Web Guidance audit failed:", ...failures.map((failure) => `- ${failure}`)].join("\n"),
  );
  process.exit(1);
}

console.log("Modern Web Guidance audit passed.");

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(file);
    }
    return /\.(css|mdx|tsx?)$/.test(entry.name) ? [file] : [];
  });
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function requireText(path, expected) {
  if (!read(path).includes(expected)) {
    failures.push(`${path}: missing ${expected}`);
  }
}

function reject(text, file, pattern, message) {
  if (pattern.test(text)) {
    failures.push(`${file}: ${message}`);
  }
}

function tags(text, name) {
  return [...text.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gs"))].map((match) => match[0]);
}

function stripComments(text) {
  return text.replaceAll(/\/\*[\s\S]*?\*\//g, "").replaceAll(/^\s*\/\/.*$/gm, "");
}
