import type { AsciidoctorBlock, AsciidoctorListItem } from '../types/asciidoc'
import { extractListItemText } from './content-extraction'

/**
 * Utility functions for handling list-related operations
 */

/**
 * Get the starting number for an ordered list
 * @param block The list block
 * @returns The starting number (defaults to 1)
 */
export function getOrderedListStart(block: AsciidoctorBlock): number {
  return block.getStart?.() ?? 1
}

/**
 * Parse list items with common logic for ordered and unordered lists
 * @param items Array of list items to parse
 * @param parseItem Function to parse individual items
 */
export function parseListItems<T>(
  items: AsciidoctorListItem[],
  parseItem: (item: AsciidoctorListItem, index: number) => T
): T[] {
  return items.map((item, index) => parseItem(item, index))
}

/**
 * Create a standardized list item parser function
 * @param state The parser state
 * @param schema The ProseMirror schema
 * @returns A function that parses a list item
 */
export function createListItemParser(state: any, schema: any) {
  return (item: AsciidoctorListItem) => {
    state.openNode(schema.nodes.list_item)

    // Get text content from the item
    const text = extractListItemText(item)
    if (text.trim()) {
      state.openNode(schema.nodes.paragraph)
      state.parseInline(text)
      state.closeNode()
    }

    // Parse any nested blocks (for nested lists)
    const nestedBlocks = item.getBlocks()
    if (nestedBlocks) {
      // This would need access to blockParser, so we'll leave it to the caller
      // blockParser.parseBlocks(nestedBlocks, state)
    }

    state.closeNode()
  }
}