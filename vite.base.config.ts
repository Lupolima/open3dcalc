import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@/platform': path.resolve(__dirname, 'src/platform'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    allowedHosts: true,
  },
  optimizeDeps: {
    exclude: ['three', '@react-three/fiber', '@react-three/drei'],
  },
})
