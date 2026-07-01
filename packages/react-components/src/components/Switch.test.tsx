import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Switch, SwitchThumb } from "./Switch.js";

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

test("renders shadcn-compatible switch anatomy by default", () => {
  const mounted = mount(
    <Switch checked onCheckedChange={() => {}} aria-invalid="true" aria-label="Two factor" />,
  );

  const root = mounted.container.querySelector("[data-slot='switch']");
  expect(root?.getAttribute("role")).toBe("switch");
  expect(root?.getAttribute("data-size")).toBe("default");
  expect(root?.hasAttribute("data-checked")).toBe(true);
  expect(root?.getAttribute("aria-invalid")).toBe("true");
  expect(mounted.container.querySelector("[data-slot='switch-thumb']")).not.toBeNull();
  mounted.cleanup();
});

test("keeps explicit switch thumb children", () => {
  const mounted = mount(
    <Switch aria-label="Custom switch">
      <SwitchThumb className="custom-thumb" />
    </Switch>,
  );

  expect(mounted.container.querySelectorAll("[data-slot='switch-thumb']")).toHaveLength(1);
  expect(mounted.container.querySelector(".custom-thumb")).not.toBeNull();
  mounted.cleanup();
});
