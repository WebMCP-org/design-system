import * as React from "react";
import {
  getToolName as getAIToolName,
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  type UIDataTypes,
  type UIMessage,
  type UITools,
} from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "./Conversation.js";
import { Message, MessageContent, MessageResponse } from "./Message.js";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  type PromptInputStatus,
  PromptInputTextarea,
  PromptInputTools,
} from "./PromptInput.js";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./Reasoning.js";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "./Tool.js";
import { cx } from "./_internal/class-names.js";

export type AgentChatMessage<
  Metadata = unknown,
  DataParts extends UIDataTypes = UIDataTypes,
  Tools extends UITools = UITools,
> = UIMessage<Metadata, DataParts, Tools>;

export type AgentChatPart<MessageT extends AgentChatMessage = AgentChatMessage> =
  MessageT["parts"][number];

export interface AgentChatRenderPartContext<MessageT extends AgentChatMessage = AgentChatMessage> {
  message: MessageT;
  part: AgentChatPart<MessageT>;
  partIndex: number;
  defaultRender: () => React.ReactNode;
}

export interface AgentChatRenderMessageContext<
  MessageT extends AgentChatMessage = AgentChatMessage,
> {
  message: MessageT;
  messageIndex: number;
}

export interface AgentChatProps<MessageT extends AgentChatMessage = AgentChatMessage> {
  className?: string;
  /** AI SDK `UIMessage`s to render, oldest first. */
  messages: readonly MessageT[];
  /** Drives the composer's send/stop affordance and streaming indicators. */
  status?: PromptInputStatus;
  /** Called with the composed message when the user submits. Omit for a read-only transcript. */
  onSubmit?: (message: PromptInputMessage) => void | Promise<void>;
  /** Called when the user hits stop while `status` is streaming/submitted. */
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Rendered in place of the transcript while `messages` is empty. */
  emptyState?: React.ReactNode;
  /** Extra controls rendered in the composer toolbar. */
  composerTools?: React.ReactNode;
  /** Override rendering per part; return `undefined` to fall back to the default part UI. */
  renderPart?: (context: AgentChatRenderPartContext<MessageT>) => React.ReactNode | undefined;
  /** Rendered after each message's parts — for actions, citations, and the like. */
  renderMessageAfter?: (context: AgentChatRenderMessageContext<MessageT>) => React.ReactNode;
}

function getPartKey(part: AgentChatPart, partIndex: number) {
  if (isToolUIPart(part)) return part.toolCallId;
  if ("id" in part && typeof part.id === "string") return `${part.type}-${part.id}`;
  return `${part.type}-${partIndex}`;
}

function renderDefaultPart(part: AgentChatPart) {
  if (isTextUIPart(part) && part.text) {
    return <MessageResponse>{part.text}</MessageResponse>;
  }

  if (isReasoningUIPart(part) && part.text) {
    return (
      <Reasoning isStreaming={part.state === "streaming"}>
        <ReasoningTrigger />
        <ReasoningContent>{part.text}</ReasoningContent>
      </Reasoning>
    );
  }

  if (isToolUIPart(part)) {
    const output = "output" in part ? part.output : undefined;
    const errorText = "errorText" in part ? part.errorText : undefined;
    const toolType = part.type === "dynamic-tool" ? "dynamic-tool" : "function";

    return (
      <Tool state={part.state}>
        <ToolHeader type={toolType} toolName={getAIToolName(part)} title={part.title} />
        <ToolContent>
          {part.input !== undefined ? <ToolInput input={part.input} /> : null}
          <ToolOutput output={output} errorText={errorText} />
        </ToolContent>
      </Tool>
    );
  }

  return null;
}

/**
 * A complete agent chat surface: auto-scrolling conversation of AI SDK
 * `UIMessage`s (text, reasoning, and tool parts rendered by default) plus a
 * prompt composer. Customize per-part rendering with `renderPart`.
 */
export function AgentChat<MessageT extends AgentChatMessage = AgentChatMessage>({
  className,
  messages,
  status = "ready",
  onSubmit,
  onStop,
  placeholder = "Ask anything...",
  disabled,
  emptyState,
  composerTools,
  renderPart,
  renderMessageAfter,
  ref,
}: AgentChatProps<MessageT> & { ref?: React.Ref<HTMLDivElement> }) {
  const handleSubmit = React.useCallback(
    (message: PromptInputMessage) => {
      void onSubmit?.(message);
    },
    [onSubmit],
  );

  return (
    <div ref={ref} className={cx("agent-chat", className)}>
      <Conversation className="agent-chat__conversation">
        <ConversationContent>
          {messages.length === 0
            ? (emptyState ?? (
                <ConversationEmptyState
                  title="Start a conversation"
                  description="Ask the agent to inspect, plan, or build."
                />
              ))
            : null}
          {messages.map((message, messageIndex) => (
            <Message key={message.id ?? messageIndex} from={message.role}>
              {message.parts.map((part, partIndex) => {
                const defaultRender = () => renderDefaultPart(part);
                const custom = renderPart?.({ message, part, partIndex, defaultRender });
                const rendered = custom === undefined ? defaultRender() : custom;

                return rendered ? (
                  <MessageContent key={getPartKey(part, partIndex)}>{rendered}</MessageContent>
                ) : null;
              })}
              {renderMessageAfter?.({ message, messageIndex })}
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="agent-chat__composer">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea
              aria-label="Message"
              placeholder={placeholder}
              disabled={disabled}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>{composerTools}</PromptInputTools>
            <PromptInputSubmit status={status} onStop={onStop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
