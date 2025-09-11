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
    - paragraph [ref=e15]: "* Level 1: *Bold* text"
    - paragraph [ref=e16]: "** Level 2: _Italic_ and `code`"
    - paragraph [ref=e17]: "*** Level 3: *_Bold italic_* combination"
    - paragraph [ref=e18]: "**** Level 4: `Code` with **bold**"
    - paragraph [ref=e19]: "***** Level 5: _Italic_ with `code` and *bold*"
  - textbox [ref=e20]: "\\* Level 1: \\*Bold\\* text \\*\\* Level 2: \\_Italic\\_ and \\`code\\` \\*\\*\\* Level 3: \\*\\_Bold italic\\_\\* combination \\*\\*\\*\\* Level 4: \\`Code\\` with \\*\\*bold\\*\\* \\*\\*\\*\\*\\* Level 5: \\_Italic\\_ with \\`code\\` and \\*bold\\*"
```