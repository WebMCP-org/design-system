import * as React from "react";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";

export interface ToggleVariantsOptions {
  variant?: "default" | "outline" | null;
  size?: "default" | "sm" | "lg" | null;
  className?: string;
}

/**
 * Props for the Toggle component.
 */
export interface ToggleProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof BaseToggle>, "className">,
    ToggleVariantsOptions {}

export function toggleVariants({
  variant = "default",
  size = "default",
  className,
}: ToggleVariantsOptions = {}) {
  return [
    "toggle",
    variant === "outline" && "toggle--outline",
    size !== "default" && `toggle--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * A two-state button that can be on (pressed) or off.
 * Useful for toggling a setting or mode.
 *
 * @example
 * ```tsx
 * // Basic toggle
 * <Toggle>
 *   Bold
 * </Toggle>
 * ```
 *
 * @example
 * ```tsx
 * // Controlled toggle
 * const [pressed, setPressed] = useState(false);
 *
 * <Toggle pressed={pressed} onPressedChange={setPressed}>
 *   {pressed ? 'On' : 'Off'}
 * </Toggle>
 * ```
 *
 * @example
 * ```tsx
 * // With icons
 * <Toggle>
 *   {({ pressed }) => pressed ? <BoldIcon filled /> : <BoldIcon />}
 * </Toggle>
 * ```
 *
 * @example
 * ```tsx
 * // Default pressed state
 * <Toggle defaultPressed>
 *   Enabled
 * </Toggle>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/toggle | Base UI Toggle}
 */
export function Toggle({
  className = "",
  variant,
  size,
  ref,
  ...props
}: ToggleProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = toggleVariants({ variant, size, className });
  return <BaseToggle ref={ref} data-slot="toggle" className={classes} {...props} />;
}
