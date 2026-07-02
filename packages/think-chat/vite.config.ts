import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
  pack: {
    entry: ["src/index.tsx", "!src/**/*.stories.{ts,tsx}", "!src/**/*.test.{ts,tsx}"],
    sourcemap: false,
    fixedExtension: false,
    deps: {
      neverBundle: [
        "react",
        "react-dom",
        "@mcp-b/react-components",
        "@cloudflare/think",
        "agents",
        "ai",
      ],
    },
    dts: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
  test: {
    setupFiles: ["../../vitest.setup.ts"],
    // Leaf exports resolve to react-components/dist, which may not be built
    // yet — test against source, like .storybook/main.ts does for stories.
    alias: {
      "@mcp-b/react-components/components": fileURLToPath(
        new URL("../react-components/src/components", import.meta.url),
      ),
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: "chromium" }],
    },
  },
});
