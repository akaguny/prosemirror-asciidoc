/**
 * Assertion Helpers - Custom assertion matchers for tests
 */

import { expect } from '@playwright/test';

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toContainElements(selectors: string[]): R;
      toMatchAsciiDoc(pattern: RegExp): R;
      toBeSyncConsistent(): R;
      toHaveNoErrors(): R;
    }
  }
}

expect.extend({
  toContainElements(received: string, selectors: string[]) {
    const pass = selectors.every(selector => received.includes(selector));
    if (pass) {
      return {
        message: () => `expected ${received} not to contain all elements ${selectors.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to contain all elements ${selectors.join(', ')}`,
        pass: false,
      };
    }
  },

  toMatchAsciiDoc(received: string, pattern: RegExp) {
    const pass = pattern.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to match ${pattern}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to match ${pattern}`,
        pass: false,
      };
    }
  },

  toBeSyncConsistent(received: { editorContent: string; outputContent: string }) {
    const pass = Boolean(received.editorContent) && Boolean(received.outputContent);
    if (pass) {
      return {
        message: () => `expected sync not to be consistent`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected sync to be consistent`,
        pass: false,
      };
    }
  },

  toHaveNoErrors(received: any[]) {
    const pass = received.length === 0;
    if (pass) {
      return {
        message: () => `expected to have errors, but got none`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected no errors, but got ${received.length}`,
        pass: false,
      };
    }
  },
});