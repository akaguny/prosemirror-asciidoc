import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for image nodes
 */
export class ImageSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      state.write("image:" + node.attrs.src.replace(/[\(\)]/g, "\\$&") +
                  (node.attrs.alt ? "[" + node.attrs.alt.replace(/[\[\]]/g, "\\$&") + "]" : "") +
                  (node.attrs.title ? ' "' + node.attrs.title.replace(/"/g, '\\"') + '"' : ""))
      logger.info('Serialized image node', { nodeType: 'image', src: node.attrs.src })
    } catch (error) {
      logger.error('Failed to serialize image node', {
        error: error instanceof Error ? error.message : String(error),
        src: node.attrs.src
      })
      throw error
    }
  }
}