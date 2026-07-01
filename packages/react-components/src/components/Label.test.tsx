import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Label } from "./Label.js";

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

test("renders shadcn label slot", () => {
  const mounted = mount(<Label htmlFor="email">Email</Label>);

  const label = mounted.container.querySelector("label");
  expect(label?.getAttribute("data-slot")).toBe("label");
  expect(label?.getAttribute("for")).toBe("email");
  mounted.cleanup();
});

test("matches Radix label mouse down behavior", () => {
  let mouseDowns = 0;
  const mounted = mount(<Label onMouseDown={() => (mouseDowns += 1)}>Name</Label>);
  const label = mounted.container.querySelector("label");

  const event = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    detail: 2,
  });

  const dispatched = label?.dispatchEvent(event);

  expect(mouseDowns).toBe(1);
  expect(dispatched).toBe(false);
  expect(event.defaultPrevented).toBe(true);
  mounted.cleanup();
});

test("does not block mouse down events that start on nested controls", () => {
  let mouseDowns = 0;
  const mounted = mount(
    <Label onMouseDown={() => (mouseDowns += 1)}>
      <input type="checkbox" />
      Updates
    </Label>,
  );
  const input = mounted.container.querySelector("input");

  const event = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    detail: 2,
  });

  const dispatched = input?.dispatchEvent(event);

  expect(mouseDowns).toBe(0);
  expect(dispatched).toBe(true);
  expect(event.defaultPrevented).toBe(false);
  mounted.cleanup();
});
