import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";

/**
 * Props for the Popover.Root component.
 */
export interface PopoverProps extends React.ComponentPropsWithoutRef<typeof BasePopover.Root> {}

/**
 * Props for the Popover.Trigger component.
 */
export interface PopoverTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Trigger>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

export interface PopoverAnchorProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Props for the Popover.Portal component.
 */
export interface PopoverPortalProps extends React.ComponentPropsWithoutRef<
  typeof BasePopover.Portal
> {}

/**
 * Props for the Popover.Backdrop component.
 */
export interface PopoverBackdropProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Backdrop>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Popover.Positioner component.
 */
export interface PopoverPositionerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Popover.Popup component.
 */
export interface PopoverPopupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Popup>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Popover.Arrow component.
 */
export interface PopoverArrowProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Arrow>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Popover.Title component.
 */
export interface PopoverTitleProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Title>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Popover.Description component.
 */
export interface PopoverDescriptionProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Description>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Popover.Close component.
 */
export interface PopoverCloseProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BasePopover.Close>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}
type PopoverPlacementProps = Pick<
  PopoverPositionerProps,
  | "anchor"
  | "positionMethod"
  | "side"
  | "sideOffset"
  | "align"
  | "alignOffset"
  | "collisionBoundary"
  | "collisionPadding"
  | "sticky"
  | "arrowPadding"
  | "disableAnchorTracking"
  | "collisionAvoidance"
>;
export type PopoverContentProps = PopoverPopupProps & PopoverPlacementProps;
export interface PopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const PopoverAnchorContext = React.createContext<React.RefObject<HTMLDivElement | null> | null>(
  null,
);

function setRefs<T>(node: T, ...refs: Array<React.Ref<T> | undefined>) {
  for (const ref of refs) {
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }
}

/**
 * Controls the popover's open state and manages triggers.
 *
 * @example
 * ```tsx
 * <Popover.Root>
 *   <Popover.Trigger>Open</Popover.Trigger>
 *   <Popover.Portal>
 *     <Popover.Positioner>
 *       <Popover.Popup>
 *         <Popover.Title>Popover Title</Popover.Title>
 *         <Popover.Description>Content here</Popover.Description>
 *       </Popover.Popup>
 *     </Popover.Positioner>
 *   </Popover.Portal>
 * </Popover.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/popover | Base UI Popover}
 */
export const PopoverRoot = (props: PopoverProps) => {
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  return (
    <PopoverAnchorContext.Provider value={anchorRef}>
      <BasePopover.Root data-slot="popover" {...props} />
    </PopoverAnchorContext.Provider>
  );
};

export function PopoverAnchor({
  className = "",
  ref,
  ...props
}: PopoverAnchorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const anchorRef = React.useContext(PopoverAnchorContext);
  const classes = ["popover__anchor", className].filter(Boolean).join(" ");
  return (
    <div
      ref={(node) => setRefs(node, anchorRef, ref)}
      data-slot="popover-anchor"
      className={classes}
      {...props}
    />
  );
}

/**
 * Button that toggles the popover visibility.
 * Renders a `<button>` element.
 */
export function PopoverTrigger({
  className = "",
  ref,
  ...props
}: PopoverTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["popover__trigger", className].filter(Boolean).join(" ");
  return (
    <BasePopover.Trigger ref={ref} data-slot="popover-trigger" className={classes} {...props} />
  );
}

/**
 * Renders popover content in a portal outside the DOM hierarchy.
 */
export const PopoverPortal = (props: PopoverPortalProps) => {
  return <BasePopover.Portal {...props} />;
};

/**
 * Optional backdrop that appears behind the popover.
 */
export function PopoverBackdrop({
  className = "",
  ref,
  ...props
}: PopoverBackdropProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["popover__backdrop", className].filter(Boolean).join(" ");
  return (
    <BasePopover.Backdrop ref={ref} data-slot="popover-backdrop" className={classes} {...props} />
  );
}

/**
 * Positions the popup relative to the trigger element.
 *
 * @example
 * ```tsx
 * // Position on the right with offset
 * <Popover.Positioner side="right" sideOffset={8}>
 *   <Popover.Popup>...</Popover.Popup>
 * </Popover.Positioner>
 * ```
 */
export function PopoverPositioner({
  className = "",
  anchor,
  ref,
  ...props
}: PopoverPositionerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const anchorRef = React.useContext(PopoverAnchorContext);
  const classes = ["popover__positioner", className].filter(Boolean).join(" ");
  return (
    <BasePopover.Positioner
      ref={ref}
      anchor={anchor ?? anchorRef ?? undefined}
      className={classes}
      {...props}
    />
  );
}

/**
 * The popup container that holds the popover content.
 */
export function PopoverPopup({
  className = "",
  ref,
  ...props
}: PopoverPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["popover__popup", className].filter(Boolean).join(" ");
  return <BasePopover.Popup ref={ref} data-slot="popover-content" className={classes} {...props} />;
}

export function PopoverContent({
  anchor,
  positionMethod,
  side,
  sideOffset = 4,
  align = "center",
  alignOffset,
  collisionBoundary,
  collisionPadding,
  sticky,
  arrowPadding,
  disableAnchorTracking,
  collisionAvoidance,
  ...props
}: PopoverContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <PopoverPortal>
      <PopoverPositioner
        anchor={anchor}
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
        arrowPadding={arrowPadding}
        disableAnchorTracking={disableAnchorTracking}
        collisionAvoidance={collisionAvoidance}
      >
        <PopoverPopup {...props} />
      </PopoverPositioner>
    </PopoverPortal>
  );
}

export function PopoverHeader({
  className = "",
  ref,
  ...props
}: PopoverHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["popover__header", className].filter(Boolean).join(" ");
  return <div ref={ref} data-slot="popover-header" className={classes} {...props} />;
}

/**
 * Directional arrow pointing to the trigger element.
 */
export function PopoverArrow({
  className = "",
  ref,
  ...props
}: PopoverArrowProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["popover__arrow", className].filter(Boolean).join(" ");
  return <BasePopover.Arrow ref={ref} data-slot="popover-arrow" className={classes} {...props} />;
}

/**
 * Semantic title for the popover content.
 * Renders an `<h2>` element.
 */
export function PopoverTitle({
  className = "",
  ref,
  ...props
}: PopoverTitleProps & { ref?: React.Ref<HTMLHeadingElement> }) {
  const classes = ["popover__title", className].filter(Boolean).join(" ");
  return <BasePopover.Title ref={ref} data-slot="popover-title" className={classes} {...props} />;
}

/**
 * Description text for the popover content.
 * Renders a `<p>` element.
 */
export function PopoverDescription({
  className = "",
  ref,
  ...props
}: PopoverDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  const classes = ["popover__description", className].filter(Boolean).join(" ");
  return (
    <BasePopover.Description
      ref={ref}
      data-slot="popover-description"
      className={classes}
      {...props}
    />
  );
}

/**
 * Button that closes the popover.
 */
export function PopoverClose({
  className = "",
  ref,
  ...props
}: PopoverCloseProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["popover__close", className].filter(Boolean).join(" ");
  return <BasePopover.Close ref={ref} data-slot="popover-close" className={classes} {...props} />;
}

/**
 * An accessible popup anchored to a trigger button.
 * Supports flexible positioning, animations, and optional backdrop.
 *
 * @example
 * ```tsx
 * // Basic popover
 * <Popover.Root>
 *   <Popover.Trigger>Click me</Popover.Trigger>
 *   <Popover.Portal>
 *     <Popover.Positioner>
 *       <Popover.Popup>
 *         <Popover.Title>Settings</Popover.Title>
 *         <Popover.Description>
 *           Configure your preferences here.
 *         </Popover.Description>
 *         <Popover.Close>Close</Popover.Close>
 *       </Popover.Popup>
 *     </Popover.Positioner>
 *   </Popover.Portal>
 * </Popover.Root>
 * ```
 *
 * @example
 * ```tsx
 * // With arrow and custom positioning
 * <Popover.Root>
 *   <Popover.Trigger>Info</Popover.Trigger>
 *   <Popover.Portal>
 *     <Popover.Positioner side="right" sideOffset={8}>
 *       <Popover.Popup>
 *         <Popover.Arrow />
 *         <p>Additional information</p>
 *       </Popover.Popup>
 *     </Popover.Positioner>
 *   </Popover.Portal>
 * </Popover.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/popover | Base UI Popover}
 */
export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Anchor: PopoverAnchor,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Backdrop: PopoverBackdrop,
  Positioner: PopoverPositioner,
  Popup: PopoverPopup,
  Content: PopoverContent,
  Header: PopoverHeader,
  Arrow: PopoverArrow,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
});
