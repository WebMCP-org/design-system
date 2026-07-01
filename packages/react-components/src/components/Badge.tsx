import * as React from "react";

export type BadgeVariant = "normal" | "outline" | "ghost" | "link";
export type BadgeColor = "neutral" | "primary" | "success" | "destructive" | "warning";
export type ShadcnBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export interface BadgeVariantsOptions {
  variant?: ShadcnBadgeVariant | BadgeVariant | null;
  color?: BadgeColor | null;
  size?: "sm" | "md" | null;
  className?: string;
}

const SHADCN_BADGE_VARIANT: Record<ShadcnBadgeVariant, [BadgeVariant, BadgeColor]> = {
  default: ["normal", "primary"],
  secondary: ["normal", "neutral"],
  destructive: ["normal", "destructive"],
  outline: ["outline", "neutral"],
  ghost: ["ghost", "neutral"],
  link: ["link", "primary"],
};

const BADGE_VARIANT_DEFAULT_COLOR: Record<BadgeVariant, BadgeColor> = {
  normal: "primary",
  outline: "neutral",
  ghost: "neutral",
  link: "primary",
};

export function badgeVariants({
  variant = "default",
  color,
  size = "md",
  className,
}: BadgeVariantsOptions = {}) {
  const badgeVariant = variant ?? "default";
  const mapped =
    badgeVariant === "normal" ||
    badgeVariant === "outline" ||
    badgeVariant === "ghost" ||
    badgeVariant === "link"
      ? ([badgeVariant, color ?? BADGE_VARIANT_DEFAULT_COLOR[badgeVariant]] as const)
      : SHADCN_BADGE_VARIANT[badgeVariant];

  return [
    "badge",
    `badge--${mapped[0]}`,
    `badge--${color ?? mapped[1]}`,
    size !== "md" && `badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type SlottableBadgeProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

type BadgeSlotProps = SlottableBadgeProps & {
  "data-slot": "badge";
  "data-variant": ShadcnBadgeVariant | BadgeVariant;
};

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as { current: T | null }).current = value;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> | undefined {
  const activeRefs = refs.filter(Boolean);

  if (activeRefs.length === 0) {
    return undefined;
  }

  return (value) => {
    for (const activeRef of activeRefs) {
      assignRef(activeRef, value);
    }
  };
}

function isEventHandler(propName: string, value: unknown): value is (...args: unknown[]) => void {
  return /^on[A-Z]/.test(propName) && typeof value === "function";
}

function mergeSlottedBadgeProps(
  childProps: SlottableBadgeProps,
  badgeProps: BadgeSlotProps,
): BadgeSlotProps {
  const mergedProps: Record<string, unknown> = { ...childProps, ...badgeProps };
  const badgePropsRecord = badgeProps as unknown as Record<string, unknown>;

  for (const propName of Object.keys(childProps)) {
    const childValue = (childProps as Record<string, unknown>)[propName];
    const badgeValue = badgePropsRecord[propName];

    if (isEventHandler(propName, childValue) && isEventHandler(propName, badgeValue)) {
      mergedProps[propName] = (...args: unknown[]) => {
        childValue(...args);
        badgeValue(...args);
      };
    }
  }

  mergedProps.className = [childProps.className, badgeProps.className].filter(Boolean).join(" ");
  mergedProps.style =
    childProps.style || badgeProps.style ? { ...childProps.style, ...badgeProps.style } : undefined;
  mergedProps.ref = mergeRefs(childProps.ref, badgeProps.ref);
  mergedProps["data-slot"] = "badge";
  mergedProps["data-variant"] = badgeProps["data-variant"];

  return mergedProps as unknown as BadgeSlotProps;
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The visual rendering style of the badge.
   * @default 'default'
   */
  variant?: ShadcnBadgeVariant | BadgeVariant;
  /**
   * The semantic color intent of the badge.
   * @default 'primary'
   */
  color?: BadgeColor;
  /**
   * The size of the badge.
   * @default 'md'
   */
  size?: "sm" | "md";
  /**
   * Render the badge styles onto the child element.
   *
   * Mirrors shadcn's `asChild` API for link badges and custom elements.
   * @default false
   */
  asChild?: boolean;
}

/**
 * A badge component for highlighting status, labels, or categories.
 *
 * @example
 * ```tsx
 * <Badge>Default</Badge>
 * <Badge color="success">Active</Badge>
 * <Badge color="warning">Pending</Badge>
 * <Badge variant="outline">Info</Badge>
 * <Badge asChild><a href="/docs">Docs</a></Badge>
 * ```
 */
export function Badge({
  variant = "default",
  color,
  size = "md",
  className,
  asChild = false,
  children,
  ref,
  ...props
}: BadgeProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const badgeVariant = variant ?? "default";
  const classes = badgeVariants({ variant, color, size, className });

  if (asChild && React.isValidElement<SlottableBadgeProps>(children)) {
    return React.cloneElement(
      children,
      mergeSlottedBadgeProps(children.props, {
        ...(props as SlottableBadgeProps),
        ref: ref as React.Ref<HTMLElement>,
        className: classes,
        "data-slot": "badge",
        "data-variant": badgeVariant,
      }),
    );
  }

  return (
    <span ref={ref} data-slot="badge" data-variant={badgeVariant} className={classes} {...props}>
      {children}
    </span>
  );
}
