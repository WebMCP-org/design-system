---
name: use-mcp-b-design-system
description: Use the MCP-B design system from internal apps and shared packages. Use when adding UI to an app, deciding whether a component belongs locally or in packages/react-components, wiring @mcp-b/react-components styles, replacing app-local component copies, or preparing a PR that adds reusable UI to this design-system repo.
---

# Use MCP-B Design System

## Overview

Internal apps should consume this design system instead of growing local component libraries. If a reusable component or pattern is missing, add it to this repo and submit a PR rather than copying a one-off version into the app.

## App Workflow

1. Search the app for an existing import from `@mcp-b/react-components`.
2. If missing, add the package dependency used by the workspace and import the stylesheet before app CSS:

```ts
import "@mcp-b/react-components/styles";
```

3. Import components from `@mcp-b/react-components`; do not import Base UI directly for normal product UI.
4. Use app CSS only for page layout, product-specific composition, and local states.
5. Do not redeclare `--sigvelo-*` tokens in apps unless the app owns a theme override.

## Where New UI Goes

Add to `packages/react-components` when the UI is reusable across apps, wraps a Base UI primitive, encodes design-system variants, or prevents another app from recreating the same component.

Keep it app-local only when it is page-specific, data-specific, experimental, or a thin layout wrapper around shared components.

## Design-System PR Workflow

1. Work in the design-system repo.
2. Run the Modern Web Guidance commands from `AGENTS.md` before component markup, CSS, or client React changes.
3. Implement React wrappers in `packages/react-components/src/components`.
4. Implement styles in `packages/react-components/src/styles` using semantic `--sigvelo-*` tokens.
5. Export the component from the package entrypoint and import its CSS from `styles/index.css`.
6. Add the smallest useful Storybook story or interaction test for the public behavior.
7. Run `vp check`, `vp test`, `vp run audit:tokens`, and `vp run audit:modern-web-guidance`.

Use shadcn only as an intake catalog if useful. The committed result should still be MCP-B wrappers plus authored CSS.

## Boundaries

- Do not introduce Tailwind, Panda, vanilla-extract, UnoCSS, CVA, or token build tooling for ordinary app work.
- Do not create parallel `components/ui` folders in apps.
- Do not copy-paste component CSS between apps; promote the shared component once.
- Prefer Storybook as the source for discovering available components. Run `vp run storybook` locally until a hosted Storybook URL is configured.
