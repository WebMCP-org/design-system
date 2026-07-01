import * as React from "react";

/**
 * Shared state passed to every tree item so arrow-key navigation, expand/
 * collapse, and selection all work against a single source of truth.
 *
 * Registration order matches visual order because `register` is called during
 * render (top-down), which is what WAI-ARIA Tree Pattern requires for
 * roving-tabindex navigation.
 */
export interface FileTreeContextValue {
  focusedPath: string | null;
  selectedPath: string | null;
  expanded: Set<string>;
  onFocus: (path: string) => void;
  onSelect: (path: string) => void;
  onExpandedChange: (path: string, next: boolean) => void;
  register: (path: string, kind: "file" | "folder", parentExpanded: boolean) => void;
  handleKeyDown: (event: React.KeyboardEvent, path: string, kind: "file" | "folder") => void;
}

export const FileTreeContext = React.createContext<FileTreeContextValue | null>(null);

export function useFileTreeContext(): FileTreeContextValue {
  const ctx = React.useContext(FileTreeContext);
  if (!ctx) {
    throw new Error("FileTree subcomponents must be used inside <FileTree>.");
  }
  return ctx;
}

interface UseFileTreeNavOptions {
  expanded: Set<string>;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onExpandedChange: (next: Set<string>) => void;
}

interface RegisteredNode {
  path: string;
  kind: "file" | "folder";
  visible: boolean;
}
type FileTreeNodeKind = RegisteredNode["kind"];
type FileTreeKeyHandler = (path: string, kind: FileTreeNodeKind) => void;

/**
 * Builds a FileTreeContextValue that tracks registered nodes and dispatches
 * keyboard navigation per the WAI-ARIA Tree Pattern.
 *
 * Call `register` from every FileTreeFolder/FileTreeFile during render. The
 * hook resets its internal list on each render pass so removed nodes don't
 * leave stale entries.
 */
export function useFileTreeNav({
  expanded,
  selectedPath,
  onSelect,
  onExpandedChange,
}: UseFileTreeNavOptions): FileTreeContextValue {
  const [focusedPath, setFocusedPath] = React.useState<string | null>(null);
  const nodesRef = React.useRef<RegisteredNode[]>([]);

  // Clear the list at the start of each render. Children re-register below.
  nodesRef.current = [];

  const register = React.useCallback(
    (path: string, kind: "file" | "folder", parentExpanded: boolean) => {
      nodesRef.current.push({ path, kind, visible: parentExpanded });
    },
    [],
  );

  const visibleNodes = () => nodesRef.current.filter((n) => n.visible);

  const moveFocus = React.useCallback((direction: 1 | -1, from: string) => {
    const visible = visibleNodes();
    const idx = visible.findIndex((n) => n.path === from);
    if (idx < 0) return;
    const nextIdx = Math.max(0, Math.min(visible.length - 1, idx + direction));
    const next = visible[nextIdx];
    if (next) setFocusedPath(next.path);
  }, []);

  const focusFirstVisibleNode = React.useCallback(() => {
    const first = visibleNodes()[0];
    if (first) setFocusedPath(first.path);
  }, []);

  const focusLastVisibleNode = React.useCallback(() => {
    const visible = visibleNodes();
    const last = visible[visible.length - 1];
    if (last) setFocusedPath(last.path);
  }, []);

  const setFolderExpanded = React.useCallback(
    (path: string, nextExpanded: boolean) => {
      const next = new Set(expanded);
      if (nextExpanded) next.add(path);
      else next.delete(path);
      onExpandedChange(next);
    },
    [expanded, onExpandedChange],
  );

  const toggleFolderExpanded = React.useCallback(
    (path: string) => {
      setFolderExpanded(path, !expanded.has(path));
    },
    [expanded, setFolderExpanded],
  );

  const keyHandlers = React.useMemo<Record<string, FileTreeKeyHandler>>(
    () => ({
      ArrowDown(path) {
        moveFocus(1, path);
      },
      ArrowUp(path) {
        moveFocus(-1, path);
      },
      ArrowRight(path, kind) {
        const isFolder = kind === "folder";
        if (!isFolder) {
          return;
        }

        if (expanded.has(path)) {
          moveFocus(1, path);
        } else {
          setFolderExpanded(path, true);
        }
      },
      ArrowLeft(path, kind) {
        if (kind === "folder" && expanded.has(path)) {
          setFolderExpanded(path, false);
        }
      },
      Enter(path, kind) {
        if (kind === "folder") {
          onSelect(path);
          toggleFolderExpanded(path);
        } else {
          onSelect(path);
        }
      },
      " "(path, kind) {
        if (kind === "folder") {
          onSelect(path);
          toggleFolderExpanded(path);
        } else {
          onSelect(path);
        }
      },
      Home() {
        focusFirstVisibleNode();
      },
      End() {
        focusLastVisibleNode();
      },
    }),
    [
      expanded,
      focusFirstVisibleNode,
      focusLastVisibleNode,
      moveFocus,
      onSelect,
      setFolderExpanded,
      toggleFolderExpanded,
    ],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent, path: string, kind: FileTreeNodeKind) => {
      const keyHandler = keyHandlers[event.key];

      if (!keyHandler) {
        return;
      }

      event.preventDefault();
      keyHandler(path, kind);
    },
    [keyHandlers],
  );

  const handleFocus = React.useCallback((path: string) => {
    setFocusedPath(path);
  }, []);

  const handleExpandedChange = React.useCallback(
    (path: string, next: boolean) => {
      setFolderExpanded(path, next);
    },
    [setFolderExpanded],
  );

  return {
    focusedPath,
    selectedPath,
    expanded,
    onFocus: handleFocus,
    onSelect,
    onExpandedChange: handleExpandedChange,
    register,
    handleKeyDown,
  };
}
