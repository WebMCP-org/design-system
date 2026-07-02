import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
  staged: {
    "*.{ts,tsx,js,jsx}": "vp check --fix",
  },
  fmt: {},
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  test: {
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/**/{src,tests}/**/*.test.{ts,tsx,js,jsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/opensrc/**"],
    // think-chat imports react-components leaf exports, which resolve to
    // dist/ — absent in CI, where tests run before builds. Point tests at
    // source, like .storybook/main.ts does for stories.
    alias: {
      "@mcp-b/react-components/components": fileURLToPath(
        new URL("./packages/react-components/src/components", import.meta.url),
      ),
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: "chromium" }],
    },
  },
  run: {
    cache: { tasks: true, scripts: false },
  },
});
