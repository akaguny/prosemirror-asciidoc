import { Page, Locator } from '@playwright/test';

export class EditorPage {
  private page: Page;
  private editor: Locator;
  private outputTextarea: Locator;
  private errors: string[] = [];
  private consoleErrors: string[] = [];

  constructor(page: Page) {
    this.page = page;
    this.editor = page.locator('[contenteditable="true"]');
    this.outputTextarea = page.locator('#output');

    // Setup error capturing
    page.on('pageerror', error => {
      if (error.name !== "RangeError") return;
      this.errors.push(error.stack?.slice(0, 500) || 'Unknown error');
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickEditor() {
    await this.editor.click();
  }

  async typeInEditor(text: string) {
    await this.page.keyboard.type(text);
  }

  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  async selectAll() {
    await this.page.keyboard.press('Control+a');
  }

  async clearEditor() {
    await this.clickEditor();
    await this.selectAll();
    await this.pressKey('Delete');
  }

  async typeText(text: string) {
    await this.clickEditor();
    await this.clearEditor();
    await this.typeInEditor(text);
  }

  async typeMultilineText(lines: string[]) {
    await this.clickEditor();
    await this.clearEditor();
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) await this.pressKey('Enter');
      await this.typeInEditor(lines[i]);
    }
  }

  async applyShortcut(shortcut: string) {
    await this.selectAll();
    await this.pressKey(shortcut);
  }

  async getEditorContent() {
    return await this.editor.innerHTML();
  }

  async getOutputValue() {
    return await this.outputTextarea.inputValue();
  }

  async waitForSync() {
    await this.page.waitForTimeout(50); // Reduced from 500 for speed
  }

  async pasteIntoOutput(text: string) {
    await this.outputTextarea.click();
    await this.selectAll();
    await this.pressKey('Delete');
    await this.page.keyboard.type(text);
  }

  getErrors() {
    return this.errors;
  }

  getConsoleErrors() {
    return this.consoleErrors;
  }

  hasErrors() {
    return this.errors.length > 0 || this.consoleErrors.length > 0;
  }

  async moveCursor(direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'End' | 'Home') {
    await this.pressKey(direction);
  }

  async editAtCursor(text: string) {
    await this.typeInEditor(text);
  }

  // Enhanced methods for feature testing

  async applyBold() {
    await this.selectAll();
    await this.pressKey('Control+b');
  }

  async applyItalic() {
    await this.selectAll();
    await this.pressKey('Control+i');
  }

  async createHeading(level: number) {
    await this.selectAll();
    await this.pressKey(`Control+${level}`);
  }

  async createUnorderedList() {
    await this.selectAll();
    await this.pressKey('Control+8');
  }

  async createOrderedList() {
    await this.selectAll();
    await this.pressKey('Control+9');
  }

  async createCodeBlock() {
    await this.selectAll();
    await this.pressKey('Control+Shift+c');
  }

  async createLink(url: string, text: string) {
    await this.typeInEditor(text);
    await this.selectAll();
    await this.pressKey('Control+k');
    await this.typeInEditor(url);
    await this.pressKey('Enter');
    await this.typeInEditor(text);
    await this.pressKey('Enter');
  }

  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async getTextContent(): Promise<string> {
    return await this.editor.textContent() || '';
  }

  async isElementVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async getElementText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  async getEditorSelection(): Promise<string> {
    return await this.page.evaluate(() => {
      const selection = window.getSelection();
      return selection?.toString() || '';
    });
  }

  // Toolbar button methods
  async clickBoldButton() {
    await this.page.locator('#bold-btn').click();
    await this.waitForSync();
  }

  async clickItalicButton() {
    await this.page.locator('#italic-btn').click();
    await this.waitForSync();
  }

  async clickLinkButton(url?: string, text?: string) {
    // Handle the prompts that appear when clicking the link button
    if (url && text) {
      this.page.once('dialog', async dialog => {
        await dialog.accept(url);
        this.page.once('dialog', async dialog => {
          await dialog.accept(text);
        });
      });
    }
    await this.page.locator('#link-btn').click();
    await this.waitForSync();
  }

  async clickLinkButtonAndCancel() {
    // Handle cancellation of link button prompts
    this.page.once('dialog', async dialog => {
      await dialog.dismiss();
    });
    await this.page.locator('#link-btn').click();
    await this.waitForSync();
  }

  async clickHeadingButton(level: 2 | 3) {
    await this.page.locator(`#h${level}-btn`).click();
    await this.waitForSync();
  }

  async clickUnorderedListButton() {
    await this.page.locator('#ul-btn').click();
    await this.waitForSync();
  }

  async clickOrderedListButton() {
    await this.page.locator('#ol-btn').click();
    await this.waitForSync();
  }

  async clickCodeBlockButton() {
    await this.page.locator('#code-btn').click();
    await this.waitForSync();
  }
}