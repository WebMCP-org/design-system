import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { AgentChat, type AgentChatMessage } from "./AgentChat.js";

function mount(ui: ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });

  return {
    container,
    cleanup() {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

afterEach(() => {
  document.body.innerHTML = "";
});

test("renders text, reasoning, and generic tool parts", () => {
  const messages: AgentChatMessage[] = [
    { id: "u1", role: "user", parts: [{ type: "text", text: "Check the repo." }] },
    {
      id: "a1",
      role: "assistant",
      parts: [
        { type: "reasoning", text: "Inspect scripts first.", state: "done" },
        {
          type: "tool-read",
          state: "output-available",
          toolCallId: "call-read-package-json",
          input: { path: "package.json" },
          output: { ok: true },
        },
        { type: "text", text: "Run `vp check`." },
      ],
    },
  ];

  const mounted = mount(<AgentChat messages={messages} onSubmit={() => undefined} />);

  expect(mounted.container.textContent).toContain("Check the repo.");
  expect(mounted.container.querySelector(".reasoning")).not.toBeNull();
  expect(mounted.container.querySelector(".tool")).not.toBeNull();
  expect(mounted.container.textContent).toContain("Run");
  mounted.cleanup();
});
