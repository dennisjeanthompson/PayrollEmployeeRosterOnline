import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    target: 'esnext',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "client", "index.html"),
      },
      output: {
        // Manual chunks for better code splitting and caching
        manualChunks: {
          // Vendor chunks - separate large libraries for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui-core': ['@mui/material', '@mui/system'],
          'vendor-mui-icons': ['@mui/icons-material'],
          'vendor-mui-x': ['@mui/x-data-grid', '@mui/x-date-pickers'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-calendar': ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
          'vendor-utils': ['date-fns', 'zod', 'hookform'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Terser options for maximum production compression
    terserOptions: {
      compress: {
        drop_console: true,   // Strip ALL console.* calls from production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info', 'console.debug'],
        passes: 2,            // Two compression passes for smaller output
      },
      mangle: {
        safari10: true,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    proxy: {
      // Proxy frontend API requests to the backend dev server.
      // Start the backend with `npm run dev` (it listens on port 5000).
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      // Keep strict but allow access to the project root (parent of `client`)
      // so Vite can serve optimized deps from the repository `node_modules`.
      strict: true,
      // Allow the repo root (The Cafe folder) so `node_modules/.vite` can be read
      // when the Vite root is set to `client`.
      allow: [path.resolve(__dirname)],
      deny: ["**/.*"],
    },
  },
});
