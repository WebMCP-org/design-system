import * as React from "react";
import { Badge } from "./Badge.js";
import { Button, type ButtonProps } from "./Button.js";
import {
  CollapsiblePanel,
  type CollapsiblePanelProps,
  CollapsibleRoot,
  type CollapsibleRootProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
} from "./Collapsible.js";
import { ScrollArea, type ScrollAreaRootProps } from "./ScrollArea.js";
import { cx } from "./_internal/class-names.js";
import { CheckIcon, ChevronRightIcon, DotIcon, FileIcon } from "./_internal/icons.js";

export interface QueueMessagePart {
  type: string;
  text?: string;
  url?: string;
  filename?: string;
  mediaType?: string;
}

export interface QueueMessage {
  id: string;
  parts: QueueMessagePart[];
}

export interface QueueTodo {
  id: string;
  title: string;
  description?: string;
  status?: "pending" | "completed";
}

export interface QueueProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional class names for layout only; do not override item states from apps. */
  className?: string;
  /** QueueSection children. */
  children?: React.ReactNode;
}

/**
 * Container for a grouped list of queue items (e.g. messages, todos,
 * attachments). Compose with QueueSection as direct children. Adapted from
 * Vercel AI Elements and restyled with Sigvelo CSS tokens.
 *
 * Use for agent work queues, todo groups, and attachment queues. Do not use it
 * for navigation or arbitrary card lists.
 *
 * Sigvelo changes: uses shared Collapsible, ScrollArea, Badge, and Button
 * components; normalizes Vercel-compatible `completed` status to `complete`;
 * maps all styling to Sigvelo queue CSS tokens/classes.
 *
 * Section triggers inherit Collapsible keyboard behavior. Status indicators
 * are decorative, so visible item text must carry the real meaning. Add new
 * statuses or item affordances here when multiple apps need them.
 *
 * @example
 * ```tsx
 * <Queue>
 *   <QueueSection>
 *     <QueueSectionTrigger>
 *       <QueueSectionLabel count={2}>Todos</QueueSectionLabel>
 *     </QueueSectionTrigger>
 *     <QueueSectionContent>
 *       <QueueList>
 *         <QueueItem status="active">
 *           <QueueItemIndicator status="active" />
 *           <QueueItemContent>Running checks</QueueItemContent>
 *         </QueueItem>
 *       </QueueList>
 *     </QueueSectionContent>
 *   </QueueSection>
 * </Queue>
 * ```
 *
 * @see {@link https://elements.ai-sdk.dev/components/queue | AI Elements Queue}
 */
export function Queue({
  className,
  children,
  ref,
  ...props
}: QueueProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("queue", className)} {...props}>
      {children}
    </div>
  );
}

export interface QueueSectionProps extends Omit<CollapsibleRootProps, "className" | "unstyled"> {
  className?: string;
}

/**
 * A collapsible section within a Queue. Holds a trigger label and a list
 * of QueueItem children.
 */
export function QueueSection({
  className,
  defaultOpen = true,
  ref,
  ...props
}: QueueSectionProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsibleRoot
      ref={ref}
      className={cx("queue__section", className)}
      defaultOpen={defaultOpen}
      {...props}
      unstyled
    />
  );
}

export interface QueueSectionTriggerProps extends Omit<
  CollapsibleTriggerProps,
  "className" | "unstyled"
> {
  className?: string;
}

export function QueueSectionTrigger({
  className,
  children,
  ref,
  ...props
}: QueueSectionTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <CollapsibleTrigger
      ref={ref}
      className={cx("queue__section-trigger", className)}
      {...props}
      unstyled
    >
      <span className="queue__section-icon" aria-hidden="true">
        <ChevronRightIcon />
      </span>
      {children}
    </CollapsibleTrigger>
  );
}

export interface QueueSectionLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Optional count rendered as a trailing badge. */
  count?: number;
  label?: string;
  icon?: React.ReactNode;
}

export function QueueSectionLabel({
  className,
  children,
  count,
  label,
  icon,
  ref,
  ...props
}: QueueSectionLabelProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const content = children ?? (label ? `${count ?? ""} ${label}`.trim() : null);

  return (
    <span ref={ref} className={cx("queue__section-label", className)} {...props}>
      {icon}
      <span>{content}</span>
      {children !== undefined && count !== undefined ? (
        <Badge color="neutral" size="sm" className="queue__section-count">
          {count}
        </Badge>
      ) : null}
    </span>
  );
}

export interface QueueListProps extends Omit<ScrollAreaRootProps, "className"> {
  className?: string;
}

export function QueueList({
  className,
  children,
  ref,
  ...props
}: QueueListProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ScrollArea ref={ref} className={cx("queue__list", className)} {...props}>
      <ScrollArea.Viewport className="queue__list-viewport">
        <div className="queue__list-scroll">
          <ul className="queue__list-inner">{children}</ul>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea>
  );
}

export interface QueueSectionContentProps extends Omit<
  CollapsiblePanelProps,
  "className" | "unstyled"
> {
  className?: string;
}

export function QueueSectionContent({
  className,
  ref,
  ...props
}: QueueSectionContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsiblePanel
      ref={ref}
      className={cx("queue__section-content", className)}
      {...props}
      unstyled
    />
  );
}

export type QueueItemStatus = "pending" | "active" | "complete" | "completed";

function normalizeQueueItemStatus(status: QueueItemStatus) {
  return status === "completed" ? "complete" : status;
}

export interface QueueItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  status?: QueueItemStatus;
}

export function QueueItem({
  className,
  status = "pending",
  children,
  ref,
  ...props
}: QueueItemProps & { ref?: React.Ref<HTMLLIElement> }) {
  const resolvedStatus = normalizeQueueItemStatus(status);

  return (
    <li
      ref={ref}
      className={cx("queue__item", `queue__item--${resolvedStatus}`, className)}
      data-status={resolvedStatus}
      {...props}
    >
      {children}
    </li>
  );
}

export interface QueueItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: QueueItemStatus;
  completed?: boolean;
}

export function QueueItemIndicator({
  className,
  status = "pending",
  completed = false,
  ref,
  ...props
}: QueueItemIndicatorProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const resolvedStatus = completed ? "complete" : normalizeQueueItemStatus(status);
  const icon = resolvedStatus === "complete" ? <CheckIcon /> : <DotIcon />;
  return (
    <span
      ref={ref}
      className={cx("queue__item-indicator", `queue__item-indicator--${resolvedStatus}`, className)}
      aria-hidden="true"
      {...props}
    >
      {icon}
    </span>
  );
}

export interface QueueItemContentProps extends React.HTMLAttributes<HTMLDivElement> {
  completed?: boolean;
}

export function QueueItemContent({
  className,
  children,
  completed = false,
  ref,
  ...props
}: QueueItemContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cx("queue__item-content", completed && "queue__item-content--complete", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface QueueItemDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  completed?: boolean;
}

export function QueueItemDescription({
  className,
  children,
  completed = false,
  ref,
  ...props
}: QueueItemDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  return (
    <p
      ref={ref}
      className={cx(
        "queue__item-description",
        completed && "queue__item-description--complete",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export interface QueueItemActionsProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface QueueItemActionProps extends Omit<
  ButtonProps,
  "variant" | "color" | "size" | "className"
> {
  className?: string;
}

export function QueueItemActions({
  className,
  children,
  ref,
  ...props
}: QueueItemActionsProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("queue__item-actions", className)} {...props}>
      {children}
    </div>
  );
}

export function QueueItemAction({
  className,
  ref,
  ...props
}: QueueItemActionProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      color="neutral"
      size="sm"
      className={cx("queue__item-action", className)}
      {...props}
    />
  );
}

export interface QueueItemAttachmentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function QueueItemAttachment({
  className,
  children,
  ref,
  ...props
}: QueueItemAttachmentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("queue__item-attachment", className)} {...props}>
      {children}
    </div>
  );
}

export interface QueueItemImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export function QueueItemImage({
  className,
  alt = "",
  ref,
  ...props
}: QueueItemImageProps & { ref?: React.Ref<HTMLImageElement> }) {
  return <img ref={ref} alt={alt} className={cx("queue__item-image", className)} {...props} />;
}

export interface QueueItemFileProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  size?: string;
}

export function QueueItemFile({
  className,
  children,
  name,
  size,
  ref,
  ...props
}: QueueItemFileProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("queue__item-file", className)} {...props}>
      <span className="queue__item-file-icon" aria-hidden="true">
        <FileIcon />
      </span>
      <span className="queue__item-file-name">{children ?? name}</span>
      {size ? <span className="queue__item-file-size">{size}</span> : null}
    </div>
  );
}
