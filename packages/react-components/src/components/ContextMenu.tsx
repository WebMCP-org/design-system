import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { CheckIcon, ChevronRightIcon, DotIcon } from "./_internal/icons.js";

/**
 * Props for the ContextMenu.Root component.
 */
export interface ContextMenuProps extends React.ComponentPropsWithoutRef<
  typeof BaseContextMenu.Root
> {}

/**
 * Props for the ContextMenu.Trigger component.
 */
export interface ContextMenuTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Trigger>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the ContextMenu.Portal component.
 */
export interface ContextMenuPortalProps extends React.ComponentPropsWithoutRef<
  typeof BaseContextMenu.Portal
> {}

/**
 * Props for the ContextMenu.Positioner component.
 */
export interface ContextMenuPositionerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Positioner>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the ContextMenu.Popup component.
 */
export interface ContextMenuPopupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Popup>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the ContextMenu.Item component.
 */
export interface ContextMenuItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Item>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
}

/**
 * Props for the ContextMenu.Separator component.
 */
export interface ContextMenuSeparatorProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Separator>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}
export interface ContextMenuGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.Group>,
  "className"
> {
  className?: string;
}
export interface ContextMenuLabelProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.GroupLabel>,
  "className"
> {
  className?: string;
  inset?: boolean;
}
export interface ContextMenuCheckboxItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.CheckboxItem>,
  "className"
> {
  className?: string;
}
export interface ContextMenuRadioGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.RadioGroup>,
  "className"
> {
  className?: string;
}
export interface ContextMenuRadioItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.RadioItem>,
  "className"
> {
  className?: string;
}
export interface ContextMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}
export interface ContextMenuSubProps extends React.ComponentPropsWithoutRef<
  typeof BaseContextMenu.SubmenuRoot
> {}
export interface ContextMenuSubTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseContextMenu.SubmenuTrigger>,
  "className"
> {
  className?: string;
  inset?: boolean;
}
type ContextMenuPlacementProps = Pick<
  ContextMenuPositionerProps,
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
export type ContextMenuContentProps = ContextMenuPopupProps & ContextMenuPlacementProps;
export type ContextMenuSubContentProps = ContextMenuContentProps;

/**
 * Root component that manages context menu state.
 *
 * @example
 * ```tsx
 * <ContextMenu.Root>
 *   <ContextMenu.Trigger>Right click here</ContextMenu.Trigger>
 *   <ContextMenu.Portal>
 *     <ContextMenu.Positioner>
 *       <ContextMenu.Popup>
 *         <ContextMenu.Item>Cut</ContextMenu.Item>
 *         <ContextMenu.Item>Copy</ContextMenu.Item>
 *         <ContextMenu.Item>Paste</ContextMenu.Item>
 *       </ContextMenu.Popup>
 *     </ContextMenu.Positioner>
 *   </ContextMenu.Portal>
 * </ContextMenu.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/context-menu | Base UI ContextMenu}
 */
export const ContextMenuRoot = (props: ContextMenuProps) => {
  return <BaseContextMenu.Root data-slot="context-menu" {...props} />;
};

/**
 * Interactive area that activates the menu on right-click or long-press.
 */
export function ContextMenuTrigger({
  className = "",
  ref,
  ...props
}: ContextMenuTriggerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__trigger", className].filter(Boolean).join(" ");
  return (
    <BaseContextMenu.Trigger
      ref={ref}
      data-slot="context-menu-trigger"
      className={classes}
      {...props}
    />
  );
}

/**
 * Renders menu content in a portal.
 */
export const ContextMenuPortal = (props: ContextMenuPortalProps) => {
  return <BaseContextMenu.Portal data-slot="context-menu-portal" {...props} />;
};

/**
 * Positions the menu at the pointer location.
 */
export function ContextMenuPositioner({
  className = "",
  ref,
  ...props
}: ContextMenuPositionerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__positioner", className].filter(Boolean).join(" ");
  return (
    <BaseContextMenu.Positioner
      ref={ref}
      data-slot="context-menu-positioner"
      className={classes}
      {...props}
    />
  );
}

/**
 * Container for menu items.
 */
export function ContextMenuPopup({
  className = "",
  ref,
  ...props
}: ContextMenuPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__popup", className].filter(Boolean).join(" ");
  return (
    <BaseContextMenu.Popup
      ref={ref}
      data-slot="context-menu-content"
      className={classes}
      {...props}
    />
  );
}

export function ContextMenuContent({
  anchor,
  positionMethod,
  side,
  sideOffset,
  align,
  alignOffset,
  collisionBoundary,
  collisionPadding,
  sticky,
  arrowPadding,
  disableAnchorTracking,
  collisionAvoidance,
  ...props
}: ContextMenuContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ContextMenuPortal>
      <ContextMenuPositioner
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
        <ContextMenuPopup {...props} />
      </ContextMenuPositioner>
    </ContextMenuPortal>
  );
}

/**
 * Interactive menu item.
 */
export function ContextMenuItem({
  className = "",
  inset,
  variant = "default",
  ref,
  ...props
}: ContextMenuItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__item", inset && "context-menu__item--inset", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseContextMenu.Item
      ref={ref}
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={classes}
      {...props}
    />
  );
}

/**
 * Visual separator between menu sections.
 */
export function ContextMenuSeparator({
  className = "",
  ref,
  ...props
}: ContextMenuSeparatorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__separator", className].filter(Boolean).join(" ");
  return (
    <BaseContextMenu.Separator
      ref={ref}
      data-slot="context-menu-separator"
      className={classes}
      {...props}
    />
  );
}

export function ContextMenuGroup({
  className = "",
  ref,
  ...props
}: ContextMenuGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__group", className].filter(Boolean).join(" ");
  return (
    <BaseContextMenu.Group
      ref={ref}
      data-slot="context-menu-group"
      className={classes}
      {...props}
    />
  );
}

export function ContextMenuLabel({
  className = "",
  inset,
  ref,
  ...props
}: ContextMenuLabelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__label", inset && "context-menu__label--inset", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseContextMenu.GroupLabel
      ref={ref}
      data-slot="context-menu-label"
      data-inset={inset || undefined}
      className={classes}
      {...props}
    />
  );
}

export function ContextMenuCheckboxItem({
  className = "",
  children,
  ref,
  ...props
}: ContextMenuCheckboxItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__checkbox-item", className].filter(Boolean).join(" ");
  return (
    <BaseContextMenu.CheckboxItem
      ref={ref}
      data-slot="context-menu-checkbox-item"
      className={classes}
      {...props}
    >
      <BaseContextMenu.CheckboxItemIndicator className="context-menu__indicator">
        <CheckIcon />
      </BaseContextMenu.CheckboxItemIndicator>
      {children}
    </BaseContextMenu.CheckboxItem>
  );
}

export function ContextMenuRadioGroup({
  className = "",
  ref,
  ...props
}: ContextMenuRadioGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__radio-group", className].filter(Boolean).join(" ");
  return (
    <BaseContextMenu.RadioGroup
      ref={ref}
      data-slot="context-menu-radio-group"
      className={classes}
      {...props}
    />
  );
}

export function ContextMenuRadioItem({
  className = "",
  children,
  ref,
  ...props
}: ContextMenuRadioItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__radio-item", className].filter(Boolean).join(" ");
  return (
    <BaseContextMenu.RadioItem
      ref={ref}
      data-slot="context-menu-radio-item"
      className={classes}
      {...props}
    >
      <BaseContextMenu.RadioItemIndicator className="context-menu__indicator">
        <DotIcon size={8} />
      </BaseContextMenu.RadioItemIndicator>
      {children}
    </BaseContextMenu.RadioItem>
  );
}

export function ContextMenuShortcut({
  className = "",
  ref,
  ...props
}: ContextMenuShortcutProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const classes = ["context-menu__shortcut", className].filter(Boolean).join(" ");
  return <span ref={ref} data-slot="context-menu-shortcut" className={classes} {...props} />;
}

export function ContextMenuSub(props: ContextMenuSubProps) {
  return <BaseContextMenu.SubmenuRoot data-slot="context-menu-sub" {...props} />;
}

export function ContextMenuSubContent({
  side = "right",
  align = "start",
  sideOffset = 4,
  ...props
}: ContextMenuSubContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ContextMenuContent
      data-slot="context-menu-sub-content"
      side={side}
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export function ContextMenuSubTrigger({
  className = "",
  inset,
  children,
  ref,
  ...props
}: ContextMenuSubTriggerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["context-menu__submenu-trigger", inset && "context-menu__item--inset", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseContextMenu.SubmenuTrigger
      ref={ref}
      data-slot="context-menu-sub-trigger"
      data-inset={inset || undefined}
      className={classes}
      {...props}
    >
      {children}
      <ChevronRightIcon className="context-menu__submenu-icon" />
    </BaseContextMenu.SubmenuTrigger>
  );
}

/**
 * A context menu that appears at the pointer on right-click or long-press.
 * Provides keyboard navigation and supports nested submenus.
 *
 * @example
 * ```tsx
 * // Basic context menu
 * <ContextMenu.Root>
 *   <ContextMenu.Trigger>
 *     <div style={{ padding: '2rem', border: '1px dashed gray' }}>
 *       Right-click here
 *     </div>
 *   </ContextMenu.Trigger>
 *   <ContextMenu.Portal>
 *     <ContextMenu.Positioner>
 *       <ContextMenu.Popup>
 *         <ContextMenu.Item onClick={() => console.log('Cut')}>Cut</ContextMenu.Item>
 *         <ContextMenu.Item onClick={() => console.log('Copy')}>Copy</ContextMenu.Item>
 *         <ContextMenu.Item onClick={() => console.log('Paste')}>Paste</ContextMenu.Item>
 *         <ContextMenu.Separator />
 *         <ContextMenu.Item onClick={() => console.log('Delete')}>Delete</ContextMenu.Item>
 *       </ContextMenu.Popup>
 *     </ContextMenu.Positioner>
 *   </ContextMenu.Portal>
 * </ContextMenu.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/context-menu | Base UI ContextMenu}
 */
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Portal: ContextMenuPortal,
  Positioner: ContextMenuPositioner,
  Popup: ContextMenuPopup,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Separator: ContextMenuSeparator,
  Group: ContextMenuGroup,
  Label: ContextMenuLabel,
  CheckboxItem: ContextMenuCheckboxItem,
  RadioGroup: ContextMenuRadioGroup,
  RadioItem: ContextMenuRadioItem,
  Shortcut: ContextMenuShortcut,
  Sub: ContextMenuSub,
  SubContent: ContextMenuSubContent,
  SubTrigger: ContextMenuSubTrigger,
});
