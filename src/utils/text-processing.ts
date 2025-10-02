/**
 * Utility functions for text processing, escaping, and formatting validation
 */

/**
 * Handle escaped characters by marking them with null character
 * @param text The text to process
 * @returns The processed text with escape markers
 */
export function handleEscapedCharacters(text: string): string {
  return text.replace(/\\(\*|_|`|\+|\\)/g, '\u0000$1')
}

/**
 * Remove escape markers from text
 * @param text The text to unescape
 * @returns The unescaped text
 */
export function unescapeCharacters(text: string): string {
  return text.replace(/\u0000(\*|_|`|\+|\\)/g, '$1')
}

/**
 * Check if text contains unprocessed backslash escapes
 * @param text The text to check
 * @returns True if unprocessed escapes are found
 */
export function hasUnprocessedEscapes(text: string): boolean {
  return text.includes('\\')
}

/**
 * Clean up backslashes that are not part of formatting
 * @param text The text to clean
 * @returns The cleaned text
 */
export function cleanUnprocessedEscapes(text: string): string {
  return text.replace(/\\(\*|_)/g, '$1')
}

/**
 * Check if part is valid strong formatting
 * @param part The text part to validate
 * @returns True if valid strong formatting
 */
export function isValidStrongFormatting(part: string): boolean {
  if (!part.startsWith('*') || !part.endsWith('*') || part.length <= 2) return false
  const inner = part.slice(1, -1)
  return !/\w/.test(inner) || inner.length > 1
}

/**
 * Check if part is valid emphasis formatting
 * @param part The text part to validate
 * @returns True if valid emphasis formatting
 */
export function isValidEmFormatting(part: string): boolean {
  if (!part.startsWith('_') || !part.endsWith('_') || part.length <= 2) return false
  const inner = part.slice(1, -1)
  return !/\w/.test(inner) || inner.length > 1
}

/**
 * Check if part is valid code formatting with given delimiter
 * @param part The text part to validate
 * @param delimiter The delimiter character (` or +)
 * @returns True if valid code formatting
 */
export function isValidCodeFormatting(part: string, delimiter: string): boolean {
  return part.startsWith(delimiter) && part.endsWith(delimiter) && part.length > 2
}

/**
 * Detect the type of formatting for a text part
 * @param part The text part to analyze
 * @returns The formatting type or null if not formatted
 */
export function detectFormattingType(part: string): 'strong' | 'em' | 'code' | null {
  if (isValidStrongFormatting(part)) return 'strong'
  if (isValidEmFormatting(part)) return 'em'
  if (isValidCodeFormatting(part, '`')) return 'code'
  if (isValidCodeFormatting(part, '+')) return 'code'
  return null
}

/**
 * Split text by formatting patterns while preserving the patterns
 * @param text The text to split
 * @returns Array of text segments with formatting markers
 */
export function splitByFormattingPatterns(text: string): string[] {
  return text.split(/(\*.*?\*|_.*?_|`.*?`|\+.*?\+)/g)
}

/**
 * Split text by links, preserving link markers
 * @param text The text to split
 * @returns Array of text segments with link markers
 */
export function splitByLinks(text: string): string[] {
  const linkRegex = /link:([^\[]*)\[([^\]]*)\]/g
  const textSegments: string[] = []
  let lastIndex = 0

  let match
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      textSegments.push(text.slice(lastIndex, match.index))
    }
    // Add the link as a special marker
    textSegments.push(`__LINK__${match[1]}__${match[2]}__LINK__`)
    lastIndex = linkRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    textSegments.push(text.slice(lastIndex))
  }

  return textSegments
}

/**
 * Check if a part is a link marker
 * @param part The text part to check
 * @returns True if it's a link marker
 */
export function isLinkPart(part: string): boolean {
  return part.startsWith('__LINK__') && part.endsWith('__LINK__')
}

/**
 * Parse a link part into href and link text
 * @param linkPart The link marker part
 * @returns Object with href and linkText
 */
export function parseLinkPart(linkPart: string): { href: string; linkText: string } {
  const linkContent = linkPart.slice(8, -8)
  const [href, linkText] = linkContent.split('__')
  return { href, linkText }
}