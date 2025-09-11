/**
 * ContentValidator - Utility for validating content structures and AsciiDoc output
 */

export class ContentValidator {
  /**
   * Validates that the editor content matches expected HTML structure
   */
  static validateEditorContent(content: string, expectedElements: string[]): boolean {
    if (!content || !expectedElements.length) return false;

    return expectedElements.every(element => {
      const regex = new RegExp(`<${element}[^>]*>`, 'i');
      return regex.test(content);
    });
  }

  /**
   * Validates AsciiDoc output format
   */
  static validateAsciiDocOutput(output: string, expectedPatterns: RegExp[]): boolean {
    if (!output || !expectedPatterns.length) return false;

    return expectedPatterns.every(pattern => pattern.test(output));
  }

  /**
   * Checks for content synchronization between editor and output
   */
  static validateSyncConsistency(editorContent: string, outputContent: string): boolean {
    if (!editorContent || !outputContent) return false;

    // Basic sync validation - check if key content elements are present
    const editorText = this.extractTextContent(editorContent);
    const outputText = this.extractTextContent(outputContent);

    // Allow for some formatting differences but ensure core content matches
    return this.compareContent(editorText, outputText);
  }

  /**
   * Validates list structure in editor content
   */
  static validateListStructure(content: string, listType: 'ul' | 'ol', expectedItems: number): boolean {
    const listRegex = new RegExp(`<${listType}[^>]*>`, 'gi');
    const itemRegex = /<li[^>]*>/gi;

    const listMatches = content.match(listRegex);
    if (!listMatches || listMatches.length === 0) return false;

    const itemMatches = content.match(itemRegex);
    const totalItems = itemMatches ? itemMatches.length : 0;

    return totalItems === expectedItems;
  }

  /**
   * Validates heading structure and hierarchy
   */
  static validateHeadingStructure(content: string, expectedLevels: number[]): boolean {
    const headingRegex = /<h([1-6])[^>]*>/gi;
    const matches: number[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      matches.push(parseInt(match[1]));
    }

    return expectedLevels.every((level, index) => matches[index] === level);
  }

  /**
   * Validates code block structure
   */
  static validateCodeBlock(content: string, expectedLanguage?: string): boolean {
    const codeBlockRegex = /<pre[^>]*>[\s\S]*?<code[^>]*>[\s\S]*?<\/code>[\s\S]*?<\/pre>/gi;

    if (!codeBlockRegex.test(content)) return false;

    if (expectedLanguage) {
      const languageRegex = new RegExp(`language-${expectedLanguage}`, 'i');
      return languageRegex.test(content);
    }

    return true;
  }

  /**
   * Validates paragraph structure
   */
  static validateParagraphStructure(content: string, expectedParagraphs: number): boolean {
    const paragraphRegex = /<p[^>]*>/gi;
    const matches = content.match(paragraphRegex);

    return (matches ? matches.length : 0) === expectedParagraphs;
  }

  /**
   * Checks for errors in content
   */
  static hasErrors(content: string): boolean {
    // Check for common error indicators
    const errorPatterns = [
      /error/i,
      /undefined/i,
      /null/i,
      /\[object Object\]/i
    ];

    return errorPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Validates bidirectional sync for specific content types
   */
  static validateBidirectionalSync(editorContent: string, asciidocContent: string, contentType: string): boolean {
    switch (contentType) {
      case 'heading':
        return this.validateHeadingSync(editorContent, asciidocContent);
      case 'list':
        return this.validateListSync(editorContent, asciidocContent);
      case 'code-block':
        return this.validateCodeBlockSync(editorContent, asciidocContent);
      case 'paragraph':
        return this.validateParagraphSync(editorContent, asciidocContent);
      default:
        return this.validateSyncConsistency(editorContent, asciidocContent);
    }
  }

  private static validateHeadingSync(editorContent: string, asciidocContent: string): boolean {
    const headingRegex = /<h[1-3][^>]*>/gi;
    const editorMatches = editorContent.match(headingRegex);

    const headingPattern = /^(={1,3})\s+.+$/gm;
    const asciidocMatches = asciidocContent.match(headingPattern);

    return (editorMatches ? editorMatches.length : 0) === (asciidocMatches ? asciidocMatches.length : 0);
  }

  private static validateListSync(editorContent: string, asciidocContent: string): boolean {
    const listItemRegex = /<li[^>]*>/gi;
    const editorMatches = editorContent.match(listItemRegex);

    const unorderedPattern = /^\*\s+.+$/gm;
    const orderedPattern = /^\.\s+.+$/gm;
    const unorderedMatches = asciidocContent.match(unorderedPattern);
    const orderedMatches = asciidocContent.match(orderedPattern);

    const asciidocItems = (unorderedMatches ? unorderedMatches.length : 0) +
                         (orderedMatches ? orderedMatches.length : 0);

    return (editorMatches ? editorMatches.length : 0) === asciidocItems;
  }

  private static validateCodeBlockSync(editorContent: string, asciidocContent: string): boolean {
    const codeBlockRegex = /<pre[^>]*>[\s\S]*?<code[^>]*>[\s\S]*?<\/code>[\s\S]*?<\/pre>/gi;
    const editorMatches = editorContent.match(codeBlockRegex);

    const codeBlockPattern = /```[\s\S]*?```/g;
    const asciidocMatches = asciidocContent.match(codeBlockPattern);

    return (editorMatches ? editorMatches.length : 0) === (asciidocMatches ? asciidocMatches.length : 0);
  }

  private static validateParagraphSync(editorContent: string, asciidocContent: string): boolean {
    const paragraphRegex = /<p[^>]*>/gi;
    const editorMatches = editorContent.match(paragraphRegex);

    // Count non-empty lines that aren't headings, lists, or code blocks
    const lines = asciidocContent.split('\n');
    const paragraphLines = lines.filter(line =>
      line.trim() &&
      !line.startsWith('=') &&
      !line.startsWith('*') &&
      !line.startsWith('.') &&
      !line.startsWith('```')
    );

    return (editorMatches ? editorMatches.length : 0) <= paragraphLines.length;
  }

  private static extractTextContent(content: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    return doc.body.textContent || '';
  }

  private static compareContent(content1: string, content2: string): boolean {
    // Normalize whitespace and compare
    const normalize = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase();
    return normalize(content1) === normalize(content2);
  }
}