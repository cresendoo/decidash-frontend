import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  esbuild: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom')
            ) {
              return 'react-vendor'
            }
            if (id.includes('@tanstack')) {
              return 'tanstack'
            }
            if (id.includes('lightweight-charts')) {
              return 'charts'
            }
            return 'vendor'
          }
        },
        inlineDynamicImports: false,
      },
      treeshake: {
        moduleSideEffects: 'no-external',
      },
    },
  },
})
