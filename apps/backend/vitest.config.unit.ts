import { config } from 'dotenv'
import { defineConfig } from 'vitest/config'
import tsconfigpaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    include: ['./src/**/*.test.ts', '!src/tests'],
    alias: {
      lib: '/src/lib',
      user: '/src/user'
    },
    env: {
      ...config({ path: './.testing.env' }).parsed
    }
  }
})
