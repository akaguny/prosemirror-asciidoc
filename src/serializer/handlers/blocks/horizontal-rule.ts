import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for horizontal rule nodes
 */
export class HorizontalRuleSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      state.write("'''\n")
      state.closeBlock(node)
      logger.info('Serialized horizontal rule node', { nodeType: 'horizontal_rule' })
    } catch (error) {
      logger.error('Failed to serialize horizontal rule node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}