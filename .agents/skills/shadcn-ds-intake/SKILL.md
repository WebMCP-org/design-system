---
name: shadcn-ds-intake
description: Stage shadcn Base UI components in an ignored intake workspace and port them into the MCP-B design system. Use when adding or comparing shadcn components for packages/react-components, converting shadcn Tailwind/CVA code to MCP-B Base UI wrappers, CSS files, semantic --sigvelo-* tokens, Storybook stories, and package exports.
---

# Shadcn DS Intake

## Overview

Use shadcn as a source catalog, not as the final architecture. The helper only stages source code; the coding agent decides the port by reading this repo's existing component and CSS patterns. The output committed to the repo should follow the existing MCP-B design-system shape: Base UI wrapper components, stable component class names, separate CSS files, semantic `--sigvelo-*` tokens, Storybook coverage, and package exports.

## Workflow

1. Read `AGENTS.md`, the target component, matching CSS, exports, and nearby stories/tests before editing.
2. Run the repo's Modern Web Guidance commands before HTML/CSS/client React edits.
3. Stage shadcn sources in an ignored workspace:

```bash
node skills/shadcn-ds-intake/scripts/stage-shadcn.mjs accordion dropdown-menu
```

4. Inspect generated files under the printed `src/components/ui` path and `src/index.css`.
5. Port behavior and API shape only. Do not copy Tailwind class strings, `class-variance-authority`, `tailwind-merge`, shadcn token names, or `@/lib/utils` into the design-system package.
6. Implement the component in `packages/react-components/src/components`, CSS in `packages/react-components/src/styles`, and wire exports/imports using existing repo patterns.
7. Add or update the smallest useful Storybook story/test for the new behavior.
8. Run `vp check`, `vp test`, `vp run audit:tokens`, and `vp run audit:modern-web-guidance`.

## Conversion Rules

- Prefer shadcn's Base UI imports and composition as the scaffold.
- Keep MCP-B component names unless deliberately adding a new public API.
- Convert `data-slot` and Tailwind selectors into stable classes such as `menu__item` or local `data-*` selectors already used by Base UI.
- Map shadcn tokens like `--background`, `--foreground`, `--primary`, `--border`, and `--ring` to semantic `--sigvelo-*` tokens.
- Replace Tailwind variants with explicit props plus classes when the existing library pattern does that already.
- Reuse existing components instead of importing the generated shadcn dependency copy. For example, use the repo `Button` when a shadcn dialog action imports its generated `button.tsx`.
- Keep generated shadcn files out of tracked app and package directories.

## CLI Notes

The current shadcn CLI needs these flags to avoid prompts for this workflow:

```bash
npx -y shadcn@latest init --base base --template vite --preset nova --css-variables --yes --no-monorepo --name shadcn-intake --cwd <ignored-parent>
```

Do not use `shadcn add --path` for this intake unless you verify imports. It may create dependency files in the custom path while generated imports still point at `@/components/ui/...`.
