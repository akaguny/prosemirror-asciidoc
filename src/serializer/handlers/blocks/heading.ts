import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for heading nodes
 */
export class HeadingSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      state.write(state.repeat("=", node.attrs.level) + " ")
      state.renderInline(node, false)
      state.closeBlock(node)
      logger.info('Serialized heading node', { nodeType: 'heading', level: node.attrs.level })
    } catch (error) {
      logger.error('Failed to serialize heading node', {
        error: error instanceof Error ? error.message : String(error),
        level: node.attrs.level
      })
      throw error
    }
  }
}