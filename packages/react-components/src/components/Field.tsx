import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";

/**
 * Props for the Field.Root component.
 */
export interface FieldRootProps extends React.ComponentPropsWithoutRef<typeof BaseField.Root> {
  /** Additional CSS class names */
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
}

/**
 * Props for the Field.Label component.
 */
export interface FieldLabelProps extends React.ComponentPropsWithoutRef<typeof BaseField.Label> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Field.Control component.
 */
export interface FieldControlProps extends React.ComponentPropsWithoutRef<
  typeof BaseField.Control
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Field.Description component.
 */
export interface FieldDescriptionProps extends React.ComponentPropsWithoutRef<
  typeof BaseField.Description
> {
  /** Additional CSS class names */
  className?: string;
}

/**
 * Props for the Field.Error component.
 */
export interface FieldErrorProps extends React.ComponentPropsWithoutRef<typeof BaseField.Error> {
  /** Additional CSS class names */
  className?: string;
  errors?: Array<{ message?: string } | string | undefined>;
}

/**
 * Props for the Field.Validity component.
 */
export interface FieldValidityProps extends React.ComponentPropsWithoutRef<
  typeof BaseField.Validity
> {}
export interface FieldSetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {}
export interface FieldLegendProps extends React.HTMLAttributes<HTMLLegendElement> {
  variant?: "legend" | "label";
}
export interface FieldContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface FieldTitleProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface FieldSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Container that groups all field parts together.
 * Provides context for label association and validation state.
 *
 * @example
 * ```tsx
 * <Field.Root>
 *   <Field.Label>Username</Field.Label>
 *   <Field.Control placeholder="Enter username" />
 *   <Field.Description>Choose a unique username</Field.Description>
 * </Field.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/field | Base UI Field}
 */
export function FieldRoot({
  className = "",
  orientation = "vertical",
  ref,
  ...props
}: FieldRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["field", orientation !== "vertical" && `field--${orientation}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <BaseField.Root
      ref={ref}
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={classes}
      {...props}
    />
  );
}

/**
 * Accessible label that is automatically associated with the field control.
 * No need to manually wire up `htmlFor` and `id` attributes.
 *
 * @example
 * ```tsx
 * <Field.Root>
 *   <Field.Label>Email address</Field.Label>
 *   <Field.Control type="email" />
 * </Field.Root>
 * ```
 */
export function FieldLabel({
  className = "",
  ref,
  ...props
}: FieldLabelProps & { ref?: React.Ref<HTMLLabelElement> }) {
  const classes = ["field__label", className].filter(Boolean).join(" ");
  return <BaseField.Label ref={ref} data-slot="field-label" className={classes} {...props} />;
}

/**
 * The input control element. Renders an `<input>` by default.
 * Can be replaced with other form controls using the `render` prop.
 *
 * @example
 * ```tsx
 * // Default input
 * <Field.Control placeholder="Enter text" />
 *
 * // With custom input component
 * <Field.Control render={<Textarea />} />
 * ```
 */
export function FieldControl({
  className = "",
  ref,
  ...props
}: FieldControlProps & { ref?: React.Ref<HTMLInputElement> }) {
  const classes = ["field__control", className].filter(Boolean).join(" ");
  return <BaseField.Control ref={ref} data-slot="field-control" className={classes} {...props} />;
}

/**
 * Supplementary helper text that describes the field.
 * Automatically associated with the control for accessibility.
 *
 * @example
 * ```tsx
 * <Field.Root>
 *   <Field.Label>Password</Field.Label>
 *   <Field.Control type="password" />
 *   <Field.Description>Must be at least 8 characters</Field.Description>
 * </Field.Root>
 * ```
 */
export function FieldDescription({
  className = "",
  ref,
  ...props
}: FieldDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  const classes = ["field__description", className].filter(Boolean).join(" ");
  return (
    <BaseField.Description ref={ref} data-slot="field-description" className={classes} {...props} />
  );
}

/**
 * Displays validation error messages when the field is invalid.
 * Use the `match` prop to show different messages for different validity states.
 *
 * @example
 * ```tsx
 * <Field.Root>
 *   <Field.Label>Email</Field.Label>
 *   <Field.Control type="email" required />
 *   <Field.Error match="valueMissing">Email is required</Field.Error>
 *   <Field.Error match="typeMismatch">Please enter a valid email</Field.Error>
 * </Field.Root>
 * ```
 *
 * Common `match` values:
 * - `valueMissing` - Required field is empty
 * - `typeMismatch` - Value doesn't match input type (e.g., invalid email)
 * - `tooShort` - Value is shorter than `minLength`
 * - `tooLong` - Value is longer than `maxLength`
 * - `patternMismatch` - Value doesn't match the `pattern` regex
 * - `rangeUnderflow` - Number is less than `min`
 * - `rangeOverflow` - Number is greater than `max`
 */
export function FieldError({
  className = "",
  errors,
  children,
  ref,
  ...props
}: FieldErrorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["field__error", className].filter(Boolean).join(" ");
  if (errors === undefined) {
    return (
      <BaseField.Error ref={ref} data-slot="field-error" className={classes} {...props}>
        {children}
      </BaseField.Error>
    );
  }

  const messages = [
    ...new Set(
      errors.map((error) => (typeof error === "string" ? error : error?.message)).filter(Boolean),
    ),
  ];
  const content =
    children ??
    (messages.length === 1 ? (
      messages[0]
    ) : messages.length > 1 ? (
      <ul className="field__error-list">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    ) : null);

  if (!content) return null;

  const divProps = props as React.HTMLAttributes<HTMLDivElement>;

  return (
    <div ref={ref} role="alert" data-slot="field-error" className={classes} {...divProps}>
      {content}
    </div>
  );
}

/**
 * Renders custom content based on the field's validity state.
 * Uses a render function that receives the validity state object.
 *
 * @example
 * ```tsx
 * <Field.Root>
 *   <Field.Label>Username</Field.Label>
 *   <Field.Control required minLength={3} />
 *   <Field.Validity>
 *     {(validity) => {
 *       if (validity.valueMissing) return <span>Username is required</span>;
 *       if (validity.tooShort) return <span>Username is too short</span>;
 *       return null;
 *     }}
 *   </Field.Validity>
 * </Field.Root>
 * ```
 */
export const FieldValidity = BaseField.Validity;

export function FieldSet({
  className = "",
  ref,
  ...props
}: FieldSetProps & { ref?: React.Ref<HTMLFieldSetElement> }) {
  const classes = ["field-set", className].filter(Boolean).join(" ");
  return <fieldset ref={ref} data-slot="field-set" className={classes} {...props} />;
}

export function FieldLegend({
  className = "",
  variant = "legend",
  ref,
  ...props
}: FieldLegendProps & { ref?: React.Ref<HTMLLegendElement> }) {
  const classes = ["field-legend", className].filter(Boolean).join(" ");
  return (
    <legend
      ref={ref}
      data-slot="field-legend"
      data-variant={variant}
      className={classes}
      {...props}
    />
  );
}

export function FieldContent({
  className = "",
  ref,
  ...props
}: FieldContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["field-content", className].filter(Boolean).join(" ");
  return <div ref={ref} data-slot="field-content" className={classes} {...props} />;
}

export function FieldTitle({
  className = "",
  ref,
  ...props
}: FieldTitleProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["field-title", className].filter(Boolean).join(" ");
  return <div ref={ref} data-slot="field-label" className={classes} {...props} />;
}

export function FieldGroup({
  className = "",
  ref,
  ...props
}: FieldGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["field-group", className].filter(Boolean).join(" ");
  return <div ref={ref} data-slot="field-group" className={classes} {...props} />;
}

export function FieldSeparator({
  className = "",
  children,
  ref,
  ...props
}: FieldSeparatorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["field-separator", className].filter(Boolean).join(" ");
  return (
    <div
      ref={ref}
      data-slot="field-separator"
      data-content={Boolean(children)}
      className={classes}
      {...props}
    >
      <span aria-hidden="true" data-slot="separator" className="field-separator__line" />
      {children ? (
        <span data-slot="field-separator-content" className="field-separator__content">
          {children}
        </span>
      ) : null}
    </div>
  );
}

/**
 * A form field component that provides labeling, description, and validation
 * for form controls. Automatically handles accessibility associations between
 * labels, inputs, descriptions, and error messages.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Field.Root>
 *   <Field.Label>Name</Field.Label>
 *   <Field.Control placeholder="Enter your name" />
 * </Field.Root>
 *
 * // With validation
 * <Field.Root>
 *   <Field.Label>Email</Field.Label>
 *   <Field.Control type="email" required />
 *   <Field.Error match="valueMissing">Email is required</Field.Error>
 *   <Field.Error match="typeMismatch">Enter a valid email</Field.Error>
 *   <Field.Description>We'll never share your email</Field.Description>
 * </Field.Root>
 *
 * // With custom validation
 * <Field.Root validate={(value) => value === 'admin' ? 'Username taken' : null}>
 *   <Field.Label>Username</Field.Label>
 *   <Field.Control required />
 *   <Field.Error />
 * </Field.Root>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/field | Base UI Field}
 */
export const Field = Object.assign(FieldRoot, {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
  Validity: FieldValidity,
  Set: FieldSet,
  Legend: FieldLegend,
  Content: FieldContent,
  Title: FieldTitle,
  Group: FieldGroup,
  Separator: FieldSeparator,
});
