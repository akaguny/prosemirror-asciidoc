# Примеры конфигураций для монорепозитория

Эта директория содержит готовые к использованию примеры конфигурационных файлов для создания монорепозитория.

## 📁 Содержимое

### Корневые конфигурации

- **`pnpm-workspace.yaml`** - Конфигурация pnpm workspace
- **`root-package.json`** - Корневой package.json со скриптами для управления всеми пакетами
- **`tsconfig.base.json`** - Базовая конфигурация TypeScript, наследуемая всеми пакетами
- **`EXAMPLE_README.md`** - Пример README для корня монорепозитория

### Конфигурации пакетов

#### `packages/core/`
- **`package.json`** - Конфигурация для @asciidoc-prosemirror/core
- **`vite.config.ts`** - Vite конфигурация для сборки библиотеки

#### `packages/prosemirror/`
- **`package.json`** - Конфигурация для @asciidoc-prosemirror/prosemirror

#### `packages/vanillajs/`
- **`package.json`** - Конфигурация для @asciidoc-prosemirror/vanillajs
- **`vite.config.ts`** - Vite конфигурация с jsdom для тестов

#### `packages/demo/`
- **`package.json`** - Конфигурация для @asciidoc-prosemirror/demo (private)

### CI/CD

- **`.github-workflows-ci.yml`** - GitHub Actions workflow для CI (сборка и тесты)
- **`.github-workflows-publish.yml`** - GitHub Actions workflow для автоматической публикации

## 🚀 Использование

### Шаг 1: Скопировать корневые файлы

```bash
# Из директории monorepo-examples
cp pnpm-workspace.yaml ../pnpm-workspace.yaml
cp root-package.json ../package.json
cp tsconfig.base.json ../tsconfig.base.json
```

### Шаг 2: Создать структуру пакетов

```bash
mkdir -p ../packages/{core,prosemirror,vanillajs,demo}
```

### Шаг 3: Скопировать конфигурации пакетов

```bash
# Core
cp packages/core/package.json ../packages/core/
cp packages/core/vite.config.ts ../packages/core/

# Prosemirror
cp packages/prosemirror/package.json ../packages/prosemirror/

# VanillaJS
cp packages/vanillajs/package.json ../packages/vanillajs/
cp packages/vanillajs/vite.config.ts ../packages/vanillajs/

# Demo
cp packages/demo/package.json ../packages/demo/
```

### Шаг 4: Настроить CI/CD

```bash
mkdir -p ../.github/workflows
cp .github-workflows-ci.yml ../.github/workflows/ci.yml
cp .github-workflows-publish.yml ../.github/workflows/publish.yml
```

### Шаг 5: Обновить значения

После копирования, обновите следующие поля во всех файлах:
- `repository.url` - URL вашего репозитория
- `author` - Информация об авторе
- `homepage` - URL домашней страницы
- Версии зависимостей (если необходимо)

## 📝 Важные замечания

### package.json

Все package.json файлы содержат placeholder'ы, которые нужно обновить:

```json
{
  "repository": {
    "url": "git+https://github.com/your-org/asciidoc-prosemirror.git"
    // ↑ Измените на ваш репозиторий
  },
  "author": "Your Name <your@email.com>",
  // ↑ Измените на ваше имя
}
```

### Workspace dependencies

В package.json пакетов используется `"workspace:*"` для ссылок на другие пакеты монорепозитория:

```json
{
  "dependencies": {
    "@asciidoc-prosemirror/core": "workspace:*"
  }
}
```

При публикации pnpm автоматически заменит `workspace:*` на актуальную версию.

### CI/CD секреты

Для публикации в npm через GitHub Actions нужно добавить секрет:

1. Перейти в Settings → Secrets → Actions
2. Добавить `NPM_TOKEN` с токеном из npmjs.com

### tsconfig.json для каждого пакета

В каждом пакете создайте `tsconfig.json`:

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

## 🔧 Настройка после копирования

### 1. Инициализация workspace

```bash
cd ..  # Вернуться в корень проекта
pnpm install
```

### 2. Создание структуры исходников

```bash
# Core
mkdir -p packages/core/src packages/core/test
# Скопировать существующие src/* в packages/core/src/

# Prosemirror (новый пакет)
mkdir -p packages/prosemirror/src packages/prosemirror/test

# VanillaJS
mkdir -p packages/vanillajs/src packages/vanillajs/test
# Скопировать AsciiDocEditor из demo

# Demo
mkdir -p packages/demo/src packages/demo/tests
# Скопировать содержимое demo/
```

### 3. Сборка и тестирование

```bash
# Собрать все пакеты
pnpm build

# Запустить тесты
pnpm test

# Запустить demo
pnpm dev
```

## 📚 Дополнительные ресурсы

- [Полный план миграции](../MONOREPO_MIGRATION_PLAN.md)
- [Руководство по миграции](../MIGRATION_GUIDE.md)
- [Пошаговый чеклист](../IMPLEMENTATION_CHECKLIST.md)
- [Архитектурная диаграмма](../ARCHITECTURE_DIAGRAM.md)

## ❓ Частые вопросы

### Почему pnpm?

- Быстрее npm/yarn
- Эффективное использование дискового пространства
- Встроенная поддержка workspaces
- Строгая изоляция зависимостей

### Можно ли использовать npm workspaces?

Да, замените `pnpm-workspace.yaml` на настройку workspaces в корневом `package.json`:

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

И используйте `npm` вместо `pnpm` в скриптах.

### Как добавить новый пакет?

1. Создать директорию: `mkdir packages/new-package`
2. Создать `package.json` с name `@asciidoc-prosemirror/new-package`
3. Запустить `pnpm install` в корне
4. Добавить исходники и тесты

### Как обновить зависимость во всех пакетах?

```bash
# Обновить конкретную зависимость
pnpm up -r typescript

# Обновить все до latest
pnpm up -r
```

## 🎯 Следующие шаги

1. Скопируйте конфигурации как описано выше
2. Обновите placeholder'ы (repository, author, etc.)
3. Перенесите исходный код в packages/
4. Запустите `pnpm install && pnpm build`
5. Протестируйте: `pnpm test`
6. Следуйте [Implementation Checklist](../IMPLEMENTATION_CHECKLIST.md)

---

**Примечание:** Эти файлы - шаблоны. Адаптируйте их под ваши конкретные нужды.
