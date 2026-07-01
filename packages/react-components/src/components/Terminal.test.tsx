import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Terminal } from "./Terminal.js";

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

test("renders upstream default terminal anatomy", () => {
  const mounted = mount(<Terminal output="npm test" />);

  expect(mounted.container.textContent).toContain("Terminal");
  expect(mounted.container.textContent).toContain("npm test");
  expect(mounted.container.querySelector(".terminal__copy")).not.toBeNull();
  mounted.cleanup();
});

test("includes clear action in the default anatomy when clear is available", () => {
  const mounted = mount(<Terminal output="npm test" onClear={() => undefined} />);

  expect(mounted.container.querySelector(".terminal__clear")).not.toBeNull();
  mounted.cleanup();
});
