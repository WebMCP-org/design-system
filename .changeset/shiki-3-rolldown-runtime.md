---
"@mcp-b/react-components": patch
---

Pin shiki to ^3.23.0. shiki 4.x ships rolldown-runtime helper chunks that rolldown-vite (vite 8) dedupes incorrectly when bundling, crashing CodeBlock at runtime with `__reExport is not defined`. 3.x also matches streamdown's shiki range, so apps bundle a single copy.
