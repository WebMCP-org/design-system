import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog.js";

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

test("renders shadcn-compatible dialog anatomy", () => {
  const mounted = mount(
    <Dialog open>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Project settings</DialogTitle>
          <DialogDescription>Update project metadata.</DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>,
  );

  expect(mounted.container.querySelector("[data-slot='dialog-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dialog-overlay']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dialog-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dialog-header']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dialog-title']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dialog-description']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dialog-footer']")).not.toBeNull();
  expect(document.querySelector("[data-slot='dialog-close']")).not.toBeNull();
  mounted.cleanup();
});
