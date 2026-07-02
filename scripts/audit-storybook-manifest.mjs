import fs from "node:fs";

const manifestPath = "dist/mcp_b_design_system_storybook/client/manifests/components.json";
const docsManifestPath = "dist/mcp_b_design_system_storybook/client/manifests/docs.json";
const packageJsonPaths = [
  "packages/react-components/package.json",
  "packages/think-chat/package.json",
];
const hiddenNames = new Set(["RegressionTests", "LearnPage", "ProfilePage"]);

function fail(message) {
  failures.push(message);
}

const failures = [];

if (!fs.existsSync(manifestPath)) {
  console.error(`Missing ${manifestPath}. Run vp run build:storybook-worker first.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const packageNames = packageJsonPaths.map((path) => JSON.parse(fs.readFileSync(path, "utf8")).name);
const components = Object.values(manifest.components ?? {});
const docsManifest = fs.existsSync(docsManifestPath)
  ? JSON.parse(fs.readFileSync(docsManifestPath, "utf8"))
  : { docs: {} };
const docs = Object.values(docsManifest.docs ?? {});

for (const component of components) {
  const meta = component.reactComponentMeta ?? {};
  const description = (meta.description || component.description || "").trim();
  const props = Object.values(meta.props ?? {});
  const importStatement = component.import ?? "";

  if (hiddenNames.has(component.name)) fail(`${component.name}: leaked private fixture story`);
  if (component.error) fail(`${component.name}: ${component.error.name}`);
  if (!description) fail(`${component.name}: missing component description`);
  if (!props.length) fail(`${component.name}: missing prop metadata`);
  if (!props.some((prop) => prop.description?.trim())) {
    fail(`${component.name}: missing documented prop`);
  }
  if (!packageNames.some((name) => importStatement.includes(`from "${name}"`))) {
    fail(`${component.name}: import path is not one of ${packageNames.join(", ")}`);
  }
}

for (const doc of docs) {
  if (doc.error) fail(`${doc.title}: ${doc.error.name}`);
  if (!doc.summary?.trim()) fail(`${doc.title}: missing docs summary`);
}

if (failures.length) {
  console.error("Storybook manifest audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Storybook manifest audit passed: ${components.length} components and ${docs.length} docs entries have MCP metadata.`,
);
