import * as React from "react";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { CheckIcon, ChevronRightIcon, DotIcon } from "./_internal/icons.js";

/**
 * Props for the Menubar component.
 */
export interface MenubarProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenubar>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menubar.Menu component.
 */
export interface MenubarMenuProps extends React.ComponentPropsWithoutRef<typeof BaseMenu.Root> {}

/**
 * Props for the Menubar.Trigger component.
 */
export interface MenubarTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menubar.Portal component.
 */
export interface MenubarPortalProps extends React.ComponentPropsWithoutRef<
  typeof BaseMenu.Portal
> {}

/**
 * Props for the Menubar.Positioner component.
 */
export interface MenubarPositionerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Positioner>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menubar.Popup component.
 */
export interface MenubarPopupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Popup>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menubar.Item component.
 */
export interface MenubarItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Item>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
}

/**
 * Props for the Menubar.Separator component.
 */
export interface MenubarSeparatorProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Separator>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menubar.Group component.
 */
export interface MenubarGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Group>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menubar.GroupLabel component.
 */
export interface MenubarGroupLabelProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
  inset?: boolean;
}
export interface MenubarCheckboxItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>,
  "className"
> {
  className?: string;
}
export interface MenubarRadioGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.RadioGroup>,
  "className"
> {
  className?: string;
}
export interface MenubarRadioItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>,
  "className"
> {
  className?: string;
}
export interface MenubarShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}
export interface MenubarSubProps extends React.ComponentPropsWithoutRef<
  typeof BaseMenu.SubmenuRoot
> {}
export interface MenubarSubTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>,
  "className"
> {
  className?: string;
  inset?: boolean;
}
type MenubarPlacementProps = Pick<
  MenubarPositionerProps,
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
export type MenubarContentProps = MenubarPopupProps & MenubarPlacementProps;
export type MenubarSubContentProps = MenubarContentProps;

/**
 * Root menubar container.
 *
 * @example
 * ```tsx
 * <Menubar.Root>
 *   <Menubar.Menu>
 *     <Menubar.Trigger>File</Menubar.Trigger>
 *     <Menubar.Portal>
 *       <Menubar.Positioner>
 *         <Menubar.Popup>
 *           <Menubar.Item>New</Menubar.Item>
 *           <Menubar.Item>Open</Menubar.Item>
 *           <Menubar.Item>Save</Menubar.Item>
 *         </Menubar.Popup>
 *       </Menubar.Positioner>
 *     </Menubar.Portal>
 *   </Menubar.Menu>
 * </Menubar.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/menubar | Base UI Menubar}
 */
export function MenubarRoot({
  className = "",
  ref,
  ...props
}: MenubarProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar", className].filter(Boolean).join(" ");
  return <BaseMenubar ref={ref} data-slot="menubar" className={classes} {...props} />;
}

/**
 * Individual menu within the menubar.
 */
export const MenubarMenu = (props: MenubarMenuProps) => {
  return <BaseMenu.Root {...props} />;
};

/**
 * Button that opens the menu.
 */
export function MenubarTrigger({
  className = "",
  ref,
  ...props
}: MenubarTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["menubar__trigger", className].filter(Boolean).join(" ");
  return <BaseMenu.Trigger ref={ref} data-slot="menubar-trigger" className={classes} {...props} />;
}

/**
 * Renders menu content in a portal.
 */
export const MenubarPortal = (props: MenubarPortalProps) => {
  return <BaseMenu.Portal data-slot="menubar-portal" {...props} />;
};

/**
 * Positions the menu popup.
 */
export function MenubarPositioner({
  className = "",
  ref,
  ...props
}: MenubarPositionerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__positioner", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Positioner ref={ref} data-slot="menubar-positioner" className={classes} {...props} />
  );
}

/**
 * Container for menu items.
 */
export function MenubarPopup({
  className = "",
  ref,
  ...props
}: MenubarPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__popup", className].filter(Boolean).join(" ");
  return <BaseMenu.Popup ref={ref} data-slot="menubar-content" className={classes} {...props} />;
}

export function MenubarContent({
  anchor,
  positionMethod,
  side,
  sideOffset = 8,
  align = "start",
  alignOffset = -4,
  collisionBoundary,
  collisionPadding,
  sticky,
  arrowPadding,
  disableAnchorTracking,
  collisionAvoidance,
  ...props
}: MenubarContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <BaseMenu.Portal>
      <MenubarPositioner
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
        <MenubarPopup {...props} />
      </MenubarPositioner>
    </BaseMenu.Portal>
  );
}

/**
 * Interactive menu item.
 */
export function MenubarItem({
  className = "",
  inset,
  variant = "default",
  ref,
  ...props
}: MenubarItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__item", inset && "menubar__item--inset", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseMenu.Item
      ref={ref}
      data-slot="menubar-item"
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
export function MenubarSeparator({
  className = "",
  ref,
  ...props
}: MenubarSeparatorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__separator", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Separator ref={ref} data-slot="menubar-separator" className={classes} {...props} />
  );
}

/**
 * Groups related menu items.
 */
export function MenubarGroup({
  className = "",
  ref,
  ...props
}: MenubarGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__group", className].filter(Boolean).join(" ");
  return <BaseMenu.Group ref={ref} data-slot="menubar-group" className={classes} {...props} />;
}

/**
 * Label for a menu item group.
 */
export function MenubarGroupLabel({
  className = "",
  inset,
  ref,
  ...props
}: MenubarGroupLabelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__group-label", inset && "menubar__group-label--inset", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseMenu.GroupLabel
      ref={ref}
      data-slot="menubar-label"
      data-inset={inset || undefined}
      className={classes}
      {...props}
    />
  );
}

export const MenubarLabel = MenubarGroupLabel;

export function MenubarCheckboxItem({
  className = "",
  children,
  ref,
  ...props
}: MenubarCheckboxItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__checkbox-item", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.CheckboxItem
      ref={ref}
      data-slot="menubar-checkbox-item"
      className={classes}
      {...props}
    >
      <BaseMenu.CheckboxItemIndicator className="menubar__indicator">
        <CheckIcon />
      </BaseMenu.CheckboxItemIndicator>
      {children}
    </BaseMenu.CheckboxItem>
  );
}

export function MenubarRadioGroup({
  className = "",
  ref,
  ...props
}: MenubarRadioGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__radio-group", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.RadioGroup ref={ref} data-slot="menubar-radio-group" className={classes} {...props} />
  );
}

export function MenubarRadioItem({
  className = "",
  children,
  ref,
  ...props
}: MenubarRadioItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__radio-item", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.RadioItem ref={ref} data-slot="menubar-radio-item" className={classes} {...props}>
      <BaseMenu.RadioItemIndicator className="menubar__indicator">
        <DotIcon size={8} />
      </BaseMenu.RadioItemIndicator>
      {children}
    </BaseMenu.RadioItem>
  );
}

export function MenubarShortcut({
  className = "",
  ref,
  ...props
}: MenubarShortcutProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const classes = ["menubar__shortcut", className].filter(Boolean).join(" ");
  return <span ref={ref} data-slot="menubar-shortcut" className={classes} {...props} />;
}

export function MenubarSub(props: MenubarSubProps) {
  return <BaseMenu.SubmenuRoot {...props} />;
}

export function MenubarSubContent({
  side = "right",
  align = "start",
  sideOffset = 4,
  ...props
}: MenubarSubContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <MenubarContent
      data-slot="menubar-sub-content"
      side={side}
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export function MenubarSubTrigger({
  className = "",
  inset,
  children,
  ref,
  ...props
}: MenubarSubTriggerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menubar__submenu-trigger", inset && "menubar__item--inset", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      data-slot="menubar-sub-trigger"
      data-inset={inset || undefined}
      className={classes}
      {...props}
    >
      {children}
      <ChevronRightIcon className="menubar__submenu-icon" />
    </BaseMenu.SubmenuTrigger>
  );
}

/**
 * A horizontal menu bar component typically used for application menus.
 * Provides keyboard navigation and supports nested submenus.
 *
 * @example
 * ```tsx
 * // Application menubar
 * <Menubar.Root>
 *   <Menubar.Menu>
 *     <Menubar.Trigger>File</Menubar.Trigger>
 *     <Menubar.Portal>
 *       <Menubar.Positioner>
 *         <Menubar.Popup>
 *           <Menubar.Item onClick={() => newFile()}>New</Menubar.Item>
 *           <Menubar.Item onClick={() => openFile()}>Open</Menubar.Item>
 *           <Menubar.Separator />
 *           <Menubar.Item onClick={() => saveFile()}>Save</Menubar.Item>
 *         </Menubar.Popup>
 *       </Menubar.Positioner>
 *     </Menubar.Portal>
 *   </Menubar.Menu>
 *   <Menubar.Menu>
 *     <Menubar.Trigger>Edit</Menubar.Trigger>
 *     <Menubar.Portal>
 *       <Menubar.Positioner>
 *         <Menubar.Popup>
 *           <Menubar.Item>Undo</Menubar.Item>
 *           <Menubar.Item>Redo</Menubar.Item>
 *           <Menubar.Separator />
 *           <Menubar.Item>Cut</Menubar.Item>
 *           <Menubar.Item>Copy</Menubar.Item>
 *           <Menubar.Item>Paste</Menubar.Item>
 *         </Menubar.Popup>
 *       </Menubar.Positioner>
 *     </Menubar.Portal>
 *   </Menubar.Menu>
 * </Menubar.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/menubar | Base UI Menubar}
 */
export const Menubar = Object.assign(MenubarRoot, {
  Root: MenubarRoot,
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Portal: MenubarPortal,
  Positioner: MenubarPositioner,
  Popup: MenubarPopup,
  Content: MenubarContent,
  Item: MenubarItem,
  Separator: MenubarSeparator,
  Group: MenubarGroup,
  GroupLabel: MenubarGroupLabel,
  Label: MenubarLabel,
  CheckboxItem: MenubarCheckboxItem,
  RadioGroup: MenubarRadioGroup,
  RadioItem: MenubarRadioItem,
  Shortcut: MenubarShortcut,
  Sub: MenubarSub,
  SubContent: MenubarSubContent,
  SubTrigger: MenubarSubTrigger,
});
