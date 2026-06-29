import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.base.config'
import path from 'node:path'

export default defineConfig(mergeConfig(baseConfig, {
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    sourcemap: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.desktop.html'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
  },
}))
