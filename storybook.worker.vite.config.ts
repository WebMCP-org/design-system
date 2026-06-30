import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  root: "storybook-worker",
  publicDir: false,
  build: {
    emptyOutDir: true,
    outDir: "../dist/mcp_b_design_system_storybook",
  },
  plugins: [
    cloudflare({
      assetsOnly: true,
      configPath: "../wrangler.jsonc",
    }),
  ],
});
