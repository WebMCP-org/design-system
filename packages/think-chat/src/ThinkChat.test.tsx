import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import type { UIMessage } from "ai";
import {
  createThinkChatActivityRenderer,
  renderThinkChatActivityPart,
  ThinkChatActivity,
} from "./index.js";

test("renders Think bash inside Activity from upstream input and output", () => {
  const part = {
    type: "tool-bash",
    state: "output-available",
    toolCallId: "call-bash",
    input: { script: "vp test", cwd: "/" },
    output: {
      stdout: "354 tests passed",
      stderr: "",
      exitCode: 0,
      changedFiles: {
        created: [],
        updated: ["/packages/think-chat/src/index.tsx"],
        deleted: [],
        directoriesCreated: [],
        directoriesDeleted: [],
      },
      skippedFiles: ["/large.bin"],
      errors: ["Failed to create directory /readonly: denied"],
    },
  } satisfies UIMessage["parts"][number];

  const html = renderToStaticMarkup(<ThinkChatActivity parts={[part]} defaultOpen />);

  expect(html).toContain("activity");
  expect(html).toContain("Ran vp test");
  expect(html).not.toContain('class="tool');
  expect(html).not.toContain("terminal");
});

test("derives streaming state from streamed part states", () => {
  const midStream: UIMessage["parts"] = [
    { type: "step-start" },
    { type: "reasoning", text: "List files, then run checks.", state: "done" },
    {
      type: "tool-bash",
      state: "input-available",
      toolCallId: "t1",
      input: { script: "vp test", cwd: "/" },
    },
  ];

  const working = renderToStaticMarkup(<ThinkChatActivity parts={midStream} />);
  expect(working).toContain("data-streaming");
  // Collapsed streaming line IS the latest step, not a generic "Working…"
  expect(working).toContain("Running vp test");

  const settled = renderToStaticMarkup(
    <ThinkChatActivity
      parts={[
        { type: "step-start" },
        { type: "reasoning", text: "List files, then run checks.", state: "done" },
        {
          type: "tool-bash",
          state: "output-available",
          toolCallId: "t1",
          input: { script: "vp test", cwd: "/" },
          output: {
            stdout: "ok",
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
      ]}
    />,
  );
  expect(settled).not.toContain("data-streaming");
  expect(settled).toContain("Thought and ran a command");
});

test("renderActivityPart folds consecutive activity parts into one group", () => {
  const message = {
    id: "a1",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "thinking", state: "done" },
      {
        type: "tool-bash",
        state: "output-available",
        toolCallId: "t1",
        input: { script: "ls", cwd: "/" },
        output: {
          stdout: "src/",
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
      { type: "text", text: "Done." },
    ],
  } as UIMessage;

  const render = (partIndex: number) =>
    renderThinkChatActivityPart({
      message,
      part: message.parts[partIndex]!,
      partIndex,
      defaultRender: () => null,
    });

  const group = render(0);
  expect(group).not.toBeNull();
  const html = renderToStaticMarkup(<>{group}</>);
  // Collapsed panel is unmounted; only the summary line renders.
  expect(html).toContain("Thought and ran a command");

  expect(render(1)).toBeNull(); // already rendered with the group
  expect(render(2)).toBeUndefined(); // text falls through to the default renderer
});

test("skill and fetch tools get derived labels and default panels", () => {
  const parts = [
    {
      type: "tool-activate_skill",
      state: "output-available",
      toolCallId: "s1",
      input: { name: "frontend-design" },
      output: "# Frontend design\nUse the design tokens.",
    },
    {
      type: "tool-fetch_url",
      state: "output-available",
      toolCallId: "f1",
      input: { url: "https://developers.cloudflare.com/agents/" },
      output: {
        ok: true,
        status: 200,
        finalUrl: "https://developers.cloudflare.com/agents/",
        contentType: "text/html",
        bytes: 12345,
        truncated: false,
        response: "text",
        body: "Agents docs body",
      },
    },
  ] as UIMessage["parts"];

  const collapsed = renderToStaticMarkup(<ThinkChatActivity parts={parts} />);
  expect(collapsed).toContain("Used the frontend-design skill and fetched a URL");

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<ThinkChatActivity parts={parts} defaultOpen />);
  });
  for (const trigger of container.querySelectorAll<HTMLButtonElement>(".activity__group-trigger")) {
    act(() => {
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  const open = container.innerHTML;
  expect(open).toContain("Use the design tokens.");
  expect(open).toContain("Agents docs body");
  expect(open).toContain("200 · 12345 bytes");

  act(() => {
    root.unmount();
  });
  container.remove();
});

test("browser tools get derived labels, live view, and default panels", () => {
  const parts = [
    {
      type: "tool-browser_execute",
      state: "output-available",
      toolCallId: "b1",
      input: { code: "const targets = await cdp.send('Target.getTargets');\nreturn targets;" },
      output: {
        status: "completed",
        executionId: "exec-1",
        result: {
          liveView: { url: "https://live.browser.run/session/abc?mode=tab", expiresInMs: 300000 },
        },
        logs: ["attached to page"],
      },
    },
    {
      type: "tool-browser_markdown",
      state: "output-available",
      toolCallId: "b2",
      input: { url: "https://example.com" },
      output: "# Example Domain\n\nThis domain is for use in examples.",
    },
  ] as UIMessage["parts"];

  const collapsed = renderToStaticMarkup(<ThinkChatActivity parts={parts} />);
  expect(collapsed).toContain("Used the browser"); // one segment covers all browser steps

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<ThinkChatActivity parts={parts} defaultOpen />);
  });
  for (const trigger of container.querySelectorAll<HTMLButtonElement>(".activity__group-trigger")) {
    act(() => {
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  const open = container.innerHTML;
  expect(open).toContain("browser-live-view__frame"); // the live iframe renders
  expect(open).toContain("https://live.browser.run/session/abc?mode=tab");
  expect(open).toContain("completed");
  expect(open).toContain("# Example Domain"); // quick-action markdown panel

  // browser_execute splits into Browser/Code tabs; code + logs sit behind Code
  const codeTab = [...container.querySelectorAll<HTMLButtonElement>(".tabs__tab")].find(
    (tab) => tab.textContent === "Code",
  );
  expect(codeTab).toBeDefined();
  act(() => {
    codeTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  const codePanel = container.innerHTML;
  expect(codePanel).toContain("code-block"); // the driving code, syntax-highlightable
  expect(codePanel).toContain("Target.getTargets");
  expect(codePanel).toContain("attached to page"); // logs

  act(() => {
    root.unmount();
  });
  container.remove();
});

test("workspace tools get derived labels and default panels", () => {
  const parts = [
    {
      type: "tool-read",
      state: "output-available",
      toolCallId: "r1",
      input: { path: "/src/components/Activity.tsx" },
      output: {
        path: "/src/components/Activity.tsx",
        content: "1\tline one\n2\tline two",
        totalLines: 2,
      },
    },
    {
      type: "tool-edit",
      state: "output-available",
      toolCallId: "e1",
      input: { path: "/src/index.ts", old_string: "a", new_string: "b" },
      output: { path: "/src/index.ts", replaced: true, lines: 3 },
    },
    {
      type: "tool-grep",
      state: "output-available",
      toolCallId: "g1",
      input: { query: "foo" },
      output: {
        query: "foo",
        filesSearched: 3,
        filesWithMatches: 1,
        totalMatches: 1,
        matches: ["src/a.ts:1: foo"],
      },
    },
  ] as UIMessage["parts"];

  const collapsed = renderToStaticMarkup(<ThinkChatActivity parts={parts} />);
  expect(collapsed).toContain("Read a file, edited a file and searched code");

  // Expand every step to reach the level-2 panels (unmounted while closed)
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<ThinkChatActivity parts={parts} defaultOpen />);
  });
  for (const trigger of container.querySelectorAll<HTMLButtonElement>(".activity__group-trigger")) {
    act(() => {
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }

  const open = container.innerHTML;
  expect(open).toContain("Read Activity.tsx");
  expect(open).toContain("1\tline one"); // upstream read content is already numbered
  expect(open).toContain("activity__diff-del");
  expect(open).toContain("+ b"); // mini diff
  expect(open).toContain("replaced");
  expect(open).toContain("1 matches in 1 files");

  act(() => {
    root.unmount();
  });
  container.remove();
});

test("toolRenderers override labels and panels per tool", () => {
  const parts = [
    {
      type: "tool-nanite_complete",
      state: "output-available",
      toolCallId: "t1",
      input: { summary: "All done" },
      output: "ok",
    },
  ] as UIMessage["parts"];

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <ThinkChatActivity
        parts={parts}
        defaultOpen
        toolRenderers={{
          nanite_complete: {
            describe: () => "Marked the run complete",
            panel: () => <div className="lifecycle-panel">All done</div>,
          },
        }}
      />,
    );
  });
  for (const trigger of container.querySelectorAll<HTMLButtonElement>(".activity__group-trigger")) {
    act(() => {
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  }
  expect(container.innerHTML).toContain("Marked the run complete");
  expect(container.innerHTML).toContain("lifecycle-panel");
  act(() => {
    root.unmount();
  });
  container.remove();

  // A null panel keeps the step a plain row; undefined falls to built-ins.
  const plainRow = renderToStaticMarkup(
    <ThinkChatActivity
      parts={parts}
      defaultOpen
      toolRenderers={{ nanite_complete: { panel: () => null } }}
    />,
  );
  expect(plainRow).toContain("Ran nanite_complete");
  expect(plainRow).not.toContain("lifecycle-panel");
});

test("excluded tools split the activity run and fall through to renderPart", () => {
  const message = {
    id: "a1",
    role: "assistant",
    parts: [
      { type: "reasoning", text: "thinking", state: "done" },
      {
        type: "tool-nanite_complete",
        state: "output-available",
        toolCallId: "t1",
        input: {},
        output: "ok",
      },
      { type: "reasoning", text: "wrapping up", state: "done" },
    ],
  } as UIMessage;

  const render = createThinkChatActivityRenderer({ excludeTools: ["nanite_complete"] });
  const call = (partIndex: number) =>
    render({ message, part: message.parts[partIndex]!, partIndex, defaultRender: () => null });

  // The excluded tool is not an activity part: the app's own renderPart takes it.
  expect(call(1)).toBeUndefined();
  // Each reasoning part starts its own group because the run is split.
  expect(call(0)).not.toBeNull();
  expect(call(2)).not.toBeNull();
});
