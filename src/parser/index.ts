import { Schema } from "prosemirror-model"
import type { AsciidoctorDocument, ParserOptions } from '../types/asciidoc'
import { AsciiDocParserState } from './state'
import { BlockParser } from './block-parser'
import { errorHandler } from '../utils/error-handling'
import { asciidocSchema } from '../schema'
import {
  ParagraphHandler,
  SectionHandler,
  UnorderedListHandler,
  OrderedListHandler,
  DescriptionListHandler,
  LiteralHandler,
  ListingHandler,
  QuoteHandler,
  SidebarHandler,
  ExampleHandler,
  PreambleHandler,
  ThematicBreakHandler,
  TableHandler
} from './handlers/blocks'

/**
 * Main parser class for converting AsciiDoc markup to ProseMirror documents.
 * Uses modular components for better maintainability and testability.
 */
export class AsciiDocParser {
  public readonly schema: Schema
  private blockParser: BlockParser

  /**
   * Creates a new AsciiDoc parser with the specified schema.
   * @param schema The ProseMirror schema defining available node and mark types
   * @param options Parser configuration options
   */
  constructor(schema: Schema, options: ParserOptions = {}) {
    this.schema = schema
    this.blockParser = new BlockParser()

    // Register default block handlers
    this.registerDefaultHandlers()

    // Register custom handlers if provided
    if (options.customHandlers) {
      Object.entries(options.customHandlers).forEach(([type, handler]) => {
        this.blockParser.registerHandler(type, handler)
      })
    }
  }

  /**
   * Parse a string as AsciiDoc markup, and create a ProseMirror document.
   * @param text The AsciiDoc markup string to parse
   * @returns A ProseMirror document node representing the parsed content
   */
  parse(text: string): any {
    try {
      const state = new AsciiDocParserState(this.schema)
      this.parseAsciidoc(text, state)
      return state.finalize()
    } catch (error) {
      errorHandler.handleParserError(error as any, false)
      // Return empty document on fatal error
      return this.schema.topNodeType.createAndFill()
    }
  }

  /**
   * Parse AsciiDoc text into ProseMirror document structure.
   * @param text The AsciiDoc markup to parse
   * @param state The parser state to use
   */
  private parseAsciidoc(text: string, state: AsciiDocParserState): void {
    // Load document using AsciiDoctor
    const asciidoctor = (global as any).Asciidoctor?.()
    if (!asciidoctor) {
      throw new Error('AsciiDoctor not available')
    }

    const document = asciidoctor.load(text, {
      doctype: 'article',
      attributes: { 'leveloffset': '1' }
    })

    // Check if document has a title
    state.hasDocumentTitle = !!document.getTitle()

    // Get all blocks
    const blocks = document.getBlocks()

    // Handle document title if present
    this.handleDocumentTitle(document, blocks, state)

    // Parse all blocks
    this.blockParser.parseBlocks(blocks, state)
  }

  /**
   * Handle document title processing
   */
  private handleDocumentTitle(document: AsciidoctorDocument, blocks: any[], state: AsciiDocParserState): void {
    if (!state.hasDocumentTitle || blocks.length === 0) {
      return
    }

    // Check if the first block is the document title section
    const firstBlock = blocks[0]
    const documentTitle = document.getTitle()

    if (firstBlock.getNodeName() === 'section' && firstBlock.getTitle() === documentTitle) {
      // Skip adding document title as it's already included as the first section
      return
    }

    // Add document title as a heading
    state.openNode(state.schema.nodes.heading, { level: 1 })
    state.addText(documentTitle || '')
    state.closeNode()
  }

  /**
   * Register default block handlers
   */
  private registerDefaultHandlers(): void {
    this.blockParser.registerHandler('paragraph', new ParagraphHandler())
    this.blockParser.registerHandler('section', new SectionHandler())
    this.blockParser.registerHandler('ulist', new UnorderedListHandler())
    this.blockParser.registerHandler('olist', new OrderedListHandler())
    this.blockParser.registerHandler('dlist', new DescriptionListHandler())
    this.blockParser.registerHandler('literal', new LiteralHandler())
    this.blockParser.registerHandler('listing', new ListingHandler())
    this.blockParser.registerHandler('quote', new QuoteHandler())
    this.blockParser.registerHandler('sidebar', new SidebarHandler())
    this.blockParser.registerHandler('example', new ExampleHandler())
    this.blockParser.registerHandler('preamble', new PreambleHandler())
    this.blockParser.registerHandler('thematic_break', new ThematicBreakHandler())
    this.blockParser.registerHandler('table', new TableHandler())
  }
}

/**
 * Default AsciiDoc parser instance using the asciidoc schema
 */
export const defaultAsciiDocParser = new AsciiDocParser(asciidocSchema)