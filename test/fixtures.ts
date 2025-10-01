import { doc, blockquote, h1, h2, p, hr, li, ol, ul, pre, em, strong, code, a, link } from "./build"
import type { TestFixtures, AsciiDocTestCase } from "./types"

/**
 * Common test fixtures for reuse across tests
 */
export const fixtures: TestFixtures = {
  basicDoc: doc(
    h1("Sample Document"),
    p("A basic paragraph.")
  ),

  complexDoc: doc(
    h1("Complex Document"),
    p("Introduction paragraph with ", strong("bold"), " and ", em("italic"), " text."),
    h2("Section 1"),
    ul(
      li(p("First item")),
      li(p("Second item with ", code("code")))
    ),
    blockquote(p("A quoted text block")),
    hr()
  ),

  nestedDoc: doc(
    h1("Nested Document"),
    ul(
      li(p("Level 1 item"),
        ul(
          li(p("Level 2 item"),
            ul(
              li(p("Level 3 item"))
            ))
        )),
      li(p("Another level 1 item"))
    ),
    ol(
      li(p("Ordered list item 1"),
        ol(
          li(p("Nested ordered item"))
        ))
    )
  )
}

// Test case collections
export const basicTestCases: AsciiDocTestCase[] = [
  {
    description: "parses basic paragraph",
    input: "Hello world",
    expected: doc(p("Hello world"))
  },
  {
    description: "parses heading level 1",
    input: "= Title",
    expected: doc(h1("Title"))
  },
  {
    description: "parses heading level 2",
    input: "== Section",
    expected: doc(h2("Section"))
  },
  {
    description: "parses blockquote",
    input: "____\nQuoted text\n____",
    expected: doc(blockquote(p("Quoted text")))
  },
  {
    description: "parses horizontal rule",
    input: "'''\n",
    expected: doc(hr())
  }
]

export const nestedTestCases: AsciiDocTestCase[] = [
  {
    description: "parses unordered list",
    input: "* First\n* Second",
    expected: doc(ul(
      li(p("First")),
      li(p("Second"))
    ))
  },
  {
    description: "parses ordered list",
    input: ". First\n. Second",
    expected: doc(ol(
      li(p("First")),
      li(p("Second"))
    ))
  },
  {
    description: "parses nested list",
    input: "* Level 1\n** Level 2\n*** Level 3",
    expected: doc(ul(
      li(p("Level 1"),
        ul(
          li(p("Level 2"),
            ul(
              li(p("Level 3"))
            ))
        ))
    ))
  }
]

export const inlineFormattingCases: AsciiDocTestCase[] = [
  {
    description: "parses strong text",
    input: "Some *bold* text",
    expected: doc(p("Some ", strong("bold"), " text"))
  },
  {
    description: "parses emphasized text",
    input: "Some _italic_ text",
    expected: doc(p("Some ", em("italic"), " text"))
  },
  {
    description: "parses code",
    input: "Some `code` text",
    expected: doc(p("Some ", code("code"), " text"))
  },
  {
    description: "parses link",
    input: "link:https://example.com[Example]",
    expected: doc(p(link({ href: "https://example.com" }, "Example")))
  }
]

export const specialCases: AsciiDocTestCase[] = [
  {
    description: "handles special characters in text",
    input: "Text with *asterisks* and _underscores_",
    expected: doc(p("Text with ", strong("asterisks"), " and ", em("underscores")))
  },
  {
    description: "handles escaped characters",
    input: "\\*not bold\\* and \\_not italic\\_",
    expected: doc(p("*not bold* and _not italic_"))
  },
  {
    description: "handles mixed inline formatting",
    input: "*bold _and italic_*",
    expected: doc(p(strong("bold ", em("and italic"))))
  }
]

// Group all test cases for easier access
export const testCases = {
  block: basicTestCases,
  list: nestedTestCases,
  inline: inlineFormattingCases,
  special: specialCases
}