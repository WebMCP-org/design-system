import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";

export interface TooltipProps extends BaseTooltip.Root.Props {}
export interface TooltipTriggerProps extends BaseTooltip.Trigger.Props {}
export interface TooltipPortalProps extends BaseTooltip.Portal.Props {}
export interface TooltipPositionerProps extends BaseTooltip.Positioner.Props {}
export interface TooltipProviderProps extends BaseTooltip.Provider.Props {
  delayDuration?: number;
}

export interface TooltipPopupProps extends Omit<BaseTooltip.Popup.Props, "className"> {
  className?: string;
}
export interface TooltipContentProps extends TooltipPopupProps {
  side?: TooltipPositionerProps["side"];
  sideOffset?: TooltipPositionerProps["sideOffset"];
  align?: TooltipPositionerProps["align"];
  alignOffset?: TooltipPositionerProps["alignOffset"];
}

export interface TooltipArrowProps extends Omit<BaseTooltip.Arrow.Props, "className"> {
  className?: string;
}

/**
 * A tooltip component for displaying helpful information on hover.
 *
 * @example
 * ```tsx
 * <Tooltip>
 *   <TooltipTrigger>
 *     <Button>Hover me</Button>
 *   </TooltipTrigger>
 *   <TooltipPortal>
 *     <TooltipPositioner>
 *       <TooltipPopup>
 *         <TooltipArrow />
 *         Helpful information
 *       </TooltipPopup>
 *     </TooltipPositioner>
 *   </TooltipPortal>
 * </Tooltip>
 * ```
 *
 * @see {@link https://base-ui.com/react/components/tooltip | Base UI Tooltip}
 */
export const Tooltip = BaseTooltip.Root;

export function TooltipProvider({ delayDuration = 0, delay, ...props }: TooltipProviderProps) {
  return <BaseTooltip.Provider delay={delay ?? delayDuration} {...props} />;
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  return <BaseTooltip.Trigger data-slot="tooltip-trigger" {...props} />;
}

export const TooltipPortal = BaseTooltip.Portal;
export const TooltipPositioner = BaseTooltip.Positioner;

export function TooltipPopup({
  className = "",
  ref,
  ...props
}: TooltipPopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["tooltip__popup", className].filter(Boolean).join(" ");
  return <BaseTooltip.Popup ref={ref} data-slot="tooltip-content" className={classes} {...props} />;
}

export function TooltipContent({
  align,
  alignOffset,
  children,
  side,
  sideOffset = 0,
  ref,
  ...props
}: TooltipContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <TooltipPortal>
      <TooltipPositioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPopup ref={ref} {...props}>
          {children}
          <TooltipArrow />
        </TooltipPopup>
      </TooltipPositioner>
    </TooltipPortal>
  );
}

export function TooltipArrow({
  className = "",
  ref,
  ...props
}: TooltipArrowProps & { ref?: React.Ref<HTMLDivElement> }) {
  const classes = ["tooltip__arrow", className].filter(Boolean).join(" ");
  return <BaseTooltip.Arrow ref={ref} data-slot="tooltip-arrow" className={classes} {...props} />;
}
