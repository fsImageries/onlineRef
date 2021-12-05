import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/onlineRef/",
  build: {
    outDir: "./docs",
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src/"),
    },
  },
});
