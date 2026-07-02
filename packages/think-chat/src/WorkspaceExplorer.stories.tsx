import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo } from "react";
import {
  WorkspaceExplorer,
  useWorkspace,
  type FileInfo,
  type WorkspaceSource,
} from "./WorkspaceExplorer";

const meta = {
  title: "ThinkChat/WorkspaceExplorer",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const FILES: Record<string, string> = {
  "/workspace/package.json": `{\n  "name": "demo-agent",\n  "private": true\n}`,
  "/workspace/README.md": "# Demo agent\n\nFiles written by the agent land here.",
  "/workspace/src/index.ts": `export function greet(name: string) {\n  return \`Hello, \${name}!\`;\n}`,
  "/workspace/src/tools/fetch-page.ts": `export async function fetchPage(url: string) {\n  const response = await fetch(url);\n  return response.text();\n}`,
};

/* WorkspaceSource is upstream's full Workspace/WorkspaceLike shape; demo
   fakes stub only the methods the explorer calls, hence the casts. */
function createDemoSource({ delay = 300 }: { delay?: number } = {}): WorkspaceSource {
  const wait = () => new Promise((resolve) => setTimeout(resolve, delay));
  const list = (path: string): FileInfo[] => {
    const prefix = `${path.replace(/\/$/, "")}/`;
    const seen = new Map<string, FileInfo>();
    for (const [filePath, content] of Object.entries(FILES)) {
      if (!filePath.startsWith(prefix)) continue;
      const [head, ...rest] = filePath.slice(prefix.length).split("/");
      if (!head) continue;
      const type = rest.length > 0 ? "directory" : "file";
      seen.set(head, {
        path: `${prefix}${head}`,
        name: head,
        type,
        mimeType: type === "file" ? "text/plain" : "inode/directory",
        size: type === "file" ? content.length : 0,
        createdAt: 0,
        updatedAt: 0,
      });
    }
    return [...seen.values()];
  };

  return {
    readDir: async (dir = "/") => {
      await wait();
      return list(dir);
    },
    readFile: async (path: string) => {
      await wait();
      return FILES[path] ?? null;
    },
    getWorkspaceInfo: async () => {
      await wait();
      return {
        fileCount: Object.keys(FILES).length,
        directoryCount: 2,
        totalBytes: Object.values(FILES).reduce((sum, content) => sum + content.length, 0),
        r2FileCount: 0,
      };
    },
  } as WorkspaceSource;
}

function Demo({ source }: { source: WorkspaceSource }) {
  const workspace = useWorkspace({ source, root: "/workspace" });
  return (
    <div style={{ width: "26rem", height: "28rem", display: "flex" }}>
      <WorkspaceExplorer workspace={workspace} style={{ flex: 1 }} />
    </div>
  );
}

export const Default: Story = {
  render: function Default() {
    const source = useMemo(() => createDemoSource(), []);
    return <Demo source={source} />;
  },
};

export const Empty: Story = {
  render: function Empty() {
    const source = useMemo(
      () =>
        ({
          readDir: async (): Promise<FileInfo[]> => [],
          readFile: async (_path: string): Promise<string | null> => null,
        }) as WorkspaceSource,
      [],
    );
    return <Demo source={source} />;
  },
};

export const LoadFailure: Story = {
  render: function LoadFailure() {
    const source = useMemo(
      () =>
        ({
          readDir: async (): Promise<FileInfo[]> => {
            throw new Error("Workspace is not reachable.");
          },
          readFile: async (_path: string): Promise<string | null> => {
            throw new Error("Workspace is not reachable.");
          },
        }) as WorkspaceSource,
      [],
    );
    return <Demo source={source} />;
  },
};
