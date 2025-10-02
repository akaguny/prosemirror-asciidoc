import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for blockquote nodes
 */
export class BlockquoteSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      state.write("____\n")
      // Render content without automatic block closing newlines
      node.forEach((child, _, i) => {
        if (child.type.name === 'paragraph') {
          // For paragraphs inside blockquotes, don't add trailing newlines
          state.renderInline(child)
        } else {
          state.render(child, node, i)
        }
      })
      state.write("\n____")
      state.closeBlock(node)
      logger.info('Serialized blockquote node', { nodeType: 'blockquote' })
    } catch (error) {
      logger.error('Failed to serialize blockquote node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}