import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./AlertDialog.js";

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

test("renders shadcn-compatible alert dialog anatomy", () => {
  const mounted = mount(
    <AlertDialog open>
      <AlertDialogTrigger>Open</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia />
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>,
  );

  expect(mounted.container.querySelector("[data-slot='alert-dialog-trigger']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-overlay']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-content']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-header']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-media']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-title']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-description']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-footer']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-cancel']")).not.toBeNull();
  expect(document.querySelector("[data-slot='alert-dialog-action']")).not.toBeNull();
  mounted.cleanup();
});
