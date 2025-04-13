import { config } from 'dotenv'
import tsconfigpaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    include: ['./src/**/*.test.ts', '!src/tests'],
    exclude: ['./src/profile/profile.schemas.test.ts'],
    alias: {
      lib: '/src/lib',
      user: '/src/user',
      profile: '/src/profile',
    },
    env: {
      ...config({ path: './.testing.env' }).parsed,
    },
  },
})
