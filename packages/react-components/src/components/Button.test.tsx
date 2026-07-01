import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Button, buttonVariants } from "./Button.js";

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

test("maps shadcn button variants and sizes", () => {
  expect(buttonVariants({ variant: "secondary" })).toContain("button--neutral");
  expect(buttonVariants({ variant: "destructive" })).toContain("button--destructive");
  expect(buttonVariants({ size: "icon-sm" })).toContain("button--icon-sm");

  const mounted = mount(
    <Button variant="secondary" size="icon-sm" aria-label="Settings">
      S
    </Button>,
  );

  const button = mounted.container.querySelector("button");
  expect(button?.dataset.slot).toBe("button");
  expect(button?.className).toContain("button--neutral");
  expect(button?.className).toContain("button--icon-sm");
  mounted.cleanup();
});

test("keeps button semantics when a render override substitutes a non-button element", () => {
  const mounted = mount(
    <Button variant="outline" render={<a href="/docs" />}>
      Docs
    </Button>,
  );

  // A `render` override renders the anchor, not a native <button>...
  const anchor = mounted.container.querySelector("a");
  expect(anchor?.dataset.slot).toBe("button");
  expect(anchor?.className).toContain("button--outline");
  expect(mounted.container.querySelector("button")).toBeNull();
  // ...and `nativeButton` defaults to false, so Base UI adds explicit button semantics to the
  // anchor instead of warning about lost native semantics.
  expect(anchor?.getAttribute("role")).toBe("button");
  mounted.cleanup();
});
