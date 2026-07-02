import * as React from "react";
import { Badge } from "@mcp-b/react-components/components/Badge";
import { Button } from "@mcp-b/react-components/components/Button";
import { Dialog, DialogContent, DialogTitle } from "@mcp-b/react-components/components/Dialog";
import { MaximizeIcon, SpinnerIcon } from "@mcp-b/react-components/components/icons";
import { cx } from "./class-names";

export interface BrowserLiveViewProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Live View URL (Browser Run `devtoolsFrontendUrl`, e.g. live.browser.run). */
  url: string;
  /** Epoch ms after which the URL is dead (Browser Run mints ~5-minute links). */
  expiresAt?: number;
  /** The page the session was showing — used for the ended-state text. */
  pageTitle?: string;
  /**
   * Shown once the link expires — pass the last screenshot the agent took
   * (`<img>`) to keep the final frame on screen. Defaults to a quiet
   * "Live view ended" state.
   */
  fallback?: React.ReactNode;
}

/* A cross-origin iframe never reports load errors, so a timeout is the only
   honest failure signal: if `load` hasn't fired by then, call it unavailable. */
const FRAME_LOAD_TIMEOUT_MS = 15_000;

function EndedState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="browser-live-view__ended">
      <span className="browser-live-view__ended-title">{title}</span>
      {detail ? <span className="browser-live-view__ended-detail">{detail}</span> : null}
    </div>
  );
}

/**
 * Embeds a Browser Run Live View — a real-time, interactive view of the
 * agent's browser session. Links expire (~5 minutes), so the iframe swaps to
 * `fallback` (e.g. the last screenshot) once `expiresAt` passes. While the
 * hosted viewer connects, a quiet loading overlay hides the frame; if it
 * never loads, the view degrades to `fallback` or an unavailable state. An
 * expand button opens the same view in a fullscreen dialog.
 *
 * Where URLs come from (upstream: `agents/browser` in
 * github.com/cloudflare/agents — `BrowserLiveViewUrl`): the model calls
 * `cdp.getLiveViewUrl()` inside a `browser_execute` tool run, or the host
 * calls `connector.liveView()`/`sessionInfo()`. This package's chat rendering
 * derives the component automatically from links found in tool results.
 *
 * Styling rides `@mcp-b/react-components/styles` (browser-live-view.css),
 * which think-chat consumers load anyway.
 *
 * The iframe is unsandboxed by design: the hosted Live View UI needs scripts
 * and its own origin to stream the session. Only pass trusted Live View URLs.
 */
export function BrowserLiveView({
  url,
  expiresAt,
  pageTitle,
  fallback,
  className,
  ...props
}: BrowserLiveViewProps) {
  const [expired, setExpired] = React.useState(
    () => expiresAt !== undefined && expiresAt <= Date.now(),
  );
  const [frameState, setFrameState] = React.useState<"loading" | "ready" | "failed">("loading");
  const [expandedOpen, setExpandedOpen] = React.useState(false);

  React.useEffect(() => {
    if (expiresAt === undefined) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      return;
    }
    setExpired(false);
    const timer = setTimeout(() => setExpired(true), remaining);
    return () => clearTimeout(timer);
  }, [expiresAt]);

  React.useEffect(() => {
    setFrameState("loading");
  }, [url]);

  React.useEffect(() => {
    if (frameState !== "loading") return;
    const timer = setTimeout(() => setFrameState("failed"), FRAME_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [frameState]);

  const failed = frameState === "failed";
  const live = !expired && !failed;
  const frameTitle = pageTitle ? `Live browser view — ${pageTitle}` : "Live browser view";

  const view = live ? (
    <>
      <Badge size="sm" color="destructive" className="browser-live-view__badge">
        <span className="browser-live-view__badge-dot" aria-hidden />
        Live
      </Badge>
      <iframe
        className="browser-live-view__frame"
        src={url}
        title={frameTitle}
        allow="clipboard-read; clipboard-write"
        onLoad={() => setFrameState("ready")}
      />
      {frameState === "loading" ? (
        <div className="browser-live-view__state" role="status">
          <SpinnerIcon className="browser-live-view__state-spinner" />
          Connecting live view…
        </div>
      ) : null}
    </>
  ) : (
    (fallback ?? (
      <EndedState title={failed ? "Live view unavailable" : "Live view ended"} detail={pageTitle} />
    ))
  );

  return (
    <div
      {...props}
      className={cx("browser-live-view", className)}
      data-expired={expired || failed || undefined}
    >
      {view}
      <Button
        variant="ghost"
        color="neutral"
        size="icon-xs"
        className="browser-live-view__expand"
        aria-label="Expand browser view"
        onClick={() => setExpandedOpen(true)}
      >
        <MaximizeIcon />
      </Button>
      <Dialog open={expandedOpen} onOpenChange={setExpandedOpen}>
        <DialogContent size="fullscreen" className="browser-live-view__dialog">
          <DialogTitle className="browser-live-view__dialog-title">{frameTitle}</DialogTitle>
          <div className="browser-live-view__dialog-body">
            {live ? (
              <iframe src={url} title={frameTitle} allow="clipboard-read; clipboard-write" />
            ) : (
              (fallback ?? (
                <EndedState
                  title={failed ? "Live view unavailable" : "Live view ended"}
                  detail={pageTitle}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
