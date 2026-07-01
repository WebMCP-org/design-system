import * as React from "react";
import type { BundledLanguage, ThemedToken, TokensResult } from "shiki";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
  SelectValue,
  type SelectProps,
  type SelectContentProps,
  type SelectItemProps,
  type SelectTriggerProps,
  type SelectValueProps,
} from "./Select.js";
import { cx } from "./_internal/class-names.js";
import { CopyButton, type CopyButtonProps } from "./_internal/copy-button.js";
import {
  CODE_BLOCK_LANGUAGES,
  type CodeBlockLanguage,
  getHighlighterInstance,
  loadShikiLanguage,
  toShikiLang,
} from "./_internal/shiki.js";

export { CODE_BLOCK_LANGUAGES, type CodeBlockLanguage };

export interface TokenizedCode {
  tokens: ThemedToken[][];
  fg: string;
  bg: string;
}

const tokensCache = new Map<string, TokenizedCode>();
const subscribers = new Map<string, Set<(result: TokenizedCode) => void>>();

function getTokensCacheKey(code: string, language: CodeBlockLanguage | BundledLanguage) {
  return JSON.stringify([language, code]);
}

function createRawTokens(code: string): TokenizedCode {
  return {
    bg: "transparent",
    fg: "inherit",
    tokens: code.split("\n").map((line) =>
      line
        ? [
            {
              content: line,
              color: "inherit",
            } as ThemedToken,
          ]
        : [],
    ),
  };
}

function resolveCodeBlockLanguage(language: CodeBlockLanguage | BundledLanguage): BundledLanguage {
  return CODE_BLOCK_LANGUAGES.includes(language as CodeBlockLanguage)
    ? toShikiLang(language as CodeBlockLanguage)
    : language;
}

export function highlightCode(
  code: string,
  language: CodeBlockLanguage | BundledLanguage,
  callback?: (result: TokenizedCode) => void,
): TokenizedCode | null {
  const tokensCacheKey = getTokensCacheKey(code, language);
  const cached = tokensCache.get(tokensCacheKey);
  if (cached) return cached;

  if (callback) {
    const tokenSubscribers = subscribers.get(tokensCacheKey) ?? new Set();
    tokenSubscribers.add(callback);
    subscribers.set(tokensCacheKey, tokenSubscribers);
  }

  void getHighlighterInstance()
    .then(async (highlighter) => {
      const lang = resolveCodeBlockLanguage(language);
      let result: TokensResult;
      try {
        const loadedLang = await loadShikiLanguage(highlighter, lang);
        result = highlighter.codeToTokens(code, {
          lang: loadedLang,
          themes: {
            light: "github-light-high-contrast",
            dark: "github-dark-high-contrast",
          },
        });
      } catch {
        const raw = createRawTokens(code);
        tokensCache.set(tokensCacheKey, raw);
        notifyTokenSubscribers(tokensCacheKey, raw);
        return;
      }

      const tokenized: TokenizedCode = {
        tokens: result.tokens,
        fg: result.fg ?? "inherit",
        bg: result.bg ?? "transparent",
      };
      tokensCache.set(tokensCacheKey, tokenized);
      notifyTokenSubscribers(tokensCacheKey, tokenized);
    })
    .catch(() => {
      const raw = createRawTokens(code);
      tokensCache.set(tokensCacheKey, raw);
      notifyTokenSubscribers(tokensCacheKey, raw);
    });

  return null;
}

function notifyTokenSubscribers(tokensCacheKey: string, result: TokenizedCode) {
  const tokenSubscribers = subscribers.get(tokensCacheKey);
  if (!tokenSubscribers) return;
  for (const subscriber of tokenSubscribers) {
    subscriber(result);
  }
  subscribers.delete(tokensCacheKey);
}

interface CodeBlockContextValue {
  code: string;
  language: CodeBlockLanguage;
  setLanguage: (next: CodeBlockLanguage) => void;
  showLineNumbers: boolean;
  isStreaming: boolean;
}

const CodeBlockContext = React.createContext<CodeBlockContextValue | null>(null);

function useCodeBlockContext(): CodeBlockContextValue {
  const ctx = React.useContext(CodeBlockContext);
  if (!ctx) {
    throw new Error("CodeBlock subcomponents must be used inside <CodeBlock>.");
  }
  return ctx;
}

function renderPlainCode(code: string, showLineNumbers: boolean) {
  if (!showLineNumbers) return code;

  return code.split("\n").map((line, index) => (
    <span className="line" key={`${index}-${line}`}>
      {line || " "}
    </span>
  ));
}

function hasCustomCodeBlockContent(children: React.ReactNode) {
  return React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === CodeBlockContainer || child.type === CodeBlockContent),
  );
}

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The source code to display. */
  code: string;
  /** The language to highlight as. */
  language: CodeBlockLanguage;
  /** Whether to render line numbers in the left gutter. */
  showLineNumbers?: boolean;
  /**
   * Skip syntax highlighting while code is actively streaming in. Renders the
   * plain monospace fallback instead. Highlighting runs once when this flips
   * back to false.
   */
  isStreaming?: boolean;
  /** Fired when the language is changed via the inline selector. */
  onLanguageChange?: (next: CodeBlockLanguage) => void;
}

/**
 * A syntax-highlighted code block powered by Shiki. Supports line numbers,
 * inline language switching, and a copy-to-clipboard action.
 *
 * Supports Shiki bundled language names plus the short aliases in
 * `CODE_BLOCK_LANGUAGES`. The highlighter is loaded lazily on first render and
 * cached at module scope. Adapted from Vercel AI Elements and restyled with
 * Sigvelo CSS tokens.
 *
 * @example
 * ```tsx
 * <CodeBlock code={"const x = 42;"} language="ts">
 *   <CodeBlockHeader>
 *     <CodeBlockFilename>example.ts</CodeBlockFilename>
 *     <CodeBlockActions>
 *       <CodeBlockCopyButton />
 *     </CodeBlockActions>
 *   </CodeBlockHeader>
 *   <CodeBlockContainer>
 *     <CodeBlockContent />
 *   </CodeBlockContainer>
 * </CodeBlock>
 * ```
 *
 * @see {@link https://elements.ai-sdk.dev/components/code-block | AI Elements Code Block}
 */
export function CodeBlock({
  className,
  code,
  language,
  showLineNumbers = false,
  isStreaming = false,
  onLanguageChange,
  children,
  ref,
  ...props
}: CodeBlockProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [internalLanguage, setInternalLanguage] = React.useState(language);

  // Sync when parent changes the prop.
  React.useEffect(() => {
    setInternalLanguage(language);
  }, [language]);

  const setLanguage = React.useCallback(
    (next: CodeBlockLanguage) => {
      setInternalLanguage(next);
      onLanguageChange?.(next);
    },
    [onLanguageChange],
  );

  const ctxValue = React.useMemo<CodeBlockContextValue>(
    () => ({ code, language: internalLanguage, setLanguage, showLineNumbers, isStreaming }),
    [code, internalLanguage, setLanguage, showLineNumbers, isStreaming],
  );
  const hasCustomContent = hasCustomCodeBlockContent(children);

  return (
    <CodeBlockContext.Provider value={ctxValue}>
      <div ref={ref} className={cx("code-block", className)} {...props}>
        {children}
        {!hasCustomContent && (
          <CodeBlockContainer>
            <CodeBlockContent />
          </CodeBlockContainer>
        )}
      </div>
    </CodeBlockContext.Provider>
  );
}

export interface CodeBlockHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CodeBlockHeader({
  className,
  children,
  ref,
  ...props
}: CodeBlockHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("code-block__header", className)} {...props}>
      {children}
    </div>
  );
}

export interface CodeBlockTitleProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function CodeBlockTitle({
  className,
  children,
  ref,
  ...props
}: CodeBlockTitleProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return (
    <span ref={ref} className={cx("code-block__title", className)} {...props}>
      {children}
    </span>
  );
}

export interface CodeBlockFilenameProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function CodeBlockFilename({
  className,
  children,
  ref,
  ...props
}: CodeBlockFilenameProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return (
    <span ref={ref} className={cx("code-block__filename", className)} {...props}>
      {children}
    </span>
  );
}

export interface CodeBlockActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CodeBlockActions({
  className,
  children,
  ref,
  ...props
}: CodeBlockActionsProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("code-block__actions", className)} {...props}>
      {children}
    </div>
  );
}

export interface CodeBlockCopyButtonProps extends Omit<CopyButtonProps, "text" | "label"> {
  label?: string;
}

export function CodeBlockCopyButton({
  className,
  label = "Copy code",
  timeout = 2000,
  onClick,
  ...props
}: CodeBlockCopyButtonProps) {
  const { code } = useCodeBlockContext();

  return (
    <CopyButton
      {...props}
      text={code}
      label={label}
      timeout={timeout}
      className={cx("code-block__copy", className)}
      onClick={onClick}
    />
  );
}

export interface CodeBlockLanguageSelectorProps extends Omit<
  SelectProps,
  "children" | "onValueChange" | "value"
> {
  languages?: ReadonlyArray<CodeBlockLanguage>;
  value?: SelectProps["value"];
  onValueChange?: SelectProps["onValueChange"];
  children?: React.ReactNode;
  className?: string;
}

export function CodeBlockLanguageSelector({
  children,
  className,
  languages = CODE_BLOCK_LANGUAGES,
  onValueChange,
  ref,
  value,
  ...props
}: CodeBlockLanguageSelectorProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { language, setLanguage } = useCodeBlockContext();
  const handleValueChange = React.useCallback<NonNullable<SelectProps["onValueChange"]>>(
    (next, eventDetails) => {
      setLanguage(next as CodeBlockLanguage);
      onValueChange?.(next, eventDetails);
    },
    [onValueChange, setLanguage],
  );

  return (
    <div ref={ref} className={cx("code-block__language-selector", className)}>
      <Select {...props} value={value ?? language} onValueChange={handleValueChange}>
        {children ?? (
          <>
            <CodeBlockLanguageSelectorTrigger aria-label="Code language">
              <CodeBlockLanguageSelectorValue />
            </CodeBlockLanguageSelectorTrigger>
            <CodeBlockLanguageSelectorContent>
              <SelectList>
                {languages.map((lang) => (
                  <CodeBlockLanguageSelectorItem key={lang} value={lang}>
                    {lang}
                  </CodeBlockLanguageSelectorItem>
                ))}
              </SelectList>
            </CodeBlockLanguageSelectorContent>
          </>
        )}
      </Select>
    </div>
  );
}

export type CodeBlockLanguageSelectorTriggerProps = SelectTriggerProps;
export type CodeBlockLanguageSelectorValueProps = SelectValueProps;
export type CodeBlockLanguageSelectorContentProps = SelectContentProps;
export type CodeBlockLanguageSelectorItemProps = SelectItemProps;

export function CodeBlockLanguageSelectorTrigger({
  size = "sm",
  ...props
}: CodeBlockLanguageSelectorTriggerProps) {
  return <SelectTrigger size={size} {...props} />;
}

export function CodeBlockLanguageSelectorValue(props: CodeBlockLanguageSelectorValueProps) {
  return <SelectValue {...props} />;
}

export function CodeBlockLanguageSelectorContent({
  align = "end",
  ...props
}: CodeBlockLanguageSelectorContentProps) {
  return <SelectContent align={align} {...props} />;
}

export function CodeBlockLanguageSelectorItem(props: CodeBlockLanguageSelectorItemProps) {
  return <SelectItem {...props} />;
}

export interface CodeBlockContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CodeBlockContainer({
  className,
  children,
  ref,
  ...props
}: CodeBlockContainerProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={cx("code-block__container", className)} {...props}>
      {children}
    </div>
  );
}

export interface CodeBlockContentProps extends React.HTMLAttributes<HTMLElement> {}

export function CodeBlockContent({
  className,
  ref,
  ...props
}: CodeBlockContentProps & { ref?: React.Ref<HTMLElement> }) {
  const { code, language, showLineNumbers, isStreaming } = useCodeBlockContext();
  const [html, setHtml] = React.useState<string | null>(null);
  const [theme, setTheme] = React.useState<
    "github-light-high-contrast" | "github-dark-high-contrast"
  >(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "dark"
      ? "github-dark-high-contrast"
      : "github-light-high-contrast",
  );

  // Watch for theme changes on <html data-theme>.
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const update = () => {
      setTheme(
        document.documentElement.dataset.theme === "dark"
          ? "github-dark-high-contrast"
          : "github-light-high-contrast",
      );
    };
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (isStreaming) return;
    let cancelled = false;
    void (async () => {
      try {
        const highlighter = await getHighlighterInstance();
        const loadedLang = await loadShikiLanguage(highlighter, language);
        const out = highlighter.codeToHtml(code, {
          lang: loadedLang,
          theme,
        });
        if (!cancelled) setHtml(out);
      } catch {
        if (!cancelled) setHtml(`<pre>${escapeHtml(code)}</pre>`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, language, theme, isStreaming]);

  if (html === null || isStreaming) {
    return (
      <pre
        ref={ref as React.Ref<HTMLPreElement>}
        className={cx(
          "code-block__content",
          showLineNumbers && "code-block__content--numbered",
          className,
        )}
        {...props}
      >
        <code>{renderPlainCode(code, showLineNumbers)}</code>
      </pre>
    );
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cx(
        "code-block__content code-block__content--highlighted",
        showLineNumbers && "code-block__content--numbered",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
