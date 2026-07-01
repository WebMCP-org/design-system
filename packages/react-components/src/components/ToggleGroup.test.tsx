import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup.js";

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

test("renders shadcn-compatible toggle group anatomy and item variants", () => {
  const mounted = mount(
    <ToggleGroup defaultValue={["center"]} size="sm" spacing={2} variant="outline">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
    </ToggleGroup>,
  );

  const group = mounted.container.querySelector<HTMLElement>("[data-slot='toggle-group']");
  const items = mounted.container.querySelectorAll<HTMLButtonElement>(
    "[data-slot='toggle-group-item']",
  );

  expect(group?.getAttribute("data-size")).toBe("sm");
  expect(group?.getAttribute("data-variant")).toBe("outline");
  expect(group?.getAttribute("data-spacing")).toBe("2");
  expect(group?.style.gap).toBe("0.5rem");
  expect(items).toHaveLength(2);
  expect(items[1]?.getAttribute("aria-pressed")).toBe("true");
  expect(items[1]?.classList.contains("toggle--outline")).toBe(true);
  expect(items[1]?.classList.contains("toggle--sm")).toBe(true);

  act(() => {
    items[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(items[0]?.getAttribute("aria-pressed")).toBe("true");
  mounted.cleanup();
});
