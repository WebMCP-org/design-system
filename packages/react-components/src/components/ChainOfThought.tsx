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
import {
  CheckIcon,
  ChevronRightIcon,
  DotIcon,
  type IconProps,
  SpinnerIcon,
} from "./_internal/icons.js";

export interface ChainOfThoughtProps extends Omit<CollapsibleRootProps, "className" | "unstyled"> {
  className?: string;
}

/**
 * A collapsible display of an AI's step-by-step reasoning trace. Compose
 * ChainOfThoughtHeader with ChainOfThoughtContent, then nest
 * ChainOfThoughtStep (and optional ChainOfThoughtSearchResults /
 * ChainOfThoughtImage) inside the content.
 *
 * @example
 * ```tsx
 * <ChainOfThought defaultOpen>
 *   <ChainOfThoughtHeader>Thinking</ChainOfThoughtHeader>
 *   <ChainOfThoughtContent>
 *     <ChainOfThoughtStep
 *       status="complete"
 *       label="Search docs"
 *       description="Found 3 relevant pages"
 *     >
 *       <ChainOfThoughtSearchResults>
 *         <ChainOfThoughtSearchResult title="Guide" href="…" />
 *       </ChainOfThoughtSearchResults>
 *     </ChainOfThoughtStep>
 *     <ChainOfThoughtStep status="active" label="Drafting answer" />
 *   </ChainOfThoughtContent>
 * </ChainOfThought>
 * ```
 */
export function ChainOfThought({
  className,
  ref,
  ...props
}: ChainOfThoughtProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsibleRoot ref={ref} className={cx("chain-of-thought", className)} {...props} unstyled />
  );
}

export interface ChainOfThoughtHeaderProps extends Omit<
  CollapsibleTriggerProps,
  "className" | "unstyled"
> {
  className?: string;
}

/**
 * Clickable header row that toggles the reasoning trace.
 */
export function ChainOfThoughtHeader({
  className,
  children = "Chain of Thought",
  ref,
  ...props
}: ChainOfThoughtHeaderProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <CollapsibleTrigger
      ref={ref}
      className={cx("chain-of-thought__header", className)}
      {...props}
      unstyled
    >
      <span className="chain-of-thought__header-icon" aria-hidden="true">
        <ChevronRightIcon />
      </span>
      <span className="chain-of-thought__header-label">{children}</span>
    </CollapsibleTrigger>
  );
}

export interface ChainOfThoughtContentProps extends Omit<
  CollapsiblePanelProps,
  "className" | "unstyled"
> {
  className?: string;
}

/**
 * Collapsible panel containing step rows.
 */
export function ChainOfThoughtContent({
  className,
  children,
  ref,
  ...props
}: ChainOfThoughtContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsiblePanel
      ref={ref}
      className={cx("chain-of-thought__content", className)}
      {...props}
      unstyled
    >
      <ol className="chain-of-thought__steps">{children}</ol>
    </CollapsiblePanel>
  );
}

export type ChainOfThoughtStepStatus = "pending" | "active" | "complete";

export interface ChainOfThoughtStepProps extends React.HTMLAttributes<HTMLLIElement> {
  /** Optional icon component rendered instead of the default status icon. */
  icon?: React.ComponentType<IconProps>;
  /** Visual status of this step. */
  status?: ChainOfThoughtStepStatus;
  /** Primary label text for the step. */
  label: React.ReactNode;
  /** Optional secondary description rendered beneath the label. */
  description?: React.ReactNode;
}

/**
 * A single step in the reasoning trace. Shows a status indicator, label,
 * optional description, and any children (e.g. search results).
 */
export function ChainOfThoughtStep({
  className,
  icon: Icon,
  status = "complete",
  label,
  description,
  children,
  ref,
  ...props
}: ChainOfThoughtStepProps & { ref?: React.Ref<HTMLLIElement> }) {
  return (
    <li
      ref={ref}
      className={cx("chain-of-thought__step", `chain-of-thought__step--${status}`, className)}
      data-status={status}
      {...props}
    >
      <span className="chain-of-thought__step-indicator" aria-hidden="true">
        {Icon ? (
          <Icon />
        ) : status === "complete" ? (
          <CheckIcon />
        ) : status === "active" ? (
          <SpinnerIcon />
        ) : (
          <DotIcon />
        )}
      </span>
      <div className="chain-of-thought__step-body">
        <div className="chain-of-thought__step-label">{label}</div>
        {description ? (
          <div className="chain-of-thought__step-description">{description}</div>
        ) : null}
        {children ? <div className="chain-of-thought__step-children">{children}</div> : null}
      </div>
    </li>
  );
}

export interface ChainOfThoughtSearchResultsProps extends React.HTMLAttributes<HTMLUListElement> {}

/**
 * Container for a set of search-result chips displayed inside a step.
 */
export function ChainOfThoughtSearchResults({
  className,
  children,
  ref,
  ...props
}: ChainOfThoughtSearchResultsProps & { ref?: React.Ref<HTMLUListElement> }) {
  return (
    <ul ref={ref} className={cx("chain-of-thought__search-results", className)} {...props}>
      {children}
    </ul>
  );
}

export interface ChainOfThoughtSearchResultProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "title"
> {
  title?: React.ReactNode;
}

/**
 * A single search-result chip link.
 */
export function ChainOfThoughtSearchResult({
  className,
  children,
  title,
  href,
  ref,
  ...props
}: ChainOfThoughtSearchResultProps & { ref?: React.Ref<HTMLAnchorElement> }) {
  return (
    <li className="chain-of-thought__search-result-item">
      <a
        ref={ref}
        href={href}
        className={cx("chain-of-thought__search-result", className)}
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children ?? title}
      </a>
    </li>
  );
}

export interface ChainOfThoughtImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Optional caption rendered beneath the image. */
  caption?: string;
}

/**
 * An image thumbnail with optional caption, displayed inside a step's
 * children area.
 */
export function ChainOfThoughtImage({
  className,
  children,
  caption,
  alt = "",
  ref,
  ...props
}: ChainOfThoughtImageProps & { ref?: React.Ref<HTMLImageElement> }) {
  return (
    <figure className={cx("chain-of-thought__image", className)}>
      {children ? (
        <div className="chain-of-thought__image-frame">{children}</div>
      ) : (
        <img ref={ref} alt={alt} className="chain-of-thought__image-img" {...props} />
      )}
      {caption ? (
        <figcaption className="chain-of-thought__image-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
