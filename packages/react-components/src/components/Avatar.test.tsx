import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Avatar } from "./Avatar.js";

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

test("renders shadcn-compatible avatar anatomy", () => {
  const mounted = mount(
    <Avatar.Root size="lg">
      <Avatar.Fallback>AN</Avatar.Fallback>
      <Avatar.Badge />
    </Avatar.Root>,
  );

  const avatar = mounted.container.querySelector("[data-slot='avatar']");
  expect(avatar?.getAttribute("data-size")).toBe("lg");
  expect(mounted.container.querySelector("[data-slot='avatar-fallback']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='avatar-badge']")).not.toBeNull();
  mounted.cleanup();
});

test("renders shadcn-compatible avatar group anatomy", () => {
  const mounted = mount(
    <Avatar.Group>
      <Avatar.Root size="sm">
        <Avatar.Fallback>AN</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.GroupCount>+3</Avatar.GroupCount>
    </Avatar.Group>,
  );

  expect(mounted.container.querySelector("[data-slot='avatar-group']")).not.toBeNull();
  expect(mounted.container.querySelector("[data-slot='avatar-group-count']")).not.toBeNull();
  mounted.cleanup();
});
