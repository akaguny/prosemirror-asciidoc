import type { AsciidoctorBlock } from '../../../types/asciidoc'
import type { BlockHandler } from '../registry'
import { AsciiDocParserState } from '../../state'
import { logger } from '../../../utils/error-handling'
import { extractBlockContent } from '../../../utils/content-extraction'

/**
 * Handler for paragraph blocks
 */
export class ParagraphHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      state.openNode(state.schema.nodes.paragraph)
      const content = this.extractContent(block)
      if (content) {
        state.parseInline(content)
      } else {
        state.addText('')
      }
      state.closeNode()
      logger.info('Parsed paragraph block', { blockType: 'paragraph' })
    } catch (error) {
      logger.error('Failed to parse paragraph block', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  private extractContent(block: AsciidoctorBlock): string {
    return extractBlockContent(block)
  }
}