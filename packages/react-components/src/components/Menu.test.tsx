import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Menu } from "./Menu.js";

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

test("renders shadcn-compatible dropdown menu anatomy", async () => {
  const mounted = mount(
    <Menu.Root open>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Group>
          <Menu.Label inset>Options</Menu.Label>
          <Menu.CheckboxItem checked>Show grid</Menu.CheckboxItem>
          <Menu.RadioGroup value="date">
            <Menu.RadioItem value="date">Date</Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Separator />
          <Menu.Item inset variant="destructive">
            Delete
            <Menu.Shortcut>D</Menu.Shortcut>
          </Menu.Item>
        </Menu.Group>
      </Menu.Content>
    </Menu.Root>,
  );

  await nextFrame();

  const item = document.querySelector("[data-slot='dropdown-menu-item']");
  const label = document.querySelector("[data-slot='dropdown-menu-label']");

  expect(mounted.container.querySelector("[data-slot='dropdown-menu-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dropdown-menu-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dropdown-menu-group']")).not.toBeNull();
  expect(label?.getAttribute("data-inset")).toBe("true");
  expect(document.querySelector("[data-slot='dropdown-menu-checkbox-item']")).not.toBeNull();
  expect(
    document.querySelector("[data-slot='dropdown-menu-checkbox-item-indicator']"),
  ).not.toBeNull();
  expect(document.querySelector("[data-slot='dropdown-menu-radio-group']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dropdown-menu-radio-item']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dropdown-menu-radio-item-indicator']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dropdown-menu-separator']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dropdown-menu-shortcut']")).not.toBeNull();
  expect(document.body.textContent).toContain("Show grid");
  expect(document.body.textContent).toContain("Date");
  expect(item?.getAttribute("data-inset")).toBe("true");
  expect(item?.getAttribute("data-variant")).toBe("destructive");
  mounted.cleanup();
});

test("preserves explicit dropdown menu item indicators", async () => {
  const mounted = mount(
    <Menu.Root open>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.CheckboxItem checked>
          <Menu.CheckboxItemIndicator className="custom-check" />
          Show grid
        </Menu.CheckboxItem>
        <Menu.RadioGroup value="date">
          <Menu.RadioItem value="date">
            <Menu.RadioItemIndicator className="custom-radio" />
            Date
          </Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>,
  );

  await nextFrame();

  expect(
    document.querySelectorAll("[data-slot='dropdown-menu-checkbox-item-indicator']"),
  ).toHaveLength(1);
  expect(
    document.querySelector("[data-slot='dropdown-menu-checkbox-item-indicator']")?.className,
  ).toContain("custom-check");
  expect(
    document.querySelectorAll("[data-slot='dropdown-menu-radio-item-indicator']"),
  ).toHaveLength(1);
  expect(
    document.querySelector("[data-slot='dropdown-menu-radio-item-indicator']")?.className,
  ).toContain("custom-radio");
  expect(document.body.textContent).toContain("Show grid");
  expect(document.body.textContent).toContain("Date");
  mounted.cleanup();
});

test("renders shadcn-compatible dropdown submenu slots", async () => {
  const mounted = mount(
    <Menu.Root open>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Sub open>
          <Menu.SubTrigger>More</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item>Nested</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
      </Menu.Content>
    </Menu.Root>,
  );

  await nextFrame();

  expect(document.querySelector("[data-slot='dropdown-menu-sub-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dropdown-menu-sub-content']")).not.toBeNull();
  mounted.cleanup();
});
