import * as React from "react";
import { Badge, type BadgeColor } from "./Badge.js";
import { CodeBlock, CodeBlockContainer, CodeBlockContent } from "./CodeBlock.js";
import {
  CollapsiblePanel,
  type CollapsiblePanelProps,
  CollapsibleRoot,
  type CollapsibleRootProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
} from "./Collapsible.js";
import { formatStructuredCodeDisplay } from "../utils/structured-code.js";
import { cx } from "./_internal/class-names.js";
import {
  CheckIcon,
  ChevronRightIcon,
  DotIcon,
  SpinnerIcon,
  WarningIcon,
  WrenchIcon,
  XIcon,
} from "./_internal/icons.js";

export type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

export interface ToolPart {
  state: ToolState;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

const STATE_TO_COLOR: Record<ToolState, BadgeColor> = {
  "input-streaming": "primary",
  "input-available": "neutral",
  "approval-requested": "warning",
  "approval-responded": "neutral",
  "output-available": "success",
  "output-error": "destructive",
  "output-denied": "destructive",
};

const STATE_LABEL: Record<ToolState, string> = {
  "input-streaming": "Pending",
  "input-available": "Running",
  "approval-requested": "Awaiting Approval",
  "approval-responded": "Responded",
  "output-available": "Completed",
  "output-error": "Error",
  "output-denied": "Denied",
};

const STATE_ICON: Record<ToolState, React.ReactNode> = {
  "input-streaming": <DotIcon />,
  "input-available": <SpinnerIcon className="tool__status-spinner" />,
  "approval-requested": <WarningIcon />,
  "approval-responded": <CheckIcon />,
  "output-available": <CheckIcon />,
  "output-error": <XIcon />,
  "output-denied": <XIcon />,
};

export function getStatusBadge(status: ToolState) {
  return (
    <Badge color={STATE_TO_COLOR[status]} size="sm" className="tool__header-badge">
      {STATE_ICON[status]}
      {STATE_LABEL[status]}
    </Badge>
  );
}

interface ToolContextValue {
  state?: ToolState;
}

const ToolContext = React.createContext<ToolContextValue | null>(null);

function useToolContext(): ToolContextValue {
  const ctx = React.useContext(ToolContext);
  if (!ctx) {
    throw new Error("Tool subcomponents must be used inside <Tool>.");
  }
  return ctx;
}

export interface ToolProps extends Omit<CollapsibleRootProps, "className" | "unstyled"> {
  className?: string;
  /** Current state of the tool invocation. */
  state?: ToolState;
}

/**
 * Displays a collapsible tool invocation (name, input, output, state).
 * The state drives the status badge color and default open behavior —
 * `output-available`, `output-error`, and `output-denied` auto-open.
 * Adapted from Vercel AI Elements and restyled with Sigvelo CSS tokens.
 *
 * @example
 * ```tsx
 * <Tool state="output-available">
 *   <ToolHeader type="function" toolName="search_web" />
 *   <ToolContent>
 *     <ToolInput input={{ query: "weather in Tokyo" }} />
 *     <ToolOutput output={<pre>{JSON.stringify(result, null, 2)}</pre>} />
 *   </ToolContent>
 * </Tool>
 * ```
 *
 * @see {@link https://elements.ai-sdk.dev/components/tool | AI Elements Tool}
 */
export function Tool({
  className,
  state,
  defaultOpen,
  ref,
  ...props
}: ToolProps & { ref?: React.Ref<HTMLDivElement> }) {
  const autoOpen =
    state === "output-available" || state === "output-error" || state === "output-denied";
  const ctx = React.useMemo<ToolContextValue>(() => ({ state }), [state]);

  return (
    <ToolContext.Provider value={ctx}>
      <CollapsibleRoot
        ref={ref}
        className={cx("tool", className)}
        defaultOpen={defaultOpen ?? autoOpen}
        data-state={state ?? undefined}
        {...props}
        unstyled
      />
    </ToolContext.Provider>
  );
}

export interface ToolHeaderProps extends Omit<
  CollapsibleTriggerProps,
  "className" | "type" | "unstyled"
> {
  className?: string;
  /** The tool "type" (e.g. "function", "retrieval"). */
  type: string;
  /** The specific tool invoked (e.g. "search_web"). */
  toolName?: string;
  /** Optional human-readable title shown alongside the tool name. */
  title?: string;
  /** Current state of the tool invocation. Matches Vercel AI Elements. */
  state?: ToolState;
}

/**
 * Clickable header that shows the tool type, name, and state badge.
 */
export function ToolHeader({
  className,
  type,
  toolName,
  title,
  state: stateProp,
  ref,
  ...props
}: ToolHeaderProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { state: contextState } = useToolContext();
  const state = stateProp ?? contextState ?? "input-available";
  const derivedName =
    type === "dynamic-tool" && toolName
      ? toolName
      : type.startsWith("tool-")
        ? type.split("-").slice(1).join("-")
        : (toolName ?? type);

  return (
    <CollapsibleTrigger ref={ref} className={cx("tool__header", className)} {...props} unstyled>
      <span className="tool__header-tool-icon" aria-hidden="true">
        <WrenchIcon />
      </span>
      <span className="tool__header-type">{type}</span>
      <span className="tool__header-name">{title ?? derivedName}</span>
      <span className="tool__header-spacer" />
      {getStatusBadge(state)}
      <span className="tool__header-icon" aria-hidden="true">
        <ChevronRightIcon />
      </span>
    </CollapsibleTrigger>
  );
}

export interface ToolContentProps extends Omit<CollapsiblePanelProps, "className" | "unstyled"> {
  className?: string;
}

/**
 * Collapsible panel holding ToolInput and ToolOutput.
 */
export function ToolContent({
  className,
  children,
  ref,
  ...props
}: ToolContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsiblePanel ref={ref} className={cx("tool__content", className)} {...props} unstyled>
      <div className="tool__content-inner">{children}</div>
    </CollapsiblePanel>
  );
}

export interface ToolInputProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The input passed to the tool (rendered as a JSON code block). */
  input: unknown;
}

/**
 * Displays the tool input as a JSON code block.
 */
export function ToolInput({
  className,
  input,
  ref,
  ...props
}: ToolInputProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { state } = useToolContext();
  const formattedInput = React.useMemo(() => formatStructuredCodeDisplay(input), [input]);

  // Skip Shiki highlighting while args stream in: it's async, so re-highlighting
  // on every delta shows stale HTML between completions and the args look frozen.
  // CodeBlock's plain fallback updates synchronously; it highlights once complete.
  const isStreaming = state === "input-streaming";

  return (
    <div ref={ref} className={cx("tool__section", className)} {...props}>
      <div className="tool__section-label">Input</div>
      <CodeBlock
        code={formattedInput.code}
        language={formattedInput.language}
        className="tool__code-block"
        isStreaming={isStreaming}
      >
        <CodeBlockContainer>
          <CodeBlockContent />
        </CodeBlockContainer>
      </CodeBlock>
    </div>
  );
}

export interface ToolOutputProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The tool output (any React node). Mutually exclusive with errorText. */
  output?: unknown;
  /** Error message, rendered with destructive styling. */
  errorText?: string;
}

/**
 * Displays the tool output or error text.
 */
export function ToolOutput({
  className,
  output,
  errorText,
  ref,
  ...props
}: ToolOutputProps & { ref?: React.Ref<HTMLDivElement> }) {
  const formattedOutput = React.useMemo(() => {
    if (output && typeof output === "object" && !React.isValidElement(output)) {
      return formatStructuredCodeDisplay(output);
    }

    if (typeof output === "string") {
      return { code: output, language: "json" as const };
    }

    return null;
  }, [output]);
  const isError = errorText !== undefined;

  if (!(output || errorText)) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cx("tool__section", isError && "tool__section--error", className)}
      {...props}
    >
      <div className="tool__section-label">{isError ? "Error" : "Output"}</div>
      {isError ? (
        <div className="tool__error-text">{errorText}</div>
      ) : formattedOutput ? (
        <CodeBlock
          code={formattedOutput.code}
          language={formattedOutput.language}
          className="tool__code-block"
        >
          <CodeBlockContainer>
            <CodeBlockContent />
          </CodeBlockContainer>
        </CodeBlock>
      ) : (
        <div>{output as React.ReactNode}</div>
      )}
    </div>
  );
}
