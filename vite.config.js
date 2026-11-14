import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any sub-path (the app uses hash routing).
  base: "./",
  server: { port: 3000 },
  test: { environment: "node" },
});
