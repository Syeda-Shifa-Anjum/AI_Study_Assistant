import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: 'all',
    hmr: {
      protocol: 'wss',
      host: '430420a2-9b44-4bcd-9a9e-86abfef5e30d-00-3bobksufpjn7k.pike.replit.dev',
      clientPort: 443,
    },
    proxy: {
      '/upload': 'http://localhost:8000',
      '/quiz': 'http://localhost:8000',
      '/chat': 'http://localhost:8000',
    }
  }
})
