import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// La entrega es un solo index.html que se abre con doble clic (R1 de research.md):
// sin división de código, un solo CSS y la tipografía incrustada como data:.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 400_000,
    chunkSizeWarningLimit: 1_000,
    rollupOptions: {
      output: { codeSplitting: false },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
