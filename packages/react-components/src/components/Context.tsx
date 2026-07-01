import * as React from "react";
import { Button, type ButtonProps } from "./Button.js";
import { Popover, type PopoverProps } from "./Popover.js";
import { Separator } from "./Separator.js";
import { cx } from "./_internal/class-names.js";

export interface ContextUsageCategory {
  label: string;
  tokens: number;
  costUsd?: number;
}

export interface ContextUsage {
  input?: number;
  inputTokens?: number;
  output?: number;
  outputTokens?: number;
  reasoning?: number;
  reasoningTokens?: number;
  cache?: number;
  cachedInputTokens?: number;
  categories?: ContextUsageCategory[];
}

export interface ContextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tokens currently used. */
  usedTokens: number;
  /** Maximum context window size. */
  maxTokens: number;
  /** Optional usage breakdown. */
  usage?: ContextUsage;
  /** Optional model identifier shown in the header. */
  modelId?: string;
  /** Optional total cost in USD. */
  totalCostUsd?: number;
  open?: PopoverProps["open"];
  defaultOpen?: PopoverProps["defaultOpen"];
  onOpenChange?: PopoverProps["onOpenChange"];
}

interface ContextContextValue {
  usedTokens: number;
  maxTokens: number;
  usage?: ContextUsage;
  modelId?: string;
  totalCostUsd?: number;
}

const ContextContext = React.createContext<ContextContextValue | null>(null);

function useContextContext(): ContextContextValue {
  const ctx = React.useContext(ContextContext);
  if (!ctx) {
    throw new Error("Context subcomponents must be used inside <Context>.");
  }
  return ctx;
}

/**
 * Displays token / context usage with a hover card breakdown. The trigger is
 * a button showing a compact percentage indicator; hovering or clicking opens
 * a popover with category rows and total cost.
 *
 * @example
 * ```tsx
 * <Context
 *   usedTokens={42_300}
 *   maxTokens={200_000}
 *   modelId="claude-opus-4-6"
 *   usage={{ input: 30000, output: 12300 }}
 *   totalCostUsd={0.42}
 * >
 *   <ContextTrigger />
 *   <ContextContent>
 *     <ContextContentHeader />
 *     <ContextContentBody />
 *     <ContextContentFooter />
 *   </ContextContent>
 * </Context>
 * ```
 */
export function Context({
  className,
  usedTokens,
  maxTokens,
  usage,
  modelId,
  totalCostUsd,
  open,
  defaultOpen,
  onOpenChange,
  children,
  ref,
  ...props
}: ContextProps & { ref?: React.Ref<HTMLDivElement> }) {
  const ctxValue = React.useMemo<ContextContextValue>(
    () => ({ usedTokens, maxTokens, usage, modelId, totalCostUsd }),
    [usedTokens, maxTokens, usage, modelId, totalCostUsd],
  );

  return (
    <ContextContext.Provider value={ctxValue}>
      <div ref={ref} className={cx("context", className)} {...props}>
        <Popover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
          {children}
        </Popover.Root>
      </div>
    </ContextContext.Provider>
  );
}

export interface ContextTriggerProps extends Omit<ButtonProps, "variant" | "color" | "className"> {
  className?: string;
}

export function ContextTrigger({ className, children, ...props }: ContextTriggerProps) {
  const { usedTokens, maxTokens } = useContextContext();
  const percent = maxTokens > 0 ? (usedTokens / maxTokens) * 100 : 0;

  if (React.isValidElement(children)) {
    return <Popover.Trigger render={children} />;
  }

  if (children) {
    return <Popover.Trigger>{children}</Popover.Trigger>;
  }

  return (
    <Popover.Trigger
      render={
        <Button
          variant="ghost"
          color="neutral"
          size="sm"
          className={cx("context__trigger", className)}
          aria-label={`Context usage: ${percent.toFixed(0)}%`}
          {...props}
        >
          <span className="context__trigger-ring" aria-hidden="true">
            <ProgressRing percent={percent} size={16} stroke={2.5} />
          </span>
          <span className="context__trigger-label">{percent.toFixed(0)}%</span>
        </Button>
      }
    />
  );
}

export interface ContextContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContextContent({ className, children, ...props }: ContextContentProps) {
  return (
    <Popover.Portal>
      <Popover.Positioner>
        <Popover.Popup className={cx("context__content", className)} {...props}>
          {children}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  );
}

export interface ContextContentHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContextContentHeader({
  className,
  children,
  ref,
  ...props
}: ContextContentHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { usedTokens, maxTokens, modelId } = useContextContext();
  const percent = maxTokens > 0 ? (usedTokens / maxTokens) * 100 : 0;

  if (children) {
    return (
      <div ref={ref} className={cx("context__header", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cx("context__header", className)} {...props}>
      <div className="context__ring" aria-hidden="true">
        <ProgressRing percent={percent} size={48} stroke={6} />
        <div className="context__ring-label">{percent.toFixed(0)}%</div>
      </div>
      <div className="context__header-text">
        <div className="context__header-title">Context usage</div>
        <div className="context__header-meta">
          {usedTokens.toLocaleString()} / {maxTokens.toLocaleString()} tokens
        </div>
        {modelId ? <div className="context__header-model">{modelId}</div> : null}
      </div>
    </div>
  );
}

export interface ContextContentBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContextContentBody({
  className,
  children,
  ref,
  ...props
}: ContextContentBodyProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { usage } = useContextContext();

  if (children) {
    return (
      <div ref={ref} className={cx("context__body", className)} {...props}>
        {children}
      </div>
    );
  }

  const rows: { label: string; tokens: number; costUsd?: number }[] = [];
  const inputTokens = getUsageTokens(usage, "input");
  const outputTokens = getUsageTokens(usage, "output");
  const reasoningTokens = getUsageTokens(usage, "reasoning");
  const cacheTokens = getUsageTokens(usage, "cache");
  if (inputTokens !== undefined) rows.push({ label: "Input", tokens: inputTokens });
  if (outputTokens !== undefined) rows.push({ label: "Output", tokens: outputTokens });
  if (reasoningTokens !== undefined) rows.push({ label: "Reasoning", tokens: reasoningTokens });
  if (cacheTokens !== undefined) rows.push({ label: "Cache", tokens: cacheTokens });
  if (usage?.categories) rows.push(...usage.categories);

  return (
    <div ref={ref} className={cx("context__body", className)} {...props}>
      <Separator />
      <ul className="context__rows">
        {rows.map((row) => (
          <li key={row.label} className="context__row">
            <span className="context__row-label">{row.label}</span>
            <span className="context__row-value">{row.tokens.toLocaleString()}</span>
            {row.costUsd !== undefined ? (
              <span className="context__row-cost">${row.costUsd.toFixed(4)}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface ContextContentFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContextContentFooter({
  className,
  children,
  ref,
  ...props
}: ContextContentFooterProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { totalCostUsd } = useContextContext();

  if (children) {
    return (
      <div ref={ref} className={cx("context__footer", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cx("context__footer", className)} {...props}>
      <Separator />
      {totalCostUsd !== undefined ? (
        <div className="context__footer-row">
          <span>Total</span>
          <span className="context__footer-cost">${totalCostUsd.toFixed(4)}</span>
        </div>
      ) : null}
    </div>
  );
}

export interface ContextUsageRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export type ContextInputUsageProps = ContextUsageRowProps;
export type ContextOutputUsageProps = ContextUsageRowProps;
export type ContextReasoningUsageProps = ContextUsageRowProps;
export type ContextCacheUsageProps = ContextUsageRowProps;

export function ContextInputUsage(props: ContextInputUsageProps) {
  return <ContextUsageRow usageKey="input" defaultLabel="Input" {...props} />;
}

export function ContextOutputUsage(props: ContextOutputUsageProps) {
  return <ContextUsageRow usageKey="output" defaultLabel="Output" {...props} />;
}

export function ContextReasoningUsage(props: ContextReasoningUsageProps) {
  return <ContextUsageRow usageKey="reasoning" defaultLabel="Reasoning" {...props} />;
}

export function ContextCacheUsage(props: ContextCacheUsageProps) {
  return <ContextUsageRow usageKey="cache" defaultLabel="Cache" {...props} />;
}

function ContextUsageRow({
  className,
  children,
  label,
  usageKey,
  defaultLabel,
  ref,
  ...props
}: ContextUsageRowProps & {
  usageKey: "input" | "output" | "reasoning" | "cache";
  defaultLabel: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const { usage } = useContextContext();
  const tokens = getUsageTokens(usage, usageKey) ?? 0;

  if (children) {
    return children;
  }

  if (!tokens) return null;

  return (
    <div ref={ref} className={cx("context__row", className)} {...props}>
      <span className="context__row-label">{label ?? defaultLabel}</span>
      <span className="context__row-value">{tokens.toLocaleString()}</span>
    </div>
  );
}

function getUsageTokens(
  usage: ContextUsage | undefined,
  key: "input" | "output" | "reasoning" | "cache",
) {
  if (!usage) return undefined;
  if (key === "input") return usage.input ?? usage.inputTokens;
  if (key === "output") return usage.output ?? usage.outputTokens;
  if (key === "reasoning") return usage.reasoning ?? usage.reasoningTokens;
  return usage.cache ?? usage.cachedInputTokens;
}

function ProgressRing({
  percent,
  size,
  stroke,
}: {
  percent: number;
  size: number;
  stroke: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      focusable="false"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--sigvelo-color-neutral-border-subtle)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--sigvelo-color-primary-bg)"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
