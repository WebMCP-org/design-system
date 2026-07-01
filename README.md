# MCP-B Design System

Reusable design tokens and React components shared by SigVelo, Nanites, and WebMCP.

Storybook: https://design-system.sigvelo.com
Storybook MCP: https://design-system.sigvelo.com/mcp

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
these commands:

```bash
# Build command
pnpm run build:storybook-worker

# Production deploy command
pnpm exec wrangler deploy --config dist/mcp_b_design_system_storybook/mcp_b_design_system_storybook/wrangler.json

# Non-production branch deploy command
pnpm exec wrangler versions upload --config dist/mcp_b_design_system_storybook/mcp_b_design_system_storybook/wrangler.json
```

Set these build variables in both production and non-production branch builds:

```bash
CLOUDFLARE_ACCOUNT_ID=ad0d45931959d888de55865d02260ef8
NODE_VERSION=24.18.0
PNPM_CONFIG_OPTIONAL=true
```

The Worker name in Cloudflare must match `mcp-b-design-system-storybook` from
`wrangler.jsonc`; the custom domain is `design-system.sigvelo.com`.

Use Chrome's modern web guidance CLI before web-facing changes:

```bash
vp run guidance:search -- "accessible React design system component"
vp run guidance:retrieve -- "accessibility,css,dark-mode"
```

The public package scope is `@mcp-b`; the CSS token prefix is `--sigvelo-*`. Apps should not redefine that contract unless they own a documented theme override.

Apps may use Tailwind for page layout, responsive composition, and local glue around these components. Reusable or bespoke Sigvelo UI belongs in `@mcp-b/react-components`, and component internals stay authored CSS over `--sigvelo-*` tokens.

This repo is being put in place as the shared target before every existing app has migrated. Legacy local component packages can remain during migration, but new reusable UI should land here.
