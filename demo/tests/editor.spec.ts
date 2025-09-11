import { test, expect } from '@playwright/test';
import { EditorPage } from './page-objects/EditorPage';

const testWithEditor = test.extend<{
  editorPage: EditorPage;
}>({
  editorPage: async ({ page }, use) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await use(editorPage);
  },
});

testWithEditor.describe('Bidirectional Synchronization Stress Test', () => {
  testWithEditor('should verify bidirectional sync with basic AsciiDoc markup and stress-test debouncing', async ({ editorPage }) => {
    await testWithEditor.step('Verify editor is editable and get initial content', async () => {
      const editorContent = await editorPage.getEditorContent();
      expect(editorContent).toBeTruthy();
    });

    await testWithEditor.step('Update content and verify sync', async () => {
      const initialContent = await editorPage.getEditorContent();
      const updatedContent = initialContent + '\n\nAdditional paragraph with *more bold* and _more italic*.';
      await editorPage.typeText(updatedContent);
      await editorPage.waitForSync();
      expect(editorPage.hasErrors()).toBe(false);
    });
  });
});

testWithEditor.describe('Multiline Editing Feature', () => {
  testWithEditor('Scenario: User creates multiple paragraphs and verifies content preservation', async ({ editorPage }) => {
    await testWithEditor.step('Type multiple paragraphs', async () => {
      await editorPage.typeText('First paragraph.');
      await editorPage.pressKey('Enter');
      await editorPage.typeInEditor('Second paragraph with some text.');
      await editorPage.pressKey('Enter');
      await editorPage.pressKey('Enter'); // Empty line
      await editorPage.typeInEditor('Third paragraph.');
    });

    await testWithEditor.step('Verify content preservation', async () => {
      await editorPage.waitForSync();
      const editorContent = await editorPage.getEditorContent();
      expect(editorContent).toContain('First paragraph.');
      expect(editorContent).toContain('Second paragraph with some text.');
      expect(editorContent).toContain('Third paragraph.');
      expect(editorPage.hasErrors()).toBe(false);
    });
  });

  testWithEditor('Scenario: User edits multiline content and maintains structure', async ({ editorPage }) => {
    // Given: The editor has initial multiline content
    await editorPage.goto();

    // Pre-fill with multiline content
    await editorPage.clickEditor();
    await editorPage.typeInEditor('Line one');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Line two');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Line three');

    // When: User edits in the middle of the content
    await editorPage.pressKey('ArrowUp'); // Move to second line
    await editorPage.pressKey('ArrowUp');
    await editorPage.pressKey('End');
    await editorPage.typeInEditor(' - edited');

    // Then: Structure is maintained and no errors
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('Line one - edited');
    expect(editorContent).toContain('Line two');
    expect(editorContent).toContain('Line three');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: User handles line breaks and empty paragraphs without errors', async ({ editorPage }) => {
    // Given: The editor is loaded
    await editorPage.goto();

    // When: User creates content with multiple empty lines and breaks
    await editorPage.clickEditor();
    await editorPage.typeInEditor('Start');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter'); // Empty paragraph
    await editorPage.pressKey('Enter'); // Another empty
    await editorPage.typeInEditor('Middle');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('End');

    // Then: No errors occur and content is handled correctly
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('Start');
    expect(editorContent).toContain('Middle');
    expect(editorContent).toContain('End');
    expect(editorPage.hasErrors()).toBe(false);
  });
});

testWithEditor.describe('Asciidoc Output Display Feature', () => {
  testWithEditor('Scenario: Editing text in editor updates asciidoc output in real-time', async ({ editorPage }) => {
    await testWithEditor.step('Get initial output', async () => {
      const initialOutput = await editorPage.getOutputValue();
      expect(initialOutput).toBeDefined();
    });

    await testWithEditor.step('Type additional text', async () => {
      await editorPage.moveCursor('End');
      await editorPage.typeInEditor('Hello World');
    });

    await testWithEditor.step('Verify output updates', async () => {
      await editorPage.waitForSync();
      const outputValue = await editorPage.getOutputValue();
      expect(outputValue).toContain('Hello World');
      expect(editorPage.hasErrors()).toBe(false);
    });
  });

  testWithEditor('Scenario: Creating paragraphs updates asciidoc output with proper markup', async ({ editorPage }) => {
    // Given: The editor and output textarea are loaded
    await editorPage.goto();

    // When: User creates multiple paragraphs
    await editorPage.clickEditor();
    await editorPage.typeInEditor('First paragraph.');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Second paragraph.');

    // Then: The asciidoc output reflects the paragraphs correctly
    await editorPage.waitForSync();
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('First paragraph.');
    expect(outputValue).toContain('Second paragraph.');
    expect(outputValue).toMatch(/First paragraph\.\n\nSecond paragraph\./); // Assuming paragraphs are separated by double newline
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: Editing existing content updates asciidoc output accurately', async ({ editorPage }) => {
    // Given: The editor is loaded
    await editorPage.goto();

    // Clear the editor
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');

    // Pre-fill with content
    await editorPage.typeInEditor('Initial text');

    // When: User edits the content
    for (let i = 0; i < 5; i++) {
      await editorPage.pressKey('ArrowLeft');
    }
    await editorPage.typeInEditor(' modified');

    // Then: The asciidoc output reflects the changes
    await editorPage.waitForSync();
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toBe('Initial modified text');
    expect(editorPage.hasErrors()).toBe(false);
  });
});

testWithEditor.describe('Ordered Lists Feature', () => {

  testWithEditor('Scenario: User creates ordered list via keyboard shortcut and verifies AsciiDoc output', async ({ editorPage }) => {
    // Given: The editor is loaded with content
    await editorPage.goto();

    // Clear and add test content
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('First item');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Second item');

    // Select the content
    await editorPage.selectAll();

    // When: User presses Ctrl+9
    await editorPage.pressKey('Control+9');

    // Then: Editor shows ordered list and AsciiDoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ol>');
    expect(editorContent).toContain('<li>');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('1. First item');
    expect(outputValue).toContain('2. Second item');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: User edits ordered list by adding and modifying items', async ({ editorPage }) => {
    // Given: The editor has an ordered list
    await editorPage.goto();

    // Create initial list
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Item 1');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Item 2');
    await editorPage.selectAll();
    await editorPage.pressKey('Control+9');
    await editorPage.waitForSync();

    // When: User adds a new item and edits existing
    await editorPage.pressKey('End'); // Move to end of last item
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Item 3');
    await editorPage.pressKey('ArrowUp'); // Move to second item
    await editorPage.pressKey('End');
    await editorPage.typeInEditor(' edited');

    // Then: List is updated correctly in editor and AsciiDoc output
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ol>');
    expect(editorContent).toContain('Item 3');
    expect(editorContent).toContain('Item 2 edited');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('1. Item 1');
    expect(outputValue).toContain('2. Item 2 edited');
    expect(outputValue).toContain('3. Item 3');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: AsciiDoc input with ordered list renders correctly in editor', async ({ editorPage }) => {
    // Given: The output textarea is loaded
    await editorPage.goto();

    // When: User pastes AsciiDoc with ordered list into output
    const asciidocInput = '1. First item\n2. Second item\n3. Third item';
    await editorPage.pasteIntoOutput(asciidocInput);

    // Then: Editor renders the ordered list correctly
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ol>');
    expect(editorContent).toContain('<li>');
    expect(editorContent).toContain('First item');
    expect(editorContent).toContain('Second item');
    expect(editorContent).toContain('Third item');
    expect(editorPage.hasErrors()).toBe(false);
  });

});

testWithEditor.describe('Complex Content in Lists Feature', () => {
  testWithEditor('Scenario: User creates unordered list with multiple paragraphs and verifies AsciiDoc output', async ({ editorPage }) => {
    // Given: The editor is loaded
    await editorPage.goto();

    // Clear editor
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');

    // When: User creates content with multiple paragraphs in list items
    await editorPage.typeInEditor('First item');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter'); // Empty line for second paragraph
    await editorPage.typeInEditor('Second paragraph in first item');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Second item');
    await editorPage.selectAll();
    await editorPage.pressKey('Control+8'); // Create unordered list

    // Then: Editor renders list with multiple paragraphs and AsciiDoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ul>');
    expect(editorContent).toContain('<li>');
    expect(editorContent).toContain('First item');
    expect(editorContent).toContain('Second paragraph in first item');
    expect(editorContent).toContain('Second item');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('* First item');
    expect(outputValue).toContain('Second paragraph in first item');
    expect(outputValue).toContain('* Second item');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: User creates ordered list with nested unordered list and verifies AsciiDoc output', async ({ editorPage }) => {
    // Given: The editor is loaded
    await editorPage.goto();

    // Clear editor
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');

    // When: User creates ordered list with nested content
    await editorPage.typeInEditor('First ordered item');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Second ordered item with nested list');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter'); // Empty line
    await editorPage.typeInEditor('Nested item 1');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Nested item 2');
    await editorPage.selectAll();
    await editorPage.pressKey('Control+9'); // Create ordered list

    // Then: Editor renders nested list structure and AsciiDoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ol>');
    expect(editorContent).toContain('<ul>');
    expect(editorContent).toContain('First ordered item');
    expect(editorContent).toContain('Second ordered item with nested list');
    expect(editorContent).toContain('Nested item 1');
    expect(editorContent).toContain('Nested item 2');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('1. First ordered item');
    expect(outputValue).toContain('2. Second ordered item with nested list');
    expect(outputValue).toContain('** Nested item 1');
    expect(outputValue).toContain('** Nested item 2');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: User edits complex list item by adding paragraph and verifies preservation', async ({ editorPage }) => {
    // Given: The editor has a simple list
    await editorPage.goto();

    // Create initial list
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Item 1');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Item 2');
    await editorPage.selectAll();
    await editorPage.pressKey('Control+8');
    await editorPage.waitForSync();

    // When: User edits list item to add multiple paragraphs
    await editorPage.pressKey('ArrowUp'); // Move to first item
    await editorPage.pressKey('End');
    await editorPage.pressKey('Enter');
    await editorPage.pressKey('Enter'); // Add empty line for new paragraph
    await editorPage.typeInEditor('Additional paragraph in item 1');

    // Then: Complex content is preserved in editor and AsciiDoc output
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ul>');
    expect(editorContent).toContain('Item 1');
    expect(editorContent).toContain('Additional paragraph in item 1');
    expect(editorContent).toContain('Item 2');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('* Item 1');
    expect(outputValue).toContain('Additional paragraph in item 1');
    expect(outputValue).toContain('* Item 2');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: AsciiDoc input with complex list content renders correctly in editor', async ({ editorPage }) => {
    // Given: The output textarea is loaded
    await editorPage.goto();

    // When: User inputs AsciiDoc with complex list content
    const complexAsciiDoc = `* First item
* Second item with multiple paragraphs

  This is the second paragraph.

  And here's another with *bold* text.
* Third item

1. First ordered item
2. Second ordered item with nested list

  This item has a paragraph and nested list:

  ** Sub item 1
  ** Sub item 2
3. Third ordered item`;
    await editorPage.pasteIntoOutput(complexAsciiDoc);

    // Then: Editor renders the complex list structure correctly
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ul>');
    expect(editorContent).toContain('<ol>');
    expect(editorContent).toContain('First item');
    expect(editorContent).toContain('Second item with multiple paragraphs');
    expect(editorContent).toContain('This is the second paragraph');
    expect(editorContent).toContain('<strong>bold</strong>');
    expect(editorContent).toContain('First ordered item');
    expect(editorContent).toContain('Second ordered item with nested list');
    expect(editorContent).toContain('Sub item 1');
    expect(editorContent).toContain('Sub item 2');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor.describe('Parameterized Complex List Scenarios', () => {
    const scenarios = [
      {
        name: 'unordered list with multiple paragraphs',
        input: 'Item 1\n\nSecond paragraph\n\nItem 2',
        listType: 'unordered',
        expectedAsciiDoc: '* Item 1\n\nSecond paragraph\n\n* Item 2'
      },
      {
        name: 'ordered list with nested unordered list',
        input: 'Ordered item 1\nNested item 1\nNested item 2\nOrdered item 2',
        listType: 'ordered',
        expectedAsciiDoc: '1. Ordered item 1\n** Nested item 1\n** Nested item 2\n2. Ordered item 2'
      },
      {
        name: 'list item with paragraph and nested list',
        input: 'Main item\n\nParagraph in item\nSub item 1\nSub item 2',
        listType: 'unordered',
        expectedAsciiDoc: '* Main item\n\nParagraph in item\n** Sub item 1\n** Sub item 2'
      },
      {
        name: 'complex nested structure',
        input: 'Level 1\n  Level 2\n    Level 3\n  Back to level 2\nLevel 1 again',
        listType: 'unordered',
        expectedAsciiDoc: '* Level 1\n** Level 2\n*** Level 3\n** Back to level 2\n* Level 1 again'
      }
    ];

    for (const scenario of scenarios) {
      test(`Scenario: Creating ${scenario.name} and verifying AsciiDoc output`, async ({ page }) => {
        // Given: The editor is loaded
        const editor = page.locator('[contenteditable="true"]');
        const outputTextarea = page.locator('#output');
        const errors: Array<Error['stack']> = [];
        const consoleErrors: Array<string> = [];

        page.on('pageerror', error => {
          errors.push(error.stack?.slice(0, 500) || 'Unknown error');
        });

        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        await page.goto('/');

        // Clear editor
        await editor.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');

        // Input the content
        const lines = scenario.input.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) await page.keyboard.press('Enter');
          await page.keyboard.type(lines[i]);
        }

        // Select all
        await page.keyboard.press('Control+a');

        // When: User creates the appropriate list type
        if (scenario.listType === 'unordered') {
          await page.keyboard.press('Control+8');
        } else {
          await page.keyboard.press('Control+9');
        }

        // Then: AsciiDoc output matches expected complex structure
        await page.waitForTimeout(500);
        const outputValue = await outputTextarea.inputValue();
        expect(outputValue).toContain(scenario.expectedAsciiDoc);
        expect(errors).toHaveLength(0);
        expect(consoleErrors).toHaveLength(0);
      });
    }
  });
});

testWithEditor.describe('Links Feature', () => {

  testWithEditor('Scenario: User creates link via keyboard shortcut and verifies AsciiDoc output', async ({ editorPage }) => {
    // Given: The editor is loaded with content
    await editorPage.goto();

    // Clear and add test content
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Link text');

    // Select the text
    await editorPage.selectAll();

    // When: User presses Ctrl+K
    await editorPage.pressKey('Control+k');
    // Simulate entering URL and text in prompt
    await editorPage.typeInEditor('http://example.com');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Link text');
    await editorPage.pressKey('Enter');

    // Then: Editor shows link and AsciiDoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<a href="http://example.com">');
    expect(editorContent).toContain('Link text');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('http://example.com[Link text]');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: User edits link content and verifies preservation', async ({ editorPage }) => {
    // Given: The editor has a link
    await editorPage.goto();

    // Create initial link
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Original text');
    await editorPage.selectAll();
    await editorPage.pressKey('Control+k');
    await editorPage.typeInEditor('http://example.com');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Original text');
    await editorPage.pressKey('Enter');
    await editorPage.waitForSync();

    // When: User edits the link text
    await editorPage.pressKey('ArrowLeft'); // Move into link
    await editorPage.pressKey('End');
    await editorPage.typeInEditor(' edited');

    // Then: Link is updated correctly in editor and AsciiDoc output
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<a href="http://example.com">');
    expect(editorContent).toContain('Original text edited');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('http://example.com[Original text edited]');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: AsciiDoc input with links renders correctly in editor', async ({ editorPage }) => {
    // Given: The output textarea is loaded
    await editorPage.goto();

    // When: User pastes AsciiDoc with links into output
    const asciidocInput = 'http://example.com[Link Text] and http://test.com[Test Link]';
    await editorPage.pasteIntoOutput(asciidocInput);

    // Then: Editor renders the links correctly
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<a href="http://example.com">');
    expect(editorContent).toContain('Link Text');
    expect(editorContent).toContain('<a href="http://test.com">');
    expect(editorContent).toContain('Test Link');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor.describe('Parameterized Link Scenarios', () => {
    const scenarios = [
      {
        name: 'simple link',
        url: 'http://example.com',
        text: 'Example',
        expectedAsciiDoc: 'http://example.com[Example]'
      },
      {
        name: 'link with spaces',
        url: 'https://www.google.com/search?q=test',
        text: 'Google Search',
        expectedAsciiDoc: 'https://www.google.com/search?q=test[Google Search]'
      },
      {
        name: 'link without text',
        url: 'http://example.com',
        text: '',
        expectedAsciiDoc: 'http://example.com[]'
      },
      {
        name: 'link with special characters',
        url: 'http://example.com/path?param=value&other=test',
        text: 'Special Link',
        expectedAsciiDoc: 'http://example.com/path?param=value&other=test[Special Link]'
      }
    ];

    for (const scenario of scenarios) {
      test(`Scenario: Creating ${scenario.name} and verifying AsciiDoc output`, async ({ page }) => {
        // Given: The editor is loaded
        const editor = page.locator('[contenteditable="true"]');
        const outputTextarea = page.locator('#output');
        const errors: Array<Error['stack']> = [];
        const consoleErrors: Array<string> = [];

        page.on('pageerror', error => {
          errors.push(error.stack?.slice(0, 500) || 'Unknown error');
        });

        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        await page.goto('/');

        // Clear editor
        await editor.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');

        // Input the text
        if (scenario.text) {
          await page.keyboard.type(scenario.text);
          await page.keyboard.press('Control+a');
        }

        // When: User creates link via shortcut
        await page.keyboard.press('Control+k');
        await page.keyboard.type(scenario.url);
        await page.keyboard.press('Enter');
        if (scenario.text) {
          await page.keyboard.type(scenario.text);
        }
        await page.keyboard.press('Enter');

        // Then: AsciiDoc output matches expected
        await page.waitForTimeout(500);
        const outputValue = await outputTextarea.inputValue();
        expect(outputValue).toContain(scenario.expectedAsciiDoc);
        expect(errors).toHaveLength(0);
        expect(consoleErrors).toHaveLength(0);
      });
    }
  });
});

testWithEditor.describe('Code Blocks Feature', () => {

  testWithEditor('Scenario: User creates simple code block via keyboard shortcut and verifies AsciiDoc output', async ({ editorPage }) => {
    // Given: The editor is loaded with content
    await editorPage.goto();

    // Clear and add test content
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('console.log("Hello World");');

    // Select the text
    await editorPage.selectAll();

    // When: User presses Ctrl+Shift+C
    await editorPage.pressKey('Control+Shift+c');

    // Then: Editor shows code block and AsciiDoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<pre>');
    expect(editorContent).toContain('<code>');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('----');
    expect(outputValue).toContain('console.log("Hello World");');
    expect(outputValue).toContain('----');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: User edits code block content and verifies preservation', async ({ editorPage }) => {
    // Given: The editor has a code block
    await editorPage.goto();

    // Create initial code block
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('console.log("test");');
    await editorPage.selectAll();
    await editorPage.pressKey('Control+Shift+c');
    await editorPage.waitForSync();

    // When: User edits the code block content
    await editorPage.pressKey('ArrowUp'); // Move into code block
    await editorPage.pressKey('End');
    await editorPage.typeInEditor(' updated');

    // Then: Code block content is updated in editor and AsciiDoc output
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<pre>');
    expect(editorContent).toContain('console.log("test"); updated');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('console.log("test"); updated');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: AsciiDoc input with fenced code block renders correctly in editor', async ({ editorPage }) => {
    // Given: The output textarea is loaded
    await editorPage.goto();

    // When: User pastes AsciiDoc with fenced code block into output
    const asciidocInput = '----\nconsole.log("Hello World");\nconsole.log("Second line");\n----';
    await editorPage.pasteIntoOutput(asciidocInput);

    // Then: Editor renders the code block correctly
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<pre>');
    expect(editorContent).toContain('<code>');
    expect(editorContent).toContain('console.log("Hello World");');
    expect(editorContent).toContain('console.log("Second line");');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor.describe('Parameterized Code Block Scenarios', () => {
    const scenarios = [
      {
        name: 'simple code block',
        input: 'console.log("test");',
        expectedAsciiDoc: '----\nconsole.log("test");\n----'
      },
      {
        name: 'code block with language',
        input: '[source,javascript]\nconsole.log("test");',
        expectedAsciiDoc: '[source,javascript]\n----\nconsole.log("test");\n----'
      },
      {
        name: 'multiline code block',
        input: 'line 1\nline 2\nline 3',
        expectedAsciiDoc: '----\nline 1\nline 2\nline 3\n----'
      },
      {
        name: 'empty code block',
        input: '',
        expectedAsciiDoc: '----\n----'
      }
    ];

    for (const scenario of scenarios) {
      test(`Scenario: Creating ${scenario.name} and verifying AsciiDoc output`, async ({ page }) => {
        // Given: The editor is loaded
        const editor = page.locator('[contenteditable="true"]');
        const outputTextarea = page.locator('#output');
        const errors: Array<Error['stack']> = [];
        const consoleErrors: Array<string> = [];

        page.on('pageerror', error => {
          errors.push(error.stack?.slice(0, 500) || 'Unknown error');
        });

        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        await page.goto('/');

        // Clear editor
        await editor.click();
        await page.keyboard.press('Control+a');
        await page.keyboard.press('Delete');

        // Input the content
        if (scenario.input) {
          const lines = scenario.input.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (i > 0) await page.keyboard.press('Enter');
            await page.keyboard.type(lines[i]);
          }
        }

        // Select all
        await page.keyboard.press('Control+a');

        // When: User creates code block
        await page.keyboard.press('Control+Shift+c');

        // Then: AsciiDoc output matches expected
        await page.waitForTimeout(500);
        const outputValue = await outputTextarea.inputValue();
        expect(outputValue).toContain(scenario.expectedAsciiDoc);
        expect(errors).toHaveLength(0);
        expect(consoleErrors).toHaveLength(0);
      });
    }
  });
});
testWithEditor.describe('Formatting Features', () => {

  testWithEditor('Scenario: User applies H2 heading via keybinding and verifies asciidoc output', async ({ editorPage }) => {
    // Given: The editor is loaded with content
    await editorPage.goto();

    // Clear and add test content
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Test Heading');

    // Select the text
    await editorPage.selectAll();

    // When: User presses Ctrl+2
    await editorPage.pressKey('Control+2');

    // Then: Editor shows H2 heading and asciidoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<h2>');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('== Test Heading');
    expect(editorPage.hasErrors()).toBe(false);
  });


  testWithEditor('Scenario: User applies H3 heading via keybinding and verifies asciidoc output', async ({ editorPage }) => {
    // Given: The editor is loaded with content
    await editorPage.goto();

    // Clear and add test content
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Test Heading');

    // Select the text
    await editorPage.selectAll();

    // When: User presses Ctrl+3
    await editorPage.pressKey('Control+3');

    // Then: Editor shows H3 heading and asciidoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<h3>');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('=== Test Heading');
    expect(editorPage.hasErrors()).toBe(false);
  });


  testWithEditor('Scenario: User applies bold formatting via keybinding and verifies asciidoc output', async ({ editorPage }) => {
    // Given: The editor is loaded with content
    await editorPage.goto();

    // Clear and add test content
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Test text');

    // Select the text
    await editorPage.selectAll();

    // When: User presses Ctrl+B
    await editorPage.pressKey('Control+b');

    // Then: Editor shows bold text and asciidoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<strong>');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('*Test text*');
    expect(editorPage.hasErrors()).toBe(false);
  });


  testWithEditor('Scenario: User applies italic formatting via keybinding and verifies asciidoc output', async ({ editorPage }) => {
    // Given: The editor is loaded with content
    await editorPage.goto();

    // Clear and add test content
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Test text');

    // Select the text
    await editorPage.selectAll();

    // When: User presses Ctrl+I
    await editorPage.pressKey('Control+i');

    // Then: Editor shows italic text and asciidoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<em>');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('_Test text_');
    expect(editorPage.hasErrors()).toBe(false);
  });
});

testWithEditor.describe('Unordered Lists Feature', () => {
  testWithEditor('Scenario: User creates unordered list via keyboard shortcut and verifies AsciiDoc output', async ({ editorPage }) => {
    // Given: The editor is loaded with content
    await editorPage.goto();

    // Clear and add test content
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('First item');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Second item');

    // Select the content
    await editorPage.selectAll();

    // When: User presses Ctrl+8
    await editorPage.pressKey('Control+8');

    // Then: Editor shows unordered list and AsciiDoc output is correct
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ul>');
    expect(editorContent).toContain('<li>');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('* First item');
    expect(outputValue).toContain('* Second item');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: User edits unordered list by adding and modifying items', async ({ editorPage }) => {
    // Given: The editor has an unordered list
    await editorPage.goto();

    // Create initial list
    await editorPage.clickEditor();
    await editorPage.selectAll();
    await editorPage.pressKey('Delete');
    await editorPage.typeInEditor('Item 1');
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Item 2');
    await editorPage.selectAll();
    await editorPage.pressKey('Control+8');
    await editorPage.waitForSync();

    // When: User adds a new item and edits existing
    await editorPage.pressKey('End'); // Move to end of last item
    await editorPage.pressKey('Enter');
    await editorPage.typeInEditor('Item 3');
    await editorPage.pressKey('ArrowUp'); // Move to second item
    await editorPage.pressKey('End');
    await editorPage.typeInEditor(' edited');

    // Then: List is updated correctly in editor and AsciiDoc output
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ul>');
    expect(editorContent).toContain('Item 3');
    expect(editorContent).toContain('Item 2 edited');
    const outputValue = await editorPage.getOutputValue();
    expect(outputValue).toContain('* Item 1');
    expect(outputValue).toContain('* Item 2 edited');
    expect(outputValue).toContain('* Item 3');
    expect(editorPage.hasErrors()).toBe(false);
  });

  testWithEditor('Scenario: AsciiDoc input with unordered list renders correctly in editor', async ({ editorPage }) => {
    // Given: The output textarea is loaded
    await editorPage.goto();

    // When: User pastes AsciiDoc with unordered list into output
    const asciidocInput = '* First item\n* Second item\n* Third item';
    await editorPage.pasteIntoOutput(asciidocInput);

    // Then: Editor renders the unordered list correctly
    await editorPage.waitForSync();
    const editorContent = await editorPage.getEditorContent();
    expect(editorContent).toContain('<ul>');
    expect(editorContent).toContain('<li>');
    expect(editorContent).toContain('First item');
    expect(editorContent).toContain('Second item');
    expect(editorContent).toContain('Third item');
    expect(editorPage.hasErrors()).toBe(false);
  });

});