# Пошаговый чеклист реализации монорепозитория

## Подготовка (1-2 часа)

### 1. Создание новой ветки
- [ ] `git checkout -b feat/monorepo-migration`
- [ ] Убедиться, что ветка создана от актуальной main/master

### 2. Backup текущего состояния
- [ ] Создать тег текущей версии: `git tag v1.x-pre-monorepo`
- [ ] Зафиксировать текущее состояние документации

### 3. Установка инструментов
- [ ] Установить pnpm: `npm install -g pnpm`
- [ ] Проверить версию: `pnpm --version` (должна быть >= 8.0.0)

## Этап 1: Создание базовой структуры (2-3 часа)

### 4. Создание директорий
```bash
mkdir -p packages/{core,prosemirror,vanillajs,demo}
mkdir -p .github/workflows
```
- [ ] Создать все директории пакетов
- [ ] Создать директорию для CI/CD

### 5. Настройка workspace
- [ ] Создать `pnpm-workspace.yaml` в корне
- [ ] Скопировать содержимое из `monorepo-examples/pnpm-workspace.yaml`
- [ ] Обновить корневой `package.json`
- [ ] Скопировать шаблон из `monorepo-examples/root-package.json`
- [ ] Обновить имена, ссылки, maintainers

### 6. Базовые конфигурации
- [ ] Создать `tsconfig.base.json`
- [ ] Скопировать из `monorepo-examples/tsconfig.base.json`
- [ ] Обновить `.gitignore` для монорепозитория
- [ ] Добавить: `packages/*/dist/`, `packages/*/node_modules/`

## Этап 2: Пакет @asciidoc-prosemirror/core (4-6 часов)

### 7. Структура пакета core
- [ ] Создать `packages/core/src/`
- [ ] Создать `packages/core/test/`

### 8. Перенос исходников
```bash
cp -r src/* packages/core/src/
cp -r test/* packages/core/test/
```
- [ ] Скопировать все файлы из `src/`
- [ ] Скопировать все файлы из `test/`
- [ ] Проверить, что все файлы на месте

### 9. Конфигурация core пакета
- [ ] Создать `packages/core/package.json`
- [ ] Скопировать шаблон из `monorepo-examples/packages/core/package.json`
- [ ] Обновить версию, описание, мейнтейнеров
- [ ] Создать `packages/core/tsconfig.json`
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
- [ ] Создать `packages/core/vite.config.ts`
- [ ] Скопировать из `monorepo-examples/packages/core/vite.config.ts`

### 10. Создание README для core
- [ ] Создать `packages/core/README.md`
- [ ] Описать API пакета
- [ ] Добавить примеры использования
- [ ] Указать зависимости и peer dependencies

### 11. Тестирование core пакета
```bash
cd packages/core
pnpm install
pnpm build
pnpm test
```
- [ ] Установить зависимости
- [ ] Успешно собрать пакет
- [ ] Запустить и убедиться, что все тесты проходят
- [ ] Проверить, что типы генерируются (`dist/index.d.ts`)

## Этап 3: Пакет @asciidoc-prosemirror/prosemirror (8-12 часов)

### 12. Структура пакета prosemirror
- [ ] Создать `packages/prosemirror/src/`
- [ ] Создать `packages/prosemirror/test/`

### 13. Реализация базовых модулей

#### 13.1. Input Rules (`packages/prosemirror/src/input-rules.ts`)
```typescript
import { inputRules, InputRule } from 'prosemirror-inputrules'
import { asciidocSchema } from '@asciidoc-prosemirror/core'

// Правила автозамены для AsciiDoc
export function asciiDocInputRules() {
  return inputRules({
    rules: [
      // ** → strong
      new InputRule(/\*\*([^*]+)\*\*$/, (state, match, start, end) => {
        const { tr, schema } = state
        if (match[1]) {
          tr.replaceWith(start, end, schema.text(match[1], [schema.marks.strong.create()]))
        }
        return tr
      }),
      // __ → em
      new InputRule(/__([^_]+)__$/, (state, match, start, end) => {
        const { tr, schema } = state
        if (match[1]) {
          tr.replaceWith(start, end, schema.text(match[1], [schema.marks.em.create()]))
        }
        return tr
      }),
      // `` → code
      new InputRule(/`([^`]+)`$/, (state, match, start, end) => {
        const { tr, schema } = state
        if (match[1]) {
          tr.replaceWith(start, end, schema.text(match[1], [schema.marks.code.create()]))
        }
        return tr
      })
    ]
  })
}
```
- [ ] Создать файл `input-rules.ts`
- [ ] Реализовать правила для bold, italic, code
- [ ] Добавить правила для заголовков (= Title, == Heading)
- [ ] Добавить правила для списков (*, -, .)

#### 13.2. Keymap (`packages/prosemirror/src/keymap.ts`)
```typescript
import { keymap } from 'prosemirror-keymap'
import { toggleMark, setBlockType } from 'prosemirror-commands'
import { asciidocSchema } from '@asciidoc-prosemirror/core'

export function asciiDocKeymap() {
  return keymap({
    'Mod-b': toggleMark(asciidocSchema.marks.strong),
    'Mod-i': toggleMark(asciidocSchema.marks.em),
    'Mod-`': toggleMark(asciidocSchema.marks.code),
    'Mod-1': setBlockType(asciidocSchema.nodes.heading, { level: 1 }),
    'Mod-2': setBlockType(asciidocSchema.nodes.heading, { level: 2 }),
    'Mod-3': setBlockType(asciidocSchema.nodes.heading, { level: 3 })
  })
}
```
- [ ] Создать файл `keymap.ts`
- [ ] Добавить горячие клавиши для форматирования
- [ ] Добавить горячие клавиши для заголовков

#### 13.3. Commands (`packages/prosemirror/src/commands.ts`)
- [ ] Создать файл с кастомными командами
- [ ] Реализовать команды для работы с AsciiDoc-специфичными элементами

#### 13.4. Plugins (`packages/prosemirror/src/plugins.ts`)
- [ ] Создать файл с плагинами
- [ ] Добавить плагин для подсветки синтаксиса (опционально)

#### 13.5. Index (`packages/prosemirror/src/index.ts`)
```typescript
export { asciiDocInputRules } from './input-rules'
export { asciiDocKeymap } from './keymap'
export { asciiDocCommands } from './commands'
export { asciiDocPlugins } from './plugins'
```
- [ ] Создать главный экспорт файл

### 14. Конфигурация prosemirror пакета
- [ ] Создать `packages/prosemirror/package.json`
- [ ] Скопировать из `monorepo-examples/packages/prosemirror/package.json`
- [ ] Создать `packages/prosemirror/tsconfig.json`
- [ ] Создать `packages/prosemirror/vite.config.ts`
- [ ] Создать `packages/prosemirror/README.md`

### 15. Тестирование prosemirror пакета
- [ ] Написать тесты для input rules
- [ ] Написать тесты для keymap
- [ ] Написать тесты для commands
- [ ] Запустить `pnpm test` и убедиться в успехе

## Этап 4: Пакет @asciidoc-prosemirror/vanillajs (6-8 часов)

### 16. Подготовка vanillajs пакета
- [ ] Создать `packages/vanillajs/src/`
- [ ] Создать `packages/vanillajs/test/`

### 17. Перенос AsciiDocEditor
```bash
cp demo/src/AsciiDocEditor.tsx packages/vanillajs/src/AsciiDocEditor.ts
```
- [ ] Скопировать `AsciiDocEditor.tsx`
- [ ] Переименовать в `.ts` (убрать TSX расширение, если нет JSX)
- [ ] Обновить импорты:
  - `'../../src/index'` → `'@asciidoc-prosemirror/core'`
  - Добавить импорты из `'@asciidoc-prosemirror/prosemirror'`

### 18. Рефакторинг AsciiDocEditor
- [ ] Убрать JSX зависимости (если есть)
- [ ] Вынести конфигурацию по умолчанию в отдельный файл
- [ ] Создать `packages/vanillajs/src/config.ts`
```typescript
export const defaultEditorConfig = {
  placeholder: 'Start writing AsciiDoc...',
  className: 'asciidoc-editor',
  readOnly: false
}
```

### 19. Создание index файла
- [ ] Создать `packages/vanillajs/src/index.ts`
```typescript
export { AsciiDocEditor } from './AsciiDocEditor'
export type { AsciiDocEditorConfig } from './AsciiDocEditor'
export { defaultEditorConfig } from './config'
```

### 20. Конфигурация vanillajs пакета
- [ ] Создать `packages/vanillajs/package.json`
- [ ] Скопировать из `monorepo-examples/packages/vanillajs/package.json`
- [ ] Создать `packages/vanillajs/tsconfig.json`
- [ ] Создать `packages/vanillajs/vite.config.ts`
- [ ] Создать `packages/vanillajs/README.md`

### 21. Тестирование vanillajs пакета
- [ ] Создать unit тесты для AsciiDocEditor
- [ ] Проверить инициализацию
- [ ] Проверить парсинг и сериализацию
- [ ] Проверить обработку ошибок
- [ ] Запустить `pnpm test`

## Этап 5: Пакет @asciidoc-prosemirror/demo (2-3 часа)

### 22. Миграция demo приложения
```bash
# Скопировать содержимое, но не перезаписывать package.json
cp demo/index.html packages/demo/
cp demo/vite.config.ts packages/demo/
cp demo/playwright.config.ts packages/demo/
cp -r demo/public packages/demo/
cp -r demo/tests packages/demo/
```
- [ ] Скопировать все необходимые файлы
- [ ] Создать `packages/demo/src/`

### 23. Обновление исходников demo
- [ ] Создать новый `packages/demo/src/main.ts`
```typescript
import { AsciiDocEditor } from '@asciidoc-prosemirror/vanillajs'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

const editor = new AsciiDocEditor({
  container: app,
  initialContent: `= AsciiDoc Editor Demo

Welcome to the AsciiDoc editor!

== Features

* Full AsciiDoc support
* Real-time preview
* Error handling

== Try it out

Start editing this document...`,
  onChange: (content) => {
    console.log('Content changed:', content)
  }
})
```
- [ ] Обновить импорты на workspace dependencies
- [ ] Убрать относительные импорты из `../../src`
- [ ] Скопировать styles из `demo/src/style.css`

### 24. Конфигурация demo пакета
- [ ] Создать `packages/demo/package.json`
- [ ] Скопировать из `monorepo-examples/packages/demo/package.json`
- [ ] Убедиться, что `"private": true`
- [ ] Создать `packages/demo/tsconfig.json`
- [ ] Создать `packages/demo/README.md`

### 25. Тестирование demo
```bash
cd packages/demo
pnpm install
pnpm dev
```
- [ ] Установить зависимости
- [ ] Запустить dev сервер
- [ ] Открыть в браузере и проверить работу
- [ ] Проверить, что редактор инициализируется
- [ ] Проверить, что можно редактировать текст

## Этап 6: CI/CD и автоматизация (3-4 часа)

### 26. GitHub Actions workflows
- [ ] Создать `.github/workflows/ci.yml`
- [ ] Скопировать из `monorepo-examples/.github-workflows-ci.yml`
- [ ] Создать `.github/workflows/publish.yml`
- [ ] Скопировать из `monorepo-examples/.github-workflows-publish.yml`

### 27. Настройка Changesets
```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```
- [ ] Установить changesets
- [ ] Инициализировать конфигурацию
- [ ] Обновить `.changeset/config.json`
```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [
    ["@asciidoc-prosemirror/core", "@asciidoc-prosemirror/prosemirror", "@asciidoc-prosemirror/vanillajs"]
  ],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@asciidoc-prosemirror/demo"]
}
```

### 28. Тестирование CI локально
```bash
# Установить act (GitHub Actions локально)
# brew install act (macOS)
# или скачать с https://github.com/nektos/act

act -l  # список workflows
act push  # симулировать push
```
- [ ] (Опционально) Установить act
- [ ] (Опционально) Протестировать CI локально

## Этап 7: Документация (4-6 часов)

### 29. Обновление корневого README
- [ ] Обновить `README.md` в корне
- [ ] Описать структуру монорепозитория
- [ ] Добавить badges для всех пакетов
- [ ] Добавить quick start примеры
- [ ] Добавить ссылки на пакеты

### 30. README для каждого пакета
- [ ] Создать детальный `packages/core/README.md`
  - API документация
  - Примеры использования
  - Installation
- [ ] Создать `packages/prosemirror/README.md`
  - Список плагинов и их описание
  - Примеры использования
- [ ] Создать `packages/vanillajs/README.md`
  - API AsciiDocEditor
  - Конфигурация
  - Примеры интеграции с фреймворками
- [ ] Создать `packages/demo/README.md`
  - Как запустить локально
  - Как запустить тесты

### 31. Migration Guide
- [ ] Проверить и дополнить `MIGRATION_GUIDE.md`
- [ ] Добавить реальные примеры кода
- [ ] Добавить troubleshooting секцию

### 32. Contributing Guide
- [ ] Создать `CONTRIBUTING.md`
```markdown
# Contributing to AsciiDoc ProseMirror

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/my-feature`

## Making Changes

1. Make your changes in the appropriate package
2. Add tests for your changes
3. Run tests: `pnpm test`
4. Build: `pnpm build`
5. Create a changeset: `pnpm changeset`

## Commit Convention

We use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

## Pull Request Process

1. Update documentation
2. Ensure all tests pass
3. Create a changeset
4. Submit PR with clear description
```

### 33. CHANGELOG
- [ ] Создать `CHANGELOG.md` для отслеживания изменений
- [ ] Добавить секцию для v2.0.0

## Этап 8: Финальное тестирование (4-6 часов)

### 34. Установка всех зависимостей с нуля
```bash
# Очистить все node_modules
pnpm clean
rm -rf node_modules packages/*/node_modules

# Очистить lock file
rm pnpm-lock.yaml

# Переустановить
pnpm install
```
- [ ] Очистить все зависимости
- [ ] Переустановить с нуля
- [ ] Убедиться, что нет ошибок

### 35. Сборка всех пакетов
```bash
pnpm build:all
```
- [ ] Собрать все пакеты
- [ ] Проверить, что `dist/` создается в каждом пакете
- [ ] Проверить, что типы генерируются

### 36. Запуск всех тестов
```bash
pnpm test
```
- [ ] Запустить тесты во всех пакетах
- [ ] Убедиться, что все тесты проходят
- [ ] Проверить coverage (опционально)

### 37. Тестирование demo приложения
```bash
pnpm dev
```
- [ ] Запустить demo
- [ ] Открыть в браузере
- [ ] Проверить все функции редактора
- [ ] Проверить, что нет ошибок в консоли

### 38. E2E тесты
```bash
pnpm --filter @asciidoc-prosemirror/demo test
```
- [ ] Запустить Playwright тесты
- [ ] Убедиться, что все тесты проходят
- [ ] Проверить скриншоты (если есть)

### 39. Проверка публикации (dry run)
```bash
# Dry run публикации без реальной отправки
pnpm -r --filter='!@asciidoc-prosemirror/demo' publish --dry-run
```
- [ ] Запустить dry-run публикации
- [ ] Проверить, какие файлы будут опубликованы
- [ ] Убедиться, что demo не публикуется

### 40. Проверка размеров пакетов
```bash
# Установить bundlephobia
npm install -g bundlephobia

# Или использовать размер dist/
du -sh packages/*/dist
```
- [ ] Проверить размеры dist/ директорий
- [ ] Убедиться, что размеры разумные
- [ ] core должен быть ~15-30KB
- [ ] vanillajs должен быть ~40-60KB

## Этап 9: Подготовка к релизу (2-3 часа)

### 41. Создание changeset для v2.0.0
```bash
pnpm changeset
# Выбрать major для всех пакетов
# Описать breaking changes
```
- [ ] Создать changeset
- [ ] Описать все breaking changes
- [ ] Описать новые features

### 42. Обновление версий
```bash
pnpm changeset version
```
- [ ] Запустить changeset version
- [ ] Проверить, что версии обновились в package.json
- [ ] Проверить, что создан CHANGELOG

### 43. Финальная проверка
- [ ] Проверить все README
- [ ] Проверить все package.json
- [ ] Проверить LICENSE файлы
- [ ] Проверить .npmignore или files в package.json

### 44. Коммит изменений
```bash
git add .
git commit -m "feat: migrate to monorepo structure

BREAKING CHANGE: Package renamed from prosemirror-asciidoc to @asciidoc-prosemirror/core

- Split functionality into modular packages
- Add ready-to-use editor (@asciidoc-prosemirror/vanillajs)
- Add ProseMirror plugins (@asciidoc-prosemirror/prosemirror)
- Improve TypeScript support
- Add comprehensive documentation"
```
- [ ] Добавить все файлы
- [ ] Создать коммит с описанием изменений

### 45. Push и создание PR
```bash
git push origin feat/monorepo-migration
```
- [ ] Push ветки
- [ ] Создать Pull Request
- [ ] Заполнить описание PR
- [ ] Добавить checklist в PR description

## Этап 10: Review и публикация (время зависит от review)

### 46. Code Review
- [ ] Дождаться review от коллег
- [ ] Внести необходимые правки
- [ ] Ответить на комментарии

### 47. Мердж PR
- [ ] Убедиться, что CI прошел успешно
- [ ] Получить approve от reviewers
- [ ] Мерджить PR в main

### 48. Публикация пакетов
```bash
# Если настроен auto-publish через GitHub Actions, 
# публикация произойдет автоматически после мерджа

# Или вручную:
git checkout main
git pull
pnpm build
pnpm release
```
- [ ] Дождаться автоматической публикации (или опубликовать вручную)
- [ ] Проверить, что пакеты появились на npm
- [ ] Проверить, что версии правильные

### 49. Создание GitHub Release
- [ ] Создать новый Release на GitHub
- [ ] Тег: v2.0.0
- [ ] Название: "v2.0.0 - Monorepo Migration"
- [ ] Описание из CHANGELOG
- [ ] Прикрепить binaries (если есть)

### 50. Анонс
- [ ] Обновить документацию на сайте (если есть)
- [ ] Написать анонс в блоге/Twitter (если применимо)
- [ ] Уведомить пользователей о миграции

## Пострелизные задачи

### 51. Мониторинг
- [ ] Следить за Issues на GitHub
- [ ] Отвечать на вопросы пользователей
- [ ] Собирать feedback

### 52. Обновление зависимостей
- [ ] Настроить Dependabot/Renovate
- [ ] Создать `.github/dependabot.yml`

### 53. Документация
- [ ] Добавить примеры интеграции с популярными фреймворками
- [ ] Создать видео-туториалы (опционально)
- [ ] Обновить документацию на основе feedback

## Критерии успеха

✅ Все пакеты собираются без ошибок  
✅ Все тесты проходят  
✅ Demo приложение работает  
✅ Размеры пакетов разумные  
✅ TypeScript типы корректные  
✅ Документация полная и актуальная  
✅ CI/CD настроен и работает  
✅ Пакеты опубликованы на npm  
✅ GitHub Release создан  

## Troubleshooting

### Проблема: Циклические зависимости
**Решение:** Проверить, что зависимости идут только в одном направлении: core → prosemirror → vanillajs

### Проблема: TypeScript ошибки с workspace dependencies
**Решение:** Убедиться, что `tsconfig.json` в каждом пакете правильно настроен и использует `extends`

### Проблема: Тесты не находят модули
**Решение:** Убедиться, что пакеты собраны перед запуском тестов: `pnpm build && pnpm test`

### Проблема: pnpm install завершается с ошибкой
**Решение:** Очистить кэш: `pnpm store prune` и попробовать снова

### Проблема: Demo не запускается
**Решение:** Убедиться, что все зависимости собраны: `pnpm -r build`

## Полезные команды

```bash
# Проверить зависимости
pnpm list --depth=0

# Найти дубликаты
pnpm dedupe

# Обновить все зависимости
pnpm up -r

# Удалить неиспользуемые зависимости
pnpm prune

# Проверить outdated пакеты
pnpm outdated

# Проверить размер пакета
cd packages/core && npm pack && ls -lh *.tgz
```

## Оценка времени

| Этап | Минимум | Максимум |
|------|---------|----------|
| Подготовка | 1ч | 2ч |
| Базовая структура | 2ч | 3ч |
| Core пакет | 4ч | 6ч |
| Prosemirror пакет | 8ч | 12ч |
| Vanillajs пакет | 6ч | 8ч |
| Demo пакет | 2ч | 3ч |
| CI/CD | 3ч | 4ч |
| Документация | 4ч | 6ч |
| Тестирование | 4ч | 6ч |
| Релиз | 2ч | 3ч |
| **ИТОГО** | **36ч** | **53ч** |

*Примечание: Время указано для опытного разработчика, знакомого с ProseMirror и монорепозиториями*
