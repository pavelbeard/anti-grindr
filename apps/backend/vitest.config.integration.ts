import tsconfigpaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    poolOptions: {
      threads: {
        maxThreads: 0,
      },
    },
    include: ['./src/tests/**/*.test.ts'],
    setupFiles: ['./src/tests/helpers/setup.ts'],
    alias: {
      lib: '/src/lib',
      user: '/src/user',
    },
    env: {
      ...process.env,
    },
  },
})
