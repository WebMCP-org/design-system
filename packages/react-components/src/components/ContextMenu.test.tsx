import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { ContextMenu } from "./ContextMenu.js";

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

test("renders shadcn-compatible context menu anatomy", async () => {
  const mounted = mount(
    <ContextMenu.Root open>
      <ContextMenu.Trigger>
        <div>Target</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Group>
          <ContextMenu.Label inset>Options</ContextMenu.Label>
          <ContextMenu.CheckboxItem checked>Show grid</ContextMenu.CheckboxItem>
          <ContextMenu.RadioGroup value="date">
            <ContextMenu.RadioItem value="date">Date</ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
          <ContextMenu.Separator />
          <ContextMenu.Item inset variant="destructive">
            Delete
            <ContextMenu.Shortcut>D</ContextMenu.Shortcut>
          </ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Content>
    </ContextMenu.Root>,
  );

  await nextFrame();

  const item = document.querySelector("[data-slot='context-menu-item']");
  const label = document.querySelector("[data-slot='context-menu-label']");

  expect(mounted.container.querySelector("[data-slot='context-menu-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='context-menu-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='context-menu-group']")).not.toBeNull();
  expect(label?.getAttribute("data-inset")).toBe("true");
  expect(document.querySelector("[data-slot='context-menu-checkbox-item']")).not.toBeNull();
  expect(document.querySelector("[data-slot='context-menu-radio-group']")).not.toBeNull();
  expect(document.querySelector("[data-slot='context-menu-radio-item']")).not.toBeNull();
  expect(document.querySelector("[data-slot='context-menu-separator']")).not.toBeNull();
  expect(document.querySelector("[data-slot='context-menu-shortcut']")).not.toBeNull();
  expect(document.body.textContent).toContain("Show grid");
  expect(document.body.textContent).toContain("Date");
  expect(item?.getAttribute("data-inset")).toBe("true");
  expect(item?.getAttribute("data-variant")).toBe("destructive");
  mounted.cleanup();
});

test("renders shadcn-compatible context submenu slots", async () => {
  const mounted = mount(
    <ContextMenu.Root open>
      <ContextMenu.Trigger>
        <div>Target</div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Sub open>
          <ContextMenu.SubTrigger>More</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item>Nested</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>
      </ContextMenu.Content>
    </ContextMenu.Root>,
  );

  await nextFrame();

  expect(document.querySelector("[data-slot='context-menu-sub-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='context-menu-sub-content']")).not.toBeNull();
  mounted.cleanup();
});
