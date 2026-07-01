import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** ID of the form control this label names. */
  htmlFor?: string;
  /** Additional class names for layout only; use shared styles for visual variants. */
  className?: string;
  /** Label text or inline label content. */
  children?: React.ReactNode;
}

/**
 * A semantic label component for form inputs.
 *
 * Built internally as a thin styled wrapper over the native `label` element.
 * Use it to name inputs, checkboxes, radio controls, and field-level controls.
 * Do not use it for arbitrary text; use text elements or Field labels instead.
 *
 * Styling consumes Sigvelo typography, text, spacing, and disabled-state tokens.
 * Keep accessibility through `htmlFor` or by wrapping the control with the
 * label. Add variants here only if multiple apps need the same label treatment.
 *
 * @example
 * ```tsx
 * <Label htmlFor="username">Username</Label>
 * <Input id="username" type="text" />
 *
 * <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
 *   <Checkbox id="newsletter" />
 *   <Label htmlFor="newsletter">Subscribe to newsletter</Label>
 * </div>
 * ```
 */
export function Label({
  className = "",
  children,
  onMouseDown,
  ref,
  ...props
}: LabelProps & { ref?: React.Ref<HTMLLabelElement> }) {
  const classes = ["label", className].filter(Boolean).join(" ");

  return (
    <label
      ref={ref}
      data-slot="label"
      className={classes}
      onMouseDown={(event) => {
        if ((event.target as HTMLElement).closest("button, input, select, textarea")) {
          return;
        }

        onMouseDown?.(event);
        if (!event.defaultPrevented && event.detail > 1) {
          event.preventDefault();
        }
      }}
      {...props}
    >
      {children}
    </label>
  );
}
