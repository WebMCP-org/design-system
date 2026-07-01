---
"@mcp-b/react-components": patch
---

Button: default `nativeButton` to `false` when a `render` override is provided. Rendering `Button` as a non-`<button>` element (e.g. a link or router `Link`) previously triggered Base UI's "expected a native `<button>`" warning and dropped button semantics; now the rendered element keeps proper `role`/keyboard semantics automatically. An explicit `nativeButton` prop still wins.

Checkbox: fix JSDoc example to use `onCheckedChange` (the actual Base UI prop) instead of the non-existent `onChange`.
