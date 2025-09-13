import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    sourcemap: false, // Disable sourcemaps in production
  },
  css: {
    devSourcemap: false, // Disable CSS sourcemaps in dev
  },
  esbuild: {
    sourcemap: false, // Disable esbuild sourcemaps
  },
  optimizeDeps: {
    force: true, // Force re-optimization to regenerate deps without sourcemaps
  },
})
