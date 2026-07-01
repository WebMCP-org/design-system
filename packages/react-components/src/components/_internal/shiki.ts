import { createHighlighter, type Highlighter, type BundledLanguage } from "shiki";

/**
 * Supported languages for CodeBlock.
 *
 * These are the default short aliases shown in the language selector. Full
 * Shiki bundled language names are loaded on demand.
 */
export type CodeBlockLanguage =
  | BundledLanguage
  | "ts"
  | "tsx"
  | "js"
  | "jsx"
  | "css"
  | "html"
  | "json"
  | "bash"
  | "md";

export const CODE_BLOCK_LANGUAGES: ReadonlyArray<CodeBlockLanguage> = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "css",
  "html",
  "json",
  "bash",
  "md",
];

const SHIKI_LANGS: Array<BundledLanguage> = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "css",
  "html",
  "json",
  "bash",
  "markdown",
];

const LANG_ALIAS = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  css: "css",
  html: "html",
  json: "json",
  bash: "bash",
  md: "markdown",
} satisfies Record<string, BundledLanguage>;

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Returns a cached Shiki highlighter instance with both light and dark themes.
 * Extra languages are loaded lazily by `loadShikiLanguage`.
 */
export function getHighlighterInstance(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ["github-light-high-contrast", "github-dark-high-contrast"],
    langs: SHIKI_LANGS,
  });
  return highlighterPromise;
}

/**
 * Loads a Shiki bundled language if it is not already available.
 */
export async function loadShikiLanguage(
  highlighter: Highlighter,
  lang: CodeBlockLanguage,
): Promise<BundledLanguage> {
  const shikiLang = toShikiLang(lang);
  if (!highlighter.getLoadedLanguages().includes(shikiLang)) {
    await highlighter.loadLanguage(shikiLang);
  }
  return shikiLang;
}

export function toShikiLang(lang: CodeBlockLanguage): BundledLanguage {
  return LANG_ALIAS[lang as keyof typeof LANG_ALIAS] ?? (lang as BundledLanguage);
}
