import { Button as BaseButton } from "@base-ui/react/button";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from "react";

/**
 * The visual rendering style of the button.
 *
 * - `normal` - Filled background (default)
 * - `outline` - Low-emphasis with border, transparent background
 * - `ghost` - Minimal style, background appears on hover
 * - `link` - Appears as a text link with underline on hover
 */
export type ButtonVariant = "normal" | "outline" | "ghost" | "link";

/**
 * The semantic color intent of the button.
 *
 * - `neutral` - Medium-emphasis actions, muted background
 * - `primary` - High-emphasis actions, uses primary brand color
 * - `destructive` - Dangerous or irreversible actions
 */
export type ButtonColor = "neutral" | "primary" | "destructive";

/**
 * Available button sizes.
 *
 * - `xs` - Extra small, 1.75rem height
 * - `sm` - Small, 2rem height
 * - `md` - Medium (default), 2.5rem height
 * - `lg` - Large, 2.75rem height
 * - `xl` - Extra large, 3.25rem height
 * - `icon` - Square button for icon-only content
 */
export type ButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

export type ShadcnButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ShadcnButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

export interface ButtonVariantsOptions {
  variant?: ShadcnButtonVariant | ButtonVariant | null;
  color?: ButtonColor | null;
  size?: ShadcnButtonSize | ButtonSize | null;
  className?: string;
}

const SHADCN_BUTTON_VARIANT: Record<ShadcnButtonVariant, [ButtonVariant, ButtonColor]> = {
  default: ["normal", "primary"],
  destructive: ["normal", "destructive"],
  outline: ["outline", "neutral"],
  secondary: ["normal", "neutral"],
  ghost: ["ghost", "neutral"],
  link: ["link", "primary"],
};

const SHADCN_BUTTON_SIZE: Record<ShadcnButtonSize, ButtonSize> = {
  default: "md",
  xs: "xs",
  sm: "sm",
  lg: "lg",
  icon: "icon",
  "icon-xs": "icon-xs",
  "icon-sm": "icon-sm",
  "icon-lg": "icon-lg",
};

export function buttonVariants({
  variant = "default",
  color,
  size = "default",
  className,
}: ButtonVariantsOptions = {}) {
  const buttonVariant = variant ?? "default";
  const mapped =
    buttonVariant === "normal" ||
    buttonVariant === "outline" ||
    buttonVariant === "ghost" ||
    buttonVariant === "link"
      ? ([buttonVariant, color ?? "primary"] as const)
      : SHADCN_BUTTON_VARIANT[buttonVariant];
  const requestedSize = size ?? "default";
  const buttonSize =
    requestedSize === "default"
      ? "md"
      : (SHADCN_BUTTON_SIZE[requestedSize as ShadcnButtonSize] ?? requestedSize);

  return [
    "button",
    `button--${mapped[0]}`,
    `button--${color ?? mapped[1]}`,
    `button--${buttonSize}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Props for the Button component.
 */
type BaseButtonProps = ComponentPropsWithoutRef<typeof BaseButton>;

export interface ButtonProps
  extends
    BaseButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps | "color"> {
  /**
   * The visual rendering style of the button.
   * @default 'default'
   */
  variant?: ShadcnButtonVariant | ButtonVariant;

  /**
   * The semantic color intent of the button.
   * @default 'primary'
   */
  color?: ButtonColor;

  /**
   * The size of the button.
   * @default 'md'
   */
  size?: ShadcnButtonSize | ButtonSize;
}

/**
 * A button component built on Base UI with semantic styling variants.
 *
 * Separates visual style (`variant`) from color intent (`color`) for
 * maximum flexibility. Supports keyboard navigation, focus management, and
 * accessibility out of the box. Keeps shadcn-compatible variant and size
 * aliases for migration, while styling through Sigvelo CSS tokens.
 *
 * @example
 * ```tsx
 * <Button color="primary">Save changes</Button>
 * <Button color="destructive">Delete account</Button>
 * <Button variant="outline">Cancel</Button>
 * <Button variant="ghost" size="icon"><SearchIcon /></Button>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/button | Base UI Button}
 * @see {@link https://ui.shadcn.com/docs/components/base/button | shadcn/ui Button}
 */
export function Button({
  variant = "default",
  color,
  size = "default",
  className,
  nativeButton,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes =
    typeof className === "function"
      ? (state: BaseButton.State) =>
          buttonVariants({ variant, color, size, className: className(state) })
      : buttonVariants({ variant, color, size, className });

  // A `render` override means the caller is substituting the underlying element — very often a
  // non-<button> (a link or router component). In that case default Base UI's `nativeButton` to
  // false so the rendered element keeps proper button semantics (role/keyboard) instead of warning
  // about lost native semantics. With no `render`, keep the native <button> default. An explicit
  // `nativeButton` prop always wins.
  const resolvedNativeButton = nativeButton ?? props.render == null;

  return (
    <BaseButton
      ref={ref}
      data-slot="button"
      className={classes}
      nativeButton={resolvedNativeButton}
      {...props}
    />
  );
}
