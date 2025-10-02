import type { Node } from 'prosemirror-model'
import type { NodeSerializer } from '../../../types/asciidoc'
import type { AsciiDocSerializerState } from '../../state'
import { logger } from '../../../utils/error-handling'

/**
 * Serializer for bullet list nodes
 */
export class BulletListSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      // Ensure lists are tight (no extra blank lines) for AsciiDoc format
      let tightNode = node.attrs.tight !== false ? node : node.type.create({tight: true}, node.content, node.marks)

      let marker = state.repeat("*", state.listNestingLevel + 1) + " "
      // For AsciiDoc nested lists, don't add extra indentation - just use multiple asterisks
      state.renderList(tightNode, "", () => marker)
      logger.info('Serialized bullet list node', { nodeType: 'bullet_list' })
    } catch (error) {
      logger.error('Failed to serialize bullet list node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

/**
 * Serializer for ordered list nodes
 */
export class OrderedListSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      // AsciiDoc uses . for all ordered list items, not numbered
      let tightNode = node.attrs.tight !== false ? node : node.type.create({tight: true}, node.content, node.marks)
      state.renderList(tightNode, "  ", () => ". ")
      logger.info('Serialized ordered list node', { nodeType: 'ordered_list' })
    } catch (error) {
      logger.error('Failed to serialize ordered list node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

/**
 * Serializer for list item nodes
 */
export class ListItemSerializer implements NodeSerializer {
  serialize(state: AsciiDocSerializerState, node: Node, parent: Node, index: number): void {
    try {
      state.listNestingLevel++
      state.renderContent(node)
      state.listNestingLevel--
      logger.info('Serialized list item node', { nodeType: 'list_item' })
    } catch (error) {
      logger.error('Failed to serialize list item node', {
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}