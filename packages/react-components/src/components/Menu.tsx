import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";

/**
 * Props for the Menu.Root component.
 */
export interface MenuProps extends React.ComponentPropsWithoutRef<typeof BaseMenu.Root> {}

/**
 * Props for the Menu.Trigger component.
 */
export interface MenuTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.Portal component.
 */
export interface MenuPortalProps extends React.ComponentPropsWithoutRef<typeof BaseMenu.Portal> {}

/**
 * Props for the Menu.Positioner component.
 */
export interface MenuPositionerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Positioner>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.Popup component.
 */
export interface MenuPopupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Popup>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}
type MenuPlacementProps = Pick<
  MenuPositionerProps,
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
export type MenuContentProps = MenuPopupProps & MenuPlacementProps;

/**
 * Props for the Menu.Item component.
 */
export interface MenuItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Item>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
  inset?: boolean;
  variant?: "default" | "destructive";
}

/**
 * Props for the Menu.Group component.
 */
export interface MenuGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Group>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.GroupLabel component.
 */
export interface MenuGroupLabelProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
  inset?: boolean;
}
export type MenuLabelProps = MenuGroupLabelProps;

/**
 * Props for the Menu.Arrow component.
 */
export interface MenuArrowProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Arrow>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.Separator component.
 */
export interface MenuSeparatorProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.Separator>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.RadioGroup component.
 */
export interface MenuRadioGroupProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.RadioGroup>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.RadioItem component.
 */
export interface MenuRadioItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.RadioItemIndicator component.
 */
export interface MenuRadioItemIndicatorProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.RadioItemIndicator>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.CheckboxItem component.
 */
export interface MenuCheckboxItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Menu.CheckboxItemIndicator component.
 */
export interface MenuCheckboxItemIndicatorProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItemIndicator>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
}
export interface MenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}
export interface MenuSubProps extends React.ComponentPropsWithoutRef<typeof BaseMenu.SubmenuRoot> {}
export type MenuSubContentProps = MenuContentProps;

/**
 * Props for the Menu.SubmenuTrigger component.
 */
export interface MenuSubmenuTriggerProps extends Omit<
  React.ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>,
  "className"
> {
  /** Additional CSS class names */
  className?: string;
  inset?: boolean;
}
export type MenuSubTriggerProps = MenuSubmenuTriggerProps;

/**
 * Root component that manages menu state.
 *
 * @example
 * ```tsx
 * <Menu.Root>
 *   <Menu.Trigger>Actions</Menu.Trigger>
 *   <Menu.Portal>
 *     <Menu.Positioner>
 *       <Menu.Popup>
 *         <Menu.Item>Edit</Menu.Item>
 *         <Menu.Item>Delete</Menu.Item>
 *       </Menu.Popup>
 *     </Menu.Positioner>
 *   </Menu.Portal>
 * </Menu.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/menu | Base UI Menu}
 */
export const MenuRoot = (props: MenuProps) => {
  return <BaseMenu.Root data-slot="dropdown-menu" {...props} />;
};

/**
 * Button that toggles the menu visibility.
 */
export function MenuTrigger({
  className = "",
  ref,
  ...props
}: MenuTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["menu__trigger", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Trigger ref={ref} data-slot="dropdown-menu-trigger" className={classes} {...props} />
  );
}

/**
 * Renders menu content in a portal.
 */
export const MenuPortal = (props: MenuPortalProps) => {
  return <BaseMenu.Portal data-slot="dropdown-menu-portal" {...props} />;
};

/**
 * Positions the menu popup relative to the trigger.
 */
export function MenuPositioner({
  className = "",
  ref,
  ...props
}: MenuPositionerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__positioner", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Positioner
      ref={ref}
      data-slot="dropdown-menu-positioner"
      className={classes}
      {...props}
    />
  );
}

/**
 * Container for menu items.
 */
export function MenuPopup({
  className = "",
  ref,
  ...props
}: MenuPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__popup", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Popup ref={ref} data-slot="dropdown-menu-content" className={classes} {...props} />
  );
}

export function MenuContent({
  anchor,
  positionMethod,
  side,
  sideOffset = 4,
  align,
  alignOffset,
  collisionBoundary,
  collisionPadding,
  sticky,
  arrowPadding,
  disableAnchorTracking,
  collisionAvoidance,
  ...props
}: MenuContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <MenuPortal>
      <MenuPositioner
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
        <MenuPopup {...props} />
      </MenuPositioner>
    </MenuPortal>
  );
}

/**
 * Interactive menu item.
 */
export function MenuItem({
  className = "",
  inset,
  variant = "default",
  ref,
  ...props
}: MenuItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__item", inset && "menu__item--inset", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={classes}
      {...props}
    />
  );
}

/**
 * Groups related menu items.
 */
export function MenuGroup({
  className = "",
  ref,
  ...props
}: MenuGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__group", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Group ref={ref} data-slot="dropdown-menu-group" className={classes} {...props} />
  );
}

/**
 * Label for a group of menu items.
 */
export function MenuGroupLabel({
  className = "",
  inset,
  ref,
  ...props
}: MenuGroupLabelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__group-label", inset && "menu__group-label--inset", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseMenu.GroupLabel
      ref={ref}
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={classes}
      {...props}
    />
  );
}

export const MenuLabel = MenuGroupLabel;

/**
 * Arrow pointing to the trigger.
 */
export function MenuArrow({
  className = "",
  ref,
  ...props
}: MenuArrowProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__arrow", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Arrow ref={ref} data-slot="dropdown-menu-arrow" className={classes} {...props} />
  );
}

/**
 * Visual separator between menu sections.
 */
export function MenuSeparator({
  className = "",
  ref,
  ...props
}: MenuSeparatorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__separator", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.Separator
      ref={ref}
      data-slot="dropdown-menu-separator"
      className={classes}
      {...props}
    />
  );
}

/**
 * Group for exclusive radio selection.
 */
export function MenuRadioGroup({
  className = "",
  ref,
  ...props
}: MenuRadioGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__radio-group", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.RadioGroup
      ref={ref}
      data-slot="dropdown-menu-radio-group"
      className={classes}
      {...props}
    />
  );
}

/**
 * Radio item for exclusive selection.
 */
export function MenuRadioItem({
  className = "",
  children,
  ref,
  ...props
}: MenuRadioItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__radio-item", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.RadioItem
      ref={ref}
      data-slot="dropdown-menu-radio-item"
      className={classes}
      {...props}
    >
      {hasChildOfType(children, MenuRadioItemIndicator) ? (
        children
      ) : (
        <>
          <MenuRadioItemIndicator />
          {children}
        </>
      )}
    </BaseMenu.RadioItem>
  );
}

/**
 * Indicator for selected radio item.
 */
export function MenuRadioItemIndicator({
  className = "",
  ref,
  ...props
}: MenuRadioItemIndicatorProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const classes = ["menu__radio-indicator", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.RadioItemIndicator
      ref={ref}
      data-slot="dropdown-menu-radio-item-indicator"
      className={classes}
      {...props}
    />
  );
}

/**
 * Checkbox item for toggling options.
 */
export function MenuCheckboxItem({
  className = "",
  children,
  ref,
  ...props
}: MenuCheckboxItemProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__checkbox-item", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.CheckboxItem
      ref={ref}
      data-slot="dropdown-menu-checkbox-item"
      className={classes}
      {...props}
    >
      {hasChildOfType(children, MenuCheckboxItemIndicator) ? (
        children
      ) : (
        <>
          <MenuCheckboxItemIndicator />
          {children}
        </>
      )}
    </BaseMenu.CheckboxItem>
  );
}

/**
 * Indicator for checked checkbox item.
 */
export function MenuCheckboxItemIndicator({
  className = "",
  ref,
  ...props
}: MenuCheckboxItemIndicatorProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const classes = ["menu__checkbox-indicator", className].filter(Boolean).join(" ");
  return (
    <BaseMenu.CheckboxItemIndicator
      ref={ref}
      data-slot="dropdown-menu-checkbox-item-indicator"
      className={classes}
      {...props}
    />
  );
}

export function MenuShortcut({
  className = "",
  ref,
  ...props
}: MenuShortcutProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const classes = ["menu__shortcut", className].filter(Boolean).join(" ");
  return <span ref={ref} data-slot="dropdown-menu-shortcut" className={classes} {...props} />;
}

export function MenuSub(props: MenuSubProps) {
  return <BaseMenu.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

export function MenuSubContent({
  side = "right",
  align,
  sideOffset = 4,
  ...props
}: MenuSubContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <MenuContent
      data-slot="dropdown-menu-sub-content"
      side={side}
      align={align}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

/**
 * Trigger that opens a submenu.
 */
export function MenuSubmenuTrigger({
  className = "",
  inset,
  ref,
  ...props
}: MenuSubmenuTriggerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["menu__submenu-trigger", inset && "menu__item--inset", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      className={classes}
      {...props}
    />
  );
}

export const MenuSubTrigger = MenuSubmenuTrigger;

function hasChildOfType(children: React.ReactNode, type: React.ElementType) {
  return React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === type,
  );
}

/**
 * A dropdown menu with keyboard navigation support.
 * Provides items, groups, checkboxes, radio selections, and nested submenus.
 *
 * @example
 * ```tsx
 * // Basic menu
 * <Menu.Root>
 *   <Menu.Trigger>Actions</Menu.Trigger>
 *   <Menu.Portal>
 *     <Menu.Positioner>
 *       <Menu.Popup>
 *         <Menu.Item onClick={() => console.log('Edit')}>Edit</Menu.Item>
 *         <Menu.Item onClick={() => console.log('Copy')}>Copy</Menu.Item>
 *         <Menu.Separator />
 *         <Menu.Item onClick={() => console.log('Delete')}>Delete</Menu.Item>
 *       </Menu.Popup>
 *     </Menu.Positioner>
 *   </Menu.Portal>
 * </Menu.Root>
 * ```
 *
 * @example
 * ```tsx
 * // Menu with checkbox items
 * <Menu.Root>
 *   <Menu.Trigger>View Options</Menu.Trigger>
 *   <Menu.Portal>
 *     <Menu.Positioner>
 *       <Menu.Popup>
 *         <Menu.CheckboxItem checked={showGrid} onCheckedChange={setShowGrid}>
 *           <Menu.CheckboxItemIndicator />
 *           Show Grid
 *         </Menu.CheckboxItem>
 *       </Menu.Popup>
 *     </Menu.Positioner>
 *   </Menu.Portal>
 * </Menu.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/menu | Base UI Menu}
 */
export const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Portal: MenuPortal,
  Positioner: MenuPositioner,
  Popup: MenuPopup,
  Content: MenuContent,
  Item: MenuItem,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Label: MenuLabel,
  Arrow: MenuArrow,
  Separator: MenuSeparator,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  RadioItemIndicator: MenuRadioItemIndicator,
  CheckboxItem: MenuCheckboxItem,
  CheckboxItemIndicator: MenuCheckboxItemIndicator,
  Shortcut: MenuShortcut,
  Sub: MenuSub,
  SubContent: MenuSubContent,
  SubTrigger: MenuSubTrigger,
  SubmenuTrigger: MenuSubmenuTrigger,
});
