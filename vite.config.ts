import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    allowedHosts: [
      'ridealert-adminpanel-1.onrender.com',
      'localhost'
    ],
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173
  }
})