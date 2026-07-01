import * as React from "react";

/**
 * Props for the Card component.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable hover animation effects.
   * @default false
   */
  hover?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * A container component that provides consistent styling and elevation.
 *
 * @example
 * ```tsx
 * <Card>
 *   <h3>Title</h3>
 *   <p>Content</p>
 * </Card>
 *
 * <Card hover onClick={() => navigate('/details')}>
 *   Clickable card
 * </Card>
 * ```
 */
export function Card({
  hover = false,
  className = "",
  children,
  ref,
  ...props
}: CardProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["card", hover && "card--hover", className].filter(Boolean).join(" ");

  return (
    <div ref={ref} data-slot="card" className={classes} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  ref,
  ...props
}: CardHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={["card__header", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function CardTitle({
  className = "",
  ref,
  ...props
}: CardTitleProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="card-title"
      className={["card__title", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ref,
  ...props
}: CardDescriptionProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="card-description"
      className={["card__description", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function CardAction({
  className = "",
  ref,
  ...props
}: CardActionProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="card-action"
      className={["card__action", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function CardContent({
  className = "",
  ref,
  ...props
}: CardContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={["card__content", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

export function CardFooter({
  className = "",
  ref,
  ...props
}: CardFooterProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      className={["card__footer", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
