import { expect, test, describe } from "vitest"
import { defaultAsciiDocParser, defaultAsciiDocSerializer } from "../src/index.js"
import type { AsciiDocTestCase, RoundtripTestCase } from "./types"

/**
 * Enhanced parse test helper with better error messages
 */
export function testParse(testCase: AsciiDocTestCase) {
  const testFn = testCase.only ? test.only : test
  testFn(testCase.description, () => {
    const result = defaultAsciiDocParser.parse(testCase.input)
    expect(result.content).toEqual(testCase.expected.content)
  })
}

/**
 * Enhanced serialize test helper with better error messages
 */
export function testSerialize(testCase: AsciiDocTestCase) {
  const testFn = testCase.only ? test.only : test
  testFn(testCase.description, () => {
    const result = defaultAsciiDocSerializer.serialize(testCase.expected)
    expect(result).toBe(testCase.input)
  })
}

/**
 * Test roundtrip parsing and serialization
 * Verifies that parse -> serialize -> parse produces consistent results
 */
export function testRoundtrip(testCase: RoundtripTestCase) {
  test(testCase.description, () => {
    // First parse
    const parsed = defaultAsciiDocParser.parse(testCase.input)
    
    // Serialize
    const serialized = defaultAsciiDocSerializer.serialize(parsed)
    const expectedOutput = testCase.expectedSerialize || testCase.input
    
    expect(serialized).toBe(expectedOutput)
    
    // Parse again and verify consistency
    const reparsed = defaultAsciiDocParser.parse(serialized)
    expect(reparsed).toEqual(parsed)
  })
}

/**
 * Creates a test suite for a group of related test cases
 */
export function createTestSuite(name: string, cases: AsciiDocTestCase[]) {
  describe(name, () => {
    cases.forEach(testCase => {
      testParse(testCase)
      testSerialize(testCase)
    })
  })
}