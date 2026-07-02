# @mcp-b/react-components

## 0.2.0

### Minor Changes

- aa1ae49: Add the agent conversation surface: new `Activity` and `AgentChat` components, a public `components/icons` leaf, and styles for activity, agent-chat, browser-live-view, browser-replay, and workspace-explorer. Restyle components and tokens toward the borderless direction: hairline dividers instead of boxed fills, quiet Tool cards, height-bounded expandables.

### Patch Changes

- Updated dependencies [aa1ae49]
  - @mcp-b/design-tokens@0.2.0

## 0.1.5

### Patch Changes

- e84a533: Button: default `nativeButton` to `false` when a `render` override is provided. Rendering `Button` as a non-`<button>` element (e.g. a link or router `Link`) previously triggered Base UI's "expected a native `<button>`" warning and dropped button semantics; now the rendered element keeps proper `role`/keyboard semantics automatically. An explicit `nativeButton` prop still wins.

  Checkbox: fix JSDoc example to use `onCheckedChange` (the actual Base UI prop) instead of the non-existent `onChange`.

  - @mcp-b/design-tokens@0.1.5

## 0.1.4

### Patch Changes

- Republish React components with the grouped design token dependency.
  - @mcp-b/design-tokens@0.1.4

## 0.1.3

### Patch Changes

- Publish the semantic `--sigvelo-color-*` token names consumed by the React component CSS.
- Updated dependencies
  - @mcp-b/design-tokens@0.1.3

## 0.1.2

### Patch Changes

- Publish component and utility subpath exports for direct npm consumers.

## 0.1.1

### Patch Changes

- Republish the initial React component package after npm reserved 0.1.0 during trusted-publishing bootstrap.
- Updated dependencies
  - @mcp-b/design-tokens@0.1.1

## 0.1.0

### Minor Changes

- 509a2fb: Create the shared MCP-B design-system packages from the SigVelo, Nanites, and WebMCP UI copies.

### Patch Changes

- Updated dependencies [509a2fb]
  - @mcp-b/design-tokens@0.1.0
