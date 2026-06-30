import Anser from "anser";

/**
 * A single formatted segment of ANSI-decoded text.
 *
 * Colors are emitted as inline CSS custom-property references when they match
 * a standard 16-color code, and as raw `rgb(...)` strings for 256/truecolor.
 * This lets terminal output respect the sigvelo palette while still supporting
 * arbitrary ANSI sequences.
 */
export interface AnsiSegment {
  content: string;
  fg?: string;
  bg?: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  dim: boolean;
}

/**
 * Maps Anser's standard 16-color RGB strings to CSS variables bound to the
 * sigvelo palette. Values come from anser's internal PALETTE. Any RGB triple
 * not in this map falls through to a raw `rgb(...)` literal.
 */
const STANDARD_COLOR_MAP: Record<string, string> = {
  "0, 0, 0": "var(--sigvelo-neutral-300)",
  "187, 0, 0": "var(--sigvelo-destructive-300)",
  "0, 187, 0": "var(--sigvelo-success-300)",
  "187, 187, 0": "var(--sigvelo-warning-300)",
  "0, 0, 187": "var(--sigvelo-primary-300)",
  "187, 0, 187": "var(--sigvelo-primary-200)",
  "0, 187, 187": "var(--sigvelo-primary-200)",
  "255, 255, 255": "var(--sigvelo-neutral-100)",
  "85, 85, 85": "var(--sigvelo-neutral-400)",
  "255, 85, 85": "var(--sigvelo-destructive-300)",
  "85, 255, 85": "var(--sigvelo-success-300)",
  "255, 255, 85": "var(--sigvelo-warning-300)",
  "85, 85, 255": "var(--sigvelo-primary-300)",
  "255, 85, 255": "var(--sigvelo-primary-200)",
  "85, 255, 255": "var(--sigvelo-primary-200)",
  "187, 187, 187": "var(--sigvelo-neutral-300)",
};

function toCss(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const mapped = STANDARD_COLOR_MAP[raw];
  if (mapped) return mapped;
  return `rgb(${raw})`;
}

/**
 * Parses an ANSI-escaped string into an array of formatted segments.
 *
 * Empty segments (bare escape codes) are filtered out.
 */
export function parseAnsi(input: string): AnsiSegment[] {
  const chunks = Anser.ansiToJson(input, { json: true, remove_empty: true });
  return chunks
    .filter((c) => c.content.length > 0)
    .map((c) => ({
      content: c.content,
      fg: toCss(c.fg),
      bg: toCss(c.bg),
      bold: c.decorations?.includes("bold") ?? false,
      italic: c.decorations?.includes("italic") ?? false,
      underline: c.decorations?.includes("underline") ?? false,
      strikethrough: c.decorations?.includes("strikethrough") ?? false,
      dim: c.decorations?.includes("dim") ?? false,
    }));
}
