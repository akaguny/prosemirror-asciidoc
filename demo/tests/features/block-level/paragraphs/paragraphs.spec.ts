/**
 * Feature Matrix:
 * - Paragraphs: basic, multiline, formatted, empty, with inline elements
 *
 * Content Model Mapping:
 * - Paragraphs -> p with proper text content and formatting
 *
 * Demo App Coverage:
 * - Basic paragraph creation and editing
 * - Multi-line paragraph handling
 * - Paragraph separation with empty lines
 * - Paragraphs with inline formatting (bold, italic)
 * - Keyboard navigation between paragraphs
 * - Paragraph merging and splitting
 *
 * Regression Markers:
 * - Issue #789: Paragraph rendering
 * - Issue #890: Multi-line paragraph handling
 * - Issue #901: Paragraph separation bugs
 */

import { test, expect } from '@playwright/test';
import { EditorPage } from '../../../page-objects/EditorPage';
import { TestDataProvider } from '../../shared/utils/TestDataProvider';
import { ContentValidator } from '../../shared/utils/ContentValidator';
import { TestConfig } from '../../shared/utils/test-config';

const testWithEditor = test.extend<{
  editorPage: EditorPage;
}>({
  editorPage: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await use(editorPage);
  },
});

testWithEditor.describe('Paragraphs Feature', () => {
  testWithEditor.beforeEach(async ({ editorPage }) => {
    // Setup: Clear editor and ensure clean state
    await editorPage.clearEditor();
    await editorPage.waitForSync();
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor.afterEach(async ({ editorPage }) => {
    // Teardown: Check for errors
    expect(editorPage.hasErrors()).toBe(false);
    const consoleErrors = editorPage.getConsoleErrors();
    expect(consoleErrors.length).toBe(0);
  });

  testWithEditor('should create basic paragraph', async ({ editorPage }) => {
    // Given: Basic paragraph content
    const paragraphContent = TestDataProvider.getFeatureTestData('paragraphs').basic;

    // When: Type paragraph content
    await editorPage.clickEditor();
    await editorPage.typeText(paragraphContent);
    await editorPage.waitForSync();

    // Then: Verify paragraph structure and sync
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateParagraphStructure(editorContent, 1)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    expect(ContentValidator.hasErrors(editorContent)).toBe(false);
    expect(editorContent).toContain(paragraphContent);
  });

  testWithEditor('should handle multiline paragraphs', async ({ editorPage }) => {
    // Given: Multiline paragraph content
    const multilineContent = TestDataProvider.getFeatureTestData('paragraphs').multiline;

    // When: Type multiline content
    await editorPage.clickEditor();
    await editorPage.typeMultilineText(multilineContent);
    await editorPage.waitForSync();

    // Then: Verify multiline paragraph handling
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateParagraphStructure(editorContent, 1)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    multilineContent.forEach(line => {
      expect(editorContent).toContain(line);
    });
  });

  testWithEditor('should separate paragraphs correctly', async ({ editorPage }) => {
    // Given: Multiple paragraphs
    const para1 = 'First paragraph content.';
    const para2 = 'Second paragraph content.';
    const para3 = 'Third paragraph content.';

    // When: Create multiple paragraphs with separation
    await editorPage.clickEditor();
    await editorPage.typeText(para1);
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter'); // Empty line for separation
    await editorPage.typeText(para2);
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter');
    await editorPage.typeText(para3);
    await editorPage.waitForSync();

    // Then: Verify paragraph separation
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateParagraphStructure(editorContent, 3)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    expect(editorContent).toContain(para1);
    expect(editorContent).toContain(para2);
    expect(editorContent).toContain(para3);
  });

  testWithEditor('should handle paragraphs with inline formatting', async ({ editorPage }) => {
    // Given: Paragraph with formatting
    const formattedContent = TestDataProvider.getFeatureTestData('paragraphs').formatted;

    // When: Create paragraph with formatting
    await editorPage.clickEditor();
    await editorPage.typeText(formattedContent.replace('*', '').replace('_', '')); // Type plain text first
    await editorPage.selectAll();
    await editorPage.applyBold(); // Apply bold to all
    await editorPage.waitForSync();

    // Then: Verify formatting and structure
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateParagraphStructure(editorContent, 1)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    expect(editorContent).toContain('<strong>'); // Bold formatting
  });

  testWithEditor('should handle empty paragraphs', async ({ editorPage }) => {
    // Given: Empty paragraph content
    const emptyContent = TestDataProvider.getFeatureTestData('paragraphs').empty;

    // When: Create empty paragraph
    await editorPage.clickEditor();
    await editorPage.typeText(emptyContent || ' '); // Ensure some content
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter'); // Create empty paragraph
    await editorPage.waitForSync();

    // Then: Verify empty paragraph handling
    const editorContent = await editorPage.getEditorContent();
    expect(ContentValidator.hasErrors(editorContent)).toBe(false);
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('should edit paragraph content', async ({ editorPage }) => {
    // Given: Initial paragraph
    const initialContent = 'Initial paragraph text.';
    await editorPage.clickEditor();
    await editorPage.typeText(initialContent);
    await editorPage.waitForSync();

    // When: Edit paragraph content
    await editorPage.selectAll();
    await editorPage.typeText('Modified paragraph content.');
    await editorPage.waitForSync();

    // Then: Verify changes
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateParagraphStructure(editorContent, 1)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    expect(editorContent).toContain('Modified paragraph content');
  });

  testWithEditor('should handle paragraph navigation', async ({ editorPage }) => {
    // Given: Multiple paragraphs
    await editorPage.clickEditor();
    await editorPage.typeText('Paragraph 1');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter');
    await editorPage.typeText('Paragraph 2');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter');
    await editorPage.typeText('Paragraph 3');
    await editorPage.waitForSync();

    // When: Navigate between paragraphs
    await editorPage.moveCursor('ArrowUp');
    await editorPage.moveCursor('ArrowUp');
    await editorPage.editAtCursor(' (edited)');
    await editorPage.waitForSync();

    // Then: Verify navigation and editing
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateParagraphStructure(editorContent, 3)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    expect(editorContent).toContain('(edited)');
  });

  testWithEditor('should handle paragraphs with special characters', async ({ editorPage }) => {
    // Given: Content with special characters
    const specialContent = 'Paragraph with special chars: !@#$%^&*()[]{}|;:,.<>?';

    // When: Create paragraph with special chars
    await editorPage.clickEditor();
    await editorPage.typeText(specialContent);
    await editorPage.waitForSync();

    // Then: Verify special character handling
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateParagraphStructure(editorContent, 1)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    expect(editorContent).toContain('!@#$%^&*()');
  });

  testWithEditor('should handle very long paragraphs', async ({ editorPage }) => {
    // Given: Long paragraph content
    const longContent = 'A'.repeat(1000);

    // When: Create long paragraph
    await editorPage.clickEditor();
    await editorPage.typeText(longContent);
    await editorPage.waitForSync();

    // Then: Verify long content handling
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateParagraphStructure(editorContent, 1)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    expect(editorContent.length).toBeGreaterThan(900); // Allow for HTML wrapping
  });

  testWithEditor('should maintain sync during rapid paragraph edits', async ({ editorPage }) => {
    // Given: Initial paragraph
    await editorPage.clickEditor();
    await editorPage.typeText('Initial content');
    await editorPage.waitForSync();

    // When: Perform rapid edits
    for (let i = 0; i < 5; i++) {
      await editorPage.moveCursor('ArrowRight');
      await editorPage.editAtCursor(` edit${i}`);
      await editorPage.waitForSync();
    }

    // Then: Verify sync maintained
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'paragraph')).toBe(true);
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('should handle paragraph merging and splitting', async ({ editorPage }) => {
    // Given: Two paragraphs
    await editorPage.clickEditor();
    await editorPage.typeText('First paragraph');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter');
    await editorPage.typeText('Second paragraph');
    await editorPage.waitForSync();

    // When: Merge paragraphs by deleting empty line
    await editorPage.moveCursor('ArrowUp');
    await editorPage.pressKey('Delete'); // Delete empty line
    await editorPage.waitForSync();

    // Then: Verify paragraphs merged
    const editorContent = await editorPage.getEditorContent();
    expect(ContentValidator.validateParagraphStructure(editorContent, 1)).toBe(true);
    expect(editorContent).toContain('First paragraphSecond paragraph');
  });
});