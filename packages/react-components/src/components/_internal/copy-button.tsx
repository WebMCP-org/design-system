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
  "children" | "variant" | "size" | "color" | "className" | "onClick" | "onError"
> {
  className?: string;
  label: string;
  text: string;
  timeout?: number;
  stopPropagation?: boolean;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function CopyButton({
  label,
  text,
  timeout = 1500,
  stopPropagation = false,
  onCopy,
  onError,
  onClick,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleClick = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (stopPropagation) {
        event.stopPropagation();
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopy?.();
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
      } catch (error) {
        onError?.(error as Error);
      }
      onClick?.(event);
    },
    [onClick, onCopy, onError, stopPropagation, text, timeout],
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
