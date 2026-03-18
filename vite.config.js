// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.png"],
      manifest: {
        name: "Shine CRM",
        short_name: "Shine CRM",
        description: "Shine Infosolutions CRM Application",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon.png", sizes: "192x192", type: "image/png" },
          { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: "NetworkFirst",
            options: { cacheName: "api-cache" },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173,
  },
  build: {
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
          utils: ['axios', 'react-toastify']
        }
      }
    }
  },
  publicDir: "public",
});
