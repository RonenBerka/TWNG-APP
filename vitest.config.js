import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Test runner config. Kept separate from vite.config.js so the production
// build stays untouched. The React plugin is here for component tests (jsdom);
// pure-logic tests run in the fast default "node" environment.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: ['src/lib/**', 'src/utils/**', 'src/services/**'],
    },
  },
});
