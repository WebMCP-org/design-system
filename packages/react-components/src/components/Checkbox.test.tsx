import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Checkbox } from "./Checkbox.js";

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

test("renders shadcn-compatible checkbox anatomy", () => {
  const mounted = mount(
    <Checkbox checked onCheckedChange={() => {}} aria-invalid="true" aria-label="Accept terms" />,
  );

  const checkbox = mounted.container.querySelector("[data-slot='checkbox']");
  expect(checkbox?.getAttribute("role")).toBe("checkbox");
  expect(checkbox?.hasAttribute("data-checked")).toBe(true);
  expect(checkbox?.getAttribute("aria-invalid")).toBe("true");
  expect(mounted.container.querySelector("[data-slot='checkbox-indicator']")).not.toBeNull();
  mounted.cleanup();
});
