import type { AsciidoctorBlock } from '../types/asciidoc'
import { AsciiDocParserState } from './state'
import { BlockHandlerRegistry } from './handlers/registry'
import type { BlockHandler } from './handlers/registry'
import { errorHandler } from '../utils/error-handling'
import { extractBlockContent } from '../utils/content-extraction'

/**
 * Block parser for converting AsciiDoc blocks to ProseMirror nodes
 */
export class BlockParser {
  private handlers: BlockHandlerRegistry

  constructor(handlers?: BlockHandlerRegistry) {
    this.handlers = handlers || new BlockHandlerRegistry()
  }

  /**
   * Parse an array of AsciiDoc blocks
   */
  parseBlocks(blocks: AsciidoctorBlock[], state: AsciiDocParserState): void {
    for (const block of blocks) {
      this.parseBlock(block, state)
    }
  }

  /**
   * Parse a single AsciiDoc block
   */
  parseBlock(block: AsciidoctorBlock, state: AsciiDocParserState): void {
    const nodeName = block.getNodeName()

    try {
      const handler = this.handlers.getHandler(nodeName)
      handler.handle(block, state, this)
    } catch (error) {
      errorHandler.handleParserError(error as any, true)
      // Fallback: try to extract and add text content
      this.handleUnknownBlock(block, state)
    }
  }

  /**
   * Register a handler for a specific block type
   */
  registerHandler(blockType: string, handler: BlockHandler): void {
    this.handlers.register(blockType, handler)
  }

  /**
   * Set a fallback handler for unknown block types
   */
  setFallbackHandler(handler: BlockHandler): void {
    this.handlers.setFallback(handler)
  }

  /**
   * Fallback handler for unknown block types
   */
  private handleUnknownBlock(block: AsciidoctorBlock, state: AsciiDocParserState): void {
    // Try to extract some content and add it as a paragraph
    const content = this.extractBlockContent(block)
    if (content.trim()) {
      state.openNode(state.schema.nodes.paragraph)
      state.addText(content)
      state.closeNode()
    }
  }

  /**
   * Extract content from a block using various fallback methods
   */
  private extractBlockContent(block: AsciidoctorBlock): string {
    return extractBlockContent(block)
  }

  /**
   * Get all registered block types
   */
  getRegisteredTypes(): string[] {
    return this.handlers.getRegisteredTypes()
  }
}