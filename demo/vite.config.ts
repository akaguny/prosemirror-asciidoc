import { defineConfig } from 'vite'

export default defineConfig({
  base: '/prosemirror-asciidoc/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    dedupe: ['prosemirror-model']
  }
})