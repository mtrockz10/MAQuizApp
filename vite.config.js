import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vite 8 bundles with rolldown, which can fail to resolve lucide.react's
    // ESM exports. Mark it external and resolve it at runtime via the importmap
    // in index.html (points to /lucide-react.esm.js, copied into public/).
    rolldownOptions: {
      external: ['lucide.react'],
    },
  },
})
