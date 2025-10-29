# AsciiDoc ProseMirror - Monorepo

> A modular AsciiDoc integration for ProseMirror with ready-to-use editor components

[![CI](https://github.com/your-org/asciidoc-prosemirror/workflows/CI/badge.svg)](https://github.com/your-org/asciidoc-prosemirror/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Packages

This monorepo contains multiple packages for different use cases:

### [@asciidoc-prosemirror/core](./packages/core)
[![npm version](https://badge.fury.io/js/%40asciidoc-prosemirror%2Fcore.svg)](https://www.npmjs.com/package/@asciidoc-prosemirror/core)

**Core parser and serializer for AsciiDoc**
- AsciiDoc parser (text → ProseMirror document)
- AsciiDoc serializer (ProseMirror document → text)
- ProseMirror schema for AsciiDoc
- Zero UI, pure data transformation

```bash
npm install @asciidoc-prosemirror/core prosemirror-model
```

### [@asciidoc-prosemirror/prosemirror](./packages/prosemirror)
[![npm version](https://badge.fury.io/js/%40asciidoc-prosemirror%2Fprosemirror.svg)](https://www.npmjs.com/package/@asciidoc-prosemirror/prosemirror)

**ProseMirror plugins and utilities**
- Input rules for AsciiDoc syntax
- Keymaps for common formatting
- Commands for AsciiDoc-specific operations
- Plugins for enhanced editing

```bash
npm install @asciidoc-prosemirror/prosemirror @asciidoc-prosemirror/core
```

### [@asciidoc-prosemirror/vanillajs](./packages/vanillajs)
[![npm version](https://badge.fury.io/js/%40asciidoc-prosemirror%2Fvanillajs.svg)](https://www.npmjs.com/package/@asciidoc-prosemirror/vanillajs)

**Ready-to-use AsciiDoc editor**
- Pre-configured editor with all features
- Simple JavaScript/TypeScript API
- Error handling and recovery
- Works with any framework (or no framework)

```bash
npm install @asciidoc-prosemirror/vanillajs
```

### [@asciidoc-prosemirror/demo](./packages/demo)

**Demo application** (not published to npm)
- Live examples
- API demonstrations
- E2E tests
- Development playground

## 🚀 Quick Start

### Using the ready-made editor

```typescript
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'

const editor = new AsciiDocEditor({
  container: document.getElementById('editor'),
  initialContent: '= Hello AsciiDoc\n\nStart writing...',
  onChange: (content) => {
    console.log('Content changed:', content)
  }
})
```

### Using core parser/serializer only

```typescript
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from '@asciidoc-prosemirror/core'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

// Parse AsciiDoc to ProseMirror document
const doc = defaultAsciiDocParser.parse('= My Document\n\nContent here')

// Create editor state
const state = EditorState.create({
  schema: asciidocSchema,
  doc
})

// Create editor view
const view = new EditorView(document.body, { state })

// Serialize back to AsciiDoc
const asciidoc = defaultAsciiDocSerializer.serialize(state.doc)
```

### Using with plugins

```typescript
import { asciidocSchema, defaultAsciiDocParser } from '@asciidoc-prosemirror/core'
import { asciiDocKeymap, asciiDocInputRules } from '@asciidoc-prosemirror/prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

const state = EditorState.create({
  schema: asciidocSchema,
  doc: defaultAsciiDocParser.parse('= Document'),
  plugins: [
    asciiDocKeymap,
    asciiDocInputRules
  ]
})

const view = new EditorView(document.body, { state })
```

## 🛠 Development

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/asciidoc-prosemirror.git
cd asciidoc-prosemirror

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start demo app
pnpm dev
```

### Project Structure

```
asciidoc-prosemirror/
├── packages/
│   ├── core/              # Core parser/serializer
│   ├── prosemirror/       # ProseMirror plugins
│   ├── vanillajs/         # Ready-to-use editor
│   └── demo/              # Demo application
├── .github/
│   └── workflows/         # CI/CD workflows
├── pnpm-workspace.yaml    # Workspace configuration
├── tsconfig.base.json     # Shared TypeScript config
└── package.json           # Root package
```

### Common Tasks

```bash
# Build specific package
pnpm --filter @asciidoc-prosemirror/core build

# Test specific package
pnpm --filter @asciidoc-prosemirror/core test

# Run tests in watch mode
pnpm --filter @asciidoc-prosemirror/core test:watch

# Build all packages except demo
pnpm build

# Build everything including demo
pnpm build:all

# Clean all build artifacts
pnpm clean

# Format code
pnpm format

# Lint code
pnpm lint
```

### Adding Dependencies

```bash
# Add dependency to specific package
pnpm --filter @asciidoc-prosemirror/core add some-package

# Add dev dependency to workspace root
pnpm add -D -w some-dev-tool

# Add workspace dependency
cd packages/vanillajs
pnpm add @asciidoc-prosemirror/core@workspace:*
```

## 📖 Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Migrating from v1.x
- [API Documentation](./docs/api.md) - Complete API reference
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Monorepo Migration Plan](./MONOREPO_MIGRATION_PLAN.md) - Technical details

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in specific package
pnpm --filter @asciidoc-prosemirror/core test

# Run E2E tests
pnpm --filter @asciidoc-prosemirror/demo test

# Run E2E tests with UI
pnpm --filter @asciidoc-prosemirror/demo test:ui
```

## 📦 Publishing

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

```bash
# Create a changeset
pnpm changeset

# Version packages (updates package.json versions)
pnpm version-packages

# Publish to npm (CI does this automatically)
pnpm release
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code of Conduct
- Development workflow
- Submitting pull requests
- Reporting bugs
- Suggesting features

## 📝 License

MIT © [Alexey Shcherbakov](https://shcherbakov.cc/)

## 🌟 Features

### Core Features
- ✅ Full AsciiDoc parsing and serialization
- ✅ CommonMark-aligned ProseMirror schema
- ✅ Extensible parser and serializer
- ✅ TypeScript support with full type definitions
- ✅ Tree-shakeable ESM modules

### Editor Features (vanillajs package)
- ✅ Pre-configured editor with sensible defaults
- ✅ Error handling and recovery
- ✅ Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)
- ✅ Placeholder support
- ✅ Read-only mode
- ✅ Content change callbacks
- ✅ Framework-agnostic API

### Plugin Features (prosemirror package)
- ✅ Input rules for AsciiDoc syntax
- ✅ Keymaps for formatting commands
- ✅ Custom commands for AsciiDoc operations
- ✅ Extensible plugin system

## 🔗 Links

- [Documentation](https://your-org.github.io/asciidoc-prosemirror)
- [npm packages](https://www.npmjs.com/org/asciidoc-prosemirror)
- [Issues](https://github.com/your-org/asciidoc-prosemirror/issues)
- [Discussions](https://github.com/your-org/asciidoc-prosemirror/discussions)

## 📊 Package Dependencies

```
@asciidoc-prosemirror/core
└── asciidoctor
└── prosemirror-model (peer)

@asciidoc-prosemirror/prosemirror
├── @asciidoc-prosemirror/core (workspace)
└── prosemirror-* (peers)

@asciidoc-prosemirror/vanillajs
├── @asciidoc-prosemirror/core (workspace)
├── @asciidoc-prosemirror/prosemirror (workspace)
└── prosemirror-* (dependencies)

@asciidoc-prosemirror/demo
└── @asciidoc-prosemirror/vanillajs (workspace)
```

## 🎯 Use Cases

### For Library Authors
Use `@asciidoc-prosemirror/core` to build your own AsciiDoc integrations without UI dependencies.

### For Application Developers
Use `@asciidoc-prosemirror/vanillajs` to quickly add a fully-featured AsciiDoc editor to your app.

### For Framework Users
All packages work with React, Vue, Angular, Svelte, or any other framework. See our [framework guides](./docs/frameworks.md).

## 💡 Examples

Check out the [examples directory](./examples) for:
- React integration
- Vue integration
- Svelte integration
- Next.js integration
- Custom plugins
- Custom schemas

## ⚡ Performance

- **Bundle size** (core): ~15KB minified + gzipped
- **Bundle size** (vanillajs): ~45KB minified + gzipped
- **Tree-shakeable**: Import only what you need
- **Zero dependencies** (except ProseMirror and Asciidoctor)

## 🔄 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a list of changes.

## 📢 Migration from v1.x

If you're upgrading from `prosemirror-asciidoc` v1.x, see our [Migration Guide](./MIGRATION_GUIDE.md) for step-by-step instructions.
