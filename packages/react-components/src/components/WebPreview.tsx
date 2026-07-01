import * as React from "react";
import { Badge, type BadgeColor } from "./Badge.js";
import { Button, type ButtonProps } from "./Button.js";
import { Input } from "./Input.js";
import { ScrollArea } from "./ScrollArea.js";
import {
  Tooltip,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from "./Tooltip.js";
import { cx } from "./_internal/class-names.js";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, RefreshIcon } from "./_internal/icons.js";

export interface WebPreviewContextValue {
  url: string;
  setUrl: (next: string) => void;
  consoleOpen: boolean;
  setConsoleOpen: (open: boolean) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  reloadToken: number;
}

const WebPreviewContext = React.createContext<WebPreviewContextValue | null>(null);

function useWebPreviewContext(): WebPreviewContextValue {
  const ctx = React.useContext(WebPreviewContext);
  if (!ctx) {
    throw new Error("WebPreview subcomponents must be used inside <WebPreview>.");
  }
  return ctx;
}

export interface WebPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Initial URL for uncontrolled preview history. */
  defaultUrl?: string;
  /** Controlled URL pushed into preview history when it changes. */
  url?: string;
  /** Called when the displayed URL changes. */
  onUrlChange?: (url: string) => void;
  /** Additional class names for layout only; do not override iframe sandboxing from apps. */
  className?: string;
  /** Navigation, body, and optional console slots. */
  children?: React.ReactNode;
}

/**
 * An iframe preview with a navigation bar, URL input, and optional console
 * panel. Tracks browsing history internally so back/forward buttons work
 * without depending on the iframe's own history.
 *
 * Built internally for agent/browser preview surfaces. Use it to display a
 * known URL with local navigation controls. Do not use it for trusted app
 * embedding that needs custom iframe permissions; add those explicitly here.
 *
 * Sigvelo changes: composes Button, Input, ScrollArea, Tooltip, and Badge;
 * keeps a conservative sandbox; maps navigation and console UI to Sigvelo CSS
 * tokens.
 *
 * The iframe has a fixed title and sandbox. Navigation buttons provide
 * accessible labels and tooltips. Add new permissions or console behaviors
 * here when multiple apps need them.
 *
 * @example
 * ```tsx
 * <WebPreview defaultUrl="https://example.com">
 *   <WebPreviewNavigation>
 *     <WebPreviewNavigationButton action="back" />
 *     <WebPreviewNavigationButton action="forward" />
 *     <WebPreviewNavigationButton action="reload" />
 *     <WebPreviewUrl />
 *   </WebPreviewNavigation>
 *   <WebPreviewBody />
 *   <WebPreviewConsole logs={logs} />
 * </WebPreview>
 * ```
 */
export function WebPreview({
  className,
  defaultUrl = "",
  url: controlledUrl,
  onUrlChange,
  children,
  ref,
  ...props
}: WebPreviewProps & { ref?: React.Ref<HTMLDivElement> }) {
  const initialUrl = controlledUrl ?? defaultUrl;
  const [history, setHistory] = React.useState<string[]>(() => (initialUrl ? [initialUrl] : []));
  const [index, setIndex] = React.useState(initialUrl ? 0 : -1);
  const [reloadToken, setReloadToken] = React.useState(0);
  const [consoleOpen, setConsoleOpen] = React.useState(false);

  const url = index >= 0 ? (history[index] ?? "") : "";

  const onUrlChangeRef = React.useRef(onUrlChange);
  onUrlChangeRef.current = onUrlChange;

  const historyRef = React.useRef(history);
  historyRef.current = history;
  const indexRef = React.useRef(index);
  indexRef.current = index;

  const prevControlledUrlRef = React.useRef(controlledUrl);
  React.useEffect(() => {
    if (controlledUrl === undefined) return;
    if (controlledUrl === prevControlledUrlRef.current) return;
    prevControlledUrlRef.current = controlledUrl;
    if (!controlledUrl) {
      setHistory([]);
      setIndex(-1);
      return;
    }
    const currentHistory = historyRef.current;
    const currentIndex = indexRef.current;
    if (currentIndex >= 0 && currentHistory[currentIndex] === controlledUrl) return;
    setHistory([...currentHistory.slice(0, currentIndex + 1), controlledUrl]);
    setIndex(currentIndex + 1);
  }, [controlledUrl]);

  const setUrl = React.useCallback(
    (next: string) => {
      setHistory((prev) => [...prev.slice(0, index + 1), next]);
      setIndex((prev) => prev + 1);
      onUrlChangeRef.current?.(next);
    },
    [index],
  );

  const goBack = React.useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goForward = React.useCallback(() => {
    setIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const reload = React.useCallback(() => {
    setReloadToken((n) => n + 1);
  }, []);

  // Notify parent when navigating back/forward (index changes without setUrl).
  const prevIndexRef = React.useRef(index);
  React.useEffect(() => {
    if (index === prevIndexRef.current) return;
    prevIndexRef.current = index;
    // setUrl already notifies, so only fire for back/forward navigation.
    if (index >= 0) onUrlChangeRef.current?.(history[index] ?? "");
  }, [index, history]);

  const ctxValue = React.useMemo<WebPreviewContextValue>(
    () => ({
      url,
      setUrl,
      consoleOpen,
      setConsoleOpen,
      canGoBack: index > 0,
      canGoForward: index >= 0 && index < history.length - 1,
      goBack,
      goForward,
      reload,
      reloadToken,
    }),
    [url, setUrl, consoleOpen, index, history.length, goBack, goForward, reload, reloadToken],
  );

  return (
    <WebPreviewContext.Provider value={ctxValue}>
      <div ref={ref} className={cx("web-preview", className)} {...props}>
        {children}
      </div>
    </WebPreviewContext.Provider>
  );
}

export interface WebPreviewNavigationProps extends React.HTMLAttributes<HTMLDivElement> {}

export function WebPreviewNavigation({
  className,
  children,
  ref,
  ...props
}: WebPreviewNavigationProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("web-preview__nav", className)} {...props}>
      {children}
    </div>
  );
}

export interface WebPreviewNavigationButtonProps extends Omit<
  ButtonProps,
  "variant" | "size" | "color" | "className" | "onClick"
> {
  className?: string;
  action?: "back" | "forward" | "reload";
  label?: string;
  tooltip?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function WebPreviewNavigationButton({
  className,
  action,
  label,
  tooltip,
  children,
  onClick,
  ...props
}: WebPreviewNavigationButtonProps) {
  const { canGoBack, canGoForward, goBack, goForward, reload } = useWebPreviewContext();

  const defaults: Record<
    NonNullable<WebPreviewNavigationButtonProps["action"]>,
    { label: string; icon: React.ReactNode; disabled: boolean; onAction: () => void }
  > = {
    back: { label: "Back", icon: <ArrowLeftIcon />, disabled: !canGoBack, onAction: goBack },
    forward: {
      label: "Forward",
      icon: <ArrowRightIcon />,
      disabled: !canGoForward,
      onAction: goForward,
    },
    reload: { label: "Reload", icon: <RefreshIcon />, disabled: false, onAction: reload },
  };

  const def = action ? defaults[action] : null;
  const resolvedLabel = label ?? tooltip ?? def?.label;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    def?.onAction();
    onClick?.(e);
  };

  const button = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={resolvedLabel}
      disabled={def?.disabled}
      className={cx(
        "web-preview__nav-button",
        action && `web-preview__nav-button--${action}`,
        className,
      )}
      {...props}
      onClick={handleClick}
    >
      {children ?? def?.icon}
    </Button>
  );

  if (!resolvedLabel) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipPortal>
        <TooltipPositioner>
          <TooltipPopup>{resolvedLabel}</TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </Tooltip>
  );
}

export interface WebPreviewUrlProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function WebPreviewUrl({
  className,
  placeholder = "Enter URL…",
  value,
  onChange,
  onKeyDown,
  ref,
  ...props
}: WebPreviewUrlProps & { ref?: React.Ref<HTMLInputElement> }) {
  const { url, setUrl } = useWebPreviewContext();
  const [draft, setDraft] = React.useState(url);
  const inputValue = value ?? draft;

  React.useEffect(() => {
    setDraft(url);
  }, [url]);

  return (
    <form
      className="web-preview__url-form"
      onSubmit={(e) => {
        e.preventDefault();
        const next = Array.isArray(inputValue) ? inputValue[0] : String(inputValue ?? "");
        if (next) setUrl(next);
      }}
    >
      <Input
        ref={ref}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange?.(e);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (!e.defaultPrevented && e.key === "Enter") {
            setUrl(e.currentTarget.value);
          }
        }}
        placeholder={placeholder}
        className={cx("web-preview__url", className)}
        {...props}
      />
    </form>
  );
}

export interface WebPreviewBodyProps extends Omit<
  React.IframeHTMLAttributes<HTMLIFrameElement>,
  "loading"
> {
  /** Optional placeholder shown while the iframe has no src. */
  loading?: React.ReactNode;
  interactive?: boolean;
}

export function WebPreviewBody({
  className,
  loading,
  src,
  ref,
  interactive = true,
  ...props
}: WebPreviewBodyProps & { ref?: React.Ref<HTMLIFrameElement> }) {
  const { url, reloadToken } = useWebPreviewContext();

  const effectiveSrc = src ?? url;
  const iframeSrc = effectiveSrc
    ? `${effectiveSrc}${reloadToken ? `#reload-${reloadToken}` : ""}`
    : undefined;

  if (!iframeSrc) {
    return (
      <div className={cx("web-preview__body", "web-preview__body--empty", className)}>
        {loading ?? "Enter a URL above to preview a site."}
      </div>
    );
  }

  return (
    <>
      <iframe
        ref={ref}
        key={iframeSrc}
        src={iframeSrc}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        title="Web preview"
        className={cx(
          "web-preview__body",
          !interactive && "web-preview__body--readonly",
          className,
        )}
        {...props}
      />
      {loading}
    </>
  );
}

export type ConsoleLogLevel = "log" | "info" | "warn" | "error";

export interface ConsoleLog {
  level: ConsoleLogLevel;
  message: string;
  timestamp: Date;
}

const LEVEL_COLOR: Record<ConsoleLogLevel, BadgeColor> = {
  log: "neutral",
  info: "primary",
  warn: "warning",
  error: "destructive",
};

export interface WebPreviewConsoleProps extends React.HTMLAttributes<HTMLDivElement> {
  logs?: ConsoleLog[];
}

export function WebPreviewConsole({
  className,
  logs = [],
  children,
  ref,
  ...props
}: WebPreviewConsoleProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { consoleOpen, setConsoleOpen } = useWebPreviewContext();

  return (
    <div ref={ref} className={cx("web-preview__console", className)} {...props}>
      <button
        type="button"
        className="web-preview__console-header"
        aria-expanded={consoleOpen}
        onClick={() => setConsoleOpen(!consoleOpen)}
      >
        <span>Console</span>
        <ChevronDownIcon aria-hidden="true" />
      </button>
      {consoleOpen ? (
        <ScrollArea.Root className="web-preview__console-scroll">
          <ScrollArea.Viewport className="web-preview__console-viewport">
            <ul className="web-preview__console-list">
              {logs.length === 0 ? (
                <li className="web-preview__console-empty">No console output</li>
              ) : (
                logs.map((log, i) => (
                  <li
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    className={cx(
                      "web-preview__console-item",
                      `web-preview__console-item--${log.level}`,
                    )}
                  >
                    <Badge color={LEVEL_COLOR[log.level]} size="sm">
                      {log.level}
                    </Badge>
                    <span className="web-preview__console-message">{log.message}</span>
                    <span className="web-preview__console-time">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
            {children}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical">
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      ) : null}
    </div>
  );
}
