# prosemirror-asciidoc

## AsciiDoc Support

This fork extends the original ProseMirror Markdown plugin with full AsciiDoc support. You can now parse and serialize AsciiDoc documents using the same ProseMirror schema.

---

## 📋 Monorepo Migration Planning

Documentation for migrating this project to a monorepo structure:

- **[RFC1-monorepo.md](./RFC1-monorepo.md)** - RFC предложение перехода на монорепозиторий
- **[CTONEW1-instruction.md](./CTONEW1-instruction.md)** - Пошаговая инструкция для реализации

### Ready-to-Use Configuration Examples
- **[monorepo-examples/](./monorepo-examples/)** - Готовые конфигурационные файлы для всех пакетов

---

## Current Usage

```typescript
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from 'prosemirror-asciidoc'

const doc = defaultAsciiDocParser.parse('= My Document\n\nContent here')
const asciidoc = defaultAsciiDocSerializer.serialize(doc)
```

## License

MIT
