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
    - paragraph [ref=e15]: = Main Document
    - paragraph [ref=e16]
    - paragraph [ref=e17]: "* Section 1"
    - paragraph [ref=e18]: "** Subsection 1.1"
    - paragraph [ref=e19]: "*** Content with *bold* text"
    - paragraph [ref=e20]
    - paragraph [ref=e21]: "[source,javascript]"
    - paragraph [ref=e22]: "----"
    - paragraph [ref=e23]: console.log("nested code");
    - paragraph [ref=e24]: "----"
    - paragraph [ref=e25]
    - paragraph [ref=e26]: "[edited]*** More content"
    - paragraph [ref=e27]: "** Subsection 1.2"
    - paragraph [ref=e28]: "* Section 2"
    - paragraph [ref=e29]: "** Subsection 2.1"
    - paragraph [ref=e30]: "*** Final content with _italic_"
  - textbox [ref=e31]: = Main Document \* Section 1 \*\* Subsection 1.1 \*\*\* Content with \*bold\* text \[source,javascript\] \---- console.log("nested code"); \---- \[edited\]\*\*\* More content \*\* Subsection 1.2 \* Section 2 \*\* Subsection 2.1 \*\*\* Final content with \_italic\_
```