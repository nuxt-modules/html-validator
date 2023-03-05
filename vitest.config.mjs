import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@nuxtjs/html-validator': fileURLToPath(new URL('./src/module', import.meta.url))
    }
  },
  test: {
    coverage: {
      include: ['src'],
      reporter: ['text', 'json', 'html', 'lcov']
    }
  }
})
