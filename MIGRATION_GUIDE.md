# Руководство по миграции на монорепозиторий

## Для пользователей библиотеки

### Миграция с `prosemirror-asciidoc` на `@asciidoc-prosemirror/*`

#### Вариант 1: Использование только core функциональности

**Было:**
```typescript
import { 
  asciidocSchema, 
  defaultAsciiDocParser, 
  defaultAsciiDocSerializer 
} from 'prosemirror-asciidoc'
```

**Стало:**
```typescript
import { 
  asciidocSchema, 
  defaultAsciiDocParser, 
  defaultAsciiDocSerializer 
} from '@asciidoc-prosemirror/core'
```

**Обновление package.json:**
```diff
{
  "dependencies": {
-   "prosemirror-asciidoc": "^1.13.2"
+   "@asciidoc-prosemirror/core": "^2.0.0"
  }
}
```

#### Вариант 2: Использование готового редактора

**Было (demo/пример):**
```typescript
// Весь код AsciiDocEditor копировался вручную
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { asciidocSchema } from 'prosemirror-asciidoc'
// ... много кода настройки
```

**Стало:**
```typescript
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'

const editor = new AsciiDocEditor({
  container: document.getElementById('editor'),
  initialContent: '= Hello AsciiDoc\n\nContent here...',
  onChange: (content) => {
    console.log('New content:', content)
  },
  placeholder: 'Start writing...',
  readOnly: false
})
```

**Обновление package.json:**
```diff
{
  "dependencies": {
-   "prosemirror-asciidoc": "^1.13.2",
-   "prosemirror-state": "^1.4.3",
-   "prosemirror-view": "^1.41.0",
-   "prosemirror-keymap": "^1.2.2",
-   "prosemirror-commands": "^1.6.2"
+   "@asciidoc-prosemirror/vanillajs": "^2.0.0"
  }
}
```

#### Вариант 3: Использование расширенной функциональности

**Стало:**
```typescript
import { asciidocSchema, defaultAsciiDocParser } from '@asciidoc-prosemirror/core'
import { asciiDocKeymap, asciiDocInputRules } from '@asciidoc-prosemirror/prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

const state = EditorState.create({
  schema: asciidocSchema,
  doc: defaultAsciiDocParser.parse('= Title'),
  plugins: [
    asciiDocKeymap,
    asciiDocInputRules
  ]
})

const view = new EditorView(document.body, { state })
```

**Обновление package.json:**
```json
{
  "dependencies": {
    "@asciidoc-prosemirror/core": "^2.0.0",
    "@asciidoc-prosemirror/prosemirror": "^2.0.0",
    "prosemirror-state": "^1.4.3",
    "prosemirror-view": "^1.41.0"
  }
}
```

---

## Для разработчиков библиотеки

### Настройка окружения разработки

1. **Установить pnpm** (если еще не установлен):
```bash
npm install -g pnpm
```

2. **Клонировать репозиторий**:
```bash
git clone https://github.com/your-org/asciidoc-prosemirror.git
cd asciidoc-prosemirror
```

3. **Установить зависимости**:
```bash
pnpm install
```

4. **Собрать все пакеты**:
```bash
pnpm build
```

5. **Запустить demo**:
```bash
pnpm dev
```

6. **Запустить тесты**:
```bash
pnpm test
```

### Workflow разработки

#### Работа над пакетом core

```bash
# Перейти в директорию пакета
cd packages/core

# Внести изменения
# ...

# Запустить тесты
pnpm test

# Собрать пакет
pnpm build
```

#### Работа над несколькими пакетами

```bash
# Из корня монорепозитория

# Собрать все пакеты
pnpm build

# Запустить тесты во всех пакетах
pnpm test

# Запустить тесты только в core
pnpm --filter @asciidoc-prosemirror/core test

# Собрать только vanillajs и его зависимости
pnpm --filter @asciidoc-prosemirror/vanillajs build
```

#### Добавление новой зависимости

```bash
# Добавить зависимость в конкретный пакет
pnpm --filter @asciidoc-prosemirror/core add some-package

# Добавить dev зависимость в корень
pnpm add -D -w some-dev-tool

# Добавить workspace зависимость
cd packages/vanillajs
pnpm add @asciidoc-prosemirror/core@workspace:*
```

### Публикация новых версий

#### Ручная публикация

```bash
# 1. Обновить версии в package.json каждого пакета

# 2. Собрать все пакеты
pnpm build

# 3. Запустить тесты
pnpm test

# 4. Опубликовать (исключая demo)
pnpm -r --filter='!@asciidoc-prosemirror/demo' publish
```

#### Автоматическая публикация с changesets

```bash
# 1. Добавить changeset
pnpm changeset

# 2. Выбрать измененные пакеты и тип изменения (major/minor/patch)

# 3. Закоммитить changeset
git add .changeset
git commit -m "chore: add changeset"

# 4. CI автоматически создаст PR с обновлением версий

# 5. После мерджа PR, CI опубликует пакеты автоматически
```

---

## Обратная совместимость

### Пакет-алиас для совместимости

Чтобы обеспечить плавную миграцию, можно создать пакет `prosemirror-asciidoc` версии 2.0.0, который реэкспортирует из `@asciidoc-prosemirror/core`:

**prosemirror-asciidoc/package.json:**
```json
{
  "name": "prosemirror-asciidoc",
  "version": "2.0.0",
  "description": "Compatibility package for @asciidoc-prosemirror/core",
  "main": "index.js",
  "module": "index.js",
  "types": "index.d.ts",
  "dependencies": {
    "@asciidoc-prosemirror/core": "^2.0.0"
  }
}
```

**prosemirror-asciidoc/index.js:**
```javascript
export * from '@asciidoc-prosemirror/core'
```

Это позволит пользователям продолжать использовать старое имя пакета, получая при этом новую функциональность.

---

## Частые вопросы (FAQ)

### Что если я использую старую версию?

Старые версии (`prosemirror-asciidoc` v1.x) продолжат работать. Вы можете мигрировать в удобное для вас время.

### Нужно ли переписывать весь код?

Нет, для базовой функциональности достаточно изменить имя импортируемого пакета с `prosemirror-asciidoc` на `@asciidoc-prosemirror/core`.

### Какие преимущества дает новая структура?

- **Модульность**: используйте только необходимые части
- **Размер бандла**: меньший размер при использовании только core
- **Готовые решения**: пакет `vanillajs` предоставляет готовый редактор
- **Лучшая поддержка**: четкое разделение ответственности

### Как использовать локальные версии пакетов?

```bash
# В корне монорепозитория
pnpm build

# В вашем проекте
cd my-project
pnpm add file:../asciidoc-prosemirror/packages/core
```

Или использовать `pnpm link`:

```bash
# В пакете core
cd packages/core
pnpm link --global

# В вашем проекте
cd my-project
pnpm link --global @asciidoc-prosemirror/core
```

### Как отладить проблемы с зависимостями?

```bash
# Проверить дерево зависимостей
pnpm list

# Проверить зависимости конкретного пакета
pnpm --filter @asciidoc-prosemirror/core list

# Пересобрать зависимости
pnpm install --force
```

---

## Контакты и поддержка

- **Issues**: [GitHub Issues](https://github.com/your-org/asciidoc-prosemirror/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/asciidoc-prosemirror/discussions)
- **Discord**: [Discord Server](https://discord.gg/your-server)

---

## Changelog

### v2.0.0 (Migration to Monorepo)

**Breaking Changes:**
- Пакет `prosemirror-asciidoc` переименован в `@asciidoc-prosemirror/core`
- Новая модульная структура с отдельными пакетами

**New Packages:**
- `@asciidoc-prosemirror/core` - базовая функциональность
- `@asciidoc-prosemirror/prosemirror` - интеграция с ProseMirror
- `@asciidoc-prosemirror/vanillajs` - готовый редактор

**Migration Path:**
1. Обновить импорты на `@asciidoc-prosemirror/core`
2. Или использовать готовый редактор из `@asciidoc-prosemirror/vanillajs`
3. Пакет `prosemirror-asciidoc` v2.0.0 доступен как алиас для совместимости

**New Features:**
- Готовый к использованию редактор (`AsciiDocEditor`)
- Расширенные плагины и команды
- Улучшенная обработка ошибок
- Лучшая TypeScript поддержка

**Bug Fixes:**
- Исправлены проблемы с парсингом сложных документов
- Улучшена производительность сериализации
- Исправлены утечки памяти в demo

---

## Примеры миграции

### Пример 1: Простое приложение

**До миграции:**
```typescript
// app.ts
import { asciidocSchema, defaultAsciiDocParser } from 'prosemirror-asciidoc'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

const state = EditorState.create({
  schema: asciidocSchema,
  doc: defaultAsciiDocParser.parse('= Hello')
})

new EditorView(document.body, { state })
```

**После миграции:**
```typescript
// app.ts
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'

new AsciiDocEditor({
  container: document.body,
  initialContent: '= Hello'
})
```

### Пример 2: Кастомная настройка

**До миграции:**
```typescript
import { asciidocSchema, defaultAsciiDocParser } from 'prosemirror-asciidoc'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { keymap } from 'prosemirror-keymap'
import { history } from 'prosemirror-history'

const state = EditorState.create({
  schema: asciidocSchema,
  doc: defaultAsciiDocParser.parse('= Hello'),
  plugins: [keymap({ /* custom keys */ }), history()]
})

const view = new EditorView(document.body, { 
  state,
  dispatchTransaction(tr) {
    // custom logic
  }
})
```

**После миграции:**
```typescript
import { asciidocSchema, defaultAsciiDocParser } from '@asciidoc-prosemirror/core'
import { asciiDocKeymap } from '@asciidoc-prosemirror/prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { keymap } from 'prosemirror-keymap'
import { history } from 'prosemirror-history'

const state = EditorState.create({
  schema: asciidocSchema,
  doc: defaultAsciiDocParser.parse('= Hello'),
  plugins: [
    asciiDocKeymap, // готовые горячие клавиши для AsciiDoc
    keymap({ /* custom keys */ }), 
    history()
  ]
})

const view = new EditorView(document.body, { 
  state,
  dispatchTransaction(tr) {
    // custom logic
  }
})
```

### Пример 3: React интеграция

**После миграции:**
```typescript
// AsciiDocEditorComponent.tsx
import { useEffect, useRef, useState } from 'react'
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'

export function AsciiDocEditorComponent({ initialValue, onChange }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<AsciiDocEditor | null>(null)

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      editorRef.current = new AsciiDocEditor({
        container: containerRef.current,
        initialContent: initialValue,
        onChange: (content) => {
          onChange?.(content)
        }
      })
    }

    return () => {
      editorRef.current?.destroy()
    }
  }, [])

  return <div ref={containerRef} />
}
```

---

## Дополнительные ресурсы

- [Полный план миграции](./MONOREPO_MIGRATION_PLAN.md)
- [API документация](./docs/api.md)
- [Примеры использования](./examples/)
- [Contributing guide](./CONTRIBUTING.md)
