import Asciidoctor from 'asciidoctor';
import { asciidocSchema } from "./schema"
import {Mark, MarkType, Node, Schema, NodeType} from "prosemirror-model"
import type { Attrs } from "prosemirror-model"
// TypeScript interfaces for Asciidoctor objects to improve type safety
interface AsciidoctorDocument {
  getTitle(): string | undefined;
  getBlocks(): AsciidoctorBlock[];
}

interface AsciidoctorBlock {
  getNodeName(): string;
  getTitle(): string | undefined;
  getLevel(): number | undefined;
  getBlocks(): AsciidoctorBlock[] | undefined;
  getItems(): AsciidoctorListItem[] | undefined;
  getSource(): string | undefined;
  getText(): string | undefined;
  getContent(): string | undefined;
  lines: string[] | undefined;
  getStart(): number | undefined;
}

interface AsciidoctorListItem {
  getText(): string | undefined;
  getContent(): string | undefined;
  getBlocks(): AsciidoctorBlock[] | undefined;
  getTerms(): AsciidoctorTerm[] | undefined;
  getDescription(): AsciidoctorBlock | undefined;
}

interface AsciidoctorTerm {
  getText(): string | undefined;
}

interface AsciidoctorInstance {
  load(text: string, options?: any): AsciidoctorDocument;
}

function maybeMerge(a: Node, b: Node): Node | undefined {
  if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks))
    return (a as any).withText(a.text! + b.text!)
}

// Object used to track the context of a running parse.
/**
 * Parser state for converting AsciiDoc content to ProseMirror document nodes.
 * Maintains the current parsing context including node stack and active marks.
 */
class AsciiDocParseState {
  stack: {type: NodeType, attrs: Attrs | null, content: Node[], marks: readonly Mark[]}[]
  asciidoctor: AsciidoctorInstance;
  hasDocumentTitle: boolean = false;

  schema: Schema;

  /**
   * Creates a new AsciiDoc parser state.
   * @param schema The ProseMirror schema to use for creating nodes
   */
  constructor(
    schema: Schema
  ) {
    this.schema = schema;
    this.stack = [{type: schema.topNodeType, attrs: null, content: [], marks: Mark.none}]
    this.asciidoctor = Asciidoctor();
  }

  /**
   * Centralized logging method for parser events and errors.
   * @param level Log level ('info', 'warn', 'error')
   * @param message Log message
   * @param context Optional context information
   */
  private log(level: 'info' | 'warn' | 'error', message: string, context?: any) {
    const prefix = `[AsciiDoc Parser]`;
    const fullMessage = context ? `${prefix} ${message}: ${JSON.stringify(context)}` : `${prefix} ${message}`;

    switch (level) {
      case 'info':
        console.info(fullMessage);
        break;
      case 'warn':
        console.warn(fullMessage);
        break;
      case 'error':
        console.error(fullMessage);
        break;
    }
  }

  top() {
    return this.stack[this.stack.length - 1]
  }

  push(elt: Node) {
    if (this.stack.length) this.top().content.push(elt)
  }

  // Adds the given text to the current position in the document,
  // using the current marks as styling.
  addText(text: string) {
    if (!text) return
    let top = this.top(), nodes = top.content, last = nodes[nodes.length - 1]
    let node = this.schema.text(text, top.marks), merged
    if (last && (merged = maybeMerge(last, node))) nodes[nodes.length - 1] = merged
    else nodes.push(node)
  }

  // Adds the given mark to the set of active marks.
  openMark(mark: Mark) {
    let top = this.top()
    top.marks = mark.addToSet(top.marks)
  }

  // Removes the given mark from the set of active marks.
  closeMark(mark: MarkType) {
    let top = this.top()
    top.marks = mark.removeFromSet(top.marks)
  }

  /**
   * Parse AsciiDoc text into ProseMirror document structure.
   * @param text The AsciiDoc markup to parse
   */
  parseAsciidoc(text: string) {
    const document = this.asciidoctor.load(text, {doctype: 'article', attributes: { 'leveloffset': '1' }});

    // Check if document has a title
    this.hasDocumentTitle = !!document.getTitle();

    // Get all blocks
    const blocks = document.getBlocks();

    // Only add document title as heading if there are other blocks
    // For simple cases like "= Title", AsciiDoctor treats it as a section, not a document title
    if (this.hasDocumentTitle && blocks.length > 0) {
      // Check if the first block is the document title section
      const firstBlock = blocks[0];
      const documentTitle = document.getTitle();
      if (firstBlock.getNodeName() === 'section' && firstBlock.getTitle() === documentTitle) {
        // Skip adding document title as it's already included as the first section
      } else {
        this.openNode(this.schema.nodes.heading, {level: 1});
        this.addText(documentTitle || '');
        this.closeNode();
      }
    }

    // Parse all blocks as sections
    this.parseBlocks(blocks);
  }

  // Helper method to safely get block content with multiple fallbacks
  getBlockContent(block: AsciidoctorBlock): string {
    // Define content getters in order of preference
    const contentGetters = [
      { name: 'getSource', getter: () => block.getSource?.() },
      { name: 'getText', getter: () => block.getText?.() },
      { name: 'getContent', getter: () => block.getContent?.() },
      { name: 'lines', getter: () => block.lines?.join('\n') }
    ];

    // Try each getter and return the first successful result
    for (const { name, getter } of contentGetters) {
      try {
        const content = getter();
        if (content !== undefined && content !== null) {
          this.log('info', `Successfully extracted content using ${name}`, { blockType: block.getNodeName() });
          return content;
        }
      } catch (error) {
        this.log('warn', `Failed to get content using ${name}`, { blockType: block.getNodeName(), error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Return empty string if all methods fail
    this.log('warn', 'All content extraction methods failed', { blockType: block.getNodeName() });
    return '';
  }

  /**
   * Parse an array of AsciiDoc blocks into ProseMirror nodes.
   * @param blocks Array of Asciidoctor block objects to parse
   */
  parseBlocks(blocks: AsciidoctorBlock[]) {
    for (const block of blocks) {
      this.parseBlock(block);
    }
  }

  /**
   * Parse a single AsciiDoc block based on its node name.
   * @param block The Asciidoctor block to parse
   */
  parseBlock(block: AsciidoctorBlock) {
    const nodeName = block.getNodeName();
    const handler = this.getBlockHandler(nodeName);

    if (handler) {
      try {
        handler.call(this, block);
        this.log('info', `Successfully parsed block`, { blockType: nodeName });
      } catch (error) {
        this.log('error', `Failed to parse block`, { blockType: nodeName, error: error instanceof Error ? error.message : String(error) });
      }
    } else {
      this.log('warn', `Unknown block type encountered`, { blockType: nodeName });
    }
  }

  /**
   * Get the appropriate handler method for a block type
   */
  private getBlockHandler(nodeName: string): ((block: AsciidoctorBlock) => void) | null {
    const handlers: Record<string, (block: AsciidoctorBlock) => void> = {
      paragraph: this.parseParagraph,
      section: this.parseSection,
      ulist: this.parseUnorderedList,
      olist: this.parseOrderedList,
      dlist: this.parseDescriptionList,
      literal: this.parseLiteral,
      listing: this.parseListing,
      quote: this.parseQuote,
      sidebar: this.parseSidebar,
      example: this.parseExample,
      preamble: this.parsePreamble,
      thematic_break: this.parseThematicBreak,
      table: this.parseTable
    };

    return handlers[nodeName] || null;
  }

  parseParagraph(block: AsciidoctorBlock) {
    this.openNode(this.schema.nodes.paragraph);
    const content = this.getBlockContent(block);
    if (content) {
      // Use content text and parse inline formatting
      this.parseInline(content);
    } else {
      this.addText('');
    }
    this.closeNode();
  }

  parseSection(block: AsciidoctorBlock) {
    let level = 1;

    // Try to get the original heading line from block.lines
    if (block.lines && block.lines.length > 0) {
      const firstLine = block.lines[0];
      const match = firstLine.match(/^(=+)\s/);
      if (match) {
        level = match[1].length;
      }
    } else {
      // Fallback to block content
      const content = this.getBlockContent(block);
      if (content) {
        const match = content.match(/^(=+)\s/);
        if (match) {
          level = match[1].length;
        }
      } else {
        // Fallback to block level
        level = block.getLevel() || 1;
      }
    }

    // Note: AsciiDoctor handles document title level adjustment automatically

    this.openNode(this.schema.nodes.heading, {level});
    this.addText(block.getTitle() || '');
    this.closeNode();

    // Parse child blocks
    const childBlocks = block.getBlocks();
    if (childBlocks) {
      this.parseBlocks(childBlocks);
    }
  }

  parseUnorderedList(block: AsciidoctorBlock) {
    this.parseList(block, this.schema.nodes.bullet_list);
  }

  parseOrderedList(block: AsciidoctorBlock) {
    const start = block.getStart ? block.getStart() : 1;
    this.parseList(block, this.schema.nodes.ordered_list, {order: start});
  }

  /**
   * Parse a list block with the specified list node type and attributes
   */
  private parseList(block: AsciidoctorBlock, listNodeType: NodeType, attrs: Attrs | null = null) {
    this.openNode(listNodeType, attrs);
    const items = block.getItems ? block.getItems() : [];
    if (items) {
      this.parseListItems(items);
    }
    this.closeNode();
  }

  /**
   * Parse list items shared between ordered and unordered lists
   */
  private parseListItems(items: AsciidoctorListItem[]) {
    for (const item of items) {
      this.openNode(this.schema.nodes.list_item);

      // Get text content from the item
      const text = this.getListItemText(item);
      if (text.trim()) {
        this.openNode(this.schema.nodes.paragraph);
        this.parseInline(text);
        this.closeNode();
      }

      // Parse any nested blocks (for nested lists)
      const nestedBlocks = item.getBlocks();
      if (nestedBlocks) {
        this.parseBlocks(nestedBlocks);
      }

      this.closeNode();
    }
  }

  /**
   * Extract text content from a list item
   */
  private getListItemText(item: AsciidoctorListItem): string {
    if (item.getText) {
      return item.getText() || '';
    } else if (item.getContent) {
      return item.getContent() || '';
    }
    return '';
  }

  parseDescriptionList(block: AsciidoctorBlock) {
    // Handle description lists by converting to paragraphs with formatted text
    // Since the basic schema doesn't have a dedicated description list node,
    // we'll format them as readable paragraphs
    const items = block.getItems ? block.getItems() : [];
    if (items) {
      for (let item of items) {
        this.openNode(this.schema.nodes.paragraph);

        // Get the term and definition
        const terms = item.getTerms ? item.getTerms() : [];
        const term = terms && terms.length > 0 ? terms[0].getText() || '' : '';
        const description = item.getDescription ? item.getDescription() : null;
        const definition = description ? description.getContent() || '' : '';

        if (term) {
          this.openMark(this.schema.marks.strong.create());
          this.addText(term);
          this.closeMark(this.schema.marks.strong);
          this.addText(': ');
        }

        if (definition) {
          // Parse the definition content (could contain inline formatting)
          this.parseInline(definition);
        }

        this.closeNode();
      }
    }
  }

  parseLiteral(block: AsciidoctorBlock) {
    this.openNode(this.schema.nodes.code_block);
    const content = this.getBlockContent(block);
    this.addText(content);
    this.closeNode();
  }

  parseListing(block: AsciidoctorBlock) {
    // Include the title if it exists
    const title = block.getTitle ? block.getTitle() : '';
    if (title) {
      this.openNode(this.schema.nodes.paragraph);
      this.openMark(this.schema.marks.strong.create());
      this.addText(title);
      this.closeMark(this.schema.marks.strong);
      this.closeNode();
    }

    this.openNode(this.schema.nodes.code_block);
    const content = this.getBlockContent(block);
    this.addText(content);
    this.closeNode();
  }

  parseQuote(block: AsciidoctorBlock) {
    this.openNode(this.schema.nodes.blockquote);
    const blocks = block.getBlocks();
    if (blocks) {
      this.parseBlocks(blocks);
    }
    this.closeNode();
  }

  parseSidebar(block: AsciidoctorBlock) {
    // Sidebars are not directly supported, treat as blockquote
    this.openNode(this.schema.nodes.blockquote);
    const blocks = block.getBlocks();
    if (blocks) {
      this.parseBlocks(blocks);
    }
    this.closeNode();
  }

  parseExample(block: AsciidoctorBlock) {
    // Examples are not directly supported, treat as blockquote
    this.openNode(this.schema.nodes.blockquote);
    const blocks = block.getBlocks();
    if (blocks) {
      this.parseBlocks(blocks);
    }
    this.closeNode();
  }

  parsePreamble(block: AsciidoctorBlock) {
    // Preamble is introductory content, treat as regular content
    const blocks = block.getBlocks();
    if (blocks) {
      this.parseBlocks(blocks);
    }
  }

  parseThematicBreak(block: AsciidoctorBlock) {
    this.addNode(this.schema.nodes.horizontal_rule, null);
  }

  parseTable(block: AsciidoctorBlock) {
    // Tables are not directly supported in the basic schema, treat as paragraph
    // This is a simple fallback - in a real implementation you'd want proper table support
    this.openNode(this.schema.nodes.paragraph);

    // Include the title if it exists
    const title = block.getTitle ? block.getTitle() : '';
    if (title) {
      this.openMark(this.schema.marks.strong.create());
      this.addText(title);
      this.closeMark(this.schema.marks.strong);
      this.addText('\n');
    }

    const content = this.getBlockContent(block);
    if (content) {
      this.parseInline(content);
    } else {
      this.addText('[Table content not supported]');
    }
    this.closeNode();
  }

  parseInline(text: string) {
    const hasEscapes = text.includes('\\');
    const processedText = this.handleEscapedCharacters(text);

    if (hasEscapes) {
      // If original text had escapes, don't apply formatting
      const cleanedText = this.unescapeCharacters(processedText);
      this.addText(cleanedText);
    } else {
      this.parseInlineContent(processedText);
    }
  }

  /**
   * Handle escaped characters by marking them with null character
   */
  private handleEscapedCharacters(text: string): string {
    return text.replace(/\\(\*|_|`|\+|\\)/g, '\u0000$1');
  }

  /**
   * Remove escape markers from text
   */
  private unescapeCharacters(text: string): string {
    return text.replace(/\u0000(\*|_|`|\+|\\)/g, '$1');
  }

  /**
   * Parse inline content, handling links and formatting
   */
  private parseInlineContent(text: string) {
    const parts = this.splitByLinks(text);

    for (const part of parts) {
      if (!part) continue;

      if (this.isLinkPart(part)) {
        this.parseLink(part);
      } else {
        this.parseSimpleFormatting(part);
      }
    }
  }

  /**
   * Split text by links, preserving link markers
   */
  private splitByLinks(text: string): string[] {
    const linkRegex = /link:([^\[]*)\[([^\]]*)\]/g;
    const textSegments: string[] = [];
    let lastIndex = 0;

    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        textSegments.push(text.slice(lastIndex, match.index));
      }
      // Add the link as a special marker
      textSegments.push(`__LINK__${match[1]}__${match[2]}__LINK__`);
      lastIndex = linkRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      textSegments.push(text.slice(lastIndex));
    }

    return textSegments;
  }

  /**
   * Check if a part is a link marker
   */
  private isLinkPart(part: string): boolean {
    return part.startsWith('__LINK__') && part.endsWith('__LINK__');
  }

  /**
   * Parse a link part
   */
  private parseLink(linkPart: string) {
    const linkContent = linkPart.slice(8, -8);
    const [href, linkText] = linkContent.split('__');
    this.openMark(this.schema.marks.link.create({href}));
    this.addText(linkText);
    this.closeMark(this.schema.marks.link);
  }

  parseSimpleFormatting(text: string) {
    const processedText = this.unescapeCharacters(text);

    if (this.hasUnprocessedEscapes(processedText)) {
      this.addText(this.cleanUnprocessedEscapes(processedText));
      return;
    }

    const parts = this.splitByFormattingPatterns(processedText);
    this.processFormattingParts(parts);
  }

  /**
   * Check if text contains unprocessed backslash escapes
   */
  private hasUnprocessedEscapes(text: string): boolean {
    return text.includes('\\');
  }

  /**
   * Clean up backslashes that are not part of formatting
   */
  private cleanUnprocessedEscapes(text: string): string {
    return text.replace(/\\(\*|_)/g, '$1');
  }

  /**
   * Split text by formatting patterns while preserving the patterns
   */
  private splitByFormattingPatterns(text: string): string[] {
    return text.split(/(\*.*?\*|_.*?_|`.*?`|\+.*?\+)/g);
  }

  /**
   * Process each part for formatting marks
   */
  private processFormattingParts(parts: string[]) {
    for (const part of parts) {
      if (!part) continue;

      const formattingType = this.detectFormattingType(part);
      if (formattingType) {
        this.applyFormatting(part, formattingType);
      } else {
        this.addText(part);
      }
    }
  }

  /**
   * Detect the type of formatting for a part
   */
  private detectFormattingType(part: string): 'strong' | 'em' | 'code' | null {
    if (this.isValidStrongFormatting(part)) return 'strong';
    if (this.isValidEmFormatting(part)) return 'em';
    if (this.isValidCodeFormatting(part, '`')) return 'code';
    if (this.isValidCodeFormatting(part, '+')) return 'code';
    return null;
  }

  /**
   * Check if part is valid strong formatting
   */
  private isValidStrongFormatting(part: string): boolean {
    if (!part.startsWith('*') || !part.endsWith('*') || part.length <= 2) return false;
    const inner = part.slice(1, -1);
    return !/\w/.test(inner) || inner.length > 1;
  }

  /**
   * Check if part is valid emphasis formatting
   */
  private isValidEmFormatting(part: string): boolean {
    if (!part.startsWith('_') || !part.endsWith('_') || part.length <= 2) return false;
    const inner = part.slice(1, -1);
    return !/\w/.test(inner) || inner.length > 1;
  }

  /**
   * Check if part is valid code formatting with given delimiter
   */
  private isValidCodeFormatting(part: string, delimiter: string): boolean {
    return part.startsWith(delimiter) && part.endsWith(delimiter) && part.length > 2;
  }

  /**
   * Apply the appropriate formatting to a part
   */
  private applyFormatting(part: string, type: 'strong' | 'em' | 'code') {
    switch (type) {
      case 'strong':
        this.openMark(this.schema.marks.strong.create());
        this.parseSimpleFormatting(part.slice(1, -1)); // Recursively handle nested
        this.closeMark(this.schema.marks.strong);
        break;
      case 'em':
        this.openMark(this.schema.marks.em.create());
        this.parseSimpleFormatting(part.slice(1, -1)); // Recursively handle nested
        this.closeMark(this.schema.marks.em);
        break;
      case 'code':
        this.openMark(this.schema.marks.code.create());
        this.addText(part.slice(1, -1));
        this.closeMark(this.schema.marks.code);
        break;
    }
  }


  // Add a node at the current position.
  addNode(type: NodeType, attrs: Attrs | null, content?: readonly Node[]) {
    let top = this.top()
    let node = type.createAndFill(attrs, content, top ? top.marks : [])
    if (!node) return null
    this.push(node)
    return node
  }

  // Wrap subsequent content in a node of the given type.
  openNode(type: NodeType, attrs: Attrs | null = null) {
    this.stack.push({type: type, attrs: attrs, content: [], marks: Mark.none})
  }

  // Close and return the node that is currently on top of the stack.
  closeNode() {
    let info = this.stack.pop()!
    return this.addNode(info.type, info.attrs, info.content)
  }
}

/// A parser parsing AsciiDoc text and producing a document in the basic schema.
/**
 * Main parser class for converting AsciiDoc markup to ProseMirror documents.
 * Uses the AsciiDocParseState to maintain parsing context and build the document tree.
 */
export class AsciiDocParser {
  readonly schema: Schema;

  /**
   * Creates a new AsciiDoc parser with the specified schema.
   * @param schema The ProseMirror schema defining available node and mark types
   */
  constructor(schema: Schema) {
    this.schema = schema;
  }

  /**
   * Parse a string as AsciiDoc markup, and create a ProseMirror document.
   * @param text The AsciiDoc markup string to parse
   * @returns A ProseMirror document node representing the parsed content
   */
  parse(text: string) {
    const state = new AsciiDocParseState(this.schema)
    state.parseAsciidoc(text)
    let document
    do { document = state.closeNode() } while (state.stack.length)
    return document || this.schema.topNodeType.createAndFill()!
  }
}

/// A parser parsing unextended AsciiDoc, producing a document in the basic schema.
export const defaultAsciiDocParser = new AsciiDocParser(asciidocSchema)