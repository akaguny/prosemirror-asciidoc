import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ProseMirrorAsciidoc',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: ['prosemirror-model', 'asciidoctor'],
      output: {
        globals: {
          'prosemirror-model': 'prosemirrorModel',
          'asciidoctor': 'asciidoctor'
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true
  }
})