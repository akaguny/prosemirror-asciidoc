/**
 * Utility functions for escaping text in AsciiDoc serialization
 */

/**
 * Escape inline characters that have special meaning in AsciiDoc.
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function escapeInlineCharacters(str: string): string {
  return str.replace(
    /[`*\\~\[\]_]/g,
    (m, i) => m == "_" && i > 0 && i + 1 < str.length && str[i-1].match(/\w/) && str[i+1].match(/\w/) ?  m : "\\" + m
  )
}

/**
 * Escape characters that have special meaning only at the start of a line.
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function escapeLineStartCharacters(str: string): string {
  return str.replace(/^(\+[ ]|[\-*>])/, "\\$&").replace(/^(\s*)(#{1,6})(\s|$)/, '$1\\$2$3').replace(/^(\s*\d+)\.\s/, "$1\\. ")
}

/**
 * Escape extra characters as specified in the options.
 * @param str The string to escape.
 * @param escapeExtraCharacters The regex pattern for extra characters to escape.
 * @returns The escaped string.
 */
export function escapeExtraCharacters(str: string, escapeExtraCharacters?: RegExp): string {
  if (!escapeExtraCharacters) return str
  return str.replace(escapeExtraCharacters, "\\$&")
}

/**
 * Escape the given string so that it can safely appear in AsciiDoc
 * content. If `startOfLine` is true, also escape characters that
 * have special meaning only at the start of the line.
 * @param str The string to escape.
 * @param startOfLine Whether to also escape characters special at line start.
 * @param escapeExtraCharacters Extra characters to escape.
 * @returns The escaped string.
 */
export function esc(str: string, startOfLine = false, escapeExtraCharacters?: RegExp) {
  str = escapeInlineCharacters(str)
  if (startOfLine) str = escapeLineStartCharacters(str)
  if (escapeExtraCharacters) str = str.replace(escapeExtraCharacters, "\\$&")
  return str
}