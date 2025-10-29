import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AsciidocProsemirrorCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: [
        'prosemirror-model',
        'asciidoctor'
      ],
      output: {
        // Provide global variables for UMD build (if needed)
        globals: {
          'prosemirror-model': 'ProseMirrorModel',
          'asciidoctor': 'Asciidoctor'
        }
      }
    },
    sourcemap: true,
    // Target modern browsers
    target: 'es2020'
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
