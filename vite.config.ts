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
