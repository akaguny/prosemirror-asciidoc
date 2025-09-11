/**
 * Assertion Helpers - Custom assertion functions for tests
 */

import { expect } from '@playwright/test';

/**
 * Asserts that content contains expected HTML elements
 */
export function expectContentToContainElements(content: string, selectors: string[]): void {
  // TODO: Implement element assertion
  selectors.forEach(selector => {
    expect(content).toContain(selector);
  });
}

/**
 * Asserts that AsciiDoc output matches expected pattern
 */
export function expectAsciiDocToMatch(output: string, pattern: RegExp): void {
  // TODO: Implement pattern assertion
  expect(output).toMatch(pattern);
}

/**
 * Asserts that editor and output are synchronized
 */
export function expectSyncToBeConsistent(editorContent: string, outputContent: string): void {
  // TODO: Implement sync assertion
  expect(editorContent).toBeTruthy();
  expect(outputContent).toBeTruthy();
}

/**
 * Asserts that no errors are present
 */
export function expectNoErrors(errors: any[]): void {
  expect(errors).toHaveLength(0);
}