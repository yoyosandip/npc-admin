import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: "/npc-admin/",
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    port: 5174,
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
})
