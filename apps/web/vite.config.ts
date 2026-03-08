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
        // Rewrite cookie domain so the browser accepts Set-Cookie from port 3000.
        cookieDomainRewrite: 'localhost',
        // Rewrite cookie path: the API sets path=/auth but the browser sees
        // /api/auth/... — without this rewrite the browser never sends the cookie.
        cookiePathRewrite: { '/auth': '/api/auth' },
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
