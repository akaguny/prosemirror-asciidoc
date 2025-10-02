import type { AsciidoctorBlock, AsciidoctorListItem } from '../../../types/asciidoc'
import type { BlockHandler } from '../registry'
import { AsciiDocParserState } from '../../state'
import { logger } from '../../../utils/error-handling'
import { extractListItemText } from '../../../utils/content-extraction'
import { getOrderedListStart } from '../../../utils/list-helpers'

/**
 * Base handler for list blocks
 */
export abstract class BaseListHandler implements BlockHandler {
  protected abstract getListNodeType(): string

  protected abstract getListAttributes(block: AsciidoctorBlock): any

  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      const listNodeType = state.schema.nodes[this.getListNodeType()]
      const attrs = this.getListAttributes(block)

      state.openNode(listNodeType, attrs)
      const items = block.getItems ? block.getItems() : []
      if (items) {
        this.parseListItems(items, state, blockParser)
      }
      state.closeNode()

      logger.info(`Parsed ${this.getListNodeType()} list`, { itemCount: items?.length || 0 })
    } catch (error) {
      logger.error(`Failed to parse ${this.getListNodeType()} list`, { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  private parseListItems(items: AsciidoctorListItem[], state: AsciiDocParserState, blockParser: any): void {
    for (const item of items) {
      state.openNode(state.schema.nodes.list_item)

      // Get text content from the item
      const text = this.getListItemText(item)
      if (text.trim()) {
        state.openNode(state.schema.nodes.paragraph)
        state.parseInline(text)
        state.closeNode()
      }

      // Parse any nested blocks (for nested lists)
      const nestedBlocks = item.getBlocks()
      if (nestedBlocks) {
        blockParser.parseBlocks(nestedBlocks, state)
      }

      state.closeNode()
    }
  }

  private getListItemText(item: AsciidoctorListItem): string {
    return extractListItemText(item)
  }
}

/**
 * Handler for unordered list blocks
 */
export class UnorderedListHandler extends BaseListHandler {
  protected getListNodeType(): string {
    return 'bullet_list'
  }

  protected getListAttributes(block: AsciidoctorBlock): any {
    return null
  }
}

/**
 * Handler for ordered list blocks
 */
export class OrderedListHandler extends BaseListHandler {
  protected getListNodeType(): string {
    return 'ordered_list'
  }

  protected getListAttributes(block: AsciidoctorBlock): any {
    const start = getOrderedListStart(block)
    return { order: start }
  }
}

/**
 * Handler for description list blocks
 */
export class DescriptionListHandler implements BlockHandler {
  handle(block: AsciidoctorBlock, state: AsciiDocParserState, blockParser: any): void {
    try {
      // Handle description lists by converting to paragraphs with formatted text
      // Since the basic schema doesn't have a dedicated description list node,
      // we'll format them as readable paragraphs
      const items = block.getItems ? block.getItems() : []
      if (items) {
        for (const item of items) {
          state.openNode(state.schema.nodes.paragraph)

          // Get the term and definition
          const terms = item.getTerms ? item.getTerms() : []
          const term = terms && terms.length > 0 ? terms[0].getText() || '' : ''
          const description = item.getDescription ? item.getDescription() : null
          const definition = description ? description.getContent() || '' : ''

          if (term) {
            state.openMark(state.schema.marks.strong.create())
            state.addText(term)
            state.closeMark(state.schema.marks.strong)
            state.addText(': ')
          }

          if (definition) {
            // Parse the definition content (could contain inline formatting)
            state.parseInline(definition)
          }

          state.closeNode()
        }
      }

      logger.info('Parsed description list', { itemCount: items?.length || 0 })
    } catch (error) {
      logger.error('Failed to parse description list', { error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }
}