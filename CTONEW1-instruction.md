# CTONEW1: Инструкция по реализации монорепозитория

Пошаговая инструкция для агента CTO.new по переходу на монорепозиторий.

---

## Этап 1: Подготовка

### 1.1 Создать структуру директорий
```bash
mkdir -p packages/{core,prosemirror,vanillajs,demo}
```

### 1.2 Создать workspace конфигурацию
Скопировать `monorepo-examples/pnpm-workspace.yaml` в корень:
```yaml
packages:
  - 'packages/*'
```

### 1.3 Создать корневой package.json
Скопировать `monorepo-examples/root-package.json` → `package.json`

### 1.4 Создать tsconfig.base.json
Скопировать `monorepo-examples/tsconfig.base.json` в корень

---

## Этап 2: Пакет @asciidoc-prosemirror/core

### 2.1 Перенести исходники
```bash
cp -r src packages/core/src
cp -r test packages/core/test
```

### 2.2 Создать package.json
Скопировать `monorepo-examples/packages/core/package.json` → `packages/core/package.json`

### 2.3 Создать vite.config.ts
Скопировать `monorepo-examples/packages/core/vite.config.ts` → `packages/core/vite.config.ts`

### 2.4 Создать tsconfig.json
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

---

## Этап 3: Пакет @asciidoc-prosemirror/prosemirror

### 3.1 Создать структуру
```bash
mkdir -p packages/prosemirror/src packages/prosemirror/test
```

### 3.2 Создать package.json
Скопировать `monorepo-examples/packages/prosemirror/package.json` → `packages/prosemirror/package.json`

### 3.3 Создать input-rules.ts
```typescript
import { inputRules, InputRule } from 'prosemirror-inputrules'
import { asciidocSchema } from '@asciidoc-prosemirror/core'

export function asciiDocInputRules() {
  return inputRules({
    rules: [
      new InputRule(/\*\*([^*]+)\*\*$/, (state, match, start, end) => {
        const { tr, schema } = state
        if (match[1]) {
          tr.replaceWith(start, end, schema.text(match[1], [schema.marks.strong.create()]))
        }
        return tr
      }),
      new InputRule(/__([^_]+)__$/, (state, match, start, end) => {
        const { tr, schema } = state
        if (match[1]) {
          tr.replaceWith(start, end, schema.text(match[1], [schema.marks.em.create()]))
        }
        return tr
      })
    ]
  })
}
```

### 3.4 Создать keymap.ts
```typescript
import { keymap } from 'prosemirror-keymap'
import { toggleMark, setBlockType } from 'prosemirror-commands'
import { asciidocSchema } from '@asciidoc-prosemirror/core'

export function asciiDocKeymap() {
  return keymap({
    'Mod-b': toggleMark(asciidocSchema.marks.strong),
    'Mod-i': toggleMark(asciidocSchema.marks.em),
    'Mod-`': toggleMark(asciidocSchema.marks.code)
  })
}
```

### 3.5 Создать index.ts
```typescript
export { asciiDocInputRules } from './input-rules'
export { asciiDocKeymap } from './keymap'
```

### 3.6 Создать vite.config.ts
Аналогично core, но с external для workspace dependency:
```typescript
external: [
  'prosemirror-model',
  'prosemirror-state',
  'prosemirror-commands',
  'prosemirror-keymap',
  'prosemirror-inputrules',
  '@asciidoc-prosemirror/core'
]
```

### 3.7 Создать tsconfig.json
Аналогично core

---

## Этап 4: Пакет @asciidoc-prosemirror/vanillajs

### 4.1 Создать структуру
```bash
mkdir -p packages/vanillajs/src packages/vanillajs/test
```

### 4.2 Перенести AsciiDocEditor
```bash
cp demo/src/AsciiDocEditor.tsx packages/vanillajs/src/AsciiDocEditor.ts
```

Обновить импорты в AsciiDocEditor.ts:
```typescript
// Было:
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from '../../src/index'

// Стало:
import { asciidocSchema, defaultAsciiDocParser, defaultAsciiDocSerializer } from '@asciidoc-prosemirror/core'
```

### 4.3 Создать index.ts
```typescript
export { AsciiDocEditor } from './AsciiDocEditor'
export type { AsciiDocEditorConfig } from './AsciiDocEditor'
```

### 4.4 Создать package.json
Скопировать `monorepo-examples/packages/vanillajs/package.json` → `packages/vanillajs/package.json`

### 4.5 Создать vite.config.ts
Скопировать `monorepo-examples/packages/vanillajs/vite.config.ts` → `packages/vanillajs/vite.config.ts`

### 4.6 Создать tsconfig.json
Аналогично core

---

## Этап 5: Пакет @asciidoc-prosemirror/demo

### 5.1 Переместить файлы
```bash
cp demo/index.html packages/demo/
cp demo/vite.config.ts packages/demo/
cp demo/playwright.config.ts packages/demo/
cp -r demo/public packages/demo/
cp -r demo/tests packages/demo/
```

### 5.2 Создать новый main.ts
```typescript
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

const editor = new AsciiDocEditor({
  container: app,
  initialContent: '= AsciiDoc Editor Demo\n\nContent here...'
})
```

### 5.3 Скопировать style.css
```bash
cp demo/src/style.css packages/demo/src/
```

### 5.4 Создать package.json
Скопировать `monorepo-examples/packages/demo/package.json` → `packages/demo/package.json`

### 5.5 Создать tsconfig.json
Аналогично core

---

## Этап 6: CI/CD

### 6.1 Создать workflows
```bash
mkdir -p .github/workflows
cp monorepo-examples/.github-workflows-ci.yml .github/workflows/ci.yml
cp monorepo-examples/.github-workflows-publish.yml .github/workflows/publish.yml
```

### 6.2 Настроить changesets
```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

Обновить `.changeset/config.json`:
```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [
    ["@asciidoc-prosemirror/core", "@asciidoc-prosemirror/prosemirror", "@asciidoc-prosemirror/vanillajs"]
  ],
  "access": "public",
  "baseBranch": "main",
  "ignore": ["@asciidoc-prosemirror/demo"]
}
```

---

## Этап 7: Сборка и тестирование

### 7.1 Установить зависимости
```bash
pnpm install
```

### 7.2 Собрать пакеты
```bash
pnpm build
```

### 7.3 Запустить тесты
```bash
pnpm test
```

### 7.4 Проверить demo
```bash
pnpm dev
```

---

## Этап 8: Публикация

### 8.1 Создать changeset
```bash
pnpm changeset
```

Выбрать:
- `@asciidoc-prosemirror/core`: major (2.0.0)
- `@asciidoc-prosemirror/prosemirror`: major (1.0.0)
- `@asciidoc-prosemirror/vanillajs`: major (1.0.0)

### 8.2 Обновить версии
```bash
pnpm changeset version
```

### 8.3 Опубликовать
```bash
pnpm build
pnpm publish:packages
```

Или через CI/CD: создать PR, который после merge автоматически опубликует пакеты.

---

## Проверочный список

- [ ] Структура директорий создана
- [ ] Workspace настроен (pnpm-workspace.yaml)
- [ ] Core пакет: исходники скопированы, package.json, vite.config.ts
- [ ] Prosemirror пакет: input-rules.ts, keymap.ts, index.ts
- [ ] Vanillajs пакет: AsciiDocEditor.ts с обновленными импортами
- [ ] Demo пакет: использует vanillajs пакет
- [ ] CI/CD workflows настроены
- [ ] Changesets настроен
- [ ] `pnpm install` выполняется без ошибок
- [ ] `pnpm build` собирает все пакеты
- [ ] `pnpm test` проходит все тесты
- [ ] `pnpm dev` запускает demo

---

## Важные замечания

### ES Modules
Все vite.config.ts файлы должны использовать:
```typescript
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
```

### Workspace Dependencies
В package.json используется `workspace:*`:
```json
{
  "dependencies": {
    "@asciidoc-prosemirror/core": "workspace:*"
  }
}
```

### Build Target
Использовать `target: 'esnext'` в vite.config.ts

### TypeScript
Все tsconfig.json должны наследовать tsconfig.base.json через `extends`

---

## Troubleshooting

### Ошибка: Cannot find module '@asciidoc-prosemirror/core'
**Решение:** Сначала собрать core: `pnpm --filter @asciidoc-prosemirror/core build`

### Ошибка: __dirname is not defined
**Решение:** Добавить в vite.config.ts:
```typescript
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
```

### Тесты не находят модули
**Решение:** Собрать все пакеты перед тестами: `pnpm build && pnpm test`
