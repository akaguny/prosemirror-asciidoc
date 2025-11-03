# RFC1: Переход на монорепозиторий

## Статус
Предложение

## Контекст
Текущий проект `prosemirror-asciidoc` содержит core функциональность парсинга/сериализации и демо-приложение с готовым редактором `AsciiDocEditor`. Код редактора из demo может быть полезен как отдельный пакет.

## Предложение
Реорганизовать проект в монорепозиторий из 4 пакетов:

### 1. `@asciidoc-prosemirror/core`
- Парсер AsciiDoc → ProseMirror
- Сериализатор ProseMirror → AsciiDoc  
- Схема ProseMirror для AsciiDoc
- **Исходники:** текущие `src/` и `test/`

### 2. `@asciidoc-prosemirror/prosemirror`
- Input rules для AsciiDoc синтаксиса
- Keymaps для форматирования
- Команды для AsciiDoc операций
- **Исходники:** новый код

### 3. `@asciidoc-prosemirror/vanillajs`
- Готовый редактор `AsciiDocEditor`
- Конфигурация по умолчанию
- **Исходники:** `demo/src/AsciiDocEditor.tsx` → рефакторинг в `.ts`

### 4. `@asciidoc-prosemirror/demo`
- Демо-приложение (Vite + vanilla JS)
- E2E тесты
- **Не публикуется** (`private: true`)

## Структура

```
asciidoc-prosemirror/
├── packages/
│   ├── core/
│   │   ├── src/          # из текущей src/
│   │   ├── test/         # из текущей test/
│   │   └── package.json
│   ├── prosemirror/
│   │   ├── src/
│   │   │   ├── input-rules.ts
│   │   │   ├── keymap.ts
│   │   │   ├── commands.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── vanillajs/
│   │   ├── src/
│   │   │   ├── AsciiDocEditor.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── demo/
│       ├── src/
│       └── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Зависимости между пакетами

```
core (базовый)
  ↓
prosemirror (зависит от core)
  ↓
vanillajs (зависит от core + prosemirror)
  ↓
demo (зависит от vanillajs)
```

## Инструменты

- **Package manager:** pnpm workspaces
- **Версионирование:** changesets
- **Сборка:** vite (для всех пакетов)
- **Тесты:** vitest (unit), playwright (E2E для demo)

## Версионирование

- `@asciidoc-prosemirror/core`: `2.0.0` (breaking change от `prosemirror-asciidoc`)
- `@asciidoc-prosemirror/prosemirror`: `0.0.0` (новый пакет)
- `@asciidoc-prosemirror/vanillajs`: `0.0.0` (новый пакет)
- `@asciidoc-prosemirror/demo`: `0.0.0` (private)

## Примеры конфигураций

Все готовые конфигурации находятся в `monorepo-examples/`:
- `pnpm-workspace.yaml`
- `root-package.json` 
- `tsconfig.base.json`
- `packages/*/package.json`
- `packages/*/vite.config.ts`
- `.github-workflows-*.yml`
