import type { AsciidoctorBlock } from '../../../types/asciidoc'
import type { BlockHandler } from '../registry'
import { AsciiDocParserState } from '../../state'
import { logger } from '../../../utils/error-handling'
import { extractBlockContent } from '../../../utils/content-extraction'

/**
 * Handler for section blocks
 */
export class SectionHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      const level = this.determineLevel(block)
      state.openNode(state.schema.nodes.heading, { level })
      state.addText(block.getTitle() || '')
      state.closeNode()

      // Parse child blocks
      const childBlocks = block.getBlocks()
      if (childBlocks) {
        blockParser.parseBlocks(childBlocks, state)
      }

      logger.info('Parsed section block', { blockType: 'section', level, title: block.getTitle() })
    } catch (error) {
      logger.error('Failed to parse section block', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  private determineLevel(block: AsciidoctorBlock): number {
    // Try to get the original heading line from block.lines
    if (block.lines && block.lines.length > 0) {
      const firstLine = block.lines[0]
      const match = firstLine.match(/^(=+)\s/)
      if (match) {
        return match[1].length
      }
    }

    // Fallback to block content
    const content = this.extractContent(block)
    if (content) {
      const match = content.match(/^(=+)\s/)
      if (match) {
        return match[1].length
      }
    }

    // Fallback to block level
    return block.getLevel() || 1
  }

  private extractContent(block: AsciidoctorBlock): string {
    return extractBlockContent(block)
  }
}