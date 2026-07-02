import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const baseUiReactPackageDir = dirname(
  fileURLToPath(import.meta.resolve("@base-ui/react/package.json")),
);
const baseUiStoreCjs = join(baseUiReactPackageDir, "../utils/store/index.js");
const storybookDir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../think-chat/src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  core: {
    disableTelemetry: true,
  },
  features: {
    componentsManifest: true,
    experimentalReactComponentMeta: true,
  },
  framework: "@storybook/react-vite",
  viteFinal: (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          // Storybook's production build currently drops the reselect import used by
          // Base UI's ESM store helper while preserving its top-level selector call.
          "@base-ui/utils/store": baseUiStoreCjs,
          "@mcp-b/react-components/components": join(storybookDir, "../src/components"),
        },
      },
    }),
};
export default config;
