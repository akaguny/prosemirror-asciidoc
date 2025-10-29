# prosemirror-asciidoc

## AsciiDoc Support

This fork extends the original ProseMirror Markdown plugin with full AsciiDoc support. You can now parse and serialize AsciiDoc documents using the same ProseMirror schema.

---

## 📋 Monorepo Migration Planning

Comprehensive planning documentation for migrating this project to a monorepo structure with multiple packages:

### 🚀 Quick Start
- **[MONOREPO_INDEX.md](./MONOREPO_INDEX.md)** - Navigate all planning documents
- **[MONOREPO_SUMMARY.md](./MONOREPO_SUMMARY.md)** - 5-minute overview of the plan

### 📚 Full Documentation
- **[MONOREPO_MIGRATION_PLAN.md](./MONOREPO_MIGRATION_PLAN.md)** - Complete technical migration plan
- **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** - Step-by-step implementation checklist
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - User migration guide (v1.x → v2.x)
- **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** - Visual architecture diagrams

### 🛠️ Ready-to-Use Examples
- **[monorepo-examples/](./monorepo-examples/)** - Configuration file templates for all packages

### 📦 Planned Package Structure

```
@asciidoc-prosemirror/core          - Parser & serializer (current src/)
@asciidoc-prosemirror/prosemirror   - ProseMirror plugins & utilities
@asciidoc-prosemirror/vanillajs     - Ready-to-use editor component
@asciidoc-prosemirror/demo          - Demo application (private, not published)
```

### 🎯 Benefits of Monorepo Migration

- ✅ **Modular architecture** - Use only what you need
- ✅ **Ready-to-use editor** - No need to copy code from demo
- ✅ **Better organization** - Clear separation of concerns
- ✅ **Easier maintenance** - Centralized CI/CD and configuration
- ✅ **Improved DX** - Better development experience

### ⏱️ Estimated Timeline

- **Planning & Setup**: 5-8 hours
- **Core Migration**: 4-6 hours  
- **New Packages**: 14-20 hours
- **CI/CD & Docs**: 7-10 hours
- **Testing & Release**: 6-9 hours
- **Total**: 36-53 hours

---

## Current Usage

```typescript
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from 'prosemirror-asciidoc'

// Parse AsciiDoc to ProseMirror document
const doc = defaultAsciiDocParser.parse('= My Document\n\nContent here')

// Serialize ProseMirror document to AsciiDoc
const asciidoc = defaultAsciiDocSerializer.serialize(doc)
```

## Future Usage (After Monorepo Migration)

### Option 1: Core only (minimal bundle)
```typescript
import { asciidocSchema, defaultAsciiDocParser } from '@asciidoc-prosemirror/core'
```

### Option 2: With plugins (advanced)
```typescript
import { asciidocSchema } from '@asciidoc-prosemirror/core'
import { asciiDocKeymap, asciiDocInputRules } from '@asciidoc-prosemirror/prosemirror'
```

### Option 3: Ready-to-use editor (simple)
```typescript
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'

new AsciiDocEditor({
  container: document.getElementById('editor'),
  initialContent: '= My Document',
  onChange: (content) => console.log(content)
})
```

---

## License

MIT
