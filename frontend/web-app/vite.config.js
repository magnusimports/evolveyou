import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: [
      'all',
      '5174-ijhrgjczsw8j5isslcyln-cb94686d.manusvm.computer',
      '5173-ijhrgjczsw8j5isslcyln-cb94686d.manusvm.computer'
    ]
  }
})
