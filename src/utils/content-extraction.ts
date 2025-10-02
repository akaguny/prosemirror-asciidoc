import type { AsciidoctorBlock, AsciidoctorListItem } from '../types/asciidoc'
import { logger } from './error-handling'

/**
 * Utility functions for extracting content from Asciidoctor objects
 */

/**
 * Extract text content from an Asciidoctor block using multiple fallback methods.
 * @param block The Asciidoctor block to extract content from
 * @returns The extracted content string, or empty string if extraction fails
 */
export function extractBlockContent(block: AsciidoctorBlock): string {
  // Define content getters in order of preference
  const contentGetters = [
    { name: 'getSource', getter: () => block.getSource?.() },
    { name: 'getText', getter: () => block.getText?.() },
    { name: 'getContent', getter: () => block.getContent?.() },
    { name: 'lines', getter: () => block.lines?.join('\n') }
  ]

  // Try each getter and return the first successful result
  for (const { name, getter } of contentGetters) {
    try {
      const content = getter()
      if (content !== undefined && content !== null) {
        logger.info(`Successfully extracted content using ${name}`, { blockType: block.getNodeName() })
        return content
      }
    } catch (error) {
      logger.warn(`Failed to get content using ${name}`, {
        blockType: block.getNodeName(),
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // Return empty string if all methods fail
  logger.warn('All content extraction methods failed', { blockType: block.getNodeName() })
  return ''
}

/**
 * Extract text content from an Asciidoctor list item.
 * @param item The Asciidoctor list item to extract content from
 * @returns The extracted text content
 */
export function extractListItemText(item: AsciidoctorListItem): string {
  if (item.getText) {
    return item.getText() || ''
  } else if (item.getContent) {
    return item.getContent() || ''
  }
  return ''
}