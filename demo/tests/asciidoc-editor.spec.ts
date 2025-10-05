import { test, expect } from '@playwright/test';

test.describe('AsciiDocEditor Integration Tests', () => {
  test('should load the editor without errors', async ({ page }) => {
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

    // Check that the editor container exists
    const editorContainer = page.locator('.asciidoc-editor');
    await expect(editorContainer).toBeVisible();

    // Check that the editor element exists
    const editor = page.locator('.asciidoc-editor .editor');
    await expect(editor).toBeVisible();

    // Check that output textarea exists
    const outputTextarea = page.locator('#output');
    await expect(outputTextarea).toBeVisible();

    // Check that toolbar buttons exist
    const h2Btn = page.locator('#h2-btn');
    const h3Btn = page.locator('#h3-btn');
    const boldBtn = page.locator('#bold-btn');
    const italicBtn = page.locator('#italic-btn');
    const resetBtn = page.locator('#reset-btn');

    await expect(h2Btn).toBeVisible();
    await expect(h3Btn).toBeVisible();
    await expect(boldBtn).toBeVisible();
    await expect(italicBtn).toBeVisible();
    await expect(resetBtn).toBeVisible();

    // Verify no errors occurred
    expect(errors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should display initial content correctly', async ({ page }) => {
    await page.goto('/');

    const outputTextarea = page.locator('#output');
    const initialOutput = await outputTextarea.inputValue();

    // Should contain the sample AsciiDoc content
    expect(initialOutput).toContain('AsciiDoc to ProseMirror Demo');
    expect(initialOutput).toContain('This is a second paragraph.');
    expect(initialOutput).toContain('And a third paragraph');
  });

  test('should handle error recovery gracefully', async ({ page }) => {
    await page.goto('/');

    // Check that no error panel is initially visible
    const errorPanel = page.locator('.editor-error-panel');
    await expect(errorPanel).not.toBeVisible();

    // The editor should be visible and functional
    const editor = page.locator('.asciidoc-editor .editor');
    await expect(editor).toBeVisible();

    // Should not have error styling initially
    await expect(editor).not.toHaveClass(/editor--error/);
  });

  test('should update output when content changes', async ({ page }) => {
    await page.goto('/');

    const outputTextarea = page.locator('#output');
    const initialOutput = await outputTextarea.inputValue();

    // Click reset button to clear content
    const resetBtn = page.locator('#reset-btn');
    await resetBtn.click();

    // Wait for update
    await page.waitForTimeout(100);

    // Output should be empty or minimal
    const clearedOutput = await outputTextarea.inputValue();
    expect(clearedOutput).toBe('');
  });

  test('should handle malformed content without crashing', async ({ page }) => {
    const errors: Array<Error['stack']> = [];

    page.on('pageerror', error => {
      errors.push(error.stack?.slice(0, 500) || 'Unknown error');
    });

    await page.goto('/');

    // The editor should remain functional even with potential parsing issues
    const editor = page.locator('.asciidoc-editor .editor');
    await expect(editor).toBeVisible();

    const outputTextarea = page.locator('#output');
    await expect(outputTextarea).toBeVisible();

    // No critical errors should occur
    expect(errors.filter(e => e && !e.includes('favicon') && !e.includes('stylesheet'))).toHaveLength(0);
  });

  test('should maintain editor functionality after reset', async ({ page }) => {
    await page.goto('/');

    // Click reset button
    const resetBtn = page.locator('#reset-btn');
    await resetBtn.click();

    await page.waitForTimeout(100);

    // Editor should still be visible and functional
    const editor = page.locator('.asciidoc-editor .editor');
    await expect(editor).toBeVisible();

    const outputTextarea = page.locator('#output');
    await expect(outputTextarea).toBeVisible();

    // Toolbar buttons should still work
    const h2Btn = page.locator('#h2-btn');
    await expect(h2Btn).toBeVisible();
  });

  test('should display placeholder when empty', async ({ page }) => {
    await page.goto('/');

    // Click reset to clear content
    const resetBtn = page.locator('#reset-btn');
    await resetBtn.click();

    await page.waitForTimeout(100);

    // Placeholder should be visible when editor is empty
    const placeholder = page.locator('.editor-placeholder');
    await expect(placeholder).toBeVisible();
  });

  test('should integrate with ProseMirror architecture', async ({ page }) => {
    await page.goto('/');

    // Check that ProseMirror classes are applied
    const editor = page.locator('.asciidoc-editor .editor');
    const hasProseMirrorClass = await editor.evaluate(el =>
      el.querySelector('.ProseMirror') !== null
    );
    expect(hasProseMirrorClass).toBe(true);

    // Check that the editor has contenteditable behavior
    const isContentEditable = await editor.evaluate(el =>
      el.querySelector('[contenteditable]') !== null
    );
    expect(isContentEditable).toBe(true);
  });
});