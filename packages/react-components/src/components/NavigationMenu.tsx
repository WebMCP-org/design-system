import * as React from "react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import { ChevronDownIcon } from "./_internal/icons.js";

/**
 * Props for the NavigationMenu.Root component.
 */
export interface NavigationMenuProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Root>,
  "className"
> {
  className?: string;
  viewport?: boolean;
}

/**
 * Props for the NavigationMenu.List component.
 */
export interface NavigationMenuListProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.List>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Item component.
 */
export interface NavigationMenuItemProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Item>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Trigger component.
 */
export interface NavigationMenuTriggerProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Trigger>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Icon component.
 */
export interface NavigationMenuIconProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Icon>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Content component.
 */
export interface NavigationMenuContentProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Content>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Link component.
 */
export interface NavigationMenuLinkProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Link>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Portal component.
 */
export type NavigationMenuPortalProps = React.ComponentPropsWithoutRef<
  typeof BaseNavigationMenu.Portal
>;

/**
 * Props for the NavigationMenu.Positioner component.
 */
export interface NavigationMenuPositionerProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Positioner>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Popup component.
 */
export interface NavigationMenuPopupProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Popup>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Viewport component.
 */
export interface NavigationMenuViewportProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Viewport>,
  "className"
> {
  className?: string;
}

/**
 * Props for the NavigationMenu.Arrow component.
 */
export interface NavigationMenuArrowProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseNavigationMenu.Arrow>,
  "className"
> {
  className?: string;
}

// Styled wrapper components

/**
 * Navigation landmark for top-level or section-level links. Compose with
 * NavigationMenu.List, NavigationMenu.Item, NavigationMenu.Trigger, and
 * NavigationMenu.Content for disclosure-style navigation.
 *
 * Sigvelo changes: wraps Base UI NavigationMenu with stable class names and
 * CSS-token styling, and removes invalid `aria-orientation` from the rendered
 * list for axe compatibility.
 *
 * Use for app or section navigation. Do not use it for command menus or
 * context actions. Base UI owns keyboard navigation and focus behavior; apps
 * provide meaningful link text and panel content.
 *
 * @example
 * ```tsx
 * <NavigationMenu.Root>
 *   <NavigationMenu.List>
 *     <NavigationMenu.Item>
 *       <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
 *       <NavigationMenu.Portal>
 *         <NavigationMenu.Positioner>
 *           <NavigationMenu.Popup>
 *             <NavigationMenu.Content>
 *               <NavigationMenu.Link href="/products">All products</NavigationMenu.Link>
 *             </NavigationMenu.Content>
 *           </NavigationMenu.Popup>
 *         </NavigationMenu.Positioner>
 *       </NavigationMenu.Portal>
 *     </NavigationMenu.Item>
 *   </NavigationMenu.List>
 * </NavigationMenu.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/navigation-menu | Base UI NavigationMenu}
 */
function Root({
  className = "",
  children,
  viewport = true,
  ref,
  ...props
}: NavigationMenuProps & { ref?: React.Ref<HTMLElement> }) {
  const classes = ["navigation-menu", className].filter(Boolean).join(" ");
  const shouldRenderViewport =
    viewport &&
    !hasChildOfType(children, NavigationMenuPortal) &&
    !hasChildOfType(children, BaseNavigationMenu.Portal);

  return (
    <BaseNavigationMenu.Root
      ref={ref}
      render={<nav />}
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={classes}
      {...props}
    >
      {children}
      {shouldRenderViewport && (
        <NavigationMenuPortal>
          <NavigationMenuPositioner sideOffset={4}>
            <NavigationMenuPopup>
              <NavigationMenuViewport />
            </NavigationMenuPopup>
          </NavigationMenuPositioner>
        </NavigationMenuPortal>
      )}
    </BaseNavigationMenu.Root>
  );
}

export function NavigationMenuList({
  className = "",
  ref,
  ...props
}: NavigationMenuListProps & { ref?: React.Ref<HTMLUListElement> }) {
  const classes = ["navigation-menu__list", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.List
      ref={ref}
      data-slot="navigation-menu-list"
      className={classes}
      // Override aria-orientation as it's not permitted on <ul> elements (role="list")
      // See: https://dequeuniversity.com/rules/axe/4.11/aria-allowed-attr
      aria-orientation={undefined}
      {...props}
    />
  );
}

export function NavigationMenuItem({
  className = "",
  ref,
  ...props
}: NavigationMenuItemProps & { ref?: React.Ref<HTMLLIElement> }) {
  const classes = ["navigation-menu__item", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Item
      ref={ref}
      data-slot="navigation-menu-item"
      className={classes}
      {...props}
    />
  );
}

export function NavigationMenuTrigger({
  className = "",
  children,
  ref,
  ...props
}: NavigationMenuTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["navigation-menu__trigger", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Trigger
      ref={ref}
      data-slot="navigation-menu-trigger"
      className={classes}
      {...props}
    >
      {children}
      {hasChildOfType(children, NavigationMenuIcon) ? null : (
        <NavigationMenuIcon>
          <ChevronDownIcon size={12} />
        </NavigationMenuIcon>
      )}
    </BaseNavigationMenu.Trigger>
  );
}

export function NavigationMenuIcon({
  className = "",
  ref,
  ...props
}: NavigationMenuIconProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["navigation-menu__icon", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Icon
      ref={ref}
      data-slot="navigation-menu-icon"
      className={classes}
      {...props}
    />
  );
}

export function NavigationMenuContent({
  className = "",
  ref,
  ...props
}: NavigationMenuContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["navigation-menu__content", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Content
      ref={ref}
      data-slot="navigation-menu-content"
      className={classes}
      {...props}
    />
  );
}

export function NavigationMenuLink({
  className = "",
  ref,
  ...props
}: NavigationMenuLinkProps & { ref?: React.Ref<HTMLAnchorElement> }) {
  const classes = ["navigation-menu__link", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Link
      ref={ref}
      data-slot="navigation-menu-link"
      className={classes}
      {...props}
    />
  );
}

export function NavigationMenuPortal(props: NavigationMenuPortalProps) {
  return <BaseNavigationMenu.Portal data-slot="navigation-menu-portal" {...props} />;
}

export function NavigationMenuPositioner({
  className = "",
  ref,
  ...props
}: NavigationMenuPositionerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["navigation-menu__positioner", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Positioner
      ref={ref}
      data-slot="navigation-menu-positioner"
      className={classes}
      {...props}
    />
  );
}

export function NavigationMenuPopup({
  className = "",
  ref,
  ...props
}: NavigationMenuPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["navigation-menu__popup", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Popup
      ref={ref}
      data-slot="navigation-menu-popup"
      className={classes}
      {...props}
    />
  );
}

export function NavigationMenuViewport({
  className = "",
  ref,
  ...props
}: NavigationMenuViewportProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["navigation-menu__viewport", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Viewport
      ref={ref}
      data-slot="navigation-menu-viewport"
      className={classes}
      {...props}
    />
  );
}

export function NavigationMenuArrow({
  className = "",
  ref,
  ...props
}: NavigationMenuArrowProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["navigation-menu__arrow", className].filter(Boolean).join(" ");
  return (
    <BaseNavigationMenu.Arrow
      ref={ref}
      data-slot="navigation-menu-arrow"
      className={classes}
      {...props}
    />
  );
}

/**
 * A navigation menu component for website navigation with dropdown support.
 * Provides keyboard navigation and supports nested submenus.
 *
 * @example
 * ```tsx
 * // Basic navigation menu
 * <NavigationMenu.Root>
 *   <NavigationMenu.List>
 *     <NavigationMenu.Item>
 *       <NavigationMenu.Trigger>
 *         Products
 *         <NavigationMenu.Icon>
 *           <ChevronDownIcon />
 *         </NavigationMenu.Icon>
 *       </NavigationMenu.Trigger>
 *       <NavigationMenu.Content>
 *         <NavigationMenu.Link href="/products/analytics">
 *           Analytics
 *         </NavigationMenu.Link>
 *         <NavigationMenu.Link href="/products/automation">
 *           Automation
 *         </NavigationMenu.Link>
 *       </NavigationMenu.Content>
 *     </NavigationMenu.Item>
 *     <NavigationMenu.Item>
 *       <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
 *     </NavigationMenu.Item>
 *   </NavigationMenu.List>
 *   <NavigationMenu.Portal>
 *     <NavigationMenu.Positioner>
 *       <NavigationMenu.Popup>
 *         <NavigationMenu.Viewport />
 *       </NavigationMenu.Popup>
 *     </NavigationMenu.Positioner>
 *   </NavigationMenu.Portal>
 * </NavigationMenu.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/navigation-menu | Base UI NavigationMenu}
 */
export const NavigationMenu = Object.assign(Root, {
  Root,
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Icon: NavigationMenuIcon,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  Portal: NavigationMenuPortal,
  Positioner: NavigationMenuPositioner,
  Popup: NavigationMenuPopup,
  Viewport: NavigationMenuViewport,
  Arrow: NavigationMenuArrow,
});

export function NavigationMenuIndicator(
  props: NavigationMenuIconProps & { ref?: React.Ref<HTMLDivElement> },
) {
  return <NavigationMenuIcon data-slot="navigation-menu-indicator" {...props} />;
}

export function navigationMenuTriggerStyle({ className }: { className?: string } = {}) {
  return ["navigation-menu__trigger", className].filter(Boolean).join(" ");
}

function hasChildOfType(children: React.ReactNode, type: React.ElementType): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) {
      return false;
    }

    if (child.type === type) {
      return true;
    }

    if (child.type === React.Fragment) {
      return hasChildOfType((child.props as { children?: React.ReactNode }).children, type);
    }

    return false;
  });
}
