import * as React from "react";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { toggleVariants, type ToggleVariantsOptions } from "./Toggle.js";

type ToggleGroupSize = ToggleVariantsOptions["size"] | "md";

interface ToggleGroupContextValue {
  variant: ToggleVariantsOptions["variant"];
  size: ToggleVariantsOptions["size"];
  spacing: number;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: "default",
  size: "default",
  spacing: 0,
});

function normalizeSize(size: ToggleGroupSize): ToggleVariantsOptions["size"] {
  return size === "md" ? "default" : size;
}

export interface ToggleGroupProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseToggleGroup>,
  "className"
> {
  className?: string;
  variant?: ToggleVariantsOptions["variant"];
  /**
   * The size of the toggle group.
   * @default 'md'
   */
  size?: ToggleGroupSize;
  spacing?: number;
}

export interface ToggleGroupItemProps
  extends
    Omit<React.ComponentPropsWithRef<typeof BaseToggle>, "className">,
    ToggleVariantsOptions {}

/**
 * A toggle group component for selecting one or multiple options.
 *
 * @example
 * ```tsx
 * // Single selection (defaultValue is an array)
 * <ToggleGroup defaultValue={["center"]}>
 *   <ToggleGroupItem value="left">Left</ToggleGroupItem>
 *   <ToggleGroupItem value="center">Center</ToggleGroupItem>
 *   <ToggleGroupItem value="right">Right</ToggleGroupItem>
 * </ToggleGroup>
 * ```
 *
 * @example
 * ```tsx
 * // Multiple selection
 * <ToggleGroup multiple defaultValue={["bold", "italic"]}>
 *   <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
 *   <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
 *   <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
 * </ToggleGroup>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/toggle-group | Base UI Toggle Group}
 */
export function ToggleGroup({
  size = "md",
  spacing = 0,
  variant = "default",
  className = "",
  children,
  style,
  ref,
  ...props
}: ToggleGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const normalizedSize = normalizeSize(size);
  const gap = `${spacing * 0.25}rem`;
  const groupStyle: ToggleGroupProps["style"] =
    typeof style === "function" ? (state) => ({ ...style(state), gap }) : { ...style, gap };
  const classes = ["toggle-group", size !== "md" && `toggle-group--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <BaseToggleGroup
      ref={ref}
      data-size={normalizedSize}
      data-slot="toggle-group"
      data-spacing={spacing}
      data-variant={variant}
      className={classes}
      style={groupStyle}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size: normalizedSize, spacing }}>
        {children}
      </ToggleGroupContext.Provider>
    </BaseToggleGroup>
  );
}

/**
 * A single toggle item within a ToggleGroup.
 */
export function ToggleGroupItem({
  className = "",
  variant,
  size,
  ref,
  ...props
}: ToggleGroupItemProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const context = React.useContext(ToggleGroupContext);
  const itemVariant = variant ?? context.variant;
  const itemSize = size ?? context.size;
  const classes = [
    "toggle-group__item",
    toggleVariants({ variant: itemVariant, size: itemSize }),
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseToggle
      ref={ref}
      data-size={itemSize}
      data-slot="toggle-group-item"
      data-spacing={context.spacing}
      data-variant={itemVariant}
      className={classes}
      {...props}
    />
  );
}
