import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";

// Styled wrapper components

export function ComboboxInput({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.Input>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLInputElement> }) {
  const classes = ["combobox__input", className].filter(Boolean).join(" ");
  return <BaseCombobox.Input ref={ref} data-slot="combobox-input" className={classes} {...props} />;
}

export function ComboboxTrigger({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.Trigger>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["combobox__trigger", className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.Trigger ref={ref} data-slot="combobox-trigger" className={classes} {...props} />
  );
}

function Clear({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.Clear>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["combobox__clear", className].filter(Boolean).join(" ");
  return <BaseCombobox.Clear ref={ref} data-slot="combobox-clear" className={classes} {...props} />;
}

export function ComboboxPositioner({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.Positioner>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["combobox__positioner", className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.Positioner
      ref={ref}
      data-slot="combobox-positioner"
      className={classes}
      {...props}
    />
  );
}

export function ComboboxPopup({
  className = "",
  tabIndex = 0,
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.Popup>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["combobox__popup", className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.Popup
      ref={ref}
      data-slot="combobox-content"
      tabIndex={tabIndex}
      className={classes}
      {...props}
    />
  );
}

export function ComboboxList({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.List>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["combobox__list", className].filter(Boolean).join(" ");
  return <BaseCombobox.List ref={ref} data-slot="combobox-list" className={classes} {...props} />;
}

export function ComboboxItem({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.Item>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["combobox__item", className].filter(Boolean).join(" ");
  return <BaseCombobox.Item ref={ref} data-slot="combobox-item" className={classes} {...props} />;
}

function ItemIndicator({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.ItemIndicator>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLSpanElement> }) {
  const classes = ["combobox__item-indicator", className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.ItemIndicator
      ref={ref}
      data-slot="combobox-item-indicator"
      className={classes}
      {...props}
    />
  );
}

export function ComboboxEmpty({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.Empty>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["combobox__empty", className].filter(Boolean).join(" ");
  return <BaseCombobox.Empty ref={ref} data-slot="combobox-empty" className={classes} {...props} />;
}

export function ComboboxGroup({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.Group>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["combobox__group", className].filter(Boolean).join(" ");
  return <BaseCombobox.Group ref={ref} data-slot="combobox-group" className={classes} {...props} />;
}

export function ComboboxLabel({
  className = "",
  ref,
  ...props
}: Omit<React.ComponentPropsWithRef<typeof BaseCombobox.GroupLabel>, "className"> & {
  className?: string;
} & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["combobox__group-label", className].filter(Boolean).join(" ");
  return (
    <BaseCombobox.GroupLabel
      ref={ref}
      data-slot="combobox-group-label"
      className={classes}
      {...props}
    />
  );
}

/**
 * An input combined with a filterable list of predefined items.
 * Supports single and multiple selection, async search, and grouping.
 *
 * @example
 * ```tsx
 * // Basic single select
 * const fruits = [
 *   { label: 'Apple', value: 'apple' },
 *   { label: 'Banana', value: 'banana' },
 *   { label: 'Orange', value: 'orange' },
 * ];
 *
 * <Combobox.Root items={fruits}>
 *   <Combobox.Input placeholder="Select a fruit" />
 *   <Combobox.Trigger>
 *     <ChevronDownIcon />
 *   </Combobox.Trigger>
 *   <Combobox.Portal>
 *     <Combobox.Positioner>
 *       <Combobox.Popup>
 *         <Combobox.List>
 *           {(item) => (
 *             <Combobox.Item value={item}>
 *               <Combobox.ItemIndicator>
 *                 <CheckIcon />
 *               </Combobox.ItemIndicator>
 *               {item.label}
 *             </Combobox.Item>
 *           )}
 *         </Combobox.List>
 *         <Combobox.Empty>No results found</Combobox.Empty>
 *       </Combobox.Popup>
 *     </Combobox.Positioner>
 *   </Combobox.Portal>
 * </Combobox.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/combobox | Base UI Combobox}
 */
export const ComboboxContent = ComboboxPopup;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxChips = BaseCombobox.Chips;
export const ComboboxChip = BaseCombobox.Chip;
export const ComboboxChipsInput = ComboboxInput;
export const ComboboxCollection = BaseCombobox.Collection;
export const ComboboxSeparator = BaseCombobox.Separator;

export function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export const Combobox = Object.assign(BaseCombobox.Root, {
  Root: BaseCombobox.Root,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Clear,
  Portal: BaseCombobox.Portal,
  Positioner: ComboboxPositioner,
  Popup: ComboboxPopup,
  Content: ComboboxContent,
  List: ComboboxList,
  Item: ComboboxItem,
  ItemIndicator,
  Empty: ComboboxEmpty,
  Group: ComboboxGroup,
  GroupLabel: ComboboxLabel,
  Label: ComboboxLabel,
  Value: ComboboxValue,
  Chips: ComboboxChips,
  Chip: ComboboxChip,
  ChipsInput: ComboboxChipsInput,
  Collection: ComboboxCollection,
  Separator: ComboboxSeparator,
});
