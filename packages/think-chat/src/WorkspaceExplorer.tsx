import * as React from "react";
import type { FileInfo, Workspace } from "@cloudflare/shell";
import type { WorkspaceLike } from "@cloudflare/think/tools/workspace";
import { Button } from "@mcp-b/react-components/components/Button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContainer,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
  type CodeBlockLanguage,
} from "@mcp-b/react-components/components/CodeBlock";
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@mcp-b/react-components/components/FileTree";
import {
  ArrowLeftIcon,
  FileIcon,
  RefreshIcon,
  SearchIcon,
} from "@mcp-b/react-components/components/icons";
import { cx } from "./class-names";

export type { FileInfo };

/** Workspace summary, as returned by `Workspace.getWorkspaceInfo()` upstream. */
export type WorkspaceInfo = Awaited<ReturnType<Workspace["getWorkspaceInfo"]>>;

/**
 * Upstream's workspace shapes, taken whole: pass a `Workspace` from
 * `@cloudflare/shell` or anything satisfying Think's `WorkspaceLike` (e.g. a
 * cross-DO RPC proxy). The explorer only calls `readDir` and `readFile` —
 * plus `getWorkspaceInfo` for the header's file-count chip when given a full
 * `Workspace` — and ignores the rest.
 */
export type WorkspaceSource = Workspace | WorkspaceLike;

export interface UseWorkspaceOptions {
  /** Must be referentially stable (memoize in the app) — a new source resets the workspace. */
  source: WorkspaceSource;
  /** Root directory to list first. Defaults to "/". */
  root?: string;
}

export interface WorkspaceFileState {
  path: string;
  name: string;
  /** `null` means the file is missing or binary, matching upstream `readFile`. */
  content: string | null;
  error: string | null;
}

export interface WorkspaceState {
  root: string;
  /** Loaded directory listings, keyed by directory path. */
  entriesByDirectory: Readonly<Record<string, readonly FileInfo[]>>;
  /** Every loaded entry, keyed by its path. */
  entryByPath: ReadonlyMap<string, FileInfo>;
  expandedPaths: ReadonlySet<string>;
  /** Update expansion; newly expanded directories load lazily. */
  setExpandedPaths: (next: Set<string>) => void;
  selectedPath: string | null;
  /** Select a file and load its content (cached after the first read). */
  selectFile: (path: string | null) => void;
  /** The selected file once its read settles; null while loading. */
  selectedFile: WorkspaceFileState | null;
  /** Root listing in flight. */
  isLoading: boolean;
  /** Directory and file paths with a request in flight. */
  loadingPaths: ReadonlySet<string>;
  /** Root/directory listing failure. Per-file read errors live on the file state. */
  error: string | null;
  /** Workspace summary, when the source provides `getWorkspaceInfo`. */
  info: WorkspaceInfo | null;
  /** Reload the root, every expanded directory, and the selected file. */
  refresh: () => void;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

function sortEntries(entries: readonly FileInfo[]): FileInfo[] {
  return [...entries].sort((left, right) => {
    if (left.type !== right.type) return left.type === "directory" ? -1 : 1;
    return left.name.localeCompare(right.name);
  });
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Headless state for browsing a Think workspace: lazy directory loading,
 * cached file reads, expansion/selection, and refresh. Feed the result to
 * `WorkspaceExplorer`, or render your own UI from it.
 */
export function useWorkspace({ source, root = "/" }: UseWorkspaceOptions): WorkspaceState {
  const [entriesByDirectory, setEntriesByDirectory] = React.useState<
    Record<string, readonly FileInfo[]>
  >({});
  const [filesByPath, setFilesByPath] = React.useState<Record<string, WorkspaceFileState>>({});
  const [expandedPaths, setExpandedPathsState] = React.useState<ReadonlySet<string>>(new Set());
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingPaths, setLoadingPaths] = React.useState<ReadonlySet<string>>(new Set());
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<WorkspaceInfo | null>(null);
  const loadedDirectoriesRef = React.useRef<Set<string>>(new Set());

  const markLoading = React.useCallback((path: string, loading: boolean) => {
    setLoadingPaths((current) => {
      const next = new Set(current);
      if (loading) next.add(path);
      else next.delete(path);
      return next;
    });
  }, []);

  const loadDirectory = React.useCallback(
    async (path: string, { force = false } = {}) => {
      if (!force && loadedDirectoriesRef.current.has(path)) return;
      markLoading(path, true);
      try {
        const entries = sortEntries(await source.readDir(path));
        loadedDirectoriesRef.current.add(path);
        setEntriesByDirectory((current) => ({ ...current, [path]: entries }));
        setError(null);
      } catch (listError) {
        setError(toErrorMessage(listError));
      } finally {
        markLoading(path, false);
      }
    },
    [source, markLoading],
  );

  const loadFile = React.useCallback(
    async (path: string, { force = false } = {}) => {
      if (!force && Object.hasOwn(filesByPath, path)) return;
      markLoading(path, true);
      try {
        const content = await source.readFile(path);
        setFilesByPath((current) => ({
          ...current,
          [path]: { path, name: basename(path), content, error: null },
        }));
      } catch (readError) {
        setFilesByPath((current) => ({
          ...current,
          [path]: { path, name: basename(path), content: null, error: toErrorMessage(readError) },
        }));
      } finally {
        markLoading(path, false);
      }
    },
    [source, filesByPath, markLoading],
  );

  const loadInfo = React.useCallback(async () => {
    if (!("getWorkspaceInfo" in source)) return;
    try {
      setInfo(await source.getWorkspaceInfo());
    } catch {
      setInfo(null); // the summary chip is decorative; listing errors surface elsewhere
    }
  }, [source]);

  // A new source or root is a different workspace: reset and reload.
  React.useEffect(() => {
    setEntriesByDirectory({});
    setFilesByPath({});
    setExpandedPathsState(new Set());
    setSelectedPath(null);
    setError(null);
    setInfo(null);
    loadedDirectoriesRef.current = new Set();
    setIsLoading(true);
    void Promise.all([loadDirectory(root, { force: true }), loadInfo()]).finally(() =>
      setIsLoading(false),
    );
  }, [loadDirectory, loadInfo, root]);

  const setExpandedPaths = React.useCallback(
    (next: Set<string>) => {
      setExpandedPathsState((current) => {
        for (const path of next) {
          if (!current.has(path)) void loadDirectory(path);
        }
        return next;
      });
    },
    [loadDirectory],
  );

  const selectFile = React.useCallback(
    (path: string | null) => {
      setSelectedPath(path);
      if (path !== null) void loadFile(path);
    },
    [loadFile],
  );

  const refresh = React.useCallback(() => {
    void (async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          ...[root, ...expandedPaths].map((path) => loadDirectory(path, { force: true })),
          loadInfo(),
        ]);
        if (selectedPath) await loadFile(selectedPath, { force: true });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [expandedPaths, loadDirectory, loadFile, loadInfo, root, selectedPath]);

  const entryByPath = React.useMemo(() => {
    const map = new Map<string, FileInfo>();
    for (const entries of Object.values(entriesByDirectory)) {
      for (const entry of entries) map.set(entry.path, entry);
    }
    return map;
  }, [entriesByDirectory]);

  const selectedFile = selectedPath ? (filesByPath[selectedPath] ?? null) : null;

  return {
    root,
    entriesByDirectory,
    entryByPath,
    expandedPaths,
    setExpandedPaths,
    selectedPath,
    selectFile,
    selectedFile,
    isLoading,
    loadingPaths,
    error,
    info,
    refresh,
  };
}

const LANGUAGE_BY_EXTENSION: Record<string, CodeBlockLanguage> = {
  ts: "ts",
  mts: "ts",
  cts: "ts",
  tsx: "tsx",
  js: "js",
  mjs: "js",
  cjs: "js",
  jsx: "jsx",
  json: "json",
  jsonc: "jsonc",
  css: "css",
  html: "html",
  md: "md",
  mdx: "mdx",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  py: "python",
  rs: "rust",
  go: "go",
  sql: "sql",
  xml: "xml",
  svg: "xml",
  vue: "vue",
  svelte: "svelte",
};

/** Best-effort syntax-highlighting language from a file path; unknown extensions render as plain text. */
export function inferWorkspaceLanguage(path: string): CodeBlockLanguage {
  const extension = basename(path).split(".").at(-1)?.toLowerCase() ?? "";
  return LANGUAGE_BY_EXTENSION[extension] ?? ("text" as CodeBlockLanguage);
}

export interface WorkspaceExplorerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  workspace: WorkspaceState;
  /** Header label. Defaults to "Workspace". */
  title?: React.ReactNode;
  /** Extra header actions, rendered next to the built-in refresh button. */
  actions?: React.ReactNode;
  /** Hide the file filter input. */
  showFilter?: boolean;
  filterPlaceholder?: string;
  emptyState?: React.ReactNode;
}

/**
 * A Think workspace file browser with a preview pane: lazy directory tree,
 * filter, refresh, and syntax-highlighted file view with copy. Drive it with
 * `useWorkspace(source)`.
 *
 * @example
 * ```tsx
 * const workspace = useWorkspace({ source: agent.workspace, root: "/workspace" });
 * <WorkspaceExplorer workspace={workspace} />
 * ```
 */
export function WorkspaceExplorer({
  workspace,
  className,
  title = "Workspace",
  actions,
  showFilter = true,
  filterPlaceholder = "Filter files...",
  emptyState,
  ref,
  ...props
}: WorkspaceExplorerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [view, setView] = React.useState<"tree" | "file">("tree");
  const [filter, setFilter] = React.useState("");
  const filterQuery = filter.trim().toLowerCase();

  const {
    root,
    entriesByDirectory,
    entryByPath,
    expandedPaths,
    setExpandedPaths,
    selectedPath,
    selectFile,
    selectedFile,
    isLoading,
    loadingPaths,
    error,
    info,
    refresh,
  } = workspace;

  const handleSelect = React.useCallback(
    (path: string) => {
      // FileTree fires onSelect for folders too; those only toggle expansion.
      if (entryByPath.get(path)?.type === "directory") return;
      selectFile(path);
      setView("file");
    },
    [entryByPath, selectFile],
  );

  const filteredFiles = React.useMemo(() => {
    if (!filterQuery) return [];
    return sortEntries(
      [...entryByPath.values()].filter(
        (entry) => entry.type !== "directory" && entry.path.toLowerCase().includes(filterQuery),
      ),
    );
  }, [entryByPath, filterQuery]);

  const renderEntry = (entry: FileInfo): React.ReactNode => {
    if (entry.type === "directory") {
      return (
        <FileTreeFolder key={entry.path} path={entry.path} name={entry.name}>
          {(entriesByDirectory[entry.path] ?? []).map(renderEntry)}
        </FileTreeFolder>
      );
    }
    return <FileTreeFile key={entry.path} path={entry.path} name={entry.name} />;
  };

  const rootEntries = entriesByDirectory[root] ?? [];
  const showFileView = view === "file" && selectedPath !== null;
  const selectedFileLoading = selectedPath !== null && loadingPaths.has(selectedPath);

  return (
    <div ref={ref} className={cx("workspace-explorer", className)} {...props}>
      <div className="workspace-explorer__header">
        {showFileView ? (
          <>
            <Button
              variant="ghost"
              color="neutral"
              size="sm"
              onClick={() => setView("tree")}
              aria-label="Back to files"
            >
              <ArrowLeftIcon aria-hidden="true" />
            </Button>
            <span className="workspace-explorer__path" title={selectedPath}>
              {selectedPath}
            </span>
          </>
        ) : (
          <>
            <span className="workspace-explorer__title">{title}</span>
            {info ? (
              <span className="workspace-explorer__count">
                {info.fileCount.toLocaleString()} files
              </span>
            ) : null}
          </>
        )}
        <div className="workspace-explorer__actions">
          {actions}
          <Button
            variant="ghost"
            color="neutral"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            aria-label="Refresh workspace"
          >
            <RefreshIcon aria-hidden="true" />
          </Button>
        </div>
      </div>

      {showFileView ? (
        <WorkspaceFileView file={selectedFile} isLoading={selectedFileLoading} />
      ) : (
        <div className="workspace-explorer__body">
          {showFilter ? (
            <label className="workspace-explorer__filter">
              <SearchIcon aria-hidden="true" />
              <input
                type="search"
                value={filter}
                onChange={(event) => setFilter(event.currentTarget.value)}
                placeholder={filterPlaceholder}
                aria-label="Filter workspace files"
                autoComplete="off"
              />
            </label>
          ) : null}
          {error ? (
            <div className="workspace-explorer__empty" role="alert">
              {error}
            </div>
          ) : filterQuery ? (
            filteredFiles.length > 0 ? (
              <FileTree
                className="workspace-explorer__tree"
                selectedPath={selectedPath}
                onSelect={handleSelect}
                aria-label="Workspace files"
              >
                {filteredFiles.map((entry) => (
                  <FileTreeFile key={entry.path} path={entry.path} name={entry.path} />
                ))}
              </FileTree>
            ) : (
              <div className="workspace-explorer__empty">No matching files</div>
            )
          ) : rootEntries.length > 0 ? (
            <FileTree
              className="workspace-explorer__tree"
              expanded={new Set(expandedPaths)}
              onExpandedChange={setExpandedPaths}
              selectedPath={selectedPath}
              onSelect={handleSelect}
              aria-label="Workspace files"
            >
              {rootEntries.map(renderEntry)}
            </FileTree>
          ) : (
            <div className="workspace-explorer__empty">
              {isLoading ? "Loading workspace..." : (emptyState ?? "No workspace files")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkspaceFileView({
  file,
  isLoading,
}: {
  file: WorkspaceFileState | null;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="workspace-explorer__empty">Loading file...</div>;
  }
  if (!file) {
    return <div className="workspace-explorer__empty">File preview is unavailable.</div>;
  }
  if (file.error) {
    return (
      <div className="workspace-explorer__empty" role="alert">
        Could not preview this file: {file.error}
      </div>
    );
  }
  if (file.content === null) {
    return <div className="workspace-explorer__empty">This file has no text preview.</div>;
  }
  if (file.content.length === 0) {
    return <div className="workspace-explorer__empty">This file is empty.</div>;
  }
  return (
    <div className="workspace-explorer__file">
      <CodeBlock
        className="workspace-explorer__code"
        code={file.content}
        language={inferWorkspaceLanguage(file.path)}
        showLineNumbers
      >
        <CodeBlockHeader>
          <CodeBlockTitle>
            <FileIcon aria-hidden="true" />
            <CodeBlockFilename>{file.name}</CodeBlockFilename>
          </CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContainer>
          <CodeBlockContent />
        </CodeBlockContainer>
      </CodeBlock>
    </div>
  );
}
