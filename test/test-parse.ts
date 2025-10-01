/**
 * @fileoverview Test suite for AsciiDoc parsing and serialization in ProseMirror
 * 
 * This test suite verifies the correct functioning of the AsciiDoc parser and serializer.
 * It covers basic elements, list structures, inline formatting, and various edge cases.
 * The tests ensure that documents can be correctly parsed into ProseMirror nodes and
 * serialized back to AsciiDoc format.
 */

import { expect, test, describe } from "vitest"

import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer, AsciiDocSerializer } from "../src/index.js"
import { doc, blockquote, h1, h2, p, hr, li, ol, ol3, ul, pre, em, strong, code, a, link, br, img } from "./build.js"
import { testParse, testSerialize, testRoundtrip, createTestSuite } from "./helpers"
import { 
  basicTestCases,
  inlineFormattingCases,
  nestedTestCases,
  specialCases,
  testCases
} from "./fixtures"

/**
 * Main test suite for AsciiDoc parsing and serialization
 * Tests are organized by element type and functionality
 */
describe("AsciiDoc Parser/Serializer", () => {
  /**
   * Tests for block-level elements like paragraphs, headings, and blockquotes
   */
  describe("Block Elements", () => {
    createTestSuite("Basic Elements", basicTestCases)
  })

  /**
   * Tests for list structures including ordered, unordered, and nested lists
   */
  describe("List Structures", () => {
    createTestSuite("List Elements", nestedTestCases)
  })

  /**
   * Tests for inline text formatting like bold, italic, code, and links
   */
  describe("Inline Formatting", () => {
    createTestSuite("Text Formatting", inlineFormattingCases)
  })

  /**
   * Tests for special cases and edge conditions
   */
  describe("Special Cases", () => {
    createTestSuite("Special Characters and Edge Cases", specialCases)

    /**
     * Tests for HTML tag handling within AsciiDoc content
     */
    describe("HTML Tags", () => {
      testRoundtrip({
        description: "preserves HTML tags in text",
        input: "Foo < img> bar"
      })
    })

    /**
     * Tests for whitespace handling in various contexts
     */
    describe("Whitespace Handling", () => {
      testRoundtrip({
        description: "drops nodes when all whitespace is expelled",
        input: "Text with an emphasized space"
      })
    })

    /**
     * Tests for code block handling with special focus on empty lines
     */
    describe("Code Blocks", () => {
      test("handles code block with empty line", () => {
        const originalText = "1\n"
        const node = doc(asciidocSchema.node("code_block", { params: "" }, [asciidocSchema.text(originalText)]))
        const adocText = defaultAsciiDocSerializer.serialize(node)
        expect(defaultAsciiDocParser.parse(adocText).content).toEqual(node.content)
      })
    })

    /**
     * Tests for character escaping in different contexts
     */
    describe("Character Escaping", () => {
      test("escapes extra characters from options", () => {
        const asciidocSerializer = new AsciiDocSerializer(
          defaultAsciiDocSerializer.nodes,
          defaultAsciiDocSerializer.marks,
          { escapeExtraCharacters: /[\|!]/g }
        )
        expect(asciidocSerializer.serialize(doc(p("foo|bar!")))).toBe("foo\\|bar\\!")
      })
    })
  })

  /**
   * Tests for various edge cases and corner conditions
   */
  describe("Edge Cases", () => {
    /**
     * Tests for list marker handling in non-list contexts
     */
    describe("List Markers", () => {
      testRoundtrip({
        description: "handles list markers without space",
        input: "1.2kg"
      })
    })

    /**
     * Tests for heading marker handling in various contexts
     */
    describe("Heading Markers", () => {
      testRoundtrip({
        description: "handles ATX heading markers at end of line",
        input: "="
      })

      testRoundtrip({
        description: "handles ATX heading markers without space",
        input: "=hashtag"
      })

      testRoundtrip({
        description: "handles Unicode space after heading markers",
        input: "=　こんにちは"
      })
    })

    /**
     * Tests for special sequence handling
     */
    describe("Special Sequences", () => {
      testRoundtrip({
        description: "handles +++ sequence",
        input: "+++"
      })
    })
  })
})
