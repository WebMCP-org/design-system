import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Menubar } from "./Menubar.js";

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

test("renders shadcn-compatible menubar anatomy", () => {
  const mounted = mount(
    <Menubar.Root>
      <Menubar.Menu open>
        <Menubar.Trigger>View</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Group>
            <Menubar.Label inset>Options</Menubar.Label>
            <Menubar.CheckboxItem checked>Show sidebar</Menubar.CheckboxItem>
            <Menubar.RadioGroup value="system">
              <Menubar.RadioItem value="system">System</Menubar.RadioItem>
            </Menubar.RadioGroup>
            <Menubar.Separator />
            <Menubar.Item inset variant="destructive">
              Reset layout
              <Menubar.Shortcut>R</Menubar.Shortcut>
            </Menubar.Item>
          </Menubar.Group>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>,
  );

  const item = document.querySelector("[data-slot='menubar-item']");
  const label = document.querySelector("[data-slot='menubar-label']");

  expect(mounted.container.querySelector("[data-slot='menubar']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='menubar-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='menubar-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='menubar-group']")).not.toBeNull();
  expect(label?.getAttribute("data-inset")).toBe("true");
  expect(document.querySelector("[data-slot='menubar-checkbox-item']")).not.toBeNull();
  expect(document.querySelector("[data-slot='menubar-radio-group']")).not.toBeNull();
  expect(document.querySelector("[data-slot='menubar-radio-item']")).not.toBeNull();
  expect(document.querySelector("[data-slot='menubar-separator']")).not.toBeNull();
  expect(document.querySelector("[data-slot='menubar-shortcut']")).not.toBeNull();
  expect(item?.getAttribute("data-inset")).toBe("true");
  expect(item?.getAttribute("data-variant")).toBe("destructive");
  mounted.cleanup();
});

test("renders shadcn-compatible submenu slots", () => {
  const mounted = mount(
    <Menubar.Root>
      <Menubar.Menu open>
        <Menubar.Trigger>File</Menubar.Trigger>
        <Menubar.Content>
          <Menubar.Sub open>
            <Menubar.SubTrigger>Open recent</Menubar.SubTrigger>
            <Menubar.SubContent>
              <Menubar.Item>Project A</Menubar.Item>
            </Menubar.SubContent>
          </Menubar.Sub>
        </Menubar.Content>
      </Menubar.Menu>
    </Menubar.Root>,
  );

  expect(document.querySelector("[data-slot='menubar-sub-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='menubar-sub-content']")).not.toBeNull();
  mounted.cleanup();
});
