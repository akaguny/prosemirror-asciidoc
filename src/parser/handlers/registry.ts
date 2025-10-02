import { ErrorCode } from '../../types/asciidoc'
import { ParserError, errorHandler } from '../../utils/error-handling'

/**
 * Generic handler registry for managing type-to-handler mappings
 */
export class HandlerRegistry<T> {
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

    throw errorHandler.createUnknownBlockError(type)
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
 * Specialized registry for block handlers with error handling
 */
export class BlockHandlerRegistry extends HandlerRegistry<BlockHandler> {
  /**
   * Get handler with specific error context for blocks
   */
  getHandler(blockType: string): BlockHandler {
    try {
      return this.get(blockType)
    } catch (error) {
      if (error instanceof ParserError && error.code === ErrorCode.UNKNOWN_BLOCK_TYPE) {
        // Log warning and return fallback if available
        errorHandler.handleParserError(error, true)
        throw error
      }
      throw error
    }
  }
}

/**
 * Interface for block handlers
 */
export interface BlockHandler {
  handle(block: any, state: any, blockParser: any): void
}

/**
 * Interface for inline handlers
 */
export interface InlineHandler {
  handle(text: string, state: any): void
}