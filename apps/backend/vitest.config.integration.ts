import { defineConfig } from "vitest/config";
import tsconfigpaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    poolOptions: {
      threads: {
        maxThreads: 0,
      },
    },
    include: ["./src/tests/**/*.test.ts"],
    setupFiles: ["./src/tests/helpers/setup.ts"],
    alias: {
      lib: "/src/lib",
      user: "/src/user",
    },
    env: {
      ...process.env,
    },
  },
});
