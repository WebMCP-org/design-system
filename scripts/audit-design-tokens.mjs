import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirs = [
  "packages/design-tokens/src",
  "packages/react-components/.storybook",
  "packages/react-components/src",
];
const sourceFiles = sourceDirs.flatMap((dir) => walk(join(root, dir)));
const cssTokenFiles = walk(join(root, "packages/design-tokens/src")).filter((file) =>
  file.endsWith(".css"),
);
const reactStylesDir = join(root, "packages/react-components/src/styles");
const reactStyleIndex = readFileSync(join(reactStylesDir, "index.css"), "utf8");
const reactPackageManifest = JSON.parse(
  readFileSync(join(root, "packages/react-components/package.json"), "utf8"),
);
const reactPackageExports = reactPackageManifest.exports ?? {};
const reactPackConfig = readFileSync(
  join(root, "packages/react-components/vite.config.ts"),
  "utf8",
);
const baseUiWrapperOwners = new Map([
  ["@base-ui/react/accordion", "Accordion.tsx"],
  ["@base-ui/react/alert-dialog", "AlertDialog.tsx"],
  ["@base-ui/react/autocomplete", "Autocomplete.tsx"],
  ["@base-ui/react/avatar", "Avatar.tsx"],
  ["@base-ui/react/button", "Button.tsx"],
  ["@base-ui/react/checkbox", "Checkbox.tsx"],
  ["@base-ui/react/checkbox-group", "CheckboxGroup.tsx"],
  ["@base-ui/react/collapsible", "Collapsible.tsx"],
  ["@base-ui/react/combobox", "Combobox.tsx"],
  ["@base-ui/react/context-menu", "ContextMenu.tsx"],
  ["@base-ui/react/dialog", "Dialog.tsx"],
  ["@base-ui/react/field", "Field.tsx"],
  ["@base-ui/react/fieldset", "Fieldset.tsx"],
  ["@base-ui/react/form", "Form.tsx"],
  ["@base-ui/react/input", "Input.tsx"],
  ["@base-ui/react/menu", "Menu.tsx"],
  ["@base-ui/react/menubar", "Menubar.tsx"],
  ["@base-ui/react/meter", "Meter.tsx"],
  ["@base-ui/react/navigation-menu", "NavigationMenu.tsx"],
  ["@base-ui/react/number-field", "NumberField.tsx"],
  ["@base-ui/react/popover", "Popover.tsx"],
  ["@base-ui/react/preview-card", "PreviewCard.tsx"],
  ["@base-ui/react/progress", "Progress.tsx"],
  ["@base-ui/react/radio", "RadioGroup.tsx"],
  ["@base-ui/react/radio-group", "RadioGroup.tsx"],
  ["@base-ui/react/scroll-area", "ScrollArea.tsx"],
  ["@base-ui/react/select", "Select.tsx"],
  ["@base-ui/react/separator", "Separator.tsx"],
  ["@base-ui/react/slider", "Slider.tsx"],
  ["@base-ui/react/switch", "Switch.tsx"],
  ["@base-ui/react/tabs", "Tabs.tsx"],
  ["@base-ui/react/toast", "Toast.tsx"],
  ["@base-ui/react/toggle", "Toggle.tsx"],
  ["@base-ui/react/toggle-group", "ToggleGroup.tsx"],
  ["@base-ui/react/toolbar", "Toolbar.tsx"],
  ["@base-ui/react/tooltip", "Tooltip.tsx"],
]);
const allowedBaseUiBypasses = new Set([
  // These wrappers are intentionally implemented from two related Base UI primitives.
  "Menubar.tsx:@base-ui/react/menu",
  "ToggleGroup.tsx:@base-ui/react/toggle",
]);

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

  for (const match of text.matchAll(/var\(\s*(--mcp-b-[\w-]+)/g)) {
    failures.push(`${rel}: references retired token ${match[1]}`);
  }

  for (const match of text.matchAll(/(^|[\s{;"'])(--mcp-b-[\w-]+)\s*:/gm)) {
    failures.push(`${rel}: defines retired token ${match[2]}`);
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

  const isReactRuntimeSource =
    rel.startsWith("packages/react-components/src/components/") ||
    rel.startsWith("packages/react-components/src/styles/");
  if (
    isReactRuntimeSource &&
    /@tailwind\b|tailwindcss\b|tailwind-merge\b|class-variance-authority\b|@radix-ui\//.test(text)
  ) {
    failures.push(`${rel}: uses Tailwind, shadcn, or Radix runtime internals`);
  }

  if (rel.startsWith("packages/react-components/src/components/")) {
    const fileName = rel.slice("packages/react-components/src/components/".length);
    for (const match of text.matchAll(/from\s+["'](@base-ui\/react[^"']+)["']/g)) {
      const owner = baseUiWrapperOwners.get(match[1]);
      if (owner && owner !== fileName && !allowedBaseUiBypasses.has(`${fileName}:${match[1]}`)) {
        failures.push(
          `${rel}: imports ${match[1]} directly; use the internal ${owner.replace(
            /\.tsx$/,
            "",
          )} wrapper`,
        );
      }
    }
  }
}

for (const file of readdirSync(reactStylesDir).filter((file) => file.endsWith(".css"))) {
  if (["base.css", "index.css", "tokens.css"].includes(file)) {
    continue;
  }
  if (!reactStyleIndex.includes(`"./${file}"`) && !reactStyleIndex.includes(`'./${file}'`)) {
    failures.push(
      `packages/react-components/src/styles/${file}: is not imported by styles/index.css`,
    );
  }
}

if (reactPackageManifest.types) {
  failures.push("packages/react-components/package.json: top-level types reopens the root barrel");
}

if (reactPackageExports["."]) {
  failures.push("packages/react-components/package.json: root export reopens the root barrel");
}

if (!reactPackageExports["./components/*"]) {
  failures.push("packages/react-components/package.json: missing ./components/* subpath export");
}

if (!reactPackageExports["./utils/*"]) {
  failures.push("packages/react-components/package.json: missing ./utils/* subpath export");
}

for (const entry of ['"src/components/*.{ts,tsx}"', '"src/utils/*.ts"']) {
  if (!reactPackConfig.includes(entry)) {
    failures.push(`packages/react-components/vite.config.ts: missing pack entry ${entry}`);
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
