import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      "@popup": "/src/services/popup",
      "@api": "/src/services/api",
      "@storage": "/src/services/storage",
      "@services": "/src/services",
      "@components": "/src/components",
      "@views": "/src/views",
      "@i18n": "/src/i18n",
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/static": {
        target: "https://physics-static-cn.turtlesim.com",
        changeOrigin: true,
        rewrite: (path) => path.replace("/static", ""),
        headers: {
          Referer: "https://www.turtlesim.com/",
        },
        secure: false,
      },
      "/api": {
        target: "https://physics-api-cn.turtlesim.com",
        changeOrigin: true,
        rewrite: (path) => path.replace("/api", ""),
        headers: {
          Referer: "https://www.turtlesim.com/",
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("highlight.js")) {
            return "highlightjs";
          }
        },
      },
    },
  },
});
