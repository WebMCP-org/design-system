import * as React from "react";

import { Button, type ButtonProps } from "../Button.js";
import {
  Tooltip,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from "../Tooltip.js";
import { CheckIcon, CopyIcon } from "./icons.js";

export interface CopyButtonProps extends Omit<
  ButtonProps,
  "children" | "variant" | "size" | "color" | "className" | "onClick"
> {
  className?: string;
  label: string;
  text: string;
  timeout?: number;
  stopPropagation?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function CopyButton({
  label,
  text,
  timeout = 1500,
  stopPropagation = false,
  onClick,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleClick = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (stopPropagation) {
        event.stopPropagation();
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), timeout);
      } catch {
        /* ignore */
      }
      onClick?.(event);
    },
    [onClick, stopPropagation, text, timeout],
  );

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={label} {...props} onClick={handleClick}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        }
      />
      <TooltipPortal>
        <TooltipPositioner>
          <TooltipPopup>{copied ? "Copied" : label}</TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </Tooltip>
  );
}
