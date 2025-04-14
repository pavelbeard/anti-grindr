import tsconfigpaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    fileParallelism: false,
    poolOptions: {
      singleThread: true,
    },
    include: ['./src/tests/**/*.test.ts'],
    setupFiles: ['./src/tests/helpers/setup.ts'],
    alias: {
      lib: '/src/lib',
      user: '/src/user',
      profile: '/src/profile',
    },
    env: {
      ...process.env,
    },
  },
})
