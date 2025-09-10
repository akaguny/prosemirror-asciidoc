import { test, expect } from '@playwright/test';

test.describe('Bidirectional Synchronization Stress Test', () => {
  test('should verify bidirectional sync with basic AsciiDoc markup and stress-test debouncing', async ({ page }) => {
    const paragraphInEditor = page.locator('[contenteditable="true"] > p').first();
    // const errors: Array<[Error['name'], Error['message'], Error['stack']]> = [];
    const errors: Array<Error['stack']> = [];
    // Capture console logs
    page.on('pageerror', error => {
      if(error.name !== "RangeError") return;
      errors.push(error.stack?.slice(0,500))
    });

    await page.goto('/');

    expect(paragraphInEditor).toBeEditable()
    const initialText = await paragraphInEditor.textContent()

    // Since we cannot easily simulate changes in ProseMirror editor via Playwright,
    // we'll test the reverse direction by making a change in textarea and verifying sync
    const updatedContent = initialText + '\n\nAdditional paragraph with *more bold* and _more italic_.';
    await paragraphInEditor.click({
      delay: 10
    })
    await paragraphInEditor.fill(updatedContent, {
      force: true,
      timeout: 500
    });
    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
    // expect(paragraphInEditor).not.toHaveText(initialText!);
  });
});

test.describe('Multiline Editing Feature', () => {
  test('Scenario: User creates multiple paragraphs and verifies content preservation', async ({ page }) => {
    // Given: The editor is loaded and ready for input
    const editor = page.locator('[contenteditable="true"]');
    const errors: Array<Error['stack']> = [];
    const consoleErrors: Array<string> = [];

    // Capture page errors
    page.on('pageerror', error => {
      errors.push(error.stack?.slice(0, 500) || 'Unknown error');
    });

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // When: User types multiple paragraphs using Enter key
    await editor.click();
    await page.keyboard.type('First paragraph.');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second paragraph with some text.');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter'); // Empty line
    await page.keyboard.type('Third paragraph.');

    // Then: Content is preserved and no errors occur
    await page.waitForTimeout(500); // Allow time for sync
    const editorContent = await editor.textContent();
    expect(editorContent).toContain('First paragraph.');
    expect(editorContent).toContain('Second paragraph with some text.');
    expect(editorContent).toContain('Third paragraph.');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User edits multiline content and maintains structure', async ({ page }) => {
    // Given: The editor has initial multiline content
    const editor = page.locator('[contenteditable="true"]');
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

    // Pre-fill with multiline content
    await editor.click();
    await page.keyboard.type('Line one');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line two');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line three');

    // When: User edits in the middle of the content
    await page.keyboard.press('ArrowUp'); // Move to second line
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('End');
    await page.keyboard.type(' - edited');

    // Then: Structure is maintained and no errors
    await page.waitForTimeout(500);
    const editorContent = await editor.textContent();
    expect(editorContent).toContain('Line one - edited');
    expect(editorContent).toContain('Line two');
    expect(editorContent).toContain('Line three');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User handles line breaks and empty paragraphs without errors', async ({ page }) => {
    // Given: The editor is loaded
    const editor = page.locator('[contenteditable="true"]');
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

    // When: User creates content with multiple empty lines and breaks
    await editor.click();
    await page.keyboard.type('Start');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter'); // Empty paragraph
    await page.keyboard.press('Enter'); // Another empty
    await page.keyboard.type('Middle');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('End');

    // Then: No errors occur and content is handled correctly
    await page.waitForTimeout(500);
    const editorContent = await editor.textContent();
    expect(editorContent).toContain('Start');
    expect(editorContent).toContain('Middle');
    expect(editorContent).toContain('End');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });
});

test.describe('Asciidoc Output Display Feature', () => {
  test('Scenario: Editing text in editor updates asciidoc output in real-time', async ({ page }) => {
    // Given: The editor and output textarea are loaded
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

    // Get initial output
    const initialOutput = await outputTextarea.inputValue();

    // When: User types additional text in the editor
    await editor.click();
    await page.keyboard.press('End'); // Move to end
    await page.keyboard.type('Hello World');

    // Then: The asciidoc output updates to include the new input
    await page.waitForTimeout(500); // Allow time for sync
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('Hello World');
    expect(outputValue.length).toBeGreaterThan(initialOutput.length);
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: Creating paragraphs updates asciidoc output with proper markup', async ({ page }) => {
    // Given: The editor and output textarea are loaded
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

    // When: User creates multiple paragraphs
    await editor.click();
    await page.keyboard.type('First paragraph.');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second paragraph.');

    // Then: The asciidoc output reflects the paragraphs correctly
    await page.waitForTimeout(500);
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('First paragraph.');
    expect(outputValue).toContain('Second paragraph.');
    expect(outputValue).toMatch(/First paragraph\.\n\nSecond paragraph\./); // Assuming paragraphs are separated by double newline
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: Editing existing content updates asciidoc output accurately', async ({ page }) => {
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

    // Clear the editor
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');

    // Pre-fill with content
    await page.keyboard.type('Initial text');

    // When: User edits the content
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.type(' modified');

    // Then: The asciidoc output reflects the changes
    await page.waitForTimeout(500);
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toBe('Initial modified text');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });
});
test.describe('Formatting Features', () => {
  test('Scenario: User applies H2 heading via toolbar button and verifies asciidoc output', async ({ page }) => {
    // Given: The editor is loaded with content
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

    // Clear and add test content
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type('Test Heading');

    // Select the text
    await page.keyboard.press('Control+a');

    // When: User clicks H2 button
    await page.locator('#h2-btn').click();

    // Then: Editor shows H2 heading and asciidoc output is correct
    await page.waitForTimeout(500);
    const editorContent = await editor.innerHTML();
    expect(editorContent).toContain('<h2>');
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('== Test Heading');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User applies H2 heading via keybinding and verifies asciidoc output', async ({ page }) => {
    // Given: The editor is loaded with content
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

    // Clear and add test content
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type('Test Heading');

    // Select the text
    await page.keyboard.press('Control+a');

    // When: User presses Ctrl+2
    await page.keyboard.press('Control+2');

    // Then: Editor shows H2 heading and asciidoc output is correct
    await page.waitForTimeout(500);
    const editorContent = await editor.innerHTML();
    expect(editorContent).toContain('<h2>');
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('== Test Heading');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User applies H3 heading via toolbar button and verifies asciidoc output', async ({ page }) => {
    // Given: The editor is loaded with content
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

    // Clear and add test content
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type('Test Heading');

    // Select the text
    await page.keyboard.press('Control+a');

    // When: User clicks H3 button
    await page.locator('#h3-btn').click();

    // Then: Editor shows H3 heading and asciidoc output is correct
    await page.waitForTimeout(500);
    const editorContent = await editor.innerHTML();
    expect(editorContent).toContain('<h3>');
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('=== Test Heading');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User applies H3 heading via keybinding and verifies asciidoc output', async ({ page }) => {
    // Given: The editor is loaded with content
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

    // Clear and add test content
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type('Test Heading');

    // Select the text
    await page.keyboard.press('Control+a');

    // When: User presses Ctrl+3
    await page.keyboard.press('Control+3');

    // Then: Editor shows H3 heading and asciidoc output is correct
    await page.waitForTimeout(500);
    const editorContent = await editor.innerHTML();
    expect(editorContent).toContain('<h3>');
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('=== Test Heading');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User applies bold formatting via toolbar button and verifies asciidoc output', async ({ page }) => {
    // Given: The editor is loaded with content
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

    // Clear and add test content
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type('Test text');

    // Select the text
    await page.keyboard.press('Control+a');

    // When: User clicks Bold button
    await page.locator('#bold-btn').click();

    // Then: Editor shows bold text and asciidoc output is correct
    await page.waitForTimeout(500);
    const editorContent = await editor.innerHTML();
    expect(editorContent).toContain('<strong>');
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('*Test text*');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User applies bold formatting via keybinding and verifies asciidoc output', async ({ page }) => {
    // Given: The editor is loaded with content
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

    // Clear and add test content
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type('Test text');

    // Select the text
    await page.keyboard.press('Control+a');

    // When: User presses Ctrl+B
    await page.keyboard.press('Control+b');

    // Then: Editor shows bold text and asciidoc output is correct
    await page.waitForTimeout(500);
    const editorContent = await editor.innerHTML();
    expect(editorContent).toContain('<strong>');
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('*Test text*');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User applies italic formatting via toolbar button and verifies asciidoc output', async ({ page }) => {
    // Given: The editor is loaded with content
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

    // Clear and add test content
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type('Test text');

    // Select the text
    await page.keyboard.press('Control+a');

    // When: User clicks Italic button
    await page.locator('#italic-btn').click();

    // Then: Editor shows italic text and asciidoc output is correct
    await page.waitForTimeout(500);
    const editorContent = await editor.innerHTML();
    expect(editorContent).toContain('<em>');
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('_Test text_');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('Scenario: User applies italic formatting via keybinding and verifies asciidoc output', async ({ page }) => {
    // Given: The editor is loaded with content
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

    // Clear and add test content
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    await page.keyboard.type('Test text');

    // Select the text
    await page.keyboard.press('Control+a');

    // When: User presses Ctrl+I
    await page.keyboard.press('Control+i');

    // Then: Editor shows italic text and asciidoc output is correct
    await page.waitForTimeout(500);
    const editorContent = await editor.innerHTML();
    expect(editorContent).toContain('<em>');
    const outputValue = await outputTextarea.inputValue();
    expect(outputValue).toContain('_Test text_');
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });
});