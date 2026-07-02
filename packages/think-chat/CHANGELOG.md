# @mcp-b/think-chat

## 0.3.1

### Patch Changes

- Updated dependencies [ab9d50c]
  - @mcp-b/react-components@0.2.2

## 0.3.0

### Minor Changes

- acb9c6e: `WorkspaceSource` is now upstream's shapes taken whole — `Workspace | WorkspaceLike` from `@cloudflare/shell`/`@cloudflare/think` — instead of a Pick-composed slice, so agent stubs and RPC proxies plug in without shaping. Adds JSDoc across the public API (Root, Messages, Activity, describeThinkChatActivityPart, tool renderer seam) and a custom-tool-panel story.

## 0.2.1

### Patch Changes

- Updated dependencies [af38c0a]
  - @mcp-b/react-components@0.2.1

## 0.2.0

### Minor Changes

- aa1ae49: First release of `@mcp-b/think-chat`: renders a Cloudflare Think agent's UIMessage stream as collapsed Activity blocks with derived labels and detail panels for workspace, skill, fetch, and browser tools. Includes a per-tool renderer seam (`toolRenderers`/`excludeTools`), `BrowserLiveView`, `BrowserReplay`, and `WorkspaceExplorer`/`useWorkspace` typed directly on `@cloudflare/think`/`@cloudflare/shell` workspace contracts.

### Patch Changes

- Updated dependencies [aa1ae49]
  - @mcp-b/react-components@0.2.0
