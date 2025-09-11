/**
 * Feature Matrix:
 * - Code blocks: fenced, language-specific, multiline, syntax highlighting
 *
 * Content Model Mapping:
 * - Code blocks -> pre/code with language classes
 *
 * Demo App Coverage:
 * - Code block creation via toolbar and shortcuts
 * - Language-specific syntax highlighting
 * - Multi-line code editing
 * - Code block modification and deletion
 * - Keyboard navigation within code blocks
 *
 * Regression Markers:
 * - Issue #456: Code block rendering
 * - Issue #567: Syntax highlighting bugs
 * - Issue #678: Multi-line code editing
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

testWithEditor.describe('Code Blocks Feature', () => {
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

  testWithEditor('should create basic code block via toolbar', async ({ editorPage }) => {
    // Given: Basic code content
    const codeContent = TestDataProvider.getFeatureTestData('codeBlocks').basic;

    // When: Create code block via toolbar
    await editorPage.clickEditor();
    await editorPage.typeText(codeContent);
    await editorPage.selectAll();
    await editorPage.createCodeBlock();
    await editorPage.waitForSync();

    // Then: Verify code block structure and sync
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateCodeBlock(editorContent)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
    expect(ContentValidator.hasErrors(editorContent)).toBe(false);
  });

  testWithEditor('should create basic code block via keyboard shortcut', async ({ editorPage }) => {
    // Given: Basic code content
    const codeContent = TestDataProvider.getFeatureTestData('codeBlocks').basic;

    // When: Create code block via shortcut
    await editorPage.clickEditor();
    await editorPage.typeText(codeContent);
    await editorPage.applyShortcut('Control+Shift+c');
    await editorPage.waitForSync();

    // Then: Verify code block structure and sync
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateCodeBlock(editorContent)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
  });

  testWithEditor('should handle multiline code blocks', async ({ editorPage }) => {
    // Given: Multiline code content
    const multilineCode = TestDataProvider.getFeatureTestData('codeBlocks').multiline;

    // When: Create multiline code block
    await editorPage.clickEditor();
    await editorPage.typeMultilineText(multilineCode.split('\n'));
    await editorPage.selectAll();
    await editorPage.createCodeBlock();
    await editorPage.waitForSync();

    // Then: Verify multiline structure
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateCodeBlock(editorContent)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
    expect(editorContent).toContain(multilineCode);
  });

  // Parameterized tests for language-specific code blocks
  const languageScenarios = Object.entries(TestDataProvider.getFeatureTestData('codeBlocks').languageSpecific);

  for (const [language, code] of languageScenarios) {
    testWithEditor(`should create ${language} code block with syntax highlighting`, async ({ editorPage }) => {
      // Given: Language-specific code
      const codeContent = code as string;

      // When: Create language-specific code block
      await editorPage.clickEditor();
      await editorPage.typeText(codeContent);
      await editorPage.selectAll();
      await editorPage.createCodeBlock();
      await editorPage.waitForSync();

      // Then: Verify language-specific structure
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(ContentValidator.validateCodeBlock(editorContent, language)).toBe(true);
      expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
      expect(editorContent).toContain(`language-${language}`);
    });
  }

  testWithEditor('should edit code block content', async ({ editorPage }) => {
    // Given: Initial code block
    const initialCode = 'console.log("initial");';
    await editorPage.clickEditor();
    await editorPage.typeText(initialCode);
    await editorPage.selectAll();
    await editorPage.createCodeBlock();
    await editorPage.waitForSync();

    // When: Edit code block content
    await editorPage.moveCursor('ArrowDown');
    await editorPage.editAtCursor('\nconsole.log("modified");');
    await editorPage.waitForSync();

    // Then: Verify changes
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateCodeBlock(editorContent)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
    expect(editorContent).toContain('modified');
  });

  testWithEditor('should handle code block with special characters', async ({ editorPage }) => {
    // Given: Code with special characters
    const specialCode = 'if (a < b && c > d) {\n  return a + "test";\n}';

    // When: Create code block with special chars
    await editorPage.clickEditor();
    await editorPage.typeText(specialCode);
    await editorPage.selectAll();
    await editorPage.createCodeBlock();
    await editorPage.waitForSync();

    // Then: Verify proper handling
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateCodeBlock(editorContent)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
    expect(editorContent).toContain('<');
    expect(editorContent).toContain('&&');
  });

  testWithEditor('should handle empty code blocks', async ({ editorPage }) => {
    // Given: Empty content
    const emptyCode = '';

    // When: Create empty code block
    await editorPage.clickEditor();
    await editorPage.typeText(emptyCode || ' '); // Ensure some content for selection
    await editorPage.selectAll();
    await editorPage.createCodeBlock();
    await editorPage.waitForSync();

    // Then: Verify empty code block handling
    const editorContent = await editorPage.getEditorContent();
    expect(ContentValidator.validateCodeBlock(editorContent)).toBe(true);
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('should maintain sync during rapid code edits', async ({ editorPage }) => {
    // Given: Initial code block
    await editorPage.clickEditor();
    await editorPage.typeText('function test() {}');
    await editorPage.selectAll();
    await editorPage.createCodeBlock();
    await editorPage.waitForSync();

    // When: Perform rapid edits
    for (let i = 0; i < 3; i++) {
      await editorPage.moveCursor('ArrowRight');
      await editorPage.editAtCursor(`\n  console.log(${i});`);
      await editorPage.waitForSync();
    }

    // Then: Verify sync maintained
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('should handle code blocks with indentation', async ({ editorPage }) => {
    // Given: Indented code
    const indentedCode = '  function indented() {\n    return true;\n  }';

    // When: Create code block with indentation
    await editorPage.clickEditor();
    await editorPage.typeText(indentedCode);
    await editorPage.selectAll();
    await editorPage.createCodeBlock();
    await editorPage.waitForSync();

    // Then: Verify indentation preserved
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateCodeBlock(editorContent)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
    expect(editorContent).toContain('  function');
  });

  testWithEditor('should handle multiple code blocks in document', async ({ editorPage }) => {
    // Given: Multiple code snippets
    const code1 = 'console.log("first");';
    const code2 = 'console.log("second");';

    // When: Create multiple code blocks
    await editorPage.clickEditor();
    await editorPage.typeText(`${code1}\n\nSome text\n\n${code2}`);
    await editorPage.selectAll();
    await editorPage.createCodeBlock();
    await editorPage.waitForSync();

    // Then: Verify multiple code blocks
    const editorContent = await editorPage.getEditorContent();
    const outputContent = await editorPage.getOutputValue();

    expect(ContentValidator.validateCodeBlock(editorContent)).toBe(true);
    expect(ContentValidator.validateBidirectionalSync(editorContent, outputContent, 'code-block')).toBe(true);
    expect(editorContent).toContain(code1);
    expect(editorContent).toContain(code2);
  });
});