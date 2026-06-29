import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.base.config'

export default defineConfig(mergeConfig(baseConfig, {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/shared/test/setup.ts'],
    css: true,
    exclude: ['node_modules', 'web', 'desktop', 'dist', 'dist-web'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
}))
