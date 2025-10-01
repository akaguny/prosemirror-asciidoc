import {Node, Mark} from "prosemirror-model"

type MarkSerializerSpec = {
  /// The string that should appear before a piece of content marked
  /// by this mark, either directly or as a function that returns an
  /// appropriate string.
  open: string | ((state: AsciiDocSerializerState, mark: Mark, parent: Node, index: number) => string),
  /// The string that should appear after a piece of content marked by
  /// this mark.
  close: string | ((state: AsciiDocSerializerState, mark: Mark, parent: Node, index: number) => string),
  /// When `true`, this indicates that the order in which the mark's
  /// opening and closing syntax appears relative to other mixable
  /// marks can be varied. (For example, you can say `**a *b***` and
  /// `*a **b***`, but not `` `a *b*` ``.)
  mixable?: boolean,
  /// When enabled, causes the serializer to move enclosing whitespace
  /// from inside the marks to outside the marks. This is necessary
  /// for emphasis marks as CommonMark does not permit enclosing
  /// whitespace inside emphasis marks, see:
  /// http:///spec.commonmark.org/0.26/#example-330
  expelEnclosingWhitespace?: boolean,
  /// Can be set to `false` to disable character escaping in a mark. A
  /// non-escaping mark has to have the highest precedence (must
  /// always be the innermost mark).
  escape?: boolean
}

const blankMark: MarkSerializerSpec = {open: "", close: "", mixable: true}

/**
 * A specification for serializing a ProseMirror document as
 * AsciiDoc text.
 */
export class AsciiDocSerializer {
  /**
   * Construct a serializer with the given configuration. The `nodes`
   * object should map node names in a given schema to functions that
   * take a serializer state and such a node, and serialize the node.
   * @param nodes The node serializer functions for this serializer.
   * @param marks The mark serializer info.
   * @param options Configuration options for the serializer.
   * @param options.escapeExtraCharacters Extra characters can be added for escaping. This is passed directly to String.replace(), and the matching characters are preceded by a backslash.
   * @param options.hardBreakNodeName Specify the node name of hard breaks. Defaults to "hard_break".
   * @param options.strict By default, the serializer raises an error when it finds a node or mark type for which no serializer is defined. Set this to `false` to make it just ignore such elements, rendering only their content.
   */
  constructor(
    readonly nodes: {[node: string]: (state: AsciiDocSerializerState, node: Node, parent: Node, index: number) => void},
    readonly marks: {[mark: string]: MarkSerializerSpec},
    readonly options: {
      escapeExtraCharacters?: RegExp,
      hardBreakNodeName?: string,
      strict?: boolean
    } = {}
  ) {}

  /**
   * Serialize the content of the given node to AsciiDoc.
   * @param content The ProseMirror node to serialize.
   * @param options Configuration options for serialization.
   * @param options.tightLists Whether to render lists in a tight style. This can be overridden on a node level by specifying a tight attribute on the node. Defaults to false.
   * @returns The serialized AsciiDoc string.
   */
  serialize(content: Node, options: {
    tightLists?: boolean
  } = {}) {
    options = Object.assign({}, this.options, options)
    let state = new AsciiDocSerializerState(this.nodes, this.marks, options)
    state.renderContent(content)
    return state.out
  }
}

/**
 * This is an object used to track state and expose
 * methods related to AsciiDoc serialization. Instances are passed to
 * node and mark serialization methods.
 */
export class AsciiDocSerializerState {
  /// @internal
  delim: string = ""
  /// @internal
  out: string = ""
  /// @internal
  closed: Node | null = null
  /// @internal
  atBlockStart: boolean = false
  /// @internal
  inTightList: boolean = false
  /// @internal
  listNestingLevel: number = 0

  /// @internal
  constructor(
    /// @internal
    readonly nodes: {[node: string]: (state: AsciiDocSerializerState, node: Node, parent: Node, index: number) => void},
    /// @internal
    readonly marks: {[mark: string]: MarkSerializerSpec},
    /// The options passed to the serializer.
    readonly options: {tightLists?: boolean, escapeExtraCharacters?: RegExp, hardBreakNodeName?: string, strict?: boolean}
  ) {
    if (typeof this.options.tightLists == "undefined")
      this.options.tightLists = false
    if (typeof this.options.hardBreakNodeName == "undefined")
      this.options.hardBreakNodeName = "hard_break"
  }

  /// @internal
  flushClose(size: number = 2) {
    if (this.closed) {
      if (!this.atBlank()) this.out += "\n"
      if (size > 1) {
        let delimMin = this.delim
        let trim = /\s+$/.exec(delimMin)
        if (trim) delimMin = delimMin.slice(0, delimMin.length - trim[0].length)
        for (let i = 1; i < size; i++)
          this.out += delimMin + "\n"
      }
      this.closed = null
    }
  }

  /// @internal
  getMark(name: string) {
    return this.handleUnsupportedMark(name)
  }

  private handleUnsupportedMark(name: string): MarkSerializerSpec {
    let info = this.marks[name]
    if (!info) {
      if (this.options.strict !== false) {
        throw new Error(`Mark type \`${name}\` not supported by AsciiDoc renderer`)
      } else {
        console.warn(`Unsupported mark type \`${name}\`, falling back to blank mark`)
        info = blankMark
      }
    }
    return info
  }

  private handleUnsupportedNode(node: Node, parent: Node, index: number): void {
    if (this.nodes[node.type.name]) {
      this.nodes[node.type.name](this, node, parent, index)
    } else {
      if (this.options.strict !== false) {
        throw new Error("Token type `" + node.type.name + "` not supported by AsciiDoc renderer")
      } else {
        console.warn(`Unsupported node type \`${node.type.name}\`, rendering content`)
        if (!node.type.isLeaf) {
          if (node.type.inlineContent) this.renderInline(node)
          else this.renderContent(node)
          if (node.isBlock) this.closeBlock(node)
        }
      }
    }
  }

  /**
   * Render a block, prefixing each line with `delim`, and the first
   * line in `firstDelim`. `node` should be the node that is closed at
   * the end of the block, and `f` is a function that renders the
   * content of the block.
   * @param delim The delimiter to prefix each line.
   * @param firstDelim The delimiter for the first line, or null to use delim.
   * @param node The node that is closed at the end of the block.
   * @param f The function that renders the content of the block.
   */
  wrapBlock(delim: string, firstDelim: string | null, node: Node, f: () => void) {
    let old = this.delim
    this.write(firstDelim != null ? firstDelim : delim)
    this.delim += delim
    f()
    this.delim = old
    this.closeBlock(node)
  }

  /// @internal
  atBlank() {
    return /(^|\n)$/.test(this.out)
  }

  /**
   * Ensure the current content ends with a newline.
   */
  ensureNewLine() {
    if (!this.atBlank()) this.out += "\n"
  }

  /**
   * Prepare the state for writing output (closing closed paragraphs,
   * adding delimiters, and so on), and then optionally add content
   * (unescaped) to the output.
   * @param content Optional content to add to the output.
   */
  write(content?: string) {
    this.flushClose()
    if (this.delim && this.atBlank())
      this.out += this.delim
    if (content) this.out += content
  }

  /**
   * Close the block for the given node.
   * @param node The node whose block to close.
   */
  closeBlock(node: Node) {
    this.closed = node
  }

  /**
   * Add the given text to the document. When escape is not `false`,
   * it will be escaped.
   * @param text The text to add.
   * @param escape Whether to escape the text. Defaults to true.
   */
  text(text: string, escape = true) {
    let lines = text.split("\n")
    for (let i = 0; i < lines.length; i++) {
      this.write()
      this.out += escape ? this.esc(lines[i], this.atBlockStart) : lines[i]
      if (i != lines.length - 1) this.out += "\n"
    }
  }

  /**
   * Render the given node as a block.
   * @param node The node to render.
   * @param parent The parent node.
   * @param index The index of the node in the parent.
   */
  render(node: Node, parent: Node, index: number) {
    this.handleUnsupportedNode(node, parent, index)
  }

  /**
   * Render the contents of `parent` as block nodes.
   * @param parent The parent node whose contents to render.
   */
  renderContent(parent: Node) {
    parent.forEach((node, _, i) => this.render(node, parent, i))
  }

  /**
   * Render the contents of `parent` as inline content.
   * @param parent The parent node whose contents to render.
   * @param fromBlockStart Whether rendering starts at the beginning of a block.
   */
  renderInline(parent: Node, fromBlockStart = true) {
    this.atBlockStart = fromBlockStart
    let active: Mark[] = [], trailing = ""
    let progress = (node: Node | null, offset: number, index: number) => {
      let marks = node ? node.marks : []
      marks = this.filterHardBreakMarks(marks, node, index, parent)
      let {node: newNode, marks: newMarks, leading, trailing: newTrailing} = this.processWhitespaceExpulsion(node, marks, active, index, parent, trailing)
      node = newNode
      marks = newMarks
      trailing = newTrailing
      let {inner, noEsc} = this.handleMarkTransitions(marks, active, parent, index)
      if (leading) this.text(leading)
      if (node) {
        this.renderNodeContent(node, inner, noEsc, parent, index)
      }
    }
    parent.forEach(progress)
    progress(null, 0, parent.childCount)
    this.atBlockStart = false
  }

  /**
   * Render a node's content as a list. `delim` should be the extra
   * indentation added to all lines except the first in an item,
   * `firstDelim` is a function going from an item index to a
   * delimiter for the first line of the item.
   * @param node The list node to render.
   * @param delim The extra indentation for lines except the first in an item.
   * @param firstDelim A function that returns the delimiter for the first line of an item based on its index.
   */
  renderList(node: Node, delim: string, firstDelim: (index: number) => string) {
    if (this.closed && this.closed.type == node.type)
      this.flushClose(3)
    else if (this.inTightList)
      this.flushClose(1)

    let isTight = typeof node.attrs.tight != "undefined" ? node.attrs.tight : this.options.tightLists
    let prevTight = this.inTightList
    this.inTightList = isTight
    node.forEach((child, _, i) => {
      if (i && isTight) this.flushClose(1)
      this.wrapBlock(delim, firstDelim(i), node, () => this.render(child, node, i))
    })
    this.inTightList = prevTight
  }

  /// Escape inline characters that have special meaning in AsciiDoc.
  private escapeInlineCharacters(str: string): string {
    return str.replace(
      /[`*\\~\[\]_]/g,
      (m, i) => m == "_" && i > 0 && i + 1 < str.length && str[i-1].match(/\w/) && str[i+1].match(/\w/) ?  m : "\\" + m
    )
  }

  /// Escape characters that have special meaning only at the start of a line.
  private escapeLineStartCharacters(str: string): string {
    return str.replace(/^(\+[ ]|[\-*>])/, "\\$&").replace(/^(\s*)(#{1,6})(\s|$)/, '$1\\$2$3').replace(/^(\s*\d+)\.\s/, "$1\\. ")
  }

  /// Escape extra characters as specified in the options.
  private escapeExtraCharacters(str: string): string {
    if (!this.options.escapeExtraCharacters) return str
    return str.replace(this.options.escapeExtraCharacters, "\\$&")
  }

  /**
   * Escape the given string so that it can safely appear in AsciiDoc
   * content. If `startOfLine` is true, also escape characters that
   * have special meaning only at the start of the line.
   * @param str The string to escape.
   * @param startOfLine Whether to also escape characters special at line start.
   * @returns The escaped string.
   */
  esc(str: string, startOfLine = false) {
    str = this.escapeInlineCharacters(str)
    if (startOfLine) str = this.escapeLineStartCharacters(str)
    if (this.options.escapeExtraCharacters) str = this.escapeExtraCharacters(str)
    return str
  }

  /**
   * Repeat the given string `n` times.
   * @param str The string to repeat.
   * @param n The number of times to repeat.
   * @returns The repeated string.
   */
  repeat(str: string, n: number) {
    let out = ""
    for (let i = 0; i < n; i++) out += str
    return out
  }

  /**
   * Get the AsciiDoc string for a given opening or closing mark.
   * @param mark The mark.
   * @param open Whether to get the opening or closing string.
   * @param parent The parent node.
   * @param index The index.
   * @returns The mark string.
   */
  markString(mark: Mark, open: boolean, parent: Node, index: number) {
    let info = this.getMark(mark.type.name)
    let value = open ? info.open : info.close
    return typeof value == "string" ? value : value(this, mark, parent, index)
  }

  /**
   * Get leading and trailing whitespace from a string. Values of
   * leading or trailing property of the return object will be undefined
   * if there is no match.
   * @param text The text to analyze.
   * @returns An object with leading and trailing whitespace.
   */
  getEnclosingWhitespace(text: string): {leading?: string, trailing?: string} {
    return {
      leading: (text.match(/^(\s+)/) || [undefined])[0],
      trailing: (text.match(/(\s+)$/) || [undefined])[0]
    }
  }
  private filterHardBreakMarks(marks: readonly Mark[], node: Node | null, index: number, parent: Node): Mark[] {
    if (node && node.type.name === this.options.hardBreakNodeName) {
      return marks.filter(m => {
        if (index + 1 == parent.childCount) return false
        let next = parent.child(index + 1)
        return m.isInSet(next.marks) && (!next.isText || (next.text != null && /\S/.test(next.text)))
      })
    }
    return [...marks]
  }

  private processWhitespaceExpulsion(node: Node | null, marks: readonly Mark[], active: Mark[], index: number, parent: Node, initialLeading: string): {node: Node | null, marks: Mark[], leading: string, trailing: string} {
    let marksCopy = [...marks]
    let leading = initialLeading
    let trailing = ""
    if (node && node.isText && node.text && marks.some(mark => {
      let info = this.getMark(mark.type.name)
      return info && info.expelEnclosingWhitespace && !mark.isInSet(active)
    })) {
      let match = /^(\s*)(.*)$/m.exec(node.text)
      if (match) {
        let [_, lead, rest] = match
        if (lead) {
          leading += lead
          node = rest ? (node as Node & { withText: (text: string) => Node }).withText(rest) : null
          if (!node) marksCopy = active
        }
      }
    }
    if (node && node.isText && node.text && marks.some(mark => {
      let info = this.getMark(mark.type.name)
      return info && info.expelEnclosingWhitespace &&
        (index == parent.childCount - 1 || !mark.isInSet(parent.child(index + 1).marks))
    })) {
      let match = /^(.*?)(\s*)$/m.exec(node.text)
      if (match) {
        let [_, rest, trail] = match
        if (trail) {
          trailing = trail
          node = rest ? (node as Node & { withText: (text: string) => Node }).withText(rest) : null
          if (!node) marksCopy = active
        }
      }
    }
    return {node, marks: marksCopy, leading, trailing}
  }

  private reorderMixableMarks(marksCopy: Mark[], active: Mark[], len: number): Mark[] {
    // Try to reorder 'mixable' marks
    outer: for (let i = 0; i < len; i++) {
      let mark = marksCopy[i]
      if (!this.getMark(mark.type.name).mixable) break
      for (let j = 0; j < active.length; j++) {
        let other = active[j]
        if (!this.getMark(other.type.name).mixable) break
        if (mark.eq(other)) {
          if (i > j)
            marksCopy = marksCopy.slice(0, j).concat(mark).concat(marksCopy.slice(j, i)).concat(marksCopy.slice(i + 1, len))
          else if (j > i)
            marksCopy = marksCopy.slice(0, i).concat(marksCopy.slice(i + 1, j)).concat(mark).concat(marksCopy.slice(j, len))
          continue outer
        }
      }
    }
    return marksCopy
  }

  private findCommonMarkPrefix(marksCopy: Mark[], active: Mark[], len: number): number {
    // Find the prefix of the mark set that didn't change
    let keep = 0
    while (keep < Math.min(active.length, len) && marksCopy[keep].eq(active[keep])) ++keep
    return keep
  }

  private closeMarks(active: Mark[], keep: number, parent: Node, index: number): void {
    // Close the marks that need to be closed
    while (keep < active.length) {
      let mark = active.pop()
      if (mark) this.text(this.markString(mark, false, parent, index), false)
    }
  }

  private openMarks(active: Mark[], marksCopy: Mark[], len: number, parent: Node, index: number): void {
    // Open the marks that need to be opened
    while (active.length < len) {
      let add = marksCopy[active.length]
      active.push(add)
      this.text(this.markString(add, true, parent, index), false)
      this.atBlockStart = false
    }
  }

  private handleMarkTransitions(marks: readonly Mark[], active: Mark[], parent: Node, index: number): {inner: Mark | null, noEsc: boolean} {
    let marksCopy = [...marks]
    let inner = marksCopy.length ? marksCopy[marksCopy.length - 1] : null
    let noEsc = !!inner && this.getMark(inner.type.name).escape === false
    let len = marksCopy.length - (noEsc ? 1 : 0)

    marksCopy = this.reorderMixableMarks(marksCopy, active, len)
    let keep = this.findCommonMarkPrefix(marksCopy, active, len)
    this.closeMarks(active, keep, parent, index)
    this.openMarks(active, marksCopy, len, parent, index)

    return {inner, noEsc}
  }

  private renderNodeContent(node: Node, inner: Mark | null, noEsc: boolean, parent: Node, index: number) {
    // Render the node. Special case code marks, since their content
    // may not be escaped.
    if (noEsc && node.isText && inner)
      this.text(this.markString(inner, true, parent, index) + node.text +
                this.markString(inner, false, parent, index + 1), false)
    else
      this.render(node, parent, index)
    this.atBlockStart = false

    // After the first non-empty text node is rendered, the end of output
    // is no longer at block start.
    if (node?.isText && node.nodeSize > 0) {
      this.atBlockStart = false
    }
  }
}

/// Default node serializers for AsciiDoc serialization.
export const defaultNodeSerializers = {
  blockquote(state, node) {
    state.write("____\n")
    // Render content without automatic block closing newlines
    node.forEach((child, _, i) => {
      if (child.type.name === 'paragraph') {
        // For paragraphs inside blockquotes, don't add trailing newlines
        state.renderInline(child)
      } else {
        state.render(child, node, i)
      }
    })
    state.write("\n____")
    state.closeBlock(node)
  },
  code_block(state, node) {
    state.write("----\n")
    state.text(node.textContent, false)
    state.write("\n----")
    state.closeBlock(node)
  },
  heading(state, node) {
    state.write(state.repeat("=", node.attrs.level) + " ")
    state.renderInline(node, false)
    state.closeBlock(node)
  },
  horizontal_rule(state, node) {
    state.write("'''\n")
    state.closeBlock(node)
  },
  bullet_list(state, node) {
    // Ensure lists are tight (no extra blank lines) for AsciiDoc format
    let tightNode = node.attrs.tight !== false ? node : node.type.create({tight: true}, node.content, node.marks)

    let marker = state.repeat("*", state.listNestingLevel + 1) + " "
    // For AsciiDoc nested lists, don't add extra indentation - just use multiple asterisks
    state.renderList(tightNode, "", () => marker)
  },
  ordered_list(state, node) {
    // AsciiDoc uses . for all ordered list items, not numbered
    let tightNode = node.attrs.tight !== false ? node : node.type.create({tight: true}, node.content, node.marks)
    state.renderList(tightNode, "  ", () => ". ")
  },
  list_item(state, node) {
    state.listNestingLevel++
    state.renderContent(node)
    state.listNestingLevel--
  },
  paragraph(state, node) {
    state.renderInline(node)
    state.closeBlock(node)
  },

  image(state, node) {
    state.write("image:" + node.attrs.src.replace(/[\(\)]/g, "\\$&") +
                (node.attrs.alt ? "[" + node.attrs.alt.replace(/[\[\]]/g, "\\$&") + "]" : "") +
                (node.attrs.title ? ' "' + node.attrs.title.replace(/"/g, '\\"') + '"' : ""))
  },
  hard_break(state, node, parent, index) {
    for (let i = index + 1; i < parent.childCount; i++)
      if (parent.child(i).type != node.type) {
        state.write(" +\n")
        return
      }
  },
  text(state, node) {
    if (node.text != null) state.text(node.text, true)
  }
}

/// Default mark serializers for AsciiDoc serialization.
export const defaultMarkSerializers = {
  em: {open: "_", close: "_", mixable: true, expelEnclosingWhitespace: true},
  strong: {open: "*", close: "*", mixable: true, expelEnclosingWhitespace: true},
  link: {
    open(state, mark, parent, index) {
      return "link:" + mark.attrs.href + "["
    },
    close(state, mark, parent, index) {
      return "]"
    },
    mixable: true
  },
  code: {open: "`", close: "`", escape: false}
}

/// An AsciiDoc serializer for the basic schema.
export const defaultAsciiDocSerializer = new AsciiDocSerializer(defaultNodeSerializers, defaultMarkSerializers)