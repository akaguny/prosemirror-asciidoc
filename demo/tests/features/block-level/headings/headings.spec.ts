/**
 * Feature Matrix:
 * - Headings: H1-H3, hierarchy, anchors, editing
 *
 * Content Model Mapping:
 * - Headings -> h1-h3 with proper hierarchy and AsciiDoc syntax
 *
 * Demo App Coverage:
 * - Heading creation via toolbar and shortcuts
 * - Multiple heading levels (H1, H2, H3)
 * - Heading hierarchy and structure
 * - Heading editing and modification
 * - Keyboard navigation between headings
 * - Heading conversion between levels
 *
 * Regression Markers:
 * - Issue #101: Heading rendering
 * - Issue #202: Heading hierarchy bugs
 * - Issue #303: Heading editing issues
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

testWithEditor.describe('Headings Feature', () => {
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

  // Parameterized tests for heading levels
  const headingLevels = [
    { level: 1, name: 'H1', content: TestDataProvider.getFeatureTestData('headings').h1 },
    { level: 2, name: 'H2', content: TestDataProvider.getFeatureTestData('headings').h2 },
    { level: 3, name: 'H3', content: TestDataProvider.getFeatureTestData('headings').h3 }
  ];

  for (const heading of headingLevels) {
    testWithEditor(`should create ${heading.name} heading via toolbar`, async ({ editorPage }) => {
      // Given: Heading content
      const content = heading.content;

      // When: Create heading via toolbar
      await editorPage.clickEditor();
      await editorPage.typeText(content);
      await editorPage.selectAll();
      await editorPage.createHeading(heading.level);
      await editorPage.waitForSync();

      // Then: Verify heading structure and sync
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateHeadingStructure(editorContent, [heading.level])).toBe(true);
      expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
      expect(ContentValidator.hasErrors(editorContent)).toBe(false);
      expect(editorContent).toContain(`<h${heading.level}>`);
    });

    testWithEditor(`should create ${heading.name} heading via keyboard shortcut`, async ({ editorPage }) => {
      // Given: Heading content
      const content = heading.content;

      // When: Create heading via shortcut
      await editorPage.clickEditor();
      await editorPage.typeText(content);
      await editorPage.selectAll();
      await editorPage.pressKey(`Control+${heading.level}`);
      await editorPage.waitForSync();

      // Then: Verify heading structure and sync
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateHeadingStructure(editorContent, [heading.level])).toBe(true);
      expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
      expect(editorContent).toContain(`<h${heading.level}>`);
    });
  }

  testWithEditor('should maintain heading hierarchy', async ({ editorPage }) => {
    // Given: Hierarchical heading content
    const hierarchy = TestDataProvider.getFeatureTestData('headings').hierarchy;

    // When: Create hierarchical headings
    await editorPage.clickEditor();
    for (let i = 0; i < hierarchy.length; i++) {
      if (i > 0) {
        await editorPage.pressKey('Enter');
        await editorPage.pressKey('Enter'); // Add spacing
      }
      await editorPage.typeText(hierarchy[i]);
      await editorPage.selectAll();
      await editorPage.createHeading(i + 1); // H1, H2, H3, H4
      await editorPage.waitForSync();
    }

    // Then: Verify hierarchy
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateHeadingStructure(editorContent, [1, 2, 3, 4])).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
  });

  testWithEditor('should edit heading content', async ({ editorPage }) => {
    // Given: Initial heading
    const initialContent = 'Initial Heading';
    await editorPage.clickEditor();
    await editorPage.typeText(initialContent);
    await editorPage.selectAll();
    await editorPage.createHeading(1);
    await editorPage.waitForSync();

    // When: Edit heading content
    await editorPage.moveCursor('ArrowRight');
    await editorPage.editAtCursor(' Modified');
    await editorPage.waitForSync();

    // Then: Verify changes
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateHeadingStructure(editorContent, [1])).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
    expect(editorContent).toContain('Modified');
  });

  testWithEditor('should convert between heading levels', async ({ editorPage }) => {
    // Given: H1 heading
    await editorPage.clickEditor();
    await editorPage.typeText('Test Heading');
    await editorPage.selectAll();
    await editorPage.createHeading(1);
    await editorPage.waitForSync();

    // When: Convert to H2
    await editorPage.selectAll();
    await editorPage.createHeading(2);
    await editorPage.waitForSync();

    // Then: Verify conversion
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateHeadingStructure(editorContent, [2])).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
    expect(editorContent).toContain('<h2>');
  });

  testWithEditor('should handle headings with special characters', async ({ editorPage }) => {
    // Given: Heading with special characters
    const specialHeading = 'Heading with special chars: !@#$%^&*()';

    // When: Create heading with special chars
    await editorPage.clickEditor();
    await editorPage.typeText(specialHeading);
    await editorPage.selectAll();
    await editorPage.createHeading(1);
    await editorPage.waitForSync();

    // Then: Verify special character handling
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateHeadingStructure(editorContent, [1])).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
    expect(editorContent).toContain('!@#$%^&*()');
  });

  testWithEditor('should handle empty headings', async ({ editorPage }) => {
    // Given: Empty heading content
    const emptyHeading = '';

    // When: Create empty heading
    await editorPage.clickEditor();
    await editorPage.typeText(emptyHeading || ' '); // Ensure some content for selection
    await editorPage.selectAll();
    await editorPage.createHeading(1);
    await editorPage.waitForSync();

    // Then: Verify empty heading handling
    const editorContent = await editorPage.getEditorContent();
    expect(ContentValidator.validateHeadingStructure(editorContent, [1])).toBe(true);
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('should handle very long headings', async ({ editorPage }) => {
    // Given: Long heading content
    const longHeading = 'A'.repeat(200);

    // When: Create long heading
    await editorPage.clickEditor();
    await editorPage.typeText(longHeading);
    await editorPage.selectAll();
    await editorPage.createHeading(1);
    await editorPage.waitForSync();

    // Then: Verify long heading handling
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateHeadingStructure(editorContent, [1])).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
  });

  testWithEditor('should maintain sync during rapid heading edits', async ({ editorPage }) => {
    // Given: Initial heading
    await editorPage.clickEditor();
    await editorPage.typeText('Initial');
    await editorPage.selectAll();
    await editorPage.createHeading(1);
    await editorPage.waitForSync();

    // When: Perform rapid edits
    for (let i = 0; i < 3; i++) {
      await editorPage.moveCursor('ArrowRight');
      await editorPage.editAtCursor(` edit${i}`);
      await editorPage.waitForSync();
    }

    // Then: Verify sync maintained
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('should handle multiple headings in document', async ({ editorPage }) => {
    // Given: Multiple headings
    const headings = ['First Heading', 'Second Heading', 'Third Heading'];

    // When: Create multiple headings
    await editorPage.clickEditor();
    for (let i = 0; i < headings.length; i++) {
      if (i > 0) {
        await editorPage.pressKey('Enter');
        await editorPage.pressKey('Enter');
      }
      await editorPage.typeText(headings[i]);
      await editorPage.selectAll();
      await editorPage.createHeading(1);
      await editorPage.waitForSync();
    }

    // Then: Verify multiple headings
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateHeadingStructure(editorContent, [1, 1, 1])).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
    headings.forEach(heading => {
      expect(editorContent).toContain(heading);
    });
  });

  testWithEditor('should handle heading navigation', async ({ editorPage }) => {
    // Given: Multiple headings
    await editorPage.clickEditor();
    await editorPage.typeText('Heading 1');
    await editorPage.selectAll();
    await editorPage.createHeading(1);
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter');
    await editorPage.typeText('Heading 2');
    await editorPage.selectAll();
    await editorPage.createHeading(2);
    await editorPage.waitForSync();

    // When: Navigate between headings
    await editorPage.moveCursor('ArrowUp');
    await editorPage.editAtCursor(' (edited)');
    await editorPage.waitForSync();

    // Then: Verify navigation and editing
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateHeadingStructure(editorContent, [1, 2])).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'heading')).toBe(true);
    expect(editorContent).toContain('(edited)');
  });
});