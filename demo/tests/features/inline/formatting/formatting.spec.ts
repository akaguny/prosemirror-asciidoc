/**
 * Feature Matrix:
 * - Formatting: bold, italic, underline, strikethrough
 *
 * Content Model Mapping:
 * - Bold -> strong
 * - Italic -> em
 *
 * Demo App Coverage:
 * - Text formatting
 * - Mixed formatting
 * - Formatting preservation
 *
 * Regression Markers:
 *
 */

import { test, expect } from '@playwright/test';
import { EditorPage } from '../../../page-objects/EditorPage';
import { ContentValidator } from '../../shared/utils/ContentValidator';

const testWithEditor = test.extend<{
  editorPage: EditorPage;
}>({
  editorPage: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await use(editorPage);
  },
});

testWithEditor.describe('Formatting Feature', () => {
  testWithEditor.beforeEach(async ({ editorPage }) => {
    // Clear editor and reset state for each test
    await editorPage.clearEditor();
    await editorPage.waitForSync();
  });

  testWithEditor.afterEach(async ({ editorPage }) => {
    // Verify no errors occurred during test
    expect(editorPage.hasErrors()).toBe(false);
    expect(editorPage.getConsoleErrors()).toHaveLength(0);
  });

  testWithEditor.describe('Basic Text Formatting', () => {
    testWithEditor('should apply bold formatting via keyboard shortcut', async ({ editorPage }) => {
      // Given: Editor has text content
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Sample text for bold');
      await editorPage.selectAll();

      // When: User applies bold formatting
      await editorPage.pressKey('Control+b');
      await editorPage.waitForSync();

      // Then: Text should be bold in editor and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(editorContent).toContain('<strong>');
      expect(outputContent).toContain('*Sample text for bold*');
      expect(editorContent).toContain('Sample text for bold');
    });

    testWithEditor('should apply italic formatting via keyboard shortcut', async ({ editorPage }) => {
      // Given: Editor has text content
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Sample text for italic');
      await editorPage.selectAll();

      // When: User applies italic formatting
      await editorPage.pressKey('Control+i');
      await editorPage.waitForSync();

      // Then: Text should be italic in editor and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(editorContent).toContain('<em>');
      expect(outputContent).toContain('_Sample text for italic_');
    });

    testWithEditor('should apply bold using EditorPage method', async ({ editorPage }) => {
      // Given: Editor has text
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Bold test text');

      // When: Using applyBold method
      await editorPage.applyBold();
      await editorPage.waitForSync();

      // Then: Should be formatted correctly
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('*Bold test text*');
    });

    testWithEditor('should apply italic using EditorPage method', async ({ editorPage }) => {
      // Given: Editor has text
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Italic test text');

      // When: Using applyItalic method
      await editorPage.applyItalic();
      await editorPage.waitForSync();

      // Then: Should be formatted correctly
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('_Italic test text_');
    });
  });

  testWithEditor.describe('Combined and Mixed Formatting', () => {
    testWithEditor('should apply bold and italic to same text', async ({ editorPage }) => {
      // Given: Editor has text
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Mixed formatting text');

      // When: Apply both bold and italic
      await editorPage.selectAll();
      await editorPage.pressKey('Control+b');
      await editorPage.selectAll();
      await editorPage.pressKey('Control+i');
      await editorPage.waitForSync();

      // Then: Should have both formatting markers
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('_*Mixed formatting text*_');
    });

    testWithEditor('should handle partial text selection for formatting', async ({ editorPage }) => {
      // Given: Editor has multiple words
      await editorPage.clickEditor();
      await editorPage.typeInEditor('First Second Third');

      // When: Select and format partial text
      await editorPage.clickEditor();
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Control+b');
      await editorPage.waitForSync();

      // Then: Only selected text should be formatted
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('First *Second* Third');
    });

    testWithEditor('should preserve formatting when editing text', async ({ editorPage }) => {
      // Given: Bold text exists
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Original bold text');
      await editorPage.applyBold();
      await editorPage.waitForSync();

      // When: User edits the text
      await editorPage.clickEditor();
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.typeInEditor(' modified');
      await editorPage.waitForSync();

      // Then: Formatting should be preserved
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('*Original modified bold text*');
    });
  });

  testWithEditor.describe('Bidirectional Sync for Formatting', () => {
    testWithEditor('should maintain sync when applying formatting in editor', async ({ editorPage }) => {
      // Given: Initial text
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Sync test text');
      await editorPage.waitForSync();

      const initialOutput = await editorPage.getOutputValue();

      // When: Apply formatting
      await editorPage.applyBold();
      await editorPage.waitForSync();

      // Then: Sync should be maintained
      const editorContent = await editorPage.getEditorContent();
      const finalOutput = await editorPage.getOutputValue();

      expect(finalOutput).toContain('*Sync test text*');
      expect(editorContent).toContain('Sync test text');
    });

    testWithEditor('should maintain sync when editing formatted AsciiDoc', async ({ editorPage }) => {
      // Given: Formatted content
      await editorPage.clickEditor();
      await editorPage.typeInEditor('AsciiDoc sync');
      await editorPage.applyItalic();
      await editorPage.waitForSync();

      // When: Edit AsciiDoc output
      const newAsciiDoc = '_Modified AsciiDoc sync_';
      await editorPage.pasteIntoOutput(newAsciiDoc);
      await editorPage.waitForSync();

      // Then: Editor should reflect italic formatting
      const editorContent = await editorPage.getEditorContent();
      expect(editorContent).toContain('<em>');
      expect(editorContent).toContain('Modified AsciiDoc sync');
    });
  });

  testWithEditor.describe('Edge Cases and Special Characters', () => {
    testWithEditor('should handle empty selection for formatting', async ({ editorPage }) => {
      // Given: Editor has text but no selection
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Text without selection');

      // When: Try to apply formatting without selection
      await editorPage.pressKey('Control+b');
      await editorPage.waitForSync();

      // Then: Should handle gracefully without errors
      expect(editorPage.hasErrors()).toBe(false);
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('Text without selection');
    });

    testWithEditor('should handle special characters in formatted text', async ({ editorPage }) => {
      // Given: Text with special characters
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Text with @#$%^&*() special chars');

      // When: Apply formatting
      await editorPage.applyBold();
      await editorPage.waitForSync();

      // Then: Special characters should be preserved
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('*Text with @#$%^&*() special chars*');
    });

    testWithEditor('should handle very long text with formatting', async ({ editorPage }) => {
      // Given: Very long text
      const longText = 'A'.repeat(500);
      await editorPage.clickEditor();
      await editorPage.typeInEditor(longText);

      // When: Apply formatting
      await editorPage.applyItalic();
      await editorPage.waitForSync();

      // Then: Should handle without issues
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain(`_${longText}_`);
      expect(editorPage.hasErrors()).toBe(false);
    });

    testWithEditor('should handle multiple formatting applications', async ({ editorPage }) => {
      // Given: Text
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Multiple format test');

      // When: Apply formatting multiple times
      await editorPage.applyBold();
      await editorPage.applyBold(); // Should toggle off
      await editorPage.applyItalic();
      await editorPage.applyItalic(); // Should toggle off
      await editorPage.waitForSync();

      // Then: Should handle toggling correctly
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('Multiple format test');
      expect(editorPage.hasErrors()).toBe(false);
    });
  });

  testWithEditor.describe('Nested and Complex Formatting', () => {
    testWithEditor('should handle nested bold within italic', async ({ editorPage }) => {
      // Given: Text with mixed formatting
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Italic text with bold inside');

      // When: Apply nested formatting (italic first, then bold on part)
      await editorPage.selectAll();
      await editorPage.pressKey('Control+i');
      await editorPage.clickEditor();
      // Select "bold" part
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Control+b');
      await editorPage.waitForSync();

      // Then: Should have nested formatting
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toMatch(/_Italic text with \*bold\* inside_/);
    });

    testWithEditor('should handle complex mixed content', async ({ editorPage }) => {
      // Given: Complex content
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Normal Bold Italic');

      // When: Apply different formatting to different parts
      // Select "Bold" and make it bold
      await editorPage.clickEditor();
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Control+b');

      // Select "Italic" and make it italic
      await editorPage.clickEditor();
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('ArrowRight');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Shift+ArrowLeft');
      await editorPage.pressKey('Control+i');
      await editorPage.waitForSync();

      // Then: Should have mixed formatting
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('Normal *Bold* _Italic_');
    });
  });

  testWithEditor.describe('Toolbar Button Interactions', () => {
    testWithEditor('should apply bold formatting via toolbar button', async ({ editorPage }) => {
      // Given: Editor has text content
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Toolbar bold test');
      await editorPage.selectAll();

      // When: User clicks bold toolbar button
      await editorPage.clickBoldButton();

      // Then: Text should be bold in editor and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateEditorContent(editorContent, ['strong'])).toBe(true);
      expect(ContentValidator.validateAsciiDocOutput(outputContent, [/\*Toolbar bold test\*/])).toBe(true);
    });

    testWithEditor('should apply italic formatting via toolbar button', async ({ editorPage }) => {
      // Given: Editor has text content
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Toolbar italic test');
      await editorPage.selectAll();

      // When: User clicks italic toolbar button
      await editorPage.clickItalicButton();

      // Then: Text should be italic in editor and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateEditorContent(editorContent, ['em'])).toBe(true);
      expect(ContentValidator.validateAsciiDocOutput(outputContent, [/_Toolbar italic test_/])).toBe(true);
    });

    testWithEditor('should handle toolbar button clicks with no selection', async ({ editorPage }) => {
      // Given: Editor has text but no selection
      await editorPage.clickEditor();
      await editorPage.typeInEditor('No selection test');

      // When: User clicks toolbar buttons without selection
      await editorPage.clickBoldButton();
      await editorPage.clickItalicButton();

      // Then: Should handle gracefully without errors
      expect(editorPage.hasErrors()).toBe(false);
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('No selection test');
    });

    testWithEditor('should toggle formatting via toolbar buttons', async ({ editorPage }) => {
      // Given: Editor has text
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Toggle test');
      await editorPage.selectAll();

      // When: Click bold button twice
      await editorPage.clickBoldButton();
      await editorPage.selectAll();
      await editorPage.clickBoldButton();
      await editorPage.waitForSync();

      // Then: Formatting should be toggled off
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('Toggle test');
      expect(outputContent).not.toContain('*Toggle test*');
    });
  });

  testWithEditor.describe('Error Monitoring and Validation', () => {
    testWithEditor('should not produce console errors during formatting operations', async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: Perform various formatting operations
      await editorPage.typeInEditor('Error test text');
      await editorPage.applyBold();
      await editorPage.applyItalic();
      await editorPage.selectAll();
      await editorPage.pressKey('Control+b');
      await editorPage.pressKey('Control+i');
      await editorPage.clickBoldButton();
      await editorPage.clickItalicButton();
      await editorPage.waitForSync();

      // Then: No console errors should be present
      expect(editorPage.getConsoleErrors()).toHaveLength(0);
    });

    testWithEditor('should validate formatting structure in editor', async ({ editorPage }) => {
      // Given: Formatted content
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Validation test');
      await editorPage.applyBold();
      await editorPage.waitForSync();

      // When: Content is retrieved
      const editorContent = await editorPage.getEditorContent();

      // Then: Formatting structure should be valid
      expect(editorContent).toContain('<strong>');
      expect(editorContent).toContain('Validation test');
    });
  });
});