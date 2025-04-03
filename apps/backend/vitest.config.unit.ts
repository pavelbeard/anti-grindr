import { config } from "dotenv";
import tsconfigpaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigpaths()],
  test: {
    include: ["./src/**/*.test.ts"],
    alias: {
      "lib": "/src/lib",
      "user": "/src/user",
      
    },
    env: {
      ...config({ path: "./.testing.env" }).parsed,
    },
  },
});
