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
    - paragraph [ref=e15]: "* Parent item"
    - paragraph [ref=e16]: "** Child with `inline code`"
    - paragraph [ref=e17]: "** Child with block code:"
    - paragraph [ref=e18]
    - paragraph [ref=e19]: "[source,python]"
    - paragraph [ref=e20]: "----"
    - paragraph [ref=e21]: "def hello():"
    - paragraph [ref=e22]: print("Hello")
    - paragraph [ref=e23]: "----"
    - paragraph [ref=e24]
    - paragraph [ref=e25]: "*** Grandchild item"
  - textbox [ref=e26]: "\\* Parent item \\*\\* Child with \\`inline code\\` \\*\\* Child with block code: \\[source,python\\] \\---- def hello(): print(\"Hello\") \\---- \\*\\*\\* Grandchild item"
```