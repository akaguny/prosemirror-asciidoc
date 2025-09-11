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
    - paragraph [ref=e15]: "* [Link](https://example.com) in list"
    - paragraph [ref=e16]: "** *Bold* [link](https://test.com) with _italic_"
    - paragraph [ref=e17]: "*** `Code` and [reference](#anchor) formatting"
  - textbox [ref=e18]: "\\* \\[Link\\](https://example.com) in list \\*\\* \\*Bold\\* \\[link\\](https://test.com) with \\_italic\\_ \\*\\*\\* \\`Code\\` and \\[reference\\](#anchor) formatting"
```