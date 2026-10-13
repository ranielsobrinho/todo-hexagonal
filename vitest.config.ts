import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      PGHOST: 'localhost',
      PGPORT: '5432',
      PGUSER: 'test',
      PGPASSWORD: 'test',
      PGDATABASE: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/main.ts', 'src/interfaces/http/factories/**'],
    },
  },
})
