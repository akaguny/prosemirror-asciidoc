import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for text nodes
 */
export class TextSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      if (node.text != null) state.text(node.text, true)
      logger.info('Serialized text node', { nodeType: 'text' })
    } catch (error) {
      logger.error('Failed to serialize text node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}