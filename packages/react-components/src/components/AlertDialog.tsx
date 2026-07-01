import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";

export interface AlertDialogProps extends React.ComponentPropsWithRef<
  typeof BaseAlertDialog.Root
> {}

export interface AlertDialogTriggerProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseAlertDialog.Trigger>,
  "className"
> {
  className?: string;
}

export interface AlertDialogBackdropProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseAlertDialog.Backdrop>,
  "className"
> {
  className?: string;
}

export interface AlertDialogPopupProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseAlertDialog.Popup>,
  "className"
> {
  className?: string;
  /**
   * The size of the alert dialog.
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export interface AlertDialogTitleProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseAlertDialog.Title>,
  "className"
> {
  className?: string;
}

export interface AlertDialogDescriptionProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseAlertDialog.Description>,
  "className"
> {
  className?: string;
}

export interface AlertDialogCloseProps extends Omit<
  React.ComponentPropsWithRef<typeof BaseAlertDialog.Close>,
  "className"
> {
  className?: string;
  /**
   * The variant of the close button.
   * @default 'secondary'
   */
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost";
}
export type AlertDialogOverlayProps = AlertDialogBackdropProps;
export type AlertDialogContentProps = AlertDialogPopupProps;
export type AlertDialogActionProps = AlertDialogCloseProps;
export type AlertDialogCancelProps = AlertDialogCloseProps;
export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface AlertDialogMediaProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * An alert dialog component for important confirmations and warnings.
 * Unlike regular dialogs, alert dialogs require explicit user action to dismiss.
 *
 * @example
 * ```tsx
 * <AlertDialog>
 *   <AlertDialogTrigger>Delete Account</AlertDialogTrigger>
 *   <AlertDialogPortal>
 *     <AlertDialogBackdrop />
 *     <AlertDialogPopup>
 *       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
 *       <AlertDialogDescription>
 *         This action cannot be undone.
 *       </AlertDialogDescription>
 *       <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
 *         <AlertDialogClose>Cancel</AlertDialogClose>
 *         <AlertDialogClose variant="destructive">Delete</AlertDialogClose>
 *       </div>
 *     </AlertDialogPopup>
 *   </AlertDialogPortal>
 * </AlertDialog>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/alert-dialog | Base UI Alert Dialog}
 */
export const AlertDialog = BaseAlertDialog.Root;

export function AlertDialogTrigger({
  className = "",
  ref,
  ...props
}: AlertDialogTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["alert-dialog__trigger", className].filter(Boolean).join(" ");
  return (
    <BaseAlertDialog.Trigger
      ref={ref}
      data-slot="alert-dialog-trigger"
      className={classes}
      {...props}
    />
  );
}

export const AlertDialogPortal = BaseAlertDialog.Portal;

export function AlertDialogBackdrop({
  className = "",
  ref,
  ...props
}: AlertDialogBackdropProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["alert-dialog__backdrop", className].filter(Boolean).join(" ");
  return (
    <BaseAlertDialog.Backdrop
      ref={ref}
      data-slot="alert-dialog-overlay"
      className={classes}
      {...props}
    />
  );
}

export const AlertDialogOverlay = AlertDialogBackdrop;

export function AlertDialogPopup({
  size = "md",
  className = "",
  ref,
  ...props
}: AlertDialogPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = [
    "alert-dialog__popup",
    size !== "md" && `alert-dialog__popup--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <BaseAlertDialog.Popup
      ref={ref}
      data-slot="alert-dialog-content"
      className={classes}
      {...props}
    />
  );
}

export function AlertDialogContent({
  ref,
  ...props
}: AlertDialogContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <AlertDialogPortal>
      <AlertDialogBackdrop />
      <AlertDialogPopup ref={ref} {...props} />
    </AlertDialogPortal>
  );
}

export function AlertDialogHeader({
  className = "",
  ref,
  ...props
}: AlertDialogHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["alert-dialog__header", className].filter(Boolean).join(" ");
  return <div ref={ref} data-slot="alert-dialog-header" className={classes} {...props} />;
}

export function AlertDialogFooter({
  className = "",
  ref,
  ...props
}: AlertDialogFooterProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["alert-dialog__footer", className].filter(Boolean).join(" ");
  return <div ref={ref} data-slot="alert-dialog-footer" className={classes} {...props} />;
}

export function AlertDialogMedia({
  className = "",
  ref,
  ...props
}: AlertDialogMediaProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["alert-dialog__media", className].filter(Boolean).join(" ");
  return <div ref={ref} data-slot="alert-dialog-media" className={classes} {...props} />;
}

export function AlertDialogTitle({
  className = "",
  ref,
  ...props
}: AlertDialogTitleProps & { ref?: React.Ref<HTMLHeadingElement> }) {
  const classes = ["alert-dialog__title", className].filter(Boolean).join(" ");
  return (
    <BaseAlertDialog.Title
      ref={ref}
      data-slot="alert-dialog-title"
      className={classes}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className = "",
  ref,
  ...props
}: AlertDialogDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  const classes = ["alert-dialog__description", className].filter(Boolean).join(" ");
  return (
    <BaseAlertDialog.Description
      ref={ref}
      data-slot="alert-dialog-description"
      className={classes}
      {...props}
    />
  );
}

export function AlertDialogClose({
  variant = "secondary",
  className = "",
  ref,
  ...props
}: AlertDialogCloseProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["alert-dialog__action", `alert-dialog__action--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <BaseAlertDialog.Close
      ref={ref}
      data-slot="alert-dialog-close"
      className={classes}
      {...props}
    />
  );
}

export function AlertDialogAction(
  props: AlertDialogActionProps & { ref?: React.Ref<HTMLButtonElement> },
) {
  return <AlertDialogClose data-slot="alert-dialog-action" variant="primary" {...props} />;
}

export function AlertDialogCancel(
  props: AlertDialogCancelProps & { ref?: React.Ref<HTMLButtonElement> },
) {
  return <AlertDialogClose data-slot="alert-dialog-cancel" variant="outline" {...props} />;
}
