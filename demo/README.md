# AsciiDoc to ProseMirror Demo

This is an interactive demonstration of the AsciiDoc parser for ProseMirror. It showcases how AsciiDoc content is parsed into ProseMirror nodes and can be edited in real-time.

## Features

- **Real-time parsing**: AsciiDoc content is parsed into ProseMirror nodes as you type
- **Interactive editor**: Edit content directly in the ProseMirror editor
- **Multiple views**:
  - ProseMirror Editor: Visual editing interface
  - Parsed Nodes: JSON representation of the document structure
  - Serialized AsciiDoc: Round-trip serialization back to AsciiDoc format
- **Sample content**: Pre-loaded with comprehensive AsciiDoc examples
- **Responsive design**: Works on desktop and mobile devices

## AsciiDoc Features Demonstrated

The demo includes examples of:

- **Headings**: `= Level 1`, `== Level 2`, etc.
- **Text formatting**: `*bold*`, `_italic_`, `+monospace+`
- **Lists**: Unordered (`*`, `**`) and ordered (`.`, `..`)
- **Code blocks**: `[source,javascript]` delimited blocks
- **Links**: `link:URL[Text]` format
- **Images**: `image:filename.png[Alt text]`
- **Blockquotes**: `____` delimited blocks
- **Horizontal rules**: `'''`

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

The demo uses:

- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript
- **ProseMirror**: Rich text editor framework
- **AsciiDoc Parser**: Custom parser using asciidoctor.js
- **Responsive CSS**: Modern styling with CSS Grid and Flexbox

## Integration

The demo integrates with the main AsciiDoc plugin through npm linking:

```bash
# Link the main package
npm link

# Link in demo directory
cd demo && npm link prosemirror-markdown
```

## Deployment

The demo is automatically deployed to GitHub Pages using GitHub Actions when changes are pushed to the main branch.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This demo application is part of the ProseMirror AsciiDoc plugin and follows the same license terms.