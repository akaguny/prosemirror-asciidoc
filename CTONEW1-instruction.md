# CTONEW1: Инструкция по реализации монорепозитория

Пошаговая инструкция для агента CTO.new по переходу на монорепозиторий.

---

## Этап 1: Подготовка

### 1.1 Создать структуру директорий
```bash
mkdir -p packages/{core,prosemirror,vanillajs,demo}
```

### 1.2 Создать workspace конфигурацию
```bash
cp monorepo-examples/pnpm-workspace.yaml pnpm-workspace.yaml
```

### 1.3 Создать корневой package.json
```bash
cp monorepo-examples/root-package.json package.json
```

### 1.4 Создать tsconfig.base.json
```bash
cp monorepo-examples/tsconfig.base.json tsconfig.base.json
```

---

## Этап 2: Пакет @asciidoc-prosemirror/core

### 2.1 Перенести исходники
```bash
cp -r src packages/core/src
cp -r test packages/core/test
```

### 2.2 Создать package.json
```bash
cp monorepo-examples/packages/core/package.json packages/core/package.json
```

### 2.3 Создать vite.config.ts
```bash
cp monorepo-examples/packages/core/vite.config.ts packages/core/vite.config.ts
```

### 2.4 Создать tsconfig.json
```bash
cat > packages/core/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF
```

---

## Этап 3: Пакет @asciidoc-prosemirror/prosemirror

### 3.1 Создать структуру
```bash
mkdir -p packages/prosemirror/src packages/prosemirror/test
```

### 3.2 Создать package.json
```bash
cp monorepo-examples/packages/prosemirror/package.json packages/prosemirror/package.json
```

### 3.3 Создать input-rules.ts
```bash
cat > packages/prosemirror/src/input-rules.ts << 'EOF'
import { inputRules, InputRule } from 'prosemirror-inputrules'
import { asciidocSchema } from '@asciidoc-prosemirror/core'

export function asciiDocInputRules() {
  return inputRules({
    rules: [
      new InputRule(/\*\*([^*]+)\*\*$/, (state, match, start, end) => {
        const { tr } = state
        if (match[1]) {
          tr.replaceWith(start, end, asciidocSchema.text(match[1], [asciidocSchema.marks.strong.create()]))
        }
        return tr
      }),
      new InputRule(/__([^_]+)__$/, (state, match, start, end) => {
        const { tr } = state
        if (match[1]) {
          tr.replaceWith(start, end, asciidocSchema.text(match[1], [asciidocSchema.marks.em.create()]))
        }
        return tr
      })
    ]
  })
}
EOF
```

### 3.4 Создать keymap.ts
```bash
cat > packages/prosemirror/src/keymap.ts << 'EOF'
import { keymap } from 'prosemirror-keymap'
import { toggleMark } from 'prosemirror-commands'
import { asciidocSchema } from '@asciidoc-prosemirror/core'

export function asciiDocKeymap() {
  return keymap({
    'Mod-b': toggleMark(asciidocSchema.marks.strong),
    'Mod-i': toggleMark(asciidocSchema.marks.em),
    'Mod-`': toggleMark(asciidocSchema.marks.code)
  })
}
EOF
```

### 3.5 Создать index.ts
```bash
cat > packages/prosemirror/src/index.ts << 'EOF'
export { asciiDocInputRules } from './input-rules'
export { asciiDocKeymap } from './keymap'
EOF
```

### 3.6 Создать vite.config.ts
```bash
cat > packages/prosemirror/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AsciidocProsemirrorProsemirror',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'prosemirror-model',
        'prosemirror-state',
        'prosemirror-commands',
        'prosemirror-keymap',
        'prosemirror-inputrules',
        '@asciidoc-prosemirror/core'
      ],
      output: {
        globals: {
          'prosemirror-model': 'ProseMirrorModel',
          'prosemirror-state': 'ProseMirrorState',
          'prosemirror-commands': 'ProseMirrorCommands',
          'prosemirror-keymap': 'ProseMirrorKeymap',
          'prosemirror-inputrules': 'ProseMirrorInputRules',
          '@asciidoc-prosemirror/core': 'AsciidocProsemirrorCore'
        }
      }
    },
    sourcemap: true,
    target: 'esnext'
  },
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
EOF
```

### 3.7 Создать tsconfig.json
```bash
cat > packages/prosemirror/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF
```

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

Обновить импорты в `packages/vanillajs/src/AsciiDocEditor.ts`:
- Заменить `'../../src/index'` на `'@asciidoc-prosemirror/core'`

### 4.3 Создать index.ts
```bash
cat > packages/vanillajs/src/index.ts << 'EOF'
export { AsciiDocEditor } from './AsciiDocEditor'
export type { AsciiDocEditorConfig } from './AsciiDocEditor'
EOF
```

### 4.4 Создать package.json
```bash
cp monorepo-examples/packages/vanillajs/package.json packages/vanillajs/package.json
```

### 4.5 Создать vite.config.ts
```bash
cp monorepo-examples/packages/vanillajs/vite.config.ts packages/vanillajs/vite.config.ts
```

### 4.6 Создать tsconfig.json
```bash
cat > packages/vanillajs/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF
```

---

## Этап 5: Пакет @asciidoc-prosemirror/demo

### 5.1 Создать структуру
```bash
mkdir -p packages/demo/src packages/demo/public packages/demo/tests
```

### 5.2 Переместить файлы
```bash
cp demo/index.html packages/demo/
cp demo/vite.config.ts packages/demo/
cp demo/playwright.config.ts packages/demo/ 2>/dev/null || true
cp demo/src/style.css packages/demo/src/
cp -r demo/public/* packages/demo/public/ 2>/dev/null || true
cp -r demo/tests/* packages/demo/tests/ 2>/dev/null || true
```

### 5.3 Создать main.ts
```bash
cat > packages/demo/src/main.ts << 'EOF'
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

const editor = new AsciiDocEditor({
  container: app,
  initialContent: '= AsciiDoc Editor Demo\n\nContent here...'
})
EOF
```

### 5.4 Создать package.json
```bash
cp monorepo-examples/packages/demo/package.json packages/demo/package.json
```

### 5.5 Создать tsconfig.json
```bash
cat > packages/demo/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

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
```bash
cat > .changeset/config.json << 'EOF'
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
EOF
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

## Проверочный список

- [ ] Структура директорий создана
- [ ] Workspace настроен (pnpm-workspace.yaml)
- [ ] Core пакет: исходники скопированы, package.json, vite.config.ts, tsconfig.json
- [ ] Prosemirror пакет: input-rules.ts, keymap.ts, index.ts, package.json, vite.config.ts, tsconfig.json
- [ ] Vanillajs пакет: AsciiDocEditor.ts с обновленными импортами, index.ts, package.json, vite.config.ts, tsconfig.json
- [ ] Demo пакет: main.ts, package.json, tsconfig.json, конфигурации скопированы
- [ ] CI/CD workflows настроены
- [ ] Changesets настроен
- [ ] `pnpm install` выполняется без ошибок
- [ ] `pnpm build` собирает все пакеты
- [ ] `pnpm test` проходит все тесты
- [ ] `pnpm dev` запускает demo

---

## Troubleshooting

### Ошибка: Cannot find module '@asciidoc-prosemirror/core'
**Решение:** Сначала собрать core: `pnpm --filter @asciidoc-prosemirror/core build`

### Ошибка: __dirname is not defined
**Решение:** Используется в vite.config.ts:
```typescript
import { fileURLToPath } from 'url'
const __dirname = fileURLToPath(new URL('.', import.meta.url))
```

### Тесты не находят модули
**Решение:** Собрать все пакеты перед тестами: `pnpm build && pnpm test`
