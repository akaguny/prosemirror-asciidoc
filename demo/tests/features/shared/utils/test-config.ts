/**
 * Test Configuration - Configuration settings for tests
 */

export const TestConfig = {
  timeouts: {
    default: 5000,
    sync: 1000,
    pageLoad: 10000,
  },
  selectors: {
    editor: '[contenteditable="true"]',
    output: '#output',
    errorContainer: '.error-container',
  },
  urls: {
    base: '/',
    editor: '/editor',
  },
  testData: {
    defaultContent: 'Default test content',
    maxContentLength: 10000,
  },
  features: {
    enableSyncValidation: true,
    enableErrorChecking: true,
    enablePerformanceMonitoring: false,
  },
};