# Примеры конфигураций для монорепозитория

Готовые к использованию конфигурационные файлы для создания монорепозитория.

## Содержимое

### Корневые конфигурации
- `pnpm-workspace.yaml` - Конфигурация pnpm workspace
- `root-package.json` - Корневой package.json со скриптами
- `tsconfig.base.json` - Базовая TypeScript конфигурация

### Конфигурации пакетов
- `packages/core/package.json` + `vite.config.ts`
- `packages/prosemirror/package.json`
- `packages/vanillajs/package.json` + `vite.config.ts`
- `packages/demo/package.json`

### CI/CD
- `.github-workflows-ci.yml` - Workflow для сборки и тестов
- `.github-workflows-publish.yml` - Workflow для автопубликации

## Использование

См. [CTONEW1-instruction.md](../CTONEW1-instruction.md) для пошаговых инструкций.
