import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: 'test',
    },
    setupFiles: [],
    include: ['tests/**/*.test.ts'],
    // Integration suites share a database and deliberately create overlapping
    // fixture names. Run files serially to prevent cross-suite interference.
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types/**'],
    },
  },
});
