import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { XIcon } from "./_internal/icons.js";

export interface DialogProps extends BaseDialog.Root.Props {}
export interface DialogTriggerProps extends BaseDialog.Trigger.Props {}
export interface DialogPortalProps extends BaseDialog.Portal.Props {}

export interface DialogBackdropProps extends Omit<BaseDialog.Backdrop.Props, "className"> {
  className?: string;
}

export interface DialogPopupProps extends Omit<BaseDialog.Popup.Props, "className"> {
  className?: string;
  /**
   * The size of the dialog.
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "fullscreen";
}

export interface DialogTitleProps extends Omit<BaseDialog.Title.Props, "className"> {
  className?: string;
}

export interface DialogDescriptionProps extends Omit<BaseDialog.Description.Props, "className"> {
  className?: string;
}

export interface DialogCloseProps extends Omit<BaseDialog.Close.Props, "className"> {
  className?: string;
}
export type DialogOverlayProps = DialogBackdropProps;
export type DialogContentProps = DialogPopupProps & {
  showCloseButton?: boolean;
};
export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
}

/**
 * A dialog component for modal interactions.
 *
 * @example
 * ```tsx
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogPortal>
 *     <DialogBackdrop />
 *     <DialogPopup>
 *       <DialogTitle>Confirm</DialogTitle>
 *       <DialogDescription>Are you sure?</DialogDescription>
 *       <DialogClose>Cancel</DialogClose>
 *     </DialogPopup>
 *   </DialogPortal>
 * </Dialog>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/dialog | Base UI Dialog}
 */
export const Dialog = BaseDialog.Root;

export function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

export const DialogPortal = BaseDialog.Portal;

export function DialogBackdrop({
  className = "",
  ref,
  ...props
}: DialogBackdropProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["dialog__backdrop", className].filter(Boolean).join(" ");
  return (
    <BaseDialog.Backdrop ref={ref} data-slot="dialog-overlay" className={classes} {...props} />
  );
}

export const DialogOverlay = DialogBackdrop;

export function DialogPopup({
  size = "md",
  className = "",
  ref,
  ...props
}: DialogPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["dialog__popup", size !== "md" && `dialog__popup--${size}`, className]
    .filter(Boolean)
    .join(" ");
  return <BaseDialog.Popup ref={ref} data-slot="dialog-content" className={classes} {...props} />;
}

export function DialogContent({
  children,
  showCloseButton = true,
  ref,
  ...props
}: DialogContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPopup ref={ref} {...props}>
        {children}
        {showCloseButton ? (
          <DialogClose className="dialog__close--icon">
            <XIcon />
            <span className="dialog__close-label">Close</span>
          </DialogClose>
        ) : null}
      </DialogPopup>
    </DialogPortal>
  );
}

export function DialogHeader({
  className = "",
  ref,
  ...props
}: DialogHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["dialog__header", className].filter(Boolean).join(" ");
  return <div ref={ref} data-slot="dialog-header" className={classes} {...props} />;
}

export function DialogFooter({
  className = "",
  showCloseButton = false,
  children,
  ref,
  ...props
}: DialogFooterProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["dialog__footer", className].filter(Boolean).join(" ");
  return (
    <div ref={ref} data-slot="dialog-footer" className={classes} {...props}>
      {children}
      {showCloseButton ? <DialogClose>Close</DialogClose> : null}
    </div>
  );
}

export function DialogTitle({
  className = "",
  ref,
  ...props
}: DialogTitleProps & { ref?: React.Ref<HTMLHeadingElement> }) {
  const classes = ["dialog__title", className].filter(Boolean).join(" ");
  return <BaseDialog.Title ref={ref} data-slot="dialog-title" className={classes} {...props} />;
}

export function DialogDescription({
  className = "",
  ref,
  ...props
}: DialogDescriptionProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  const classes = ["dialog__description", className].filter(Boolean).join(" ");
  return (
    <BaseDialog.Description
      ref={ref}
      data-slot="dialog-description"
      className={classes}
      {...props}
    />
  );
}

export function DialogClose({
  className = "",
  ref,
  ...props
}: DialogCloseProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const classes = ["dialog__close", className].filter(Boolean).join(" ");
  return <BaseDialog.Close ref={ref} data-slot="dialog-close" className={classes} {...props} />;
}
