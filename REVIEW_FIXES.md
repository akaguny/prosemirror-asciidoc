# Review Fixes Applied

## Summary of Changes

All review comments have been addressed. Here's what was fixed:

---

## 1. ✅ Package Versions

### Fixed: `monorepo-examples/packages/prosemirror/package.json`
- **Changed:** `"version": "2.0.0"` → `"version": "0.0.0"`
- **Reason:** New package should start at 0.0.0, will be versioned by changesets

### Fixed: `monorepo-examples/packages/vanillajs/package.json`
- **Changed:** `"version": "2.0.0"` → `"version": "0.0.0"`
- **Reason:** New package should start at 0.0.0, will be versioned by changesets

### Note: Core package stays at 2.0.0
- `@asciidoc-prosemirror/core` represents the migrated existing package
- Version 2.0.0 indicates breaking change from v1.x `prosemirror-asciidoc`
- New packages (prosemirror, vanillajs) start at 0.0.0

---

## 2. ✅ ES Modules: Use import.meta instead of __dirname

### Fixed: `monorepo-examples/packages/core/vite.config.ts`
**Before:**
```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
```

**After:**
```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
```

### Fixed: `monorepo-examples/packages/vanillajs/vite.config.ts`
- Applied same fix as above
- **Reason:** With `"type": "module"` in package.json, `__dirname` is not available
- **Solution:** Use `import.meta.url` with `fileURLToPath` to get directory path

---

## 3. ✅ Build Target: Changed to esnext

### Fixed: `monorepo-examples/packages/core/vite.config.ts`
- **Changed:** `target: 'es2020'` → `target: 'esnext'`
- **Reason:** Use latest ECMAScript features, let consumers transpile if needed

### Fixed: `monorepo-examples/packages/vanillajs/vite.config.ts`
- **Changed:** `target: 'es2020'` → `target: 'esnext'`
- **Reason:** Same as above

---

## 4. ✅ Invalid JSON: Removed comments from tsconfig.base.json

### Fixed: `monorepo-examples/tsconfig.base.json`
**Before:**
```json
{
  "compilerOptions": {
    // Target and Module
    "target": "ES2020",
    "module": "ESNext",
    ...
    // Paths (для IDE поддержки, workspace резолвится через pnpm)
    "paths": {
```

**After:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    ...
    "paths": {
```

- **Reason:** JSON does not support comments, causes parse errors
- **Solution:** Removed all inline comments
- **Alternative:** Could use `tsconfig.json` (supports comments via TypeScript parser)

---

## 5. ✅ Clarified Demo Application Type

### Fixed: `MONOREPO_SUMMARY.md`
**Before:**
```markdown
### 4. `@asciidoc-prosemirror/demo` 🎨 Демо (private)
- **Что:** Demo приложение с примерами
```

**After:**
```markdown
### 4. `@asciidoc-prosemirror/demo` 🎨 Демо (private)
- **Что:** Vite-приложение для демонстрации и тестирования (не React, pure JS)
```

- **Reason:** Clarify that demo is a Vite app with vanilla JavaScript, not React
- **Context:** Demo uses plain TypeScript/JavaScript, not React/Vue/etc

---

## Validation

### Files Modified
1. ✅ `monorepo-examples/packages/prosemirror/package.json` - version
2. ✅ `monorepo-examples/packages/vanillajs/package.json` - version
3. ✅ `monorepo-examples/packages/core/vite.config.ts` - import.meta, target
4. ✅ `monorepo-examples/packages/vanillajs/vite.config.ts` - import.meta, target
5. ✅ `monorepo-examples/tsconfig.base.json` - removed comments
6. ✅ `MONOREPO_SUMMARY.md` - clarified demo type

### Checklist
- [x] All version numbers corrected
- [x] ES module compatibility fixed (import.meta.url)
- [x] Build target updated to esnext
- [x] JSON files are valid (no comments)
- [x] Documentation clarified

---

## Additional Notes

### Versioning Strategy
The monorepo uses the following versioning:
- **@asciidoc-prosemirror/core**: 2.0.0 (breaking change from prosemirror-asciidoc v1.x)
- **@asciidoc-prosemirror/prosemirror**: 0.0.0 (new package, will be versioned to 1.0.0)
- **@asciidoc-prosemirror/vanillajs**: 0.0.0 (new package, will be versioned to 1.0.0)
- **@asciidoc-prosemirror/demo**: 0.0.0 (private, never published)

### ES Modules Best Practices
When using `"type": "module"`:
- Use `import.meta.url` instead of `__filename`
- Use `fileURLToPath(new URL('.', import.meta.url))` instead of `__dirname`
- All `.js` files are treated as ES modules
- CommonJS requires `.cjs` extension

### TypeScript Configuration
For projects with comments in config:
- Use `tsconfig.json` (supports comments via TS parser)
- NOT `tsconfig.base.json` if it needs to be parsed as pure JSON
- Or use external documentation for complex configurations

---

## Ready for Review

All requested changes have been implemented and validated. The monorepo examples are now ready for use.
