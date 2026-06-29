import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * Vite configuration for Open3DCalc Desktop (Electron renderer).
 *
 * Key differences from the web config:
 *  - No PWA plugin (not needed in Electron)
 *  - base: './' for file:// protocol compatibility
 *  - Build output to 'dist' (loaded by Electron main process)
 *  - Three.js modules excluded from optimization (native ESM)
 */
export default defineConfig({
  // Relative base for Electron's file:// protocol
  base: './',

  plugins: [
    react(),
    tailwindcss(),
  ],

  optimizeDeps: {
    // Three.js and react-three-fiber use native ESM — exclude from
    // optimization to avoid dual-bundle issues in Electron
    exclude: ['three', '@react-three/fiber', '@react-three/drei'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // ES modules work natively with Electron's Chromium
    target: 'esnext',
    // Generate source maps for debugging renderer issues
    sourcemap: true,
    // Avoid warnings about chunk size for Three.js
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },

  // Dev server used when running `npm run dev:renderer`
  server: {
    port: 5173,
    strictPort: true,
    // Allow Electron to load from this origin
    cors: true,
  },
})
