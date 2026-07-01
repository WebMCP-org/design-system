import * as React from "react";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { Streamdown } from "streamdown";
import {
  CollapsiblePanel,
  type CollapsiblePanelProps,
  CollapsibleRoot,
  type CollapsibleRootProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
} from "./Collapsible.js";
import { cx } from "./_internal/class-names.js";
import { BrainIcon, ChevronRightIcon } from "./_internal/icons.js";

interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration?: number;
}

const ReasoningContext = React.createContext<ReasoningContextValue | null>(null);

const AUTO_CLOSE_DELAY_MS = 1_000;
const MS_IN_S = 1_000;

export function useReasoning(): ReasoningContextValue {
  const ctx = React.useContext(ReasoningContext);
  if (!ctx) {
    throw new Error("Reasoning subcomponents must be used inside <Reasoning>.");
  }
  return ctx;
}

export interface ReasoningProps extends Omit<
  CollapsibleRootProps,
  "className" | "onOpenChange" | "unstyled"
> {
  className?: string;
  /**
   * Whether the model is currently generating reasoning. When true the
   * component auto-opens; it auto-closes once streaming ends.
   */
  isStreaming?: boolean;
  /**
   * Elapsed reasoning time in seconds, shown in the trigger when finished.
   * When omitted, the component measures the duration automatically.
   */
  duration?: number;
  /** Called when the open state changes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A collapsible "thinking" block for showing model reasoning (e.g. DeepSeek
 * R1, OpenAI o-series). Auto-expands while streaming and collapses when done.
 * Adapted from Vercel AI Elements and restyled with Sigvelo CSS tokens.
 *
 * @example
 * ```tsx
 * <Reasoning isStreaming={isThinking} duration={elapsed}>
 *   <ReasoningTrigger />
 *   <ReasoningContent>{reasoningText}</ReasoningContent>
 * </Reasoning>
 * ```
 *
 * @see {@link https://elements.ai-sdk.dev/components/reasoning | AI Elements Reasoning}
 */
export function Reasoning({
  className,
  isStreaming = false,
  duration,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ref,
  ...props
}: ReasoningProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [internalOpen, setInternalOpen] = React.useState<boolean>(defaultOpen ?? isStreaming);
  const [internalDuration, setInternalDuration] = React.useState<number | undefined>(duration);
  const previousStreamingRef = React.useRef(isStreaming);
  const startTimeRef = React.useRef<number | null>(isStreaming ? Date.now() : null);
  const hasEverStreamedRef = React.useRef(isStreaming);
  const [hasAutoClosed, setHasAutoClosed] = React.useState(false);

  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const preventAutoOpen = defaultOpen === false;
  const resolvedDuration = duration ?? internalDuration;

  const setOpenState = React.useCallback(
    (next: boolean) => {
      if (next === currentOpen) {
        return;
      }
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [currentOpen, isControlled, onOpenChange],
  );

  React.useEffect(() => {
    if (duration !== undefined) {
      setInternalDuration(duration);
    }
  }, [duration]);

  React.useEffect(() => {
    if (isStreaming) {
      hasEverStreamedRef.current = true;
      setHasAutoClosed(false);
      if (duration === undefined) {
        setInternalDuration(undefined);
      }
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      return;
    }

    if (startTimeRef.current !== null) {
      if (duration === undefined) {
        setInternalDuration(Math.max(1, Math.ceil((Date.now() - startTimeRef.current) / MS_IN_S)));
      }
      startTimeRef.current = null;
    }
  }, [duration, isStreaming]);

  React.useEffect(() => {
    const wasStreaming = previousStreamingRef.current;

    if (isStreaming && !currentOpen && !preventAutoOpen) {
      setOpenState(true);
    }

    if (
      !isStreaming &&
      wasStreaming &&
      hasEverStreamedRef.current &&
      currentOpen &&
      !hasAutoClosed
    ) {
      const closeTimer = window.setTimeout(() => {
        setOpenState(false);
        setHasAutoClosed(true);
      }, AUTO_CLOSE_DELAY_MS);

      previousStreamingRef.current = isStreaming;
      return () => window.clearTimeout(closeTimer);
    }

    previousStreamingRef.current = isStreaming;
  }, [currentOpen, hasAutoClosed, isStreaming, preventAutoOpen, setOpenState]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpenState(next);
    },
    [setOpenState],
  );

  const ctx = React.useMemo<ReasoningContextValue>(
    () => ({
      isStreaming,
      isOpen: currentOpen,
      setIsOpen: setOpenState,
      duration: resolvedDuration,
    }),
    [currentOpen, isStreaming, resolvedDuration, setOpenState],
  );

  return (
    <ReasoningContext.Provider value={ctx}>
      <CollapsibleRoot
        ref={ref}
        className={cx("reasoning", className)}
        open={currentOpen}
        onOpenChange={handleOpenChange}
        data-streaming={isStreaming ? "" : undefined}
        {...props}
        unstyled
      >
        {children}
      </CollapsibleRoot>
    </ReasoningContext.Provider>
  );
}

export interface ReasoningTriggerProps extends Omit<
  CollapsibleTriggerProps,
  "className" | "unstyled"
> {
  className?: string;
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => React.ReactNode;
}

function defaultGetThinkingMessage(isStreaming: boolean, duration?: number) {
  if (isStreaming || duration === 0) {
    return "Thinking...";
  }

  if (duration === undefined) {
    return "Thought for a few seconds";
  }

  return `Thought for ${duration} second${duration === 1 ? "" : "s"}`;
}

/**
 * Trigger that toggles the reasoning panel. Shows "Thinking..." while
 * streaming and "Thought for Ns" afterward.
 */
export function ReasoningTrigger({
  className,
  children,
  getThinkingMessage = defaultGetThinkingMessage,
  ref,
  ...props
}: ReasoningTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { isStreaming, duration } = useReasoning();

  if (children !== undefined && children !== null) {
    return (
      <CollapsibleTrigger
        ref={ref}
        className={cx("reasoning__trigger", className)}
        data-streaming={isStreaming ? "" : undefined}
        {...props}
        unstyled
      >
        {children}
      </CollapsibleTrigger>
    );
  }

  return (
    <CollapsibleTrigger
      ref={ref}
      className={cx("reasoning__trigger", className)}
      data-streaming={isStreaming ? "" : undefined}
      {...props}
      unstyled
    >
      <span className="reasoning__trigger-leading-icon" aria-hidden="true">
        <BrainIcon />
      </span>
      <span className="reasoning__trigger-label">{getThinkingMessage(isStreaming, duration)}</span>
      <span className="reasoning__trigger-icon" aria-hidden="true">
        <ChevronRightIcon />
      </span>
    </CollapsibleTrigger>
  );
}

export interface ReasoningContentProps extends Omit<
  CollapsiblePanelProps,
  "className" | "unstyled"
> {
  className?: string;
}

const streamdownPlugins = { cjk, code, math, mermaid };

/**
 * The reasoning text panel. Accepts any React node but is optimized for
 * long-form text; a muted left border visually distinguishes the block.
 */
export function ReasoningContent({
  className,
  children,
  ref,
  ...props
}: ReasoningContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsiblePanel ref={ref} className={cx("reasoning__content", className)} {...props} unstyled>
      <div className="reasoning__text">
        {typeof children === "string" ? (
          <Streamdown plugins={streamdownPlugins}>{children}</Streamdown>
        ) : (
          children
        )}
      </div>
    </CollapsiblePanel>
  );
}
