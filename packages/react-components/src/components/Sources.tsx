import * as React from "react";
import {
  CollapsiblePanel,
  type CollapsiblePanelProps,
  CollapsibleRoot,
  type CollapsibleRootProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
} from "./Collapsible.js";
import { cx } from "./_internal/class-names.js";
import { ChevronRightIcon, LinkIcon } from "./_internal/icons.js";

/**
 * Props for the Sources root. Wraps Base UI Collapsible.Root.
 */
export interface SourcesProps extends Omit<CollapsibleRootProps, "className" | "unstyled"> {
  className?: string;
}

/**
 * Displays a collapsible list of citations used by an AI to generate a
 * response. Compose with SourcesTrigger, SourcesContent, and one or more
 * Source children. Adapted from Vercel AI Elements and restyled with Sigvelo
 * CSS tokens.
 *
 * @example
 * ```tsx
 * <Sources defaultOpen>
 *   <SourcesTrigger count={3} />
 *   <SourcesContent>
 *     <Source href="https://example.com/a" title="Article A" />
 *     <Source href="https://example.com/b" title="Article B" />
 *     <Source href="https://example.com/c" title="Article C" />
 *   </SourcesContent>
 * </Sources>
 * ```
 *
 * @see {@link https://elements.ai-sdk.dev/components/sources | AI Elements Sources}
 */
export function Sources({
  className,
  ref,
  ...props
}: SourcesProps & { ref?: React.Ref<HTMLDivElement> }) {
  return <CollapsibleRoot ref={ref} className={cx("sources", className)} {...props} unstyled />;
}

export interface SourcesTriggerProps extends Omit<
  CollapsibleTriggerProps,
  "className" | "unstyled"
> {
  className?: string;
  /** Number of sources to show in the trigger label. */
  count: number;
}

/**
 * The clickable header that toggles the sources list. Shows the count and a
 * chevron that rotates when open.
 */
export function SourcesTrigger({
  className,
  count,
  children,
  ref,
  ...props
}: SourcesTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <CollapsibleTrigger ref={ref} className={cx("sources__trigger", className)} {...props} unstyled>
      {children ?? (
        <>
          <span className="sources__trigger-label">
            Used {count} {count === 1 ? "source" : "sources"}
          </span>
          <span className="sources__trigger-icon" aria-hidden="true">
            <ChevronRightIcon />
          </span>
        </>
      )}
    </CollapsibleTrigger>
  );
}

export interface SourcesContentProps extends Omit<CollapsiblePanelProps, "className" | "unstyled"> {
  className?: string;
}

/**
 * The collapsible panel that contains Source children.
 */
export function SourcesContent({
  className,
  children,
  ref,
  ...props
}: SourcesContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsiblePanel ref={ref} className={cx("sources__content", className)} {...props} unstyled>
      <ol className="sources__list" role="list">
        {children}
      </ol>
    </CollapsiblePanel>
  );
}

export interface SourceProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
  /** The display title for this citation. */
  title?: string;
  /** Optional description rendered beneath the title. */
  description?: string;
}

/**
 * A single citation item. Renders as an anchor inside the sources list.
 */
export function Source({
  title,
  description,
  children,
  className,
  href,
  ref,
  ...props
}: SourceProps & { ref?: React.Ref<HTMLAnchorElement> }) {
  return (
    <li className="sources__item">
      <a
        ref={ref}
        href={href}
        className={cx("sources__link", className)}
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children ?? (
          <>
            <span className="sources__link-icon" aria-hidden="true">
              <LinkIcon />
            </span>
            <span className="sources__link-body">
              {title ? <span className="sources__link-title">{title}</span> : null}
              {description ? (
                <span className="sources__link-description">{description}</span>
              ) : null}
              {href ? <span className="sources__link-host">{hostnameFrom(href)}</span> : null}
            </span>
          </>
        )}
      </a>
    </li>
  );
}

function hostnameFrom(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
