<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Repo Shape

- `packages/design-tokens` owns CSS tokens and theme CSS.
- `packages/react-components` owns the React component library and Storybook.
- Keep shared UI here. Do not reintroduce parallel component copies in app repos.

## Repo-authored Skills

- For internal app UI work that should consume this design system, load `.agents/skills/use-mcp-b-design-system/SKILL.md`.

## Modern Web Guidance

For HTML, CSS, accessibility, or client-side React changes, run Chrome's guidance CLI first through Vite+ so it uses the repo-managed Node runtime:

```bash
vp run guidance:search -- "<task summary>"
vp run guidance:retrieve -- "accessibility,css,css-layout,forms,dark-mode"
```

Relevant design-system guide IDs include `accessibility`, `css`, `css-layout`, `forms`, `dark-mode`, `design-token-reactivity`, `animate-to-from-top-layer`, and `resilient-context-menus-and-nested-dropdowns`.

Browser support: target Baseline Widely Available by default. Newly available browser features are allowed only as progressive enhancement or with a documented fallback; do not add polyfills unless a component's core behavior requires them.

Run `vp run audit:modern-web-guidance` after changing component markup, CSS, Storybook theme setup, or guidance scripts.

## Distribution

- Public package scope is `@mcp-b`.
- Storybook is deployed as Cloudflare Workers Static Assets from `vp run deploy:storybook`.
- Run `vp run check:storybook-deploy` after changing `wrangler.jsonc`, `storybook.worker.vite.config.ts`, or Storybook build setup.

## Testing

- Use `vp test` for React component tests in Vitest Browser Mode.
- Use Storybook stories and `vp run test:storybook` for component contracts and interaction coverage.
- Add MSW only when a component crosses an HTTP boundary.
