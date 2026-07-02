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
import { ChevronRightIcon } from "./_internal/icons.js";

export interface ActivityProps extends Omit<CollapsibleRootProps, "className" | "unstyled"> {
  className?: string;
  /** While true, the trigger label shimmers. */
  isStreaming?: boolean;
}

/**
 * A collapsible activity line that aggregates agent activity (tool calls,
 * file edits, searches) instead of rendering every call as its own block.
 * Borderless, Claude/Codex style: the collapsed state is a single plain text
 * line whose label shimmers while streaming — pass the latest action as the
 * label while streaming, and a short summary once settled. Expanding reveals
 * the full log. Compose with ActivityTrigger, ActivityContent, and
 * ActivityItem.
 *
 * @example
 * ```tsx
 * <Activity isStreaming={running}>
 *   <ActivityTrigger label={running ? "Searching code" : "Read 2 files and searched code"} />
 *   <ActivityContent>
 *     <ActivityItem>Searched code</ActivityItem>
 *     <ActivityItem>Edited a file</ActivityItem>
 *   </ActivityContent>
 * </Activity>
 * ```
 */
export function Activity({
  className,
  isStreaming = false,
  defaultOpen = false,
  ref,
  ...props
}: ActivityProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsibleRoot
      ref={ref}
      className={cx("activity", className)}
      defaultOpen={defaultOpen}
      data-streaming={isStreaming || undefined}
      {...props}
      unstyled
    />
  );
}

export interface ActivityTriggerProps extends Omit<
  CollapsibleTriggerProps,
  "className" | "unstyled"
> {
  className?: string;
  /** Header text. Defaults to "Working…". */
  label?: React.ReactNode;
}

/**
 * Clickable header line that toggles the activity log. The label shimmers
 * while the parent Activity is streaming.
 */
export function ActivityTrigger({
  className,
  label = "Working…",
  children,
  ref,
  ...props
}: ActivityTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  if (children !== undefined && children !== null) {
    return (
      <CollapsibleTrigger
        ref={ref}
        className={cx("activity__trigger", className)}
        {...props}
        unstyled
      >
        {children}
      </CollapsibleTrigger>
    );
  }

  return (
    <CollapsibleTrigger
      ref={ref}
      className={cx("activity__trigger", className)}
      {...props}
      unstyled
    >
      <span className="activity__trigger-label">{label}</span>
      <span className="activity__trigger-icon" aria-hidden="true">
        <ChevronRightIcon />
      </span>
    </CollapsibleTrigger>
  );
}

export interface ActivityContentProps extends Omit<
  CollapsiblePanelProps,
  "className" | "unstyled"
> {
  className?: string;
}

/** The collapsible log of ActivityItem children. */
export function ActivityContent({
  className,
  children,
  ref,
  ...props
}: ActivityContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsiblePanel ref={ref} className={cx("activity__content", className)} {...props} unstyled>
      <div className="activity__list">{children}</div>
    </CollapsiblePanel>
  );
}

export interface ActivityItemGroupProps extends Omit<
  CollapsibleRootProps,
  "className" | "unstyled"
> {
  className?: string;
  /** The row text, e.g. "Ran bash · vp test". */
  label: React.ReactNode;
  /** Optional leading icon for the row. */
  icon?: React.ReactNode;
}

/**
 * An expandable activity row — the second collapse level. The trigger reads
 * like a plain ActivityItem; expanding reveals chrome-free detail (a Terminal,
 * a thought trace) flush inside the outer Activity log.
 */
export function ActivityItemGroup({
  className,
  label,
  icon,
  children,
  ref,
  ...props
}: ActivityItemGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsibleRoot ref={ref} className={cx("activity__group", className)} {...props} unstyled>
      <CollapsibleTrigger className="activity__group-trigger" unstyled>
        {icon ? (
          <span className="activity__item-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="activity__item-text">{label}</span>
        <span className="activity__group-icon" aria-hidden="true">
          <ChevronRightIcon />
        </span>
      </CollapsibleTrigger>
      <CollapsiblePanel className="activity__group-panel" unstyled>
        <div className="activity__group-panel-inner">{children}</div>
      </CollapsiblePanel>
    </CollapsibleRoot>
  );
}

export interface ActivityTextProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Scrollable plain-text detail inside an ActivityItemGroup. */
export function ActivityText({
  className,
  children,
  ref,
  ...props
}: ActivityTextProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} tabIndex={0} className={cx("activity__group-text", className)} {...props}>
      {children}
    </div>
  );
}

export interface ActivityItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional leading icon for the row. */
  icon?: React.ReactNode;
}

/**
 * A single activity row — "Searched code", "Edited a file", etc. Free-form
 * content; keep it to one line so the streaming peek reads well.
 */
export function ActivityItem({
  className,
  icon,
  children,
  ref,
  ...props
}: ActivityItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("activity__item", className)} {...props}>
      {icon ? (
        <span className="activity__item-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="activity__item-text">{children}</span>
    </div>
  );
}

export interface ActivityOutputProps extends React.HTMLAttributes<HTMLPreElement> {}

/** Scrollable monospaced output inside an ActivityPanel. */
export function ActivityOutput({
  className,
  children,
  ref,
  ...props
}: ActivityOutputProps & { ref?: React.Ref<HTMLPreElement> }) {
  return (
    <pre ref={ref} tabIndex={0} className={cx("activity__shell-output", className)} {...props}>
      {children}
    </pre>
  );
}

export interface ActivityPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  text?: string;
  status?: React.ReactNode;
  error?: boolean;
}

/** Quiet detail panel for tool output inside an ActivityItemGroup. */
export function ActivityPanel({
  className,
  label,
  text,
  status,
  error,
  children,
  ref,
  ...props
}: ActivityPanelProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("activity__shell", className)} {...props}>
      <span className="activity__shell-label">{label}</span>
      {children ?? (text ? <ActivityOutput>{text}</ActivityOutput> : null)}
      {status ? (
        <span className="activity__shell-status" data-error={error || undefined}>
          {status}
        </span>
      ) : null}
    </div>
  );
}
