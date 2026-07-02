import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import {
  WorkspaceExplorer,
  inferWorkspaceLanguage,
  useWorkspace,
  type FileInfo,
  type WorkspaceSource,
} from "./WorkspaceExplorer";

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

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

function entry(path: string, type: FileInfo["type"]): FileInfo {
  return {
    path,
    name: path.split("/").at(-1) ?? path,
    type,
    mimeType: type === "file" ? "text/plain" : "inode/directory",
    size: 0,
    createdAt: 0,
    updatedAt: 0,
  };
}

function createFakeSource() {
  const listings: Record<string, FileInfo[]> = {
    "/": [entry("/src", "directory"), entry("/readme.md", "file"), entry("/logo.png", "file")],
    "/src": [entry("/src/index.ts", "file")],
  };
  const calls: string[] = [];
  // WorkspaceSource is upstream's full Workspace/WorkspaceLike shape; the
  // explorer only calls these three methods, so the fake stubs just those.
  const source = {
    readDir: (dir = "/") => {
      calls.push(`readDir ${dir}`);
      return Promise.resolve(listings[dir] ?? []);
    },
    readFile: (path: string) => {
      calls.push(`readFile ${path}`);
      if (path === "/src/index.ts") return Promise.resolve("export const x = 1;");
      if (path === "/logo.png") return Promise.resolve(null); // binary
      return Promise.reject(new Error("boom"));
    },
    getWorkspaceInfo: () =>
      Promise.resolve({ fileCount: 3, directoryCount: 1, totalBytes: 64, r2FileCount: 0 }),
  } as WorkspaceSource;
  return { source, calls };
}

function Harness({ source }: { source: WorkspaceSource }) {
  const workspace = useWorkspace({ source, root: "/" });
  return <WorkspaceExplorer workspace={workspace} />;
}

test("loads the root, lazily loads expanded directories, and previews files", async () => {
  const { source, calls } = createFakeSource();
  const mounted = mount(<Harness source={source} />);
  await flush();

  expect(calls).toEqual(["readDir /"]);
  expect(mounted.container.textContent).toContain("3 files"); // getWorkspaceInfo chip
  const nodeNames = () =>
    [...mounted.container.querySelectorAll(".file-tree__name")].map((node) => node.textContent);
  expect(nodeNames()).toEqual(["src", "logo.png", "readme.md"]);

  // Expanding a folder loads its children exactly once.
  const folder = mounted.container.querySelector<HTMLButtonElement>(".file-tree__node--folder");
  if (!folder) throw new Error("Folder did not render.");
  await act(async () => folder.click());
  await flush();
  expect(calls).toContain("readDir /src");
  expect(nodeNames()).toEqual(["src", "index.ts", "logo.png", "readme.md"]);

  const readDirCalls = () => calls.filter((call) => call.startsWith("readDir")).length;
  const loadedDirs = readDirCalls();
  await act(async () => folder.click()); // collapse
  await act(async () => folder.click()); // re-expand: cached, no new readDir call
  await flush();
  expect(readDirCalls()).toBe(loadedDirs);

  // Selecting a file switches to the preview with its content.
  const file = [...mounted.container.querySelectorAll<HTMLButtonElement>(".file-tree__node")].find(
    (node) => node.textContent?.includes("index.ts"),
  );
  if (!file) throw new Error("File did not render.");
  await act(async () => file.click());
  await flush();
  expect(calls).toContain("readFile /src/index.ts");
  expect(mounted.container.textContent).toContain("/src/index.ts");
  expect(mounted.container.querySelector(".workspace-explorer__code")).not.toBeNull();

  // Back returns to the tree with the selection retained.
  const back = mounted.container.querySelector<HTMLButtonElement>('[aria-label="Back to files"]');
  if (!back) throw new Error("Back button did not render.");
  await act(async () => back.click());
  expect(mounted.container.querySelector("[data-selected]")).not.toBeNull();

  mounted.cleanup();
});

test("shows per-file read errors in the preview", async () => {
  const { source } = createFakeSource();
  const mounted = mount(<Harness source={source} />);
  await flush();

  const file = [...mounted.container.querySelectorAll<HTMLButtonElement>(".file-tree__node")].find(
    (node) => node.textContent?.includes("readme.md"),
  );
  if (!file) throw new Error("File did not render.");
  await act(async () => file.click());
  await flush();

  expect(mounted.container.textContent).toContain("Could not preview this file: boom");
  mounted.cleanup();
});

test("null readFile results render as a no-preview state, upstream-style", async () => {
  const { source } = createFakeSource();
  const mounted = mount(<Harness source={source} />);
  await flush();

  const file = [...mounted.container.querySelectorAll<HTMLButtonElement>(".file-tree__node")].find(
    (node) => node.textContent?.includes("logo.png"),
  );
  if (!file) throw new Error("File did not render.");
  await act(async () => file.click());
  await flush();

  expect(mounted.container.textContent).toContain("This file has no text preview.");
  expect(mounted.container.querySelector(".workspace-explorer__code")).toBeNull();
  mounted.cleanup();
});

test("filters loaded files by path substring", async () => {
  const { source } = createFakeSource();
  const mounted = mount(<Harness source={source} />);
  await flush();

  const input = mounted.container.querySelector<HTMLInputElement>('input[type="search"]');
  if (!input) throw new Error("Filter input did not render.");
  act(() => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
    descriptor?.set?.call(input, "readme");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  const names = [...mounted.container.querySelectorAll(".file-tree__name")].map(
    (node) => node.textContent,
  );
  expect(names).toEqual(["/readme.md"]);
  mounted.cleanup();
});

test("infers languages from file extensions with a plain-text fallback", () => {
  expect(inferWorkspaceLanguage("/src/app.tsx")).toBe("tsx");
  expect(inferWorkspaceLanguage("/notes/todo.md")).toBe("md");
  expect(inferWorkspaceLanguage("/bin/run.weird")).toBe("text");
});
