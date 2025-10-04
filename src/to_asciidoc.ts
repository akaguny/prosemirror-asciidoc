import {Node, Mark} from "prosemirror-model"
import { AsciiDocSerializerState } from './serializer/state'
import { NodeSerializerRegistry, MarkSerializerRegistry } from './serializer/registry'
import type { MarkSerializer, SerializerOptions } from './types/asciidoc'
import {
  ParagraphSerializer,
  HeadingSerializer,
  BulletListSerializer,
  OrderedListSerializer,
  ListItemSerializer,
  BlockquoteSerializer,
  CodeBlockSerializer,
  HorizontalRuleSerializer,
  ImageSerializer,
  HardBreakSerializer,
  TextSerializer
} from './serializer/handlers/blocks'

const blankMark: MarkSerializer = {open: "", close: "", mixable: true}

/**
 * A specification for serializing a ProseMirror document as
 * AsciiDoc text.
 */
export class AsciiDocSerializer {
  private nodeRegistry: NodeSerializerRegistry
  private markRegistry: MarkSerializerRegistry

  /**
   * Construct a serializer with the given configuration.
   * @param nodes The node serializer functions for this serializer.
   * @param marks The mark serializer info.
   * @param options Configuration options for the serializer.
   */
  constructor(
    nodes?: {[node: string]: (state: AsciiDocSerializerState, node: Node, parent: Node, index: number) => void},
    marks?: {[mark: string]: MarkSerializer},
    readonly options: SerializerOptions = {}
  ) {
    this.nodeRegistry = new NodeSerializerRegistry()
    this.markRegistry = new MarkSerializerRegistry()

    // Register default handlers
    this.registerDefaultNodeHandlers()
    this.registerDefaultMarkHandlers()

    // Override with provided handlers
    if (nodes) {
      Object.entries(nodes).forEach(([type, handler]) => {
        this.nodeRegistry.register(type, {
          serialize: (state, node, parent, index) => handler(state, node, parent, index)
        })
      })
    }

    if (marks) {
      Object.entries(marks).forEach(([type, spec]) => {
        this.markRegistry.register(type, spec)
      })
    }
  }

  private registerDefaultNodeHandlers(): void {
    this.nodeRegistry.register('paragraph', new ParagraphSerializer())
    this.nodeRegistry.register('heading', new HeadingSerializer())
    this.nodeRegistry.register('bullet_list', new BulletListSerializer())
    this.nodeRegistry.register('ordered_list', new OrderedListSerializer())
    this.nodeRegistry.register('list_item', new ListItemSerializer())
    this.nodeRegistry.register('blockquote', new BlockquoteSerializer())
    this.nodeRegistry.register('code_block', new CodeBlockSerializer())
    this.nodeRegistry.register('horizontal_rule', new HorizontalRuleSerializer())
    this.nodeRegistry.register('image', new ImageSerializer())
    this.nodeRegistry.register('hard_break', new HardBreakSerializer())
    this.nodeRegistry.register('text', new TextSerializer())
  }

  private registerDefaultMarkHandlers(): void {
    this.markRegistry.register('em', {open: "_", close: "_", mixable: true, expelEnclosingWhitespace: true})
    this.markRegistry.register('strong', {open: "*", close: "*", mixable: true, expelEnclosingWhitespace: true})
    this.markRegistry.register('link', {
      open(state, mark, parent, index) {
        return "link:" + mark.attrs.href + "["
      },
      close(state, mark, parent, index) {
        return "]"
      },
      mixable: true
    })
    this.markRegistry.register('code', {open: "`", close: "`", escape: false})
  }

  /**
   * Serialize the content of the given node to AsciiDoc.
   * @param content The ProseMirror node to serialize.
   * @param options Configuration options for serialization.
   * @returns The serialized AsciiDoc string.
   */
  serialize(content: Node, options: {tightLists?: boolean} = {}) {
    const mergedOptions = {...this.options, ...options}
    const state = new AsciiDocSerializerState(this.nodeRegistry, this.markRegistry, mergedOptions)
    state.renderContent(content)
    return state.out
  }

  /**
   * Get the node serializers (for backward compatibility)
   */
  get nodes() {
    const nodes: {[node: string]: (state: AsciiDocSerializerState, node: Node, parent: Node, index: number) => void} = {}
    for (const type of this.nodeRegistry.getRegisteredTypes()) {
      const handler = this.nodeRegistry.getHandler(type)
      nodes[type] = (state, node, parent, index) => handler.serialize(state, node, parent, index)
    }
    return nodes
  }

  /**
   * Get the mark serializers (for backward compatibility)
   */
  get marks() {
    const marks: {[mark: string]: MarkSerializer} = {}
    for (const type of this.markRegistry.getRegisteredTypes()) {
      const handler = this.markRegistry.getHandler(type)
      marks[type] = handler
    }
    return marks
  }
}

/// An AsciiDoc serializer for the basic schema.
export const defaultAsciiDocSerializer = new AsciiDocSerializer()

// Re-export AsciiDocSerializerState for external use
export { AsciiDocSerializerState } from './serializer/state'