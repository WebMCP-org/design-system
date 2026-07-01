import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { ScrollArea } from "./ScrollArea.js";

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

async function nextFrame() {
  await act(async () => {
    await new Promise(requestAnimationFrame);
  });
}

afterEach(() => {
  document.body.innerHTML = "";
});

test("renders shadcn-compatible default scroll area anatomy", async () => {
  const mounted = mount(
    <ScrollArea style={{ height: 40, width: 120 }}>
      <div style={{ height: 120 }}>Scrollable content</div>
    </ScrollArea>,
  );

  await nextFrame();

  expect(mounted.container.querySelector("[data-slot='scroll-area']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='scroll-area-viewport']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='scroll-area-viewport']")?.textContent).toBe(
    "Scrollable content",
  );
  mounted.cleanup();
});

test("keeps existing compound scroll area anatomy", () => {
  const mounted = mount(
    <ScrollArea className="custom-root">
      <ScrollArea.Viewport className="custom-viewport">Scrollable content</ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="custom-scrollbar" keepMounted>
        <ScrollArea.Thumb className="custom-thumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea>,
  );

  expect(mounted.container.querySelector(".custom-root")?.getAttribute("data-slot")).toBe(
    "scroll-area",
  );
  expect(mounted.container.querySelectorAll("[data-slot='scroll-area-viewport']")).toHaveLength(1);
  expect(mounted.container.querySelector(".custom-viewport")).not.toBeNull();
  expect(mounted.container.querySelector(".custom-scrollbar")?.getAttribute("data-slot")).toBe(
    "scroll-area-scrollbar",
  );
  expect(mounted.container.querySelector(".custom-thumb")?.getAttribute("data-slot")).toBe(
    "scroll-area-thumb",
  );
  mounted.cleanup();
});
