import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const reactComponentEntrypoints = entrypointFiles(
  "packages/react-components/src/components",
  "dist/components",
);
const reactUtilityEntrypoints = entrypointFiles(
  "packages/react-components/src/utils",
  "dist/utils",
);
const packages = [
  {
    dir: "packages/design-tokens",
    name: "@mcp-b/design-tokens",
    requiredFiles: [
      "package.json",
      "src/index.css",
      "src/palettes.css",
      "src/semantic-dark.css",
      "src/semantic-light.css",
    ],
    forbiddenFiles: [/\.ts$/, /(^|\/)(tests?|stories?|\.storybook)\//],
  },
  {
    build: true,
    dir: "packages/react-components",
    name: "@mcp-b/react-components",
    requiredFiles: [
      "package.json",
      "dist/styles/index.css",
      "dist/styles/tokens.css",
      "dist/styles/base.css",
      ...reactComponentEntrypoints,
      ...reactUtilityEntrypoints,
    ],
    forbiddenFiles: [
      /^src\//,
      /^dist\/index\.(?:d\.ts|js)$/,
      /(^|\/)(tests?|stories?|\.storybook)\//,
    ],
  },
];

for (const pkg of packages) {
  if (pkg.build) {
    run("vp", ["pack"], { cwd: join(root, pkg.dir) });
  }
}

const tempDir = mkdtempSync(join(tmpdir(), "mcp-b-packages-"));
const tarballs = packages.map((pkg) => packAndVerify(pkg, tempDir));
verifyConsumer(tempDir, tarballs);

console.log("Packed packages verified.");

function packAndVerify(pkg, tempDir) {
  const cwd = join(root, pkg.dir);
  const packOutput = execFileSync("pnpm", ["pack", "--json"], {
    cwd,
    encoding: "utf8",
  });
  const packed = JSON.parse(packOutput);
  const paths = packed.files.map((file) => file.path).sort();
  const manifest = JSON.parse(
    execFileSync("tar", ["-xOf", join(cwd, packed.filename), "package/package.json"], {
      encoding: "utf8",
    }),
  );

  if (manifest.private) {
    fail(pkg, "package is still private");
  }

  const missing = pkg.requiredFiles.filter((path) => !paths.includes(path));
  if (missing.length) {
    fail(pkg, `missing packed files: ${missing.join(", ")}`);
  }

  const forbidden = paths.filter((path) =>
    pkg.forbiddenFiles.some((pattern) => pattern.test(path)),
  );
  if (forbidden.length) {
    fail(pkg, `forbidden packed files: ${forbidden.join(", ")}`);
  }

  assertPublishableDependencyRanges(pkg, manifest);

  const tarballPath = join(tempDir, packed.filename);
  copyFileSync(join(cwd, packed.filename), tarballPath);
  unlinkSync(join(cwd, packed.filename));
  return tarballPath;
}

function assertPublishableDependencyRanges(pkg, manifest) {
  for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    const dependencies = manifest[field] ?? {};
    for (const [name, range] of Object.entries(dependencies)) {
      if (typeof range === "string" && /^(catalog|workspace):/.test(range)) {
        fail(pkg, `${field}.${name} uses non-publishable range ${range}`);
      }
    }
  }
}

function verifyConsumer(tempDir, tarballs) {
  run("npm", ["init", "-y"], { cwd: tempDir });
  run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      ...tarballs,
      "react@19",
      "react-dom@19",
      "@types/react@19",
      "@types/react-dom@19",
      "typescript@5",
    ],
    { cwd: tempDir },
  );
  run(
    "node",
    [
      "--input-type=module",
      "-e",
      [
        'const button = await import("@mcp-b/react-components/components/Button");',
        'const utils = await import("@mcp-b/react-components/utils/structured-code");',
        'if (!("Button" in button)) throw new Error("Missing Button export");',
        'if (!("formatStructuredCodeDisplay" in utils)) throw new Error("Missing structured-code export");',
        'for (const spec of ["@mcp-b/design-tokens", "@mcp-b/design-tokens/palettes.css", "@mcp-b/design-tokens/semantic-light.css", "@mcp-b/react-components/styles", "@mcp-b/react-components/styles/base"]) import.meta.resolve(spec);',
        "let rootExported = true;",
        'try { await import("@mcp-b/react-components"); }',
        'catch (error) { if (error.code !== "ERR_PACKAGE_PATH_NOT_EXPORTED") throw error; rootExported = false; }',
        'if (rootExported) throw new Error("Root @mcp-b/react-components export should stay closed");',
      ].join(" "),
    ],
    { cwd: tempDir },
  );
  writeFileSync(
    join(tempDir, "index.ts"),
    [
      'import { Button, type ButtonProps } from "@mcp-b/react-components/components/Button";',
      "",
      'const props: ButtonProps = { children: "Save" };',
      "console.log(Boolean(Button) && Boolean(props));",
      "",
    ].join("\n"),
  );
  run(
    "npx",
    [
      "tsc",
      "--module",
      "nodenext",
      "--moduleResolution",
      "nodenext",
      "--target",
      "es2022",
      "--strict",
      "--skipLibCheck",
      "--jsx",
      "react-jsx",
      "--noEmit",
      "index.ts",
    ],
    { cwd: tempDir },
  );
}

function entrypointFiles(sourceDir, distDir) {
  return readdirSync(join(root, sourceDir), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => /\.(ts|tsx)$/.test(entry.name))
    .filter((entry) => !entry.name.includes(".test."))
    .flatMap((entry) => {
      const name = entry.name.replace(/\.(ts|tsx)$/, "");
      return [`${distDir}/${name}.d.ts`, `${distDir}/${name}.js`];
    });
}

function run(command, args, options) {
  execFileSync(command, args, {
    stdio: "inherit",
    ...options,
  });
}

function fail(pkg, message) {
  console.error(`${pkg.name}: ${message}`);
  process.exit(1);
}
