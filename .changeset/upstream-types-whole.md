---
"@mcp-b/think-chat": minor
---

`WorkspaceSource` is now upstream's shapes taken whole — `Workspace | WorkspaceLike` from `@cloudflare/shell`/`@cloudflare/think` — instead of a Pick-composed slice, so agent stubs and RPC proxies plug in without shaping. Adds JSDoc across the public API (Root, Messages, Activity, describeThinkChatActivityPart, tool renderer seam) and a custom-tool-panel story.
