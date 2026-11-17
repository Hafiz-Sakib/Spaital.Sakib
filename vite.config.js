import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { target: "es2020", chunkSizeWarningLimit: 900 },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
