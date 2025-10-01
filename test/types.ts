import { Node } from "prosemirror-model"

/**
 * Represents a single AsciiDoc test case for parsing or serialization
 */
export interface AsciiDocTestCase {
  /** Test case description */
  description: string
  /** Input AsciiDoc text */
  input: string
  /** Expected ProseMirror Node output */
  expected: Node
  /** Optional flag to focus this test during development */
  only?: boolean
}

/**
 * Represents a roundtrip test case (parse -> serialize -> parse)
 */
export interface RoundtripTestCase {
  /** Test case description */
  description: string
  /** Input AsciiDoc text */
  input: string
  /** Optional expected serialized output if different from input */
  expectedSerialize?: string
}

/**
 * Common test fixtures used across test suites
 */
export interface TestFixtures {
  /** Basic document with minimal content */
  basicDoc: Node
  /** Complex document with various element types */
  complexDoc: Node
  /** Document with nested structures */
  nestedDoc: Node
}