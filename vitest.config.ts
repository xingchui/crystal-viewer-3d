import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/__tests__/**', 'src/**/*.d.ts']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
