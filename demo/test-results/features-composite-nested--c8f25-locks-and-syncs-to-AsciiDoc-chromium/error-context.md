# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - button "H2" [ref=e5] [cursor=pointer]
    - button "H3" [ref=e6] [cursor=pointer]
    - button "UL" [ref=e7] [cursor=pointer]
    - button "OL" [ref=e8] [cursor=pointer]
    - button "Code" [ref=e9] [cursor=pointer]
    - button "Bold" [ref=e10] [cursor=pointer]
    - button "Italic" [ref=e11] [cursor=pointer]
    - button "Link" [ref=e12] [cursor=pointer]
  - generic [active] [ref=e14]:
    - paragraph [ref=e15]: "* First item with text"
    - paragraph [ref=e16]: "* Second item with code:"
    - paragraph [ref=e17]
    - paragraph [ref=e18]: "[source,javascript]"
    - paragraph [ref=e19]: "----"
    - paragraph [ref=e20]: "function example() {"
    - paragraph [ref=e21]: return true;
    - paragraph [ref=e22]: "}"
    - paragraph [ref=e23]: "----"
    - paragraph [ref=e24]
    - paragraph [ref=e25]: "* Third item after code"
  - textbox [ref=e26]: "\\* First item with text \\* Second item with code: \\[source,javascript\\] \\---- function example() { return true; } \\---- \\* Third item after code"
```