import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { FileTree, FileTreeFile, FileTreeFolder } from "./FileTree.js";

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

test("selects folders on click while preserving expansion", () => {
  const selected: string[] = [];
  let expanded = new Set<string>();
  const mounted = mount(
    <FileTree
      onSelect={(path) => selected.push(path)}
      onExpandedChange={(next) => (expanded = next)}
    >
      <FileTreeFolder path="src" name="src">
        <FileTreeFile path="src/index.ts" name="index.ts" />
      </FileTreeFolder>
    </FileTree>,
  );

  const button = mounted.container.querySelector<HTMLButtonElement>(".file-tree__node--folder");
  if (!button) throw new Error("Folder button did not render.");

  act(() => {
    button.click();
  });

  expect(selected).toEqual(["src"]);
  expect(expanded.has("src")).toBe(true);
  mounted.cleanup();
});

test("selects folders with keyboard activation", () => {
  const selected: string[] = [];
  const mounted = mount(
    <FileTree onSelect={(path) => selected.push(path)}>
      <FileTreeFolder path="src" name="src">
        <FileTreeFile path="src/index.ts" name="index.ts" />
      </FileTreeFolder>
    </FileTree>,
  );

  const button = mounted.container.querySelector<HTMLButtonElement>(".file-tree__node--folder");
  if (!button) throw new Error("Folder button did not render.");

  act(() => {
    button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  });

  expect(selected).toEqual(["src"]);
  mounted.cleanup();
});

test("marks selected folders", () => {
  const mounted = mount(
    <FileTree selectedPath="src">
      <FileTreeFolder path="src" name="src">
        <FileTreeFile path="src/index.ts" name="index.ts" />
      </FileTreeFolder>
    </FileTree>,
  );

  expect(mounted.container.querySelector('[role="treeitem"]')?.getAttribute("aria-selected")).toBe(
    "true",
  );
  mounted.cleanup();
});
