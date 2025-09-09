import Asciidoctor from 'asciidoctor';
import {schema} from "./schema"
import {Mark, MarkType, Node, Attrs, Schema, NodeType} from "prosemirror-model"

function maybeMerge(a: Node, b: Node): Node | undefined {
  if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks))
    return (a as any).withText(a.text! + b.text!)
}

// Object used to track the context of a running parse.
class AsciiDocParseState {
  stack: {type: NodeType, attrs: Attrs | null, content: Node[], marks: readonly Mark[]}[]
  asciidoctor: any;
  hasDocumentTitle: boolean = false;

  constructor(
    readonly schema: Schema
  ) {
    this.stack = [{type: schema.topNodeType, attrs: null, content: [], marks: Mark.none}]
    this.asciidoctor = Asciidoctor();
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

  parseAsciidoc(text: string) {
    let doc = this.asciidoctor.load(text, {doctype: 'article', attributes: { 'leveloffset': '1' }});

    // Check if document has a title
    this.hasDocumentTitle = !!doc.getTitle();

    // If there's a document title, parse it as a level 1 heading
    if (this.hasDocumentTitle) {
      this.openNode(this.schema.nodes.heading, {level: 1});
      this.addText(doc.getTitle());
      this.closeNode();
    }

    // Parse all blocks as sections
    this.parseBlocks(doc.getBlocks());
  }

  parseBlocks(blocks: any[]) {
    for (let block of blocks) {
      this.parseBlock(block);
    }
  }

  parseBlock(block: any) {
    const nodeName = block.getNodeName();

    switch (nodeName) {
      case 'paragraph':
        this.parseParagraph(block);
        break;
      case 'section':
        this.parseSection(block);
        break;
      case 'ulist':
        this.parseUnorderedList(block);
        break;
      case 'olist':
        this.parseOrderedList(block);
        break;
      case 'dlist':
        this.parseDescriptionList(block);
        break;
      case 'literal':
        this.parseLiteral(block);
        break;
      case 'listing':
        this.parseListing(block);
        break;
      case 'quote':
        this.parseQuote(block);
        break;
      case 'sidebar':
        this.parseSidebar(block);
        break;
      case 'example':
        this.parseExample(block);
        break;
      case 'preamble':
        this.parsePreamble(block);
        break;
      case 'thematic_break':
        this.parseThematicBreak(block);
        break;
      default:
        console.warn('Unknown block type:', nodeName);
    }
  }

  parseParagraph(block: any) {
    this.openNode(this.schema.nodes.paragraph);
    const source = block.getSource();
    if (source) {
      // Use source text and parse inline formatting
      this.parseInline(source);
    } else {
      const content = block.getContent();
      if (typeof content === 'string') {
        // Fallback to HTML parsing if source not available
        this.parseHtml(content);
      } else {
        this.addText('');
      }
    }
    this.closeNode();
  }

  parseSection(block: any) {
    let level = 1;

    // Try to get the original heading line from block.lines
    if (block.lines && block.lines.length > 0) {
      const firstLine = block.lines[0];
      const match = firstLine.match(/^(=+)\s/);
      if (match) {
        level = match[1].length;
      }
    } else {
      // Fallback to source
      const source = block.getSource();
      if (source) {
        const match = source.match(/^(=+)\s/);
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
    this.addText(block.getTitle());
    this.closeNode();

    // Parse child blocks
    if (block.getBlocks) {
      this.parseBlocks(block.getBlocks());
    }
  }

  parseUnorderedList(block: any) {
    this.openNode(this.schema.nodes.bullet_list);
    const items = block.getItems ? block.getItems() : [];
    for (let item of items) {
      this.openNode(this.schema.nodes.list_item);
      const text = item.getContent ? item.getContent() : '';
      if (text.trim()) {
        this.openNode(this.schema.nodes.paragraph);
        this.parseInline(text);
        this.closeNode();
      }
      if (item.getBlocks) {
        this.parseBlocks(item.getBlocks());
      }
      this.closeNode();
    }
    this.closeNode();
  }

  parseOrderedList(block: any) {
    const start = (block.getStart && typeof block.getStart === 'function') ? block.getStart() : 1;
    this.openNode(this.schema.nodes.ordered_list, {order: start});
    const items = block.getItems ? block.getItems() : [];
    for (let item of items) {
      this.openNode(this.schema.nodes.list_item);
      const text = item.getText ? item.getText() : '';
      if (text.trim()) {
        this.openNode(this.schema.nodes.paragraph);
        this.parseInline(text);
        this.closeNode();
      }
      if (item.getBlocks) {
        this.parseBlocks(item.getBlocks());
      }
      this.closeNode();
    }
    this.closeNode();
  }

  parseDescriptionList(block: any) {
    // Handle description lists by converting to paragraphs with formatted text
    // Since the basic schema doesn't have a dedicated description list node,
    // we'll format them as readable paragraphs
    const items = block.getItems ? block.getItems() : [];
    for (let item of items) {
      this.openNode(this.schema.nodes.paragraph);

      // Get the term and definition
      const term = item.getTerms ? item.getTerms()[0]?.getText?.() : '';
      const definition = item.getDescription ? item.getDescription()?.getContent?.() : '';

      if (term) {
        this.openMark(this.schema.marks.strong.create());
        this.addText(term);
        this.closeMark(this.schema.marks.strong);
        this.addText(': ');
      }

      if (definition) {
        // Parse the definition content (could contain inline formatting)
        if (typeof definition === 'string') {
          this.parseInline(definition);
        } else {
          this.addText(definition || '');
        }
      }

      this.closeNode();
    }
  }

  parseLiteral(block: any) {
    this.openNode(this.schema.nodes.code_block);
    this.addText(block.getSource());
    this.closeNode();
  }

  parseListing(block: any) {
    this.openNode(this.schema.nodes.code_block);
    this.addText(block.getSource());
    this.closeNode();
  }

  parseQuote(block: any) {
    this.openNode(this.schema.nodes.blockquote);
    this.parseBlocks(block.getBlocks());
    this.closeNode();
  }

  parseSidebar(block: any) {
    // Sidebars are not directly supported, treat as blockquote
    this.openNode(this.schema.nodes.blockquote);
    this.parseBlocks(block.getBlocks());
    this.closeNode();
  }

  parseExample(block: any) {
    // Examples are not directly supported, treat as blockquote
    this.openNode(this.schema.nodes.blockquote);
    this.parseBlocks(block.getBlocks());
    this.closeNode();
  }

  parsePreamble(block: any) {
    // Preamble is introductory content, treat as regular content
    this.parseBlocks(block.getBlocks());
  }

  parseThematicBreak(block: any) {
    this.addNode(this.schema.nodes.horizontal_rule, null);
  }

  parseInline(text: string) {
    // Improved inline parsing for AsciiDoc
    // Handle links first, then other formatting to avoid conflicts
    let remaining = text;

    // Handle links: link:URL[Text]
    const linkRegex = /link:([^\[]*)\[([^\]]*)\]/g;
    let lastIndex = 0;
    const parts: string[] = [];

    let match;
    while ((match = linkRegex.exec(remaining)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(remaining.slice(lastIndex, match.index));
      }
      // Add the link as a special marker
      parts.push(`__LINK__${match[1]}__${match[2]}__LINK__`);
      lastIndex = linkRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      parts.push(remaining.slice(lastIndex));
    }

    // Process each part
    for (let part of parts) {
      if (!part) continue;

      if (part.startsWith('__LINK__') && part.endsWith('__LINK__')) {
        // Handle link
        const linkContent = part.slice(8, -8);
        const [href, linkText] = linkContent.split('__');
        this.openMark(this.schema.marks.link.create({href}));
        this.addText(linkText);
        this.closeMark(this.schema.marks.link);
      } else {
        // Handle other formatting: *strong*, _italic_, `code`, +code+
        this.parseSimpleFormatting(part);
      }
    }
  }

  parseSimpleFormatting(text: string) {
    // Handle nested and overlapping formatting more carefully
    let parts = text.split(/(\*.*?\*|_.*?_|`.*?`|\+.*?\+)/g);

    for (let part of parts) {
      if (!part) continue;

      // Check for formatting marks, but be more careful about word boundaries
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        const inner = part.slice(1, -1);
        // Avoid treating * in the middle of words as formatting
        if (!/\w/.test(inner) || inner.length > 1) {
          this.openMark(this.schema.marks.strong.create());
          this.parseSimpleFormatting(inner); // Recursively handle nested formatting
          this.closeMark(this.schema.marks.strong);
        } else {
          this.addText(part);
        }
      } else if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
        const inner = part.slice(1, -1);
        if (!/\w/.test(inner) || inner.length > 1) {
          this.openMark(this.schema.marks.em.create());
          this.parseSimpleFormatting(inner);
          this.closeMark(this.schema.marks.em);
        } else {
          this.addText(part);
        }
      } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        this.openMark(this.schema.marks.code.create());
        this.addText(part.slice(1, -1));
        this.closeMark(this.schema.marks.code);
      } else if (part.startsWith('+') && part.endsWith('+') && part.length > 2) {
        this.openMark(this.schema.marks.code.create());
        this.addText(part.slice(1, -1));
        this.closeMark(this.schema.marks.code);
      } else {
        this.addText(part);
      }
    }
  }

  parseHtml(html: string) {
    // Improved HTML parser for asciidoctor output
    // Handles nested tags and more formatting options
    let parts = html.split(/(<[^>]+>[^<]*<\/[^>]+>|<[^>]+\/>)/g);

    for (let part of parts) {
      if (!part) continue;

      if (part.startsWith('<strong>') && part.endsWith('</strong>')) {
        this.openMark(this.schema.marks.strong.create());
        this.parseHtml(part.slice(8, -9)); // Recursively parse nested content
        this.closeMark(this.schema.marks.strong);
      } else if (part.startsWith('<em>') && part.endsWith('</em>')) {
        this.openMark(this.schema.marks.em.create());
        this.parseHtml(part.slice(4, -5));
        this.closeMark(this.schema.marks.em);
      } else if (part.startsWith('<code>') && part.endsWith('</code>')) {
        this.openMark(this.schema.marks.code.create());
        this.addText(part.slice(6, -7));
        this.closeMark(this.schema.marks.code);
      } else if (part.startsWith('<b>') && part.endsWith('</b>')) {
        this.openMark(this.schema.marks.strong.create());
        this.parseHtml(part.slice(3, -4));
        this.closeMark(this.schema.marks.strong);
      } else if (part.startsWith('<i>') && part.endsWith('</i>')) {
        this.openMark(this.schema.marks.em.create());
        this.parseHtml(part.slice(3, -4));
        this.closeMark(this.schema.marks.em);
      } else if (part.startsWith('<a href=') && part.includes('</a>')) {
        // Handle links: <a href="url">text</a>
        const hrefMatch = part.match(/href="([^"]*)"/);
        const linkEnd = part.indexOf('>') + 1;
        const linkText = part.slice(linkEnd, part.indexOf('</a>'));
        if (hrefMatch) {
          this.openMark(this.schema.marks.link.create({href: hrefMatch[1]}));
          this.parseHtml(linkText);
          this.closeMark(this.schema.marks.link);
        } else {
          this.parseHtml(linkText);
        }
      } else if (part.includes('<') && part.includes('>')) {
        // Skip other HTML tags but try to extract text content
        const tagEnd = part.indexOf('>') + 1;
        if (tagEnd < part.length && part.includes('</')) {
          const contentEnd = part.lastIndexOf('<');
          if (contentEnd > tagEnd) {
            const content = part.slice(tagEnd, contentEnd);
            this.parseHtml(content);
          }
        }
        // Skip self-closing tags and malformed tags
      } else {
        this.addText(part);
      }
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
export class AsciiDocParser {
  constructor(readonly schema: Schema) {}

  /// Parse a string as AsciiDoc markup, and create a ProseMirror document.
  parse(text: string) {
    let state = new AsciiDocParseState(this.schema)
    state.parseAsciidoc(text)
    let doc
    do { doc = state.closeNode() } while (state.stack.length)
    return doc || this.schema.topNodeType.createAndFill()!
  }
}

/// A parser parsing unextended AsciiDoc, producing a document in the basic schema.
export const defaultAsciiDocParser = new AsciiDocParser(schema)