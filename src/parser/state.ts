import { Node, Mark, MarkType, NodeType, Schema } from "prosemirror-model"
import type { Attrs } from "prosemirror-model"
import type { ParserState as IParserState } from '../types/asciidoc'
import { logger } from '../utils/error-handling'
import {
  handleEscapedCharacters,
  unescapeCharacters,
  hasUnprocessedEscapes,
  cleanUnprocessedEscapes,
  splitByFormattingPatterns,
  detectFormattingType,
  splitByLinks,
  isLinkPart,
  parseLinkPart
} from '../utils/text-processing'

/**
 * Stack entry for tracking node construction
 */
interface StackEntry {
  type: NodeType
  attrs: Attrs | null
  content: Node[]
  marks: readonly Mark[]
}

/**
 * Parser state for converting AsciiDoc content to ProseMirror document nodes.
 * Maintains the current parsing context including node stack and active marks.
 */
export class AsciiDocParserState implements IParserState {
  public readonly schema: Schema
  private stack: StackEntry[]
  private asciidoctor: any // AsciidoctorInstance
  public hasDocumentTitle = false

  /**
   * Creates a new AsciiDoc parser state.
   * @param schema The ProseMirror schema to use for creating nodes
   */
  constructor(schema: Schema) {
    this.schema = schema
    this.stack = [{ type: schema.topNodeType, attrs: null, content: [], marks: Mark.none }]
    this.asciidoctor = (global as any).Asciidoctor?.() || null
  }

  /**
   * Get the current top of the stack
   */
  top(): StackEntry {
    return this.stack[this.stack.length - 1]
  }

  /**
   * Push a node to the current content
   */
  push(elt: Node): void {
    if (this.stack.length) {
      this.top().content.push(elt)
    }
  }

  /**
   * Add text to the current position with current marks
   */
  addText(text: string): void {
    if (!text) return

    const top = this.top()
    const nodes = top.content
    const last = nodes[nodes.length - 1]
    const node = this.schema.text(text, top.marks)

    if (last && last.isText && Mark.sameSet(last.marks, node.marks)) {
      // Merge with previous text node
      nodes[nodes.length - 1] = (last as any).withText(last.text! + text)
    } else {
      nodes.push(node)
    }
  }

  /**
   * Add a mark to the current marks
   */
  openMark(mark: Mark): void {
    const top = this.top()
    top.marks = mark.addToSet(top.marks)
  }

  /**
   * Remove a mark from the current marks
   */
  closeMark(markType: MarkType): void {
    const top = this.top()
    top.marks = markType.removeFromSet(top.marks)
  }

  /**
   * Add a node at the current position
   */
  addNode(type: NodeType, attrs: Attrs | null = null, content?: readonly Node[]): Node | null {
    const top = this.top()
    const node = type.createAndFill(attrs, content, top.marks)
    if (!node) return null
    this.push(node)
    return node
  }

  /**
   * Open a new node on the stack
   */
  openNode(type: NodeType, attrs: Attrs | null = null): void {
    this.stack.push({
      type,
      attrs,
      content: [],
      marks: Mark.none
    })
  }

  /**
   * Close the current node and return it
   */
  closeNode(): Node {
    const info = this.stack.pop()!
    return this.addNode(info.type, info.attrs, info.content)!
  }

  /**
   * Centralized logging method for parser events and errors
   */
  private log(level: 'info' | 'warn' | 'error', message: string, context?: any): void {
    logger[level](message, context)
  }

  /**
   * Validate the current state
   */
  validate(): boolean {
    if (this.stack.length === 0) {
      this.log('error', 'Parser state stack is empty')
      return false
    }

    if (this.stack.length > 100) {
      this.log('warn', 'Parser state stack is very deep, possible recursion', {
        depth: this.stack.length
      })
    }

    return true
  }

  /**
   * Get current parsing context for debugging
   */
  getContext(): {
    stackDepth: number
    currentNodeType: string
    hasDocumentTitle: boolean
  } {
    return {
      stackDepth: this.stack.length,
      currentNodeType: this.top().type.name,
      hasDocumentTitle: this.hasDocumentTitle
    }
  }

  /**
   * Check if the parsing stack is empty
   */
  isStackEmpty(): boolean {
    return this.stack.length === 0
  }

  /**
   * Close all nodes on the stack and return the final document
   */
  finalize(): Node {
    let document
    do {
      document = this.closeNode()
    } while (!this.isStackEmpty())

    return document || this.schema.topNodeType.createAndFill()!
  }

  /**
   * Parse inline content, handling links and formatting
   */
  parseInline(text: string): void {
    const hasEscapes = text.includes('\\')
    const processedText = this.handleEscapedCharacters(text)

    if (hasEscapes) {
      // If original text had escapes, don't apply formatting
      const cleanedText = this.unescapeCharacters(processedText)
      this.addText(cleanedText)
    } else {
      this.parseInlineContent(processedText)
    }
  }

  /**
   * Handle escaped characters by marking them with null character
   */
  private handleEscapedCharacters(text: string): string {
    return handleEscapedCharacters(text)
  }

  /**
   * Remove escape markers from text
   */
  private unescapeCharacters(text: string): string {
    return unescapeCharacters(text)
  }

  /**
   * Parse inline content, handling links and formatting
   */
  private parseInlineContent(text: string): void {
    const parts = this.splitByLinks(text)

    for (const part of parts) {
      if (!part) continue

      if (this.isLinkPart(part)) {
        this.parseLink(part)
      } else {
        this.parseSimpleFormatting(part)
      }
    }
  }

  /**
   * Split text by links, preserving link markers
   */
  private splitByLinks(text: string): string[] {
    return splitByLinks(text)
  }

  /**
   * Check if a part is a link marker
   */
  private isLinkPart(part: string): boolean {
    return isLinkPart(part)
  }

  /**
   * Parse a link part
   */
  private parseLink(linkPart: string): void {
    const { href, linkText } = parseLinkPart(linkPart)
    this.openMark(this.schema.marks.link.create({ href }))
    this.addText(linkText)
    this.closeMark(this.schema.marks.link)
  }

  /**
   * Parse simple formatting (bold, italic, code)
   */
  parseSimpleFormatting(text: string): void {
    const processedText = this.unescapeCharacters(text)

    if (this.hasUnprocessedEscapes(processedText)) {
      this.addText(this.cleanUnprocessedEscapes(processedText))
      return
    }

    const parts = this.splitByFormattingPatterns(processedText)
    this.processFormattingParts(parts)
  }

  /**
   * Check if text contains unprocessed backslash escapes
   */
  private hasUnprocessedEscapes(text: string): boolean {
    return hasUnprocessedEscapes(text)
  }

  /**
   * Clean up backslashes that are not part of formatting
   */
  private cleanUnprocessedEscapes(text: string): string {
    return cleanUnprocessedEscapes(text)
  }

  /**
   * Split text by formatting patterns while preserving the patterns
   */
  private splitByFormattingPatterns(text: string): string[] {
    return splitByFormattingPatterns(text)
  }

  /**
   * Process each part for formatting marks
   */
  private processFormattingParts(parts: string[]): void {
    for (const part of parts) {
      if (!part) continue

      const formattingType = this.detectFormattingType(part)
      if (formattingType) {
        this.applyFormatting(part, formattingType)
      } else {
        this.addText(part)
      }
    }
  }

  /**
   * Detect the type of formatting for a part
   */
  private detectFormattingType(part: string): 'strong' | 'em' | 'code' | null {
    return detectFormattingType(part)
  }


  /**
   * Apply the appropriate formatting to a part
   */
  private applyFormatting(part: string, type: 'strong' | 'em' | 'code'): void {
    switch (type) {
      case 'strong':
        this.openMark(this.schema.marks.strong.create())
        this.parseSimpleFormatting(part.slice(1, -1)) // Recursively handle nested
        this.closeMark(this.schema.marks.strong)
        break
      case 'em':
        this.openMark(this.schema.marks.em.create())
        this.parseSimpleFormatting(part.slice(1, -1)) // Recursively handle nested
        this.closeMark(this.schema.marks.em)
        break
      case 'code':
        this.openMark(this.schema.marks.code.create())
        this.addText(part.slice(1, -1))
        this.closeMark(this.schema.marks.code)
        break
    }
  }
}