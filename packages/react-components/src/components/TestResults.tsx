import * as React from "react";
import { Badge, type BadgeColor } from "./Badge.js";
import {
  CollapsiblePanel,
  type CollapsiblePanelProps,
  CollapsibleRoot,
  type CollapsibleRootProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
} from "./Collapsible.js";
import { cx } from "./_internal/class-names.js";
import { CheckIcon, ChevronRightIcon, SpinnerIcon, XIcon } from "./_internal/icons.js";

export type TestStatusValue = "passed" | "failed" | "skipped" | "running";

const STATUS_COLOR: Record<TestStatusValue, BadgeColor> = {
  passed: "success",
  failed: "destructive",
  skipped: "warning",
  running: "primary",
};

const STATUS_LABEL: Record<TestStatusValue, string> = {
  passed: "PASS",
  failed: "FAIL",
  skipped: "SKIP",
  running: "RUN",
};

export interface TestSummary {
  /** Number of passed tests. */
  passed: number;
  /** Number of failed tests. */
  failed: number;
  /** Number of skipped tests. */
  skipped: number;
  /** Total number of tests represented by the summary. */
  total: number;
  /** Total runtime in milliseconds. */
  duration?: number;
}

interface TestResultsContextValue {
  summary?: TestSummary;
}

const TestResultsContext = React.createContext<TestResultsContextValue>({});

export interface TestResultsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Aggregate test counts used by the summary and progress bar. */
  summary?: TestSummary;
  /** Additional class names for layout only; do not override status colors from apps. */
  className?: string;
  /** Optional custom report content; defaults to summary and empty content slots. */
  children?: React.ReactNode;
}

/**
 * Displays a test suite report with summary stats, progress bar, and
 * collapsible per-suite results.
 *
 * Built internally for CI/test output in agent and developer workflows. Use it
 * for structured test reports. Do not use it for generic status dashboards.
 *
 * Sigvelo changes: composes Collapsible, Badge, and Progress; maps status
 * color and spacing to Sigvelo CSS tokens; opens failed suites by default.
 *
 * Suite triggers inherit Collapsible keyboard behavior. Error stacks should be
 * text, not images. Add new statuses here before apps fork their own report UI.
 *
 * @example
 * ```tsx
 * <TestResults summary={{ passed: 10, failed: 1, skipped: 0, total: 11 }}>
 *   <TestSuite name="auth.test.ts" status="failed">
 *     <Test name="rejects bad tokens" status="failed">
 *       <TestError message="Expected 401, received 500" />
 *     </Test>
 *   </TestSuite>
 * </TestResults>
 * ```
 */
export function TestResults({
  className,
  summary,
  children,
  ref,
  ...props
}: TestResultsProps & { ref?: React.Ref<HTMLDivElement> }) {
  const overall: TestStatusValue = summary && summary.failed > 0 ? "failed" : "passed";
  const contextValue = React.useMemo<TestResultsContextValue>(() => ({ summary }), [summary]);

  return (
    <TestResultsContext.Provider value={contextValue}>
      <div ref={ref} className={cx("test-results", className)} data-status={overall} {...props}>
        {children ?? (
          <>
            <TestResultsHeader>
              <TestResultsSummary />
              <TestResultsProgress />
            </TestResultsHeader>
            <TestResultsContent />
          </>
        )}
      </div>
    </TestResultsContext.Provider>
  );
}

export interface TestResultsHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TestResultsHeader({
  className,
  children,
  ref,
  ...props
}: TestResultsHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("test-results__header", className)} {...props}>
      {children}
    </div>
  );
}

export interface TestResultsDurationProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function TestResultsDuration({
  className,
  children,
  ref,
  ...props
}: TestResultsDurationProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { summary } = React.useContext(TestResultsContext);
  if (!summary?.duration) return null;

  return (
    <span ref={ref} className={cx("test-results__stat", className)} {...props}>
      {children ?? formatDuration(summary.duration)}
    </span>
  );
}

export interface TestResultsSummaryProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TestResultsSummary({
  className,
  children,
  ref,
  ...props
}: TestResultsSummaryProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { summary } = React.useContext(TestResultsContext);
  if (!summary) return null;
  const overall: TestStatusValue = summary.failed > 0 ? "failed" : "passed";

  return (
    <div ref={ref} className={cx("test-results__summary", className)} {...props}>
      {children ?? (
        <>
          <Badge color={STATUS_COLOR[overall]} className="test-results__overall">
            {overall === "passed" ? "All tests passed" : `${summary.failed} failed`}
          </Badge>
          <span className="test-results__stats">
            <span className="test-results__stat test-results__stat--passed">
              {summary.passed} passed
            </span>
            <span className="test-results__stat test-results__stat--failed">
              {summary.failed} failed
            </span>
            <span className="test-results__stat test-results__stat--skipped">
              {summary.skipped} skipped
            </span>
            <TestResultsDuration />
          </span>
        </>
      )}
    </div>
  );
}

export interface TestResultsProgressProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TestResultsProgress({
  className,
  children,
  ref,
  ...props
}: TestResultsProgressProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { summary } = React.useContext(TestResultsContext);
  if (!summary) return null;
  const passedPercent = summary.total > 0 ? (summary.passed / summary.total) * 100 : 0;
  const failedPercent = summary.total > 0 ? (summary.failed / summary.total) * 100 : 0;

  if (children) {
    return (
      <div ref={ref} className={cx("test-results__progress", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cx("test-results__progress", className)} {...props}>
      <div
        aria-label="Test progress"
        aria-valuemax={summary.total}
        aria-valuemin={0}
        aria-valuenow={summary.passed}
        aria-valuetext={`${summary.passed}/${summary.total} tests passed, ${summary.failed} failed`}
        className="test-results__progress-track"
        role="progressbar"
      >
        <div
          className="test-results__progress-segment test-results__progress-segment--passed"
          style={{ width: `${passedPercent}%` }}
        />
        <div
          className="test-results__progress-segment test-results__progress-segment--failed"
          style={{ width: `${failedPercent}%` }}
        />
      </div>
      <span className="test-results__progress-label">
        {summary.passed}/{summary.total} tests passed - {failedPercent.toFixed(0)}% failed
      </span>
    </div>
  );
}

export interface TestResultsContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TestResultsContent({
  className,
  children,
  ref,
  ...props
}: TestResultsContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("test-results__body", className)} {...props}>
      {children}
    </div>
  );
}

interface TestSuiteContextValue {
  name: string;
  status: TestStatusValue;
}

const TestSuiteContext = React.createContext<TestSuiteContextValue>({
  name: "",
  status: "passed",
});

export interface TestSuiteProps extends Omit<CollapsibleRootProps, "className" | "unstyled"> {
  className?: string;
  name: string;
  status: TestStatusValue;
}

export function TestSuite({
  className,
  name,
  status,
  defaultOpen,
  children,
  ref,
  ...props
}: TestSuiteProps & { ref?: React.Ref<HTMLDivElement> }) {
  const contextValue = React.useMemo(() => ({ name, status }), [name, status]);
  const isComposable = hasComposableTestSuiteChildren(children);

  return (
    <TestSuiteContext.Provider value={contextValue}>
      <CollapsibleRoot
        ref={ref}
        className={cx("test-results__suite", className)}
        defaultOpen={defaultOpen ?? status === "failed"}
        data-status={status}
        {...props}
        unstyled
      >
        {isComposable ? (
          children
        ) : (
          <>
            <TestSuiteName />
            <TestSuiteContent>
              <div className="test-results__suite-tests">{children}</div>
            </TestSuiteContent>
          </>
        )}
      </CollapsibleRoot>
    </TestSuiteContext.Provider>
  );
}

export type TestSuiteNameProps = Omit<CollapsibleTriggerProps, "className" | "unstyled"> & {
  className?: string;
};

export function TestSuiteName({
  className,
  children,
  ref,
  ...props
}: TestSuiteNameProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const { name, status } = React.useContext(TestSuiteContext);
  return (
    <CollapsibleTrigger
      ref={ref}
      className={cx("test-results__suite-trigger", className)}
      {...props}
      unstyled
    >
      <span className="test-results__suite-icon" aria-hidden="true">
        <ChevronRightIcon />
      </span>
      <Badge color={STATUS_COLOR[status]} size="sm">
        {STATUS_LABEL[status]}
      </Badge>
      <span className="test-results__suite-name">{children ?? name}</span>
    </CollapsibleTrigger>
  );
}

export interface TestSuiteStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  passed?: number;
  failed?: number;
  skipped?: number;
}

export function TestSuiteStats({
  className,
  passed = 0,
  failed = 0,
  skipped = 0,
  children,
  ref,
  ...props
}: TestSuiteStatsProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("test-results__suite-stats", className)} {...props}>
      {children ?? (
        <>
          {passed > 0 ? (
            <span className="test-results__stat test-results__stat--passed">{passed} passed</span>
          ) : null}
          {failed > 0 ? (
            <span className="test-results__stat test-results__stat--failed">{failed} failed</span>
          ) : null}
          {skipped > 0 ? (
            <span className="test-results__stat test-results__stat--skipped">
              {skipped} skipped
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}

export type TestSuiteContentProps = Omit<CollapsiblePanelProps, "className" | "unstyled"> & {
  className?: string;
};

export function TestSuiteContent({
  className,
  children,
  ref,
  ...props
}: TestSuiteContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <CollapsiblePanel
      ref={ref}
      className={cx("test-results__suite-content", className)}
      {...props}
      unstyled
    >
      {children}
    </CollapsiblePanel>
  );
}

function hasComposableTestSuiteChildren(children: React.ReactNode) {
  return React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === TestSuiteName || child.type === TestSuiteContent),
  );
}

interface TestContextValue {
  name: string;
  status: TestStatusValue;
  duration?: number;
}

const TestContext = React.createContext<TestContextValue>({
  name: "",
  status: "passed",
});

export interface TestProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  status: TestStatusValue;
  duration?: number;
}

export function Test({
  className,
  name,
  status,
  duration,
  children,
  ref,
  ...props
}: TestProps & { ref?: React.Ref<HTMLDivElement> }) {
  const contextValue = React.useMemo(() => ({ duration, name, status }), [duration, name, status]);
  const isComposable = hasComposableTestChildren(children);

  return (
    <TestContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cx("test-results__test", `test-results__test--${status}`, className)}
        data-status={status}
        {...props}
      >
        {isComposable ? (
          children
        ) : (
          <>
            <TestStatus />
            <TestName />
            <TestDuration />
            {children ? <div className="test-results__test-children">{children}</div> : null}
          </>
        )}
      </div>
    </TestContext.Provider>
  );
}

export interface TestStatusProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: TestStatusValue;
}

export function TestStatus({
  className,
  children,
  status,
  ref,
  ...props
}: TestStatusProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const testContext = React.useContext(TestContext);
  const testStatus = status ?? testContext.status;
  const icon =
    testStatus === "passed" ? (
      <CheckIcon />
    ) : testStatus === "failed" ? (
      <XIcon />
    ) : testStatus === "running" ? (
      <SpinnerIcon />
    ) : (
      <span aria-hidden="true">.</span>
    );

  return (
    <span
      ref={ref}
      className={cx(
        "test-results__test-status",
        `test-results__test-status--${testStatus}`,
        className,
      )}
      title={testStatus}
      {...props}
    >
      {children ?? icon}
    </span>
  );
}

export interface TestNameProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function TestName({
  className,
  children,
  ref,
  ...props
}: TestNameProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { name } = React.useContext(TestContext);
  return (
    <span ref={ref} className={cx("test-results__test-name", className)} {...props}>
      {children ?? name}
    </span>
  );
}

export interface TestDurationProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function TestDuration({
  className,
  children,
  ref,
  ...props
}: TestDurationProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { duration } = React.useContext(TestContext);
  if (duration === undefined) return null;
  return (
    <span ref={ref} className={cx("test-results__test-duration", className)} {...props}>
      {children ?? `${duration}ms`}
    </span>
  );
}

function hasComposableTestChildren(children: React.ReactNode) {
  return React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === TestStatus || child.type === TestName || child.type === TestDuration),
  );
}

export interface TestErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Error message or stack trace. */
  message?: string;
}

export function TestError({
  className,
  message,
  children,
  ref,
  ...props
}: TestErrorProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("test-results__error", className)} {...props}>
      {children ?? <pre className="test-results__error-text">{message}</pre>}
    </div>
  );
}

export interface TestErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function TestErrorMessage({
  className,
  children,
  ref,
  ...props
}: TestErrorMessageProps & { ref?: React.Ref<HTMLParagraphElement> }) {
  return (
    <p ref={ref} className={cx("test-results__error-message", className)} {...props}>
      {children}
    </p>
  );
}

export interface TestErrorStackProps extends React.HTMLAttributes<HTMLPreElement> {}

export function TestErrorStack({
  className,
  children,
  ref,
  ...props
}: TestErrorStackProps & { ref?: React.Ref<HTMLPreElement> }) {
  return (
    <pre ref={ref} className={cx("test-results__error-text", className)} {...props}>
      {children}
    </pre>
  );
}

function formatDuration(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}
