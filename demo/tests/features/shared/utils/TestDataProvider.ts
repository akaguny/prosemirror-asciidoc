/**
 * TestDataProvider - Provides test data for various scenarios
 */

export class TestDataProvider {
  /**
   * Provides sample AsciiDoc content for testing
   */
  static getSampleAsciiDoc(): string {
    return `= Document Title

This is a sample paragraph with some *bold* and _italic_ text.

== Section Header

* Item 1
* Item 2
  ** Nested item
* Item 3

. Ordered list
. Another item
. Third item

[source,javascript]
----
function hello() {
  console.log("Hello, World!");
}
----

=== Subsection

Another paragraph here.

==== Sub-subsection

Final paragraph.`;
  }

  /**
   * Provides test data for specific features
   */
  static getFeatureTestData(feature: string): any {
    const data = {
      lists: {
        unordered: {
          basic: ['Item 1', 'Item 2', 'Item 3'],
          nested: ['Item 1', 'Item 2', ['Nested A', 'Nested B'], 'Item 3'],
          complex: ['First item', 'Second item with *bold* text', 'Third item']
        },
        ordered: {
          basic: ['First', 'Second', 'Third'],
          nested: ['Item 1', 'Item 2', ['Sub 1', 'Sub 2'], 'Item 3'],
          complex: ['Step 1: Do something', 'Step 2: Do another thing', 'Step 3: Final step']
        }
      },
      codeBlocks: {
        basic: 'console.log("Hello");',
        multiline: `function test() {
  return true;
}`,
        languageSpecific: {
          javascript: `function hello(name) {
  console.log(\`Hello, \${name}!\`);
}`,
          python: `def greet(name):
    print(f"Hello, {name}!")`,
          java: `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
        }
      },
      paragraphs: {
        basic: 'This is a simple paragraph.',
        multiline: ['This is the first line.', 'This is the second line.', 'This is the third line.'],
        formatted: 'This paragraph has *bold* and _italic_ text.',
        empty: ''
      },
      headings: {
        h1: 'Main Title',
        h2: 'Section Title',
        h3: 'Subsection Title',
        hierarchy: ['Document Title', 'First Section', 'First Subsection', 'Second Section']
      }
    };
    return data[feature] || {};
  }

  /**
   * Provides edge case test data
   */
  static getEdgeCaseData(): string[] {
    return [
      '', // Empty string
      '   ', // Whitespace only
      '\n\n\n', // Multiple newlines
      'Very long text that exceeds normal content length and should test how the system handles extended content that might cause performance issues or rendering problems in the editor interface.',
      'Text with special characters: !@#$%^&*()[]{}|;:,.<>?',
      'Unicode characters: 你好世界 🌍 αβγδε',
      'Text with\nmultiple\nline\nbreaks',
      'Text with\ttabs\tand\tspaces',
      'Text with "quotes" and \'apostrophes\'',
      'Text with <html> tags </html>',
      'Text with [[links]] and ((references))'
    ];
  }

  /**
   * Provides bidirectional sync test data
   */
  static getBidirectionalTestData(): { editor: string, asciidoc: string }[] {
    return [
      {
        editor: 'Simple paragraph',
        asciidoc: 'Simple paragraph\n'
      },
      {
        editor: '<h1>Main Title</h1>',
        asciidoc: '= Main Title\n'
      },
      {
        editor: '<ul><li>Item 1</li><li>Item 2</li></ul>',
        asciidoc: '* Item 1\n* Item 2\n'
      },
      {
        editor: '<ol><li>First</li><li>Second</li></ol>',
        asciidoc: '. First\n. Second\n'
      },
      {
        editor: '<pre><code>code block</code></pre>',
        asciidoc: '```\ncode block\n```\n'
      }
    ];
  }
}