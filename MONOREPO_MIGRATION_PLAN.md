# План миграции на монорепозиторий

## Цель

Реорганизовать текущую кодовую базу в монорепозиторий с четырьмя отдельными пакетами для улучшения модульности, переиспользования кода и упрощения разработки.

## Целевая структура пакетов

### 1. `@asciidoc-prosemirror/core`
**Назначение:** Базовая функциональность парсинга и сериализации AsciiDoc для ProseMirror

**Состав:**
- Схема ProseMirror для AsciiDoc (`schema.ts`)
- Парсер AsciiDoc → ProseMirror (`from_asciidoc.ts`, `parser/`)
- Сериализатор ProseMirror → AsciiDoc (`to_asciidoc.ts`, `serializer/`)
- Утилиты и типы (`utils/`, `types/`)

**Зависимости:**
- `prosemirror-model` (peer dependency)
- `asciidoctor` (dependency)

**Потребители:** Все остальные пакеты монорепозитория

**Экспорт (публичный API):**
```typescript
export { asciidocSchema } from "./schema"
export { defaultAsciiDocParser, AsciiDocParser } from "./from_asciidoc"
export { AsciiDocSerializer, defaultAsciiDocSerializer, AsciiDocSerializerState } from "./to_asciidoc"
```

---

### 2. `@asciidoc-prosemirror/prosemirror`
**Назначение:** Интеграционные утилиты и расширения для работы с ProseMirror

**Состав:**
- Плагины ProseMirror для AsciiDoc
- Команды редактирования специфичные для AsciiDoc
- Хелперы для работы с транзакциями
- Дополнительные узлы и марки (extensions)

**Зависимости:**
- `@asciidoc-prosemirror/core` (workspace dependency)
- `prosemirror-state` (peer dependency)
- `prosemirror-commands` (peer dependency)
- `prosemirror-keymap` (peer dependency)

**Потребители:** `@asciidoc-prosemirror/vanillajs`, приложения пользователей

**Экспорт (публичный API):**
```typescript
export { asciiDocInputRules } from "./input-rules"
export { asciiDocKeymap } from "./keymap"
export { asciiDocCommands } from "./commands"
export { asciiDocPlugins } from "./plugins"
```

---

### 3. `@asciidoc-prosemirror/vanillajs`
**Назпреднастроенного редактора с минимальной конфигурацией

**Состав:**
- `AsciiDocEditor` класс (из `demo/src/AsciiDocEditor.tsx` → переименовать в `.ts`)
- Конфигурация по умолчанию
- Базовые стили (опционально)
- TypeScript интерфейсы для конфигурации

**Зависимости:**
- `@asciidoc-prosemirror/core` (workspace dependency)
- `@asciidoc-prosemirror/prosemirror` (workspace dependency)
- `prosemirror-state` (dependency)
- `prosemirror-view` (dependency)
- `prosemirror-keymap` (dependency)
- `prosemirror-commands` (dependency)
- `prosemirror-history` (dependency)

**Потребители:** Конечные пользователи, веб-приложения

**Экспорт (публичный API):**
```typescript
export { AsciiDocEditor } from "./AsciiDocEditor"
export type { AsciiDocEditorConfig } from "./AsciiDocEditor"
export { defaultEditorConfig } from "./config"
```

---

### 4. `@asciidoc-prosemirror/demo`
**Назначение:** Демо-приложение (не публикуется в npm)

**Состав:**
- Vite приложение с демонстрацией редактора
- HTML страница с примерами
- E2E тесты (Playwright)
- Примеры использования API

**Зависимости:**
- `@asciidoc-prosemirror/vanillajs` (workspace dependency)
- Vite, TypeScript (devDependencies)
- Playwright (devDependencies)

**Особенности:**
- `"private": true` в `package.json`
- Не публикуется в npm
- Используется для разработки и тестирования

---

## Структура директорий монорепозитория

```
asciidoc-prosemirror/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── schema.ts
│   │   │   ├── from_asciidoc.ts
│   │   │   ├── to_asciidoc.ts
│   │   │   ├── parser/
│   │   │   ├── serializer/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── prosemirror/
│   │   ├── src/
│   │   │   ├── input-rules.ts
│   │   │   ├── keymap.ts
│   │   │   ├── commands.ts
│   │   │   ├── plugins.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   ├── vanillajs/
│   │   ├── src/
│   │   │   ├── AsciiDocEditor.ts
│   │   │   ├── config.ts
│   │   │   ├── styles.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── demo/
│       ├── src/
│       │   ├── main.ts
│       │   ├── sampleAsciiDoc.ts
│       │   └── style.css
│       ├── tests/
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── playwright.config.ts
│       └── README.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── publish.yml
│       └── test.yml
│
├── package.json (корневой)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
├── README.md
└── LICENSE
```

---

## Инструменты управления монорепозиторием

### Вариант 1: **pnpm workspaces** (рекомендуется)

**Преимущества:**
- Быстрая установка зависимостей
- Эффективное использование дискового пространства
- Встроенная поддержка workspace dependencies
- Простая конфигурация

**Конфигурация:**

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
```

`package.json` (корневой):
```json
{
  "name": "asciidoc-prosemirror-monorepo",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "build": "pnpm -r --filter='!@asciidoc-prosemirror/demo' build",
    "build:demo": "pnpm --filter @asciidoc-prosemirror/demo build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "clean": "pnpm -r clean",
    "dev": "pnpm --filter @asciidoc-prosemirror/demo dev",
    "publish:packages": "pnpm -r --filter='!@asciidoc-prosemirror/demo' publish"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vite": "^7.1.7",
    "vitest": "^3.2.4"
  }
}
```

### Вариант 2: **npm workspaces**

**Преимущества:**
- Встроен в npm (v7+)
- Не требует дополнительных инструментов
- Простая миграция

**Конфигурация:**

`package.json` (корневой):
```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

### Вариант 3: **Turborepo**

**Преимущества:**
- Кэширование сборок
- Параллельное выполнение задач
- Оптимизация CI/CD

**Требует дополнительной настройки**

---

## План миграции (пошаговый)

### Этап 1: Подготовка

1. **Создать новую ветку для миграции**
   ```bash
   git checkout -b feat/monorepo-migration
   ```

2. **Создать структуру директорий**
   ```bash
   mkdir -p packages/{core,prosemirror,vanillajs,demo}
   ```

3. **Настроить workspace**
   - Создать `pnpm-workspace.yaml` (или настроить npm workspaces)
   - Обновить корневой `package.json`

### Этап 2: Миграция `@asciidoc-prosemirror/core`

1. **Перенести исходные файлы**
   ```bash
   cp -r src packages/core/
   cp -r test packages/core/
   ```

2. **Создать `packages/core/package.json`**
   ```json
   {
     "name": "@asciidoc-prosemirror/core",
     "version": "1.0.0",
     "description": "Core AsciiDoc parser and serializer for ProseMirror",
     "type": "module",
     "main": "dist/index.cjs",
     "module": "dist/index.js",
     "types": "dist/index.d.ts",
     "exports": {
       "import": "./dist/index.js",
       "require": "./dist/index.cjs"
     },
     "sideEffects": false,
     "files": ["dist"],
     "scripts": {
       "build": "vite build",
       "test": "vitest"
     },
     "dependencies": {
       "asciidoctor": "^3.0.4"
     },
     "peerDependencies": {
       "prosemirror-model": "^1.25.3"
     },
     "devDependencies": {
       "prosemirror-test-builder": "^1.1.1",
       "typescript": "^5.9.3",
       "vite": "^7.1.7",
       "vitest": "^3.2.4"
     }
   }
   ```

3. **Создать `packages/core/tsconfig.json`**
   ```json
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist", "test"]
   }
   ```

4. **Настроить vite.config.ts для сборки**

### Этап 3: Создание `@asciidoc-prosemirror/prosemirror`

1. **Создать базовую структуру**
   ```bash
   mkdir -p packages/prosemirror/src
   ```

2. **Реализовать плагины и команды** (новый функционал)
   - `src/input-rules.ts` - правила автозамены
   - `src/keymap.ts` - горячие клавиши
   - `src/commands.ts` - команды редактирования
   - `src/plugins.ts` - дополнительные плагины

3. **Создать `packages/prosemirror/package.json`**
   ```json
   {
     "name": "@asciidoc-prosemirror/prosemirror",
     "version": "1.0.0",
     "description": "ProseMirror integration utilities for AsciiDoc",
     "type": "module",
     "main": "dist/index.cjs",
     "module": "dist/index.js",
     "types": "dist/index.d.ts",
     "dependencies": {
       "@asciidoc-prosemirror/core": "workspace:*"
     },
     "peerDependencies": {
       "prosemirror-state": "^1.4.3",
       "prosemirror-commands": "^1.6.2",
       "prosemirror-keymap": "^1.2.2"
     }
   }
   ```

### Этап 4: Миграция `@asciidoc-prosemirror/vanillajs`

1. **Перенести AsciiDocEditor**
   ```bash
   cp demo/src/AsciiDocEditor.tsx packages/vanillajs/src/AsciiDocEditor.ts
   ```

2. **Адаптировать код**
   - Переименовать `.tsx` → `.ts` (убрать любые JSX зависимости)
   - Обновить импорты для использования workspace dependencies
   - Вынести конфигурацию в отдельный файл

3. **Создать `packages/vanillajs/package.json`**
   ```json
   {
     "name": "@asciidoc-prosemirror/vanillajs",
     "version": "1.0.0",
     "description": "Pre-configured AsciiDoc editor with vanilla JS API",
     "type": "module",
     "main": "dist/index.cjs",
     "module": "dist/index.js",
     "types": "dist/index.d.ts",
     "dependencies": {
       "@asciidoc-prosemirror/core": "workspace:*",
       "@asciidoc-prosemirror/prosemirror": "workspace:*",
       "prosemirror-state": "^1.4.3",
       "prosemirror-view": "^1.41.0",
       "prosemirror-keymap": "^1.2.2",
       "prosemirror-commands": "^1.6.2",
       "prosemirror-history": "^1.4.1"
     }
   }
   ```

### Этап 5: Миграция `@asciidoc-prosemirror/demo`

1. **Переместить demo приложение**
   ```bash
   cp -r demo/* packages/demo/
   ```

2. **Обновить импорты**
   - Заменить относительные импорты на workspace dependencies
   - Использовать `@asciidoc-prosemirror/vanillajs` вместо локальных файлов

3. **Обновить `packages/demo/package.json`**
   ```json
   {
     "name": "@asciidoc-prosemirror/demo",
     "private": true,
     "version": "0.0.0",
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "tsc && vite build",
       "preview": "vite preview",
       "test": "playwright test"
     },
     "dependencies": {
       "@asciidoc-prosemirror/vanillajs": "workspace:*"
     },
     "devDependencies": {
       "@playwright/test": "^1.55.0",
       "typescript": "^5.8.3",
       "vite": "^7.1.2"
     }
   }
   ```

### Этап 6: Настройка общих конфигураций

1. **Создать `tsconfig.base.json`**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "lib": ["ES2020", "DOM"],
       "moduleResolution": "bundler",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "declaration": true,
       "declarationMap": true,
       "sourceMap": true,
       "resolveJsonModule": true
     }
   }
   ```

2. **Обновить `.gitignore`**
   ```gitignore
   # Dependencies
   node_modules/
   
   # Build outputs
   dist/
   packages/*/dist/
   
   # Logs
   *.log
   npm-debug.log*
   
   # Test results
   test-results/
   playwright-report/
   
   # IDE
   .vscode/
   .idea/
   
   # OS
   .DS_Store
   ```

3. **Настроить CI/CD** (`.github/workflows/ci.yml`)
   ```yaml
   name: CI
   
   on: [push, pull_request]
   
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
           with:
             version: 8
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'pnpm'
         - run: pnpm install
         - run: pnpm build
         - run: pnpm test
   ```

### Этап 7: Тестирование

1. **Установить зависимости**
   ```bash
   pnpm install
   ```

2. **Собрать все пакеты**
   ```bash
   pnpm build
   ```

3. **Запустить тесты**
   ```bash
   pnpm test
   ```

4. **Проверить demo приложение**
   ```bash
   pnpm dev
   ```

### Этап 8: Документация

1. **Обновить корневой README.md**
   - Описание монорепозитория
   - Список пакетов и их назначение
   - Инструкции по разработке

2. **Создать README для каждого пакета**
   - API документация
   - Примеры использования
   - Установка и настройка

3. **Создать CONTRIBUTING.md**
   - Workflow разработки
   - Правила коммитов
   - Процесс публикации

### Этап 9: Публикация

1. **Настроить версионирование**
   - Использовать `changeset` или `lerna` для управления версиями
   - Настроить автоматическую публикацию через CI/CD

2. **Опубликовать пакеты**
   ```bash
   pnpm -r --filter='!@asciidoc-prosemirror/demo' publish
   ```

---

## Преимущества монорепозитория

### Для разработки:
- ✅ Единое место для всего кода
- ✅ Упрощенное тестирование интеграций между пакетами
- ✅ Атомарные коммиты для изменений в нескольких пакетах
- ✅ Общие конфигурации (TypeScript, ESLint, Prettier)

### Для пользователей:
- ✅ Модульная архитектура - используйте только то, что нужно
- ✅ Четкое разделение ответственности
- ✅ Упрощенная миграция (можно использовать core без vanillajs)
- ✅ Лучшая документация и примеры

### Для поддержки:
- ✅ Упрощенное управление версиями
- ✅ Централизованный CI/CD
- ✅ Легче отслеживать зависимости
- ✅ Проще публиковать связанные обновления

---

## Потенциальные проблемы и решения

### Проблема 1: Циклические зависимости
**Решение:** Четко определить иерархию пакетов (core → prosemirror → vanillajs)

### Проблема 2: Сложность публикации
**Решение:** Использовать инструменты автоматизации (changeset, lerna)

### Проблема 3: Управление версиями
**Решение:** Единая мажорная версия для всех пакетов или независимое версионирование

### Проблема 4: Размер установки
**Решение:** Правильная настройка peer dependencies и tree shaking

---

## Рекомендации по именованию

### Публикуемые пакеты:
- `@asciidoc-prosemirror/core`
- `@asciidoc-prosemirror/prosemirror`
- `@asciidoc-prosemirror/vanillajs`

### Внутренние пакеты:
- `@asciidoc-prosemirror/demo` (private)

### Scope преимущества:
- Группировка связанных пакетов
- Уникальность имен в npm
- Профессиональный вид
- Упрощение поиска

---

## Миграция пользователей

### Текущее использование:
```typescript
import { asciidocSchema, defaultAsciiDocParser } from 'prosemirror-asciidoc'
```

### После миграции (вариант 1 - только core):
```typescript
import { asciidocSchema, defaultAsciiDocParser } from '@asciidoc-prosemirror/core'
```

### После миграции (вариант 2 - полный редактор):
```typescript
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'

const editor = new AsciiDocEditor({
  container: document.getElementById('editor'),
  initialContent: '= Hello AsciiDoc',
  onChange: (content) => console.log(content)
})
```

### Обратная совместимость:
Можно создать пакет-обертку `prosemirror-asciidoc`, который реэкспортирует из `@asciidoc-prosemirror/core` для плавной миграции.

---

## Альтернативные подходы

### Подход 1: Постепенная миграция
- Сначала создать `@asciidoc-prosemirror/core` с текущей функциональностью
- Затем добавить новые пакеты по мере необходимости
- Сохранить `prosemirror-asciidoc` как алиас

### Подход 2: "Big Bang" миграция
- Сразу создать все пакеты
- Опубликовать как breaking change (v2.0.0)
- Предоставить migration guide

### Подход 3: Гибридный
- Монорепозиторий для разработки
- Публиковать отдельные пакеты
- Сохранить оригинальный пакет для совместимости

---

## Временная оценка

| Этап | Оценка времени | Приоритет |
|------|---------------|-----------|
| Настройка структуры | 2-4 часа | Высокий |
| Миграция core | 4-6 часов | Высокий |
| Создание prosemirror | 8-12 часов | Средний |
| Миграция vanillajs | 6-8 часов | Высокий |
| Миграция demo | 2-3 часа | Низкий |
| Настройка CI/CD | 3-4 часа | Средний |
| Документация | 4-6 часов | Высокий |
| Тестирование | 4-6 часов | Высокий |
| **Итого** | **33-49 часов** | |

---

## Следующие шаги

1. **Обсудить и утвердить план** с командой/сообществом
2. **Выбрать инструмент управления монорепозиторием** (pnpm/npm/turborepo)
3. **Создать пилотную ветку** для проверки концепции
4. **Начать с миграции core пакета** как proof of concept
5. **Получить обратную связь** и скорректировать план
6. **Постепенно мигрировать остальные пакеты**
7. **Обновить документацию и CI/CD**
8. **Опубликовать beta версии** для тестирования
9. **Собрать feedback** от пользователей
10. **Выпустить stable версию**

---

## Контрольный список

- [ ] Создать структуру монорепозитория
- [ ] Настроить workspace (pnpm/npm)
- [ ] Мигрировать core пакет
- [ ] Создать prosemirror пакет
- [ ] Мигрировать vanillajs пакет
- [ ] Мигрировать demo пакет
- [ ] Настроить общие конфигурации
- [ ] Настроить CI/CD
- [ ] Написать документацию
- [ ] Создать migration guide
- [ ] Настроить автоматическую публикацию
- [ ] Протестировать все пакеты
- [ ] Опубликовать beta версии
- [ ] Собрать feedback
- [ ] Опубликовать stable версии

---

## Заключение

Миграция на монорепозиторий - это стратегическое решение, которое упростит разработку, улучшит модульность кода и предоставит пользователям гибкие варианты использования библиотеки. План предусматривает постепенный подход с возможностью тестирования и корректировки на каждом этапе.

Рекомендуемый путь:
1. Начать с **pnpm workspaces** как простого и эффективного решения
2. Создать **@asciidoc-prosemirror/core** как первый пакет (proof of concept)
3. Постепенно добавлять остальные пакеты
4. Обеспечить обратную совместимость через алиасы
5. Предоставить подробную документацию для миграции пользователей
