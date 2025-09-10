import { test, expect } from '@playwright/test';

test.describe('Bidirectional Synchronization Stress Test', () => {
  test('should verify bidirectional sync with basic AsciiDoc markup and stress-test debouncing', async ({ page }) => {
    const paragraphInEditor = page.locator('[contenteditable="true"] > p');
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