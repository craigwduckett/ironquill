import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Rewrite cookie domain/path so the browser accepts Set-Cookie
        // responses from the API (port 3000) when the page is on port 5173.
        cookieDomainRewrite: 'localhost',
        // Forward the correct Host header so Fastify CORS/cookie logic works.
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
