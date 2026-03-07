import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      exclude: ['src/main.tsx', 'src/router.tsx', '**/*.module.css', '**/index.ts', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@ironquill/shared': new URL('../../packages/shared/src/index.ts', import.meta.url).pathname,
    },
  },
});
