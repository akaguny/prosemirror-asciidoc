import type { AsciidoctorBlock } from '../../../types/asciidoc'
import type { BlockHandler } from '../registry'
import { AsciiDocParserState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Handler for quote blocks
 */
export class QuoteHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      state.openNode(state.schema.nodes.blockquote)
      const blocks = block.getBlocks()
      if (blocks) {
        blockParser.parseBlocks(blocks, state)
      }
      state.closeNode()

      logger.info('Parsed quote block', { blockType: 'quote' })
    } catch (error) {
      logger.error('Failed to parse quote block', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }
}

/**
 * Handler for sidebar blocks
 */
export class SidebarHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      // Sidebars are not directly supported, treat as blockquote
      state.openNode(state.schema.nodes.blockquote)
      const blocks = block.getBlocks()
      if (blocks) {
        blockParser.parseBlocks(blocks, state)
      }
      state.closeNode()

      logger.info('Parsed sidebar block as blockquote', { blockType: 'sidebar' })
    } catch (error) {
      logger.error('Failed to parse sidebar block', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }
}

/**
 * Handler for example blocks
 */
export class ExampleHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      // Examples are not directly supported, treat as blockquote
      state.openNode(state.schema.nodes.blockquote)
      const blocks = block.getBlocks()
      if (blocks) {
        blockParser.parseBlocks(blocks, state)
      }
      state.closeNode()

      logger.info('Parsed example block as blockquote', { blockType: 'example' })
    } catch (error) {
      logger.error('Failed to parse example block', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }
}

/**
 * Handler for preamble blocks
 */
export class PreambleHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      // Preamble is introductory content, treat as regular content
      const blocks = block.getBlocks()
      if (blocks) {
        blockParser.parseBlocks(blocks, state)
      }

      logger.info('Parsed preamble block', { blockType: 'preamble' })
    } catch (error) {
      logger.error('Failed to parse preamble block', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }
}

/**
 * Handler for thematic break blocks
 */
export class ThematicBreakHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      state.addNode(state.schema.nodes.horizontal_rule, null)

      logger.info('Parsed thematic break', { blockType: 'thematic_break' })
    } catch (error) {
      logger.error('Failed to parse thematic break', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }
}

/**
 * Handler for table blocks
 */
export class TableHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      // Tables are not directly supported in the basic schema, treat as paragraph
      // This is a simple fallback - in a real implementation you'd want proper table support
      state.openNode(state.schema.nodes.paragraph)

      // Include the title if it exists
      const title = block.getTitle ? block.getTitle() : ''
      if (title) {
        state.openMark(state.schema.marks.strong.create())
        state.addText(title)
        state.closeMark(state.schema.marks.strong)
        state.addText('\n')
      }

      const content = this.extractContent(block)
      if (content) {
        state.parseInline(content)
      } else {
        state.addText('[Table content not supported]')
      }
      state.closeNode()

      logger.info('Parsed table block as paragraph', { blockType: 'table', hasTitle: !!title })
    } catch (error) {
      logger.error('Failed to parse table block', { error: error instanceof Error ? error.message : String(error) })
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