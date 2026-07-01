import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { NavigationMenu } from "./NavigationMenu.js";

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

test("renders shadcn-compatible navigation menu anatomy", async () => {
  const mounted = mount(
    <NavigationMenu.Root value="products">
      <NavigationMenu.List>
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="#analytics">Analytics</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>,
  );

  await nextFrame();

  expect(mounted.container.querySelector("[data-slot='navigation-menu']")).not.toBeNull();
  expect(
    mounted.container.querySelector("[data-slot='navigation-menu']")?.getAttribute("data-viewport"),
  ).toBe("true");
  expect(mounted.container.querySelector("[data-slot='navigation-menu-list']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='navigation-menu-item']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='navigation-menu-trigger']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='navigation-menu-icon']")).not.toBeNull();
  expect(document.querySelector("[data-slot='navigation-menu-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='navigation-menu-link']")).not.toBeNull();
  expect(document.querySelector("[data-slot='navigation-menu-portal']")).not.toBeNull();
  expect(document.querySelector("[data-slot='navigation-menu-positioner']")).not.toBeNull();
  expect(document.querySelector("[data-slot='navigation-menu-popup']")).not.toBeNull();
  expect(document.querySelector("[data-slot='navigation-menu-viewport']")).not.toBeNull();
  mounted.cleanup();
});

test("keeps explicit navigation menu portal and icon anatomy", async () => {
  const mounted = mount(
    <NavigationMenu.Root value="products">
      <NavigationMenu.List>
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger>
            Products
            <NavigationMenu.Icon className="custom-icon">v</NavigationMenu.Icon>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="#analytics">Analytics</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>,
  );

  await nextFrame();

  expect(document.querySelectorAll("[data-slot='navigation-menu-portal']")).toHaveLength(1);
  expect(document.querySelectorAll("[data-slot='navigation-menu-viewport']")).toHaveLength(1);
  expect(mounted.container.querySelectorAll("[data-slot='navigation-menu-icon']")).toHaveLength(1);
  expect(mounted.container.querySelector(".custom-icon")).not.toBeNull();
  mounted.cleanup();
});
