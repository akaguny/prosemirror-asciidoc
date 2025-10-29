# Архитектурная диаграмма монорепозитория

## 📐 Зависимости между пакетами

```
┌─────────────────────────────────────────────────────────────────┐
│                      External Dependencies                       │
│  (prosemirror-model, prosemirror-state, prosemirror-view, etc)  │
└─────────────────────────────────────────────────────────────────┘
                                ▲
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        │                       │                       │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│                │    │                 │    │                 │
│  asciidoctor   │    │ prosemirror-    │    │ prosemirror-    │
│  (external)    │    │ model           │    │ state/view      │
│                │    │ (peer dep)      │    │ (peer deps)     │
└───────┬────────┘    └────────┬────────┘    └────────┬────────┘
        │                      │                       │
        │              ┌───────▼────────┐              │
        │              │                │              │
        └──────────────► @asciidoc-     ◄──────────────┘
                       │ prosemirror/   │
                       │ CORE           │
                       │ [парсер +      │
                       │  сериализатор  │
                       │  + схема]      │
                       └───────┬────────┘
                               │
                               │ workspace:*
                               │
                       ┌───────▼────────┐
                       │                │
                       │ @asciidoc-     │
                       │ prosemirror/   │
                       │ PROSEMIRROR    │
                       │ [плагины +     │
                       │  команды +     │
                       │  keymap]       │
                       └───────┬────────┘
                               │
                               │ workspace:*
                               │
                       ┌───────▼────────┐
                       │                │
                       │ @asciidoc-     │
                       │ prosemirror/   │
                       │ VANILLAJS      │
                       │ [готовый       │
                       │  редактор]     │
                       └───────┬────────┘
                               │
                               │ workspace:*
                               │
                       ┌───────▼────────┐
                       │                │
                       │ @asciidoc-     │
                       │ prosemirror/   │
                       │ DEMO           │
                       │ (private)      │
                       │ [примеры]      │
                       └────────────────┘
```

## 🏗️ Структура файлов

```
asciidoc-prosemirror/
│
├── 📦 packages/
│   │
│   ├── 📁 core/                          [Уровень 1: Базовая функциональность]
│   │   ├── src/
│   │   │   ├── schema.ts                 ← ProseMirror схема для AsciiDoc
│   │   │   ├── from_asciidoc.ts          ← Парсер: AsciiDoc → PM Doc
│   │   │   ├── to_asciidoc.ts            ← Сериализатор: PM Doc → AsciiDoc
│   │   │   ├── parser/                   ← Вспомогательные парсеры
│   │   │   ├── serializer/               ← Вспомогательные сериализаторы
│   │   │   ├── types/                    ← TypeScript типы
│   │   │   ├── utils/                    ← Утилиты
│   │   │   └── index.ts                  ← Экспорты
│   │   ├── test/                         ← Тесты
│   │   ├── package.json                  ← Dependencies: asciidoctor
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   │
│   ├── 📁 prosemirror/                   [Уровень 2: Интеграция с PM]
│   │   ├── src/
│   │   │   ├── input-rules.ts            ← Правила автозамены
│   │   │   ├── keymap.ts                 ← Горячие клавиши
│   │   │   ├── commands.ts               ← Команды редактирования
│   │   │   ├── plugins.ts                ← Дополнительные плагины
│   │   │   └── index.ts                  ← Экспорты
│   │   ├── test/                         ← Тесты
│   │   ├── package.json                  ← Depends on: @asciidoc-prosemirror/core
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   │
│   ├── 📁 vanillajs/                     [Уровень 3: Готовое решение]
│   │   ├── src/
│   │   │   ├── AsciiDocEditor.ts         ← Главный класс редактора
│   │   │   ├── config.ts                 ← Конфигурация по умолчанию
│   │   │   ├── styles.ts                 ← (Опционально) Встроенные стили
│   │   │   └── index.ts                  ← Экспорты
│   │   ├── test/                         ← Unit тесты
│   │   ├── package.json                  ← Depends on: core + prosemirror
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   │
│   └── 📁 demo/                          [Приложение для демо]
│       ├── src/
│       │   ├── main.ts                   ← Точка входа
│       │   ├── sampleAsciiDoc.ts         ← Примеры контента
│       │   └── style.css                 ← Стили демо
│       ├── tests/                        ← E2E тесты (Playwright)
│       ├── public/                       ← Статические файлы
│       ├── index.html                    ← HTML страница
│       ├── package.json                  ← private: true
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── playwright.config.ts
│       └── README.md
│
├── 📄 pnpm-workspace.yaml                ← Конфигурация workspace
├── 📄 tsconfig.base.json                 ← Базовый TypeScript конфиг
├── 📄 package.json                       ← Корневой package.json (scripts)
│
├── 📁 .github/
│   └── workflows/
│       ├── ci.yml                        ← Build + Test для всех пакетов
│       └── publish.yml                   ← Автопубликация в npm
│
├── 📄 .gitignore                         ← Игнорировать node_modules, dist
├── 📄 README.md                          ← Главный README
├── 📄 LICENSE                            ← MIT License
│
└── 📁 docs/                              ← (Опционально) Дополнительная документация
    ├── MIGRATION_GUIDE.md
    ├── API.md
    └── CONTRIBUTING.md
```

## 🔄 Data Flow (Поток данных)

### Парсинг: AsciiDoc Text → ProseMirror Document

```
┌─────────────────┐
│ AsciiDoc Text   │
│ "= Title        │
│  Content..."    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ @asciidoc-prosemirror/core          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ AsciiDoctor.js                  │ │
│ │ (external library)              │ │
│ └──────────┬──────────────────────┘ │
│            │                         │
│            ▼                         │
│ ┌─────────────────────────────────┐ │
│ │ AsciiDoc AST                    │ │
│ │ {type: "document", blocks: ...} │ │
│ └──────────┬──────────────────────┘ │
│            │                         │
│            ▼                         │
│ ┌─────────────────────────────────┐ │
│ │ AsciiDocParser                  │ │
│ │ (from_asciidoc.ts)              │ │
│ └──────────┬──────────────────────┘ │
│            │                         │
└────────────┼─────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ ProseMirror Document                │
│ {type: "doc", content: [            │
│   {type: "heading", level: 1, ...}, │
│   {type: "paragraph", ...}          │
│ ]}                                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ EditorState (ProseMirror)           │
│ {doc, selection, plugins, ...}      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ EditorView (Rendered in DOM)        │
│ <div class="ProseMirror">           │
│   <h1>Title</h1>                    │
│   <p>Content...</p>                 │
│ </div>                              │
└─────────────────────────────────────┘
```

### Сериализация: ProseMirror Document → AsciiDoc Text

```
┌─────────────────────────────────────┐
│ ProseMirror Document                │
│ {type: "doc", content: [...]}       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ @asciidoc-prosemirror/core          │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ AsciiDocSerializer              │ │
│ │ (to_asciidoc.ts)                │ │
│ │                                 │ │
│ │ - Обход дерева документа        │ │
│ │ - Применение правил сериализации│ │
│ │ - Генерация AsciiDoc текста     │ │
│ └──────────┬──────────────────────┘ │
│            │                         │
└────────────┼─────────────────────────┘
             │
             ▼
┌─────────────────┐
│ AsciiDoc Text   │
│ "= Title        │
│  Content..."    │
└─────────────────┘
```

## 🎨 Варианты использования

### Вариант 1: Только core (минимальный)

```
┌──────────────┐
│ Your App     │
└──────┬───────┘
       │
       │ import { defaultAsciiDocParser }
       ▼
┌──────────────────────────┐
│ @asciidoc-prosemirror/   │
│ core                     │
│                          │
│ - parse()                │
│ - serialize()            │
└──────────────────────────┘
       │
       │ creates
       ▼
┌──────────────────────────┐
│ ProseMirror Document     │
└──────────────────────────┘
       │
       │ you handle UI yourself
       ▼
┌──────────────────────────┐
│ Your Custom EditorView   │
└──────────────────────────┘
```

### Вариант 2: С плагинами (продвинутый)

```
┌──────────────┐
│ Your App     │
└──────┬───────┘
       │
       │ import { asciidocSchema, parser }
       ▼
┌────────────────────────────────────┐
│ @asciidoc-prosemirror/core         │
│ - schema, parser, serializer       │
└────────────────────────────────────┘
       │
       │ import { keymap, inputRules }
       ▼
┌────────────────────────────────────┐
│ @asciidoc-prosemirror/prosemirror  │
│ - inputRules, keymap, commands     │
└────────────────────────────────────┘
       │
       │ creates custom editor
       ▼
┌────────────────────────────────────┐
│ EditorState + EditorView           │
│ (with plugins)                     │
└────────────────────────────────────┘
```

### Вариант 3: Готовый редактор (простой)

```
┌──────────────┐
│ Your App     │
└──────┬───────┘
       │
       │ import { AsciiDocEditor }
       ▼
┌──────────────────────────────────────┐
│ @asciidoc-prosemirror/vanillajs      │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ AsciiDocEditor                   │ │
│ │ - initializes EditorView         │ │
│ │ - sets up plugins                │ │
│ │ - handles errors                 │ │
│ │ - provides callbacks             │ │
│ └──────────────────────────────────┘ │
│              │                        │
│              │ uses internally        │
│              ▼                        │
│ ┌──────────────────────────────────┐ │
│ │ @asciidoc-prosemirror/           │ │
│ │ prosemirror + core               │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
       │
       │ renders
       ▼
┌──────────────────────────────────────┐
│ Fully functional AsciiDoc Editor     │
│ with all features ready              │
└──────────────────────────────────────┘
```

## 📊 Размеры бандлов (примерные)

```
┌─────────────────────────────────────────────────────────┐
│                    Bundle Sizes                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  @asciidoc-prosemirror/core                            │
│  ████████████████                          ~15-30 KB   │
│                                                         │
│  @asciidoc-prosemirror/prosemirror                     │
│  ██████████                                ~10-15 KB   │
│                                                         │
│  @asciidoc-prosemirror/vanillajs (with deps)           │
│  ████████████████████████████████████      ~40-60 KB   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Публикация и версионирование

```
┌────────────────────────────────────────┐
│ Developer commits changes              │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ pnpm changeset                         │
│ (создает changeset для измененных      │
│  пакетов)                              │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Commit & Push to GitHub                │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ CI/CD (GitHub Actions)                 │
│ - Build all packages                   │
│ - Run all tests                        │
│ - Verify types                         │
└──────────────┬─────────────────────────┘
               │
               ▼ (on merge to main)
┌────────────────────────────────────────┐
│ Changeset creates "Version PR"         │
│ - Updates package.json versions        │
│ - Generates CHANGELOG                  │
└──────────────┬─────────────────────────┘
               │
               ▼ (when Version PR merged)
┌────────────────────────────────────────┐
│ Auto-publish to npm                    │
│ @asciidoc-prosemirror/core@2.0.0       │
│ @asciidoc-prosemirror/prosemirror@2.0.0│
│ @asciidoc-prosemirror/vanillajs@2.0.0  │
│ (demo is NOT published - private)      │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Create GitHub Release                  │
│ - Tag: v2.0.0                          │
│ - Release notes from CHANGELOG         │
└────────────────────────────────────────┘
```

## 🧪 Testing Strategy

```
┌─────────────────────────────────────────────────────────┐
│                     Testing Pyramid                     │
└─────────────────────────────────────────────────────────┘

                         ▲
                        ╱ ╲
                       ╱   ╲
                      ╱ E2E ╲              demo package
                     ╱ Tests ╲             (Playwright)
                    ╱─────────╲
                   ╱           ╲
                  ╱ Integration╲           vanillajs package
                 ╱    Tests     ╲          (Vitest + jsdom)
                ╱───────────────╲
               ╱                 ╲
              ╱   Unit Tests      ╲       core + prosemirror
             ╱ (Parser, Serializer)╲      (Vitest)
            ╱───────────────────────╲
           ╱                         ╲
          ╱ Type Checking (TSC)      ╲    All packages
         ╱─────────────────────────────╲
        ╱ Linting (ESLint, Prettier)   ╲  All packages
       ╱─────────────────────────────────╲
```

## 📦 NPM Registry

```
┌─────────────────────────────────────────────────────────┐
│                     NPM Registry                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  @asciidoc-prosemirror                                 │
│  └── core@2.0.0          ✅ Published                  │
│  └── prosemirror@2.0.0   ✅ Published                  │
│  └── vanillajs@2.0.0     ✅ Published                  │
│  └── demo                ❌ Private (not published)    │
│                                                         │
│  prosemirror-asciidoc    📦 Compatibility alias        │
│  └── 2.0.0               Re-exports @.../core          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Миграционный путь для пользователей

```
┌──────────────────────────────────────────────────────────┐
│         Old (v1.x)          →          New (v2.x)        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  prosemirror-asciidoc       →  @asciidoc-prosemirror/   │
│  (single package)               core                     │
│                                                          │
│  Manual AsciiDocEditor      →  @asciidoc-prosemirror/   │
│  copy-paste from demo           vanillajs                │
│                                                          │
│  No plugins                 →  @asciidoc-prosemirror/   │
│                                 prosemirror              │
│                                                          │
└──────────────────────────────────────────────────────────┘

Обратная совместимость:
  prosemirror-asciidoc@2.0.0 = alias for @asciidoc-prosemirror/core
```

## 🔗 Внешние зависимости

```
┌─────────────────────────────────────────────────────────┐
│              External Dependencies Tree                 │
└─────────────────────────────────────────────────────────┘

asciidoctor@3.0.4
└── (используется в @asciidoc-prosemirror/core)

prosemirror-model@1.25.3
└── (peer dependency для core, prosemirror, vanillajs)

prosemirror-state@1.4.3
prosemirror-view@1.41.0
prosemirror-keymap@1.2.2
prosemirror-commands@1.6.2
prosemirror-history@1.4.1
prosemirror-inputrules@1.4.0
└── (используются в prosemirror и vanillajs пакетах)
```

## 💡 Ключевые принципы

1. **Separation of Concerns** - каждый пакет отвечает за свою область
2. **Progressive Enhancement** - от простого (core) к сложному (vanillajs)
3. **Tree-shakeable** - импортируйте только то, что нужно
4. **TypeScript First** - полная типизация из коробки
5. **Zero Breaking Changes** - для пользователей через alias-пакет

---

*Эта диаграмма визуализирует архитектуру монорепозитория и поток данных между пакетами*
