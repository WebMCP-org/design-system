import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Separator } from "./Separator.js";

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

test("matches shadcn separator defaults", () => {
  const mounted = mount(<Separator orientation="vertical" />);

  const separator = mounted.container.querySelector(".separator");
  expect(separator?.getAttribute("data-slot")).toBe("separator");
  expect(separator?.getAttribute("data-orientation")).toBe("vertical");
  expect(separator?.getAttribute("role")).toBe("none");
  expect(separator?.getAttribute("aria-orientation")).toBeNull();
  expect(separator?.className).toContain("separator--vertical");
  mounted.cleanup();
});

test("keeps semantic separator behavior when decorative is disabled", () => {
  const mounted = mount(<Separator decorative={false} orientation="vertical" />);

  const separator = mounted.container.querySelector(".separator");
  expect(separator?.getAttribute("role")).toBe("separator");
  expect(separator?.getAttribute("aria-orientation")).toBe("vertical");
  mounted.cleanup();
});
