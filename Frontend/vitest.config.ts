import { defineConfig } from "vitest/config";
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({ 
  test: {
    globals: true, // Enables describe(), test(), expect() globally
    environment: "jsdom", // Needed for React testing
    setupFiles: "./vitest.setup.ts", // Setup file (if needed)
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), 
    },
  },
});
