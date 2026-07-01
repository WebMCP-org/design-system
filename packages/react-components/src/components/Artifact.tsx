import * as React from "react";
import { Button, type ButtonProps } from "./Button.js";
import {
  Tooltip,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from "./Tooltip.js";
import { cx } from "./_internal/class-names.js";
import { XIcon } from "./_internal/icons.js";

export interface ArtifactProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Additional class names for layout only; do not restyle artifact internals from apps. */
  className?: string;
  /** Header and content slots, usually composed from Artifact subcomponents. */
  children?: React.ReactNode;
}

/**
 * A container for generated content (code, documents, outputs) with a header
 * containing a title, description, and action buttons.
 *
 * Built internally for Sigvelo agent outputs. Use it for generated artifacts
 * that need a title, optional description, content body, and compact actions.
 * Do not use it as a page section or generic card; use Card or page layout
 * instead.
 *
 * Styling is mapped to Sigvelo surface, border, spacing, radius, typography,
 * and focus tokens. Extend with composition, action props, or a shared variant
 * here when multiple apps need the same behavior. Avoid overriding nested
 * `.artifact__*` selectors from app CSS.
 *
 * @example
 * ```tsx
 * <Artifact>
 *   <ArtifactHeader>
 *     <div>
 *       <ArtifactTitle>Project report</ArtifactTitle>
 *       <ArtifactDescription>Generated from Q1 data</ArtifactDescription>
 *     </div>
 *     <ArtifactActions>
 *       <ArtifactAction label="Copy" tooltip="Copy to clipboard" icon={<CopyIcon />} />
 *       <ArtifactClose onClick={close} />
 *     </ArtifactActions>
 *   </ArtifactHeader>
 *   <ArtifactContent>…</ArtifactContent>
 * </Artifact>
 * ```
 */
export function Artifact({
  className,
  children,
  ref,
  ...props
}: ArtifactProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("artifact", className)} {...props}>
      {children}
    </div>
  );
}

export interface ArtifactHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ArtifactHeader({
  className,
  children,
  ref,
  ...props
}: ArtifactHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("artifact__header", className)} {...props}>
      {children}
    </div>
  );
}

export interface ArtifactTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function ArtifactTitle({
  className,
  children,
  ref,
  ...props
}: ArtifactTitleProps & { ref?: React.Ref<HTMLHeadingElement> }) {
  return (
    <h3 ref={ref} className={cx("artifact__title", className)} {...props}>
      {children}
    </h3>
  );
}

export interface ArtifactDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ArtifactDescription({
  className,
  children,
  ref,
  ...props
}: ArtifactDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  return (
    <p ref={ref} className={cx("artifact__description", className)} {...props}>
      {children}
    </p>
  );
}

export interface ArtifactActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ArtifactActions({
  className,
  children,
  ref,
  ...props
}: ArtifactActionsProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("artifact__actions", className)} {...props}>
      {children}
    </div>
  );
}

export interface ArtifactActionProps extends Omit<
  ButtonProps,
  "children" | "variant" | "size" | "color" | "className"
> {
  className?: string;
  /** Accessible label for the button. */
  label?: string;
  /** Tooltip text shown on hover. Defaults to label. */
  tooltip?: string;
  /** The icon to render inside the button. */
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}

export function ArtifactAction({
  className,
  label,
  tooltip,
  icon,
  children,
  ...props
}: ArtifactActionProps) {
  const Icon = typeof icon === "function" ? icon : null;
  const accessibleLabel = label ?? tooltip;
  const button = (
    <Button
      variant="ghost"
      size="icon"
      aria-label={accessibleLabel}
      className={cx("artifact__action", className)}
      {...props}
    >
      {Icon ? <Icon /> : ((icon ?? children) as React.ReactNode)}
      {accessibleLabel ? <span className="sr-only">{accessibleLabel}</span> : null}
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipPortal>
        <TooltipPositioner>
          <TooltipPopup>{tooltip}</TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </Tooltip>
  );
}

export interface ArtifactCloseProps extends Omit<
  ButtonProps,
  "children" | "variant" | "size" | "color" | "className"
> {
  className?: string;
  /** Accessible label for the close button. */
  label?: string;
  children?: React.ReactNode;
}

export function ArtifactClose({
  className,
  label = "Close",
  children,
  ...props
}: ArtifactCloseProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            className={cx("artifact__close", className)}
            {...props}
          >
            {children ?? <XIcon />}
          </Button>
        }
      />
      <TooltipPortal>
        <TooltipPositioner>
          <TooltipPopup>{label}</TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </Tooltip>
  );
}

export interface ArtifactContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ArtifactContent({
  className,
  children,
  ref,
  ...props
}: ArtifactContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("artifact__content", className)} {...props}>
      {children}
    </div>
  );
}
