import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  Activity,
  ActivityContent,
  ActivityItem,
  ActivityItemGroup,
  ActivityTrigger,
} from "./Activity.js";

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

function buildActivity(isStreaming: boolean) {
  return (
    <Activity isStreaming={isStreaming}>
      <ActivityTrigger />
      <ActivityContent>
        <ActivityItem>Searched code</ActivityItem>
        <ActivityItem>Edited a file</ActivityItem>
      </ActivityContent>
    </Activity>
  );
}

test("collapsed activity is a single line and expands to the full log", () => {
  const mounted = mount(buildActivity(true));

  const rootEl = mounted.container.querySelector(".activity");
  expect(rootEl?.hasAttribute("data-streaming")).toBe(true);

  const trigger = mounted.container.querySelector<HTMLButtonElement>(".activity__trigger");
  expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  expect(mounted.container.querySelector(".activity__list")).toBeNull();

  act(() => {
    trigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(trigger?.getAttribute("aria-expanded")).toBe("true");
  const list = mounted.container.querySelector(".activity__list");
  expect(list?.textContent).toContain("Searched code");
  expect(list?.textContent).toContain("Edited a file");
  mounted.cleanup();
});

test("settled activity drops the streaming attribute", () => {
  const mounted = mount(buildActivity(false));

  expect(mounted.container.querySelector(".activity")?.hasAttribute("data-streaming")).toBe(false);
  mounted.cleanup();
});

test("item groups expand in place", () => {
  const mounted = mount(
    <Activity isStreaming defaultOpen>
      <ActivityTrigger />
      <ActivityContent>
        <ActivityItem>Searched code</ActivityItem>
        <ActivityItemGroup label="Ran bash · vp test">
          <div className="nested-detail">354 tests passed</div>
        </ActivityItemGroup>
      </ActivityContent>
    </Activity>,
  );

  const groupTrigger = mounted.container.querySelector<HTMLButtonElement>(
    ".activity__group-trigger",
  );
  expect(groupTrigger?.getAttribute("aria-expanded")).toBe("false");
  expect(mounted.container.querySelector(".nested-detail")).toBeNull();

  act(() => {
    groupTrigger?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(groupTrigger?.getAttribute("aria-expanded")).toBe("true");
  expect(mounted.container.querySelector(".nested-detail")?.textContent).toBe("354 tests passed");
  mounted.cleanup();
});
