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
    - paragraph [ref=e15]: "* Branch A"
    - paragraph [ref=e16]: "** Branch A1"
    - paragraph [ref=e17]: "*** Branch A1a"
    - paragraph [ref=e18]: "*** Branch A1b"
    - paragraph [ref=e19]: "** Branch A2"
    - paragraph [ref=e20]: "* Branch B"
    - paragraph [ref=e21]: "** Branch B1"
    - paragraph [ref=e22]: "*** Branch B1a"
    - paragraph [ref=e23]: "**** Branch B1a1"
  - textbox [ref=e24]: \* Branch A \*\* Branch A1 \*\*\* Branch A1a \*\*\* Branch A1b \*\* Branch A2 \* Branch B \*\* Branch B1 \*\*\* Branch B1a \*\*\*\* Branch B1a1
```