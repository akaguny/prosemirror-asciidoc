import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AsciidocProsemirrorVanillaJS',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      // Externalize peer dependencies
      external: [
        'prosemirror-model',
        'prosemirror-state',
        'prosemirror-view',
        'prosemirror-keymap',
        'prosemirror-commands',
        'prosemirror-history',
        '@asciidoc-prosemirror/core',
        '@asciidoc-prosemirror/prosemirror'
      ],
      output: {
        globals: {
          'prosemirror-model': 'ProseMirrorModel',
          'prosemirror-state': 'ProseMirrorState',
          'prosemirror-view': 'ProseMirrorView',
          'prosemirror-keymap': 'ProseMirrorKeymap',
          'prosemirror-commands': 'ProseMirrorCommands',
          'prosemirror-history': 'ProseMirrorHistory',
          '@asciidoc-prosemirror/core': 'AsciidocProsemirrorCore',
          '@asciidoc-prosemirror/prosemirror': 'AsciidocProsemirrorProsemirror'
        }
      }
    },
    sourcemap: true,
    target: 'es2020'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
