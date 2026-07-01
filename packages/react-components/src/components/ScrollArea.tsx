import * as React from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";

/**
 * Props for the ScrollArea.Root component.
 */
export interface ScrollAreaRootProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseScrollArea.Root>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the ScrollArea.Viewport component.
 */
export interface ScrollAreaViewportProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseScrollArea.Viewport>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the ScrollArea.Scrollbar component.
 */
export interface ScrollAreaScrollbarProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseScrollArea.Scrollbar>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the ScrollArea.Thumb component.
 */
export interface ScrollAreaThumbProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseScrollArea.Thumb>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the ScrollArea.Corner component.
 */
export interface ScrollAreaCornerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseScrollArea.Corner>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Container that groups all scroll area parts. Renders a `<div>` element.
 *
 * @example
 * ```tsx
 * <ScrollArea.Root>
 *   <ScrollArea.Viewport>
 *     <div>Scrollable content...</div>
 *   </ScrollArea.Viewport>
 *   <ScrollArea.Scrollbar>
 *     <ScrollArea.Thumb />
 *   </ScrollArea.Scrollbar>
 * </ScrollArea.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/scroll-area | Base UI ScrollArea}
 */
export function ScrollAreaRoot({
  className = "",
  ref,
  ...props
}: ScrollAreaRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["scroll-area", className].filter(Boolean).join(" ");
  return <BaseScrollArea.Root ref={ref} data-slot="scroll-area" className={classes} {...props} />;
}

/**
 * The scrollable viewport container.
 */
export function ScrollAreaViewport({
  className = "",
  tabIndex = 0,
  role = "group",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ref,
  ...props
}: ScrollAreaViewportProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["scroll-area__viewport", className].filter(Boolean).join(" ");
  return (
    <BaseScrollArea.Viewport
      ref={ref}
      data-slot="scroll-area-viewport"
      role={role}
      aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : "Scrollable content")}
      aria-labelledby={ariaLabelledBy}
      tabIndex={tabIndex}
      className={classes}
      {...props}
    />
  );
}

/**
 * The scrollbar track, either vertical or horizontal.
 */
export function ScrollAreaScrollbar({
  className = "",
  orientation = "vertical",
  ref,
  ...props
}: ScrollAreaScrollbarProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["scroll-area__scrollbar", className].filter(Boolean).join(" ");
  return (
    <BaseScrollArea.Scrollbar
      ref={ref}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={classes}
      {...props}
    />
  );
}

export const ScrollBar = ScrollAreaScrollbar;

/**
 * The draggable scrollbar thumb indicator.
 */
export function ScrollAreaThumb({
  className = "",
  ref,
  ...props
}: ScrollAreaThumbProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["scroll-area__thumb", className].filter(Boolean).join(" ");
  return (
    <BaseScrollArea.Thumb ref={ref} data-slot="scroll-area-thumb" className={classes} {...props} />
  );
}

/**
 * Small rectangle at the intersection of scrollbars.
 */
export function ScrollAreaCorner({
  className = "",
  ref,
  ...props
}: ScrollAreaCornerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["scroll-area__corner", className].filter(Boolean).join(" ");
  return <BaseScrollArea.Corner ref={ref} className={classes} {...props} />;
}

function hasScrollAreaParts(children: React.ReactNode) {
  return React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === ScrollAreaViewport ||
        child.type === ScrollAreaScrollbar ||
        child.type === ScrollAreaCorner),
  );
}

function ScrollAreaDefault({
  children,
  ...props
}: ScrollAreaRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  if (hasScrollAreaParts(children)) {
    return <ScrollAreaRoot {...props}>{children}</ScrollAreaRoot>;
  }

  return (
    <ScrollAreaRoot {...props}>
      <ScrollAreaViewport>{children}</ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollAreaRoot>
  );
}

/**
 * A native scroll container with custom-styled scrollbars.
 * Provides smooth scrolling and customizable appearance.
 *
 * @example
 * ```tsx
 * // Vertical scroll
 * <ScrollArea.Root style={{ height: 200 }}>
 *   <ScrollArea.Viewport>
 *     <div>Long content...</div>
 *   </ScrollArea.Viewport>
 *   <ScrollArea.Scrollbar>
 *     <ScrollArea.Thumb />
 *   </ScrollArea.Scrollbar>
 * </ScrollArea.Root>
 * ```
 *
 * @example
 * ```tsx
 * // Both scrollbars
 * <ScrollArea.Root style={{ height: 200, width: 300 }}>
 *   <ScrollArea.Viewport>
 *     <div style={{ width: 600 }}>Wide and tall content...</div>
 *   </ScrollArea.Viewport>
 *   <ScrollArea.Scrollbar orientation="vertical">
 *     <ScrollArea.Thumb />
 *   </ScrollArea.Scrollbar>
 *   <ScrollArea.Scrollbar orientation="horizontal">
 *     <ScrollArea.Thumb />
 *   </ScrollArea.Scrollbar>
 *   <ScrollArea.Corner />
 * </ScrollArea.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/scroll-area | Base UI ScrollArea}
 */
export const ScrollArea = Object.assign(ScrollAreaDefault, {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Corner: ScrollAreaCorner,
});
