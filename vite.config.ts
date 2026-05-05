import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },

      manifest: {
        name: "plweb2",
        short_name: "plweb",
        description: "Physics Lab Web - Online community",
        theme_color: "#3397e9ff",
        icons: [
          {
            src: "/assets/icons/logo-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/icons/logo-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        screenshots: [
          {
            src: "/assets/mobile.png",
            sizes: "818x1339",
            type: "image/png",
          },
          {
            src: "/assets/desktop.png",
            sizes: "1033x698",
            type: "image/png",
            form_factor: "wide",
          },
        ],
      },

      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}"],
        globIgnores: ["assets/icons/logo-192.png", "assets/icons/logo-512.png"],
      },
    }),
  ],
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
      // 代理/aliyun-oss
      "/static": {
        target: "https://physics-static-cn.turtlesim.com",
        changeOrigin: true,
        rewrite: (path) => {
          return path.replace("/static", "");
        },
        headers: {
          Referer: "https://www.turtlesim.com/",
        },
        secure: false, // 关闭 TLS 验证
      },
      "/api": {
        target: "https://physics-api-cn.turtlesim.com",
        changeOrigin: true,
        rewrite: (path) => {
          console.log(path.replace("/api", ""));
          return path.replace("/api", "");
        },
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
