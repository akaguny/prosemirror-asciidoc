import type { AsciidoctorBlock } from '../../../types/asciidoc'
import type { BlockHandler } from '../registry'
import { AsciiDocParserState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Handler for listing blocks
 */
export class ListingHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      // Include the title if it exists
      const title = block.getTitle ? block.getTitle() : ''
      if (title) {
        state.openNode(state.schema.nodes.paragraph)
        state.openMark(state.schema.marks.strong.create())
        state.addText(title)
        state.closeMark(state.schema.marks.strong)
        state.closeNode()
      }

      state.openNode(state.schema.nodes.code_block)
      const content = this.extractContent(block)
      state.addText(content)
      state.closeNode()

      logger.info('Parsed listing block', { blockType: 'listing', hasTitle: !!title })
    } catch (error) {
      logger.error('Failed to parse listing block', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  private extractContent(block: AsciidoctorBlock): string {
    const contentMethods = [
      () => block.getSource?.(),
      () => block.getText?.(),
      () => block.getContent?.(),
      () => block.lines?.join('\n')
    ]

    for (const method of contentMethods) {
      try {
        const content = method()
        if (content !== undefined && content !== null) {
          return content
        }
      } catch (error) {
        logger.warn('Content extraction method failed', {
          method: method.toString(),
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return ''
  }
}