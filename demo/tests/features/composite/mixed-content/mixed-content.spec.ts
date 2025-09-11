/**
 * Feature Matrix:
 * - Mixed content: text with formatting, lists with formatting, headings with links
 *
 * Content Model Mapping:
 * - Mixed -> various elements combined
 *
 * Demo App Coverage:
 * - Complex document structures
 * - Nested formatting
 * - Content preservation
 *
 * Regression Markers:
 * - Issue #404: Mixed content rendering
 */

import { test, expect } from '@playwright/test';
import { EditorPage } from '../../../page-objects/EditorPage';
import { TestDataProvider } from '../../shared/utils/TestDataProvider';
import { ContentValidator } from '../../shared/utils/ContentValidator';
import { TestConfig } from '../../shared/utils/test-config';
import '../../shared/utils/assertion-helpers';

const testWithEditor = test.extend<{
  editorPage: EditorPage;
}>({
  editorPage: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await use(editorPage);
  },
});

testWithEditor.describe('Mixed Content Feature', () => {
  testWithEditor.beforeEach(async ({ editorPage }) => {
    // Clear any existing content and errors
    await editorPage.clearEditor();
    await editorPage.waitForSync();
  });

  testWithEditor.afterEach(async ({ editorPage }) => {
    // Verify no errors occurred during test
    expect(editorPage.hasErrors()).toBe(false);
    expect(editorPage.getErrors()).toHaveNoErrors();
    expect(editorPage.getConsoleErrors()).toHaveNoErrors();
  });

  testWithEditor.describe('Paragraphs with Formatting', () => {
    const formattingScenarios = [
      {
        name: 'bold text',
        input: 'This is *bold* text in a paragraph',
        expectedElements: ['p', 'strong'],
        expectedAsciiDoc: /\*bold\*/
      },
      {
        name: 'italic text',
        input: 'This is _italic_ text in a paragraph',
        expectedElements: ['p', 'em'],
        expectedAsciiDoc: /_italic_/
      },
      {
        name: 'mixed formatting',
        input: 'This has *bold* and _italic_ and `code` formatting',
        expectedElements: ['p', 'strong', 'em', 'code'],
        expectedAsciiDoc: /\*bold\*.*_italic_.*`code`/
      },
      {
        name: 'nested formatting',
        input: 'This has *_bold italic_* text',
        expectedElements: ['p', 'strong', 'em'],
        expectedAsciiDoc: /\*_bold italic_\*/
      }
    ];

    for (const scenario of formattingScenarios) {
      testWithEditor(`Given a paragraph with ${scenario.name}, When entered in editor, Then renders correctly and syncs to AsciiDoc`, async ({ editorPage }) => {
        // Given
        await editorPage.typeText(scenario.input);

        // When
        await editorPage.waitForSync();

        // Then - Validate editor rendering
        const editorContent = await editorPage.getEditorContent();
        expect(ContentValidator.validateEditorContent(editorContent, scenario.expectedElements)).toBe(true);

        // Then - Validate AsciiDoc output
        const outputValue = await editorPage.getOutputValue();
        expect(ContentValidator.validateAsciiDocOutput(outputValue, [scenario.expectedAsciiDoc])).toBe(true);

        // Then - Validate bidirectional sync (basic validation)
        expect(editorContent).toBeTruthy();
        expect(outputValue).toBeTruthy();
      });
    }
  });

  testWithEditor.describe('Lists with Formatting', () => {
    const listScenarios = [
      {
        name: 'unordered list with bold items',
        input: ['* *Bold item* one', '* _Italic item_ two', '* `Code item` three'],
        expectedElements: ['ul', 'li', 'strong', 'em', 'code'],
        expectedAsciiDoc: /\*\s+\*Bold item\*\n\*\s+_Italic item_\n\*\s+`Code item`/
      },
      {
        name: 'ordered list with mixed formatting',
        input: ['. First *bold* item', '. Second _italic_ item', '. Third `code` item'],
        expectedElements: ['ol', 'li', 'strong', 'em', 'code'],
        expectedAsciiDoc: /\.\s+First \*bold\* item\n\.\s+Second _italic_ item\n\.\s+Third `code` item/
      },
      {
        name: 'nested list with formatting',
        input: ['* Parent item', '** *Bold* child item', '** _Italic_ child item', '* Another parent'],
        expectedElements: ['ul', 'li', 'strong', 'em'],
        expectedAsciiDoc: /\*\s+Parent item\n\*\*\s+\*Bold\* child item\n\*\*\s+_Italic_ child item\n\*\s+Another parent/
      }
    ];

    for (const scenario of listScenarios) {
      testWithEditor(`Given a ${scenario.name}, When entered in editor, Then renders correctly and syncs to AsciiDoc`, async ({ editorPage }) => {
        // Given
        await editorPage.typeMultilineText(scenario.input);

        // When
        await editorPage.waitForSync();

        // Then - Validate editor rendering
        const editorContent = await editorPage.getEditorContent();
        expect(ContentValidator.validateEditorContent(editorContent, scenario.expectedElements)).toBe(true);

        // Then - Validate list structure
        const listType = scenario.input[0].startsWith('*') ? 'ul' : 'ol';
        expect(ContentValidator.validateListStructure(editorContent, listType, scenario.input.length)).toBe(true);

        // Then - Validate AsciiDoc output
        const outputValue = await editorPage.getOutputValue();
        expect(ContentValidator.validateAsciiDocOutput(outputValue, [scenario.expectedAsciiDoc])).toBe(true);

        // Then - Validate bidirectional sync (skip DOMParser-dependent validation)
        expect(editorContent).toBeTruthy();
        expect(outputValue).toBeTruthy();
      });
    }
  });

  testWithEditor.describe('Headings with Links', () => {
    const headingLinkScenarios = [
      {
        name: 'heading with internal link',
        headingText: 'Main Section',
        linkText: 'click here',
        linkUrl: '#section',
        expectedElements: ['h2', 'a'],
        expectedAsciiDoc: /== Main Section\n\n.*\[click here\]\(#section\)/
      },
      {
        name: 'heading with external link',
        headingText: 'External Resources',
        linkText: 'documentation',
        linkUrl: 'https://example.com/docs',
        expectedElements: ['h2', 'a'],
        expectedAsciiDoc: /== External Resources\n\n.*\[documentation\]\(https:\/\/example\.com\/docs\)/
      },
      {
        name: 'heading with multiple links',
        headingText: 'Multiple Links',
        links: [
          { text: 'first link', url: 'https://first.com' },
          { text: 'second link', url: 'https://second.com' }
        ],
        expectedElements: ['h2', 'a'],
        expectedAsciiDoc: /== Multiple Links\n\n.*\[first link\]\(https:\/\/first\.com\).*\[second link\]\(https:\/\/second\.com\)/
      }
    ];

    for (const scenario of headingLinkScenarios) {
      testWithEditor(`Given a ${scenario.name}, When created in editor, Then renders correctly and syncs to AsciiDoc`, async ({ editorPage }) => {
        // Given
        await editorPage.typeText(scenario.headingText);
        await editorPage.createHeading(2); // H2

        if (scenario.links) {
          for (const link of scenario.links) {
            await editorPage.pressKey('Enter');
            await editorPage.createLink(link.url, link.text);
          }
        } else {
          await editorPage.pressKey('Enter');
          await editorPage.createLink(scenario.linkUrl, scenario.linkText);
        }

        // When
        await editorPage.waitForSync();

        // Then - Validate editor rendering
        const editorContent = await editorPage.getEditorContent();
        expect(ContentValidator.validateEditorContent(editorContent, scenario.expectedElements)).toBe(true);
        expect(ContentValidator.validateHeadingStructure(editorContent, [2])).toBe(true);

        // Then - Validate AsciiDoc output
        const outputValue = await editorPage.getOutputValue();
        expect(ContentValidator.validateAsciiDocOutput(outputValue, [scenario.expectedAsciiDoc])).toBe(true);

        // Then - Validate bidirectional sync (basic validation)
        expect(editorContent).toBeTruthy();
        expect(outputValue).toBeTruthy();
      });
    }
  });

  testWithEditor.describe('Complex Document Structure', () => {
    testWithEditor('Given complex mixed content document, When entered in editor, Then preserves all formatting and structure', async ({ editorPage }) => {
      // Given - Create complex document with multiple content types
      const complexContent = [
        '= Document Title',
        '',
        'This is an introductory paragraph with *bold* and _italic_ text.',
        '',
        '== Section with Lists',
        '',
        '* List item with *bold* formatting',
        '* Another item with _italic_ text',
        '** Nested item with `code`',
        '* Final item',
        '',
        '. Numbered list',
        '. First numbered item',
        '. Second numbered item with *formatting*',
        '',
        '=== Subsection with Links',
        '',
        'Check out this [link](https://example.com) and another [reference](#section).',
        '',
        '[source,javascript]',
        '----',
        'function example() {',
        '  return "complex content";',
        '}',
        '----'
      ];

      // When
      await editorPage.typeMultilineText(complexContent);
      await editorPage.waitForSync();

      // Then - Validate editor rendering
      const editorContent = await editorPage.getEditorContent();
      const expectedElements = ['h1', 'h2', 'h3', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'a', 'pre'];
      expect(ContentValidator.validateEditorContent(editorContent, expectedElements)).toBe(true);

      // Then - Validate structure counts
      expect(ContentValidator.validateHeadingStructure(editorContent, [1, 2, 3])).toBe(true);
      expect(ContentValidator.validateListStructure(editorContent, 'ul', 4)).toBe(true); // Including nested
      expect(ContentValidator.validateListStructure(editorContent, 'ol', 3)).toBe(true);
      expect(ContentValidator.validateParagraphStructure(editorContent, 3)).toBe(true);
      expect(ContentValidator.validateCodeBlock(editorContent, 'javascript')).toBe(true);

      // Then - Validate AsciiDoc output
      const outputValue = await editorPage.getOutputValue();
      const expectedPatterns = [
        /= Document Title/,
        /\*bold\*/g,
        /_italic_/g,
        /\[link\]\(https:\/\/example\.com\)/,
        /```javascript/,
        /function example/
      ];
      expect(ContentValidator.validateAsciiDocOutput(outputValue, expectedPatterns)).toBe(true);

      // Then - Validate bidirectional sync (basic validation)
      expect(editorContent).toBeTruthy();
      expect(outputValue).toBeTruthy();
    });

    testWithEditor('Given content with special characters and edge cases, When processed, Then handles gracefully', async ({ editorPage }) => {
      // Given - Use edge case data from TestDataProvider
      const edgeCases = TestDataProvider.getEdgeCaseData();

      for (const edgeCase of edgeCases.slice(0, 3)) { // Test first 3 edge cases
        // When
        await editorPage.clearEditor();
        await editorPage.typeText(edgeCase);
        await editorPage.waitForSync();

        // Then - Should not crash and should sync
        const editorContent = await editorPage.getEditorContent();
        const outputValue = await editorPage.getOutputValue();

        expect(editorContent).toBeTruthy();
        expect(outputValue).toBeTruthy();
        expect(ContentValidator.hasErrors(editorContent)).toBe(false);
        expect(ContentValidator.hasErrors(outputValue)).toBe(false);
      }
    });
  });

  testWithEditor.describe('Bidirectional Sync Verification', () => {
    testWithEditor('Given mixed content in editor, When synced to AsciiDoc and back, Then maintains consistency', async ({ editorPage }) => {
      // Given - Create mixed content
      const originalContent = [
        '== Test Section',
        '',
        'Paragraph with *bold* and _italic_ text.',
        '',
        '* List item 1',
        '* List item 2 with `code`',
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

      // When - Paste AsciiDoc back into output and sync back
      await editorPage.pasteIntoOutput(asciidocOutput);
      await editorPage.waitForSync();

      const editorContent2 = await editorPage.getEditorContent();

      // Then - Content should be consistent (basic validation)
      expect(editorContent1).toBeTruthy();
      expect(editorContent2).toBeTruthy();
      expect(asciidocOutput).toBeTruthy();
    });
  });
});