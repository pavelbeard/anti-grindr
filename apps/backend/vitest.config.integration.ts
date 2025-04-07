import { defineConfig } from 'vitest/config'
import tsconfigpaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    poolOptions: {
      threads: {
        maxThreads: 0
      }
    },
    include: ['./src/tests/**/*.test.ts'],
    setupFiles: ['./src/tests/helpers/setup.ts'],
    alias: {
      lib: '/src/lib',
      user: '/src/user'
    },
    env: {
      JWT_SECRET_KEY: 'change_me',
      JWT_REFRESH_SECRET_KEY: 'refresh_me',
      NODE_ENV: 'testing',
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5435/postgres?schema=public'
    }
  }
})
