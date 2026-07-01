import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Toggle } from "./Toggle.js";

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

test("renders shadcn-compatible toggle anatomy and variants", () => {
  const mounted = mount(
    <Toggle
      aria-label="Bold"
      aria-invalid="true"
      className="custom-toggle"
      defaultPressed
      size="sm"
      variant="outline"
    />,
  );

  const toggle = mounted.container.querySelector<HTMLButtonElement>("[data-slot='toggle']");
  expect(toggle?.getAttribute("aria-pressed")).toBe("true");
  expect(toggle?.getAttribute("aria-invalid")).toBe("true");
  expect(toggle?.classList.contains("toggle--outline")).toBe(true);
  expect(toggle?.classList.contains("toggle--sm")).toBe(true);
  expect(toggle?.classList.contains("custom-toggle")).toBe(true);

  act(() => {
    toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(toggle?.getAttribute("aria-pressed")).toBe("false");
  mounted.cleanup();
});
