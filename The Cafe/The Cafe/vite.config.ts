import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  // ESBuild options for maximum production compression
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
    treeShaking: true,
  },
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
    minify: 'esbuild',
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      treeshake: true,
      input: {
        main: path.resolve(__dirname, "client", "index.html"),
      },
      output: {
        // Optimized manual chunks: isolate large dependencies for better caching.
        // IMPORTANT: Order matters! More-specific checks must come before
        // broader ones (e.g. react-dom before a generic "react" match).
        // Circular-dep rule: modules that import each other at init time
        // MUST land in the same chunk, otherwise Rollup may reference a
        // binding before the defining chunk has finished executing
        // (the "Cannot access 'Dn' before initialization" class of bugs).
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep huge standalone libraries in their own chunks
            if (id.includes('@fullcalendar')) {
              if (!id.includes('resource')) {
                return 'vendor-calendar';
              }
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            
            // Unify React, Emotion, MUI, and other foundational libs
            // into a single vendor chunk to completely eliminate 
            // circular dependency initialization bugs
            return 'vendor';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
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
