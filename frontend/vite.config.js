import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // This tells Vite to STOP looking for Mapbox
  optimizeDeps: {
    exclude: ['react-map-gl', 'mapbox-gl']
  }
})