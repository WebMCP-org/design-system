import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState, type ComponentProps } from "react";
import {
  readUIMessageStream,
  simulateReadableStream,
  type UIMessage,
  type UIMessageChunk,
} from "ai";
import { ThinkChat } from "./index";

const chat = {
  id: "storybook",
  status: "ready",
  isServerStreaming: false,
  isStreaming: false,
  isRecovering: false,
  isToolContinuation: false,
  connectionError: null,
  error: undefined,
  messages: [
    {
      id: "u1",
      role: "user",
      parts: [{ type: "text", text: "Create a quick integration checklist." }],
    },
    {
      id: "a1",
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Start with the Worker binding, add the Vite `think()` plugin, then connect the React route.",
        },
      ],
    },
  ],
  setMessages: () => undefined,
  sendMessage: async () => undefined,
  regenerate: async () => undefined,
  stop: async () => undefined,
  resumeStream: async () => undefined,
  clearError: () => undefined,
  addToolResult: () => undefined,
  addToolOutput: () => undefined,
  addToolApprovalResponse: () => undefined,
  clearHistory: () => undefined,
} satisfies ComponentProps<typeof ThinkChat.Provider>["chat"];

const bashChat = {
  ...chat,
  messages: [
    {
      id: "u1",
      role: "user",
      parts: [{ type: "text", text: "Run the workspace checks." }],
    },
    {
      id: "a1",
      role: "assistant",
      parts: [
        {
          type: "tool-bash",
          state: "output-available",
          toolCallId: "call-bash-checks",
          input: { script: "vp check --fix\nvp test", cwd: "/" },
          output: {
            stdout: "checked 74 files\n\n354 tests passed",
            stderr: "",
            exitCode: 0,
            changedFiles: {
              created: [],
              updated: ["packages/think-chat/src/index.tsx"],
              deleted: [],
              directoriesCreated: [],
              directoriesDeleted: [],
            },
          },
        },
        {
          type: "text",
          text: "Checks are green.",
        },
      ],
    },
  ],
} satisfies ComponentProps<typeof ThinkChat.Provider>["chat"];

const meta = {
  title: "Packages/Think Chat",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "min(48rem, 92vw)",
        height: "34rem",
        border:
          "var(--sigvelo-border-style) var(--sigvelo-border-width) var(--sigvelo-color-neutral-border-subtle)",
        borderRadius: "var(--sigvelo-radius-md)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export const Basic: Story = {
  render: () => (
    <Frame>
      <ThinkChat.Provider chat={chat}>
        <ThinkChat.Messages placeholder="Ask your Think agent..." />
      </ThinkChat.Provider>
    </Frame>
  ),
};

export const ActivityWithShell: Story = {
  render: () => (
    <Frame>
      <ThinkChat.Provider chat={bashChat}>
        <ThinkChat.Messages placeholder="Ask your Think agent..." />
      </ThinkChat.Provider>
    </Frame>
  ),
};

/* A pretend page.screenshot() result — any `data:image/` string, exactly what
   findBrowserResultMedia picks out of a browser_execute result. */
const BROWSER_SCREENSHOT =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750">` +
      `<rect width="1200" height="750" fill="#f8fafc"/>` +
      `<rect width="1200" height="56" fill="#ffffff"/>` +
      `<rect x="24" y="18" width="260" height="20" rx="10" fill="#e2e8f0"/>` +
      `<rect x="360" y="150" width="480" height="330" rx="16" fill="#ffffff" stroke="#e2e8f0"/>` +
      `<text x="400" y="225" font-family="system-ui" font-size="30" font-weight="700" fill="#0f172a">Checkout</text>` +
      `<text x="400" y="265" font-family="system-ui" font-size="16" fill="#475569">Order #4821 — 3 items, ships today</text>` +
      `<rect x="400" y="390" width="170" height="44" rx="8" fill="#111827"/>` +
      `<text x="428" y="418" font-family="system-ui" font-size="16" fill="#ffffff">Place order</text>` +
      `</svg>`,
  );

/* The exact chunk sequence an agent emits over the wire (UI message stream
   protocol): reasoning deltas, streamed tool inputs, tool outputs, then text.
   Covers every tool family this package gives bespoke UI to: skills,
   workspace (bash/grep/read/edit), fetch, and browser (browser_execute with
   Live View + screenshot, plus quick actions). */
const TOKEN_STREAM: UIMessageChunk[] = [
  { type: "start", messageId: "a-stream" },
  { type: "start-step" },
  { type: "reasoning-start", id: "r1" },
  { type: "reasoning-delta", id: "r1", delta: "The user wants the workspace checked. " },
  { type: "reasoning-delta", id: "r1", delta: "List the files first, then run the checks." },
  { type: "reasoning-end", id: "r1" },
  { type: "tool-input-start", toolCallId: "t0", toolName: "activate_skill" },
  {
    type: "tool-input-available",
    toolCallId: "t0",
    toolName: "activate_skill",
    input: { name: "frontend-design" },
  },
  {
    type: "tool-output-available",
    toolCallId: "t0",
    output:
      "# Frontend design\n\nUse the design tokens for every color and spacing value.\n\nBundled resources:\n- references/tokens.md",
  },
  { type: "tool-input-start", toolCallId: "t1", toolName: "bash" },
  { type: "tool-input-delta", toolCallId: "t1", inputTextDelta: '{"script":"ls -la",' },
  { type: "tool-input-delta", toolCallId: "t1", inputTextDelta: '"cwd":"/"}' },
  {
    type: "tool-input-available",
    toolCallId: "t1",
    toolName: "bash",
    input: { script: "ls -la", cwd: "/" },
  },
  {
    type: "tool-output-available",
    toolCallId: "t1",
    output: {
      stdout: "src/\npackage.json",
      stderr: "",
      exitCode: 0,
      changedFiles: {
        created: [],
        updated: [],
        deleted: [],
        directoriesCreated: [],
        directoriesDeleted: [],
      },
    },
  },
  { type: "tool-input-start", toolCallId: "t3", toolName: "grep" },
  {
    type: "tool-input-available",
    toolCallId: "t3",
    toolName: "grep",
    input: { query: "ActivityItem", include: "**/*.tsx" },
  },
  {
    type: "tool-output-available",
    toolCallId: "t3",
    output: {
      query: "ActivityItem",
      filesSearched: 12,
      filesWithMatches: 2,
      totalMatches: 2,
      matches: [
        "src/components/Activity.tsx:156: export function ActivityItem({",
        "src/stories/Activity.stories.tsx:24: <ActivityItem>Searched code</ActivityItem>",
      ],
    },
  },
  { type: "tool-input-start", toolCallId: "t4", toolName: "read" },
  {
    type: "tool-input-available",
    toolCallId: "t4",
    toolName: "read",
    input: { path: "/src/components/Activity.tsx", offset: 156, limit: 4 },
  },
  {
    type: "tool-output-available",
    toolCallId: "t4",
    output: {
      path: "/src/components/Activity.tsx",
      content: "export function ActivityItem({\n  className,\n  icon,\n  children,",
      totalLines: 214,
      fromLine: 156,
      toLine: 159,
    },
  },
  { type: "tool-input-start", toolCallId: "t5", toolName: "edit" },
  {
    type: "tool-input-available",
    toolCallId: "t5",
    toolName: "edit",
    input: {
      path: "/src/components/Activity.tsx",
      old_string: "align-items: baseline;",
      new_string: "align-items: center;",
    },
  },
  {
    type: "tool-output-available",
    toolCallId: "t5",
    output: { path: "/src/components/Activity.tsx", replaced: true, lines: 214 },
  },
  { type: "tool-input-start", toolCallId: "t6", toolName: "fetch_url" },
  {
    type: "tool-input-available",
    toolCallId: "t6",
    toolName: "fetch_url",
    input: { url: "https://developers.cloudflare.com/agents/" },
  },
  {
    type: "tool-output-available",
    toolCallId: "t6",
    output: {
      ok: true,
      status: 200,
      finalUrl: "https://developers.cloudflare.com/agents/",
      contentType: "text/markdown",
      bytes: 18452,
      truncated: false,
      response: "text",
      body: "# Cloudflare Agents\n\nBuild AI agents on Workers with durable state and tool calling.",
    },
  },
  { type: "tool-input-start", toolCallId: "t7", toolName: "browser_execute" },
  {
    type: "tool-input-available",
    toolCallId: "t7",
    toolName: "browser_execute",
    input: {
      code: 'const page = await browser.newPage();\nawait page.goto("https://example.com/checkout");\nreturn {\n  liveView: await cdp.getLiveViewUrl(),\n  screenshot: `data:image/png;base64,${await page.screenshot({ encoding: "base64" })}`,\n};',
    },
  },
  {
    type: "tool-output-available",
    toolCallId: "t7",
    output: {
      status: "completed",
      logs: ["navigated to https://example.com/checkout"],
      // Upstream BrowserLiveViewUrl shape ({ url, targetId, expiresInMs });
      // short TTL so the story demos the degrade to the screenshot fallback.
      result: {
        liveView: {
          url: "https://live.browser.run/session/storybook-demo",
          targetId: "page-1",
          expiresInMs: 4_000,
        },
        screenshot: BROWSER_SCREENSHOT,
      },
    },
  },
  { type: "tool-input-start", toolCallId: "t8", toolName: "browser_markdown" },
  {
    type: "tool-input-available",
    toolCallId: "t8",
    toolName: "browser_markdown",
    input: { url: "https://example.com/checkout" },
  },
  {
    type: "tool-output-available",
    toolCallId: "t8",
    output: "# Checkout\n\nOrder #4821 — 3 items, ships today.\n\n- Place order",
  },
  { type: "tool-input-start", toolCallId: "t9", toolName: "browser_links" },
  {
    type: "tool-input-available",
    toolCallId: "t9",
    toolName: "browser_links",
    input: { url: "https://example.com/checkout" },
  },
  {
    type: "tool-output-available",
    toolCallId: "t9",
    output: [
      "https://example.com/cart",
      "https://example.com/checkout/shipping",
      "https://example.com/support",
    ],
  },
  { type: "tool-input-start", toolCallId: "t2", toolName: "bash" },
  {
    type: "tool-input-available",
    toolCallId: "t2",
    toolName: "bash",
    input: {
      script:
        "pnpm exec vp check --fix packages/react-components packages/think-chat && pnpm exec vitest run --reporter=verbose",
      cwd: "/",
    },
  },
  {
    type: "tool-output-available",
    toolCallId: "t2",
    output: {
      stdout: "checked 74 files\n354 tests passed",
      stderr: "",
      exitCode: 0,
      changedFiles: {
        created: [],
        updated: ["packages/think-chat/src/index.tsx"],
        deleted: [],
        directoriesCreated: [],
        directoriesDeleted: [],
      },
    },
  },
  { type: "finish-step" },
  { type: "start-step" },
  { type: "text-start", id: "x1" },
  { type: "text-delta", id: "x1", delta: "Everything checks out — " },
  {
    type: "text-delta",
    id: "x1",
    delta: "74 files linted, 354 tests passed, and the checkout page renders correctly.",
  },
  { type: "text-end", id: "x1" },
  { type: "finish-step" },
  { type: "finish" },
];

function TokenStreamDemo() {
  const [assistant, setAssistant] = useState<UIMessage | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stream = simulateReadableStream({
        chunks: TOKEN_STREAM,
        initialDelayInMs: 800,
        chunkDelayInMs: 300,
      });
      for await (const snapshot of readUIMessageStream({ stream })) {
        if (cancelled) return;
        setAssistant(snapshot);
      }
      if (!cancelled) setDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const messages: UIMessage[] = [
    { id: "u1", role: "user", parts: [{ type: "text", text: "Run the workspace checks." }] },
    ...(assistant ? [assistant] : []),
  ];
  const streamingChat = {
    ...chat,
    messages,
    isStreaming: !done,
    status: done ? ("ready" as const) : ("streaming" as const),
  };

  return (
    <Frame>
      <ThinkChat.Provider chat={streamingChat}>
        <ThinkChat.Messages placeholder="Ask your Think agent..." />
      </ThinkChat.Provider>
    </Frame>
  );
}

/**
 * Nothing here is hardcoded UI state: a real `UIMessageChunk` token stream is
 * replayed through the AI SDK's `readUIMessageStream`, and the Working box,
 * its items, and the settled label are all derived from `message.parts`.
 * Every bespoke tool family streams through: skill activation, workspace
 * shell/search/read/edit, fetch, and the browser tools — `browser_execute`
 * surfaces a Live View (degrading to its screenshot after the short demo TTL)
 * and the markdown/links quick actions render as quiet panels.
 */
export const ActivityFromTokenStream: Story = {
  render: () => <TokenStreamDemo />,
};
