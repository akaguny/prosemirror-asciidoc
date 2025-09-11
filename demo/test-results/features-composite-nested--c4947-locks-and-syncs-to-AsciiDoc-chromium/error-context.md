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
    - paragraph [ref=e15]: ". Step 1: Setup"
    - paragraph [ref=e16]
    - paragraph [ref=e17]: "[source,bash]"
    - paragraph [ref=e18]: "----"
    - paragraph [ref=e19]: npm install
    - paragraph [ref=e20]: "----"
    - paragraph [ref=e21]
    - paragraph [ref=e22]: ". Step 2: Run code"
    - paragraph [ref=e23]
    - paragraph [ref=e24]: "[source,javascript]"
    - paragraph [ref=e25]: "----"
    - paragraph [ref=e26]: console.log("Running");
    - paragraph [ref=e27]: "----"
    - paragraph [ref=e28]
    - paragraph [ref=e29]: ". Step 3: Verify"
  - textbox [ref=e30]: ". Step 1: Setup \\[source,bash\\] \\---- npm install \\---- . Step 2: Run code \\[source,javascript\\] \\---- console.log(\"Running\"); \\---- . Step 3: Verify"
```