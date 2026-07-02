# Polish pass — issue log

Running log from the component-by-component Impeccable polish pass (2026-07-01).
Status: `fixed` (in this pass), `deferred` (noted, intentionally not fixed), `systemic` (repo-wide, needs its own PR).

## Systemic

### Borderless redesign pass (2026-07-01)

Direction change requested: minimal/borderless look — containment by fill and whitespace, not outlines.

- Root cause of "cards in cards in borders": `canvas` and `surface` are both white, so every container compensated with a 1px perimeter border (45 of ~50 stylesheets). `fixed` via the moves below.
- `--sigvelo-color-neutral-border-subtle` demoted to a true hairline (light: 60% neutral-200; dark: neutral-900 + 4% white) — softens every remaining border at once. `fixed`
- Radii bumped: md 6→8px, lg 9→12px, xl 12→16px. `fixed`
- Border→fill conversions (gray `neutral-bg-subtle` panels, no perimeter border, radius-lg): CodeBlock; Terminal dropped its pointless border (dark fill is the containment); Queue file chip. `fixed`
- Tool and Task revised per user feedback (didn't like the gray): now Ploy-style — transparent bg, hairline outline, radius-lg, muted header row, plain content inside, gray chips. `fixed`
- Expandables bounded so opening them never displaces the conversation scroll: reasoning text and task list capped at 20rem with `overflow-y: auto` (tool sections already had this). Chain-of-thought was bounded too, then reverted — out of scope per user (conversation-surface components are the priority). These scroll regions aren't keyboard-focusable (same as the existing tool-section issue). `fixed` / `deferred`
- "Working"-style aggregator built as the new `Activity` component (Activity/ActivityTrigger/ActivityContent/ActivityItem): Ploy-style outlined box, spinner + pulsing "Working…" while streaming, collapsed state peeks only the latest item (each new one replaces the last, CSS-only via sibling selector), expands to the full bounded log. Stories under Components/Activity incl. a LiveStreaming demo. `fixed`
- Codex-style double collapse: `ActivityItemGroup` (second level — trigger reads as a plain item row, chevron on hover only, panel is chrome-free so no box-in-box) + explicit `peek` prop on ActivityContent (so the collapsed peek never duplicates an interactive row). think-chat derives everything from the AI SDK stream: `ThinkChat.renderActivityPart` folds consecutive reasoning/tool parts into one Activity; thoughts expand to their trace. Verified against a real UIMessageChunk stream via `readUIMessageStream` (ActivityFromTokenStream story). `fixed`
- Aligned with Codex/Claude Code conventions (per user screenshots): bash steps expand to a quiet "Shell" fill panel (`.activity__shell` — bg-subtle, mono output capped at 12rem, status bottom-right) instead of nesting the full Terminal component, which was chrome-in-chrome; row labels are verb+command ("Ran vp test", the tool name never shows) and always clamp to one line (the panel carries the full `$ command`); the settled header is a derived natural-language summary instead of a step count. `fixed`
- Default renderers for the complete Think workspace toolset (read, write, edit, list, find, grep, delete, bash — contracts read from `@cloudflare/think` upstream types): read/write panels show the file with line numbers (path as panel label, "N lines" status), edit shows a mini diff (red `- old` / green `+ new` via `.activity__diff-*`, "replaced"/"created" status), grep/find/list show their result lists with match counts; delete is row-only. Labels are Claude Code-style ("Read Activity.tsx", "Searched for foo") and the header sums them ("Thought, read a file, edited a file, searched code, ran 2 commands"). Unknown/dynamic tools still fall through to generic rows. `fixed`
- Default renderers extended to Think's skill and fetch tools (the remaining built-ins a Think agent registers per turn): `activate_skill`/`read_skill_resource`/`run_skill_script` from agents/skills (untyped ToolSet upstream, local types mirror the runtime zod schemas) get "Used the frontend-design skill" labels with the skill body/resource/script result in the quiet panel; `fetch_url` + `fetch_<binding>` (prefix-matched, output typed by upstream `FetchResult`) get "Fetched <url>" labels with the body and a "200 · N bytes" status, error/ok:false variants included. Header summary gained "used the <name> skill" and "fetched N URLs" segments. Extension tools (`load_extension`/`list_extensions`) and the codemode `execute` tool stay generic rows — execute belongs with the deferred approval-flow work. `fixed`
- Browser toolset rendering (contracts from cloudflare/agents source): `browser_execute` (codemode, output typed by upstream `ProxyToolOutput` — new `@cloudflare/codemode` dep) gets a "Browser" panel with code/logs/result and completed/paused/error statuses; quick actions (`browser_markdown`/`extract`/`links`/`scrape`/`content`) get "Browsed example.com"-style rows. When a completed result carries a Live View link (`live.browser.run`, the model's `cdp.getLiveViewUrl()` flow) the panel embeds the new `BrowserLiveView` component — live iframe with a pulsing Live badge that swaps to a screenshot/ended state when the ~5-min URL expires (mint time approximated by first render; replayed history just shows the ended state). New `BrowserReplay` component replays Browser Run session recordings (rrweb events, new `@rrweb/replay` dep, cursor CSS vendored) scaled-to-fit with a minimal play/scrub transport. Verified with a hand-crafted recording in Storybook. NOT yet verified: that live.browser.run allows iframe embedding — needs a real Browser Run session. `fixed`
- Shadow-led elevation (border removed, shadow kept/bumped): Card, Artifact. Internal header dividers removed (Artifact, CodeBlock); Tool content divider removed. `fixed`
- Fields keep borders: PromptInput got the floating-composer treatment (radius-xl, roomier padding, shadow-sm); Input unchanged. Overlays keep hairline + existing shadows. `fixed`
- Air: conversation content gap 0.75→1rem, padding 1→1.25rem; tool/task inline padding 0.75→0.875rem; user message bubble radius md→lg. `fixed`
- Not converted (still full-perimeter borders, now hairline via token): chain-of-thought, sources, commit, test-results, web-preview, file-tree, environment-variables, model-selector, agent-connection, stepper, etc. Convert case-by-case if they read as chrome-heavy in real screens. `deferred`
- Card/Artifact are shadow-only on a white canvas — if edges feel undefined on low-contrast displays, consider a `0 0 0 1px` alpha ring inside the shadow stack rather than reintroducing borders. `deferred`

- **Hardcoded `150ms ease` transitions** — swept all `150ms ease` literals in `packages/react-components/src/styles/` to `var(--sigvelo-duration-fast) var(--sigvelo-ease-standard)`. `fixed`
  - Stragglers that don't map 1:1 to tokens (fast=150/medium=240/slow=360): 8× `200ms ease`, 5× `100ms ease`, 3× `300ms ease`, 2× `120ms ease`. Need a decision on snapping each to the nearest token. `deferred`
- **Focus-ring split resolved** — the two-layer shadow ring (`0 0 0 2px canvas, 0 0 0 4px focus`) was already the dominant idiom (~40 rules) across both field-like and button-like controls; the 7 files using `outline: var(--sigvelo-focus-ring)` (button, badge, accordion, alert-dialog, autocomplete, stepper, agent-connection) were the drift. Converted all 10 outline rules to the canonical shadow ring. The `--sigvelo-focus-ring` token is now unused in this package. `fixed`

## Button

- Hardcoded `150ms ease` transitions in button.css. `fixed`
- No `:active` pressed state on any variant — hover exists, press gave no feedback. Added a single `filter: brightness(0.94)` rule covering all variants. `fixed`
- Focus treatment inconsistency: Button used `outline: var(--sigvelo-focus-ring)` while ~40 other rules use the two-layer `box-shadow` ring. Resolved in the systemic sweep — Button now uses the canonical shadow ring. `fixed`
- Hover mixes use `color-mix(..., black 5%)` — in dark mode this darkens toward the canvas instead of increasing contrast. Works, but a `--sigvelo-color-*-bg-hover` semantic token (theme-aware) would be more correct. `systemic`
- `.button--link` inherits size padding (e.g. `padding-inline: 1.25rem` at md), unusual for link-style buttons; changing would shift existing layouts. `deferred`
- `.button--icon*` uses `min-height` + fixed `width`, so overflowing content makes them non-square; icon-only by contract. `deferred`

## Tool

- `ToolHeader` `title` prop documented as "shown alongside the tool name" and `.tool__header-title` CSS existed for it, but the code replaced the name with the title (`{title ?? derivedName}`) and the CSS class was never rendered. Wired it up: name always shows, title renders alongside in muted text. `fixed`
- Long tool names/titles overflowed the header row (no truncation on flex children). Added `min-width: 0` + ellipsis to name and title. `fixed`
- Header font sizes hardcoded (`0.8125rem`/13px, `0.6875rem`/11px) — no matching type token exists (xs=12px, sm=14px). Either add a token or snap to xs/sm. `deferred`
- `.tool__section > :not(.tool__section-label)` creates scrollable regions (`max-height: 20rem; overflow: auto`) that aren't keyboard-focusable — keyboard users can't scroll long input/output. Needs `tabindex="0"` + label on the scroll container. `deferred`
- Tool state changes (Running → Completed/Error) are visual-only; no live-region announcement for screen readers. Possibly app-level responsibility. `deferred`

## PromptInput (Composer/Prompt)

- Hardcoded `150ms ease` transitions in prompt-input.css. `fixed`
- `:focus-within` used a full-strength `0 0 0 3px` focus ring on the whole composer — heavier than Input/Select's soft ring, and it double-ringed when toolbar buttons inside the composer received focus. Switched to the Input idiom (focus-color border + 80%-transparent 4px ring). `fixed`
- `PromptInputButton` icon-only with a ReactNode tooltip (not a string) and no explicit `aria-label` renders an unlabeled button — the fallback label only works for string tooltips. Consumer footgun; consider a dev warning. `deferred`
- Reduced-motion spinner handling is inconsistent: prompt-input slows the submit spinner to 3s, tool.css stops its spinner entirely. Pick one convention (slow is arguably better for loading indicators). `systemic`
- Textarea font-size hardcoded at `0.9375rem` (15px) — no matching type token. `deferred`
- `PromptInputHoverCardContent` appears/disappears with no transition and is mouse/focus-only on the trigger; content itself is not reachable by keyboard if interactive. `deferred`

## Conversation

- **Bug:** `.conversation__scroll-button` was `position: absolute` inside `.conversation`, which is itself the scroll container — absolutely-positioned children of a scroller scroll away with the content, so the "scroll to latest" button drifted off-screen exactly when it was visible (user scrolled up). Fixed with `position: sticky` bottom + auto inline margin; verified pinned bottom-right at all scroll positions in Chromium. `fixed`
- **Bug (same root cause):** `.conversation__download-button` also scrolled away with content. Fixed by the DOM restructure: `.conversation` is now an unscrolled relative wrapper around a `.conversation__viewport` scroller, so both floating buttons anchor to the wrapper and stay pinned (verified in Chromium at all scroll positions; the interim sticky hack on the scroll button was reverted to plain absolute). Tests updated to query `.conversation__viewport`. `fixed`
- Scroll/download buttons lived inside the `aria-live` log region and could be announced as new content. Fixed by moving `role="log"` / `aria-live` / `aria-relevant` from the scroller to `.conversation__content`, which wraps only the messages. `fixed`
- The scroll viewport is focusable (`tabIndex=0`) but has no role/accessible name — axe prefers labeled scrollable regions; consumers can pass `aria-label` via props. `deferred`
- Empty-state font sizes hardcoded (`1rem`, `0.875rem`) where type tokens exist. `deferred`

## Message

- Font sizes bypassed tokens that match exactly: `0.875rem` → `--sigvelo-text-sm`, `0.75rem` → `--sigvelo-text-xs`. `fixed`
- Redundant legacy `word-wrap: break-word` alongside `overflow-wrap: anywhere` (word-wrap is the legacy alias; anywhere is stronger). `fixed`
- `MessageActions` sets `role="toolbar"` but implements no arrow-key navigation and has no accessible name — APG expects roving tabindex + aria-label for toolbars. Either implement or downgrade to `role="group"` with a label. `deferred`
- `MessageBranchContent` keeps every branch mounted (`hidden` attr) — intentional for state preservation, but heavy branches (mermaid/math) all render. `deferred`

## Input

- Missing hover state on `.input` while sibling `.select__trigger` has one (`border-color: var(--sigvelo-color-focus)`). `fixed`
- Hardcoded `150ms ease` transitions in input.css. `fixed`
- `.input:disabled` sets both `pointer-events: none` and `cursor: not-allowed` — the cursor rule is dead (pointer-events blocks it). Harmless. `deferred`
- `.input::file-selector-button` hardcodes `height: 1.75rem` instead of a control-height token. `deferred`
- Invalid state uses `--sigvelo-color-danger-bg` for border-color; a dedicated `--sigvelo-color-danger-border` token exists — but buttons also use danger-bg for borders, so this matches current repo idiom. `deferred`
