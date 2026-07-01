import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Tab, TabPanel, Tabs, TabsList } from "./Tabs.js";

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

test("renders shadcn-compatible tabs anatomy and list variants", () => {
  const mounted = mount(
    <Tabs defaultValue="account" orientation="vertical">
      <TabsList variant="line">
        <Tab value="account">Account</Tab>
        <Tab value="billing">Billing</Tab>
      </TabsList>
      <TabPanel value="account">Account content</TabPanel>
      <TabPanel value="billing">Billing content</TabPanel>
    </Tabs>,
  );

  const root = mounted.container.querySelector("[data-slot='tabs']");
  const list = mounted.container.querySelector("[data-slot='tabs-list']");
  const triggers = mounted.container.querySelectorAll("[data-slot='tabs-trigger']");

  expect(root?.getAttribute("data-orientation")).toBe("vertical");
  expect(list?.getAttribute("data-variant")).toBe("line");
  expect(list?.classList.contains("tabs__list--line")).toBe(true);
  expect(triggers).toHaveLength(2);
  expect(mounted.container.querySelector("[data-slot='tabs-content']")).not.toBeNull();

  act(() => {
    triggers[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(triggers[1]?.getAttribute("aria-selected")).toBe("true");
  mounted.cleanup();
});
