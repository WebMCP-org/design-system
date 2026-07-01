import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

export interface TabsProps extends Omit<BaseTabs.Root.Props, "className"> {
  className?: string;
  /**
   * The visual style variant.
   * @default 'default'
   */
  variant?: "default" | "bordered";
}

export interface TabsListProps extends Omit<BaseTabs.List.Props, "className"> {
  className?: string;
  variant?: "default" | "line" | null;
}

export interface TabProps extends Omit<BaseTabs.Tab.Props, "className"> {
  className?: string;
}

export interface TabPanelProps extends Omit<BaseTabs.Panel.Props, "className"> {
  className?: string;
}
export type TabsTriggerProps = TabProps;
export type TabsContentProps = TabPanelProps;

export interface TabsListVariantsOptions {
  variant?: "default" | "line" | null;
  className?: string;
}

export function tabsListVariants({ variant = "default", className }: TabsListVariantsOptions = {}) {
  return ["tabs__list", variant === "line" && "tabs__list--line", className]
    .filter(Boolean)
    .join(" ");
}

/**
 * A tabs component for organizing content into separate views.
 *
 * @example
 * ```tsx
 * <Tabs defaultValue="tab1">
 *   <TabsList>
 *     <Tab value="tab1">Tab 1</Tab>
 *     <Tab value="tab2">Tab 2</Tab>
 *   </TabsList>
 *   <TabPanel value="tab1">Content 1</TabPanel>
 *   <TabPanel value="tab2">Content 2</TabPanel>
 * </Tabs>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/tabs | Base UI Tabs}
 */
export function Tabs({
  orientation = "horizontal",
  variant = "default",
  className = "",
  ref,
  ...props
}: TabsProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["tabs", variant !== "default" && `tabs--${variant}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseTabs.Root
      ref={ref}
      data-orientation={orientation}
      data-slot="tabs"
      orientation={orientation}
      className={classes}
      {...props}
    />
  );
}

export function TabsList({
  className = "",
  variant = "default",
  ref,
  ...props
}: TabsListProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = tabsListVariants({ variant, className });
  return (
    <BaseTabs.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={classes}
      {...props}
    />
  );
}

export function Tab({
  className = "",
  ref,
  ...props
}: TabProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["tabs__tab", className].filter(Boolean).join(" ");
  return <BaseTabs.Tab ref={ref} data-slot="tabs-trigger" className={classes} {...props} />;
}

export function TabPanel({
  className = "",
  ref,
  ...props
}: TabPanelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["tabs__panel", className].filter(Boolean).join(" ");
  return <BaseTabs.Panel ref={ref} data-slot="tabs-content" className={classes} {...props} />;
}

export const TabsTrigger = Tab;
export const TabsContent = TabPanel;
