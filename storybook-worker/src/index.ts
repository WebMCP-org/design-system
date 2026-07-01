/// <reference types="@cloudflare/workers-types" />

import { createStorybookMcpHandler } from "@storybook/mcp";

interface Env {
  ASSETS: Fetcher;
}

const storybookMcpHandler = createStorybookMcpHandler();

async function readAsset(env: Env, request: Request, path: string) {
  const normalizedPath = path.replace(/^\.\//, "").replace(/^\/+/, "");
  const url = new URL(`/${normalizedPath}`, request.url);
  const response = await env.ASSETS.fetch(new Request(url, { method: "GET" }));

  if (!response.ok) {
    throw new Error(`Unable to read Storybook manifest ${path}: ${response.status}`);
  }

  return response.text();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
      const handler = await storybookMcpHandler;
      return handler(request, {
        manifestProvider: (_request, path) => readAsset(env, request, path),
      });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
