import { eq } from "prosemirror-test-builder"
import { Node } from "prosemirror-model"
import { expect, test, describe } from "vitest"

import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer, AsciiDocSerializer } from "../src/index.js"

import { doc, blockquote, h1, h2, p, hr, li, ol, ol3, ul, pre, em, strong, code, a, link, br, img } from "./build.js"

function parse(text: string, doc: Node) {
  expect(eq(defaultAsciiDocParser.parse(text), doc)).toBe(true)
}

function serialize(doc: Node, text: string) {
  expect(defaultAsciiDocSerializer.serialize(doc)).toBe(text)
}

describe("asciidoc", () => {
  test("parses a paragraph", () =>
    expect(defaultAsciiDocParser.parse("hello!")).toEqual(
      doc(p("hello!"))))

  test("parses a heading", () =>
    expect(defaultAsciiDocParser.parse("== hello!")).toEqual(
      doc(h2("hello!"))))

  test("parses relative urls", () =>
    parse("link:foo.html[foo.html]",
      doc(p(link({ href: "foo.html" }, "foo.html")))))

  test("serializes relative urls", () =>
    serialize(doc(p(link({ href: "foo.html" }, "foo.html"))),
      "link:foo.html[foo.html]"))

  test("parses a horizontal rule", () =>
    parse("one two\n\n'''\n\nthree",
      doc(p("one two"), hr(), p("three"))))

  test("serializes a horizontal rule", () =>
    serialize(doc(p("one two"), hr(), p("three")),
      "one two\n\n'''\n\nthree"))

  test("parses HTML tags", () =>
    parse("Foo < img> bar",
      doc(p("Foo < img> bar"))))

  test("serializes HTML tags", () =>
    serialize(doc(p("Foo < img> bar")),
      "Foo < img> bar"))

  test("drops nodes when all whitespace is expelled from them", () =>
    serialize(doc(p("Text with", em(" "), "an emphasized space")),
      "Text with an emphasized space"))

  test("parses code without escaping", () =>
    parse("foo`*`", doc(p("foo", code("*")))))

  test("serializes code without escaping", () =>
    serialize(doc(p("foo", code("*"))), "foo`*`"))

  test("parses underscores between word characters", () =>
    parse("abc_def", doc(p("abc_def"))))

  test("serializes underscores between word characters", () =>
    serialize(doc(p("abc_def")), "abc_def"))

  test("parses strips of underscores between word characters", () =>
    parse("abc___def", doc(p("abc___def"))))

  test("serializes strips of underscores between word characters", () =>
    serialize(doc(p("abc___def")), "abc___def"))

  test("escapes extra characters from options", () => {
    let asciidocSerializer = new AsciiDocSerializer(defaultAsciiDocSerializer.nodes,
      defaultAsciiDocSerializer.marks,
      { escapeExtraCharacters: /[\|!]/g })
    expect(asciidocSerializer.serialize(doc(p("foo|bar!")))).toBe("foo\\|bar\\!")
  })

  test("parses list markers without space after them", () =>
    parse("1.2kg", doc(p("1.2kg"))))

  test("serializes list markers without space after them", () =>
    serialize(doc(p("1.2kg")), "1.2kg"))

  test("parses ATX heading markers followed by the end of line", () =>
    parse("=", doc(p("="))))

  test("serializes ATX heading markers followed by the end of line", () =>
    serialize(doc(p("=")), "="))

  test("parses ATX heading markers without space after them", () =>
    parse("=hashtag", doc(p("=hashtag"))))

  test("serializes ATX heading markers without space after them", () =>
    serialize(doc(p("=hashtag")), "=hashtag"))

  test("parses Unicode space after ATX heading markers when escaping", () =>
    parse("=　こんにちは", doc(p("=　こんにちは"))))

  test("serializes Unicode space after ATX heading markers when escaping", () =>
    serialize(doc(p("=　こんにちは")), "=　こんにちは"))

  test("parses +++", () =>
    parse("+++", doc(p("+++"))))

  test("serializes +++", () =>
    serialize(doc(p("+++")), "+++"))

  test("parses a code block ends with empty line", () => {
    const originalText = "1\n"
    const adocText = defaultAsciiDocSerializer.serialize(doc(asciidocSchema.node("code_block", { params: "" }, [asciidocSchema.text(originalText)])))
    parse(adocText, doc(asciidocSchema.node("code_block", { params: "" }, [asciidocSchema.text(originalText)])))
  })

  test("serializes a code block ends with empty line", () => {
    const originalText = "1\n"
    const adocText = defaultAsciiDocSerializer.serialize(doc(asciidocSchema.node("code_block", { params: "" }, [asciidocSchema.text(originalText)])))
    serialize(doc(asciidocSchema.node("code_block", { params: "" }, [asciidocSchema.text(originalText)])), adocText)
  })
})
