# MCP-B Design System

Reusable design tokens and React components shared by SigVelo, Nanites, and WebMCP.

## Packages

- `@mcp-b/design-tokens` - CSS custom properties for primitives, semantic colors, spacing, type, focus, borders, motion, and light/dark modes.
- `@mcp-b/react-components` - Base UI-backed React component library, Storybook stories, browser tests, and packed CSS.

## Development

```bash
vp install
vp run storybook
vp run ready
```

Validate the publishable package shape:

```bash
vp run validate:packages
```

Build the Cloudflare-hosted Storybook Worker:

```bash
vp run build:storybook-worker
```

For hosted docs, connect the GitHub repo in Cloudflare Workers Builds and use
`vp run build:storybook-worker`. The Worker name in Cloudflare must match
`mcp-b-design-system-storybook` from `wrangler.jsonc`.

Use Chrome's modern web guidance CLI before web-facing changes:

```bash
vp run guidance:search -- "accessible React design system component"
vp run guidance:retrieve -- "accessibility,css,dark-mode"
```

The public package scope is `@mcp-b`. The CSS token contract intentionally keeps the existing `--sigvelo-*` variables so app migrations only need package imports to change.
