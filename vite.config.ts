import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1100, // the lazily loaded 3D chunk (three.js); the HTML content never waits for it
  },
})
