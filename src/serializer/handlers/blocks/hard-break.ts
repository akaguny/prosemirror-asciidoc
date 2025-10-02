import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for hard break nodes
 */
export class HardBreakSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      for (let i = index + 1; i < parent.childCount; i++)
        if (parent.child(i).type != node.type) {
          state.write(" +\n")
          return
        }
      logger.info('Serialized hard break node', { nodeType: 'hard_break' })
    } catch (error) {
      logger.error('Failed to serialize hard break node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}