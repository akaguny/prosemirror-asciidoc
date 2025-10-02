import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for code block nodes
 */
export class CodeBlockSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      state.write("----\n")
      state.text(node.textContent, false)
      state.write("\n----")
      state.closeBlock(node)
      logger.info('Serialized code block node', { nodeType: 'code_block' })
    } catch (error) {
      logger.error('Failed to serialize code block node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}