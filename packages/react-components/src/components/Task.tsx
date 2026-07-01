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
import { ChevronRightIcon, FileIcon, SearchIcon } from "./_internal/icons.js";

export interface TaskProps extends Omit<CollapsibleRootProps, "className" | "unstyled"> {
  className?: string;
}

/**
 * A collapsible task/workflow list. Compose with TaskTrigger, TaskContent,
 * TaskItem, and TaskItemFile to show structured progress for a multi-step
 * workflow like file edits. Adapted from Vercel AI Elements and restyled
 * with Sigvelo CSS tokens.
 *
 * @example
 * ```tsx
 * <Task defaultOpen>
 *   <TaskTrigger title="Refactoring authentication module" />
 *   <TaskContent>
 *     <TaskItem>
 *       Updated <TaskItemFile name="auth.ts" /> to export the new interface
 *     </TaskItem>
 *     <TaskItem>
 *       Added tests in <TaskItemFile name="auth.test.ts" />
 *     </TaskItem>
 *   </TaskContent>
 * </Task>
 * ```
 *
 * @see {@link https://elements.ai-sdk.dev/components/task | AI Elements Task}
 */
export function Task({
  className,
  defaultOpen = true,
  ref,
  ...props
}: TaskProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsibleRoot
      ref={ref}
      className={cx("task", className)}
      defaultOpen={defaultOpen}
      {...props}
      unstyled
    />
  );
}

export interface TaskTriggerProps extends Omit<CollapsibleTriggerProps, "className" | "unstyled"> {
  className?: string;
  /** Heading text shown in the trigger row. */
  title: string;
}

/**
 * Clickable header that toggles the task content.
 */
export function TaskTrigger({
  className,
  title,
  children,
  ref,
  ...props
}: TaskTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  if (children !== undefined && children !== null) {
    return (
      <CollapsibleTrigger ref={ref} className={cx("task__trigger", className)} {...props} unstyled>
        {children}
      </CollapsibleTrigger>
    );
  }

  return (
    <CollapsibleTrigger ref={ref} className={cx("task__trigger", className)} {...props} unstyled>
      <span className="task__trigger-leading-icon" aria-hidden="true">
        <SearchIcon />
      </span>
      <span className="task__trigger-title">{title}</span>
      <span className="task__trigger-icon" aria-hidden="true">
        <ChevronRightIcon />
      </span>
    </CollapsibleTrigger>
  );
}

export interface TaskContentProps extends Omit<CollapsiblePanelProps, "className" | "unstyled"> {
  className?: string;
}

/**
 * The collapsible panel containing TaskItem children.
 */
export function TaskContent({
  className,
  children,
  ref,
  ...props
}: TaskContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsiblePanel ref={ref} className={cx("task__content", className)} {...props} unstyled>
      <ul className="task__list" role="list">
        {children}
      </ul>
    </CollapsiblePanel>
  );
}

export interface TaskItemProps extends React.HTMLAttributes<HTMLLIElement> {}

/**
 * A single task row. Free-form content; compose with TaskItemFile to
 * reference a file inline.
 */
export function TaskItem({
  className,
  children,
  ref,
  ...props
}: TaskItemProps & { ref?: React.Ref<HTMLLIElement> }) {
  return (
    <li ref={ref} className={cx("task__item", className)} {...props}>
      {children}
    </li>
  );
}

export interface TaskItemFileProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The file name or path to display. Used to derive the language badge. */
  name?: string;
}

/**
 * Inline file reference badge used inside TaskItem content.
 */
export function TaskItemFile({
  className,
  name,
  children,
  ref,
  ...props
}: TaskItemFileProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return (
    <span ref={ref} className={cx("task__file", className)} {...props}>
      <span className="task__file-icon" aria-hidden="true">
        <FileIcon />
      </span>
      <span className="task__file-name">{children ?? name}</span>
    </span>
  );
}
