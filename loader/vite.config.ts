import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "MovingPlaceLoader",
      fileName: () => "loader.js",
      formats: ["iife"],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
