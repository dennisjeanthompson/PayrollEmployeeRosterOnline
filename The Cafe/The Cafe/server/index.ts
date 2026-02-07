import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { networkInterfaces } from "os";
import { initializeDatabase, createAdminAccount, seedDeductionRates, seedPhilippineHolidays, seedSampleUsers, seedSampleSchedulesAndPayroll, resetDatabase, markSetupComplete, seedSampleShiftTrades } from "./init-db";
import { promptDatabaseChoice, deleteDatabaseFile, displayDatabaseStats, loadSampleData } from "./db-manager";
import { recreateConnection } from "./db";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy FIRST - required for Render.com
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ... (omitted)

(async () => {
  let loadSample = false;

  // Skip development-specific logic in production (Render)
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Check if FRESH_DB environment variable is set
    if (process.env.FRESH_DB === 'true') {
      console.log('\n🔄 FRESH_DB flag detected. Deleting existing database...\n');
      // Use proper Postgres reset logic
      await resetDatabase();
      // Recreate the database connection after deletion (if needed, though pool likely persists)
      recreateConnection();
    }

    // Check if this is an interactive terminal (not running in CI/CD or background)
    const isInteractive = process.stdin.isTTY && !process.env.CI && !process.env.NON_INTERACTIVE;

    // Prompt for database choice only in interactive mode and if not already handled by FRESH_DB
    if (isInteractive && process.env.FRESH_DB !== 'true') {
      const choice = await promptDatabaseChoice();

      if (choice === 'fresh') {
        deleteDatabaseFile();
        // Recreate the database connection after deletion
        recreateConnection();
        console.log('🔄 Starting with a fresh database...\n');
      } else if (choice === 'sample') {
        deleteDatabaseFile();
        // Recreate the database connection after deletion
        recreateConnection();
        console.log('🔄 Starting with a fresh database...\n');
        loadSample = true;
      } else {
        displayDatabaseStats();
      }
    }
  } else {
    console.log('🚀 Production mode: Using PostgreSQL (Neon) database');
    
    // Check if FORCE_RESEED is set to 'true' - this will reset and reseed the database
    if (process.env.FORCE_RESEED === 'true') {
      console.log('\n🔄 FORCE_RESEED flag detected. Resetting production database...\n');
      await resetDatabase();
      await initializeDatabase();
      // Load sample data flag
      loadSample = true;
      console.log('✅ Production database reset complete. Will reseed with sample data.\n');
    }
  }

  // Initialize database (creates tables if they don't exist)
  await initializeDatabase();

  // Load sample data if requested
  if (loadSample) {
    await loadSampleData();
  }

  // Create admin account if it doesn't exist
  await createAdminAccount();

  // Seed sample users (manager + employees)
  await seedSampleUsers();

  // Seed sample schedules and payroll data
  await seedSampleSchedulesAndPayroll();

  // Seed default deduction rates if table is empty
  await seedDeductionRates();

  // Seed Philippine holidays if table is empty
  await seedPhilippineHolidays();

  // Seed sample shift trades (pending, approved, open)
  await seedSampleShiftTrades();

  // Mark setup as complete since we have seeded data
  await markSetupComplete();
  console.log('✅ Setup marked as complete');

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    console.log("🔧 Using Vite dev server for frontend...");
    await setupVite(app, server);
  } else {
    console.log("📦 Serving static frontend files from dist/public...");
    serveStatic(app);
  }

  // Helper function to get local network IP
  const getLocalNetworkIP = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      const netInfo = nets[name];
      if (!netInfo) continue;
      
      for (const net of netInfo) {
        // Skip internal (i.e. 127.0.0.1) and non-IPv4 addresses
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
        if (net.family === familyV4Value && !net.internal) {
          return net.address;
        }
      }
    }
    return null;
  };

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);

  server.listen({
    port,
    host: "0.0.0.0",  // Bind to all interfaces for Codespaces/Docker
    //reusePort: true,
  }, () => {
    const localIP = getLocalNetworkIP();

    console.log('\n' + '='.repeat(70));
    console.log('🖥️ The Café Server (single origin)');
    console.log('='.repeat(70));
    console.log('\n📍 Server URLs:');
    console.log(`  ➜ Local:    http://localhost:${port}`);
    if (localIP) {
      console.log(`  ➜ Network:  http://${localIP}:${port}`);
    }
    console.log('\n👥 Access:');
    console.log(`  ➜ App URL: http://localhost:${port}`);
    if (localIP) {
      console.log(`  ➜ Network:  http://${localIP}:${port}`);
    }
    console.log('\n' + '='.repeat(70) + '\n');

    log(`Server ready on port ${port}`);
  });
})();
