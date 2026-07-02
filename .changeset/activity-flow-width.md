---
"@mcp-b/react-components": patch
---

Let the expanded Activity log flow in the conversation scroll (only subsection panels stay height-bounded), and stop wide activity content from resizing the chat column: the conversation viewport now has `contain: inline-size`, and Activity's width cap is a plain `max-width: 36rem` so it clamps intrinsic sizing.
