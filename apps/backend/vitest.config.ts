import tsconfigpaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    alias: {
      "@/*": new URL("./src/*", import.meta.url).pathname,
    },
  },
});
