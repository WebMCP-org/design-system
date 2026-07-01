import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  Context,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextTrigger,
} from "./Context.js";

function mount(ui: ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });

  return {
    container,
    root,
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

test("supports upstream custom trigger children", () => {
  const mounted = mount(
    <Context maxTokens={100} usedTokens={25}>
      <ContextTrigger>
        <button type="button">Custom context trigger</button>
      </ContextTrigger>
    </Context>,
  );

  expect(mounted.container.textContent).toContain("Custom context trigger");
  expect(mounted.container.textContent).not.toContain("25%");
  mounted.cleanup();
});

test("uses custom content children instead of default context rows", () => {
  const mounted = mount(
    <Context maxTokens={100} totalCostUsd={1.25} usedTokens={25} usage={{ inputTokens: 10 }}>
      <ContextContentHeader>Custom header</ContextContentHeader>
      <ContextContentBody>
        <ContextInputUsage>Custom input usage</ContextInputUsage>
      </ContextContentBody>
      <ContextContentFooter>Custom footer</ContextContentFooter>
    </Context>,
  );

  expect(mounted.container.textContent).toContain("Custom header");
  expect(mounted.container.textContent).toContain("Custom input usage");
  expect(mounted.container.textContent).toContain("Custom footer");
  expect(mounted.container.textContent).not.toContain("Context usage");
  expect(mounted.container.textContent).not.toContain("Total");
  mounted.cleanup();
});
