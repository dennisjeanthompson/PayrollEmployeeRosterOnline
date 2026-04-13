import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session, { Session } from "express-session";
import PgSession from "connect-pg-simple";
import cors from "cors";
import { dbStorage } from "./db-storage";
import { insertShiftSchema, insertShiftTradeSchema, insertTimeOffRequestSchema } from '@shared/schema';
import type { PayrollEntry } from "@shared/schema";
import type { PayrollEntryBreakdownPayload, ShiftPayBreakdown } from "@shared/payroll-types";
import { z } from "zod";
import { registerBranchesRoutes } from "./routes/branches";

import { createEmployeeRouter } from "./routes/employees";
import { deductLeaveCredit } from './routes/leave-credits';
import { apiCache } from "./middleware/api-cache";
import { router as hoursRoutes } from "./routes/hours";
import payslipsRouter from "./routes/payslips";
import companySettingsRouter from "./routes/company-settings";
import { auditRouter, setAuditRealTimeManager, createAuditLog } from "./routes/audit";
import { reportsRouter } from "./routes/reports";
import { forecastRouter } from "./routes/forecast";
import { seedRatesRouter } from "./routes/seed-rates";
import holidaysRouter from "./routes/holidays";
import employeeUploadsRouter from "./routes/employee-uploads";
import { thirteenthMonthRouter } from "./routes/thirteenth-month";
import { leaveCreditsRouter } from "./routes/leave-credits";

import loansRouter from "./routes/loans";
import { db } from "./db";
import { thirteenthMonthLedger, deductionSettings as deductionSettingsTable } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID as _randomUUID } from "crypto";
import { resetDatabase, initializeDatabase, createAdminAccount, seedDeductionRates, seedPhilippineHolidays, seedSampleUsers, seedSampleSchedulesAndPayroll, seedSampleShiftTrades, markSetupComplete } from "./init-db";
import bcrypt from "bcrypt";
import { format } from "date-fns";
import crypto from "crypto";
import { validateShiftTimes, calculatePeriodPay, calculateShiftPay, buildPayrollEntryBreakdownPayload, HOLIDAY_RATES, NIGHT_DIFF_RATE, MONTHLY_WORKING_HOURS, DAILY_REGULAR_HOURS, MINS_PER_HOUR } from "./payroll-utils";
import { getPaymentDateString } from "@shared/payroll-dates";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import RealTimeManager from "./services/realtime-manager";

// Configure Neon WebSocket for serverless connection pooling
neonConfig.webSocketConstructor = ws;

// Use database storage instead of in-memory storage
const storage = dbStorage;

// Async route handler wrapper — catches unhandled rejections and returns 500
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: any) => {
      console.error(`[${req.method} ${req.path}] Unhandled error:`, error.message || error);
      if (!res.headersSent) {
        res.status(500).json({ message: error.message || 'Internal server error' });
      }
    });
  };
}

// Create PostgreSQL pool for session store with proper Neon configuration
const pgPool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,  // 10s timeout to prevent infinite hangs on cold starts
  idleTimeoutMillis: 30000,        // Close idle connections after 30s
  max: 5,                          // Limit pool size for session store
});

// Prevent unhandled pool errors from crashing the server
pgPool.on('error', (err) => {
  console.error('[SESSION POOL] Unexpected error on idle client:', err.message);
});

// Type for authenticated user
interface AuthUser {
  id: string;
  username: string;
  role: string;
  branchId: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Extend Express Session type
declare module 'express-session' {
  interface SessionData {
    user?: AuthUser;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create server first to support WebSocket initialization
  const httpServer = createServer(app);
  const realTimeManager = new RealTimeManager(httpServer);

  // Wire up realTimeManager for audit log broadcasting
  setAuditRealTimeManager(realTimeManager);

  // Type for authenticated requests
  interface AuthenticatedRequest extends Request {
    session: Session & {
      user: AuthUser;
    };
  }

  // Type guard for authenticated requests
  const isAuthenticated = (req: Request): req is AuthenticatedRequest => {
    return !!(req.session && req.session.user);
  };

  // Get authenticated user with type safety
  const getAuthenticatedUser = (req: Request): AuthUser | null => {
    return isAuthenticated(req) ? req.session.user : null;
  };

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    // Attach user to request object for easier access
    req.user = user;
    next();
  };

  // Role-based access control middleware
  const requireRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Admin has access to all manager routes
    const effectiveRoles = [...roles];
    if (roles.includes('manager') && !roles.includes('admin')) {
      effectiveRoles.push('admin');
    }
    
    if (!effectiveRoles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    // Attach user to request object for easier access
    req.user = user;
    next();
  };

  // Enable CORS — allow requests from the frontend origin (Vercel or localhost)
  const allowedOrigins = [
    process.env.FRONTEND_URL,           // e.g. https://your-app.vercel.app
    'http://localhost:5000',            // local dev (same origin)
    'http://localhost:5173',            // Vite dev server
    'http://localhost:3000',            // alternative local
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,  // Required for cross-origin cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));



  // Session configuration using PostgreSQL for production reliability
  const PgSessionStore = PgSession(session);
  
  const sessionConfig: any = {
    store: new PgSessionStore({
      pool: pgPool,
      tableName: 'session',
      createTableIfMissing: true,
      ttl: 24 * 60 * 60, // 24 hours in seconds
      disableTouch: false, // Allow touch to refresh session
      schemaName: 'public',
      pruneSessionInterval: false, // Disable automatic pruning to avoid stalling on cold connections
    }),
    secret: process.env.SESSION_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        console.warn('[WARN] SESSION_SECRET env var is not set! Using auto-generated fallback. Sessions will be invalidated on each restart.');
        return crypto.randomBytes(64).toString('hex');
      }
      return 'cafe-dev-secret-key-local-only';
    })(),
    resave: false, // Don't save unless modified
    saveUninitialized: false, // Don't create empty sessions
    name: 'cafe-session', // Custom session cookie name
    proxy: process.env.NODE_ENV === 'production', // Trust X-Forwarded-* headers on Render
    cookie: {
      // Allow explicit override via SESSION_COOKIE_SECURE env var.
      // By default, keep cookies secure in production (HTTPS). For local testing
      // you can set SESSION_COOKIE_SECURE=false to allow cookies over http://localhost.
      secure: process.env.SESSION_COOKIE_SECURE
        ? String(process.env.SESSION_COOKIE_SECURE).toLowerCase() === 'true'
        : (process.env.NODE_ENV === 'production'), // HTTPS only in production by default
      httpOnly: true, // Prevent JavaScript access for security
      // Only use 'none' in production if FRONTEND_URL is set, otherwise use 'lax'.
      // Browsers reject sameSite: 'none' when secure: false.
      sameSite: (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      path: '/', // Cookie available to entire app
      domain: undefined, // Let browser handle domain
    },
    rolling: true, // Roll session on each response to extend expiration
  };

  // Use PostgreSQL session store
  app.use(session(sessionConfig));

  // Middleware: Ensure session is always touched and saved
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Touch session to refresh expiration
    if (req.session?.user) {
      req.session.touch();
    }
    next();
  });

  // Setup check endpoint (no auth required)
  app.get("/api/setup/status", asyncHandler(async (req: Request, res: Response) => {
    try {
      const isComplete = await storage.isSetupComplete();
      res.json({ 
        isSetupComplete: isComplete,
      });
    } catch (error) {
      console.error('Setup status check error:', error);
      res.status(500).json({ message: 'Failed to check setup status' });
    }
  }));

  // Mount API Routers
  app.use("/api/loans", requireAuth, loansRouter);
  app.use(leaveCreditsRouter);

  // Setup endpoint (no auth required, only works if setup not complete)
  app.post("/api/setup", asyncHandler(async (req: Request, res: Response) => {
    try {
      // Check if setup is already complete
      const isComplete = await storage.isSetupComplete();
      if (isComplete) {
        return res.status(400).json({ message: 'Setup already completed' });
      }

      const { branch, manager } = z.object({
        branch: z.object({
          name: z.string().min(1),
          address: z.string().min(1),
          phone: z.string().optional(),
        }),
        manager: z.object({
          username: z.string().min(1),
          password: z.string().min(6),
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          hourlyRate: z.string(),
        }),
      }).parse(req.body);

      // Create branch
      const createdBranch = await storage.createBranch({
        name: branch.name,
        address: branch.address,
        phone: branch.phone || null,
        isActive: true,
      });

      // Create manager user
      const createdManager = await storage.createUser({
        username: manager.username,
        password: manager.password,
        firstName: manager.firstName,
        lastName: manager.lastName,
        email: manager.email,
        role: 'manager',
        position: 'Store Manager',
        hourlyRate: manager.hourlyRate,
        branchId: createdBranch.id,
        isActive: true,
      });

      // Mark setup as complete
      await storage.markSetupComplete();


      res.json({
        message: 'Setup completed successfully',
        branch: createdBranch,
        manager: {
          id: createdManager.id,
          username: createdManager.username,
          firstName: createdManager.firstName,
          lastName: createdManager.lastName,
          email: createdManager.email,
        }
      });
    } catch (error) {
      console.error('Setup error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid setup data', errors: error.errors });
      }
      res.status(500).json({ message: 'Setup failed' });
    }
  }));

  // Simple health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      port: process.env.PORT || '5000',
      timestamp: new Date().toISOString()
    });
  });

  // Health check endpoint for Render (must respond quickly)
  app.get("/healthz", (req: Request, res: Response) => {
    res.status(200).send('OK');
  });

  // Admin endpoint to fix all unhashed passwords (IMPORTANT: run once after identifying issues)
  app.post("/api/admin/fix-passwords", requireAuth, requireRole(["admin"]), asyncHandler(async (req: Request, res: Response) => {
    try {
      const { defaultPassword } = req.body;
      const passwordToHash = defaultPassword || 'password123'; // Default password if none provided
      
      // Get all users
      const allBranches = await storage.getAllBranches();
      let fixed = 0;
      let skipped = 0;
      const fixedUsers: string[] = [];
      
      for (const branch of allBranches) {
        const users = await storage.getUsersByBranch(branch.id);
        
        for (const user of users) {
          const isBcryptHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
          
          if (!isBcryptHash) {
            // Password is not hashed, hash it now
            await storage.updateUser(user.id, { password: passwordToHash });
            fixedUsers.push(user.username);
            fixed++;
          } else {
            skipped++;
          }
        }
      }
      
      res.json({
        message: `Fixed ${fixed} unhashed passwords, ${skipped} were already hashed`,
        fixed,
        skipped,
        fixedUsers,
        newPassword: passwordToHash,
      });
    } catch (error) {
      console.error('Fix passwords error:', error);
      res.status(500).json({ message: 'Failed to fix passwords' });
    }
  }));

  // Admin endpoint to reset a specific user's password
  app.post("/api/admin/reset-password", requireAuth, requireRole(["admin", "manager"]), asyncHandler(async (req: Request, res: Response) => {
    try {
      const { userId, newPassword } = req.body;
      
      if (!userId || !newPassword) {
        return res.status(400).json({ message: "userId and newPassword are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Managers can only reset passwords for employees in their branch
      const currentUser = req.user!;
      if (currentUser.role === 'manager') {
        if (user.branchId !== currentUser.branchId) {
          return res.status(403).json({ message: "Cannot reset password for user in another branch" });
        }
        if (user.role !== 'employee') {
          return res.status(403).json({ message: "Managers can only reset employee passwords" });
        }
      }
      
      await storage.updateUser(userId, { password: newPassword });
      
      res.json({ message: `Password reset successfully for ${user.username}` });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  }));

  // In-memory store for client-side debug reports (kept only in memory for local debugging)
  const clientDebugReports: Array<any> = [];

  // Endpoint to receive client-side debug reports (POSTed by injected script)
  app.post("/api/client-debug", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    try {
      const payload = req.body || {};
      const entry = {
        receivedAt: new Date().toISOString(),
        ip: req.ip,
        ua: req.get('user-agent'),
        url: payload.url || req.get('referer') || req.originalUrl,
        payload,
      };

      // Keep only the most recent 200 reports to avoid memory growth
      clientDebugReports.unshift(entry);
      if (clientDebugReports.length > 200) clientDebugReports.pop();


      // Accept via beacon/fetch without blocking client
      res.status(204).end();
    } catch (error) {
      console.error('Error receiving client debug report:', error);
      res.status(500).json({ message: 'Failed to record client debug report' });
    }
  }));

  // Simple viewer for collected client debug reports (for local debugging only)
  app.get("/api/client-debug", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    try {
      // Render a lightweight HTML page showing recent reports
      const rows = clientDebugReports.slice(0, 100).map((r, idx) => {
        const p = JSON.stringify(r.payload, null, 2).replace(/</g, '&lt;');
        const safeUrl = String(r.url || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        return `<section style="border-bottom:1px solid #eee;padding:12px 0"><h3>#${idx+1} - ${r.receivedAt} - ${safeUrl}</h3><pre style="white-space:pre-wrap;background:#111;color:#fff;padding:8px;border-radius:6px;overflow:auto;max-height:240px">${p}</pre></section>`;
      }).join('\n');

      const page = `<!doctype html><html><head><meta charset="utf-8"><title>Client Debug Reports</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:Arial,Helvetica,sans-serif;margin:20px"><h1>Client Debug Reports (recent)</h1>${rows||'<p>No reports yet</p>'}</body></html>`;
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(page);
    } catch (error) {
      console.error('Error rendering client debug reports:', error);
      res.status(500).json({ message: 'Failed to render debug reports' });
    }
  }));

  // Auth routes
  app.post("/api/auth/login", asyncHandler(async (req: Request, res: Response) => {
    try {
      const { username, password } = z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }).parse(req.body);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if password is a valid bcrypt hash
      const isBcryptHash = user.password && (user.password.startsWith('$2b$') || user.password.startsWith('$2a$'));
      
      let isPasswordValid = false;
      
      if (!isBcryptHash) {
        // Password is stored as plain text - compare directly and then hash it
        
        if (user.password === password) {
          // Password matches, now hash it for future logins
          const hashedPassword = await bcrypt.hash(password, 10);
          await storage.updateUser(user.id, { password }); // db-storage will hash it
          isPasswordValid = true;
        }
      } else {
        // Normal bcrypt comparison
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session user
      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        branchId: user.branchId
      };

      // Assign to session
      req.session.user = authUser;

      // Wait for session to be saved before responding
      // This ensures the Set-Cookie header is included in the response
      return new Promise<void>((resolve) => {
        req.session.save((err) => {
          if (err) {
            console.error('❌ Session save error:', err);
            res.status(500).json({ message: 'Failed to create session' });
          } else {


            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            
            // Set cache control headers
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            res.json({
              user: userWithoutPassword,
              authenticated: true
            });
          }
          resolve();
        });
      });
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Invalid request data"
      });
    }
  }));

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to log out' });
      }
      
      // Clear the session cookie - use the same name and attributes as configured in sessionConfig
      // The browser requires secure and sameSite attributes to match in cross-origin setups to delete the cookie
      res.clearCookie('cafe-session', { 
        path: '/',
        secure: process.env.SESSION_COOKIE_SECURE
          ? String(process.env.SESSION_COOKIE_SECURE).toLowerCase() === 'true'
          : (process.env.NODE_ENV === 'production'),
        sameSite: (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) ? 'none' : 'lax'
      });
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check session status (no auth required - used on page load)
  // Fetches fresh data from the DB so profile updates (TIN, email, etc.) are always current after refresh
  app.get("/api/auth/status", asyncHandler(async (req: Request, res: Response) => {
    try {
      const isSetupComplete = await storage.isSetupComplete();
      
      if (req.session?.user?.id) {
        // Fetch fresh data from DB to avoid returning stale session snapshot
        try {
          const freshUser = await storage.getUser(req.session.user.id);
          if (freshUser) {
            const { password: _, ...userWithoutPassword } = freshUser;
            res.json({ 
              authenticated: true, 
              isSetupComplete,
              user: { ...userWithoutPassword, branchId: req.session.user.branchId || userWithoutPassword.branchId }
            });
          } else {
            // User no longer exists in DB — session is stale
            res.json({ authenticated: false, isSetupComplete, user: null });
          }
        } catch (dbErr) {
          // DB error: fall back to session data rather than logging user out
          console.warn('[AUTH STATUS] DB fetch failed, falling back to session:', dbErr);
          res.json({ authenticated: true, isSetupComplete, user: req.session.user });
        }
      } else {
        res.json({ 
          authenticated: false, 
          isSetupComplete,
          user: null 
        });
      }
    } catch (error) {
      console.error('❌ [AUTH STATUS] Error:', error);
      res.json({ 
        authenticated: false, 
        isSetupComplete: false,
        user: null 
      });
    }
  }));

  app.get("/api/auth/me", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      // Return user with potentially overridden branchId from session
      res.json({ 
        user: { ...userWithoutPassword, branchId: req.user.branchId || userWithoutPassword.branchId }
      });
    } catch (error) {
      console.error('Error in /api/auth/me:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  }));

  // Switch branch (admin/manager only) — updates session branchId so all
  // existing GET endpoints automatically serve data for the new branch.
  app.put("/api/auth/switch-branch", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req: Request, res: Response) => {
    try {
      const { branchId } = req.body;
      if (!branchId || typeof branchId !== "string") {
        return res.status(400).json({ message: "branchId is required" });
      }

      // Verify the branch exists
      const branch = await storage.getBranch(branchId);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      // Update session user's branchId
      req.session.user = { ...req.session.user!, branchId };
      req.user = { ...req.user!, branchId };

      return new Promise<void>((resolve) => {
        req.session.save((err) => {
          if (err) {
            console.error("❌ Failed to save session after branch switch:", err);
            res.status(500).json({ message: "Failed to switch branch" });
          } else {
            res.json({ 
              message: "Branch switched successfully",
              branchId,
              branchName: branch.name,
            });
          }
          resolve();
        });
      });
    } catch (error) {
      console.error("Error switching branch:", error);
      res.status(500).json({ message: "Failed to switch branch" });
    }
  }));

  // Shifts routes
  app.get("/api/shifts", requireAuth, asyncHandler(async (req, res) => {
    const { startDate, endDate, userId: queryUserId } = req.query;
    const currentUser = req.user!;

    // If querying for another user, require manager role
    const targetUserId = queryUserId as string || currentUser.id;
    if (targetUserId !== currentUser.id && currentUser.role !== "manager" && currentUser.role !== "admin") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }


    const shifts = await storage.getShiftsByUser(
      targetUserId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );


    // Enrich shifts with date property extracted from startTime
    const enrichedShifts = shifts.map((shift: any) => ({
      ...shift,
      date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
    }));

    // Log what we're sending back for debugging
    
    res.json({ shifts: enrichedShifts });
  }));

  app.get("/api/shifts/branch", requireAuth, requireRole(["manager", "employee", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const branchId = req.user!.branchId;
      

      // PERFORMANCE FIX: Batch load all users and shifts in parallel instead of N+1 queries
      const [shifts, allUsers] = await Promise.all([
        storage.getShiftsByBranch(
          branchId,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        ),
        storage.getUsersByBranch(branchId)
      ]);
      

      // Create user lookup map for O(1) access
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      // Join shifts with users in memory (no additional DB calls)
      const shiftsWithUsers = shifts.map(shift => ({
        ...shift,
        user: userMap.get(shift.userId)
      }));

      // Filter out shifts for inactive employees
      let activeShifts = shiftsWithUsers.filter(shift => shift.user?.isActive);
      
      // PRIVACY: If user is an employee, ONLY show their own shifts
      if (req.user!.role === 'employee') {
        const userId = req.user!.id;
        activeShifts = activeShifts.filter(shift => shift.userId === userId);
      }
      
      if (activeShifts.length > 0) {
      }

      res.json({ shifts: activeShifts });
    } catch (error) {
      console.error('❌ [GET /api/shifts/branch] Error:', error);
      res.status(500).json({ message: 'Failed to fetch shifts' });
    }
  }));

  app.post("/api/shifts", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const shiftData = insertShiftSchema.parse(req.body);

      // Enforce branch ownership — manager can only create shifts in their own branch
      if (shiftData.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Cannot create shifts for another branch" });
      }
      // Verify the target employee belongs to the manager's branch
      const targetUser = await storage.getUser(shiftData.userId);
      if (!targetUser || targetUser.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Employee does not belong to your branch" });
      }



      // Validate shift times - end time must be after start time
      const timeError = validateShiftTimes(shiftData.startTime, shiftData.endTime);
      if (timeError) {
        return res.status(400).json({ message: timeError });
      }

      // Check if employee already has a shift on this calendar date
      const existingShifts = await storage.checkShiftOnDate(
        shiftData.userId,
        new Date(shiftData.startTime)
      );

      if (existingShifts.length > 0) {
        const existingStart = new Date(existingShifts[0].startTime);
        const existingEnd = new Date(existingShifts[0].endTime);
        return res.status(409).json({
          message: `Employee already has a shift scheduled on this day (${existingStart.toLocaleTimeString()} to ${existingEnd.toLocaleTimeString()}). Employees can only have 1 shift per day.`,
          code: 'SHIFT_CONFLICT',
          conflictingShift: existingShifts[0]
        });
      }

      const shift = await storage.createShift(shiftData);

      // Broadcast real-time shift creation
      realTimeManager.broadcastShiftCreated(shift);

      // Audit log for shift creation
      await createAuditLog({
        action: 'shift_create',
        entityType: 'shift',
        entityId: shift.id,
        userId: req.user!.id,
        newValues: { userId: shift.userId, branchId: shift.branchId, startTime: shift.startTime, endTime: shift.endTime, position: shift.position },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ shift });
    } catch (error: any) {
      console.error('Shift creation error:', error);
      if (error.errors) {
        // Zod validation error
        res.status(400).json({
          message: "Invalid shift data",
          errors: error.errors
        });
      } else {
        res.status(400).json({
          message: error.message || "Invalid shift data"
        });
      }
    }
  }));

  app.put("/api/shifts/:id", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      
      const updateData = insertShiftSchema.partial().parse(req.body);

      // Get the existing shift first to validate changes
      const existingShift = await storage.getShift(id);
      if (!existingShift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Verify the shift belongs to the manager's branch
      if (existingShift.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Cannot update shift from another branch" });
      }

      // Determine the new shift times (use existing if not provided)
      const newStartTime = updateData.startTime ? new Date(updateData.startTime) : new Date(existingShift.startTime);
      const newEndTime = updateData.endTime ? new Date(updateData.endTime) : new Date(existingShift.endTime);
      const newUserId = updateData.userId || existingShift.userId;

      // If both times are provided, validate them
      if (updateData.startTime && updateData.endTime) {
        const timeError = validateShiftTimes(updateData.startTime, updateData.endTime);
        if (timeError) {
          console.warn('[PUT /api/shifts/:id] Time validation error:', timeError);
          return res.status(400).json({ message: timeError });
        }
      }

      // Check for overlapping shifts (excluding current shift)
      if (updateData.startTime || updateData.endTime || updateData.userId) {
        const existingShifts = await storage.checkShiftOnDate(newUserId, newStartTime, id);
        
        if (existingShifts.length > 0) {
          const existingStart = new Date(existingShifts[0].startTime);
          const existingEnd = new Date(existingShifts[0].endTime);
          return res.status(409).json({
            message: `Employee already has a shift scheduled on this day (${existingStart.toLocaleTimeString()} to ${existingEnd.toLocaleTimeString()}). Employees can only have 1 shift per day.`,
            code: 'SHIFT_CONFLICT',
            conflictingShift: existingShifts[0]
          });
        }
      }

      const shift = await storage.updateShift(id, updateData);

      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Broadcast real-time shift update
      realTimeManager.broadcastShiftUpdated(shift);

      // Audit log for shift update
      await createAuditLog({
        action: 'shift_update',
        entityType: 'shift',
        entityId: id,
        userId: req.user!.id,
        newValues: updateData,
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ shift });
    } catch (error) {
      console.error('❌ [PUT /api/shifts/:id] Error:', error);
      res.status(400).json({ message: "Invalid shift data" });
    }
  }));

  // DELETE shift
  app.delete("/api/shifts/:id", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage.getShift(id);

      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Verify the shift belongs to the manager's branch
      if (shift.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Cannot delete shift from another branch" });
      }

      const result = await storage.deleteShift(id);

      if (!result) {
        return res.status(500).json({ message: "Failed to delete shift" });
      }

      // Broadcast real-time shift deletion
      realTimeManager.broadcastShiftDeleted(id, shift.branchId);

      // Audit log for shift deletion
      await createAuditLog({
        action: 'shift_delete',
        entityType: 'shift',
        entityId: id,
        userId: req.user!.id,
        oldValues: { userId: shift.userId, branchId: shift.branchId, startTime: shift.startTime, endTime: shift.endTime, position: shift.position },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ message: "Shift deleted successfully", shiftId: id });
    } catch (error) {
      console.error('Delete shift error:', error);
      res.status(500).json({ message: "Failed to delete shift" });
    }
  }));

  // Employee stats
  // Employee statistics route - accepts optional startDate and endDate for month selection
  app.get("/api/employees/stats", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const users = await storage.getUsersByBranch(branchId);
    const { startDate, endDate } = req.query;

    // Calculate statistics
    const totalEmployees = users.length;
    const activeEmployees = users.filter(user => user.isActive).length;

    // Use provided dates or default to current month
    let monthStart: Date;
    let monthEnd: Date;
    
    if (startDate && endDate) {
      monthStart = new Date(startDate as string);
      monthEnd = new Date(endDate as string);
      if (isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      monthEnd.setHours(23, 59, 59, 999);
    } else {
      const now = new Date();
      monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    let totalHoursThisMonth = 0;
    for (const user of users) {
      const shifts = await storage.getShiftsByUser(user.id, monthStart, monthEnd);
      for (const shift of shifts) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
        totalHoursThisMonth += hours;
      }
    }

    // Calculate total payroll this month from payroll entries (filter by period dates, not createdAt)
    let totalPayrollThisMonth = 0;
    const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
    const periodsThisMonth = allPeriods.filter(p => {
      const pEnd = new Date(p.endDate);
      return pEnd >= monthStart && pEnd <= monthEnd;
    });
    const periodIds = new Set(periodsThisMonth.map(p => p.id));
    for (const user of users) {
      const entries = await storage.getPayrollEntriesByUser(user.id);
      for (const entry of entries) {
        if (periodIds.has(entry.payrollPeriodId)) {
          totalPayrollThisMonth += parseFloat(entry.grossPay);
        }
      }
    }

    // Calculate average performance (simplified - based on completed shifts vs scheduled)
    let totalPerformanceScore = 0;
    let employeesWithShifts = 0;
    for (const user of users) {
      const shifts = await storage.getShiftsByUser(user.id, monthStart, monthEnd);
      if (shifts.length > 0) {
        const completedShifts = shifts.filter(s => s.status === 'completed').length;
        const performanceScore = (completedShifts / shifts.length) * 5; // Scale to 0-5
        totalPerformanceScore += performanceScore;
        employeesWithShifts++;
      }
    }
    const averagePerformance = employeesWithShifts > 0
      ? Number((totalPerformanceScore / employeesWithShifts).toFixed(1))
      : 0;

    res.json({
      totalEmployees,
      activeEmployees,
      totalHoursThisMonth: Number(totalHoursThisMonth.toFixed(2)),
      totalPayrollThisMonth: Number(totalPayrollThisMonth.toFixed(2)),
      averagePerformance,
    });
  }));


  // Employee performance data
  app.get("/api/employees/performance", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const users = await storage.getUsersByBranch(branchId);

    // Calculate real performance data from shifts
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const performanceData = await Promise.all(users.map(async (user) => {
      const shifts = await storage.getShiftsByUser(user.id, monthStart, monthEnd);

      // Calculate hours this month
      let hoursThisMonth = 0;
      for (const shift of shifts) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
        hoursThisMonth += hours;
      }

      // Calculate rating based on completed shifts vs scheduled
      const completedShifts = shifts.filter(s => s.status === 'completed').length;
      const missedShifts = shifts.filter(s => s.status === 'missed').length;
      const totalShifts = shifts.length;

      let rating = 5.0;
      if (totalShifts > 0) {
        // Deduct points for missed shifts
        rating = 5.0 - (missedShifts / totalShifts) * 2;
        // Bonus for perfect attendance
        if (completedShifts === totalShifts && totalShifts > 0) {
          rating = 5.0;
        }
        rating = Math.max(0, Math.min(5, rating)); // Clamp between 0 and 5
      }

      return {
        employeeId: user.id,
        employeeName: `${user.firstName} ${user.lastName}`,
        rating: Number(rating.toFixed(1)),
        hoursThisMonth: Number(hoursThisMonth.toFixed(2)),
        shiftsThisMonth: totalShifts,
      };
    }));

    res.json(performanceData);
  }));

  // Bulk activate employees
  app.post("/api/employees/bulk-activate", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const { employeeIds } = req.body;
    const managerBranchId = req.user!.branchId;

    if (!Array.isArray(employeeIds)) {
      return res.status(400).json({ message: "employeeIds must be an array" });
    }

    const updatedEmployees = [];
    for (const id of employeeIds) {
      const existing = await storage.getUser(id);
      if (existing && existing.branchId === managerBranchId) {
        const employee = await storage.updateUser(id, { isActive: true });
        if (employee) updatedEmployees.push(employee);
      }
    }

    res.json({
      message: `${updatedEmployees.length} employees activated successfully`,
      updatedCount: updatedEmployees.length
    });
  }));

  // Bulk deactivate employees
  app.post("/api/employees/bulk-deactivate", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const { employeeIds } = req.body;
    const managerBranchId = req.user!.branchId;

    if (!Array.isArray(employeeIds)) {
      return res.status(400).json({ message: "employeeIds must be an array" });
    }

    const updatedEmployees = [];
    for (const id of employeeIds) {
      const existing = await storage.getUser(id);
      if (existing && existing.branchId === managerBranchId) {
        const employee = await storage.updateUser(id, { isActive: false });
        if (employee) updatedEmployees.push(employee);
      }
    }

    res.json({
      message: `${updatedEmployees.length} employees deactivated successfully`,
      updatedCount: updatedEmployees.length
    });
  }));

  // Register employee uploads routes (BEFORE createEmployeeRouter to avoid /:id conflict)
  app.use("/api/employees", requireAuth, employeeUploadsRouter);

  // Register employee routes (after specific /api/employees/* routes to avoid conflicts)
  app.use(createEmployeeRouter(realTimeManager));

  // Register hours tracking routes
  app.use(hoursRoutes);

  // Register payslips routes for PDF generation and verification
  app.use('/api/payslips', payslipsRouter);

  // Register company settings routes
  app.use('/api/company-settings', companySettingsRouter);

  // Register audit and reports routes
  app.use(auditRouter);
  app.use(reportsRouter);
  app.use(forecastRouter);
  app.use(seedRatesRouter);
  
  // Register Philippine compliance routes
  app.use(thirteenthMonthRouter);
  app.use(leaveCreditsRouter);


  // ===== ADJUSTMENT LOGS (Manual OT/Lateness/Exception Logging) =====
  
  // Create adjustment log (Manager only)
  app.post("/api/adjustment-logs", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { employeeId, date, type, value, remarks } = req.body;
      const loggedBy = req.user!.id;

      if (!employeeId || !date || !type || !value) {
        return res.status(400).json({ message: "Employee, date, type, and value are required" });
      }

      // Fetch employee to guarantee correct branchId assignment
      const employee = await storage.getUser(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      const branchId = employee.branchId;
      if (!branchId) {
        return res.status(400).json({ message: "Target employee does not belong to a valid branch" });
      }

      // Validate type
      const validTypes = ['overtime', 'late', 'undertime', 'absent', 'rest_day_ot', 'special_holiday_ot', 'regular_holiday_ot', 'night_diff'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: `Invalid type. Valid types: ${validTypes.join(', ')}` });
      }

      const log = await storage.createAdjustmentLog({
        employeeId,
        loggedBy,
        branchId, // Guaranteed non-null from employee record
        startDate: new Date(date),
        endDate: new Date(date),
        type,
        value: value.toString(),
        remarks: remarks || null,
        status: 'pending',
      });

      // Notify the employee
      const manager = await storage.getUser(loggedBy);
      const typeLabels: Record<string, string> = {
        overtime: 'Overtime',
        late: 'Tardiness',
        undertime: 'Undertime',
        absent: 'Absent',
        rest_day_ot: 'Rest Day OT',
        special_holiday_ot: 'Special Holiday OT',
        regular_holiday_ot: 'Regular Holiday OT',
        night_diff: 'Night Differential',
      };
      const valueUnit = type === 'late' || type === 'undertime' ? 'mins' : 'hrs';
      
      await storage.createNotification({
        userId: employeeId,
        type: 'adjustment',
        title: 'Exception Log Recorded',
        message: `${manager?.firstName || 'Manager'} logged ${typeLabels[type] || type}: ${value} ${valueUnit} for ${new Date(date).toLocaleDateString('en-PH')}. Please verify.`,
        data: JSON.stringify({ adjustmentLogId: log.id }),
      } as any);

      res.json({ log });
    } catch (error: any) {
      console.error('Create adjustment log error:', error);
      res.status(500).json({ message: error.message || "Failed to create adjustment log" });
    }
  }));

  // Get adjustment logs by branch (Manager)
  app.get("/api/adjustment-logs/branch", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const { startDate, endDate } = req.query;
      const logs = await storage.getAdjustmentLogsByBranch(
        branchId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );
      
      // Enrich with employee names
      const enriched = await Promise.all(logs.map(async (log) => {
        const employee = await storage.getUser(log.employeeId);
        const logger = await storage.getUser(log.loggedBy);
        return {
          ...log,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
          loggedByName: logger ? `${logger.firstName} ${logger.lastName}` : 'Unknown',
        };
      }));
      
      res.json({ logs: enriched });
    } catch (error: any) {
      // Gracefully handle missing table (not yet migrated)
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        return res.json({ logs: [] });
      }
      res.status(500).json({ message: error.message || "Failed to get adjustment logs" });
    }
  }));

  // Get adjustment logs for the current employee (Employee view)
  app.get("/api/adjustment-logs/mine", requireAuth, asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      const logs = await storage.getAdjustmentLogsByEmployee(userId);
      res.json({ logs });
    } catch (error: any) {
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        return res.json({ logs: [] });
      }
      res.status(500).json({ message: error.message || "Failed to get adjustment logs" });
    }
  }));
  // Employee request adjustment log (OT/Late submitted by employee)
  app.post("/api/adjustment-logs/request", requireAuth, asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      const { startDate, endDate, type, value, remarks } = req.body;

      if (!startDate || !endDate || !type || !value) {
        return res.status(400).json({ message: "Missing required fields: startDate, endDate, type, value" });
      }

      const log = await storage.createAdjustmentLog({
        employeeId: userId,
        branchId: req.user!.branchId!,
        loggedBy: userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
        value: typeof value === 'number' ? value.toString() : value,
        remarks: remarks || "",
        status: "pending", // Manager needs to approve
      });

      res.status(201).json(log);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to submit exception request" });
    }
  }));

  // Employee verify adjustment log
  app.put("/api/adjustment-logs/:id/verify", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });
      if (log.employeeId !== userId) return res.status(403).json({ message: "Not authorized" });
      
      const updated = await storage.updateAdjustmentLog(id, {
        status: 'employee_verified',
        verifiedByEmployee: true,
        verifiedAt: new Date(),
      });

      // Notify the manager who logged it
      const employee = await storage.getUser(userId);
      await storage.createNotification({
        userId: log.loggedBy,
        type: 'adjustment',
        title: 'Exception Log Confirmed',
        message: `${employee?.firstName || 'Employee'} ${employee?.lastName || ''} confirmed your ${log.type} log for ${log.startDate ? new Date(log.startDate).toLocaleDateString('en-PH') : 'N/A'}.`,
        data: JSON.stringify({ adjustmentLogId: id }),
      } as any);

      res.json({ log: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to verify adjustment log" });
    }
  }));

  // Approve adjustment log (Manager)
  app.put("/api/adjustment-logs/:id/approve", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const approvedBy = req.user!.id;

      // Verify the adjustment log belongs to the manager's branch
      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });
      if (log.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      const updated = await storage.updateAdjustmentLog(id, {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      });
      
      if (!updated) return res.status(404).json({ message: "Adjustment log not found" });
      res.json({ log: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to approve adjustment log" });
    }
  }));

  // Reject adjustment log (Manager)
  app.put("/api/adjustment-logs/:id/reject", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      // Verify the adjustment log belongs to the manager's branch
      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });
      if (log.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      const updated = await storage.updateAdjustmentLog(id, {
        status: 'rejected',
        rejectionReason: req.body.reason || null,
      });
      
      if (!updated) return res.status(404).json({ message: "Adjustment log not found" });
      res.json({ log: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to reject adjustment log" });
    }
  }));

  // Delete adjustment log (Manager)
  app.delete("/api/adjustment-logs/:id", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });
      if (log.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      await storage.deleteAdjustmentLog(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete adjustment log" });
    }
  }));

  // Update adjustment log (Manager)
  app.put("/api/adjustment-logs/:id", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });
      if (log.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      const { type, value, remarks } = req.body;
      const updated = await storage.updateAdjustmentLog(id, { type, value, remarks });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update adjustment log" });
    }
  }));

  // Toggle adjustment log inclusion in payroll (Manager)
  app.put("/api/adjustment-logs/:id/toggle-included", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });
      if (log.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      const newValue = !(log.isIncluded ?? true);
      const updated = await storage.updateAdjustmentLog(id, {
        isIncluded: newValue,
      });

      res.json({ log: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to toggle adjustment log inclusion" });
    }
  }));

  // Employee dispute adjustment log
  app.put("/api/adjustment-logs/:id/dispute", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { reason } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "Dispute reason is required" });
      }

      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });
      if (log.employeeId !== userId) return res.status(403).json({ message: "Not authorized" });

      const updated = await storage.updateAdjustmentLog(id, {
        status: 'disputed',
        disputeReason: reason.trim(),
        disputedAt: new Date(),
        isIncluded: false, // Auto-exclude disputed logs from payroll
      });

      // Notify the manager who logged it
      const employee = await storage.getUser(userId);
      await storage.createNotification({
        userId: log.loggedBy,
        type: 'adjustment',
        title: 'Exception Log Disputed',
        message: `${employee?.firstName || 'Employee'} ${employee?.lastName || ''} disputed your ${log.type} log: "${reason.trim()}"`,
        data: JSON.stringify({ adjustmentLogId: id }),
      } as any);

      // Also create an auto-comment for the audit trail
      const { adjustmentLogComments } = await import('../shared/schema');
      const { db: routeDb } = await import('./db');
      await routeDb.insert(adjustmentLogComments).values({
        id: crypto.randomUUID(),
        adjustmentLogId: id,
        userId,
        message: `⚠️ Disputed: ${reason.trim()}`,
      });

      res.json({ log: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to dispute adjustment log" });
    }
  }));

  // Get comments for an adjustment log
  app.get("/api/adjustment-logs/:id/comments", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });

      // Allow access if employee owns the log OR user is manager of the branch
      const userId = req.user!.id;
      const isOwner = log.employeeId === userId;
      const isManager = (req.user!.role === 'manager' || req.user!.role === 'admin') && log.branchId === req.user!.branchId;
      if (!isOwner && !isManager) return res.status(403).json({ message: "Not authorized" });

      const { adjustmentLogComments } = await import('../shared/schema');
      const { db: routeDb } = await import('./db');
      const { eq: drizzleEq } = await import('drizzle-orm');

      const comments = await routeDb.select().from(adjustmentLogComments)
        .where(drizzleEq(adjustmentLogComments.adjustmentLogId, id))
        .orderBy(adjustmentLogComments.createdAt);

      // Enrich with user names
      const enriched = await Promise.all(comments.map(async (c) => {
        const user = await storage.getUser(c.userId);
        return {
          ...c,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userRole: user?.role || 'employee',
        };
      }));

      res.json({ comments: enriched });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get comments" });
    }
  }));

  // Post a comment on an adjustment log
  app.post("/api/adjustment-logs/:id/comments", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Comment message is required" });
      }

      const log = await storage.getAdjustmentLog(id);
      if (!log) return res.status(404).json({ message: "Adjustment log not found" });

      const isOwner = log.employeeId === userId;
      const isManager = (req.user!.role === 'manager' || req.user!.role === 'admin') && log.branchId === req.user!.branchId;
      if (!isOwner && !isManager) return res.status(403).json({ message: "Not authorized" });

      const { adjustmentLogComments } = await import('../shared/schema');
      const { db: routeDb } = await import('./db');

      const comment = await routeDb.insert(adjustmentLogComments).values({
        id: crypto.randomUUID(),
        adjustmentLogId: id,
        userId,
        message: message.trim(),
      }).returning();

      // Notify the other party
      const sender = await storage.getUser(userId);
      const senderName = `${sender?.firstName || 'Someone'} ${sender?.lastName || ''}`.trim();
      const recipientId = isOwner ? log.loggedBy : log.employeeId;

      await storage.createNotification({
        userId: recipientId,
        type: 'adjustment',
        title: 'New Comment on Exception Log',
        message: `${senderName} commented: "${message.trim().substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
        data: JSON.stringify({ adjustmentLogId: id }),
      } as any);

      const user = await storage.getUser(userId);
      res.json({
        comment: {
          ...comment[0],
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userRole: user?.role || 'employee',
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to post comment" });
    }
  }));

  // ─── Dashboard Stats (Consolidated API to prevent front-end waterfall) ───
  app.get("/api/dashboard/stats/manager", requireAuth, requireRole(["manager"]), apiCache(60), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const now = new Date();
      const startTimeMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endTimeMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Parallelize all the DB calls that the dashboard used to make sequentially
      const [allShifts, allApprovals, allUsers] = await Promise.all([
        storage.getShiftsByBranch(branchId, startTimeMonth, endTimeMonth),
        storage.getPendingApprovals(branchId),
        storage.getUsersByBranch(branchId)
      ]);

      // Aggregate time-off requests for all branch users
      const allTimeOffRequests: any[] = [];
      for (const user of allUsers) {
        const userRequests = await storage.getTimeOffRequestsByUser(user.id);
        allTimeOffRequests.push(...userRequests.map(r => ({ ...r, employeeName: `${user.firstName} ${user.lastName}` })));
      }

      // Calculate Team Hours using the previously exported logic
      // We need to import date-fns manually here for boundary calculation
      const { startOfWeek, endOfWeek, startOfMonth, endOfMonth } = await import('date-fns');
      const { filterCompletedShifts, calculateHoursFromShifts } = await import('./routes/hours');
      
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const weekShifts = allShifts.filter((s:any) => new Date(s.startTime) >= weekStart && new Date(s.startTime) <= weekEnd);
      const weekHours = calculateHoursFromShifts(weekShifts);
      
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const monthShifts = allShifts.filter((s:any) => new Date(s.startTime) >= monthStart && new Date(s.startTime) <= monthEnd);
      const monthHours = calculateHoursFromShifts(monthShifts);
      
      const activeEmployees = allUsers.filter((e:any) => e.isActive && (e.role === 'employee' || e.role === 'manager'));

      res.json({
        approvals: allApprovals,
        timeOffRequests: allTimeOffRequests.filter((req: any) => new Date(req.startDate) >= new Date(now.getFullYear(), 0, 1)), // Filter past 1 year to avoid massive payload
        shifts: allShifts.filter((s: any) => s.user?.isActive !== false),
        teamHours: {
          thisWeek: Number(weekHours.toFixed(2)),
          thisMonth: Number(monthHours.toFixed(2)),
          employeeCount: activeEmployees.length,
          weekShifts: filterCompletedShifts(weekShifts).length,
          monthShifts: filterCompletedShifts(monthShifts).length,
        }
      });
    } catch (error: any) {
      console.error('Error in /api/dashboard/stats/manager:', error);
      res.status(500).json({ message: error.message || "Failed to fetch dashboard stats" });
    }
  }));

  // ─── Deduction Settings (Per-Branch Toggle) ────────────────────────────────
  app.get("/api/deduction-settings", requireAuth, asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const rows = await db.select().from(deductionSettingsTable).where(eq(deductionSettingsTable.branchId, branchId)).limit(1);
      if (rows.length === 0) {
        // Return defaults (all enabled)
        return res.json({ settings: { deductSSS: true, deductPhilHealth: true, deductPagibig: true, deductWithholdingTax: true } });
      }
      res.json({ settings: rows[0] });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch deduction settings" });
    }
  }));

  app.put("/api/deduction-settings", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const { deductSSS, deductPhilHealth, deductPagibig, deductWithholdingTax } = req.body;

      const existing = await db.select().from(deductionSettingsTable).where(eq(deductionSettingsTable.branchId, branchId)).limit(1);

      if (existing.length === 0) {
        // Create new row
        await db.insert(deductionSettingsTable).values({
          id: crypto.randomUUID(),
          branchId,
          deductSSS: deductSSS ?? true,
          deductPhilHealth: deductPhilHealth ?? true,
          deductPagibig: deductPagibig ?? true,
          deductWithholdingTax: deductWithholdingTax ?? true,
          updatedAt: new Date(),
        });
      } else {
        // Update existing row
        await db.update(deductionSettingsTable).set({
          deductSSS: deductSSS ?? true,
          deductPhilHealth: deductPhilHealth ?? true,
          deductPagibig: deductPagibig ?? true,
          deductWithholdingTax: deductWithholdingTax ?? true,
          updatedAt: new Date(),
        }).where(eq(deductionSettingsTable.branchId, branchId));
      }

      const updated = await db.select().from(deductionSettingsTable).where(eq(deductionSettingsTable.branchId, branchId)).limit(1);
      res.json({ settings: updated[0] });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update deduction settings" });
    }
  }));

  // Payroll routes
  app.get("/api/payroll", requireAuth, asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      const entries = await storage.getPayrollEntriesByUser(userId);

      // Enrich entries with pay-period dates so the UI can display them
      const enriched = await Promise.all(
        entries.map(async (entry) => {
          try {
            const period = await storage.getPayrollPeriod(entry.payrollPeriodId);
            return {
              ...entry,
              periodStartDate: period?.startDate ?? null,
              periodEndDate: period?.endDate ?? null,
              paidAt: entry.paidAt ?? null,
            };
          } catch {
            return { ...entry, periodStartDate: null, periodEndDate: null };
          }
        }),
      );

      res.json({ entries: enriched });
    } catch (error: any) {
      console.error('Get payroll error:', error);
      res.status(500).json({ message: error.message || "Failed to fetch payroll entries" });
    }
  }));

  // Get all payroll periods (Manager only)
  app.get("/api/payroll/periods", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const periods = await storage.getPayrollPeriodsByBranch(branchId);
      res.json({ periods });
    } catch (error: any) {
      console.error('Get payroll periods error:', error);
      res.status(500).json({ message: error.message || "Failed to fetch payroll periods" });
    }
  }));

  // Get current payroll period
  app.get("/api/payroll/periods/current", requireAuth, asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const period = await storage.getCurrentPayrollPeriod(branchId);
      res.json({ period });
    } catch (error: any) {
      console.error('Get current payroll period error:', error);
      res.status(500).json({ message: error.message || "Failed to fetch current payroll period" });
    }
  }));

  // Create payroll period (Manager only)
  app.post("/api/payroll/periods", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate, payDate } = req.body;
      const branchId = req.user!.branchId;

      if (!startDate || !endDate || !payDate) {
        return res.status(400).json({ message: "Start date, end date, and pay date are required" });
      }

      const parsedStart = new Date(startDate);
      const parsedEnd = new Date(endDate);
      const parsedPayDate = new Date(payDate);

      if (parsedEnd <= parsedStart) {
        return res.status(400).json({ message: "End date must be after start date" });
      }

      // Check for overlapping periods
      const existingPeriods = await storage.getPayrollPeriodsByBranch(branchId);
      
      // ─── Feature 1: DOLE 16-Day Enforcement ───
      const sortedPeriods = [...existingPeriods].sort((a, b) => 
        new Date(b.payDate || b.endDate).getTime() - new Date(a.payDate || a.endDate).getTime()
      );
      const lastPeriod = sortedPeriods[0];
      
      if (lastPeriod) {
        const lastPayDate = new Date(lastPeriod.payDate || lastPeriod.endDate);
        const msPerDay = 1000 * 60 * 60 * 24;
        const gapDays = Math.ceil((parsedPayDate.getTime() - lastPayDate.getTime()) / msPerDay);
        
        if (gapDays > 16) {
          return res.status(400).json({ 
            message: `DOLE Violation: Maximum interval between successive pay dates cannot exceed 16 days. Gap is ${gapDays} days from previous period's pay date.` 
          });
        }
      }
      const hasOverlap = existingPeriods.some(p => {
        const pStart = new Date(p.startDate);
        const pEnd = new Date(p.endDate);
        return parsedStart < pEnd && parsedEnd > pStart;
      });
      if (hasOverlap) {
        return res.status(400).json({ message: "This period overlaps with an existing payroll period" });
      }

      const period = await storage.createPayrollPeriod({
        branchId,
        startDate: parsedStart,
        endDate: parsedEnd,
        payDate: parsedPayDate,
        status: 'open'
      });

      res.json({ period });
      realTimeManager.broadcastPayrollPeriodCreated(period);
    } catch (error: any) {
      console.error('Create payroll period error:', error);
      res.status(500).json({
        message: error.message || "Failed to create payroll period"
      });
    }
  }));

  // Delete a payroll period (Manager only — open periods only)
  app.delete("/api/payroll/periods/:id", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const branchId = req.user!.branchId;

      const period = await storage.getPayrollPeriod(id);
      if (!period) {
        return res.status(404).json({ message: "Payroll period not found" });
      }
      if (period.branchId !== branchId) {
        return res.status(403).json({ message: "Access denied to this payroll period" });
      }
      if (period.status !== "open") {
        return res.status(400).json({ message: "Only open payroll periods can be deleted" });
      }

      // Delete associated payroll entries first
      const entries = await storage.getPayrollEntriesByPeriod(id);
      for (const entry of entries) {
        await storage.deletePayrollEntry(entry.id);
      }

      await storage.deletePayrollPeriod(id);
      res.json({ message: "Payroll period deleted successfully" });
    } catch (error: any) {
      console.error("Delete payroll period error:", error);
      res.status(500).json({ message: error.message || "Failed to delete payroll period" });
    }
  }));

  // Process payroll for a period (Manager only)
  app.post("/api/payroll/periods/:id/process", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    // Track created entries for rollback on failure
    const createdEntryIds: string[] = [];

    try {
      const { id } = req.params;
      const branchId = req.user!.branchId;

      // Get the payroll period
      const period = await storage.getPayrollPeriod(id);
      if (!period) {
        return res.status(404).json({ message: "Payroll period not found" });
      }

      if (period.status !== 'open') {
        return res.status(400).json({ message: "Payroll period is not open" });
      }

      // Verify the period belongs to the manager's branch
      if (period.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Cannot process payroll for another branch" });
      }

      // Clear any existing entries for this period (e.g., from seed data or re-processing)
      const existingEntries = await storage.getPayrollEntriesByPeriod(id);
      for (const entry of existingEntries) {
        await storage.deletePayrollEntry(entry.id);
      }

      // Get all employees in the branch
      const employees = await storage.getUsersByBranch(branchId);
      const payrollEntries = [];
      let totalHours = 0;
      let totalPay = 0;

      // Get holidays in the period for pay calculation
      const periodHolidays = await storage.getHolidays(
        new Date(period.startDate),
        new Date(period.endDate)
      );

      // ─── READ BRANCH DEDUCTION SETTINGS FROM DB (not hardcoded!) ───
      const dsRows = await db.select().from(deductionSettingsTable)
        .where(eq(deductionSettingsTable.branchId, branchId)).limit(1);
      const branchDeductionSettings = dsRows[0] || {
        deductSSS: true, deductPhilHealth: true,
        deductPagibig: true, deductWithholdingTax: true
      };

      // --- Pre-fetch static branch & company data to prevent N+1 Queries ---
      const companySettings = await storage.getCompanySettings();
      const globalHolidayPayEnabled = companySettings ? companySettings.includeHolidayPay : false;
      const activeHeadcount = employees.filter(e => e.isActive).length;
      const branchRecord = await storage.getBranch(branchId);
      const isBranchExempt = !!(
        branchRecord?.intentHolidayExempt && 
        ['retail', 'service'].includes(branchRecord?.establishmentType || '') && 
        activeHeadcount <= 5
      );
      const isHolidayExempt = !globalHolidayPayEnabled || isBranchExempt;

      for (const employee of employees) {
        if (!employee.isActive) continue;

        // --- DOLE COMPLIANCE: MSEC/BIR Mandatory Verification ---
        // We log a warning for missing government IDs but MUST process payroll for hours worked.
        if (!employee.tin || !employee.sssNumber || !employee.philhealthNumber || !employee.pagibigNumber ||
            employee.tin === '—' || employee.sssNumber === '—') {
          console.warn(`[PAYROLL WARNING] ${employee.firstName} ${employee.lastName} is missing government IDs, but processing payroll to prevent DOLE violation.`);
          // Do not skip the employee's payroll processing
        }

        // Get shifts for this employee in the period
        const shifts = await storage.getShiftsByUser(
          employee.id,
          new Date(period.startDate),
          new Date(period.endDate)
        );

        // Get approved paid leave (SIL/Vacation/Sick)
        const timeOffRequests = await storage.getTimeOffRequestsByUser(employee.id);
        const approvedLeaves = timeOffRequests.filter(req => 
          req.status === 'approved' && 
          ['vacation', 'sick', 'personal'].includes(req.type) &&
          new Date(req.startDate) <= new Date(period.endDate) &&
          new Date(req.endDate) >= new Date(period.startDate)
        );

        if (shifts.length === 0 && approvedLeaves.length === 0) continue;

        // --- DOLE COMPLIANCE: Holiday Exemption Gateway (Feature 4) ---
        // Exemption applies globally if company settings "Include Holiday Pay" is turned OFF (which is the default).
        // If it's turned ON, we still check the specific branch retail/service exemptions, though the global toggle takes precedence as a master switch.

        const hourlyRate = parseFloat(employee.hourlyRate);
        if (isNaN(hourlyRate) || hourlyRate <= 0) {
          console.warn(`[PAYROLL SKIP] ${employee.firstName} ${employee.lastName} — invalid hourlyRate "${employee.hourlyRate}", skipping.`);
          continue;
        }
        const payCalculation = calculatePeriodPay(shifts, hourlyRate, periodHolidays, 0, isHolidayExempt); // 0 = Sunday as rest day

        // -- Add Service Incentive Leave (Paid Time Off) --
        let paidLeaveHours = 0;
        let paidLeavePay = 0;
        for (const leave of approvedLeaves) {
          const leaveStart = new Date(Math.max(new Date(leave.startDate).getTime(), new Date(period.startDate).getTime()));
          const leaveEnd = new Date(Math.min(new Date(leave.endDate).getTime(), new Date(period.endDate).getTime()));
          
          if (leaveStart <= leaveEnd) {
            // Count inclusive days in the period
            const daysCount = Math.floor((leaveEnd.getTime() - leaveStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
            // 8 hours of basic pay per day of leave
            paidLeaveHours += (daysCount * 8);
          }
        }
        
        paidLeavePay = paidLeaveHours * hourlyRate;

        // Calculate total hours from breakdown
        let employeeTotalHours = paidLeaveHours;
        let regularHours = paidLeaveHours;
        let overtimeHours = 0;
        let nightDiffHours = 0;

        for (const day of payCalculation.breakdown) {
          regularHours += day.regularHours;
          overtimeHours += day.overtimeHours;
          nightDiffHours += day.regularNightDiffHours + day.overtimeNightDiffHours;
          employeeTotalHours += day.regularHours + day.overtimeHours;
        }

        // Add paid leave to basic pay (Counts toward 13th month computation)
        let basicPay = payCalculation.basicPay + paidLeavePay;
        let overtimePay = payCalculation.overtimePay;
        let holidayPay = payCalculation.holidayPay;
        let nightDiffPay = payCalculation.nightDiffPay;
        let restDayPay = payCalculation.restDayPay;
        let grossPay = payCalculation.totalGrossPay + paidLeavePay;

        // ===== MANUAL ADJUSTMENT LOGS (OT/Lateness from Manager input) =====
        // Process approved adjustment logs for this employee in this period
        const employeeAdjustments = await storage.getAdjustmentLogsByEmployee(
          employee.id,
          new Date(period.startDate),
          new Date(period.endDate)
        );

        let lateDeduction = 0;
        let totalLateMinutes = 0;
        let undertimeDeduction = 0;

        for (const adj of employeeAdjustments) {
          // Only process approved or employee-verified adjustments
          if (adj.status !== 'approved' && adj.status !== 'employee_verified') continue;

          // Skip logs explicitly excluded from payroll via toggle
          if (adj.isIncluded === false) continue;

          const adjValue = parseFloat(adj.value);
          if (isNaN(adjValue) || adjValue <= 0) continue;

          let calcAmount = 0;

          switch (adj.type) {
            case 'overtime':
              // Regular Day OT: Hourly Rate × 125% (DOLE standard)
              calcAmount = hourlyRate * HOLIDAY_RATES.normal.overtime * adjValue;
              overtimePay += calcAmount;
              overtimeHours += adjValue;
              break;
            case 'rest_day_ot':
              // Rest Day OT: Hourly Rate × 130% × 130% = 169%
              calcAmount = hourlyRate * HOLIDAY_RATES.normal.restDayOT * adjValue;
              overtimePay += calcAmount;
              overtimeHours += adjValue;
              break;
            case 'special_holiday_ot':
              // Special Holiday OT: Hourly Rate × 130% × 130% = 169%
              calcAmount = hourlyRate * HOLIDAY_RATES.special_non_working.overtime * adjValue;
              overtimePay += calcAmount;
              overtimeHours += adjValue;
              break;
            case 'regular_holiday_ot':
              // Regular Holiday OT: Hourly Rate × 200% × 130% = 260%
              calcAmount = hourlyRate * HOLIDAY_RATES.regular.overtime * adjValue;
              overtimePay += calcAmount;
              overtimeHours += adjValue;
              break;
            case 'night_diff':
              // Night Differential: Hourly Rate × 10% premium per hour
              calcAmount = hourlyRate * NIGHT_DIFF_RATE * adjValue;
              nightDiffPay += calcAmount;
              nightDiffHours += adjValue;
              break;
            case 'late':
              // Tardiness: (Hourly Rate / 60 mins) × minutes late
              calcAmount = (hourlyRate / MINS_PER_HOUR) * adjValue;
              lateDeduction += calcAmount;
              totalLateMinutes += adjValue;
              break;
            case 'undertime':
              // Undertime: (Hourly Rate / 60 mins) × minutes undertime
              calcAmount = (hourlyRate / MINS_PER_HOUR) * adjValue;
              undertimeDeduction += calcAmount;
              break;
            case 'absent':
              // Absent: Full day deduction (8 hours × hourly rate)
              calcAmount = hourlyRate * DAILY_REGULAR_HOURS * adjValue;
              lateDeduction += calcAmount;
              break;
          }

          // Update the adjustment log with calculated amount
          const isDeduction = ['late', 'undertime', 'absent'].includes(adj.type);
          await storage.updateAdjustmentLog(adj.id, {
            calculatedAmount: (isDeduction ? -calcAmount : calcAmount).toFixed(2),
            payrollPeriodId: id,
          });

          // DO NOT silently reduce grossPay by deductions, this hides them from the payslip.
          // Instead, add them to otherDeductions below.
          if (!isDeduction) {
            grossPay += calcAmount;
          }
        }

        const periodStartDate = new Date(period.startDate);
        const periodEndDate = new Date(period.endDate);
        const daysInPeriod = Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        
        // DOLE Standard: Estimate monthly salary based on hourly rate * MONTHLY_WORKING_HOURS
        // (average 22 working days * 8 hours), which aligns exactly with the 
        // Employee Deductions UI estimates and ensures MSC brackets don't drop during absences.
        const monthlyBasicSalary = hourlyRate * MONTHLY_WORKING_HOURS;

        // Import deduction calculator
        const { calculateAllDeductions, calculateWithholdingTax } = await import('./utils/deductions');

        // Philippine statutory deductions use MONTHLY salary basis.
        // SSS, PhilHealth, Pag-IBIG are computed once per month.
        // For semi-monthly (15-day) periods, we calculate on the monthly equivalent
        // but only deduct HALF per cutoff (the other half comes from the 2nd cutoff).
        const isSemiMonthly = daysInPeriod < 28; // 15-day period = semi-monthly

        // Step 1: Calculate SSS, PhilHealth, Pag-IBIG on monthly basis
        // Uses actual branch deduction settings from DB (loaded above the loop)
        const mandatorySettings = {
          deductSSS: branchDeductionSettings.deductSSS ?? true,
          deductPhilHealth: branchDeductionSettings.deductPhilHealth ?? true,
          deductPagibig: branchDeductionSettings.deductPagibig ?? true,
          deductWithholdingTax: false, // Tax computed separately below using branchDeductionSettings
        };
        const mandatoryBreakdown = await calculateAllDeductions(monthlyBasicSalary, mandatorySettings);

        // For semi-monthly payroll, each cutoff pays half the monthly contribution
        const periodFraction = isSemiMonthly ? 0.5 : 1;
        const sssContribution = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
        const philHealthContribution = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
        const pagibigContribution = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;


        // --- Feature 3: De Minimis Benefits & Allowances ---
        const { workerAllowances, allowanceTypes } = await import('../shared/schema');
        const { eq, and } = await import('drizzle-orm');
        const { db } = await import('./db');
        
        let totalAllowanceAmount = 0;
        let taxableAllowanceExcess = 0;

        const empAllowances = await db.select({
          amount: workerAllowances.amount,
          ceiling: allowanceTypes.ceilingValue,
          isDeMinimis: allowanceTypes.isDeMinimis,
        }).from(workerAllowances)
          .innerJoin(allowanceTypes, eq(workerAllowances.allowanceTypeId, allowanceTypes.id))
          .where(and(eq(workerAllowances.userId, employee.id), eq(workerAllowances.isActive, true)));

        for (const al of empAllowances) {
          // Adjust allowance based on period fraction (semi-monthly splits it)
          const periodAllowance = Math.round(parseFloat(al.amount) * periodFraction * 100) / 100;
          const periodCeiling = al.ceiling ? Math.round(parseFloat(al.ceiling) * periodFraction * 100) / 100 : null;
          
          totalAllowanceAmount += periodAllowance;
          
          if (al.isDeMinimis) {
            if (periodCeiling !== null && periodAllowance > periodCeiling) {
              taxableAllowanceExcess += (periodAllowance - periodCeiling);
            }
          } else {
            taxableAllowanceExcess += periodAllowance; // Fully taxable
          }
        }
        
        // Step 2: BIR withholding tax is computed on TAXABLE INCOME
        const monthlyMandatory = mandatoryBreakdown.sssContribution + mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
        
        // Ensure ALL taxable earnings are included (OT, holiday, night diff, manual adjustments)
        const periodTaxableEarnings = basicPay + overtimePay + holidayPay + nightDiffPay + restDayPay - lateDeduction - undertimeDeduction;
        
        // Base taxable income (converting the actual gross pay + premiums to monthly equivalent)
        let monthlyTaxableIncome = Math.max(0, (periodTaxableEarnings / periodFraction) - monthlyMandatory);
        
        // Add taxable allowance excess (extrapolated to monthly for bracket lookup)
        if (taxableAllowanceExcess > 0) {
           monthlyTaxableIncome += (taxableAllowanceExcess / periodFraction);
        }

        const monthlyTax = await calculateWithholdingTax(monthlyTaxableIncome);
        const withholdingTax = Math.round(monthlyTax * periodFraction * 100) / 100;
        
        // Add gross allowances to gross Pay (after basic basicPay computations)
        grossPay += totalAllowanceAmount;

        // ─── Feature 5: DOLE Art. 113 Compliant Government Loan Deductions ───
        // Only deduct if there is an approved active loan with a start date <= period endDate
        const activeLoans = await storage.getActiveApprovedLoans(employee.id, new Date(period.endDate));
        
        let sssLoan = 0;
        let pagibigLoan = 0;
        
        const { db: payrollDb } = await import('./db');
        const { loanRequests: loanReqSchema } = await import('../shared/schema');
        const { eq: drizzleEq } = await import('drizzle-orm');

        for (const loan of activeLoans) {
          // If semi-monthly, split the monthly amortization evenly across the two cutoff periods
          let deduction = Math.round(parseFloat(loan.monthlyAmortization) * periodFraction * 100) / 100;
          const remaining = parseFloat(loan.remainingBalance || "0");
          
          if (deduction > remaining && remaining > 0) {
            deduction = remaining;
          }

          if (loan.loanType === 'SSS') {
            sssLoan += deduction;
          } else if (loan.loanType === 'Pag-IBIG') {
            pagibigLoan += deduction;
          }

          if (deduction > 0) {
            const newBalance = Math.max(0, remaining - deduction);
            const newStatus = newBalance <= 0.01 ? 'completed' : loan.status;
            
            await payrollDb.update(loanReqSchema)
              .set({ remainingBalance: newBalance.toFixed(2), status: newStatus })
              .where(drizzleEq(loanReqSchema.id, loan.id));
          }
        }

        const advances = parseFloat(employee.cashAdvanceDeduction || '0');
        
        // Include lateness, absences (stored in lateDeduction), and undertime in otherDeductions
        // so they are explicitly visible as deductions on the payslip.
        const otherDeductions = parseFloat(employee.otherDeductions || '0') + lateDeduction + undertimeDeduction;

        // ─── Feature 1: MWE Exemption (BIR TRAIN Law) ─────────────────────────
        // If employee is flagged as Minimum Wage Earner, withholding tax is 0.
        // MWE holiday pay, OT, and night diff are also exempt under BIR rulings.
        const mweWithholdingTax = (!branchDeductionSettings.deductWithholdingTax || (employee as any).isMwe) ? 0 : withholdingTax;

        const totalDeductions =
          sssContribution +
          philHealthContribution +
          pagibigContribution +
          mweWithholdingTax +
          sssLoan +
          pagibigLoan +
          advances +
          otherDeductions;

        const netPay = grossPay - totalDeductions;

        // Create payroll entry with detailed breakdown
        const entry = await storage.createPayrollEntry({
          userId: employee.id,
          payrollPeriodId: id,
          totalHours: employeeTotalHours.toString(),
          regularHours: regularHours.toString(),
          overtimeHours: overtimeHours.toString(),
          nightDiffHours: nightDiffHours.toString(),
          basicPay: basicPay.toString(),
          holidayPay: holidayPay.toString(),
          overtimePay: overtimePay.toString(),
          nightDiffPay: nightDiffPay.toString(),
          restDayPay: restDayPay.toString(),
          grossPay: grossPay.toString(),
          sssContribution: sssContribution.toString(),
          sssLoan: sssLoan.toString(),
          philHealthContribution: philHealthContribution.toString(),
          pagibigContribution: pagibigContribution.toString(),
          pagibigLoan: pagibigLoan.toString(),
          withholdingTax: mweWithholdingTax.toString(),
          advances: advances.toString(),
          otherDeductions: otherDeductions.toString(),
          totalDeductions: totalDeductions.toString(),
          deductions: totalDeductions.toString(), // For backward compatibility
          netPay: netPay.toString(),
          status: 'pending'
        });

        // ─── Feature 2: 13th Month Ledger (PD 851) ──────────────────────────
        // Record the basicPay only — OT/Holiday/NightDiff excluded per BIR rules
        try {
          const periodYear = new Date(period.startDate).getFullYear();
          await db.insert(thirteenthMonthLedger).values({
            id: crypto.randomUUID(),
            userId: employee.id,
            branchId: branchId,
            payrollPeriodId: id,
            year: periodYear,
            basicPayEarned: basicPay.toFixed(2),
            periodStartDate: new Date(period.startDate),
            periodEndDate: new Date(period.endDate),
            createdAt: new Date(),
          });
        } catch (ledgerErr) {
          // Non-blocking: if table not yet migrated, log but don't fail payroll
          console.warn('13th month ledger insert skipped (table may not exist yet):', (ledgerErr as any).message);
        }

        payrollEntries.push(entry);
        createdEntryIds.push(entry.id);
        totalHours += employeeTotalHours;
        totalPay += grossPay;

        // Create notification for employee
        const notification = await storage.createNotification({
          userId: employee.id,
          type: 'payroll',
          title: 'Payroll Slip Available',
          message: `Your payroll slip for ${format(new Date(period.startDate), "MMM d")} - ${format(new Date(period.endDate), "MMM d, yyyy")} is now available. Net Pay: ₱${netPay.toFixed(2)}`,
          data: JSON.stringify({
            entryId: entry.id,
            periodId: id,
            netPay: netPay.toFixed(2)
          })
        } as any);
        realTimeManager.broadcastNotification(notification);
      }

      // Update the period status
      await storage.updatePayrollPeriod(id, {
        status: 'closed',
        totalHours: totalHours.toString(),
        totalPay: totalPay.toString()
      });

      // Mark all entries in this period as 'paid' when period is closed
      for (const entry of payrollEntries) {
        await storage.updatePayrollEntry(entry.id, { status: 'paid', paidAt: new Date() });
      }

      res.json({
        message: `Payroll processed successfully for ${payrollEntries.length} employees`,
        entriesCreated: payrollEntries.length,
        totalHours: totalHours.toFixed(2),
        totalPay: totalPay.toFixed(2)
      });

      // Audit log for payroll processing
      await createAuditLog({
        action: 'payroll_process',
        entityType: 'payroll_period',
        entityId: id,
        userId: req.user!.id,
        newValues: { entriesCreated: payrollEntries.length, totalHours: totalHours.toFixed(2), totalPay: totalPay.toFixed(2) },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      realTimeManager.broadcastPayrollProcessed(id, {
        entriesCreated: payrollEntries.length,
        totalHours,
        totalPay
      }, req.user!.branchId);
    } catch (error: any) {
      console.error('Process payroll error:', error);

      // Rollback: Delete any created payroll entries
      if (createdEntryIds.length > 0) {
        for (const entryId of createdEntryIds) {
          try {
            await storage.deletePayrollEntry(entryId);
          } catch (deleteError) {
            console.error(`Failed to rollback entry ${entryId}:`, deleteError);
          }
        }
      }

      res.status(500).json({
        message: error.message || "Failed to process payroll. All changes have been rolled back."
      });
    }
  }));

  // Get all payroll entries for a branch (Manager only)
  app.get("/api/payroll/entries/branch", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const { periodId } = req.query;

      // Get all active employees in the branch
      const allEmployees = await storage.getUsersByBranch(branchId);
      const employees = allEmployees.filter(emp => emp.isActive);

      let allEntries: any[] = [];
      const periodCache: Record<string, { startDate: Date; endDate: Date } | null> = {};

      for (const employee of employees) {
        const entries = await storage.getPayrollEntriesByUser(
          employee.id,
          periodId as string
        );

        // Add employee details and period dates to each entry
        const entriesWithUser = await Promise.all(entries.map(async (entry) => {
          let periodStartDate = null;
          let periodEndDate = null;
          try {
            if (periodCache[entry.payrollPeriodId] === undefined) {
              const period = await storage.getPayrollPeriod(entry.payrollPeriodId);
              periodCache[entry.payrollPeriodId] = period ? { startDate: period.startDate, endDate: period.endDate } : null;
            }
            
            const cachedPeriod = periodCache[entry.payrollPeriodId];
            if (cachedPeriod) {
              periodStartDate = cachedPeriod.startDate;
              periodEndDate = cachedPeriod.endDate;
            }
          } catch (err: any) {
            console.warn(`[PAYROLL] Failed to resolve period ${entry.payrollPeriodId}:`, err?.message);
          }
          return {
            ...entry,
            periodStartDate,
            periodEndDate,
            paidAt: entry.paidAt ?? null,
            employee: {
              id: employee.id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              position: employee.position,
              email: employee.email,
              photoUrl: employee.photoUrl || null
            }
          };
        }));

        allEntries.push(...entriesWithUser);
      }

      // Sort all entries by createdAt descending (most recent first)
      allEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({ entries: allEntries });
    } catch (error: any) {
      console.error('Get branch payroll entries error:', error);
      res.status(500).json({ 
        message: error.message || "Failed to get payroll entries" 
      });
    }
  }));

  // Approve payroll entry (Manager only)
  app.put("/api/payroll/entries/:id/approve", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch the entry first to verify branch ownership
      const existing = await storage.getPayrollEntry(id);
      if (!existing) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }
      const employee = await storage.getUser(existing.userId);
      if (!employee || employee.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      const entry = await storage.updatePayrollEntry(id, { status: 'approved' });

      res.json({ entry });

      // Audit log for payroll entry approval
      await createAuditLog({
        action: 'payroll_approve',
        entityType: 'payroll_entry',
        entityId: id,
        userId: req.user!.id,
        newValues: { status: 'approved' },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      realTimeManager.broadcastPayrollEntryUpdated(id, 'approved', entry);
    } catch (error: any) {
      console.error('Approve payroll entry error:', error);
      res.status(500).json({ 
        message: error.message || "Failed to approve payroll entry" 
      });
    }
  }));

  // Mark payroll entry as paid (Manager only)
  app.put("/api/payroll/entries/:id/paid", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      // Fetch the entry first to verify branch ownership
      const existing = await storage.getPayrollEntry(id);
      if (!existing) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }
      const employee = await storage.getUser(existing.userId);
      if (!employee || employee.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      const entry = await storage.updatePayrollEntry(id, { status: 'paid', paidAt: new Date() });
      
      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }

      res.json({ entry });

      // Audit log for payroll marked paid
      await createAuditLog({
        action: 'payroll_paid',
        entityType: 'payroll_entry',
        entityId: id,
        userId: req.user!.id,
        newValues: { status: 'paid' },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      realTimeManager.broadcastPayrollEntryUpdated(id, 'paid', entry);
    } catch (error: any) {
      console.error('Mark payroll as paid error:', error);
      res.status(500).json({ 
        message: error.message || "Failed to mark payroll as paid" 
      });
    }
  }));

  // Payslip generation route
  app.get("/api/payroll/payslip/:entryId", requireAuth, asyncHandler(async (req, res) => {
    const { entryId } = req.params;
    const userId = req.user!.id;


    // Get payroll entry directly by ID
    const entry = await storage.getPayrollEntry(entryId);
    
    if (!entry) {
      return res.status(404).json({ message: "Payroll entry not found" });
    }
    
    // Verify the entry belongs to the current user or user is admin/manager
    if (entry.userId !== userId && req.user!.role !== 'admin' && req.user!.role !== 'manager') {
      return res.status(403).json({ message: "Unauthorized access to payroll entry" });
    }

    // Get user details — use the EMPLOYEE's userId from the entry, not the logged-in user
    const employeeUser = await storage.getUser(entry.userId);
    if (!employeeUser) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const user = employeeUser;

    // Parse the pay breakdown JSON if it exists
    let breakdown = null;
    try {
      if ((entry as any).payBreakdown) {
        breakdown = JSON.parse((entry as any).payBreakdown);
      }
    } catch (e) {
      // If parsing fails, breakdown stays null
    }

    // Retrieve the pay period so the payslip shows the correct date range
    let periodStart: string | null = null;
    let periodEnd: string | null = null;
    let payDate: string | null = null;
    
    let includedExceptions: any[] = [];
    try {
      const { payrollPeriods, adjustmentLogs } = await import('../shared/schema');
      const { eq, and, gte, lte, inArray } = await import('drizzle-orm');
      const { db } = await import('./db');
      
      const periods = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, entry.payrollPeriodId)).limit(1);
      if (periods.length > 0) {
        const period = periods[0];
        periodStart = period.startDate instanceof Date
          ? period.startDate.toISOString()
          : String(period.startDate);
        periodEnd = period.endDate instanceof Date
          ? period.endDate.toISOString()
          : String(period.endDate);
        payDate = period.payDate
          ? (period.payDate instanceof Date ? period.payDate.toISOString() : String(period.payDate))
          : null;

        // Fetch verified/approved exception logs within this period for this user
        const logs = await db.select()
          .from(adjustmentLogs)
          .where(
            and(
              eq(adjustmentLogs.employeeId, entry.userId),
              gte(adjustmentLogs.startDate, new Date(periodStart)),
              lte(adjustmentLogs.startDate, new Date(periodEnd)),
              inArray(adjustmentLogs.status, ['employee_verified', 'approved'])
            )
          );
        includedExceptions = logs;
      }
    } catch (e) {
      console.error("[Payslip] Error fetching payroll period or exceptions:", e);
    }

    // Company settings for dynamic payslip branding/details
    const company = await storage.getCompanySettings();
    const companyAddress = [
      company?.address,
      company?.city,
      company?.province,
      company?.zipCode,
    ]
      .filter(Boolean)
      .join(", ");

    const payslipData = {
      employeeName: `${user.firstName} ${user.lastName}`,
      employeeId: user.id,
      position: user.position,
      department: "Operations",
      period: entry.createdAt!,
      periodStart,
      periodEnd,
      payDate,
      regularHours: entry.regularHours,
      overtimeHours: entry.overtimeHours,
      nightDiffHours: (entry as any).nightDiffHours || 0,
      totalHours: entry.totalHours,
      hourlyRate: user.hourlyRate,
      // Pay breakdown
      basicPay: entry.basicPay || entry.grossPay,
      holidayPay: entry.holidayPay || 0,
      overtimePay: entry.overtimePay || 0,
      nightDifferential: (entry as any).nightDiffPay || 0,
      nightDiffPay: (entry as any).nightDiffPay || 0,
      restDayPay: (entry as any).restDayPay || 0,
      grossPay: entry.grossPay,
      // Detailed deductions
      sssContribution: entry.sssContribution || 0,
      sssLoan: entry.sssLoan || 0,
      philHealthContribution: entry.philHealthContribution || 0,
      pagibigContribution: entry.pagibigContribution || 0,
      pagibigLoan: entry.pagibigLoan || 0,
      withholdingTax: entry.withholdingTax || 0,
      advances: entry.advances || 0,
      otherDeductions: entry.otherDeductions || 0,
      totalDeductions: entry.totalDeductions || entry.deductions || 0,
      deductions: entry.deductions,
      netPay: entry.netPay,
      status: entry.status,
      breakdown: breakdown,
      companyName: company?.name || company?.tradeName || "The Café",
      companyAddress: companyAddress || "Philippines",
      companyTin: company?.tin || "",
      companyLogoUrl: company?.logoUrl || "",
      companyEmail: company?.email || "",
      // Employee government IDs
      employeeTin: user.tin || null,
      employeeSss: user.sssNumber || null,
      employeePhilhealth: user.philhealthNumber || null,
      employeePagibig: user.pagibigNumber || null,
      // Included adjustments/exceptions
      includedExceptions,
    };

    res.json({ payslip: payslipData });
  }));

  // Manager send payslip to employee
  app.post("/api/payroll/entries/:entryId/send", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { entryId } = req.params;
      const branchId = req.user!.branchId;

      // Get payroll entry
      const entry = await storage.getPayrollEntry(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }

      // Get employee details
      const employee = await storage.getUser(entry.userId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Verify employee is in the same branch
      if (employee.branchId !== branchId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Create notification for employee
      const notification = await storage.createNotification({
        userId: entry.userId,
        type: 'payroll',
        title: 'Payslip Sent',
        message: `Your payslip has been sent by your manager. Net Pay: ₱${parseFloat(entry.netPay).toFixed(2)}`,
        data: JSON.stringify({
          entryId: entry.id,
          netPay: entry.netPay
        })
      } as any);
      realTimeManager.broadcastNotification(notification);

      res.json({
        message: "Payslip sent to employee successfully"
      });

      realTimeManager.broadcastPayrollSent(entry.id, entry.userId, entry.netPay, req.user!.branchId);
    } catch (error: any) {
      console.error('Send payslip error:', error);
      res.status(500).json({
        message: error.message || "Failed to send payslip"
      });
    }
  }));

  // ============================================
  // HOLIDAY MANAGEMENT ENDPOINTS
  // ============================================

  // ============================================
  // HOLIDAYS ROUTES (Enhanced with pay rules, check-date, seed-2025)
  // ============================================
  // Use the enhanced holidays router with:
  // - GET /api/holidays - List all (optionally by year/range) with pay rule tooltips
  // - GET /api/holidays/check-date/:date - Check if date is holiday + work allowed
  // - GET /api/holidays/:id - Get single holiday
  // - POST /api/holidays - Create (admin/manager, with audit log)
  // - PUT /api/holidays/:id - Update (admin/manager, with audit log)  
  // - DELETE /api/holidays/:id - Delete (admin/manager, with audit log)
  // - POST /api/holidays/seed-2025 - Seed Proclamation 727 holidays (admin only)
  app.use('/api/holidays', holidaysRouter);

  // ============================================
  // PAYROLL ARCHIVING ENDPOINTS
  // ============================================

  // Get archived payroll periods
  app.get("/api/payroll/archived", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const archivedPeriods = await storage.getArchivedPayrollPeriods(branchId);
      res.json({ archivedPeriods });
    } catch (error: any) {
      console.error('Get archived payroll error:', error);
      res.status(500).json({ message: error.message || "Failed to get archived payroll" });
    }
  }));

  // Archive a payroll period
  app.post("/api/payroll/periods/:id/archive", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Verify the period belongs to the user's branch
      const period = await storage.getPayrollPeriod(id);
      if (!period) {
        return res.status(404).json({ message: "Payroll period not found" });
      }
      if (period.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Cannot archive payroll for another branch" });
      }

      // Get all entries for this period
      const entries = await storage.getPayrollEntriesByPeriod(id);
      const entriesSnapshot = JSON.stringify(entries);

      const archived = await storage.archivePayrollPeriod(id, userId, entriesSnapshot);

      res.json({
        message: "Payroll period archived successfully",
        archived
      });
    } catch (error: any) {
      console.error('Archive payroll error:', error);
      res.status(500).json({ message: error.message || "Failed to archive payroll period" });
    }
  }));

  // Get a specific archived period with entries
  app.get("/api/payroll/archived/:id", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const archived = await storage.getArchivedPayrollPeriod(id);

      if (!archived) {
        return res.status(404).json({ message: "Archived period not found" });
      }

      // Parse the entries snapshot
      const entries = JSON.parse(archived.entriesSnapshot || '[]');

      res.json({
        archived,
        entries
      });
    } catch (error: any) {
      console.error('Get archived period error:', error);
      res.status(500).json({ message: error.message || "Failed to get archived period" });
    }
  }));

  // Get all shift trades for current user (with enriched data)
  app.get("/api/shift-trades", requireAuth, asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      const branchId = req.user!.branchId;
      
      // 1. Get all trades for the user (as requester or target)
      const myTrades = await storage.getShiftTradesByUser(userId);

      // 2. Get Open Market trades (available for pickup by anyone in branch)
      const openTrades = await storage.getAvailableShiftTrades(branchId);
      
      // 3. Get pending trades for managers (needing approval)
      let managerTrades: any[] = [];
      if (req.user!.role === "manager" || req.user!.role === "admin") {
        managerTrades = await storage.getPendingShiftTrades(branchId);
      }
      
      // Combine and deduplicate
      // Use a Map for O(n) deduplication
      const tradeMap = new Map();
      
      [...myTrades, ...openTrades, ...managerTrades].forEach(trade => {
        tradeMap.set(trade.id, trade);
      });
      
      const allTrades = Array.from(tradeMap.values());
      
      // Batch-fetch unique shifts and users to avoid N+1 queries
      const shiftIds = [...new Set(allTrades.map(t => t.shiftId))];
      const userIds = [...new Set(allTrades.flatMap(t => [t.fromUserId, t.toUserId].filter(Boolean) as string[]))];

      const [shifts, users] = await Promise.all([
        Promise.all(shiftIds.map(sid => storage.getShift(sid))),
        Promise.all(userIds.map(uid => storage.getUser(uid))),
      ]);

      const shiftMap2 = new Map(shifts.filter(Boolean).map(s => [s!.id, s!]));
      const userMap = new Map(users.filter(Boolean).map(u => [u!.id, u!]));

      // Enrich trades with pre-fetched data
      const enrichedTrades = allTrades.map((trade) => {
          const shift = shiftMap2.get(trade.shiftId);
          const requester = userMap.get(trade.fromUserId);
          const targetUser = trade.toUserId ? userMap.get(trade.toUserId) : null;
          
          return {
            ...trade,
            // EXPLICIT IDS: Add both property name variants for frontend compatibility
            requesterId: trade.fromUserId,
            targetUserId: trade.toUserId || null,
            shift: shift ? {
              date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
              startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
              endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
            } : null,
            requester: requester ? {
              firstName: requester.firstName || "",
              lastName: requester.lastName || "",
            } : null,
            targetUser: targetUser ? {
              firstName: targetUser.firstName || "",
              lastName: targetUser.lastName || "",
            } : null,
            createdAt: trade.requestedAt ?? new Date(),
          };
      });
      
      res.json({ trades: enrichedTrades });
    } catch (error: any) {
      console.error("Get shift trades error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch shift trades" });
    }
  }));

  app.get("/api/shift-trades/available", requireAuth, asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const userId = req.user!.id;
    const trades = await storage.getAvailableShiftTrades(branchId);
    
    // Filter trades:
    // 1. Open trades (toUserId is null)
    // 2. Direct trades to me (toUserId === userId)
    // 3. Exclude my own trades (fromUserId === userId) - unless I want to see them? Usually "Available" means "Others' trades".
    
    const filteredTrades = trades.filter(t => 
      (t.toUserId === null || t.toUserId === userId) && 
      t.fromUserId !== userId
    );

    // Get shift and user details with enriched shift data
    const tradesWithDetails = await Promise.all(
      filteredTrades.map(async (trade) => {
        const shift = await storage.getShift(trade.shiftId);
        const requesterUser = await storage.getUser(trade.fromUserId);
        return { 
          ...trade, 
          // Add aliased properties for frontend compatibility
          requesterId: trade.fromUserId,
          targetUserId: trade.toUserId || "",
          shift: shift ? {
            ...shift,
            date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
            startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
            endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          } : null,
          // Use consistent property names
          requester: requesterUser ? {
            firstName: requesterUser.firstName || "",
            lastName: requesterUser.lastName || "",
          } : null,
          targetUser: null, // Available trades have no target yet
          fromUser: requesterUser ? { id: requesterUser.id, firstName: requesterUser.firstName, lastName: requesterUser.lastName, role: requesterUser.role } : null,
        };
      })
    );
    
    res.json({ trades: tradesWithDetails });
  }));

  // Get pending trades for manager approval
  app.get("/api/shift-trades/pending", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const trades = await storage.getPendingShiftTrades(branchId);
    
    const tradesWithDetails = await Promise.all(
      trades.map(async (trade) => {
        const shift = await storage.getShift(trade.shiftId);
        const requesterUser = await storage.getUser(trade.fromUserId);
        const targetUserData = trade.toUserId ? await storage.getUser(trade.toUserId) : null;
        return { 
          ...trade, 
          // Add aliased properties for frontend compatibility
          requesterId: trade.fromUserId,
          targetUserId: trade.toUserId || "",
          shift: shift ? {
            ...shift,
            date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
            startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
            endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          } : null,
          // Use consistent property names
          requester: requesterUser ? {
            firstName: requesterUser.firstName || "",
            lastName: requesterUser.lastName || "",
          } : null,
          targetUser: targetUserData ? {
            firstName: targetUserData.firstName || "",
            lastName: targetUserData.lastName || "",
          } : null,
          // Legacy compatibility
          fromUser: requesterUser ? { id: requesterUser.id, firstName: requesterUser.firstName, lastName: requesterUser.lastName, role: requesterUser.role } : null,
          toUser: targetUserData ? { id: targetUserData.id, firstName: targetUserData.firstName, lastName: targetUserData.lastName, role: targetUserData.role } : null,
        };
      })
    );
    
    res.json({ trades: tradesWithDetails });
  }));

  app.post("/api/shift-trades", requireAuth, asyncHandler(async (req, res) => {
    try {
      const tradeData = insertShiftTradeSchema.parse(req.body);
      
      // If manager, they can trade any shift. If employee, only their own.
      const shift = await storage.getShift(tradeData.shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Prevent trading past/completed shifts
      if (new Date(shift.endTime) < new Date()) {
        return res.status(400).json({ message: "Cannot trade a shift that has already ended" });
      }

      let fromUserId = req.user!.id;
      
      if (req.user!.role === "manager" || req.user!.role === "admin") {
        // If manager is posting, the 'fromUserId' should be the shift owner
        fromUserId = shift.userId;
      } else {
        // Employee can only trade their own shift
        if (shift.userId !== req.user!.id) {
          return res.status(403).json({ message: "You can only trade your own shifts" });
        }
      }

      const trade = await storage.createShiftTrade({
        ...tradeData,
        fromUserId: fromUserId,
      });

      // Enrich trade with shift and user data
      const enrichedTrade = {
        ...trade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position,
        } : null,
      };
      
      
      // Get the requester details for the notification message
      const requester = await storage.getUser(fromUserId);
      const requesterName = requester ? `${requester.firstName} ${requester.lastName}` : "An employee";
      const shiftDate = shift?.startTime ? format(new Date(shift.startTime), "MMM d") : "a shift";

      // Fetch branch users once for notifications
      const branchUsers = await storage.getUsersByBranch(req.user!.branchId);
      const notifiedUserIds = new Set<string>();

      // 1. Notify the target user if this is a direct trade
      if (trade.toUserId) {
        const notification = await storage.createNotification({
          userId: trade.toUserId,
          type: 'trade_request',
          title: 'Direct Shift Trade Request',
          message: `${requesterName} wants to trade their ${shiftDate} shift with you.`,
          data: JSON.stringify({ 
            shiftDate,
            requesterName,
            tradeType: 'direct'
          })
        } as any);
        realTimeManager.broadcastNotification(notification);
        notifiedUserIds.add(trade.toUserId);
      } else {
        // 2. If it's an open trade, notify everyone in the branch
        for (const user of branchUsers) {
          // Don't notify the person who created it
          if (user.id === fromUserId) continue;
          
          const notification = await storage.createNotification({
            userId: user.id,
            type: 'shift_trade',
            title: 'New Shift Available',
            message: `${requesterName} posted a ${shiftDate} shift for trade.`,
            data: JSON.stringify({ 
              shiftDate,
              requesterName,
              tradeType: 'open'
            })
          } as any);
          realTimeManager.broadcastNotification(notification);
          notifiedUserIds.add(user.id);
        }
      }

      // 3. Notify managers not already notified
      const managers = branchUsers.filter(u => u.role === 'manager' || u.role === 'admin');
      for (const manager of managers) {
        if (manager.id === req.user!.id || notifiedUserIds.has(manager.id)) continue;

        const notificationManager = await storage.createNotification({
          userId: manager.id,
          type: 'trade_request',
          title: 'New Shift Trade Posted',
          message: `${requesterName} has posted a shift trade for ${shiftDate}.`,
          data: JSON.stringify({ 
            shiftDate,
            requesterName,
            tradeType: trade.toUserId ? 'direct' : 'open'
          })
        } as any);
        realTimeManager.broadcastNotification(notificationManager);
      }

      // Broadcast real-time event for UI state updates (badges, list updates)
      realTimeManager.broadcastTradeCreated(enrichedTrade, shift);
      
      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Create trade error:", error);
      res.status(400).json({ message: error.message || "Invalid trade data" });
    }
  }));

  // PATCH endpoint for responding to a trade (accept/reject by target user)
  app.patch("/api/shift-trades/:id", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;

      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // Verify trade belongs to user's branch
      const tradeShift = await storage.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      // Validate status value
      const validStatuses = ['accepted', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'" });
      }

      // Only pending trades can be accepted/rejected by target user
      if (trade.status !== 'pending') {
        return res.status(400).json({ message: `Cannot ${status} a trade that is already ${trade.status}` });
      }

      // Prevent self-acceptance: creator cannot accept their own trade
      if (trade.fromUserId === userId && status === 'accepted') {
        return res.status(400).json({ message: "You cannot accept your own trade request" });
      }

      // If trade has a specific target user, only they can respond
      if (trade.toUserId && trade.toUserId !== userId) {
        return res.status(403).json({ message: "You cannot respond to this trade" });
      }

      // If trade is open (no toUserId), set current user as target
      const updateData: any = { status };
      if (!trade.toUserId && (status === "accepted" || status === "pending")) {
        updateData.toUserId = userId;
      }

      const updatedTrade = await storage.updateShiftTrade(id, updateData);

      // Enrich with shift data
      const shift = await storage.getShift(trade.shiftId);
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position,
        } : null,
      };
      
      
      // Broadcast real-time events based on status
      if (status === "accepted") {
        realTimeManager.broadcastTradeAccepted(id, enrichedTrade, shift);
      } else if (status === "rejected") {
        realTimeManager.broadcastTradeRejected(id, enrichedTrade, undefined, req.user!.branchId);
      } else {
        realTimeManager.broadcastTradeStatusChanged(id, status, enrichedTrade, req.user!.branchId);
      }
      
      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Respond to trade error:", error);
      res.status(500).json({ message: error.message || "Failed to respond to trade" });
    }
  }));

  // PATCH endpoint for manager approval of trades
  app.patch("/api/shift-trades/:id/approve", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const managerId = req.user!.id;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // Verify trade belongs to manager's branch
      const tradeShift = await storage.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      // Prevent processing already-finalized trades
      if (trade.status === 'approved' || trade.status === 'rejected') {
        return res.status(409).json({ message: `Trade has already been ${trade.status}` });
      }

      if (status === "approved" && !trade.toUserId) {
        return res.status(400).json({ message: "Cannot approve trade without a target user" });
      }

      if (status === "approved") {
        // Update shift ownership
        await storage.updateShift(trade.shiftId, {
          userId: trade.toUserId!
        });
      }

      const updatedTrade = await storage.updateShiftTrade(id, {
        status,
        approvedBy: managerId,
        approvedAt: new Date()
      });

      // Enrich with shift data
      const shift = await storage.getShift(trade.shiftId);
      const shiftDate = shift?.startTime ? format(new Date(shift.startTime), "MMM d") : "a shift";
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position,
        } : null,
      };

      // ── Real-time notifications for both approve & reject ──
      // Look up employee names for richer messages
      const fromUser = await storage.getUser(trade.fromUserId);
      const toUser = trade.toUserId ? await storage.getUser(trade.toUserId) : null;
      const fromName = fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : 'An employee';
      const toName = toUser ? `${toUser.firstName} ${toUser.lastName}` : 'another employee';
      const manager = await storage.getUser(managerId);
      const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'A manager';

      if (status === "approved") {
        // Notify requester
        const nReq = await storage.createNotification({
          userId: trade.fromUserId,
          type: 'shift_trade',
          title: 'Shift Trade Approved ✅',
          message: `Great news! Your trade for the ${shiftDate} shift has been approved by ${managerName}. ${toName} will now cover this shift.`,
          data: JSON.stringify({ shiftDate, status: 'approved' })
        } as any);
        realTimeManager.broadcastNotification(nReq);

        // Notify target
        if (trade.toUserId) {
          const nTarget = await storage.createNotification({
            userId: trade.toUserId,
            type: 'shift_trade',
            title: 'New Shift Assigned',
            message: `You've been assigned ${fromName}'s ${shiftDate} shift from an approved trade.`,
            data: JSON.stringify({ shiftDate, status: 'approved' })
          } as any);
          realTimeManager.broadcastNotification(nTarget);
        }

        // Broadcast trade approval for live schedule refresh
        realTimeManager.broadcastTradeApproved(id, enrichedTrade, shift!);

        // Audit log
        await createAuditLog({
          action: 'trade_approve',
          entityType: 'shift_trade',
          entityId: id,
          userId: managerId,
          newValues: { status: 'approved', fromUserId: trade.fromUserId, toUserId: trade.toUserId, shiftId: trade.shiftId },
          ipAddress: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers["user-agent"],
        });
      } else {
        // Notify requester of rejection
        const nReq = await storage.createNotification({
          userId: trade.fromUserId,
          type: 'shift_trade',
          title: 'Shift Trade Rejected',
          message: `Your shift trade request for ${shiftDate} was not approved by ${managerName}. Your original shift remains unchanged.`,
          data: JSON.stringify({ shiftDate, status: 'rejected' })
        } as any);
        realTimeManager.broadcastNotification(nReq);

        // Notify target too if they accepted it
        if (trade.toUserId) {
          const nTarget = await storage.createNotification({
            userId: trade.toUserId,
            type: 'shift_trade',
            title: 'Trade Request Declined',
            message: `The shift trade for ${shiftDate} with ${fromName} was not approved. No changes to your schedule.`,
            data: JSON.stringify({ shiftDate, status: 'rejected' })
          } as any);
          realTimeManager.broadcastNotification(nTarget);
        }

        // Audit log
        await createAuditLog({
          action: 'trade_reject',
          entityType: 'shift_trade',
          entityId: id,
          userId: managerId,
          newValues: { status: 'rejected', fromUserId: trade.fromUserId, toUserId: trade.toUserId, shiftId: trade.shiftId },
          ipAddress: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers["user-agent"],
        });
      }

      const action = status === "approved" ? "✅ approved" : "❌ rejected";
      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Manager approve trade error:", error);
      res.status(500).json({ message: error.message || "Failed to process trade" });
    }
  }));

  app.put("/api/shift-trades/:id/take", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // Verify trade belongs to user's branch
      const tradeShift = await storage.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      // Only open trades (no toUserId yet) or trades directed at this user can be taken
      if (trade.toUserId && trade.toUserId !== userId) {
        return res.status(403).json({ message: "This trade is reserved for another employee" });
      }

      // Prevent taking a trade that's already been taken or processed
      if (trade.status !== 'pending' && trade.status !== 'open') {
        return res.status(409).json({ message: `Trade has already been ${trade.status}` });
      }

      // Can't take your own trade
      if (trade.fromUserId === userId) {
        return res.status(400).json({ message: "You cannot take your own trade" });
      }

      const updatedTrade = await storage.updateShiftTrade(id, {
        toUserId: userId,
        status: "pending", // Still needs manager approval
      });

      // Enrich with shift data
      const shift = await storage.getShift(trade.shiftId);
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position,
        } : null,
      };


      // 1. Notify the original requester
      const taker = await storage.getUser(userId);
      const takerName = taker ? `${taker.firstName} ${taker.lastName}` : "Another employee";
      const shiftDate = shift?.startTime ? format(new Date(shift.startTime), "MMM d") : "a shift";
      
      const notificationRequester = await storage.createNotification({
        userId: trade.fromUserId,
        type: 'shift_trade',
        title: 'Shift Trade Taken',
        message: `${takerName} has accepted your ${shiftDate} shift trade. It is now pending manager approval.`,
        data: JSON.stringify({ 
          shiftDate,
          takerName,
          status: 'taken'
        })
      } as any);
      realTimeManager.broadcastNotification(notificationRequester);

      // 2. Notify all managers in the branch
      const branchUsers = await storage.getUsersByBranch(req.user!.branchId);
      const managers = branchUsers.filter(u => u.role === 'manager' || u.role === 'admin');
      for (const manager of managers) {
        const notificationManager = await storage.createNotification({
          userId: manager.id,
          type: 'trade_request',
          title: 'Shift Trade Awaiting Approval',
          message: `${takerName} has taken a shift trade from another employee. Please review it.`,
          data: JSON.stringify({ 
            shiftDate,
            takerName,
            status: 'pending_approval'
          })
        } as any);
        realTimeManager.broadcastNotification(notificationManager);
      }

      // 3. Broadcast status change to update UI lists
      realTimeManager.broadcastTradeStatusChanged(id, "pending", enrichedTrade, req.user!.branchId);

      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Take shift trade error:", error);
      res.status(500).json({ message: error.message || "Failed to take shift" });
    }
  }));

  app.put("/api/shift-trades/:id/approve", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const managerId = req.user!.id;

      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // Verify trade belongs to manager's branch
      const tradeShift = await storage.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      // Prevent re-approving already-finalized trades
      if (trade.status === 'approved' || trade.status === 'rejected') {
        return res.status(409).json({ message: `Trade has already been ${trade.status}` });
      }

      if (!trade.toUserId) {
        return res.status(400).json({ message: "Cannot approve trade without a target user" });
      }

      // 1. Update the shift ownership
      await storage.updateShift(trade.shiftId, {
        userId: trade.toUserId
      });

      // 2. Update trade status
      const updatedTrade = await storage.updateShiftTrade(id, {
        status: "approved",
        approvedBy: managerId,
        approvedAt: new Date()
      });

      // 3. Create notifications
      const shift = await storage.getShift(trade.shiftId);
      const shiftDate = shift?.startTime ? format(new Date(shift.startTime), "MMM d") : "a shift";

      const notificationRequester = await storage.createNotification({
        userId: trade.fromUserId,
        type: 'shift_trade',
        title: 'Shift Trade Approved ✅',
        message: `Great news! Your trade for the ${shiftDate} shift has been approved.`,
        data: JSON.stringify({ 
          shiftDate,
          status: 'approved'
        })
      } as any);
      realTimeManager.broadcastNotification(notificationRequester);

      const notificationTarget = await storage.createNotification({
        userId: trade.toUserId,
        type: 'shift_trade',
        title: 'New Shift Assigned',
        message: `You've been assigned a new shift on ${shiftDate} from an approved trade.`,
        data: JSON.stringify({ 
          shiftDate,
          status: 'approved'
        })
      } as any);
      realTimeManager.broadcastNotification(notificationTarget);

      // Enrich with shift data (shift already fetched above)
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position,
        } : null,
      };

      
      // CRITICAL: Broadcast real-time approval with updated shift
      // This triggers instant schedule updates on all clients
      realTimeManager.broadcastTradeApproved(id, enrichedTrade, shift!);

      // Audit log for trade approval
      await createAuditLog({
        action: 'trade_approve',
        entityType: 'shift_trade',
        entityId: id,
        userId: managerId,
        newValues: { status: 'approved', fromUserId: trade.fromUserId, toUserId: trade.toUserId, shiftId: trade.shiftId },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Approve trade error:", error);
      res.status(500).json({ message: error.message || "Failed to approve trade" });
    }
  }));

  app.put("/api/shift-trades/:id/reject", requireAuth, requireRole(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const managerId = req.user!.id;

      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // Verify trade belongs to manager's branch
      const tradeShift = await storage.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user!.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }

      const updatedTrade = await storage.updateShiftTrade(id, {
        status: "rejected",
        approvedBy: managerId,
        approvedAt: new Date()
      });

      const shift = await storage.getShift(trade.shiftId);
      const shiftDate = shift?.startTime ? format(new Date(shift.startTime), "MMM d") : "a shift";

      // Notify requester
      const notificationRequester = await storage.createNotification({
        userId: trade.fromUserId,
        type: 'shift_trade',
        title: 'Shift Trade Rejected',
        message: `Your shift trade request for ${shiftDate} was not approved. Your original shift remains unchanged.`,
        data: JSON.stringify({ 
          shiftDate,
          status: 'rejected'
        })
      } as any);
      realTimeManager.broadcastNotification(notificationRequester);

      // Enrich with shift data (shift already fetched above)
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position,
        } : null,
      };


      // Audit log for trade rejection
      await createAuditLog({
        action: 'trade_reject',
        entityType: 'shift_trade',
        entityId: id,
        userId: managerId,
        newValues: { status: 'rejected', fromUserId: trade.fromUserId, toUserId: trade.toUserId, shiftId: trade.shiftId },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Reject trade error:", error);
      res.status(500).json({ message: error.message || "Failed to reject trade" });
    }
  }));

  // DELETE endpoint for canceling shift trades
  app.delete("/api/shift-trades/:id", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // Only the requester can delete a pending trade
      if (trade.fromUserId !== userId && req.user!.role !== "admin") {
        return res.status(403).json({ message: "You cannot delete this trade" });
      }

      // Only allow deletion of pending trades
      if (trade.status !== "pending") {
        return res.status(400).json({ message: "Can only cancel pending trades" });
      }

      // Update the trade status to 'rejected' (use schema-allowed value)
      const updatedTrade = await storage.updateShiftTrade(id, {
        status: "rejected"
      });

      // Notify target user if one was selected
      if (trade.toUserId) {
        const notificationTarget = await storage.createNotification({
          userId: trade.toUserId,
          type: 'schedule',
          title: 'Shift Trade Cancelled',
          message: 'A shift trade request has been cancelled.',
          data: JSON.stringify({ tradeId: id })
        } as any);
        realTimeManager.broadcastNotification(notificationTarget);
      }

      // Enrich with shift data
      const shift = await storage.getShift(trade.shiftId);
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position,
        } : null,
      };

      res.json({ 
        message: "Trade cancelled successfully",
        trade: enrichedTrade 
      });
    } catch (error: any) {
      console.error("Delete shift trade error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel trade" });
    }
  }));

  // Admin Deduction Rates Routes (Admin only)
  app.get("/api/admin/deduction-rates", requireAuth, requireRole(["admin"]), asyncHandler(async (req, res) => {
    try {
      const rates = await storage.getAllDeductionRates();
      res.json({ rates });
    } catch (error: any) {
      console.error('Get deduction rates error:', error);
      res.status(500).json({ message: error.message || "Failed to get deduction rates" });
    }
  }));

  app.post("/api/admin/deduction-rates", requireAuth, requireRole(["admin"]), asyncHandler(async (req, res) => {
    try {
      const { type, minSalary, maxSalary, employeeRate, employeeContribution, description } = req.body;

      const rate = await storage.createDeductionRate({
        type,
        minSalary,
        maxSalary: maxSalary || null,
        employeeRate: employeeRate || null,
        employeeContribution: employeeContribution || null,
        description: description || null,
        isActive: true,
      });

      // Audit log
      await createAuditLog({
        action: 'rate_create',
        entityType: 'deduction_rate',
        entityId: rate.id,
        userId: req.user!.id,
        newValues: { type, minSalary, maxSalary, employeeRate, employeeContribution },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ rate });
    } catch (error: any) {
      console.error('Create deduction rate error:', error);
      res.status(500).json({ message: error.message || "Failed to create deduction rate" });
    }
  }));

  app.put("/api/admin/deduction-rates/:id", requireAuth, requireRole(["admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { type, minSalary, maxSalary, employeeRate, employeeContribution, description } = req.body;

      const rate = await storage.updateDeductionRate(id, {
        type,
        minSalary,
        maxSalary: maxSalary || null,
        employeeRate: employeeRate || null,
        employeeContribution: employeeContribution || null,
        description: description || null,
      });

      if (!rate) {
        return res.status(404).json({ message: "Deduction rate not found" });
      }

      // Audit log
      await createAuditLog({
        action: 'rate_update',
        entityType: 'deduction_rate',
        entityId: id,
        userId: req.user!.id,
        newValues: { type, minSalary, maxSalary, employeeRate, employeeContribution },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ rate });
    } catch (error: any) {
      console.error('Update deduction rate error:', error);
      res.status(500).json({ message: error.message || "Failed to update deduction rate" });
    }
  }));

  app.delete("/api/admin/deduction-rates/:id", requireAuth, requireRole(["admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDeductionRate(id);

      if (!success) {
        return res.status(404).json({ message: "Deduction rate not found" });
      }

      // Audit log
      await createAuditLog({
        action: 'rate_delete',
        entityType: 'deduction_rate',
        entityId: id,
        userId: req.user!.id,
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ message: "Deduction rate deleted successfully" });
    } catch (error: any) {
      console.error('Delete deduction rate error:', error);
      res.status(500).json({ message: error.message || "Failed to delete deduction rate" });
    }
  }));

  // Deduction Settings Routes (Manager only)
  app.get("/api/deduction-settings", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      let settings = await storage.getDeductionSettings(branchId);

      // If no settings exist, create default settings
      if (!settings) {
        settings = await storage.createDeductionSettings({
          branchId,
          deductSSS: true,
          deductPhilHealth: false,
          deductPagibig: false,
          deductWithholdingTax: false,
        });
      }

      res.json({ settings });
    } catch (error: any) {
      console.error('Get deduction settings error:', error);
      res.status(500).json({ message: error.message || "Failed to get deduction settings" });
    }
  }));

  app.put("/api/deduction-settings/:id", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { deductSSS, deductPhilHealth, deductPagibig, deductWithholdingTax } = req.body;

      const settings = await storage.updateDeductionSettings(id, {
        deductSSS,
        deductPhilHealth,
        deductPagibig,
        deductWithholdingTax,
      });

      if (!settings) {
        return res.status(404).json({ message: "Deduction settings not found" });
      }

      // Audit log
      await createAuditLog({
        action: 'settings_update',
        entityType: 'deduction_settings',
        entityId: id,
        userId: req.user!.id,
        newValues: { deductSSS, deductPhilHealth, deductPagibig, deductWithholdingTax },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      res.json({ settings });
    } catch (error: any) {
      console.error('Update deduction settings error:', error);
      res.status(500).json({ message: error.message || "Failed to update deduction settings" });
    }
  }));

  // Manager approval routes
  app.get("/api/approvals", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const approvals = await storage.getPendingApprovals(branchId);

    // Get user details for each approval
    const approvalsWithUsers = await Promise.all(
      approvals.map(async (approval) => {
        const requestedBy = await storage.getUser(approval.requestedBy);
        return { ...approval, requestedBy };
      })
    );

    res.json({ approvals: approvalsWithUsers });
  }));

  app.put("/api/approvals/:id", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const approval = await storage.updateApproval(id, {
      status,
      reason,
      approvedBy: req.user!.id,
    });
    
    if (!approval) {
      return res.status(404).json({ message: "Approval not found" });
    }
    
    res.json({ approval });
  }));

  // Register branches routes
  registerBranchesRoutes(app);

  // Reports API endpoints
  app.get("/api/reports/payroll", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const users = await storage.getUsersByBranch(branchId);
    const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
    const periodMap = new Map(allPeriods.map(p => [p.id, p]));
    let totalPayroll = 0;

    for (const user of users) {
      const entries = await storage.getPayrollEntriesByUser(user.id);
      for (const entry of entries) {
        const period = periodMap.get(entry.payrollPeriodId);
        if (period) {
          const periodEnd = new Date(period.endDate);
          if (periodEnd >= monthStart && periodEnd <= monthEnd) {
            totalPayroll += parseFloat(entry.grossPay);
          }
        }
      }
    }

    res.json({ totalPayroll: Number(totalPayroll.toFixed(2)) });
  }));

  app.get("/api/reports/attendance", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const users = await storage.getUsersByBranch(branchId);
    let totalHours = 0;

    for (const user of users) {
      const shifts = await storage.getShiftsByUser(user.id, monthStart, monthEnd);
      for (const shift of shifts) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
        totalHours += hours;
      }
    }

    res.json({ totalHours: Number(totalHours.toFixed(2)) });
  }));

  app.get("/api/reports/shifts", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const shifts = await storage.getShiftsByBranch(branchId, monthStart, monthEnd);

    res.json({
      totalShifts: shifts.length,
      completedShifts: shifts.filter(s => s.status === 'completed').length,
      missedShifts: shifts.filter(s => s.status === 'missed').length,
      cancelledShifts: shifts.filter(s => s.status === 'cancelled').length,
    });
  }));

  app.get("/api/reports/employees", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    const users = await storage.getUsersByBranch(branchId);

    res.json({
      activeCount: users.filter(u => u.isActive).length,
      totalCount: users.length,
      inactiveCount: users.filter(u => !u.isActive).length,
    });
  }));

  // Dashboard stats routes
  app.get("/api/dashboard/stats", requireAuth, requireRole(["manager"]), apiCache(60), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    // Use Philippine time (UTC+8) for "today" boundaries
    const now = new Date();
    const phtOffset = 8 * 60 * 60 * 1000;
    const phtNow = new Date(now.getTime() + phtOffset);
    const todayUTC = new Date(Date.UTC(phtNow.getUTCFullYear(), phtNow.getUTCMonth(), phtNow.getUTCDate()));
    const today = new Date(todayUTC.getTime() - phtOffset); // back to UTC for DB query
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Get today's shifts for the branch
    const todayShifts = await storage.getShiftsByBranch(branchId, today, tomorrow);

    // Calculate active employees - shifts with status 'in-progress'
    const clockedIn = todayShifts.filter(shift => shift.status === 'in-progress').length;

    // Calculate employees on break (for now, we'll use 0 as we don't have break tracking yet)
    const onBreak = 0;

    // Calculate late arrivals - shifts that started more than 15 minutes after scheduled start time
    const late = todayShifts.filter(shift => {
      const scheduledStart = new Date(shift.startTime);
      const actualStart = shift.actualStartTime ? new Date(shift.actualStartTime) : null;
      if (!actualStart) return false;
      const diffMinutes = (actualStart.getTime() - scheduledStart.getTime()) / (1000 * 60);
      return diffMinutes > 15;
    }).length;

    // Compute totalEmployees given the branch (pre-fetch for revenue calc too)
    const branchUsers = await storage.getUsersByBranch(branchId);
    const userMap = new Map(branchUsers.map(u => [u.id, u]));

    // Calculate revenue from completed shifts (simplified - based on hours worked)
    // In a real system, this would come from a sales/revenue table
    const completedShifts = todayShifts.filter(shift => shift.status === 'completed');
    let revenue = 0;
    for (const shift of completedShifts) {
      const user = userMap.get(shift.userId);
      if (user) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
        const rate = parseFloat(user.hourlyRate);
        // Estimate revenue as 3x labor cost (typical cafe margin)
        revenue += hours * (isNaN(rate) ? 0 : rate) * 3;
      }
    }
    const totalEmployees = branchUsers.length;

    // Scheduled today = total shifts for today
    const scheduledToday = todayShifts.length;

    // Pending requests = pending time-off + pending shift trades
    const pendingTrades = await storage.getPendingShiftTrades(branchId);
    const allTimeOffRequests = await Promise.all(
      branchUsers.map(u => storage.getTimeOffRequestsByUser(u.id))
    );
    const pendingTimeOffCount = allTimeOffRequests.flat().filter(r => r.status === 'pending').length;
    const pendingRequests = pendingTimeOffCount + (pendingTrades?.length || 0);

    res.json({
      stats: {
        totalEmployees,
        scheduledToday,
        pendingRequests,
        clockedIn,
        onBreak,
        late,
        revenue: Number(revenue.toFixed(2))
      }
    });
  }));

  // Dashboard employee status route
  app.get("/api/dashboard/employee-status", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user!.branchId;
    // Use Philippine time (UTC+8) for "today" boundaries
    const now = new Date();
    const phtOffset = 8 * 60 * 60 * 1000;
    const phtNow = new Date(now.getTime() + phtOffset);
    const todayUTC = new Date(Date.UTC(phtNow.getUTCFullYear(), phtNow.getUTCMonth(), phtNow.getUTCDate()));
    const today = new Date(todayUTC.getTime() - phtOffset);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Get all active employees in the branch
    const allEmployees = await storage.getUsersByBranch(branchId);
    const employees = allEmployees.filter(user => user.isActive);

    // Get today's shifts for the branch
    const todayShifts = await storage.getShiftsByBranch(branchId, today, tomorrow);

    // Build employee status list
    const employeeStatus = await Promise.all(
      employees.map(async (user) => {
        // Find today's shift for this employee
        const todayShift = todayShifts.find(shift => shift.userId === user.id);

        let status = 'Off Duty';
        let statusInfo = '';

        if (todayShift) {
          if (todayShift.status === 'in-progress') {
            status = 'Active';
            statusInfo = todayShift.actualStartTime
              ? `Since ${format(new Date(todayShift.actualStartTime), "h:mm a")}`
              : `Scheduled ${format(new Date(todayShift.startTime), "h:mm a")}`;
          } else if (todayShift.status === 'completed') {
            status = 'Completed';
            const start = todayShift.actualStartTime ? format(new Date(todayShift.actualStartTime), "h:mm a") : format(new Date(todayShift.startTime), "h:mm a");
            const end = todayShift.actualEndTime ? format(new Date(todayShift.actualEndTime), "h:mm a") : format(new Date(todayShift.endTime), "h:mm a");
            statusInfo = `Worked ${start} - ${end}`;
          } else if (todayShift.status === 'scheduled') {
            status = 'Scheduled';
            statusInfo = `${format(new Date(todayShift.startTime), "h:mm a")} - ${format(new Date(todayShift.endTime), "h:mm a")}`;
          }
        }

        return {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            position: user.position,
          },
          status,
          statusInfo,
        };
      })
    );

    res.json({ employeeStatus });
  }));

  // Time off request routes
  app.get("/api/time-off-requests", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const branchId = req.user!.branchId;

    let requests;

    // Managers and admins get all requests from their branch, employees get only their own
    if (userRole === 'manager' || userRole === 'admin') {
      // Get all employees in the branch
      const employees = await storage.getUsersByBranch(branchId);
      const employeeIds = employees.map(emp => emp.id);

      // Get all requests from branch employees
      const allRequests = await Promise.all(
        employeeIds.map(empId => storage.getTimeOffRequestsByUser(empId))
      );
      requests = allRequests.flat();
      // Sort combined requests by requestedAt descending (newest first)
      requests.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
    } else {
      requests = await storage.getTimeOffRequestsByUser(userId);
    }

    // Get user details for each request
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const user = await storage.getUser(request.userId);
        return { ...request, user };
      })
    );

    res.json({ requests: requestsWithUsers });
  }));

  // Employee analytics endpoint
  app.get("/api/employee/performance", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get last 6 months of data
    const monthlyData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      // Get shifts for this month
      const shifts = await storage.getShiftsByUser(userId, monthStart, monthEnd);

      // Calculate hours
      let hours = 0;
      for (const shift of shifts) {
        const shiftHours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
        hours += shiftHours;
      }

      // Calculate estimated sales (3x labor cost)
      const rate = parseFloat(user.hourlyRate);
      const sales = hours * (isNaN(rate) ? 0 : rate) * 3;

      monthlyData.push({
        name: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        hours: Number(hours.toFixed(2)),
        sales: Number(sales.toFixed(2)),
      });
    }

    // Get current month stats
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const currentMonthShifts = await storage.getShiftsByUser(userId, currentMonthStart, currentMonthEnd);

    let currentMonthHours = 0;
    for (const shift of currentMonthShifts) {
      const shiftHours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
      currentMonthHours += shiftHours;
    }

    const completedShifts = currentMonthShifts.filter(s => s.status === 'completed').length;
    const totalShifts = currentMonthShifts.length;
    const completionRate = totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0;

    res.json({
      monthlyData,
      currentMonth: {
        hours: Number(currentMonthHours.toFixed(2)),
        sales: Number((currentMonthHours * (isNaN(parseFloat(user.hourlyRate)) ? 0 : parseFloat(user.hourlyRate)) * 3).toFixed(2)),
        shiftsCompleted: completedShifts,
        totalShifts: totalShifts,
        completionRate: Number(completionRate.toFixed(1)),
      }
    });
  }));

  // Time off balance endpoint
  app.get("/api/time-off-balance", requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const requests = await storage.getTimeOffRequestsByUser(userId);

    // Calculate used days for each type this year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    let vacationUsed = 0;
    let sickUsed = 0;
    let personalUsed = 0;

    for (const request of requests) {
      if (request.status === 'approved') {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);

        // Only count requests in current year
        if (startDate >= yearStart && startDate <= yearEnd) {
          // Calculate days (inclusive) — normalize to date-only to avoid time-component over-counting
          const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          const days = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          if (request.type === 'vacation') {
            vacationUsed += days;
          } else if (request.type === 'sick') {
            sickUsed += days;
          } else if (request.type === 'personal') {
            personalUsed += days;
          }
        }
      }
    }

    // Standard allowances (can be customized per employee in the future)
    const vacationAllowance = 15; // 15 days per year
    const sickAllowance = 10; // 10 days per year
    const personalAllowance = 5; // 5 days per year

    res.json({
      vacation: vacationAllowance - vacationUsed,
      sick: sickAllowance - sickUsed,
      personal: personalAllowance - personalUsed,
      used: {
        vacation: vacationUsed,
        sick: sickUsed,
        personal: personalUsed,
      },
      allowance: {
        vacation: vacationAllowance,
        sick: sickAllowance,
        personal: personalAllowance,
      }
    });
  }));

  // Time off policy routes (for configurable advance notice)
  app.get("/api/time-off-policy", requireAuth, asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      
      // Initialize defaults if none exist
      await storage.initializeDefaultTimeOffPolicies(branchId);
      
      const policies = await storage.getTimeOffPolicyByBranch(branchId);
      
      // Return as a map for easy frontend lookup
      const policyMap: Record<string, { minimumAdvanceDays: number; isActive: boolean }> = {};
      for (const policy of policies) {
        policyMap[policy.leaveType] = {
          minimumAdvanceDays: policy.minimumAdvanceDays,
          isActive: policy.isActive ?? true
        };
      }
      
      res.json({ policies: policyMap });
    } catch (error: any) {
      console.error('Error fetching time off policy:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch time off policy' });
    }
  }));

  app.put("/api/time-off-policy", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const { leaveType, minimumAdvanceDays } = req.body;
      
      if (!leaveType || minimumAdvanceDays === undefined) {
        return res.status(400).json({ message: 'leaveType and minimumAdvanceDays are required' });
      }
      
      if (typeof minimumAdvanceDays !== 'number' || minimumAdvanceDays < 0) {
        return res.status(400).json({ message: 'minimumAdvanceDays must be a non-negative number' });
      }
      
      // Prevent changing sick/emergency policy to non-zero (Philippine policy: same-day allowed)
      if (['sick', 'emergency'].includes(leaveType) && minimumAdvanceDays > 0) {
        return res.status(400).json({ 
          message: 'Sick and Emergency leave must allow same-day requests (0 days notice) per Philippine cafe practices' 
        });
      }
      
      const policy = await storage.upsertTimeOffPolicy(branchId, leaveType, minimumAdvanceDays);
      
      res.json({ policy, message: `Policy updated: ${leaveType} now requires ${minimumAdvanceDays} days advance notice` });
    } catch (error: any) {
      console.error('Error updating time off policy:', error);
      res.status(500).json({ message: error.message || 'Failed to update time off policy' });
    }
  }));

  app.post("/api/time-off-requests", requireAuth, asyncHandler(async (req, res) => {
    try {
      
      // Manually parse dates
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error(`Invalid date format. Start: ${req.body.startDate}, End: ${req.body.endDate}`);
      }

      // Calculate advance notice days (from today to start date)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const advanceDays = Math.ceil((startDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Get policy for this leave type
      const branchId = req.user!.branchId;
      const leaveType = req.body.type as string;
      
      // Inline defaults for when table doesn't exist
      const inlineDefaults: Record<string, number> = {
        vacation: 7,
        sick: 0,
        emergency: 0,
        personal: 3,
        other: 3
      };
      
      // Initialize default policies if none exist, then get the policy
      await storage.initializeDefaultTimeOffPolicies(branchId);
      const policy = await storage.getTimeOffPolicyByType(branchId, leaveType);
      const minimumAdvanceDays = policy?.minimumAdvanceDays ?? inlineDefaults[leaveType] ?? 0;
      
      // Determine if this is a short notice request (soft warning only, never block)
      const shortNotice = advanceDays < minimumAdvanceDays && !['sick', 'emergency'].includes(leaveType);

      // Explicit payload construction with validation
      const validTypes = ['vacation', 'sick', 'emergency', 'personal', 'other'];
      const leaveTypeValue = req.body.type as string;
      if (!leaveTypeValue || !validTypes.includes(leaveTypeValue)) {
        return res.status(400).json({ message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
      }
      if (!req.user!.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const requestPayload: any = {
        userId: req.user!.id,
        startDate: startDate,
        endDate: endDate,
        type: leaveTypeValue,
        reason: req.body.reason || '',
        status: 'pending'
      };

      // Check for overlapping time-off requests (pending or approved)
      const existingRequests = await storage.getTimeOffRequestsByUser(req.user!.id);
      const hasOverlap = existingRequests.some(r => {
        if (r.status === 'rejected') return false;
        const existStart = new Date(r.startDate).getTime();
        const existEnd = new Date(r.endDate).getTime();
        return startDate.getTime() <= existEnd && endDate.getTime() >= existStart;
      });
      if (hasOverlap) {
        return res.status(409).json({ message: "You already have a pending or approved time-off request overlapping these dates" });
      }


      const request = await storage.createTimeOffRequest(requestPayload);

      // Get the employee who made the request
      const employee = await storage.getUser(req.user!.id);

      // Get all managers in the branch to notify them
      const branchUsers = await storage.getUsersByBranch(req.user!.branchId);
      const managers = branchUsers.filter(user => user.role === 'manager');

      // Create notifications for all managers with short notice info
      const shortNoticeText = shortNotice ? ` ⚠️ SHORT NOTICE (${advanceDays} days)` : '';
      for (const manager of managers) {
        const notification = await storage.createNotification({
          userId: manager.id,
          type: 'time_off',
          title: shortNotice ? '⚠️ Short Notice Time Off Request' : 'New Time Off Request',
          message: `${employee?.firstName} ${employee?.lastName} has requested time off from ${format(new Date(request.startDate), "MMM d")} to ${format(new Date(request.endDate), "MMM d, yyyy")} (${requestPayload.type})${shortNoticeText}`,
          isRead: false,
          data: JSON.stringify({
            employeeName: `${employee?.firstName} ${employee?.lastName}`,
            type: requestPayload.type,
            startDate: format(new Date(request.startDate), "MMM d, yyyy"),
            endDate: format(new Date(request.endDate), "MMM d, yyyy"),
            advanceDays,
            status: 'pending'
          })
        } as any);
        realTimeManager.broadcastNotification(notification);
      }

      // Broadcast time-off created event for real-time UI updates
      realTimeManager.broadcastTimeOffCreated(request, req.user!.branchId);

      // Return request with advance notice info for frontend to show appropriate toast
      res.json({ 
        request,
        advanceDays,
        shortNotice,
        minimumAdvanceDays
      });
    } catch (error: any) {
      console.error('❌ Time off request creation error:', error);
      if (error.errors) {
        console.error('❌ Zod Validation Errors:', JSON.stringify(error.errors, null, 2));
        // Zod validation error
        res.status(400).json({
          message: "Invalid time off request data: " + error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
          errors: error.errors
        });
      } else {
        res.status(400).json({
          message: error.message || "Invalid time off request data"
        });
      }
    }
  }));

  app.put("/api/time-off-requests/:id/approve", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await storage.getTimeOffRequest(id);
    if (!existing) {
      return res.status(404).json({ message: "Time off request not found" });
    }
    if (existing.status !== 'pending') {
      return res.status(409).json({ message: `Request has already been ${existing.status}` });
    }

    // Verify the employee belongs to the manager's branch
    const employee = await storage.getUser(existing.userId);
    if (!employee || employee.branchId !== req.user!.branchId) {
      return res.status(403).json({ message: "Not authorized for this branch" });
    }

    const request = await storage.updateTimeOffRequest(id, {
      status: "approved",
      approvedBy: req.user!.id,
    });

    if (!request) {
      return res.status(404).json({ message: "Time off request not found" });
    }

    // ─── Smart SIL Logic ─────────────────────────────────────────────────────
    // Manager can pass `useSil: true` in the body to use SIL credits for the leave.
    // If useSil is false or not provided, the leave is treated as LWOP (Leave Without Pay).
    const useSil = req.body.useSil === true || req.body.useSil === 'true';
    const startD = new Date(request.startDate);
    const endD = new Date(request.endDate);
    const daysToDeduct = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    let isPaid = false;

    if (useSil) {
      try {
        // 1. Try to deduct from the specific leave type balance first (vacation/sick)
        const { db } = await import('./db');
        const { leaveCredits } = await import('@shared/schema');
        const { eq, and } = await import('drizzle-orm');

        const specificBalance = await db.select().from(leaveCredits).where(
          and(eq(leaveCredits.userId, request.userId), eq(leaveCredits.year, startD.getFullYear()), eq(leaveCredits.leaveType, request.type))
        ).limit(1);

        let deductedFrom: string | null = null;
        if (specificBalance[0] && parseFloat(specificBalance[0].remainingCredits) > 0) {
          deductedFrom = request.type;
        } else {
          // 2. Fall back to the SIL balance
          const silBalance = await db.select().from(leaveCredits).where(
            and(eq(leaveCredits.userId, request.userId), eq(leaveCredits.year, startD.getFullYear()), eq(leaveCredits.leaveType, 'sil'))
          ).limit(1);
          if (silBalance[0] && parseFloat(silBalance[0].remainingCredits) > 0) {
            deductedFrom = 'sil';
          }
        }

        if (deductedFrom) {
          await deductLeaveCredit(request.userId, employee.branchId, deductedFrom, daysToDeduct, startD.getFullYear());
          isPaid = true;
        }
      } catch (deductionErr) {
        console.error('Smart SIL deduction error:', deductionErr);
        // Non-blocking: leave isPaid = false if deduction fails
      }
    }

    // Mark the request as paid or unpaid based on the SIL result
    await storage.updateTimeOffRequest(id, { isPaid } as any);

    // Sync with approvals table
    try {
      const pendingApprovals = await storage.getPendingApprovals(req.user!.branchId);
      const relatedApproval = pendingApprovals.find(a => a.requestId === id && a.type === 'time_off');
      if (relatedApproval) {
        await storage.updateApproval(relatedApproval.id, {
          status: "approved",
          approvedBy: req.user!.id,
          reason: "Automatically approved via time-off request approval"
        });
      }
    } catch (syncError) {
      console.error('Failed to sync with approvals table:', syncError);
      // Don't fail the main request if sync fails
    }

    // Create notification for employee
    const notification = await storage.createNotification({
      userId: request.userId,
      type: 'time_off_approved',
      title: 'Time Off Request Approved',
      message: `Your time off request from ${format(new Date(request.startDate), "MMM d")} to ${format(new Date(request.endDate), "MMM d, yyyy")} has been approved`,
      isRead: false,
      data: JSON.stringify({
        status: 'approved',
        startDate: format(new Date(request.startDate), "MMM d, yyyy"),
        endDate: format(new Date(request.endDate), "MMM d, yyyy"),
        type: request.type
      })
    } as any);
    realTimeManager.broadcastNotification(notification);
    realTimeManager.broadcastTimeOffApproved(request, req.user!.branchId);

    // Audit log for time-off approval
    await createAuditLog({
      action: 'time_off_approve',
      entityType: 'time_off_request',
      entityId: id,
      userId: req.user!.id,
      newValues: { status: 'approved', employeeId: request.userId, startDate: request.startDate, endDate: request.endDate, type: request.type },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json({ request });
  }));

  app.put("/api/time-off-requests/:id/reject", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const existing = await storage.getTimeOffRequest(id);
    if (!existing) {
      return res.status(404).json({ message: "Time off request not found" });
    }
    if (existing.status !== 'pending') {
      return res.status(409).json({ message: `Request has already been ${existing.status}` });
    }

    // Verify the employee belongs to the manager's branch
    const employee = await storage.getUser(existing.userId);
    if (!employee || employee.branchId !== req.user!.branchId) {
      return res.status(403).json({ message: "Not authorized for this branch" });
    }

    const request = await storage.updateTimeOffRequest(id, {
      status: "rejected",
      approvedBy: req.user!.id,
      rejectionReason: rejectionReason || null,
    });

    if (!request) {
      return res.status(404).json({ message: "Time off request not found" });
    }

    // Sync with approvals table
    try {
      const pendingApprovals = await storage.getPendingApprovals(req.user!.branchId);
      const relatedApproval = pendingApprovals.find(a => a.requestId === id && a.type === 'time_off');
      if (relatedApproval) {
        await storage.updateApproval(relatedApproval.id, {
          status: "rejected",
          approvedBy: req.user!.id,
          reason: rejectionReason || "Rejected via time-off request"
        });
      }
    } catch (syncError) {
      console.error('Failed to sync with approvals table:', syncError);
      // Don't fail the main request if sync fails
    }

    // Create notification for employee with the reason included
    const reasonNote = rejectionReason ? ` Reason: ${rejectionReason}` : '';
    const notification = await storage.createNotification({
      userId: request.userId,
      type: 'time_off_rejected',
      title: 'Time Off Request Rejected',
      message: `Your time off request from ${format(new Date(request.startDate), "MMM d")} to ${format(new Date(request.endDate), "MMM d, yyyy")} has been rejected.${reasonNote}`,
      isRead: false,
      data: JSON.stringify({
        status: 'rejected',
        startDate: format(new Date(request.startDate), "MMM d, yyyy"),
        endDate: format(new Date(request.endDate), "MMM d, yyyy"),
        type: request.type,
        rejectionReason: rejectionReason || null,
      })
    } as any);
    realTimeManager.broadcastNotification(notification);
    realTimeManager.broadcastTimeOffRejected(request, req.user!.branchId);

    // Audit log for time-off rejection
    await createAuditLog({
      action: 'time_off_reject',
      entityType: 'time_off_request',
      entityId: id,
      userId: req.user!.id,
      newValues: { status: 'rejected', employeeId: request.userId, startDate: request.startDate, endDate: request.endDate, type: request.type, rejectionReason: rejectionReason || null },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json({ request });
  }));


  // Update time off request (employee can edit pending requests)
  app.put("/api/time-off-requests/:id", requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user!.id;

    // Fetch the request to verify ownership
    const existingRequest = await storage.getTimeOffRequest(id);
    if (!existingRequest) {
      return res.status(404).json({ message: "Time off request not found" });
    }

    // Only allow editing own requests or if manager
    if (existingRequest.userId !== userId && req.user!.role !== 'manager') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Don't allow editing approved/rejected requests
    if (existingRequest.status !== 'pending') {
      return res.status(400).json({ message: "Cannot edit approved or rejected requests" });
    }

    const updated = await storage.updateTimeOffRequest(id, {
      type,
      startDate,
      endDate,
      reason,
    });

    res.json({ request: updated });
  }));

  // Toggle paid status for approved time-off request (Manager)
  app.put("/api/time-off-requests/:id/toggle-paid", requireAuth, requireRole(["manager"]), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isPaid } = req.body;

    const existing = await storage.getTimeOffRequest(id);
    if (!existing) {
      return res.status(404).json({ message: "Time off request not found" });
    }

    if (existing.status !== 'approved') {
      return res.status(400).json({ message: "Can only toggle paid status on approved requests" });
    }

    const employee = await storage.getUser(existing.userId);
    if (!employee || employee.branchId !== req.user!.branchId) {
      return res.status(403).json({ message: "Not authorized for this branch" });
    }

    // Logic for deducting or restoring SIL credits based on the toggle direction
    const startD = new Date(existing.startDate);
    const endD = new Date(existing.endDate);
    const daysToAdjust = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    if (isPaid && !existing.isPaid) {
      // Toggle to PAID: Attempt to deduct credit
      try {
        const { db } = await import('./db');
        const { leaveCredits } = await import('@shared/schema');
        const { eq, and } = await import('drizzle-orm');
        const specificBalance = await db.select().from(leaveCredits).where(
          and(eq(leaveCredits.userId, existing.userId), eq(leaveCredits.year, startD.getFullYear()), eq(leaveCredits.leaveType, existing.type))
        ).limit(1);

        let deductedFrom: string | null = null;
        if (specificBalance[0] && parseFloat(specificBalance[0].remainingCredits) > 0) {
          deductedFrom = existing.type;
        } else {
          const silBalance = await db.select().from(leaveCredits).where(
            and(eq(leaveCredits.userId, existing.userId), eq(leaveCredits.year, startD.getFullYear()), eq(leaveCredits.leaveType, 'sil'))
          ).limit(1);
          if (silBalance[0] && parseFloat(silBalance[0].remainingCredits) > 0) {
            deductedFrom = 'sil';
          }
        }
        if (deductedFrom) {
          await deductLeaveCredit(existing.userId, employee.branchId, deductedFrom, daysToAdjust, startD.getFullYear());
        }
      } catch (e) {
        console.error('Adjustment deduction error:', e);
      }
    } else if (!isPaid && existing.isPaid) {
      // Toggle to UNPAID: Restore credit
      try {
        const { restoreLeaveCredit } = await import('./routes/leave-credits');
        await restoreLeaveCredit(existing.userId, existing.type, daysToAdjust, startD.getFullYear());
      } catch (e) {
        console.error('Adjustment restore error:', e);
      }
    }

    const updated = await storage.updateTimeOffRequest(id, { isPaid });
    res.json({ request: updated });
  }));

  // Delete time off request (employee can delete pending requests)
  app.delete("/api/time-off-requests/:id", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Fetch the request to verify ownership
      const existingRequest = await storage.getTimeOffRequest(id);
      if (!existingRequest) {
        return res.status(404).json({ message: "Time off request not found" });
      }

      // Only allow deleting own requests or if manager/admin
      if (existingRequest.userId !== userId && req.user!.role !== 'manager' && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Employees cannot delete approved/rejected requests. Managers can override.
      if (existingRequest.status !== 'pending' && req.user!.role !== 'manager' && req.user!.role !== 'admin') {
        return res.status(400).json({ message: "Only managers can delete approved or rejected requests" });
      }

      // If the request was approved and PAID, restore the leave credits
      if (existingRequest.status === 'approved' && existingRequest.isPaid) {
        try {
          const { restoreLeaveCredit } = await import('./routes/leave-credits');
          const startD = new Date(existingRequest.startDate);
          const endD = new Date(existingRequest.endDate);
          const daysToRestore = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);
          
          await restoreLeaveCredit(existingRequest.userId, existingRequest.type, daysToRestore, startD.getFullYear());
        } catch (restoreErr) {
          console.error("Failed to restore leave credits during time-off deletion:", restoreErr);
        }
      }

      await storage.deleteTimeOffRequest(id);
      res.json({ message: "Request deleted successfully" });
    } catch (error: any) {
      console.error('Delete time-off request error:', error);
      res.status(500).json({ message: error.message || "Failed to delete request" });
    }
  }));
  // Notification routes
  app.get("/api/notifications", requireAuth, asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      const activeBranchId = req.user!.branchId;
      const notifications = await storage.getUserNotifications(userId);

      // Filter to only show branch-specific notifications for the active branch (or global null branch notifications)
      const branchFiltered = notifications.filter((n: any) => !n.branchId || n.branchId === activeBranchId);

      // Employees should not see internal manager/admin exception logs.
      const filteredNotifications = req.user!.role === 'employee'
        ? branchFiltered.filter((notification: any) => notification.type !== 'adjustment')
        : branchFiltered;

      res.json({ notifications: filteredNotifications });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: error.message || "Failed to fetch notifications" });
    }
  }));

  app.patch("/api/notifications/:id/read", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const notification = await storage.markNotificationRead(id, userId);
      res.json(notification || { success: true });
    } catch (error: any) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }));

  app.patch("/api/notifications/read-all", requireAuth, asyncHandler(async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.markAllNotificationsRead(userId);
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error: any) {
      console.error('Mark all notifications read error:', error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  }));

  app.delete("/api/notifications/:id", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const deleted = await storage.deleteNotification(id, userId);

      if (!deleted) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification deleted successfully" });
    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({ message: error.message || "Failed to delete notification" });
    }
  }));

  // ═══════════════════════════════════════════════════════════════
  // ADMIN: Force Seed Sample Data with Complete Shifts and Payroll
  // ═══════════════════════════════════════════════════════════════
  app.post('/api/admin/seed-sample-data', requireAuth, requireRole(['admin', 'manager']), asyncHandler(async (req: Request, res: Response) => {
    try {
      const user = getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const branchId = user.branchId;
      
      // Get all employees in this branch
      const allEmployees = await storage.getEmployees(branchId);
      const employees = allEmployees.filter(e => e.role === 'employee');
      
      if (employees.length === 0) {
        return res.status(400).json({ message: "No employees found. Please add employees first." });
      }

      const now = new Date();
      let shiftsCreated = 0;
      let shiftsUpdated = 0;

      // Create completed shifts for the PAST 14 days with actual hours
      const shiftPatterns = [
        { start: 6, end: 14 },   // Morning 8 hours
        { start: 8, end: 17 },   // Day 9 hours (with 1hr lunch)
        { start: 14, end: 22 },  // Afternoon 8 hours
      ];

      for (const emp of employees) {
        for (let day = -14; day <= 7; day++) {
          const shiftDate = new Date(now);
          shiftDate.setDate(shiftDate.getDate() + day);
          
          // Skip Sundays
          if (shiftDate.getDay() === 0) continue;
          
          // Employees work about 5 days a week (skip ~30% of days)
          if (Math.random() > 0.7) continue;

          const pattern = shiftPatterns[Math.floor(Math.random() * shiftPatterns.length)];
          
          const startTime = new Date(shiftDate);
          startTime.setHours(pattern.start, 0, 0, 0);
          
          const endTime = new Date(shiftDate);
          endTime.setHours(pattern.end, 0, 0, 0);

          // Past shifts are completed with actual times
          const isPast = day < 0;
          const isToday = day === 0;
          const status = isPast ? 'completed' : (isToday ? 'scheduled' : 'scheduled');

          try {
            const shift = await storage.createShift({
              userId: emp.id,
              branchId: branchId,
              startTime: startTime,
              endTime: endTime,
              position: emp.position,
              status: status,
            });

            // For past shifts, set actual start/end times
            if (isPast && shift) {
              // Add slight variation to actual times (±15 mins)
              const actualStart = new Date(startTime);
              actualStart.setMinutes(actualStart.getMinutes() + Math.floor(Math.random() * 15) - 5);
              
              const actualEnd = new Date(endTime);
              actualEnd.setMinutes(actualEnd.getMinutes() + Math.floor(Math.random() * 30)); // Sometimes OT
              
              await storage.updateShift(shift.id, {
                status: 'completed',
                actualStartTime: actualStart,
                actualEndTime: actualEnd,
              });
              shiftsUpdated++;
            }
            shiftsCreated++;
          } catch (err) {
            // Ignore duplicate shift errors
          }
        }
      }

      // Now process payroll for the current semi-monthly period
      // Determine current period: 1st-15th or 16th-end of month
      const currentDay = now.getDate();
      let periodStart: Date;
      let periodEnd: Date;
      if (currentDay <= 15) {
        periodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        periodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 15));
      } else {
        periodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 16));
        // Last day of month
        periodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
      }
      
      let payrollPeriod = null;
      const existingPeriods = await storage.getPayrollPeriods(branchId);
      payrollPeriod = existingPeriods.find(p => {
        const pStart = new Date(p.startDate);
        const pEnd = new Date(p.endDate);
        return pStart.getTime() === periodStart.getTime() && pEnd.getTime() === periodEnd.getTime();
      });

      if (!payrollPeriod) {
        payrollPeriod = await storage.createPayrollPeriod({
          branchId: branchId,
          startDate: periodStart,
          endDate: periodEnd,
          status: 'open',
          totalHours: '0',
          totalPay: '0',
        });
      }

      // Calculate and create payroll entries for each employee
      let entriesCreated = 0;
      let totalPayrollAmount = 0;

      for (const emp of employees) {
        // Get completed shifts for this employee in the period
        const empShifts = await storage.getShiftsByUser(emp.id);
        const completedShifts = empShifts.filter(s => {
          const shiftDate = new Date(s.startTime);
          return s.status === 'completed' && 
                 shiftDate >= periodStart && 
                 shiftDate <= periodEnd;
        });

        // Calculate hours from completed shifts
        let totalMinutes = 0;
        for (const shift of completedShifts) {
          const start = shift.actualStartTime || shift.startTime;
          const end = shift.actualEndTime || shift.endTime;
          const minutes = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60);
          totalMinutes += minutes;
        }

        // If no completed shifts, create some simulated hours
        if (totalMinutes === 0) {
          // Simulate 8-10 days of work, 8 hours each
          const daysWorked = 8 + Math.floor(Math.random() * 3);
          totalMinutes = daysWorked * DAILY_REGULAR_HOURS * MINS_PER_HOUR;
        }

        const totalHours = totalMinutes / MINS_PER_HOUR;
        const regularHours = Math.min(totalHours, 88); // 88 hours = 11 days × 8 hours
        const overtimeHours = Math.max(0, totalHours - 88);

        const hourlyRate = parseFloat(emp.hourlyRate);
        if (isNaN(hourlyRate) || hourlyRate <= 0) {
          console.error(`[PAYROLL] Invalid hourly rate for ${emp.firstName}: ${emp.hourlyRate}`);
          continue;
        }
        const basicPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * HOLIDAY_RATES.normal.overtime;
        const grossPay = basicPay + overtimePay;

        // Use proper 2026 deduction calculator (SSS, PhilHealth, Pag-IBIG, withholding tax)
        const { calculateAllDeductions, calculateWithholdingTax } = await import('./utils/deductions');
        const monthlyBasicSalary = (grossPay / Math.max(regularHours / 8, 1)) * 30; // project to monthly
        const mandatoryBreakdown = await calculateAllDeductions(monthlyBasicSalary, {
          deductSSS: true,
          deductPhilHealth: true,
          deductPagibig: true,
          deductWithholdingTax: false, // Tax computed separately on taxable income
        });

        // Semi-monthly: deduct half of monthly contributions
        const periodFraction = 0.5;
        const sssContribution = mandatoryBreakdown.sssContribution * periodFraction;
        const philhealthContribution = mandatoryBreakdown.philHealthContribution * periodFraction;
        const pagibigContribution = mandatoryBreakdown.pagibigContribution * periodFraction;

        // BIR tax on taxable income (gross minus mandatory deductions)
        const monthlyMandatory = mandatoryBreakdown.sssContribution +
          mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
        const monthlyTaxableIncome = Math.max(0, monthlyBasicSalary - monthlyMandatory);
        const monthlyTax = await calculateWithholdingTax(monthlyTaxableIncome);
        const withholdingTax = monthlyTax * periodFraction;
        const totalDeductions = sssContribution + philhealthContribution + pagibigContribution + withholdingTax;
        const netPay = grossPay - totalDeductions;

        totalPayrollAmount += netPay;

        try {
          // Check if entry already exists for this employee and period
          const existingEntries = await storage.getPayrollEntriesByPeriod(payrollPeriod.id);
          const hasEntry = existingEntries.some(e => e.userId === emp.id);
          
          if (!hasEntry) {
            await storage.createPayrollEntry({
              userId: emp.id,
              payrollPeriodId: payrollPeriod.id,
              totalHours: totalHours.toFixed(2),
              regularHours: regularHours.toFixed(2),
              overtimeHours: overtimeHours.toFixed(2),
              nightDiffHours: '0',
              basicPay: basicPay.toFixed(2),
              overtimePay: overtimePay.toFixed(2),
              nightDiffPay: '0',
              holidayPay: '0',
              restDayPay: '0',
              grossPay: grossPay.toFixed(2),
              sssContribution: sssContribution.toFixed(2),
              philHealthContribution: philhealthContribution.toFixed(2),
              pagibigContribution: pagibigContribution.toFixed(2),
              withholdingTax: withholdingTax.toFixed(2),
              totalDeductions: totalDeductions.toFixed(2),
              deductions: totalDeductions.toFixed(2),
              netPay: netPay.toFixed(2),
              status: 'pending',
            });
            entriesCreated++;
          }
        } catch (err: any) {
          console.error(`[PAYROLL] Error creating entry for ${emp.firstName}:`, err.message);
        }
      }

      // Update payroll period totals
      const allEntries = await storage.getPayrollEntriesByPeriod(payrollPeriod.id);
      const totalHoursAll = allEntries.reduce((sum, e) => sum + parseFloat(e.totalHours || '0'), 0);
      const totalPayAll = allEntries.reduce((sum, e) => sum + parseFloat(e.netPay || '0'), 0);

      await storage.updatePayrollPeriod(payrollPeriod.id, {
        totalHours: totalHoursAll.toFixed(2),
        totalPay: totalPayAll.toFixed(2),
      });

      res.json({
        success: true,
        message: 'Sample shifts and payroll data created successfully!',
        data: {
          employeesProcessed: employees.length,
          shiftsCreated: shiftsCreated,
          shiftsWithHours: shiftsUpdated,
          payrollEntriesCreated: entriesCreated,
          totalPayrollAmount: totalPayAll.toFixed(2),
        },
        instructions: 'Refresh the page to see the updated data. Go to Payroll > View to see employee entries.',
      });
    } catch (error: any) {
      console.error('Seed sample data error:', error);
      res.status(500).json({
        message: error.message || "Failed to seed sample data"
      });
    }
  }));

  // Create and start the server
  // const httpServer = createServer(app); // Moved to top

  // Update own profile (Self-service)
  app.put("/api/auth/profile", requireAuth, asyncHandler(async (req, res) => {
    try {
      const { email, password, newPassword, firstName, lastName, tin, sssNumber, philhealthNumber, pagibigNumber } = req.body;
      const userId = req.user!.id;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateData: any = {};

      // Normalize: treat null/undefined/empty-string as equivalent
      const norm = (v: any) => v || null; // "" → null, null → null, "John" → "John"

      // Update fields if provided and actually different
      if (firstName !== undefined && norm(firstName) !== norm(user.firstName)) {
        updateData.firstName = firstName;
      }
      
      if (lastName !== undefined && norm(lastName) !== norm(user.lastName)) {
        updateData.lastName = lastName;
      }

      if (email !== undefined && norm(email) !== norm(user.email)) {
        updateData.email = email;
      }

      // Government IDs: always write if key appears in the body (even empty clears the field)
      if (tin !== undefined) {
        updateData.tin = tin || null;
      }
      if (sssNumber !== undefined) {
        updateData.sssNumber = sssNumber || null;
      }
      if (philhealthNumber !== undefined) {
        updateData.philhealthNumber = philhealthNumber || null;
      }
      if (pagibigNumber !== undefined) {
        updateData.pagibigNumber = pagibigNumber || null;
      }

      // Update password if provided
      if (newPassword) {
        // If changing password, verify old password for security
        if (!password) {
          return res.status(400).json({ message: "Current password is required to set a new password" });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(403).json({ message: "Invalid current password" });
        }

        updateData.password = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        // No actual changes — return success (idempotent)
        const { password: _p, ...userWithoutPassword } = user;
        return res.json({ message: "No changes needed", user: userWithoutPassword });
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser!;
      
      res.json({ 
        message: "Profile updated successfully", 
        user: userWithoutPassword 
      });

      // Audit log could go here
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        message: error.message || "Failed to update profile" 
      });
    }
  }));

  // Mount employee uploads router - PROTECTED
  // MOVED UP to avoid conflict with /api/employees/:id
  
  // Debug endpoint to force seeding
  app.post("/api/debug/seed", requireAuth, asyncHandler(async (req, res) => {
    try {
      // Manual role check with debug output
      if (!['admin', 'manager'].includes(req.user!.role)) {
        return res.status(403).json({ 
          message: "Insufficient permissions", 
          yourRole: req.user!.role,
          userId: req.user!.id
        });
      }

      await seedSampleUsers();
      await seedSampleSchedulesAndPayroll();
      
      const userCount = await storage.getUsersByBranch(req.user!.branchId);
      
      res.json({ 
        message: "Seeding completed successfully", 
        usersFound: userCount.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Manual seeding error:', error);
      res.status(500).json({ message: "Seeding failed", error: String(error) });
    }
  }));

  // Full database reset + reseed (admin only)
  app.post("/api/debug/reset-and-reseed", requireAuth, requireRole(["admin"]), asyncHandler(async (req, res) => {
    try {

      // 1. Drop all tables
      await resetDatabase();

      // 2. Recreate tables
      await initializeDatabase();

      // 3. Create admin account
      await createAdminAccount();

      // 4. Seed deduction rates FIRST (payroll entries need these for calculations)
      await seedDeductionRates();

      // 5. Seed users
      await seedSampleUsers();

      // 6. Seed schedules + payroll (uses deduction rates)
      await seedSampleSchedulesAndPayroll();

      // 7. Seed holidays
      await seedPhilippineHolidays();

      // 8. Seed shift trades
      await seedSampleShiftTrades();

      // 9. Mark setup complete
      await markSetupComplete();

      res.json({
        message: "Database fully reset and reseeded!",
        timestamp: new Date().toISOString(),
        note: "You need to log in again (session was invalidated by reset)."
      });
    } catch (error) {
      console.error('❌ Reset and reseed error:', error);
      res.status(500).json({ message: "Reset failed", error: String(error) });
    }
  }));

  return httpServer;
}
