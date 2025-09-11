/**
 * Feature Matrix:
 * - Links: URL links, reference links, anchor links
 *
 * Content Model Mapping:
 * - Links -> a
 *
 * Demo App Coverage:
 * - Link creation
 * - Link editing
 * - Link validation
 *
 * Regression Markers:
 * - Issue #202: Link rendering
 */

import { test, expect } from '@playwright/test';
import { EditorPage } from '../../../page-objects/EditorPage';
import { ContentValidator } from '../../shared/utils/ContentValidator';
import { TestDataProvider } from '../../shared/utils/TestDataProvider';
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

testWithEditor.describe('Links Feature', () => {
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

  testWithEditor.describe('Basic Link Creation', () => {
    testWithEditor('should create basic link via keyboard shortcut', async ({ editorPage }) => {
      // Given: Editor is focused and ready
      await editorPage.clickEditor();

      // When: User types text and applies link shortcut
      await editorPage.typeInEditor('Click here');
      await editorPage.selectAll();
      await editorPage.pressKey('Control+k');
      await editorPage.typeInEditor('https://example.com');
      await editorPage.pressKey('Enter');
      await editorPage.waitForSync();

      // Then: Link should be created in editor and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(editorContent).toContain('<a');
      expect(outputContent).toContain('https://example.com');
      expect(editorContent).toContain('Click here');
    });

    testWithEditor('should create link with custom text', async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: User creates link with specific text and URL
      await editorPage.createLink('https://test.com', 'Test Link');
      await editorPage.waitForSync();

      // Then: Link should render correctly
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(editorContent).toContain('Test Link');
      expect(editorContent).toContain('href="https://test.com"');
      expect(outputContent).toContain('https://test.com[Test Link]');
    });
  });

  testWithEditor.describe('Parameterized Link Formats', () => {
    const linkFormats = [
      { url: 'https://example.com', text: 'HTTPS Link', expected: /https:\/\/example\.com\[HTTPS Link\]/ },
      { url: 'http://example.com', text: 'HTTP Link', expected: /http:\/\/example\.com\[HTTP Link\]/ },
      { url: '/relative/path', text: 'Relative Path', expected: /\/relative\/path\[Relative Path\]/ },
      { url: '#anchor', text: 'Anchor Link', expected: /#anchor\[Anchor Link\]/ },
      { url: 'mailto:test@example.com', text: 'Email Link', expected: /mailto:test@example\.com\[Email Link\]/ },
      { url: 'ftp://ftp.example.com', text: 'FTP Link', expected: /ftp:\/\/ftp\.example\.com\[FTP Link\]/ }
    ];

    linkFormats.forEach(({ url, text, expected }) => {
      testWithEditor(`should handle ${url} format`, async ({ editorPage }) => {
        // Given: Editor is ready
        await editorPage.clickEditor();

        // When: User creates link with specific format
        await editorPage.createLink(url, text);
        await editorPage.waitForSync();

        // Then: Link should be formatted correctly in AsciiDoc
        const outputContent = await editorPage.getOutputValue();
        expect(expected.test(outputContent)).toBe(true);

        // And: Bidirectional sync should work
        const editorContent = await editorPage.getEditorContent();
        expect(editorContent).toContain('Test Link');
        expect(outputContent).toContain('https://test.com[Test Link]');
      });
    });
  });

  testWithEditor.describe('Link Editing', () => {
    testWithEditor('should edit existing link URL', async ({ editorPage }) => {
      // Given: A link exists in the editor
      await editorPage.clickEditor();
      await editorPage.createLink('https://old.com', 'Old Link');
      await editorPage.waitForSync();

      // When: User edits the link URL
      await editorPage.clickEditor();
      await editorPage.selectAll();
      await editorPage.pressKey('Control+k');
      await editorPage.typeInEditor('https://new.com');
      await editorPage.pressKey('Enter');
      await editorPage.waitForSync();

      // Then: Link URL should be updated
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('https://new.com');
      expect(outputContent).not.toContain('https://old.com');
    });

    testWithEditor('should edit link text while preserving URL', async ({ editorPage }) => {
      // Given: A link exists
      await editorPage.clickEditor();
      await editorPage.createLink('https://example.com', 'Original Text');
      await editorPage.waitForSync();

      // When: User edits only the text
      await editorPage.clickEditor();
      await editorPage.selectAll();
      await editorPage.typeInEditor('Updated Text');
      await editorPage.waitForSync();

      // Then: Text should be updated but URL preserved
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('https://example.com[Updated Text]');
    });
  });

  testWithEditor.describe('Bidirectional Sync Verification', () => {
    testWithEditor('should maintain sync when editing in editor', async ({ editorPage }) => {
      // Given: Initial link
      await editorPage.clickEditor();
      await editorPage.createLink('https://sync.com', 'Sync Test');
      await editorPage.waitForSync();

      const initialOutput = await editorPage.getOutputValue();

      // When: User edits in editor
      await editorPage.clickEditor();
      await editorPage.selectAll();
      await editorPage.typeInEditor('Modified Sync Test');
      await editorPage.waitForSync();

      // Then: Sync should be maintained
      const editorContent = await editorPage.getEditorContent();
      const finalOutput = await editorPage.getOutputValue();

      expect(finalOutput).toContain('Sync Test');
      expect(editorContent).toContain('Sync Test');
    });

    testWithEditor('should maintain sync when editing AsciiDoc output', async ({ editorPage }) => {
      // Given: Initial content
      await editorPage.clickEditor();
      await editorPage.createLink('https://bidir.com', 'Bidir Test');
      await editorPage.waitForSync();

      // When: User edits AsciiDoc output
      const newAsciiDoc = 'https://updated.com[Updated Bidir Test]';
      await editorPage.pasteIntoOutput(newAsciiDoc);
      await editorPage.waitForSync();

      // Then: Editor should reflect changes
      const editorContent = await editorPage.getEditorContent();
      expect(editorContent).toContain('Updated Bidir Test');
      expect(editorContent).toContain('href="https://updated.com"');
    });
  });

  testWithEditor.describe('Edge Cases and Error Handling', () => {
    testWithEditor('should handle empty link text', async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: User attempts to create link with empty text
      await editorPage.pressKey('Control+k');
      await editorPage.typeInEditor('https://empty.com');
      await editorPage.pressKey('Enter');
      await editorPage.waitForSync();

      // Then: Should handle gracefully without errors
      expect(editorPage.hasErrors()).toBe(false);
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('https://empty.com');
    });

    testWithEditor('should handle special characters in URLs', async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: User creates link with special characters
      const specialUrl = 'https://example.com/path?param=value&other=test#fragment';
      await editorPage.createLink(specialUrl, 'Special Link');
      await editorPage.waitForSync();

      // Then: Special characters should be handled correctly
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain(specialUrl);
    });

    testWithEditor('should handle very long URLs', async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: User creates link with very long URL
      const longUrl = 'https://' + 'a'.repeat(200) + '.com';
      await editorPage.createLink(longUrl, 'Long URL');
      await editorPage.waitForSync();

      // Then: Should handle long URLs without issues
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain(longUrl);
      expect(editorPage.hasErrors()).toBe(false);
    });

    testWithEditor('should handle multiple links in same content', async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: User creates multiple links
      await editorPage.typeInEditor('First link: ');
      await editorPage.createLink('https://first.com', 'First');
      await editorPage.typeInEditor(' Second link: ');
      await editorPage.createLink('https://second.com', 'Second');
      await editorPage.waitForSync();

      // Then: All links should be present and correct
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('https://first.com[First]');
      expect(outputContent).toContain('https://second.com[Second]');
    });
  });

  testWithEditor.describe('Toolbar Button Interactions', () => {
    testWithEditor('should create link via toolbar button', async ({ editorPage }) => {
      // Given: Editor has text content
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Toolbar link test');
      await editorPage.selectAll();

      // When: User clicks link toolbar button and provides URL/text
      await editorPage.clickLinkButton('https://toolbar.com', 'Toolbar Link');

      // Then: Link should be created in editor and AsciiDoc output
      const editorContent = await editorPage.getEditorContent();
      const outputContent = await editorPage.getOutputValue();

      expect(editorContent).toContain('<a');
      expect(outputContent).toContain('https://toolbar.com[Toolbar Link]');
    });

    testWithEditor('should handle toolbar link button with existing selection', async ({ editorPage }) => {
      // Given: Editor has selected text
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Selected text for link');
      await editorPage.selectAll();

      // When: User clicks link toolbar button
      await editorPage.clickLinkButton('https://selected.com', 'Selected');

      // Then: Selected text should become link
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('https://selected.com[Selected text for link]');
    });

    testWithEditor('should handle toolbar link button cancellation', async ({ editorPage }) => {
      // Given: Editor has text
      await editorPage.clickEditor();
      await editorPage.typeInEditor('Cancel test');

      // When: User clicks link button but cancels prompts
      await editorPage.clickLinkButtonAndCancel();

      // Then: No link should be created
      const outputContent = await editorPage.getOutputValue();
      expect(outputContent).toContain('Cancel test');
      expect(outputContent).not.toContain('https://');
    });
  });

  testWithEditor.describe('Error Monitoring and Validation', () => {
    testWithEditor('should not produce console errors during link operations', async ({ editorPage }) => {
      // Given: Editor is ready
      await editorPage.clickEditor();

      // When: User performs various link operations
      await editorPage.createLink('https://test.com', 'Test');
      await editorPage.selectAll();
      await editorPage.pressKey('Control+k');
      await editorPage.typeInEditor('https://edit.com');
      await editorPage.pressKey('Enter');
      await editorPage.clickLinkButton('https://toolbar.com', 'Toolbar');
      await editorPage.waitForSync();

      // Then: No console errors should be present
      expect(editorPage.getConsoleErrors()).toHaveLength(0);
    });

    testWithEditor('should validate link structure in editor', async ({ editorPage }) => {
      // Given: Link is created
      await editorPage.clickEditor();
      await editorPage.createLink('https://validate.com', 'Validate');
      await editorPage.waitForSync();

      // When: Content is retrieved
      const editorContent = await editorPage.getEditorContent();

      // Then: Link structure should be valid
      expect(editorContent).toContain('<a');
      expect(editorContent).toContain('Validate');
      expect(editorContent).toContain('https://validate.com');
    });
  });
});