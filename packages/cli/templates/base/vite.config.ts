import { defineConfig, PluginOption } from "vite";
import mini from "@mini/vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [mini() as PluginOption],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
