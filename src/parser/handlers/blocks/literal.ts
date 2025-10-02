import type { AsciidoctorBlock } from '../../../types/asciidoc'
import type { BlockHandler } from '../registry'
import { AsciiDocParserState } from '../../state'
import { logger } from '../../../utils/error-handling'
import { extractBlockContent } from '../../../utils/content-extraction'

/**
 * Handler for literal blocks
 */
export class LiteralHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      state.openNode(state.schema.nodes.code_block)
      const content = this.extractContent(block)
      state.addText(content)
      state.closeNode()

      logger.info('Parsed literal block', { blockType: 'literal' })
    } catch (error) {
      logger.error('Failed to parse literal block', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  private extractContent(block: AsciidoctorBlock): string {
    return extractBlockContent(block)
  }
}