import * as React from "react";
import { Badge } from "./Badge.js";
import { Button, type ButtonProps } from "./Button.js";
import { Switch, SwitchThumb } from "./Switch.js";
import {
  Tooltip,
  TooltipPopup,
  TooltipPortal,
  TooltipPositioner,
  TooltipTrigger,
} from "./Tooltip.js";
import { cx } from "./_internal/class-names.js";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from "./_internal/icons.js";

interface EnvStateContextValue {
  showValues: boolean;
  setShowValues: (next: boolean) => void;
}

const EnvStateContext = React.createContext<EnvStateContextValue | null>(null);

function useEnvStateContext(): EnvStateContextValue {
  const ctx = React.useContext(EnvStateContext);
  if (!ctx) {
    throw new Error(
      "EnvironmentVariable subcomponents must be used inside <EnvironmentVariables>.",
    );
  }
  return ctx;
}

interface VariableContextValue {
  name: string;
  value: string;
}

const VariableContext = React.createContext<VariableContextValue | null>(null);

function useVariableContext(): VariableContextValue {
  const ctx = React.useContext(VariableContext);
  if (!ctx) {
    throw new Error("EnvironmentVariableName/Value must be inside <EnvironmentVariable>.");
  }
  return ctx;
}

export interface EnvironmentVariablesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controlled visibility for all variable values. */
  showValues?: boolean;
  /** Initial visibility for uncontrolled value reveal state. */
  defaultShowValues?: boolean;
  /** Called when the reveal switch changes value visibility. */
  onShowValuesChange?: (show: boolean) => void;
  /** Additional class names for layout only; do not override masking styles from apps. */
  className?: string;
  /** Header, content, groups, and variable rows. */
  children?: React.ReactNode;
}

/**
 * A panel displaying environment variables with masked values and per-variable
 * copy actions. Toggle the reveal switch to show all values at once.
 *
 * Built internally for deployment/setup screens. Use it to display known
 * environment keys and copyable values. Do not treat masking as a security
 * boundary; do not render secrets for users who are not allowed to see them.
 *
 * Sigvelo changes: composes Badge, Button, Switch, and Tooltip; maps copy and
 * reveal controls to Sigvelo CSS tokens; keeps masking local to the component.
 *
 * Values need visible labels and copy buttons need accessible labels. Styling
 * consumes text, muted text, border, surface, spacing, radius, and focus tokens.
 * Add shared formats here if multiple apps need them.
 *
 * @example
 * ```tsx
 * <EnvironmentVariables defaultShowValues={false}>
 *   <EnvironmentVariablesHeader>
 *     <EnvironmentVariablesTitle>Server env</EnvironmentVariablesTitle>
 *     <EnvironmentVariablesToggle />
 *   </EnvironmentVariablesHeader>
 *   <EnvironmentVariablesContent>
 *     <EnvironmentVariable name="DATABASE_URL" value="postgres://localhost/x">
 *       <EnvironmentVariableName />
 *       <EnvironmentVariableValue />
 *       <EnvironmentVariableRequired />
 *       <EnvironmentVariableCopyButton format="export" />
 *     </EnvironmentVariable>
 *   </EnvironmentVariablesContent>
 * </EnvironmentVariables>
 * ```
 */
export function EnvironmentVariables({
  className,
  showValues,
  defaultShowValues = false,
  onShowValuesChange,
  children,
  ref,
  ...props
}: EnvironmentVariablesProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [internal, setInternal] = React.useState(defaultShowValues);
  const isControlled = showValues !== undefined;
  const current = isControlled ? showValues : internal;

  const setShowValues = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onShowValuesChange?.(next);
    },
    [isControlled, onShowValuesChange],
  );

  const ctxValue = React.useMemo<EnvStateContextValue>(
    () => ({ showValues: current, setShowValues }),
    [current, setShowValues],
  );

  return (
    <EnvStateContext.Provider value={ctxValue}>
      <div ref={ref} className={cx("environment-variables", className)} {...props}>
        {children}
      </div>
    </EnvStateContext.Provider>
  );
}

export interface EnvironmentVariablesHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EnvironmentVariablesHeader({
  className,
  children,
  ref,
  ...props
}: EnvironmentVariablesHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("environment-variables__header", className)} {...props}>
      {children}
    </div>
  );
}

export interface EnvironmentVariablesTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function EnvironmentVariablesTitle({
  className,
  children,
  ref,
  ...props
}: EnvironmentVariablesTitleProps & { ref?: React.Ref<HTMLHeadingElement> }) {
  return (
    <h3 ref={ref} className={cx("environment-variables__title", className)} {...props}>
      {children ?? "Environment Variables"}
    </h3>
  );
}

export interface EnvironmentVariablesToggleProps extends Omit<
  React.HTMLAttributes<HTMLLabelElement>,
  "onChange"
> {
  /** Optional label. Defaults to "Show values". */
  label?: string;
}

export function EnvironmentVariablesToggle({
  className,
  label = "Show values",
  ref,
  ...props
}: EnvironmentVariablesToggleProps & { ref?: React.Ref<HTMLLabelElement> }) {
  const { showValues, setShowValues } = useEnvStateContext();
  return (
    <label ref={ref} className={cx("environment-variables__toggle", className)} {...props}>
      <span aria-hidden="true" className="environment-variables__toggle-icon">
        {showValues ? <EyeIcon /> : <EyeOffIcon />}
      </span>
      <span className="environment-variables__toggle-label">{label}</span>
      <Switch checked={showValues} onCheckedChange={setShowValues} size="sm">
        <SwitchThumb />
      </Switch>
    </label>
  );
}

export interface EnvironmentVariablesContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EnvironmentVariablesContent({
  className,
  children,
  ref,
  ...props
}: EnvironmentVariablesContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("environment-variables__content", className)} {...props}>
      {children}
    </div>
  );
}

export interface EnvironmentVariableGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function EnvironmentVariableGroup({
  className,
  label,
  children,
  ref,
  ...props
}: EnvironmentVariableGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("environment-variables__group", className)} {...props}>
      {label ? <div className="environment-variables__group-label">{label}</div> : null}
      {children}
    </div>
  );
}

export interface EnvironmentVariableProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  value: string;
}

export function EnvironmentVariable({
  className,
  name,
  value,
  children,
  ref,
  ...props
}: EnvironmentVariableProps & { ref?: React.Ref<HTMLDivElement> }) {
  const ctxValue = React.useMemo<VariableContextValue>(() => ({ name, value }), [name, value]);
  return (
    <VariableContext.Provider value={ctxValue}>
      <div ref={ref} className={cx("environment-variables__row", className)} {...props}>
        {children ?? (
          <>
            <EnvironmentVariableName />
            <EnvironmentVariableValue />
          </>
        )}
      </div>
    </VariableContext.Provider>
  );
}

export interface EnvironmentVariableNameProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function EnvironmentVariableName({
  className,
  children,
  ref,
  ...props
}: EnvironmentVariableNameProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { name } = useVariableContext();
  return (
    <span ref={ref} className={cx("environment-variables__name", className)} {...props}>
      {children ?? name}
    </span>
  );
}

export interface EnvironmentVariableValueProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function EnvironmentVariableValue({
  className,
  children,
  ref,
  ...props
}: EnvironmentVariableValueProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { value } = useVariableContext();
  const { showValues } = useEnvStateContext();
  const masked = "•".repeat(Math.min(value.length, 12));
  return (
    <span ref={ref} className={cx("environment-variables__value", className)} {...props}>
      {children ?? (showValues ? value : masked)}
    </span>
  );
}

export type EnvironmentVariableCopyFormat = "name" | "value" | "export";

export interface EnvironmentVariableCopyButtonProps extends Omit<
  ButtonProps,
  "children" | "variant" | "size" | "color" | "className" | "onClick" | "onError"
> {
  format?: EnvironmentVariableCopyFormat;
  copyFormat?: EnvironmentVariableCopyFormat;
  label?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

export function EnvironmentVariableCopyButton({
  className,
  format = "value",
  copyFormat,
  label,
  onClick,
  onCopy,
  onError,
  timeout = 1500,
  ...props
}: EnvironmentVariableCopyButtonProps) {
  const { name, value } = useVariableContext();
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  const resolvedFormat = copyFormat ?? format;
  const text =
    resolvedFormat === "name"
      ? name
      : resolvedFormat === "export"
        ? `export ${name}="${value}"`
        : value;

  const buttonLabel = label ?? `Copy ${resolvedFormat}`;

  const handleClick = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopy?.();
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
      } catch (error) {
        onError?.(error as Error);
      }
      onClick?.(e);
    },
    [onClick, onCopy, onError, text, timeout],
  );

  React.useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={buttonLabel}
            className={cx("environment-variables__copy", className)}
            {...props}
            onClick={handleClick}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        }
      />
      <TooltipPortal>
        <TooltipPositioner>
          <TooltipPopup>{copied ? "Copied" : buttonLabel}</TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </Tooltip>
  );
}

export interface EnvironmentVariableRequiredProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "color"
> {}

export function EnvironmentVariableRequired({
  className,
  children,
  ref,
  ...props
}: EnvironmentVariableRequiredProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return (
    <Badge
      {...props}
      ref={ref}
      color="warning"
      size="sm"
      className={cx("environment-variables__required", className)}
    >
      {children ?? "Required"}
    </Badge>
  );
}
