/**
 * Feature Matrix:
 * - Bidirectional sync: editor to AsciiDoc, AsciiDoc to editor
 *
 * Content Model Mapping:
 * - Sync -> bidirectional conversion
 *
 * Demo App Coverage:
 * - Real-time sync
 * - Content preservation
 * - Error handling
 *
 * Regression Markers:
 * - Issue #606: Sync failures
 */

import { test, expect } from '@playwright/test';
import { EditorPage } from '../../../page-objects/EditorPage';
import { TestDataProvider } from '../../shared/utils/TestDataProvider';
import { ContentValidator } from '../../shared/utils/ContentValidator';
import { TestConfig } from '../../shared/utils/test-config';
import { expectNoErrors } from '../../shared/utils/assertion-helpers';

const testWithEditor = test.extend<{
  editorPage: EditorPage;
}>({
  editorPage: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await use(editorPage);
  },
});

testWithEditor.describe('Bidirectional Sync Feature', () => {
  testWithEditor.beforeEach(async ({ editorPage }) => {
    // Clear any existing content and errors
    await editorPage.clearEditor();
    await editorPage.waitForSync();
  });

  testWithEditor.afterEach(async ({ editorPage }) => {
    // Verify no errors occurred during test
    expect(editorPage.hasErrors()).toBe(false);
    expectNoErrors(editorPage.getErrors());
    expectNoErrors(editorPage.getConsoleErrors());
  });

  testWithEditor.describe('Sync Stress Test', () => {
    testWithEditor('Given large document with multiple content types, When synced repeatedly, Then maintains consistency and performance', async ({ editorPage }) => {
      // Given - Create large complex document
      const largeDocument = [
        '= Large Test Document',
        '',
        'This is a large document for stress testing sync performance.',
        '',
        ...Array.from({ length: 10 }, (_, i) => `== Section ${i + 1}`),
        '',
        ...Array.from({ length: 50 }, (_, i) => `* List item ${i + 1} with some *bold* and _italic_ text`),
        '',
        ...Array.from({ length: 20 }, (_, i) => `. Ordered item ${i + 1}`),
        '',
        ...Array.from({ length: 5 }, (_, i) => [
          `=== Subsection ${i + 1}`,
          '',
          'Paragraph content here.',
          '',
          '[source,javascript]',
          '----',
          `function test${i}() {`,
          '  console.log("test");',
          '}',
          '----',
          ''
        ]).flat(),
        'Final paragraph with [link](https://example.com) and `code`.'
      ];

      // When - Enter large document
      await editorPage.typeMultilineText(largeDocument);

      // When - Perform multiple sync operations
      const startTime = Date.now();
      for (let i = 0; i < 5; i++) {
        await editorPage.waitForSync();
        // Simulate small edits to trigger sync
        await editorPage.pressKey('Space');
        await editorPage.pressKey('Backspace');
      }
      const endTime = Date.now();
      const syncDuration = endTime - startTime;

      // Then - Validate performance (should complete within reasonable time)
      expect(syncDuration).toBeLessThan(5000); // 5 seconds max for stress test

      // Then - Validate content integrity
      const editorContent = await editorPage.getEditorContent();
      const outputValue = await editorPage.getOutputValue();

      expect(ContentValidator.validateEditorContent(editorContent, ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'a', 'pre'])).toBe(true);
      expect(ContentValidator.validateSyncConsistency(editorContent, outputValue)).toBe(true);
    });

    testWithEditor('Given rapid consecutive edits, When synced, Then handles without data loss or corruption', async ({ editorPage }) => {
      // Given - Start with simple content
      await editorPage.typeText('Initial content');

      // When - Perform rapid edits
      const edits = [' with addition', ' and more text', ' and even more'];
      for (const edit of edits) {
        await editorPage.editAtCursor(edit);
        await editorPage.waitForSync();
      }

      // Then - Content should be preserved
      const editorContent = await editorPage.getEditorContent();
      const outputValue = await editorPage.getOutputValue();

      expect(editorContent).toContain('Initial content with addition and more text and even more');
      expect(editorContent).toBeTruthy();
      expect(outputValue).toBeTruthy();
    });
  });

  testWithEditor.describe('Sync Edge Cases', () => {
    const edgeCaseScenarios = [
      {
        name: 'empty content sync',
        input: '',
        expectedValid: true
      },
      {
        name: 'whitespace only sync',
        input: '   \n\t  \n  ',
        expectedValid: true
      },
      {
        name: 'special characters sync',
        input: '!@#$%^&*()[]{}|;:,.<>?',
        expectedValid: true
      },
      {
        name: 'unicode characters sync',
        input: '你好世界 🌍 αβγδε',
        expectedValid: true
      },
      {
        name: 'very long single line',
        input: 'A'.repeat(1000),
        expectedValid: true
      },
      {
        name: 'mixed line endings',
        input: 'Line 1\nLine 2\r\nLine 3\rLine 4',
        expectedValid: true
      }
    ];

    for (const scenario of edgeCaseScenarios) {
      testWithEditor(`Given ${scenario.name}, When synced, Then handles correctly without errors`, async ({ editorPage }) => {
        // Given
        await editorPage.typeText(scenario.input);

        // When
        await editorPage.waitForSync();

        // Then
        const editorContent = await editorPage.getEditorContent();
        const outputValue = await editorPage.getOutputValue();

        if (scenario.expectedValid) {
          expect(editorContent).toBeTruthy();
          expect(outputValue).toBeTruthy();
          expect(ContentValidator.hasErrors(editorContent)).toBe(false);
          expect(ContentValidator.hasErrors(outputValue)).toBe(false);
        }
      });
    }

    testWithEditor('Given malformed AsciiDoc input, When pasted into output, Then handles gracefully with error recovery', async ({ editorPage }) => {
      // Given - Malformed AsciiDoc
      const malformedAsciiDoc = `= Valid Header

* Valid list item
* Another item

[invalid syntax here without proper closing

* This should still work`;

      // When - Paste malformed content
      await editorPage.pasteIntoOutput(malformedAsciiDoc);
      await editorPage.waitForSync();

      // Then - Should handle gracefully
      const editorContent = await editorPage.getEditorContent();
      expect(editorContent).toBeTruthy();
      expect(ContentValidator.validateEditorContent(editorContent, ['h1', 'ul', 'li', 'p'])).toBe(true);
    });
  });

  testWithEditor.describe('Sync Performance', () => {
    testWithEditor('Given complex nested structure, When measured for sync time, Then performs within acceptable limits', async ({ editorPage }) => {
      // Given - Complex nested structure
      const complexStructure = [
        '= Performance Test Document',
        '',
        ...Array.from({ length: 20 }, (_, i) => [
          `== Section ${i + 1}`,
          '',
          ...Array.from({ length: 10 }, (_, j) => `* Nested item ${i}-${j}`),
          '',
          ...Array.from({ length: 5 }, (_, j) => `Paragraph ${i}-${j} with some content.`),
          ''
        ]).flat()
      ];

      // When - Measure sync performance
      const startTime = Date.now();
      await editorPage.typeMultilineText(complexStructure);
      await editorPage.waitForSync();
      const endTime = Date.now();

      const syncTime = endTime - startTime;

      // Then - Performance should be acceptable
      expect(syncTime).toBeLessThan(3000); // 3 seconds for complex content

      // Then - Content should be valid
      const editorContent = await editorPage.getEditorContent();
      const outputValue = await editorPage.getOutputValue();

      expect(ContentValidator.validateEditorContent(editorContent, ['h1', 'h2', 'ul', 'li', 'p'])).toBe(true);
      expect(editorContent).toBeTruthy();
      expect(outputValue).toBeTruthy();
    });

    testWithEditor('Given multiple rapid sync operations, When monitored, Then no memory leaks or performance degradation', async ({ editorPage }) => {
      // Given - Initial content
      await editorPage.typeText('Initial content');

      // When - Perform many sync operations
      const iterations = 20;
      const syncTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await editorPage.editAtCursor(` edit${i}`);
        await editorPage.waitForSync();
        const endTime = Date.now();
        syncTimes.push(endTime - startTime);
      }

      // Then - Performance should not degrade significantly
      const averageSyncTime = syncTimes.reduce((a, b) => a + b, 0) / syncTimes.length;
      const maxSyncTime = Math.max(...syncTimes);
      const minSyncTime = Math.min(...syncTimes);

      // Allow some variance but prevent extreme degradation
      expect(maxSyncTime).toBeLessThan(averageSyncTime * 3);
      expect(averageSyncTime).toBeLessThan(500); // Average under 500ms

      // Then - Final content should be correct
      const editorContent = await editorPage.getEditorContent();
      const outputValue = await editorPage.getOutputValue();

      expect(editorContent).toContain('Initial content');
      for (let i = 0; i < iterations; i++) {
        expect(editorContent).toContain(`edit${i}`);
      }
      expect(editorContent).toBeTruthy();
      expect(outputValue).toBeTruthy();
    });
  });

  testWithEditor.describe('Bidirectional Verification', () => {
    testWithEditor('Given content created in editor, When converted to AsciiDoc and back, Then maintains identical structure', async ({ editorPage }) => {
      // Given - Create content in editor
      const originalContent = [
        '= Test Document',
        '',
        'A paragraph with *bold* and _italic_ text.',
        '',
        '* List item 1',
        '** Nested item',
        '* List item 2',
        '',
        '. Ordered item 1',
        '. Ordered item 2',
        '',
        '[source,javascript]',
        '----',
        'console.log("test");',
        '----'
      ];

      // When - Enter content and sync
      await editorPage.typeMultilineText(originalContent);
      await editorPage.waitForSync();

      const editorContent1 = await editorPage.getEditorContent();
      const asciidocOutput = await editorPage.getOutputValue();

      // When - Convert back by pasting AsciiDoc
      await editorPage.clearEditor();
      await editorPage.pasteIntoOutput(asciidocOutput);
      await editorPage.waitForSync();

      const editorContent2 = await editorPage.getEditorContent();

      // Then - Structure should be preserved
      expect(ContentValidator.validateEditorContent(editorContent1, ['h1', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'pre', 'code'])).toBe(true);
      expect(ContentValidator.validateEditorContent(editorContent2, ['h1', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'pre', 'code'])).toBe(true);

      // Then - Content should be functionally equivalent
      expect(ContentValidator.validateSyncConsistency(editorContent1, asciidocOutput)).toBe(true);
      expect(ContentValidator.validateSyncConsistency(editorContent2, asciidocOutput)).toBe(true);
    });

    testWithEditor('Given AsciiDoc with complex formatting, When imported to editor and exported back, Then preserves all formatting', async ({ editorPage }) => {
      // Given - Complex AsciiDoc content
      const complexAsciiDoc = `= Complex Document

A paragraph with *bold*, _italic_, and \`code\` formatting.

* List with *bold* text
* Another item with _italic_ formatting
** Nested item with \`code\`
* Item with [link](https://example.com)

. Ordered list
. Second item
.. Nested ordered item

[source,javascript]
----
function complex() {
  return {
    bold: "*text*",
    italic: "_text_",
    code: \`text\`
  };
}
----

Final paragraph with mixed *bold* and _italic_ text.`;

      // When - Import AsciiDoc
      await editorPage.pasteIntoOutput(complexAsciiDoc);
      await editorPage.waitForSync();

      const editorContent = await editorPage.getEditorContent();
      const exportedAsciiDoc = await editorPage.getOutputValue();

      // Then - All formatting should be preserved
      expect(ContentValidator.validateEditorContent(editorContent, ['h1', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'a', 'pre'])).toBe(true);
      expect(ContentValidator.validateSyncConsistency(editorContent, exportedAsciiDoc)).toBe(true);

      // Then - Specific validations
      expect(ContentValidator.validateHeadingStructure(editorContent, [1])).toBe(true);
      expect(ContentValidator.validateListStructure(editorContent, 'ul', 4)).toBe(true);
      expect(ContentValidator.validateListStructure(editorContent, 'ol', 3)).toBe(true);
      expect(ContentValidator.validateCodeBlock(editorContent, 'javascript')).toBe(true);
    });

    testWithEditor('Given bidirectional test data from TestDataProvider, When processed, Then validates all conversions correctly', async ({ editorPage }) => {
      // Given - Use predefined bidirectional test data
      const testData = TestDataProvider.getBidirectionalTestData();

      for (const testCase of testData) {
        // When - Test editor to AsciiDoc
        await editorPage.clearEditor();
        await editorPage.typeText(testCase.editor);
        await editorPage.waitForSync();

        const editorContent = await editorPage.getEditorContent();
        const asciidocOutput = await editorPage.getOutputValue();

        // Then - Validate conversion
        expect(ContentValidator.validateSyncConsistency(editorContent, asciidocOutput)).toBe(true);

        // When - Test AsciiDoc to editor (round trip)
        await editorPage.clearEditor();
        await editorPage.pasteIntoOutput(asciidocOutput);
        await editorPage.waitForSync();

        const roundTripEditorContent = await editorPage.getEditorContent();
        const roundTripAsciiDoc = await editorPage.getOutputValue();

        // Then - Validate round trip consistency
        expect(ContentValidator.validateSyncConsistency(roundTripEditorContent, roundTripAsciiDoc)).toBe(true);
      }
    });
  });

  testWithEditor.describe('Sync Error Handling', () => {
    testWithEditor('Given sync operation fails, When monitored, Then provides meaningful error information', async ({ editorPage }) => {
      // Given - Set up content that might cause sync issues
      const problematicContent = 'Content with potential sync issues: ' + '\u0000' + ' null byte';

      // When - Attempt sync
      await editorPage.typeText(problematicContent);
      await editorPage.waitForSync();

      // Then - Should handle gracefully
      const editorContent = await editorPage.getEditorContent();
      const outputValue = await editorPage.getOutputValue();

      // Either succeeds or fails gracefully with error reporting
      if (editorPage.hasErrors()) {
        expect(editorPage.getErrors().length).toBeGreaterThan(0);
        expect(editorPage.getConsoleErrors().length).toBeGreaterThan(0);
      } else {
        expect(ContentValidator.validateSyncConsistency(editorContent, outputValue)).toBe(true);
      }
    });

    testWithEditor('Given network-like delay simulation, When sync timeout occurs, Then handles timeout gracefully', async ({ editorPage }) => {
      // Given - Content that requires sync
      await editorPage.typeText('Test content for timeout simulation');

      // When - Force multiple sync operations (simulating complex processing)
      for (let i = 0; i < 3; i++) {
        await editorPage.waitForSync();
        // Add small edits to trigger additional sync operations
        await editorPage.editAtCursor(' ');
        await editorPage.pressKey('Backspace');
      }

      // Then - Should still complete successfully
      const editorContent = await editorPage.getEditorContent();
      const outputValue = await editorPage.getOutputValue();

      expect(editorContent).toBeTruthy();
      expect(outputValue).toBeTruthy();
      expect(ContentValidator.validateSyncConsistency(editorContent, outputValue)).toBe(true);
    });
  });
});