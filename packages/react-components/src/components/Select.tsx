import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from "./_internal/icons.js";

// Context to track value -> label mappings
type SelectLabelsContextType = {
  labels: Map<unknown, React.ReactNode>;
  registerLabel: (value: unknown, label: React.ReactNode) => void;
  unregisterLabel: (value: unknown) => void;
};

const SelectLabelsContext = React.createContext<SelectLabelsContextType | null>(null);

export interface SelectProps extends React.ComponentPropsWithRef<typeof BaseSelect.Root> {
  /**
   * Static list of items for label resolution. Needed when options are inside
   * a portal (not mounted until opened) so SelectValue can display the correct
   * label on initial render.
   */
  items?: Array<{ label: React.ReactNode; value: unknown }>;
}

export interface SelectTriggerProps extends Omit<BaseSelect.Trigger.Props, "className"> {
  className?: string;
  /**
   * The size of the select trigger.
   * @default 'default'
   */
  size?: "sm" | "md" | "default";
}

export interface SelectValueProps extends Omit<BaseSelect.Value.Props, "children"> {
  placeholder?: string;
  children?: BaseSelect.Value.Props["children"];
}

export interface SelectPortalProps extends BaseSelect.Portal.Props {}
export interface SelectPositionerProps extends BaseSelect.Positioner.Props {}

export interface SelectPopupProps extends Omit<BaseSelect.Popup.Props, "className"> {
  className?: string;
}

export interface SelectListProps extends Omit<BaseSelect.List.Props, "className"> {
  className?: string;
}

export interface SelectOptionProps extends Omit<BaseSelect.Item.Props, "className"> {
  className?: string;
}

export interface SelectOptionGroupProps extends Omit<BaseSelect.Group.Props, "className"> {
  className?: string;
  label?: string;
}
export type SelectItemProps = SelectOptionProps;
export type SelectGroupProps = SelectOptionGroupProps;
export interface SelectLabelProps extends Omit<BaseSelect.GroupLabel.Props, "className"> {
  className?: string;
}
export interface SelectSeparatorProps extends Omit<BaseSelect.Separator.Props, "className"> {
  className?: string;
}
export interface SelectScrollUpButtonProps extends Omit<
  BaseSelect.ScrollUpArrow.Props,
  "className"
> {
  className?: string;
}
export interface SelectScrollDownButtonProps extends Omit<
  BaseSelect.ScrollDownArrow.Props,
  "className"
> {
  className?: string;
}
type SelectPlacementProps = Pick<
  SelectPositionerProps,
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
> & {
  position?: "popper" | "item-aligned";
};
export type SelectContentProps = SelectPopupProps & SelectPlacementProps;

/**
 * A select component for choosing from a list of options.
 *
 * @example
 * ```tsx
 * <Select defaultValue="option1">
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select..." />
 *   </SelectTrigger>
 *   <SelectPortal>
 *     <SelectPositioner>
 *       <SelectPopup>
 *         <SelectList>
 *           <SelectOption value="option1">Option 1</SelectOption>
 *           <SelectOption value="option2">Option 2</SelectOption>
 *         </SelectList>
 *       </SelectPopup>
 *     </SelectPositioner>
 *   </SelectPortal>
 * </Select>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/select | Base UI Select}
 */
export function Select({ items, ...props }: SelectProps) {
  const [labels, setLabels] = React.useState<Map<unknown, React.ReactNode>>(() => new Map());

  // Build a stable map from the items prop for immediate label resolution
  const itemLabels = React.useMemo(() => {
    if (!items) return null;
    const map = new Map<unknown, React.ReactNode>();
    for (const item of items) {
      map.set(item.value, item.label);
    }
    return map;
  }, [items]);

  const registerLabel = React.useCallback((value: unknown, label: React.ReactNode) => {
    setLabels((prev) => {
      if (prev.get(value) === label && prev.has(value)) return prev;
      const next = new Map(prev);
      next.set(value, label);
      return next;
    });
  }, []);

  const unregisterLabel = React.useCallback((value: unknown) => {
    setLabels((prev) => {
      if (!prev.has(value)) return prev;
      const next = new Map(prev);
      next.delete(value);
      return next;
    });
  }, []);

  // Merge: mounted option labels take priority, then fall back to items prop
  const mergedLabels = React.useMemo(() => {
    if (!itemLabels) return labels;
    const merged = new Map(itemLabels);
    for (const [k, v] of labels) {
      merged.set(k, v);
    }
    return merged;
  }, [labels, itemLabels]);

  const contextValue = React.useMemo(
    () => ({ labels: mergedLabels, registerLabel, unregisterLabel }),
    [mergedLabels, registerLabel, unregisterLabel],
  );

  return (
    <SelectLabelsContext.Provider value={contextValue}>
      <BaseSelect.Root data-slot="select" {...props} />
    </SelectLabelsContext.Provider>
  );
}

export function SelectTrigger({
  size = "default",
  className = "",
  children,
  ref,
  ...props
}: SelectTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const normalizedSize = size === "md" ? "default" : size;
  const classes = ["select__trigger", normalizedSize === "sm" && "select__trigger--sm", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseSelect.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={normalizedSize}
      className={classes}
      {...props}
    >
      {children}
      <BaseSelect.Icon className="select__icon">
        <ArrowDownIcon />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export function SelectValue({
  placeholder,
  children,
  ref,
  ...props
}: SelectValueProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const context = React.useContext(SelectLabelsContext);

  // If custom children provided, use that
  if (children) {
    return (
      <BaseSelect.Value ref={ref} data-slot="select-value" placeholder={placeholder} {...props}>
        {children}
      </BaseSelect.Value>
    );
  }

  // Otherwise, look up the label from context
  return (
    <BaseSelect.Value ref={ref} data-slot="select-value" {...props}>
      {(value) => {
        if (value === null || value === undefined || value === "") {
          return placeholder ? <span className="select__placeholder">{placeholder}</span> : null;
        }
        const label = context?.labels.get(value);
        return label ?? value;
      }}
    </BaseSelect.Value>
  );
}

export const SelectPortal = BaseSelect.Portal;

export function SelectPositioner({
  className = "",
  ref,
  ...props
}: SelectPositionerProps & { className?: string } & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["select__positioner", className].filter(Boolean).join(" ");
  return <BaseSelect.Positioner ref={ref} className={classes} {...props} />;
}

export function SelectPopup({
  className = "",
  ref,
  ...props
}: SelectPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["select__popup", className].filter(Boolean).join(" ");
  return <BaseSelect.Popup ref={ref} data-slot="select-content" className={classes} {...props} />;
}

export function SelectContent({
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
  position,
  children,
  ...props
}: SelectContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <BaseSelect.Portal>
      <SelectPositioner
        anchor={anchor}
        positionMethod={positionMethod}
        side={side}
        sideOffset={position === "item-aligned" ? 0 : sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
        arrowPadding={arrowPadding}
        disableAnchorTracking={disableAnchorTracking}
        collisionAvoidance={collisionAvoidance}
      >
        <SelectPopup {...props}>
          <SelectScrollUpButton />
          <SelectList>{children}</SelectList>
          <SelectScrollDownButton />
        </SelectPopup>
      </SelectPositioner>
    </BaseSelect.Portal>
  );
}

export function SelectList({
  className = "",
  ref,
  ...props
}: SelectListProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["select__list", className].filter(Boolean).join(" ");
  return <BaseSelect.List ref={ref} data-slot="select-viewport" className={classes} {...props} />;
}

export function SelectOption({
  className = "",
  value,
  children,
  ref,
  ...props
}: SelectOptionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const context = React.useContext(SelectLabelsContext);
  const contextRef = React.useRef(context);
  contextRef.current = context;
  const childrenRef = React.useRef(children);
  childrenRef.current = children;

  // Register children as label on mount (by value), unregister on unmount
  React.useEffect(() => {
    const ctx = contextRef.current;
    if (ctx && value !== undefined) {
      ctx.registerLabel(value, childrenRef.current);
      return () => ctx.unregisterLabel(value);
    }
  }, [value]);

  const classes = ["select__option", className].filter(Boolean).join(" ");
  return (
    <BaseSelect.Item ref={ref} data-slot="select-item" className={classes} value={value} {...props}>
      <span data-slot="select-item-indicator" className="select__item-indicator">
        <BaseSelect.ItemIndicator>
          <CheckIcon />
        </BaseSelect.ItemIndicator>
      </span>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}

export const SelectItem = SelectOption;

export function SelectOptionGroup({
  label,
  className = "",
  children,
  ref,
  ...props
}: SelectOptionGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["select__option-group", className].filter(Boolean).join(" ");
  return (
    <BaseSelect.Group ref={ref} data-slot="select-group" className={classes} {...props}>
      {label && (
        <BaseSelect.GroupLabel data-slot="select-label" className="select__group-label">
          {label}
        </BaseSelect.GroupLabel>
      )}
      {children}
    </BaseSelect.Group>
  );
}

export const SelectGroup = SelectOptionGroup;

export function SelectLabel({
  className = "",
  ref,
  ...props
}: SelectLabelProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["select__group-label", className].filter(Boolean).join(" ");
  return (
    <BaseSelect.GroupLabel ref={ref} data-slot="select-label" className={classes} {...props} />
  );
}

export function SelectSeparator({
  className = "",
  ref,
  ...props
}: SelectSeparatorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["select__separator", className].filter(Boolean).join(" ");
  return (
    <BaseSelect.Separator ref={ref} data-slot="select-separator" className={classes} {...props} />
  );
}

export function SelectScrollUpButton({
  className = "",
  children,
  ref,
  ...props
}: SelectScrollUpButtonProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["select__scroll-button", "select__scroll-button--up", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseSelect.ScrollUpArrow
      ref={ref}
      data-slot="select-scroll-up-button"
      className={classes}
      {...props}
    >
      {children ?? <ArrowUpIcon />}
    </BaseSelect.ScrollUpArrow>
  );
}

export function SelectScrollDownButton({
  className = "",
  children,
  ref,
  ...props
}: SelectScrollDownButtonProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["select__scroll-button", "select__scroll-button--down", className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseSelect.ScrollDownArrow
      ref={ref}
      data-slot="select-scroll-down-button"
      className={classes}
      {...props}
    >
      {children ?? <ArrowDownIcon />}
    </BaseSelect.ScrollDownArrow>
  );
}
