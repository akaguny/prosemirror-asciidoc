import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for paragraph nodes
 */
export class ParagraphSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      // Check if paragraph has content
      const hasContent = node.textContent.trim().length > 0

      if (hasContent) {
        state.renderInline(node)
      } else {
        // For empty paragraphs, ensure a blank line is maintained
        state.write('')
      }
      state.closeBlock(node)
      logger.info('Serialized paragraph node', { nodeType: 'paragraph', hasContent })
    } catch (error) {
      logger.error('Failed to serialize paragraph node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}