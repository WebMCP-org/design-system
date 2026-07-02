import * as React from "react";
import { Badge } from "@mcp-b/react-components/components/Badge";
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

/**
 * Embeds a Browser Run Live View — a real-time, interactive view of the
 * agent's browser session. Links expire (~5 minutes), so the iframe swaps to
 * `fallback` (e.g. the last screenshot) once `expiresAt` passes.
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

  return (
    <div
      {...props}
      className={cx("browser-live-view", className)}
      data-expired={expired || undefined}
    >
      {expired ? (
        (fallback ?? (
          <div className="browser-live-view__ended">
            <span className="browser-live-view__ended-title">Live view ended</span>
            {pageTitle ? (
              <span className="browser-live-view__ended-detail">{pageTitle}</span>
            ) : null}
          </div>
        ))
      ) : (
        <>
          <Badge size="sm" color="destructive" className="browser-live-view__badge">
            <span className="browser-live-view__badge-dot" aria-hidden />
            Live
          </Badge>
          <iframe
            className="browser-live-view__frame"
            src={url}
            title={pageTitle ? `Live browser view — ${pageTitle}` : "Live browser view"}
            allow="clipboard-read; clipboard-write"
          />
        </>
      )}
    </div>
  );
}
