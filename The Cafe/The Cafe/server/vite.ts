import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { port: 24678 },
    allowedHosts: true as const,
    strictPort: false,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // SPA fallback: serve index.html for non-API routes
  app.use((req, res, next) => {
    // Don't intercept API calls or .well-known requests
    if (req.path.startsWith("/api") || req.path.startsWith("/.well-known")) {
      return next();
    }

    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      
      vite.transformIndexHtml(url, template).then((page) => {
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      });
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static files from dist/public with aggressive caching policies
  app.use(express.static(distPath, {
    setHeaders: (res, pathStr) => {
      // Vite puts hashed immutable assets inside the /assets folder
      if (pathStr.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (pathStr.endsWith('.html')) {
        // Never cache HTML so the browser always fetches the latest asset links
        res.setHeader('Cache-Control', 'no-cache');
      } else {
        // Subtle caching for other generic files (favicon, etc)
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    }
  }));

  // SPA fallback: serve index.html for all non-API routes
  app.use((req, res, next) => {
    // Don't intercept API calls or .well-known requests
    if (req.path.startsWith("/api") || req.path.startsWith("/.well-known")) {
      return next();
    }
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const html = fs.readFileSync(indexPath, "utf-8");
      res.status(200).set({ 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' }).end(html);
    } catch (err) {
      next(err);
    }
  });
}
