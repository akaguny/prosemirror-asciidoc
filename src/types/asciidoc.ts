import type { NodeType, MarkType, Schema } from "prosemirror-model"

/**
 * TypeScript interfaces for Asciidoctor objects to improve type safety
 */
export interface AsciidoctorDocument {
  getTitle(): string | undefined
  getBlocks(): AsciidoctorBlock[]
}

export interface AsciidoctorBlock {
  getNodeName(): string
  getTitle(): string | undefined
  getLevel(): number | undefined
  getBlocks(): AsciidoctorBlock[] | undefined
  getItems(): AsciidoctorListItem[] | undefined
  getSource(): string | undefined
  getText(): string | undefined
  getContent(): string | undefined
  lines: string[] | undefined
  getStart(): number | undefined
}

export interface AsciidoctorListItem {
  getText(): string | undefined
  getContent(): string | undefined
  getBlocks(): AsciidoctorBlock[] | undefined
  getTerms(): AsciidoctorTerm[] | undefined
  getDescription(): AsciidoctorBlock | undefined
}

export interface AsciidoctorTerm {
  getText(): string | undefined
}

export interface AsciidoctorInstance {
  load(text: string, options?: any): AsciidoctorDocument
}

/**
 * Parser configuration options
 */
export interface ParserOptions {
  /** Whether to enable strict mode that throws on unknown block types */
  strict?: boolean
  /** Additional attributes to pass to AsciiDoc processor */
  attributes?: Record<string, any>
  /** Custom block handlers to register */
  customHandlers?: Record<string, BlockHandler>
}

/**
 * Serializer configuration options
 */
export interface SerializerOptions {
  /** Whether to enable strict mode that throws on unknown node/mark types */
  strict?: boolean
  /** Extra characters to escape */
  escapeExtraCharacters?: RegExp
  /** Node name for hard breaks */
  hardBreakNodeName?: string
  /** Whether to render lists in tight style */
  tightLists?: boolean
}

/**
 * Error context information
 */
export interface ErrorContext {
  blockType?: string
  nodeType?: string
  markType?: string
  position?: number
  content?: string
}

/**
 * Error codes for different types of parsing/serialization errors
 */
export const ErrorCode = {
  UNKNOWN_BLOCK_TYPE: 'UNKNOWN_BLOCK_TYPE',
  UNKNOWN_NODE_TYPE: 'UNKNOWN_NODE_TYPE',
  UNKNOWN_MARK_TYPE: 'UNKNOWN_MARK_TYPE',
  INVALID_CONTENT: 'INVALID_CONTENT',
  PARSING_FAILED: 'PARSING_FAILED',
  SERIALIZATION_FAILED: 'SERIALIZATION_FAILED',
  STATE_ERROR: 'STATE_ERROR'
} as const

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode]

/**
 * Handler interface for block processing
 */
export interface BlockHandler {
  handle(block: AsciidoctorBlock, state: ParserState): void
}

/**
 * Handler interface for node serialization
 */
export interface NodeSerializer {
  serialize(state: SerializerState, node: any, parent: any, index: number): void
}

/**
 * Handler interface for mark serialization
 */
export interface MarkSerializer {
  open: string | ((state: SerializerState, mark: any, parent: any, index: number) => string)
  close: string | ((state: SerializerState, mark: any, parent: any, index: number) => string)
  mixable?: boolean
  expelEnclosingWhitespace?: boolean
  escape?: boolean
}

/**
 * Forward declarations for circular dependencies
 */
export interface ParserState {
  schema: Schema
  push(node: any): void
  openNode(type: NodeType, attrs?: any): void
  closeNode(): any
  addText(text: string): void
  openMark(mark: any): void
  closeMark(markType: MarkType): void
  addNode(type: NodeType, attrs?: any, content?: any): any
}

export interface SerializerState {
  write(content?: string): void
  text(text: string, escape?: boolean): void
  closeBlock(node: any): void
  render(node: any, parent: any, index: number): void
  renderContent(parent: any): void
  renderInline(parent: any, fromBlockStart?: boolean): void
  wrapBlock(delim: string, firstDelim: string | null, node: any, f: () => void): void
  ensureNewLine(): void
  esc(str: string, startOfLine?: boolean): string
}