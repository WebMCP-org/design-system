/**
 * Concatenates class-name parts, skipping falsy values. Local copy of
 * react-components' `_internal/class-names`, which isn't exported across
 * packages.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
