/**
 * Think-specific chat rendering: interprets a Think agent's UIMessage stream
 * (reasoning + workspace/skill/fetch/browser tool parts) into Activity blocks.
 *
 * Every shape here mirrors an upstream contract — see README.md ("Upstream
 * source map" and the re-alignment checklist) for where each one comes from,
 * which are compile-time typed vs. hand-rolled mirrors of untyped upstream
 * ToolSets, and how to re-align when @cloudflare/think (experimental) changes.
 */
import * as React from "react";
import type { ProxyToolInput, ProxyToolOutput } from "@cloudflare/codemode";
import { useAgentChat } from "@cloudflare/think/react";
import type {
  QuickActionExtractInput,
  QuickActionPage,
  QuickActionScrapeInput,
  QuickActionToolName,
} from "@cloudflare/think/tools/browser";
import type { FetchResult } from "@cloudflare/think/tools/fetch";
import type { WorkspaceTools } from "@cloudflare/think/tools/workspace";
import {
  Activity,
  ActivityContent,
  ActivityItem,
  ActivityItemGroup,
  ActivityOutput,
  ActivityPanel,
  ActivityText,
  ActivityTrigger,
} from "@mcp-b/react-components/components/Activity";
import { CodeBlock } from "@mcp-b/react-components/components/CodeBlock";
import { Tab, TabPanel, Tabs, TabsList } from "@mcp-b/react-components/components/Tabs";
import { BrowserLiveView } from "./BrowserLiveView";
import {
  AgentChat,
  type AgentChatProps,
  type AgentChatRenderPartContext,
} from "@mcp-b/react-components/components/AgentChat";
import { useAgent, type UseAgentOptions } from "agents/react";
import {
  getToolName,
  isReasoningUIPart,
  isToolUIPart,
  type DynamicToolUIPart,
  type InferUITools,
  type ToolUIPart,
  type UIMessage,
} from "ai";

export { BrowserLiveView, type BrowserLiveViewProps } from "./BrowserLiveView";
export { BrowserReplay, type BrowserReplayProps } from "./BrowserReplay";
export {
  WorkspaceExplorer,
  inferWorkspaceLanguage,
  useWorkspace,
  type FileInfo,
  type UseWorkspaceOptions,
  type WorkspaceExplorerProps,
  type WorkspaceFileState,
  type WorkspaceInfo,
  type WorkspaceSource,
  type WorkspaceState,
} from "./WorkspaceExplorer";

type ThinkChatValue = ReturnType<typeof useAgentChat<unknown, UIMessage>>;
type ThinkChatPart = UIMessage["parts"][number];

/* The tool contract comes straight from upstream: `InferUITools` turns
   @cloudflare/think's WorkspaceTools into the typed `tool-*` UI part union,
   so inputs and outputs narrow off `part.type` + `part.state` — no casts. */
type WorkspaceUITools = InferUITools<Required<WorkspaceTools>>;
type WorkspaceToolPart = ToolUIPart<WorkspaceUITools>;
type ThinkWorkspaceToolName = keyof WorkspaceUITools;
type ThinkBashToolPart = Extract<WorkspaceToolPart, { type: "tool-bash" }>;
type ThinkBashToolOutput = WorkspaceUITools["bash"]["output"];

const WORKSPACE_TOOL_NAMES: ReadonlySet<string> = new Set([
  "read",
  "write",
  "edit",
  "list",
  "find",
  "grep",
  "delete",
  "bash",
] satisfies ThinkWorkspaceToolName[]);

function isWorkspaceToolPart(part: ThinkChatPart): part is WorkspaceToolPart {
  return isToolUIPart(part) && WORKSPACE_TOOL_NAMES.has(getToolName(part));
}

/* Skill tools come from agents/skills' SkillRegistry.tools(), which is an
   untyped ToolSet upstream — these mirror its runtime zod schemas. */
type SkillUITools = {
  activate_skill: { input: { name: string }; output: string };
  read_skill_resource: { input: { name?: string; path: string }; output: string };
  run_skill_script: { input: { name: string; path: string; input?: unknown }; output: unknown };
};
type SkillToolPart = ToolUIPart<SkillUITools>;

const SKILL_TOOL_NAMES: ReadonlySet<string> = new Set([
  "activate_skill",
  "read_skill_resource",
  "run_skill_script",
] satisfies (keyof SkillUITools)[]);

function isSkillToolPart(part: ThinkChatPart): part is SkillToolPart {
  return isToolUIPart(part) && SKILL_TOOL_NAMES.has(getToolName(part));
}

/* Think fetch tools: `fetch_url` plus one `fetch_<binding>` per configured
   binding target — matched by prefix. Inputs are untyped upstream (zod at
   runtime); the output is upstream's exported FetchResult. */
type FetchToolPart = ToolUIPart<
  Record<string, { input: { url?: string; path?: string }; output: FetchResult }>
>;

function isFetchToolPart(part: ThinkChatPart): part is FetchToolPart {
  return isToolUIPart(part) && getToolName(part).startsWith("fetch_");
}

/* Browser tools (createBrowserTools): the durable `browser_execute` codemode
   tool — typed by upstream's ProxyToolInput/ProxyToolOutput — plus one
   `browser_<action>` per upstream QuickActionToolName, inputs typed by the
   matching upstream Quick Action input. Quick-action outputs are loose by
   design (bounded strings/arrays/objects, shape degrades under truncation). */
type QuickActionInputs = {
  markdown: QuickActionPage;
  extract: QuickActionExtractInput;
  links: QuickActionPage;
  scrape: QuickActionScrapeInput;
  content: QuickActionPage;
};
type BrowserUITools = {
  browser_execute: { input: ProxyToolInput; output: ProxyToolOutput };
} & {
  [K in QuickActionToolName as `browser_${K}`]: { input: QuickActionInputs[K]; output: unknown };
};
type BrowserToolPart = ToolUIPart<BrowserUITools>;

const BROWSER_TOOL_NAMES: ReadonlySet<string> = new Set([
  "browser_execute",
  "browser_markdown",
  "browser_extract",
  "browser_links",
  "browser_scrape",
  "browser_content",
] satisfies (keyof BrowserUITools)[]);

function isBrowserToolPart(part: ThinkChatPart): part is BrowserToolPart {
  return isToolUIPart(part) && BROWSER_TOOL_NAMES.has(getToolName(part));
}

export interface ThinkChatProviderProps {
  /** The `useAgentChat` value from the `agents` SDK that descendants read. */
  chat: ThinkChatValue;
  children: React.ReactNode;
}

export interface ThinkChatRootProps<State = unknown> {
  /** Agent to connect to: a kebab-case class name, or full `useAgent` options. */
  agent: string | UseAgentOptions<State>;
  /** Instance name (e.g. a session or room id). Wins over `agent.name`. */
  name?: string;
  children: React.ReactNode;
}

export interface ThinkChatMessagesProps extends ThinkChatActivityRendererOptions {
  className?: string;
  /** Disable the composer (e.g. while the agent is unreachable). */
  disabled?: boolean;
  /** Shown in place of the list while there are no messages. */
  emptyState?: React.ReactNode;
  /** Extra controls rendered inside the composer, next to the send button. */
  composerTools?: React.ReactNode;
  /** Composer placeholder text. */
  placeholder?: string;
  /** Rendered after each message (e.g. per-message actions). */
  renderMessageAfter?: AgentChatProps["renderMessageAfter"];
  /** Full replacement for part rendering; wins over excludeTools/toolRenderers. */
  renderPart?: AgentChatProps["renderPart"];
}

/**
 * Bespoke rendering for one tool inside the activity log. Both hooks fall
 * through to the built-in families when they return `undefined`, so an
 * override can adjust just the label or just the panel.
 */
export interface ThinkChatToolRenderer {
  /** One-line step label. `null` hides the step from the log. */
  describe?: (part: ToolUIPart | DynamicToolUIPart) => string | null | undefined;
  /** Expanded detail under the step. `null` keeps the step a plain row. */
  panel?: (part: ToolUIPart | DynamicToolUIPart) => React.ReactNode;
}

export type ThinkChatToolRenderers = Record<string, ThinkChatToolRenderer>;

export interface ThinkChatActivityRendererOptions {
  /**
   * Tool names to keep out of activity folding entirely — the run splits
   * around them and they fall through to your own renderPart / the generic
   * Tool card. For tools that should stay in the log with custom UI, use
   * `toolRenderers` instead.
   */
  excludeTools?: readonly string[];
  /** Per-tool label/panel overrides inside the activity log, keyed by tool name. */
  toolRenderers?: ThinkChatToolRenderers;
}

const ThinkChatContext = React.createContext<ThinkChatValue | null>(null);

function useThinkChatContext(component: string): ThinkChatValue {
  const context = React.useContext(ThinkChatContext);
  if (!context) {
    throw new Error(`${component} must be used inside <ThinkChat.Provider> or <ThinkChat.Root>.`);
  }
  return context;
}

function toAgentChatStatus(chat: ThinkChatValue): AgentChatProps["status"] {
  if (chat.status === "submitted") return "submitted";
  if (chat.isStreaming || chat.isRecovering) return "streaming";
  return chat.status ?? "ready";
}

/**
 * Chat UI for Cloudflare Think agents. Provide a `useAgentChat` value (or let
 * `ThinkChat.Root` create one) and `ThinkChat.Messages` renders the message
 * stream with agent work folded into collapsed Activity blocks.
 */
export function ThinkChatProvider({ chat, children }: ThinkChatProviderProps) {
  return <ThinkChatContext.Provider value={chat}>{children}</ThinkChatContext.Provider>;
}

/**
 * Batteries-included root: connects to the named Think agent (upstream's
 * `useAgent` + `useAgentChat`) and provides the live chat to everything
 * inside. If the app already owns the chat hook, use `ThinkChat.Provider`.
 *
 * @example
 * ```tsx
 * <ThinkChat.Root agent="my-agent" name="session-1">
 *   <ThinkChat.Messages />
 * </ThinkChat.Root>
 * ```
 */
export function ThinkChatRoot<State = unknown>({
  agent: agentOption,
  name,
  children,
}: ThinkChatRootProps<State>) {
  const agent = useAgent<State>(
    typeof agentOption === "string"
      ? { agent: agentOption, name }
      : { ...agentOption, name: name ?? agentOption.name },
  );
  const chat = useAgentChat<State, UIMessage>({ agent });

  return <ThinkChatProvider chat={chat}>{children}</ThinkChatProvider>;
}

/**
 * The full conversation surface — message list plus composer — with the
 * activity renderer as the default `renderPart`: runs of reasoning/tool parts
 * fold into one collapsed Activity block with derived labels and per-tool
 * panels. Extend for app-specific tools with `toolRenderers` (label/panel
 * inside the log) or `excludeTools` + your own `renderPart` (standalone
 * card) — see README "App-specific tools" and the Custom Tool Panel story.
 */
export function ThinkChatMessages({
  renderPart,
  excludeTools,
  toolRenderers,
  ...props
}: ThinkChatMessagesProps) {
  const chat = useThinkChatContext("ThinkChat.Messages");
  const status = toAgentChatStatus(chat);
  const defaultRenderPart = React.useMemo(
    () => createThinkChatActivityRenderer({ excludeTools, toolRenderers }),
    [excludeTools, toolRenderers],
  );

  return (
    <AgentChat
      {...props}
      renderPart={renderPart ?? defaultRenderPart}
      messages={chat.messages}
      status={status}
      onStop={chat.stop}
      onSubmit={({ text }) => {
        const trimmed = text.trim();
        if (trimmed) void chat.sendMessage({ text: trimmed });
      }}
    />
  );
}

/** Agent work (reasoning, tool calls, step boundaries) vs. content shown to the user. */
export function isThinkChatActivityPart(
  part: ThinkChatPart | undefined,
  excludeTools?: ReadonlySet<string>,
): boolean {
  if (part === undefined) return false;
  if (isToolUIPart(part) && excludeTools?.has(getToolName(part))) return false;
  return part.type === "step-start" || isReasoningUIPart(part) || isToolUIPart(part);
}

/** In-flight: the stream opened this part but hasn't delivered its result yet. */
function isPartWorking(part: ThinkChatPart): boolean {
  if (isReasoningUIPart(part)) return part.state === "streaming";
  if (isToolUIPart(part)) {
    return (
      part.state === "input-streaming" ||
      part.state === "input-available" ||
      part.state === "approval-requested"
    );
  }
  return false;
}

/* First non-empty line of the salient string input (script, command, path, query...). */
function summarizeToolInput(input: unknown): string | null {
  if (!input || typeof input !== "object") return null;
  for (const value of Object.values(input)) {
    if (typeof value === "string" && value.trim()) {
      const line = value.trim().split("\n", 1)[0] ?? "";
      return line.length > 64 ? `${line.slice(0, 64)}…` : line;
    }
  }
  return null;
}

/**
 * One-line natural-language label for an activity part ("Ran vp test",
 * "Fetched developers.cloudflare.com/agents/"); `null` for boundaries that
 * aren't steps (step-start). Exported so a custom `renderPart` can reuse the
 * built-in labels for tools it doesn't override.
 */
export function describeThinkChatActivityPart(
  part: ThinkChatPart,
  toolRenderers?: ThinkChatToolRenderers,
): string | null {
  if (isToolUIPart(part)) {
    const custom = toolRenderers?.[getToolName(part)]?.describe?.(part);
    if (custom !== undefined) return custom;
  }
  if (isReasoningUIPart(part)) {
    const snippet = summarizeToolInput({ text: part.text });
    const label = part.state === "streaming" ? "Thinking…" : "Thought";
    return snippet ? `${label} · ${snippet}` : label;
  }
  if (isWorkspaceToolPart(part)) return describeWorkspaceToolPart(part);
  if (isSkillToolPart(part)) return describeSkillToolPart(part);
  if (isFetchToolPart(part)) return describeFetchToolPart(part);
  if (isBrowserToolPart(part)) return describeBrowserToolPart(part);
  if (isToolUIPart(part)) {
    const name = getToolName(part);
    const verb =
      part.state === "output-error" || part.state === "output-denied"
        ? `${name} failed`
        : isPartWorking(part)
          ? `Running ${name}`
          : `Ran ${name}`;
    const detail = summarizeToolInput(part.input);
    return detail ? `${verb} · ${detail}` : verb;
  }
  return null; // step-start and anything unknown: boundary, not a step
}

function basename(path: string | undefined): string | null {
  return path?.split("/").filter(Boolean).at(-1) ?? null;
}

/* Claude Code / Codex-style labels — verb + object, never the raw tool name.
   Rows clamp to one line in CSS, so bash keeps its full command text. */
function describeWorkspaceToolPart(part: WorkspaceToolPart): string {
  const working = isPartWorking(part);
  const failed = part.state === "output-error" || part.state === "output-denied";

  if (part.type === "tool-bash") {
    const command = part.input?.script?.trim() ?? "";
    if (failed) return command ? `Command failed · ${command}` : "Command failed";
    const verb = working ? "Running" : "Ran";
    return command ? `${verb} ${command}` : `${verb} a command`;
  }

  const label = (() => {
    switch (part.type) {
      case "tool-read":
        return `${working ? "Reading" : "Read"} ${basename(part.input?.path) ?? "a file"}`;
      case "tool-write":
        return `${working ? "Writing" : "Wrote"} ${basename(part.input?.path) ?? "a file"}`;
      case "tool-edit":
        return `${working ? "Editing" : "Edited"} ${basename(part.input?.path) ?? "a file"}`;
      case "tool-delete":
        return `${working ? "Deleting" : "Deleted"} ${part.input?.path || "a file"}`;
      case "tool-list": {
        const path = part.input?.path;
        return `${working ? "Listing" : "Listed"} ${path && path !== "/" ? path : "files"}`;
      }
      case "tool-find":
        return `${working ? "Searching" : "Searched"} for ${part.input?.pattern || "files"}`;
      case "tool-grep":
        return `${working ? "Searching" : "Searched"} for ${part.input?.query || "text"}`;
    }
  })();

  return failed ? `${label} · failed` : label;
}

function describeSkillToolPart(part: SkillToolPart): string {
  const working = isPartWorking(part);
  const failed = part.state === "output-error" || part.state === "output-denied";

  const label = (() => {
    switch (part.type) {
      case "tool-activate_skill": {
        const name = part.input?.name;
        return `${working ? "Using" : "Used"} ${name ? `the ${name} skill` : "a skill"}`;
      }
      case "tool-read_skill_resource":
        return `${working ? "Reading" : "Read"} ${part.input?.path ?? "a skill resource"}`;
      case "tool-run_skill_script":
        return `${working ? "Running" : "Ran"} ${part.input?.path ?? "a skill script"}`;
    }
  })();

  return failed ? `${label} · failed` : label;
}

function displayUrl(url: string | undefined): string {
  return url ? url.replace(/^https?:\/\//, "") : "";
}

function describeBrowserToolPart(part: BrowserToolPart): string {
  const working = isPartWorking(part);
  const failed = part.state === "output-error" || part.state === "output-denied";

  if (part.type === "tool-browser_execute") {
    const output = part.state === "output-available" ? part.output : undefined;
    if (failed || output?.status === "error") return "Browser automation failed";
    if (output?.status === "paused") return "Browser waiting for approval";
    return working ? "Using the browser" : "Used the browser";
  }

  const page = displayUrl(part.input?.url) || "a page";
  const label = (() => {
    switch (part.type) {
      case "tool-browser_extract":
        return `${working ? "Extracting" : "Extracted"} data from ${page}`;
      case "tool-browser_links":
        return `${working ? "Listing" : "Listed"} links on ${page}`;
      case "tool-browser_scrape":
        return `${working ? "Scraping" : "Scraped"} ${page}`;
      default:
        return `${working ? "Browsing" : "Browsed"} ${page}`;
    }
  })();
  return failed ? `${label} · failed` : label;
}

function describeFetchToolPart(part: FetchToolPart): string {
  const target = part.input?.url ?? part.input?.path ?? "";
  const output = part.state === "output-available" ? part.output : undefined;
  const failed =
    part.state === "output-error" || part.state === "output-denied" || output?.ok === false;
  if (failed) return target ? `Fetch failed · ${target}` : "Fetch failed";
  const verb = isPartWorking(part) ? "Fetching" : "Fetched";
  return target ? `${verb} ${target}` : `${verb} a URL`;
}

/* Settled header, Claude Code / Codex style: "Read 2 files, searched code and
   ran a command" — derived from what the steps actually were, capped at three
   clauses so the line stays a summary, not an inventory. */
function summarizeActivitySteps(parts: readonly ThinkChatPart[]): string {
  const byTool = new Map<string, number>();
  const otherTools = new Set<string>();
  const skillNames = new Set<string>();
  let thoughts = 0;
  let skillParts = 0;
  let fetches = 0;
  let browses = 0;
  for (const part of parts) {
    if (isReasoningUIPart(part)) thoughts++;
    else if (isWorkspaceToolPart(part)) {
      const name = getToolName(part);
      byTool.set(name, (byTool.get(name) ?? 0) + 1);
    } else if (isSkillToolPart(part)) {
      skillParts++;
      if (typeof part.input?.name === "string") skillNames.add(part.input.name);
    } else if (isFetchToolPart(part)) {
      fetches++;
    } else if (isBrowserToolPart(part)) {
      browses++;
    } else if (isToolUIPart(part)) {
      otherTools.add(getToolName(part));
    }
  }
  const count = (name: ThinkWorkspaceToolName) => byTool.get(name) ?? 0;
  const files = (n: number) => (n === 1 ? "a file" : `${n} files`);

  const reads = count("read");
  const edits = count("edit") + count("write");
  const deletes = count("delete");
  const commands = count("bash");

  const segments: string[] = [];
  if (thoughts > 0) segments.push("thought");
  if (skillParts > 0) {
    segments.push(
      skillNames.size === 1
        ? `used the ${[...skillNames][0]} skill`
        : skillNames.size > 1
          ? `used ${skillNames.size} skills`
          : "used a skill",
    );
  }
  if (reads > 0) segments.push(`read ${files(reads)}`);
  if (edits > 0) segments.push(`edited ${files(edits)}`);
  if (deletes > 0) segments.push(`deleted ${files(deletes)}`);
  if (count("find") + count("grep") > 0) segments.push("searched code");
  if (count("list") > 0) segments.push("listed files");
  if (fetches > 0) segments.push(fetches === 1 ? "fetched a URL" : `fetched ${fetches} URLs`);
  if (browses > 0) segments.push("used the browser");
  if (commands > 0) segments.push(commands === 1 ? "ran a command" : `ran ${commands} commands`);
  for (const tool of otherTools) segments.push(`used ${tool}`);
  if (segments.length === 0) return "Worked";

  // ponytail: extra segments are simply dropped — the expanded log has them all
  const top = segments.slice(0, 3);
  const joined = top.length === 1 ? top[0]! : `${top.slice(0, -1).join(", ")} and ${top.at(-1)}`;
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

export interface ThinkChatActivityProps {
  /** Render with the log expanded. */
  defaultOpen?: boolean;
  parts: readonly ThinkChatPart[];
  /** Defaults to deriving from part states (reasoning streaming, tool awaiting output). */
  isStreaming?: boolean;
  /** Per-tool label/panel overrides, keyed by tool name. */
  toolRenderers?: ThinkChatToolRenderers;
}

/**
 * One run of agent work as a collapsed Activity block: while streaming the
 * label shimmers with the live step; settled, it becomes a short summary
 * ("Thought, read 2 files and ran a command") over an expandable step log
 * with per-tool panels. Normally reached through `ThinkChat.Messages`;
 * exported for apps that lay out messages themselves.
 */
export function ThinkChatActivity({
  parts,
  defaultOpen,
  isStreaming,
  toolRenderers,
}: ThinkChatActivityProps) {
  const steps = parts.flatMap((part, index) => {
    const text = describeThinkChatActivityPart(part, toolRenderers);
    if (!text) return [];
    const key = isToolUIPart(part) ? part.toolCallId : `${part.type}-${index}`;
    return [{ key, text, part }];
  });
  if (steps.length === 0) return null;

  const streaming = isStreaming ?? parts.some(isPartWorking);
  // ponytail: no duration in the label — that needs the app to stamp timestamps
  // into message.metadata (UIMessage carries none by default).
  const settledLabel = summarizeActivitySteps(parts);
  const latest = steps.at(-1);

  return (
    <Activity isStreaming={streaming} defaultOpen={defaultOpen}>
      {/* While streaming, the collapsed line IS the latest step (Codex-style);
          settled, it becomes the short summary. */}
      <ActivityTrigger label={streaming && latest ? latest.text : settledLabel} />
      <ActivityContent>
        {steps.map((step) => (
          <ThinkChatActivityStep
            key={step.key}
            text={step.text}
            part={step.part}
            toolRenderers={toolRenderers}
          />
        ))}
      </ActivityContent>
    </Activity>
  );
}

function ThinkChatActivityStep({
  text,
  part,
  toolRenderers,
}: {
  text: string;
  part: ThinkChatPart;
  toolRenderers?: ThinkChatToolRenderers;
}) {
  if (isToolUIPart(part)) {
    const customPanel = toolRenderers?.[getToolName(part)]?.panel?.(part);
    if (customPanel === null) return <ActivityItem>{text}</ActivityItem>;
    if (customPanel !== undefined) {
      return <ActivityItemGroup label={text}>{customPanel}</ActivityItemGroup>;
    }
  }
  if (isReasoningUIPart(part) && part.text.trim()) {
    return (
      <ActivityItemGroup label={text}>
        <ActivityText>{part.text}</ActivityText>
      </ActivityItemGroup>
    );
  }
  // Delete has nothing to show beyond its row; unknown tools stay plain rows.
  if (isWorkspaceToolPart(part) && part.type !== "tool-delete") {
    return (
      <ActivityItemGroup label={text}>
        <ThinkChatWorkspacePanel part={part} />
      </ActivityItemGroup>
    );
  }
  if (isSkillToolPart(part)) {
    return (
      <ActivityItemGroup label={text}>
        <ThinkChatSkillPanel part={part} />
      </ActivityItemGroup>
    );
  }
  if (isFetchToolPart(part)) {
    return (
      <ActivityItemGroup label={text}>
        <ThinkChatFetchPanel part={part} />
      </ActivityItemGroup>
    );
  }
  if (isBrowserToolPart(part)) {
    return (
      <ActivityItemGroup label={text}>
        <ThinkChatBrowserPanel part={part} />
      </ActivityItemGroup>
    );
  }
  return <ActivityItem>{text}</ActivityItem>;
}

function renderDeniedPanel(label: string, reason?: string) {
  return <ActivityPanel label={label} text={reason} status="denied" error />;
}

function numberLines(content: string, from = 1): string {
  const lines = content.split("\n");
  const width = String(from + lines.length - 1).length;
  return lines.map((line, i) => `${String(from + i).padStart(width)}  ${line}`).join("\n");
}

function prefixLines(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

/** Default panels for the Think workspace tools, Claude Code-style: read/write
    show the file with line numbers, edit shows a mini diff, list/find/grep
    show their result lists, bash gets the shell panel. Everything is typed by
    the upstream tool contract. */
function ThinkChatWorkspacePanel({ part }: { part: WorkspaceToolPart }) {
  if (part.type === "tool-bash") return <ThinkChatShellPanel part={part} />;
  if (part.state === "output-error") {
    return <ActivityPanel label={getToolName(part)} text={part.errorText} status="error" error />;
  }
  if (part.state === "output-denied") {
    return renderDeniedPanel(getToolName(part), part.approval.reason);
  }

  switch (part.type) {
    case "tool-read": {
      const label = part.input?.path ?? "file";
      const output = part.state === "output-available" ? part.output : undefined;
      if (output && "error" in output) {
        return <ActivityPanel label={label} text={output.error} status="error" error />;
      }
      if (output && "content" in output) {
        return (
          <ActivityPanel
            label={label}
            text={output.content}
            status={`${output.totalLines} lines`}
          />
        );
      }
      if (output) {
        return (
          <ActivityPanel
            label={label}
            text={`${output.name} · ${output.mediaType} · ${output.sizeBytes} bytes`}
          />
        );
      }
      return <ActivityPanel label={label} />;
    }
    case "tool-write": {
      const output = part.state === "output-available" ? part.output : undefined;
      return (
        <ActivityPanel
          label={part.input?.path ?? "file"}
          text={part.input?.content ? numberLines(part.input.content) : undefined}
          status={output ? `${output.lines} lines written` : undefined}
        />
      );
    }
    case "tool-edit": {
      const input = part.input;
      const output = part.state === "output-available" ? part.output : undefined;
      const status = !output
        ? undefined
        : output.error
          ? output.error
          : output.created
            ? "created"
            : output.fuzzyMatch
              ? "replaced (fuzzy match)"
              : "replaced";
      return (
        <ActivityPanel label={input?.path ?? "file"} status={status} error={Boolean(output?.error)}>
          {input?.old_string !== undefined && input.new_string !== undefined ? (
            <ActivityOutput>
              <span className="activity__diff-del">{prefixLines(input.old_string, "- ")}</span>
              {"\n"}
              <span className="activity__diff-add">{prefixLines(input.new_string, "+ ")}</span>
            </ActivityOutput>
          ) : null}
        </ActivityPanel>
      );
    }
    case "tool-list": {
      const output = part.state === "output-available" ? part.output : undefined;
      return (
        <ActivityPanel
          label={part.input?.path ?? "/"}
          text={output?.entries.join("\n")}
          status={output ? `${output.count} entries` : undefined}
        />
      );
    }
    // find/grep outputs are Record<string, unknown> upstream — coerce defensively.
    case "tool-find": {
      const output = part.state === "output-available" ? part.output : undefined;
      const files = Array.isArray(output?.files) ? output.files.map(String) : [];
      const count = typeof output?.count === "number" ? output.count : files.length;
      return (
        <ActivityPanel
          label={part.input?.pattern ?? "files"}
          text={files.join("\n")}
          status={output ? `${count} files${output.truncated ? " (truncated)" : ""}` : undefined}
        />
      );
    }
    case "tool-grep": {
      const output = part.state === "output-available" ? part.output : undefined;
      const matches = Array.isArray(output?.matches)
        ? output.matches.map((m) =>
            typeof m === "string" ? m : ((m as { context?: string }).context ?? JSON.stringify(m)),
          )
        : [];
      const status =
        output && typeof output.totalMatches === "number"
          ? `${output.totalMatches} matches in ${String(output.filesWithMatches)} files`
          : undefined;
      return (
        <ActivityPanel
          label={part.input?.query ?? "search"}
          text={matches.join("\n")}
          status={status}
        />
      );
    }
    default:
      return null;
  }
}

/** Skill panels show what the model actually received: the activated skill's
    body, the resource text, or the script result. */
function ThinkChatSkillPanel({ part }: { part: SkillToolPart }) {
  if (part.state === "output-error") {
    return <ActivityPanel label={getToolName(part)} text={part.errorText} status="error" error />;
  }
  if (part.state === "output-denied") {
    return renderDeniedPanel(getToolName(part), part.approval.reason);
  }

  switch (part.type) {
    case "tool-activate_skill": {
      const output = part.state === "output-available" ? part.output : undefined;
      return <ActivityPanel label={part.input?.name ?? "skill"} text={output} />;
    }
    case "tool-read_skill_resource": {
      const output = part.state === "output-available" ? part.output : undefined;
      return <ActivityPanel label={part.input?.path ?? "resource"} text={output} />;
    }
    case "tool-run_skill_script": {
      const output = part.state === "output-available" ? part.output : undefined;
      const text =
        output === undefined
          ? undefined
          : typeof output === "string"
            ? output
            : JSON.stringify(output, null, 2);
      return <ActivityPanel label={part.input?.path ?? "script"} text={text} />;
    }
  }
}

function ThinkChatFetchPanel({ part }: { part: FetchToolPart }) {
  const label = part.input?.url ?? part.input?.path ?? "fetch";
  if (part.state === "output-error") {
    return <ActivityPanel label={label} text={part.errorText} status="error" error />;
  }
  if (part.state === "output-denied") {
    return renderDeniedPanel(label, part.approval.reason);
  }
  const output = part.state === "output-available" ? part.output : undefined;
  if (!output) return <ActivityPanel label={label} />;
  if (!output.ok) {
    return (
      <ActivityPanel
        label={output.finalUrl ?? label}
        text={output.message}
        status={output.code}
        error
      />
    );
  }
  const body =
    output.body ??
    (output.json !== undefined
      ? JSON.stringify(output.json, null, 2)
      : output.path
        ? `saved to ${output.path}`
        : "");
  return (
    <ActivityPanel
      label={output.finalUrl}
      text={body || undefined}
      status={`${output.status} · ${output.bytes} bytes${output.truncated ? " (truncated)" : ""}`}
    />
  );
}

/** Live-view URL / screenshot found inside a browser_execute result. */
interface BrowserResultMedia {
  liveViewUrl?: string;
  expiresInMs?: number;
  screenshot?: string;
}

/* The result of browser code is whatever the model returned — when it
   surfaced a Live View link (cdp.getLiveViewUrl()) or a screenshot data URL,
   render them. Depth-limited defensive walk over an unknown shape. */
function findBrowserResultMedia(value: unknown, depth = 0): BrowserResultMedia {
  const media: BrowserResultMedia = {};
  const visit = (node: unknown, level: number) => {
    if (level > 4 || node === null) return;
    if (typeof node === "string") {
      if (!media.liveViewUrl && node.includes("live.browser.run")) media.liveViewUrl = node;
      else if (!media.screenshot && node.startsWith("data:image/")) media.screenshot = node;
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) visit(item, level + 1);
      return;
    }
    if (typeof node === "object") {
      const record = node as Record<string, unknown>;
      if (
        media.expiresInMs === undefined &&
        typeof record.url === "string" &&
        typeof record.expiresInMs === "number"
      ) {
        media.expiresInMs = record.expiresInMs;
      }
      for (const item of Object.values(record)) visit(item, level + 1);
    }
  };
  visit(value, depth);
  return media;
}

function ThinkChatBrowserPanel({ part }: { part: BrowserToolPart }) {
  // The mint time isn't in the stream; render time is right while streaming
  // and only overshoots for replayed history, where the ended state takes over.
  const [seenAt] = React.useState(() => Date.now());

  if (part.state === "output-error") {
    return <ActivityPanel label="Browser" text={part.errorText} status="error" error />;
  }
  if (part.state === "output-denied") {
    return renderDeniedPanel("Browser", part.approval.reason);
  }

  if (part.type === "tool-browser_execute") {
    const output = part.state === "output-available" ? part.output : undefined;
    const code = part.input?.code ?? "";
    const media = output?.status === "completed" ? findBrowserResultMedia(output.result) : {};
    const hasMedia = Boolean(media.liveViewUrl || media.screenshot);
    const sections = [
      output && "logs" in output && output.logs?.length ? output.logs.join("\n") : "",
      output?.status === "error" ? output.error : "",
      // Once media was pulled from the result, don't also dump it as JSON —
      // that's the live-view shape / screenshot data URI rendered above.
      output?.status === "completed" && output.result !== undefined && !hasMedia
        ? typeof output.result === "string"
          ? output.result
          : JSON.stringify(output.result, null, 2)
        : "",
    ].filter(Boolean);
    const status = !output
      ? undefined
      : output.status === "paused"
        ? "paused · needs approval"
        : output.status === "error"
          ? "error"
          : "completed";

    const browserView = media.liveViewUrl ? (
      <BrowserLiveView
        url={media.liveViewUrl}
        expiresAt={seenAt + (media.expiresInMs ?? 5 * 60 * 1000)}
        fallback={
          media.screenshot ? <img src={media.screenshot} alt="Last browser state" /> : undefined
        }
      />
    ) : media.screenshot ? (
      <img
        className="activity__browser-screenshot"
        src={media.screenshot}
        alt="Browser screenshot"
      />
    ) : null;
    const codeView = (
      <>
        {code ? <CodeBlock className="activity__code-block" code={code} language="js" /> : null}
        {sections.length ? <ActivityOutput>{sections.join("\n\n")}</ActivityOutput> : null}
      </>
    );

    return (
      <ActivityPanel label="Browser" status={status} error={output?.status === "error"}>
        {browserView && (code || sections.length) ? (
          <Tabs className="activity__browser-tabs" defaultValue="browser">
            <TabsList variant="line">
              <Tab value="browser">Preview</Tab>
              <Tab value="code">Code</Tab>
            </TabsList>
            <TabPanel value="browser">{browserView}</TabPanel>
            <TabPanel value="code">{codeView}</TabPanel>
          </Tabs>
        ) : (
          <>
            {browserView}
            {code || sections.length ? codeView : null}
          </>
        )}
      </ActivityPanel>
    );
  }

  const output = part.state === "output-available" ? part.output : undefined;
  const label = displayUrl(part.input?.url) || "page";
  const text =
    output === undefined
      ? undefined
      : typeof output === "string"
        ? output
        : Array.isArray(output)
          ? output
              .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
              .join("\n")
          : JSON.stringify(output, null, 2);
  const status =
    part.type === "tool-browser_links" && Array.isArray(output)
      ? `${output.length} links`
      : undefined;
  return <ActivityPanel label={label} text={text} status={status} />;
}

function ThinkChatShellPanel({ part }: { part: ThinkBashToolPart }) {
  const output = part.state === "output-available" ? part.output : undefined;
  const errorText = part.state === "output-error" ? part.errorText : "";
  const deniedReason = part.state === "output-denied" ? (part.approval.reason ?? "denied") : "";
  const failed =
    Boolean(errorText) ||
    Boolean(deniedReason) ||
    (output !== undefined && (output.exitCode !== 0 || Boolean(output.errors?.length)));
  const text = formatBashPanelText(part.input, output, errorText || deniedReason);

  return (
    <ActivityPanel
      label="Shell"
      text={text}
      status={
        output !== undefined || errorText || deniedReason
          ? getBashStatusText(output, errorText, deniedReason)
          : undefined
      }
      error={failed}
    />
  );
}

function ThinkChatActivityGroup({
  message,
  parts,
  isTrailing,
  toolRenderers,
}: {
  message: UIMessage;
  parts: readonly ThinkChatPart[];
  isTrailing: boolean;
  toolRenderers?: ThinkChatToolRenderers;
}) {
  // Optional context: with a live chat we also know "still generating" during the
  // gap between one tool's output and the next part opening.
  const chat = React.useContext(ThinkChatContext);
  const chatStillWorking =
    isTrailing && Boolean(chat?.isStreaming) && chat?.messages.at(-1)?.id === message.id;

  return (
    <ThinkChatActivity
      parts={parts}
      isStreaming={parts.some(isPartWorking) || chatStillWorking}
      toolRenderers={toolRenderers}
    />
  );
}

/**
 * Builds a renderPart handler that folds every run of consecutive activity
 * parts (reasoning + tool calls) into one collapsed Activity box. Everything
 * is derived from the UIMessage stream: part order, tool states, reasoning
 * state. Excluded tools split the run and return undefined so your own
 * renderPart (or the generic Tool card) takes over for them.
 */
export function createThinkChatActivityRenderer({
  excludeTools,
  toolRenderers,
}: ThinkChatActivityRendererOptions = {}): NonNullable<AgentChatProps["renderPart"]> {
  const excluded = excludeTools?.length ? new Set(excludeTools) : undefined;
  const isActivity = (part: ThinkChatPart | undefined) => isThinkChatActivityPart(part, excluded);

  return (context: AgentChatRenderPartContext): React.ReactNode | undefined => {
    const { message, part, partIndex } = context;
    if (!isActivity(part)) return undefined;

    let start = partIndex;
    while (start > 0 && isActivity(message.parts[start - 1])) start--;
    if (partIndex !== start) return null; // the group renders once, at its first part

    let end = partIndex;
    while (end + 1 < message.parts.length && isActivity(message.parts[end + 1])) end++;

    return (
      <ThinkChatActivityGroup
        message={message}
        parts={message.parts.slice(start, end + 1)}
        isTrailing={end === message.parts.length - 1}
        toolRenderers={toolRenderers}
      />
    );
  };
}

/** Default activity renderer — `createThinkChatActivityRenderer()` with no overrides. */
export const renderThinkChatActivityPart = createThinkChatActivityRenderer();

/**
 * The ambient chat value from `ThinkChat.Root`/`Provider` — for custom tool
 * panels, cards, or composer actions that need `messages`, `status`, or
 * `sendMessage`. Throws outside a provider.
 */
export function useThinkChat() {
  return useThinkChatContext("useThinkChat");
}

/**
 * Namespace entry point. `Root` + `Messages` is the standard surface;
 * `Provider` + `useThinkChat` when the app owns the chat hook; `Activity`,
 * `renderActivityPart`, and `createActivityRenderer` for custom layouts and
 * app-specific tools.
 */
export const ThinkChat = {
  Provider: ThinkChatProvider,
  Root: ThinkChatRoot,
  Messages: ThinkChatMessages,
  Activity: ThinkChatActivity,
  renderActivityPart: renderThinkChatActivityPart,
  createActivityRenderer: createThinkChatActivityRenderer,
};

function formatBashPanelText(
  input: ThinkBashToolPart["input"],
  output: ThinkBashToolOutput | undefined,
  errorText: string,
) {
  const script = input?.script?.trim() ? `$ bash\n${input.script}` : "";
  return [
    script,
    output?.stdout,
    output?.stderr,
    errorText,
    output?.skippedFiles?.length ? ["skipped files", ...output.skippedFiles].join("\n") : "",
    output?.errors?.length ? ["sync errors", ...output.errors].join("\n") : "",
    output ? formatChangedFiles(output.changedFiles) : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function formatChangedFiles(changedFiles: ThinkBashToolOutput["changedFiles"] | undefined) {
  if (!changedFiles) return "";
  const lines = [
    ...changedFiles.created.map((path) => `created ${path}`),
    ...changedFiles.updated.map((path) => `updated ${path}`),
    ...changedFiles.deleted.map((path) => `deleted ${path}`),
    ...changedFiles.directoriesCreated.map((path) => `created directory ${path}`),
    ...changedFiles.directoriesDeleted.map((path) => `deleted directory ${path}`),
  ];
  return lines.length ? ["workspace changes", ...lines].join("\n") : "";
}

function getBashStatusText(
  output: ThinkBashToolOutput | undefined,
  errorText: string,
  deniedReason: string,
) {
  if (errorText) return "error";
  if (deniedReason) return "denied";
  if (output?.errors?.length) return "sync errors";
  if (output && output.exitCode !== 0) return `exit ${output.exitCode}`;
  return "success";
}
