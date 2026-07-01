import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Collapsible } from "./Collapsible.js";

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

test("renders shadcn-compatible collapsible anatomy and toggles", () => {
  const mounted = mount(
    <Collapsible.Root>
      <Collapsible.Trigger>Toggle details</Collapsible.Trigger>
      <Collapsible.Content>Details</Collapsible.Content>
    </Collapsible.Root>,
  );

  const root = mounted.container.querySelector("[data-slot='collapsible']");
  const trigger = mounted.container.querySelector<HTMLButtonElement>(
    "[data-slot='collapsible-trigger']",
  );

  expect(root).not.toBeNull();
  expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  expect(mounted.container.querySelector("[data-slot='collapsible-content']")).toBeNull();

  act(() => {
    trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(trigger?.getAttribute("aria-expanded")).toBe("true");
  expect(mounted.container.querySelector("[data-slot='collapsible-content']")).not.toBeNull();
  mounted.cleanup();
});
