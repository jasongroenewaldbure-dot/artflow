import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
  esbuild: {
    target: 'esnext',
  },
  ssr: {
    noExternal: ['react-router-dom'],
    target: 'node'
  },
  define: {
    global: 'globalThis',
  },
  css: {
    preprocessorOptions: {
      scss: {
        // This line is crucial for injecting global styles using the alias.
        additionalData: `@use "@/styles/variables" as *;\n@use "@/styles/mixins" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:; worker-src 'self' blob: data:; connect-src 'self' https: ws: wss:; frame-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; object-src 'none'; base-uri 'self';"
    }
  },
})