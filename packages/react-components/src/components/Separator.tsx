import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";

/**
 * Props for the Separator component.
 */
export interface SeparatorProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseSeparator>,
  "className"
> {
  /**
   * Whether the separator is purely visual.
   * @default true
   */
  decorative?: boolean;
  /**
   * Additional CSS class names.
   */
  className?: string;
}

/**
 * A visual divider component that separates content sections.
 *
 * @example
 * ```tsx
 * <Separator />
 *
 * <nav style={{ display: 'flex', alignItems: 'center' }}>
 *   <a href="/home">Home</a>
 *   <Separator orientation="vertical" />
 *   <a href="/about">About</a>
 * </nav>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/separator | Base UI Separator}
 */
export function Separator({
  orientation = "horizontal",
  decorative = true,
  className = "",
  ref,
  ...props
}: SeparatorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["separator", `separator--${orientation}`, className].filter(Boolean).join(" ");
  const accessibilityProps = decorative
    ? ({ role: "none", "aria-orientation": undefined } as const)
    : ({
        "aria-orientation": orientation === "vertical" ? orientation : undefined,
      } as const);

  return (
    <BaseSeparator
      ref={ref}
      data-slot="separator"
      {...accessibilityProps}
      orientation={orientation}
      className={classes}
      {...props}
    />
  );
}
