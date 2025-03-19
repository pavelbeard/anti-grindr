import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss/plugin";

export default defineConfig({
  // @ts-expect-error: I don't know why this is happening with the `tailwindcss` plugin
  plugins: [react(), tailwindcss()],
});
