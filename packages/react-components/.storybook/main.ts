import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const require = createRequire(import.meta.url);
const baseUiReactPackageDir = dirname(require.resolve("@base-ui/react/package.json"));
const baseUiStoreCjs = join(baseUiReactPackageDir, "../utils/store/index.js");

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-a11y", "@storybook/addon-docs"],
  core: {
    disableTelemetry: true,
  },
  framework: "@storybook/react-vite",
  viteFinal: (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          // Storybook's production build currently drops the reselect import used by
          // Base UI's ESM store helper while preserving its top-level selector call.
          "@base-ui/utils/store": baseUiStoreCjs,
        },
      },
    }),
};
export default config;
