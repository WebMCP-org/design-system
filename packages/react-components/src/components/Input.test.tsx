import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Input } from "./Input.js";

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

test("renders shadcn-compatible input attributes", () => {
  const mounted = mount(<Input type="file" aria-label="Upload file" />);

  const input = mounted.container.querySelector("input");
  expect(input?.dataset.slot).toBe("input");
  expect(input?.type).toBe("file");
  expect(input?.className).toContain("input");
  mounted.cleanup();
});

test("passes invalid state through to the native input", () => {
  const mounted = mount(<Input aria-invalid="true" aria-label="Email" />);

  const input = mounted.container.querySelector("input");
  expect(input?.getAttribute("aria-invalid")).toBe("true");
  mounted.cleanup();
});
