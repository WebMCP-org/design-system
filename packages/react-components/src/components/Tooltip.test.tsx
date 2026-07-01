import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip.js";

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

test("renders shadcn-compatible tooltip shorthand anatomy", () => {
  const mounted = mount(
    <TooltipProvider delayDuration={0}>
      <Tooltip open>
        <TooltipTrigger>Save</TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          Save changes
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );

  expect(mounted.container.querySelector("[data-slot='tooltip-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='tooltip-content']")?.textContent).toContain(
    "Save changes",
  );
  expect(document.querySelector("[data-slot='tooltip-arrow']")).not.toBeNull();
  mounted.cleanup();
});
