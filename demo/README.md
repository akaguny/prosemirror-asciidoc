# AsciiDoc to ProseMirror Demo

This is an interactive demonstration of the AsciiDoc parser for ProseMirror. It showcases how AsciiDoc content is parsed into ProseMirror nodes and can be edited in real-time.

## Features

- **Real-time parsing**: AsciiDoc content is parsed into ProseMirror nodes as you type
- **Interactive editor**: Edit content directly in the ProseMirror editor
- **Multiple views**:
  - ProseMirror Editor: Visual editing interface
  - TODO: Parsed Nodes: JSON representation of the document structure
  - TODO: Serialized AsciiDoc: Round-trip serialization back to AsciiDoc format
- **Sample content**: Pre-loaded with comprehensive AsciiDoc examples
- **Responsive design**: TODO: Works on desktop and mobile devices

## AsciiDoc Features Demonstrated

The demo includes examples of:

- **Headings**: `== Level 2`, `=== Level 3`
- **Text formatting**: `*bold*`, `_italic_`, 
- TODO: **Lists**: Unordered (`*`, `**`) and ordered (`.`, `..`)
- TODO: **Code blocks**: `[source,javascript]` delimited blocks
- TODO: **Links**: `link:URL[Text]` format
- TODO: **Images**: `image:filename.png[Alt text]`
- TODO: **Blockquotes**: `____` delimited blocks
- TODO: **Horizontal rules**: `'''`

## Architecture

The demo uses:

- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript
- **ProseMirror**: Rich text editor framework
- **AsciiDoc Parser**: Custom parser using asciidoctor.js
- **Responsive CSS**: Modern styling with CSS Grid and Flexbox

## License

This demo application is part of the ProseMirror AsciiDoc plugin and follows the same license terms.