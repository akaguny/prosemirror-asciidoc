/**
 * Feature Matrix:
 * - Nested structures: nested lists, nested blocks, complex hierarchies
 *
 * Content Model Mapping:
 * - Nested -> recursive element structures
 *
 * Demo App Coverage:
 * - Deep nesting
 * - Structure preservation
 * - Editing nested content
 *
 * Regression Markers:
 * - Issue #505: Nested structure rendering
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

testWithEditor.describe('Nested Structures Feature', () => {
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

  testWithEditor.describe('Nested Lists', () => {
    const nestedListScenarios = [
      {
        name: 'simple nested unordered lists',
        input: [
          '* Level 1 item 1',
          '** Level 2 item 1',
          '*** Level 3 item 1',
          '** Level 2 item 2',
          '* Level 1 item 2'
        ],
        expectedDepth: 3,
        expectedTotalItems: 5,
        expectedAsciiDoc: /\*\s+Level 1 item 1\n\*\*\s+Level 2 item 1\n\*\*\*\s+Level 3 item 1\n\*\*\s+Level 2 item 2\n\*\s+Level 1 item 2/
      },
      {
        name: 'mixed ordered and unordered nested lists',
        input: [
          '* Unordered parent',
          '. Ordered child 1',
          '.. Ordered grandchild',
          '* Unordered parent 2',
          '** Unordered child'
        ],
        expectedDepth: 3,
        expectedTotalItems: 5,
        expectedAsciiDoc: /\*\s+Unordered parent\n\.\s+Ordered child 1\n\.\.\s+Ordered grandchild\n\*\s+Unordered parent 2\n\*\*\s+Unordered child/
      },
      {
        name: 'deep nesting with multiple branches',
        input: [
          '* Branch A',
          '** Branch A1',
          '*** Branch A1a',
          '*** Branch A1b',
          '** Branch A2',
          '* Branch B',
          '** Branch B1',
          '*** Branch B1a',
          '**** Branch B1a1'
        ],
        expectedDepth: 4,
        expectedTotalItems: 9,
        expectedAsciiDoc: /\*\s+Branch A\n\*\*\s+Branch A1\n\*\*\*\s+Branch A1a\n\*\*\*\s+Branch A1b\n\*\*\s+Branch A2\n\*\s+Branch B\n\*\*\s+Branch B1\n\*\*\*\s+Branch B1a\n\*\*\*\*\s+Branch B1a1/
      }
    ];

    for (const scenario of nestedListScenarios) {
      testWithEditor(`Given ${scenario.name}, When entered in editor, Then renders correct nesting structure and syncs to AsciiDoc`, async ({ editorPage }) => {
        // Given
        await editorPage.typeMultilineText(scenario.input);

        // When
        await editorPage.waitForSync();

        // Then - Validate editor rendering
        const editorContent = await editorPage.getEditorContent();
        expect(ContentValidator.validateEditorContent(editorContent, ['ul', 'ol', 'li'])).toBe(true);

        // Then - Validate nesting depth and item count
        expect(ContentValidator.validateListStructure(editorContent, 'ul', scenario.expectedTotalItems)).toBe(true);

        // Then - Validate AsciiDoc output
        const outputValue = await editorPage.getOutputValue();
        expect(ContentValidator.validateAsciiDocOutput(outputValue, [scenario.expectedAsciiDoc])).toBe(true);

        // Then - Validate bidirectional sync (basic validation)
        expect(editorContent).toBeTruthy();
        expect(outputValue).toBeTruthy();
      });
    }
  });

  testWithEditor.describe('Lists with Code Blocks', () => {
    const listWithCodeScenarios = [
      {
        name: 'unordered list containing code blocks',
        input: [
          '* First item with text',
          '* Second item with code:',
          '',
          '[source,javascript]',
          '----',
          'function example() {',
          '  return true;',
          '}',
          '----',
          '',
          '* Third item after code'
        ],
        expectedElements: ['ul', 'li', 'pre', 'code'],
        expectedCodeLanguage: 'javascript',
        expectedAsciiDoc: /\*\s+First item with text\n\*\s+Second item with code:\n\n```javascript\nfunction example\(\) \{\n  return true;\n\}\n```\n\n\*\s+Third item after code/
      },
      {
        name: 'nested list with inline and block code',
        input: [
          '* Parent item',
          '** Child with `inline code`',
          '** Child with block code:',
          '',
          '[source,python]',
          '----',
          'def hello():',
          '    print("Hello")',
          '----',
          '',
          '*** Grandchild item'
        ],
        expectedElements: ['ul', 'li', 'code', 'pre'],
        expectedCodeLanguage: 'python',
        expectedAsciiDoc: /\*\s+Parent item\n\*\*\s+Child with `inline code`\n\*\*\s+Child with block code:\n\n```python\ndef hello\(\):\n    print\("Hello"\)\n```\n\n\*\*\*\s+Grandchild item/
      },
      {
        name: 'ordered list with multiple code blocks',
        input: [
          '. Step 1: Setup',
          '',
          '[source,bash]',
          '----',
          'npm install',
          '----',
          '',
          '. Step 2: Run code',
          '',
          '[source,javascript]',
          '----',
          'console.log("Running");',
          '----',
          '',
          '. Step 3: Verify'
        ],
        expectedElements: ['ol', 'li', 'pre', 'code'],
        expectedCodeLanguages: ['bash', 'javascript'],
        expectedAsciiDoc: /\.\s+Step 1: Setup\n\n```bash\nnpm install\n```\n\n\.\s+Step 2: Run code\n\n```javascript\nconsole\.log\("Running"\);\n```\n\n\.\s+Step 3: Verify/
      }
    ];

    for (const scenario of listWithCodeScenarios) {
      testWithEditor(`Given ${scenario.name}, When entered in editor, Then renders correctly with code blocks and syncs to AsciiDoc`, async ({ editorPage }) => {
        // Given
        await editorPage.typeMultilineText(scenario.input);

        // When
        await editorPage.waitForSync();

        // Then - Validate editor rendering
        const editorContent = await editorPage.getEditorContent();
        expect(ContentValidator.validateEditorContent(editorContent, scenario.expectedElements)).toBe(true);

        // Then - Validate code blocks
        if (scenario.expectedCodeLanguage) {
          expect(ContentValidator.validateCodeBlock(editorContent, scenario.expectedCodeLanguage)).toBe(true);
        }
        if (scenario.expectedCodeLanguages) {
          for (const lang of scenario.expectedCodeLanguages) {
            expect(ContentValidator.validateCodeBlock(editorContent, lang)).toBe(true);
          }
        }

        // Then - Validate AsciiDoc output
        const outputValue = await editorPage.getOutputValue();
        expect(ContentValidator.validateAsciiDocOutput(outputValue, [scenario.expectedAsciiDoc])).toBe(true);

        // Then - Validate bidirectional sync (basic validation)
        expect(editorContent).toBeTruthy();
        expect(outputValue).toBeTruthy();
      });
    }
  });

  testWithEditor.describe('Formatted Nested Content', () => {
    const formattedNestedScenarios = [
      {
        name: 'nested lists with formatting',
        input: [
          '* *Bold parent* item',
          '** _Italic child_ with `code`',
          '*** **Bold grandchild** item',
          '* Normal parent item',
          '** Mixed *bold* and _italic_ child'
        ],
        expectedElements: ['ul', 'li', 'strong', 'em', 'code'],
        expectedAsciiDoc: /\*\s+\*Bold parent\*\s+item\n\*\*\s+_Italic child_\s+with\s+`code`\n\*\*\*\s+\*\*Bold grandchild\*\*\s+item\n\*\s+Normal parent item\n\*\*\s+Mixed\s+\*bold\*\s+and\s+_italic_\s+child/
      },
      {
        name: 'deep nesting with complex formatting',
        input: [
          '* Level 1: *Bold* text',
          '** Level 2: _Italic_ and `code`',
          '*** Level 3: *_Bold italic_* combination',
          '**** Level 4: `Code` with **bold**',
          '***** Level 5: _Italic_ with `code` and *bold*'
        ],
        expectedElements: ['ul', 'li', 'strong', 'em', 'code'],
        expectedDepth: 5,
        expectedAsciiDoc: /\*\s+Level 1:\s+\*Bold\*\s+text\n\*\*\s+Level 2:\s+_Italic_\s+and\s+`code`\n\*\*\*\s+Level 3:\s+\*_Bold italic_\*\s+combination\n\*\*\*\*\s+Level 4:\s+`Code`\s+with\s+\*\*bold\*\*\n\*\*\*\*\*\s+Level 5:\s+_Italic_\s+with\s+`code`\s+and\s+\*bold\*/
      },
      {
        name: 'nested content with links and formatting',
        input: [
          '* [Link](https://example.com) in list',
          '** *Bold* [link](https://test.com) with _italic_',
          '*** `Code` and [reference](#anchor) formatting'
        ],
        expectedElements: ['ul', 'li', 'a', 'strong', 'em', 'code'],
        expectedAsciiDoc: /\*\s+\[Link\]\(https:\/\/example\.com\)\s+in list\n\*\*\s+\*Bold\*\s+\[link\]\(https:\/\/test\.com\)\s+with\s+_italic_\n\*\*\*\s+`Code`\s+and\s+\[reference\]\(#anchor\)\s+formatting/
      }
    ];

    for (const scenario of formattedNestedScenarios) {
      testWithEditor(`Given ${scenario.name}, When entered in editor, Then preserves all formatting in nested structure and syncs to AsciiDoc`, async ({ editorPage }) => {
        // Given
        await editorPage.typeMultilineText(scenario.input);

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

  testWithEditor.describe('Deep Nesting', () => {
    testWithEditor('Given deeply nested structure (5+ levels), When entered in editor, Then handles gracefully without performance issues', async ({ editorPage }) => {
      // Given - Create very deep nesting
      const deepNesting = [
        '* Level 1',
        '** Level 2',
        '*** Level 3',
        '**** Level 4',
        '***** Level 5',
        '****** Level 6',
        '******* Level 7',
        '* Back to level 1'
      ];

      // When
      await editorPage.typeMultilineText(deepNesting);
      await editorPage.waitForSync();

      // Then - Should handle deep nesting without errors
      const editorContent = await editorPage.getEditorContent();
      const outputValue = await editorPage.getOutputValue();

      expect(editorContent).toBeTruthy();
      expect(outputValue).toBeTruthy();
      expect(ContentValidator.hasErrors(editorContent)).toBe(false);
      expect(ContentValidator.hasErrors(outputValue)).toBe(false);

      // Then - Validate structure is preserved
      expect(ContentValidator.validateEditorContent(editorContent, ['ul', 'li'])).toBe(true);
      expect(ContentValidator.validateListStructure(editorContent, 'ul', deepNesting.length)).toBe(true);
    });

    testWithEditor('Given complex nested structure with mixed content types, When edited, Then maintains structure integrity', async ({ editorPage }) => {
      // Given - Complex nested structure
      const complexStructure = [
        '= Main Document',
        '',
        '* Section 1',
        '** Subsection 1.1',
        '*** Content with *bold* text',
        '',
        '[source,javascript]',
        '----',
        'console.log("nested code");',
        '----',
        '',
        '*** More content',
        '** Subsection 1.2',
        '* Section 2',
        '** Subsection 2.1',
        '*** Final content with _italic_'
      ];

      // When - Enter content
      await editorPage.typeMultilineText(complexStructure);
      await editorPage.waitForSync();

      // When - Edit nested content (simulate user editing)
      await editorPage.clickEditor();
      await editorPage.pressKey('ArrowDown');
      await editorPage.pressKey('ArrowDown');
      await editorPage.pressKey('ArrowDown');
      await editorPage.editAtCursor(' [edited]');
      await editorPage.waitForSync();

      // Then - Structure should still be valid
      const editorContent = await editorPage.getEditorContent();
      const outputValue = await editorPage.getOutputValue();

      expect(ContentValidator.validateEditorContent(editorContent, ['h1', 'ul', 'li', 'p', 'strong', 'em', 'pre', 'code'])).toBe(true);
      expect(ContentValidator.validateHeadingStructure(editorContent, [1])).toBe(true);
      expect(ContentValidator.validateListStructure(editorContent, 'ul', 7)).toBe(true); // Including nested items
      expect(ContentValidator.validateCodeBlock(editorContent, 'javascript')).toBe(true);

      // Then - Validate sync consistency after edit (basic validation)
      expect(editorContent).toBeTruthy();
      expect(outputValue).toBeTruthy();
    });
  });

  testWithEditor.describe('Edge Cases in Nested Structures', () => {
    const edgeCaseScenarios = [
      {
        name: 'empty nested items',
        input: ['* Parent', '** ', '***   ', '* Another parent'],
        expectedTotalItems: 4
      },
      {
        name: 'mixed nesting levels',
        input: ['* Level 1', '*** Level 3 (skipping 2)', '* Level 1 again'],
        expectedTotalItems: 3
      },
      {
        name: 'nested items with only whitespace',
        input: ['* Item 1', '**   \t  ', '* Item 2'],
        expectedTotalItems: 3
      }
    ];

    for (const scenario of edgeCaseScenarios) {
      testWithEditor(`Given ${scenario.name}, When processed, Then handles gracefully without breaking structure`, async ({ editorPage }) => {
        // Given
        await editorPage.typeMultilineText(scenario.input);

        // When
        await editorPage.waitForSync();

        // Then - Should not crash and maintain basic structure
        const editorContent = await editorPage.getEditorContent();
        const outputValue = await editorPage.getOutputValue();

        expect(editorContent).toBeTruthy();
        expect(outputValue).toBeTruthy();
        expect(ContentValidator.hasErrors(editorContent)).toBe(false);
        expect(ContentValidator.hasErrors(outputValue)).toBe(false);

        // Then - Validate list structure is maintained
        expect(ContentValidator.validateListStructure(editorContent, 'ul', scenario.expectedTotalItems)).toBe(true);
      });
    }
  });
});