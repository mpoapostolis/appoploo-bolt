import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  server: {
    proxy: {
      "/api/checkout-session": {
        target: "https://appoploo.vercel.app",
        // target: 'http://localhost:3000',
        changeOrigin: true,
        secure: true,
      },
      "/api/notify-purchase": {
        target: "https://appoploo.vercel.app",
        // target: 'http://localhost:3000',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "framer-motion"],
          map: ["mapbox-gl", "react-map-gl"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: "terser",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "mapbox-gl"],
  },
});
