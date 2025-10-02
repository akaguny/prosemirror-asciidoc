import { ErrorCode } from '../types/asciidoc'
import type { ErrorContext } from '../types/asciidoc'

/**
 * Custom error class for parser and serializer operations
 */
export class ParserError extends Error {
  public readonly code: ErrorCode
  public readonly context: ErrorContext

  constructor(message: string, code: ErrorCode, context: ErrorContext = {}) {
    super(message)
    this.name = 'ParserError'
    this.code = code
    this.context = context
  }
}

/**
 * Custom error class for serialization operations
 */
export class SerializerError extends Error {
  public readonly code: ErrorCode
  public readonly context: ErrorContext

  constructor(message: string, code: ErrorCode, context: ErrorContext = {}) {
    super(message)
    this.name = 'SerializerError'
    this.code = code
    this.context = context
  }
}

/**
 * Logger interface for consistent logging across the library
 */
export interface Logger {
  info(message: string, context?: any): void
  warn(message: string, context?: any): void
  error(message: string, context?: any): void
}

/**
 * Default console-based logger implementation
 */
export class ConsoleLogger implements Logger {
  private prefix = '[AsciiDoc]'

  info(message: string, context?: any): void {
    console.info(`${this.prefix} ${message}`, context ? context : '')
  }

  warn(message: string, context?: any): void {
    console.warn(`${this.prefix} ${message}`, context ? context : '')
  }

  error(message: string, context?: any): void {
    console.error(`${this.prefix} ${message}`, context ? context : '')
  }
}

/**
 * Global logger instance
 */
export const logger = new ConsoleLogger()

/**
 * Error handler that can recover from certain error conditions
 */
export class ErrorHandler {
  private logger: Logger

  constructor(logger: Logger = new ConsoleLogger()) {
    this.logger = logger
  }

  /**
   * Handle a parser error with appropriate logging and recovery
   */
  handleParserError(error: ParserError, recoverable: boolean = false): void {
    this.logger.error(error.message, {
      code: error.code,
      context: error.context
    })

    if (!recoverable) {
      throw error
    }
  }

  /**
   * Handle a serializer error with appropriate logging and recovery
   */
  handleSerializerError(error: SerializerError, recoverable: boolean = false): void {
    this.logger.error(error.message, {
      code: error.code,
      context: error.context
    })

    if (!recoverable) {
      throw error
    }
  }

  /**
   * Create a standardized error for unknown block types
   */
  createUnknownBlockError(blockType: string, context?: Partial<ErrorContext>): ParserError {
    return new ParserError(
      `Unknown block type encountered: ${blockType}`,
      ErrorCode.UNKNOWN_BLOCK_TYPE,
      { blockType, ...context }
    )
  }

  /**
   * Create a standardized error for unknown node types
   */
  createUnknownNodeError(nodeType: string, context?: Partial<ErrorContext>): SerializerError {
    return new SerializerError(
      `Unknown node type encountered: ${nodeType}`,
      ErrorCode.UNKNOWN_NODE_TYPE,
      { nodeType, ...context }
    )
  }

  /**
   * Create a standardized error for unknown mark types
   */
  createUnknownMarkError(markType: string, context?: Partial<ErrorContext>): SerializerError {
    return new SerializerError(
      `Unknown mark type encountered: ${markType}`,
      ErrorCode.UNKNOWN_MARK_TYPE,
      { markType, ...context }
    )
  }

  /**
   * Create a standardized error for invalid content
   */
  createInvalidContentError(details: string, context?: Partial<ErrorContext>): ParserError {
    return new ParserError(
      `Invalid content encountered: ${details}`,
      ErrorCode.INVALID_CONTENT,
      context
    )
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = new ErrorHandler()