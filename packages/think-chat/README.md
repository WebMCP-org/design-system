# @mcp-b/think-chat

Thin React glue for Cloudflare Think chat UIs. Renders a Think agent's
`UIMessage` stream — reasoning plus workspace/skill/fetch/browser tool calls —
as collapsed Activity blocks with derived natural-language labels and quiet
detail panels. Everything is interpreted from the message parts; nothing is
fetched, except the (optional) Browser Run live-view iframe, which is
inherently a remote view.

## Shape

- Think and the AI SDK own the message shape. Render `UIMessage.parts`; do not
  normalize tool calls into local message types.
- Keep `@mcp-b/react-components` generic. Think-specific labels and tool
  interpretation live here.
- Unknown tools fall through to generic "Ran <tool>" rows — never crash on a
  tool this package hasn't seen.

## Usage

```tsx
import { ThinkChat } from "@mcp-b/think-chat";

<ThinkChat.Root agent="my-agent">
  <ThinkChat.Messages />
</ThinkChat.Root>;
```

`ThinkChat.Messages` uses `ThinkChat.renderActivityPart` by default. The
renderer folds every run of consecutive activity parts
(reasoning + tool calls) into one collapsed `Activity` block. While streaming,
the collapsed line shimmers with the latest step ("Running vp test"); settled,
it becomes a short summary capped at three clauses ("Thought, read 2 files and
used the browser") — the expanded log carries every step.

### App-specific tools

Two seams keep apps from forking the renderer for their own tools:

- `toolRenderers` — per-tool `describe` (step label) and `panel` (expanded
  detail) overrides for tools that belong _inside_ the activity log. Return
  `undefined` from either to fall through to the built-ins; return `null`
  from `panel` to keep the step a plain row.
- `excludeTools` — tool names that should not fold into the activity box at
  all (e.g. terminal lifecycle tools rendered as their own cards). The run
  splits around them and they fall through to your `renderPart` or the
  generic `Tool` card.

```tsx
// Label/panel overrides inside the log:
<ThinkChat.Messages
  toolRenderers={{
    run_tool: { describe: (part) => "Called a page tool" },
  }}
/>;

// Excluded tools need a renderPart that handles them; compose with the
// factory (passing renderPart to Messages replaces the default wholesale):
const renderActivity = ThinkChat.createActivityRenderer({
  excludeTools: ["nanite_complete"],
});
<ThinkChat.Messages
  renderPart={(context) =>
    isLifecyclePart(context.part) ? <LifecycleCard part={context.part} /> : renderActivity(context)
  }
/>;
```

## Upstream source map

Think is experimental and expected to change. Every shape this package
interprets comes from one of the contracts below — when an upstream release
breaks something, this table says where to re-align. Source for the `agents`,
`@cloudflare/codemode`, and Browser Run pieces:
[github.com/cloudflare/agents](https://github.com/cloudflare/agents). The
installed `.d.ts` files under each package's `dist/` are the ground truth for
the exact version in the lockfile.

| Tool family     | Stream tool names                                                | Upstream contract                                                                                                                                                        | Typing status                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Workspace       | `read` `write` `edit` `list` `find` `grep` `delete` `bash`       | `WorkspaceTools` from `@cloudflare/think/tools/workspace`                                                                                                                | **Fully typed.** `InferUITools<Required<WorkspaceTools>>` — upstream changes break the build.                                                                      |
| Skills          | `activate_skill` `read_skill_resource` `run_skill_script`        | `SkillRegistry.tools()` in the `agents` package — returns untyped `ToolSet`; schemas are zod at runtime (`agents/dist/skills`)                                           | **Hand-rolled mirror** (`SkillUITools` in `src/index.tsx`). Drifts silently — re-check on `agents` upgrades.                                                       |
| Fetch           | `fetch_url` + `fetch_<binding>` (prefix-matched)                 | `createFetchTools()` from `@cloudflare/think/tools/fetch` — untyped `ToolSet`, but the output is the exported `FetchResult` union                                        | **Output typed, inputs mirrored** (`{ url?, path? }`).                                                                                                             |
| Browser         | `browser_execute` + `browser_<action>` per `QuickActionToolName` | `createBrowserTools()` from `@cloudflare/think/tools/browser`; `ProxyToolInput`/`ProxyToolOutput` from `@cloudflare/codemode`; quick-action inputs from `agents/browser` | **Inputs fully typed.** Quick-action outputs stay `unknown` on purpose — upstream truncation degrades shapes (arrays trim, opaque objects become preview strings). |
| Everything else | extensions, execute, actions, MCP, context/client tools          | assembled per turn in Think's `_runInferenceLoop` (`@cloudflare/think` dist, `think.js`)                                                                                 | Generic rows via AI SDK `getToolName` — by design.                                                                                                                 |

Per turn, Think merges (in `_runInferenceLoop`): workspace tools, fetch tools,
your `getTools()`, action tools, extension tools, session context tools, skill
tools, MCP tools, and client tools. This package gives bespoke UI to the first
three families plus browser; the rest stay generic until a real shape warrants
more.

### Workspace explorer

`useWorkspace(source)` + `WorkspaceExplorer` render a Think workspace as a
lazy file tree with a syntax-highlighted preview pane. The source type is
upstream's, not a mirror: `WorkspaceSource` is
`Pick<WorkspaceLike, "readDir" | "readFile"> & Partial<Pick<Workspace, "getWorkspaceInfo">>`,
and entries are `FileInfo` from `@cloudflare/shell`. A Think agent's
`Workspace`, or a cross-DO RPC proxy forwarding to one, plugs in as-is;
`vp check` fails here the moment upstream changes those shapes.

```tsx
const workspace = useWorkspace({ source: agentStub, root: "/workspace" });
<WorkspaceExplorer workspace={workspace} />;
```

`readFile` returning `null` (missing or binary upstream) renders as a quiet
"no text preview" state; `getWorkspaceInfo`, when the source has it, feeds
the header's file-count chip. Styling rides
`@mcp-b/react-components/styles` (workspace-explorer.css).

## Browser Media

- The model surfaces a Live View link by calling `cdp.getLiveViewUrl()` inside
  `browser_execute` code and returning it — the link (upstream's
  `BrowserLiveViewUrl`: `{ url, targetId, expiresInMs }`) rides the stream
  inside `output.result`. `findBrowserResultMedia` in `src/index.tsx` walks the
  result for `live.browser.run` URLs, `data:image/` screenshots, and that
  shape's `expiresInMs`.
- Found links render as this package's `BrowserLiveView`:
  live iframe with a "Live" badge, degrading in place after the ~5-minute TTL
  to the screenshot (if the model returned one) or a quiet "Live view ended"
  state. Mint time isn't in the stream, so expiry counts from first render —
  exact while streaming, and replayed history lands on the ended state anyway.
- Completed browser session replays do **not** ride the Think message stream.
  Fetch them after the session closes with Browser Run's `getBrowserRecording()`;
  upstream shapes `BrowserRecording.events` as `Record<targetId, unknown[]>`.
  Pick a tab's array and pass it directly to this package's `BrowserReplay`.
  Playback is local via `@rrweb/replay` and should
  stay explicit in the app/example layer unless Think starts streaming
  recordings as a first-party message part.

## Backend: a Think agent this UI can fully exercise

```ts
import { Think } from "@cloudflare/think";
import { createBrowserTools } from "@cloudflare/think/tools/browser";
import { createWorkersAI } from "workers-ai-provider";
import productSkills from "agents:skills"; // Agents Vite plugin -> ./skills

export class MyAgent extends Think<Env> {
  // fetch_url + fetch_<name> tools; evaluated at construction (static config).
  fetchTools = { allowlist: ["https://developers.cloudflare.com/**"] };

  getModel() {
    // Any ThinkModel: a model id string or an AI SDK LanguageModel.
    return createWorkersAI({ binding: this.env.AI })("@cf/moonshotai/kimi-k2.7-code");
  }

  getSkills() {
    return [productSkills];
  }

  getTools() {
    return {
      ...createBrowserTools({
        ctx: this.ctx,
        browser: this.env.BROWSER,
        loader: this.env.LOADER,
        session: { mode: "dynamic" }, // shared session -> live view works
      }),
    };
  }
}

// Required by the codemode runtime behind browser_execute
// (the @cloudflare/codemode/vite plugin does this automatically):
export { CodemodeRuntime } from "@cloudflare/codemode";
```

wrangler.jsonc checklist (from upstream's `createBrowserTools` docs):

```jsonc
{
  "browser": { "binding": "BROWSER" },
  "worker_loaders": [{ "binding": "LOADER" }],
  // Quick actions need compatibility_date 2026-03-24+
  // (and `remote: true` on the browser binding for local `wrangler dev`).
}
```

For the live view to appear in the UI, the agent's browser code must actually
surface the link — prompt it to call `cdp.getLiveViewUrl()` and include the
result whenever a human should watch or take over.

## Re-alignment checklist (when upstream ships changes)

1. `pnpm exec vp check` — the typed families (workspace, browser inputs,
   `FetchResult`, `ProxyToolOutput`) fail loudly here.
2. Diff the untyped mirrors against upstream runtime schemas: `SkillUITools`
   vs `agents/dist/skills`, fetch inputs vs `createFetchTools`'s zod schema.
3. `findBrowserResultMedia` sniffs the literal `live.browser.run` substring
   and the `BrowserLiveViewUrl` field names — confirm both if Browser Run's
   live-view URL format changes.
4. The tool-name sets (`WORKSPACE_TOOL_NAMES`, `SKILL_TOOL_NAMES`,
   `BROWSER_TOOL_NAMES`, the `fetch_`/`browser_` prefixes) gate which parts get
   bespoke panels — a renamed upstream tool degrades to a generic row, not an
   error.
