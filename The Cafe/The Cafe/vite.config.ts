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
            // ── 1. React core (must be checked FIRST so that
            //       node_modules/react inside MUI sub-deps isn't
            //       accidentally captured by a later MUI rule) ──
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'vendor-react-core';
            }

            // ── 2. Emotion (separated from MUI so there is no
            //       circular init between emotion ↔ MUI ↔ react) ──
            if (id.includes('@emotion')) {
              return 'vendor-react-core';  // lives with react to avoid cross-chunk circular refs
            }

            // ── 3. MUI core (material + system + base + icons).
            //       Icons are merged here to prevent the icons chunk
            //       from referencing an uninitialised MUI binding. ──
            if (
              id.includes('@mui/material') ||
              id.includes('@mui/system') ||
              id.includes('@mui/icons-material') ||
              id.includes('@mui/base') ||
              id.includes('@mui/utils') ||
              id.includes('@mui/styled-engine')
            ) {
              return 'vendor-mui';
            }

            // ── 4. MUI X (data-grid, date-pickers) ──
            if (id.includes('@mui/x-data-grid') || id.includes('@mui/x-date-pickers')) {
              return 'vendor-mui-x';
            }

            // ── 5. Charts ──
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }

            // ── 6. FullCalendar ──
            if (id.includes('@fullcalendar')) {
              if (!id.includes('resource')) {
                return 'vendor-calendar';
              }
            }

            // ── 7. Routing / state (wouter, tanstack, etc.) ──
            if (id.includes('wouter')) {
              return 'vendor-react-core';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }

            // ── 8. Utility libs ──
            if (id.includes('date-fns') || id.includes('lodash') || id.includes('zod')) {
              return 'vendor-utils';
            }

            // ── 9. Everything else ──
            return 'vendor-others';
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
