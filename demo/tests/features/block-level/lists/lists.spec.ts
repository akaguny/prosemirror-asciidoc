/**
 * Feature Matrix:
 * - Lists: unordered, ordered, nested, complex content
 *
 * Content Model Mapping:
 * - Lists -> ul/ol/li with proper nesting
 *
 * Demo App Coverage:
 * - Basic list creation via toolbar and shortcuts
 * - List editing and modification
 * - Nested list structures
 * - Complex content within lists
 * - Keyboard navigation
 *
 * Regression Markers:
 * - Issue #123: List rendering bugs
 * - Issue #456: Nested list indentation
 * - Issue #789: List item editing
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

testWithEditor.describe('Lists Feature', () => {
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

  // Parameterized tests for unordered lists
  const unorderedListScenarios = [
    { name: 'basic unordered list', data: TestDataProvider.getFeatureTestData('lists').unordered.basic },
    { name: 'complex unordered list', data: TestDataProvider.getFeatureTestData('lists').unordered.complex }
  ];

  for (const scenario of unorderedListScenarios) {
    testWithEditor(`should create ${scenario.name} via toolbar`, async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: Type content and create unordered list via toolbar
      await editorPage.typeText(scenario.data.join('\n'));
      await editorPage.selectAll();
      await editorPage.createUnorderedList();
      await editorPage.waitForSync();

      // Then: Verify editor content and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateListStructure(editorContent, 'ul', scenario.data.length)).toBe(true);
      expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'list')).toBe(true);
      expect(ContentValidator.hasErrors(editorContent)).toBe(false);
    });

    testWithEditor(`should create ${scenario.name} via keyboard shortcut`, async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: Type content and create unordered list via shortcut
      await editorPage.typeText(scenario.data.join('\n'));
      await editorPage.applyShortcut('Control+8');
      await editorPage.waitForSync();

      // Then: Verify editor content and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateListStructure(editorContent, 'ul', scenario.data.length)).toBe(true);
      expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'list')).toBe(true);
    });
  }

  // Parameterized tests for ordered lists
  const orderedListScenarios = [
    { name: 'basic ordered list', data: TestDataProvider.getFeatureTestData('lists').ordered.basic },
    { name: 'complex ordered list', data: TestDataProvider.getFeatureTestData('lists').ordered.complex }
  ];

  for (const scenario of orderedListScenarios) {
    testWithEditor(`should create ${scenario.name} via toolbar`, async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: Type content and create ordered list via toolbar
      await editorPage.typeText(scenario.data.join('\n'));
      await editorPage.selectAll();
      await editorPage.createOrderedList();
      await editorPage.waitForSync();

      // Then: Verify editor content and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateListStructure(editorContent, 'ol', scenario.data.length)).toBe(true);
      expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'list')).toBe(true);
    });

    testWithEditor(`should create ${scenario.name} via keyboard shortcut`, async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: Type content and create ordered list via shortcut
      await editorPage.typeText(scenario.data.join('\n'));
      await editorPage.applyShortcut('Control+9');
      await editorPage.waitForSync();

      // Then: Verify editor content and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateListStructure(editorContent, 'ol', scenario.data.length)).toBe(true);
      expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'list')).toBe(true);
    });
  }

  testWithEditor('should handle nested lists', async ({ editorPage }) => {
    // Given: Nested list data
    const nestedData = TestDataProvider.getFeatureTestData('lists').unordered.nested;

    // When: Create nested list structure
    await editorPage.clickEditor();
    await editorPage.typeText('Item 1');
    await editorPage.pressKey('Enter');
    await editorPage.typeText('Item 2');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Tab'); // Indent for nesting
    await editorPage.typeText('Nested A');
    await editorPage.pressKey('Enter');
    await editorPage.typeText('Nested B');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Shift+Tab'); // Outdent
    await editorPage.typeText('Item 3');

    await editorPage.selectAll();
    await editorPage.createUnorderedList();
    await editorPage.waitForSync();

    // Then: Verify nested structure
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateListStructure(editorContent, 'ul', 4)).toBe(true); // 3 main + 1 nested
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'list')).toBe(true);
  });

  testWithEditor('should edit list items', async ({ editorPage }) => {
    // Given: Basic list
    const initialItems = ['First', 'Second', 'Third'];
    await editorPage.clickEditor();
    await editorPage.typeText(initialItems.join('\n'));
    await editorPage.selectAll();
    await editorPage.createUnorderedList();
    await editorPage.waitForSync();

    // When: Edit middle item
    await editorPage.moveCursor('ArrowDown');
    await editorPage.moveCursor('ArrowDown');
    await editorPage.pressKey('Enter'); // Split item
    await editorPage.typeText('Modified Second');
    await editorPage.waitForSync();

    // Then: Verify changes persisted
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateListStructure(editorContent, 'ul', 4)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'list')).toBe(true);
    expect(editorContent).toContain('Modified Second');
  });

  testWithEditor('should handle edge cases', async ({ editorPage }) => {
    // Given: Edge case data
    const edgeCases = TestDataProvider.getEdgeCaseData();

    for (const edgeCase of edgeCases.slice(0, 3)) { // Test first 3 edge cases
      // When: Create list with edge case content
      await editorPage.clearEditor();
      await editorPage.clickEditor();
      await editorPage.typeText(edgeCase || 'empty');
      await editorPage.selectAll();
      await editorPage.createUnorderedList();
      await editorPage.waitForSync();

      // Then: Verify no errors and proper handling
      const editorContent = await editorPage.getEditorContent();
      expect(ContentValidator.hasErrors(editorContent)).toBe(false);
      expect(editorPage.hasErrors()).toBe(false);
    }
  });

  testWithEditor('should maintain sync during rapid edits', async ({ editorPage }) => {
    // Given: Initial list
    await editorPage.clickEditor();
    await editorPage.typeText('Item 1\nItem 2\nItem 3');
    await editorPage.selectAll();
    await editorPage.createUnorderedList();
    await editorPage.waitForSync();

    // When: Perform rapid edits
    for (let i = 0; i < 5; i++) {
      await editorPage.moveCursor('ArrowDown');
      await editorPage.editAtCursor(` Modified ${i}`);
      await editorPage.waitForSync();
    }

    // Then: Verify sync maintained
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'list')).toBe(true);
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('should handle list conversion between ordered and unordered', async ({ editorPage }) => {
    // Given: Unordered list
    await editorPage.clickEditor();
    await editorPage.typeText('First\nSecond\nThird');
    await editorPage.selectAll();
    await editorPage.createUnorderedList();
    await editorPage.waitForSync();

    // When: Convert to ordered
    await editorPage.selectAll();
    await editorPage.createOrderedList();
    await editorPage.waitForSync();

    // Then: Verify conversion
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateListStructure(editorContent, 'ol', 3)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'list')).toBe(true);
  });
});