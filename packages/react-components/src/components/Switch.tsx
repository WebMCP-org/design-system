import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

export interface SwitchProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseSwitch.Root>,
  "className"
> {
  className?: string;
  /**
   * The size of the switch.
   * @default 'default'
   */
  size?: "sm" | "md" | "lg" | "default";
}

export interface SwitchThumbProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseSwitch.Thumb>,
  "className"
> {
  className?: string;
}

/**
 * A toggle switch component for binary choices.
 *
 * @example
 * ```tsx
 * <Switch defaultChecked>
 *   <SwitchThumb />
 * </Switch>
 * ```
 *
 * @example
 * ```tsx
 * // Controlled
 * const [checked, setChecked] = React.useState(false);
 * <Switch checked={checked} onCheckedChange={setChecked}>
 *   <SwitchThumb />
 * </Switch>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/switch | Base UI Switch}
 */
export function Switch({
  size = "default",
  className = "",
  children,
  ref,
  ...props
}: SwitchProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const normalizedSize = size === "md" ? "default" : size;
  const classes = ["switch", normalizedSize !== "default" && `switch--${normalizedSize}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <BaseSwitch.Root
      ref={ref}
      data-slot="switch"
      data-size={normalizedSize}
      className={classes}
      {...props}
    >
      {children ?? <SwitchThumb />}
    </BaseSwitch.Root>
  );
}

/**
 * The thumb indicator for the Switch component.
 */
export function SwitchThumb({
  className = "",
  ref,
  ...props
}: SwitchThumbProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const classes = ["switch__thumb", className].filter(Boolean).join(" ");
  return <BaseSwitch.Thumb ref={ref} data-slot="switch-thumb" className={classes} {...props} />;
}
