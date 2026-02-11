import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],

  // Only scan the main index.html for dependencies.
  // Prevents Vite from scanning email-template HTMLs, docs, etc.
  optimizeDeps: {
    entries: ['index.html'],
  },

  // Exclude non-app directories from file watching to prevent crashes
  server: {
    watch: {
      ignored: ['**/docs/**', '**/supabase/**', '**/dist/**', '**/*.OLD'],
    },
  },
})
