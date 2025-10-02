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
      state.renderInline(node)
      state.closeBlock(node)
      logger.info('Serialized paragraph node', { nodeType: 'paragraph' })
    } catch (error) {
      logger.error('Failed to serialize paragraph node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}