import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy : {
      "/api" : {
        target: "http://localhost:8000", // Target server
        changeOrigin: true,             // Adjust `Host` header
        secure: false,                  // For HTTPS (if needed)
      },                // For HTTPS (if needed)
    }
  },
  plugins: [react()],
})
