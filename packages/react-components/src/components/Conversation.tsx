import * as React from "react";
import { Button } from "./Button.js";
import { cx } from "./_internal/class-names.js";
import { ArrowDownIcon, DownloadIcon } from "./_internal/icons.js";
import { useStickToBottom } from "./useStickToBottom.js";

/**
 * Minimum message shape accepted by {@link ConversationDownload} and
 * {@link messagesToMarkdown}. Structurally compatible with the AI SDK
 * `UIMessage` type so consumers can pass those directly.
 */
export interface ConversationMessage {
  id?: string;
  role: string;
  /** AI SDK-style parts array. The text types are concatenated for export. */
  parts?: Array<{ type: string; text?: string }>;
  /** Plain-text content; used as a fallback when `parts` is not provided. */
  content?: string;
}

interface ConversationContextValue {
  isAtBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  registerContentElement: (element: HTMLDivElement | null) => void;
}

const ConversationContext = React.createContext<ConversationContextValue | null>(null);

function useConversationContext(component: string): ConversationContextValue {
  const ctx = React.useContext(ConversationContext);
  if (!ctx) {
    throw new Error(`${component} must be used inside a <Conversation>.`);
  }
  return ctx;
}

export interface ConversationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Additional class names for layout only; do not override scroll behavior from apps. */
  className?: string;
  /** ConversationContent, messages, empty state, scroll button, or download button. */
  children?: React.ReactNode;
}

/**
 * Scrollable container for a chat conversation. Sticks the viewport to the
 * bottom as new content arrives, unless the user has scrolled up. Adapted
 * from Vercel AI Elements and restyled with Sigvelo CSS tokens.
 *
 * Use for assistant/user message streams. Do not use for static lists or
 * logs that should not auto-stick to the latest item.
 *
 * Sigvelo changes: removed Tailwind classes, uses a native scroll region with
 * the local stick-to-bottom hook, emits `role="log"` with polite updates, and
 * keeps transcript export in a separate ConversationDownload action.
 *
 * Styling consumes Sigvelo canvas, surface, border, spacing, radius, shadow,
 * and motion tokens. Add new behavior in this package when multiple apps need
 * it; app code should compose children and avoid reaching into scroll internals.
 *
 * Pair with {@link ConversationContent} for layout, {@link ConversationScrollButton}
 * for a "jump to latest" affordance, and {@link ConversationDownload} to export
 * the transcript as Markdown.
 *
 * @example
 * ```tsx
 * <Conversation>
 *   <ConversationContent>
 *     {messages.map((m) => <Message key={m.id} {...m} />)}
 *   </ConversationContent>
 *   <ConversationScrollButton />
 * </Conversation>
 * ```
 *
 * @see {@link https://elements.ai-sdk.dev/components/conversation | AI Elements Conversation}
 */
export function Conversation({
  className,
  children,
  ref,
  ...props
}: ConversationProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { viewportRef, contentRef, isAtBottom, scrollToBottom } = useStickToBottom();

  const handleViewportRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      viewportRef(element);
      if (typeof ref === "function") {
        ref(element);
        return;
      }
      if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
      }
    },
    [ref, viewportRef],
  );

  const ctx = React.useMemo<ConversationContextValue>(
    () => ({ isAtBottom, scrollToBottom, registerContentElement: contentRef }),
    [contentRef, isAtBottom, scrollToBottom],
  );

  return (
    <ConversationContext.Provider value={ctx}>
      {/* The wrapper anchors the floating buttons; the inner viewport scrolls.
          Absolutely-positioned children of a scroller scroll away with content. */}
      <div className={cx("conversation", className)}>
        <div ref={handleViewportRef} tabIndex={0} className="conversation__viewport" {...props}>
          {children}
        </div>
      </div>
    </ConversationContext.Provider>
  );
}

export interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Inner layout wrapper for conversation children. Applies vertical stacking
 * and padding; does not scroll (the parent {@link Conversation} does).
 */
export function ConversationContent({
  className,
  children,
  ref,
  ...props
}: ConversationContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { registerContentElement } = useConversationContext("ConversationContent");
  const handleRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      registerContentElement(element);
      if (typeof ref === "function") {
        ref(element);
        return;
      }
      if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
      }
    },
    [registerContentElement, ref],
  );

  return (
    <div
      ref={handleRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      className={cx("conversation__content", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ConversationEmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * Placeholder shown when there are no messages yet. Renders an icon, title,
 * and description stacked vertically; pass `children` to override the
 * default layout entirely.
 */
export function ConversationEmptyState({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ref,
  ...props
}: ConversationEmptyStateProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("conversation__empty", className)} {...props}>
      {children ?? (
        <>
          {icon ? (
            <span className="conversation__empty-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          {title ? <div className="conversation__empty-title">{title}</div> : null}
          {description ? (
            <div className="conversation__empty-description">{description}</div>
          ) : null}
        </>
      )}
    </div>
  );
}

export interface ConversationScrollButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "className"
> {
  className?: string;
  /** Optional click handler; runs before the default scroll-to-bottom action. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Accessible label for the button. */
  label?: string;
}

/**
 * Floating button that scrolls the conversation to the latest message.
 * Hidden while the viewport is already pinned to the bottom.
 */
export function ConversationScrollButton({
  className,
  variant = "outline",
  color = "neutral",
  size = "icon",
  onClick,
  label = "Scroll to latest",
  children,
  ref,
  ...props
}: ConversationScrollButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { isAtBottom, scrollToBottom } = useConversationContext("ConversationScrollButton");

  if (isAtBottom) return null;

  return (
    <Button
      ref={ref}
      type="button"
      variant={variant}
      color={color}
      size={size}
      className={cx("conversation__scroll-button", className)}
      aria-label={label}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          scrollToBottom();
        }
      }}
      {...props}
    >
      {children ?? <ArrowDownIcon />}
    </Button>
  );
}

const ROLE_HEADING: Record<string, string> = {
  user: "### User",
  assistant: "### Assistant",
  system: "### System",
  tool: "### Tool",
};

function defaultFormatMessage(message: ConversationMessage): string {
  const heading = ROLE_HEADING[message.role] ?? `### ${message.role}`;
  const body = message.parts
    ? message.parts
        .filter((part) => part.type === "text" || part.type === "reasoning")
        .map((part) => part.text ?? "")
        .join("")
    : (message.content ?? "");
  return `${heading}\n\n${body.trim()}`;
}

/**
 * Converts a conversation to a Markdown document with a heading per message.
 *
 * @param messages - Array of messages to serialize.
 * @param formatMessage - Optional per-message formatter; defaults to
 *   `### Role\n\n<text>` blocks joined by blank lines.
 */
export function messagesToMarkdown(
  messages: ConversationMessage[],
  formatMessage: (message: ConversationMessage, index: number) => string = defaultFormatMessage,
): string {
  return messages.map((message, index) => formatMessage(message, index)).join("\n\n");
}

export interface ConversationDownloadProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "children" | "className"
> {
  className?: string;
  messages: ConversationMessage[];
  /** Filename for the downloaded Markdown file. */
  filename?: string;
  /** Customize the text for each message in the exported Markdown. */
  formatMessage?: (message: ConversationMessage, index: number) => string;
  /** Accessible label for the button. */
  label?: string;
  children?: React.ReactNode;
}

/**
 * Button that exports the current conversation as a Markdown file.
 *
 * Skipped when `messages` is empty. For custom export flows, use
 * {@link messagesToMarkdown} directly.
 */
export function ConversationDownload({
  className,
  messages,
  filename = "conversation.md",
  formatMessage,
  label = "Download conversation",
  variant = "outline",
  color = "neutral",
  size = "icon",
  children,
  ref,
  ...props
}: ConversationDownloadProps & { ref?: React.Ref<HTMLButtonElement> }) {
  if (messages.length === 0) return null;

  const handleClick = () => {
    const markdown = messagesToMarkdown(messages, formatMessage);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      ref={ref}
      type="button"
      variant={variant}
      color={color}
      size={size}
      className={cx("conversation__download-button", className)}
      aria-label={label}
      onClick={handleClick}
      {...props}
    >
      {children ?? <DownloadIcon />}
    </Button>
  );
}
