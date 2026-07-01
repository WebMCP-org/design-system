import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./Popover.js";

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

test("renders shadcn-compatible popover shorthand anatomy", () => {
  const mounted = mount(
    <Popover open>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Settings</PopoverTitle>
          <PopoverDescription>Update preferences.</PopoverDescription>
        </PopoverHeader>
        <PopoverClose>Done</PopoverClose>
      </PopoverContent>
    </Popover>,
  );

  expect(mounted.container.querySelector("[data-slot='popover-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='popover-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='popover-header']")).not.toBeNull();
  expect(document.querySelector("[data-slot='popover-title']")).not.toBeNull();
  expect(document.querySelector("[data-slot='popover-description']")).not.toBeNull();
  expect(document.querySelector("[data-slot='popover-close']")).not.toBeNull();
  mounted.cleanup();
});
