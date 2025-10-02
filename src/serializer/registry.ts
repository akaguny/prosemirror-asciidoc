import { ErrorCode } from '../types/asciidoc'
import { SerializerError, errorHandler } from '../utils/error-handling'
import type { NodeSerializer, MarkSerializer } from '../types/asciidoc'

/**
 * Generic handler registry for managing type-to-handler mappings
 */
export class SerializerRegistry<T> {
  private handlers = new Map<string, T>()
  private fallbackHandler?: T

  /**
   * Register a handler for a specific type
   */
  register(type: string, handler: T): void {
    this.handlers.set(type, handler)
  }

  /**
   * Get the handler for a specific type
   */
  get(type: string): T {
    const handler = this.handlers.get(type)
    if (handler) {
      return handler
    }

    if (this.fallbackHandler) {
      return this.fallbackHandler
    }

    throw errorHandler.createUnknownNodeError(type)
  }

  /**
   * Check if a handler exists for a type
   */
  has(type: string): boolean {
    return this.handlers.has(type)
  }

  /**
   * Set a fallback handler for unknown types
   */
  setFallback(handler: T): void {
    this.fallbackHandler = handler
  }

  /**
   * Get all registered types
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.handlers.keys())
  }

  /**
   * Clear all registered handlers
   */
  clear(): void {
    this.handlers.clear()
    this.fallbackHandler = undefined
  }

  /**
   * Remove a specific handler
   */
  remove(type: string): boolean {
    return this.handlers.delete(type)
  }
}

/**
 * Specialized registry for node serializers with error handling
 */
export class NodeSerializerRegistry extends SerializerRegistry<NodeSerializer> {
  /**
   * Get handler with specific error context for nodes
   */
  getHandler(nodeType: string): NodeSerializer {
    try {
      return this.get(nodeType)
    } catch (error) {
      if (error instanceof SerializerError && error.code === ErrorCode.UNKNOWN_NODE_TYPE) {
        // Log warning and return fallback if available
        errorHandler.handleSerializerError(error, true)
        throw error
      }
      throw error
    }
  }
}

/**
 * Specialized registry for mark serializers with error handling
 */
export class MarkSerializerRegistry extends SerializerRegistry<MarkSerializer> {
  /**
   * Get handler with specific error context for marks
   */
  getHandler(markType: string): MarkSerializer {
    try {
      return this.get(markType)
    } catch (error) {
      if (error instanceof SerializerError && error.code === ErrorCode.UNKNOWN_MARK_TYPE) {
        // Log warning and return fallback if available
        errorHandler.handleSerializerError(error, true)
        throw error
      }
      throw error
    }
  }
}