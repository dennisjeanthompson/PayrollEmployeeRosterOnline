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
import { blockchainService } from "./services/blockchain";
import { registerBranchesRoutes } from "./routes/branches";
import { createEmployeeRouter } from "./routes/employees";
import { router as hoursRoutes } from "./routes/hours";
import payslipsRouter from "./routes/payslips";
import { auditRouter } from "./routes/audit";
import { reportsRouter } from "./routes/reports";
import { forecastRouter } from "./routes/forecast";
import { seedRatesRouter } from "./routes/seed-rates";
import holidaysRouter from "./routes/holidays";
import employeeUploadsRouter from "./routes/employee-uploads";
import { resetDatabase, initializeDatabase, createAdminAccount, seedDeductionRates, seedPhilippineHolidays, seedSampleUsers, seedSampleSchedulesAndPayroll, seedSampleShiftTrades, markSetupComplete } from "./init-db";
import bcrypt from "bcrypt";
import { format } from "date-fns";
import crypto from "crypto";
import { validateShiftTimes, calculatePeriodPay, calculateShiftPay, buildPayrollEntryBreakdownPayload } from "./payroll-utils";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import RealTimeManager from "./services/realtime-manager";

// Configure Neon WebSocket for serverless connection pooling
neonConfig.webSocketConstructor = ws;

// Use database storage instead of in-memory storage
const storage = dbStorage;

// Create PostgreSQL pool for session store with proper Neon configuration
const pgPool = new Pool({ 
  connectionString: process.env.DATABASE_URL
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

  // Enable CORS

  // CORS is configured in index.ts


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
      pruneSessionInterval: 60 * 60, // Prune expired sessions hourly
    }),
    secret: process.env.SESSION_SECRET || 'cafe-default-secret-key-2024',
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
      sameSite: 'lax', // CSRF protection
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
  app.get("/api/setup/status", async (req: Request, res: Response) => {
    try {
      const isComplete = await storage.isSetupComplete();
      res.json({ 
        isSetupComplete: isComplete,
      });
    } catch (error) {
      console.error('Setup status check error:', error);
      res.status(500).json({ message: 'Failed to check setup status' });
    }
  });

  // Setup endpoint (no auth required, only works if setup not complete)
  app.post("/api/setup", async (req: Request, res: Response) => {
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

      // Create manager user with blockchain verification
      const managerData = `${manager.username}-${manager.firstName}-${manager.lastName}-${manager.email}`;
      const blockchainHash = crypto.createHash('sha256').update(managerData).digest('hex');

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
        blockchainVerified: true,
        blockchainHash: blockchainHash,
        verifiedAt: new Date(),
      });

      // Mark setup as complete
      await storage.markSetupComplete();

      console.log('✅ Setup completed successfully');
      console.log(`   Branch: ${createdBranch.name}`);
      console.log(`   Manager: ${createdManager.firstName} ${createdManager.lastName} (${createdManager.username})`);

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
  });

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

  // Debug endpoint to check user password hash (REMOVE IN PRODUCTION)
  app.get("/api/debug/user/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        username: user.username,
        passwordHashPrefix: user.password.substring(0, 20),
        passwordHashLength: user.password.length,
        isBcryptHash: user.password.startsWith('$2b$') || user.password.startsWith('$2a$'),
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({ message: 'Error' });
    }
  });

  // Debug endpoint to test password comparison (REMOVE IN PRODUCTION)
  app.post("/api/debug/test-password", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isValid = await bcrypt.compare(password, user.password);

      res.json({
        username: user.username,
        passwordProvided: password,
        passwordProvidedLength: password.length,
        storedHashPrefix: user.password.substring(0, 20),
        storedHashLength: user.password.length,
        isBcryptHash: user.password.startsWith('$2b$') || user.password.startsWith('$2a$'),
        isPasswordValid: isValid,
      });
    } catch (error) {
      console.error('Debug error:', error);
      res.status(500).json({ message: 'Error' });
    }
  });

  // Admin endpoint to fix all unhashed passwords (IMPORTANT: run once after identifying issues)
  app.post("/api/admin/fix-passwords", requireAuth, requireRole(["admin"]), async (req: Request, res: Response) => {
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
      
      console.log(`✅ Password fix complete: ${fixed} fixed, ${skipped} already hashed`);
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
  });

  // Admin endpoint to reset a specific user's password
  app.post("/api/admin/reset-password", requireAuth, requireRole(["admin", "manager"]), async (req: Request, res: Response) => {
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
      
      console.log(`✅ Password reset for user ${user.username} by ${currentUser.username}`);
      res.json({ message: `Password reset successfully for ${user.username}` });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });

  // In-memory store for client-side debug reports (kept only in memory for local debugging)
  const clientDebugReports: Array<any> = [];

  // Endpoint to receive client-side debug reports (POSTed by injected script)
  app.post("/api/client-debug", async (req: Request, res: Response) => {
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

      console.log('📣 Client debug report received:', entry.url, payload.type || payload.message || '(no type)');

      // Accept via beacon/fetch without blocking client
      res.status(204).end();
    } catch (error) {
      console.error('Error receiving client debug report:', error);
      res.status(500).json({ message: 'Failed to record client debug report' });
    }
  });

  // Simple viewer for collected client debug reports (for local debugging only)
  app.get("/api/client-debug", async (req: Request, res: Response) => {
    try {
      // Render a lightweight HTML page showing recent reports
      const rows = clientDebugReports.slice(0, 100).map((r, idx) => {
        const p = JSON.stringify(r.payload, null, 2).replace(/</g, '&lt;');
        return `<section style="border-bottom:1px solid #eee;padding:12px 0"><h3>#${idx+1} - ${r.receivedAt} - ${r.url}</h3><pre style="white-space:pre-wrap;background:#111;color:#fff;padding:8px;border-radius:6px;overflow:auto;max-height:240px">${p}</pre></section>`;
      }).join('\n');

      const page = `<!doctype html><html><head><meta charset="utf-8"><title>Client Debug Reports</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:Arial,Helvetica,sans-serif;margin:20px"><h1>Client Debug Reports (recent)</h1>${rows||'<p>No reports yet</p>'}</body></html>`;
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(page);
    } catch (error) {
      console.error('Error rendering client debug reports:', error);
      res.status(500).json({ message: 'Failed to render debug reports' });
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
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
      const isBcryptHash = user.password.startsWith('$2b$') || user.password.startsWith('$2a$');
      
      let isPasswordValid = false;
      
      if (!isBcryptHash) {
        // Password is stored as plain text - compare directly and then hash it
        console.log(`⚠️ [LOGIN] User ${username} has unhashed password - fixing...`);
        
        if (user.password === password) {
          // Password matches, now hash it for future logins
          const hashedPassword = await bcrypt.hash(password, 10);
          await storage.updateUser(user.id, { password }); // db-storage will hash it
          console.log(`✅ [LOGIN] Fixed password hash for user ${username}`);
          isPasswordValid = true;
        }
      } else {
        // Normal bcrypt comparison
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
      
      if (!isPasswordValid) {
        console.log(`❌ [LOGIN] Invalid password for user ${username}`);
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
            console.log('✅ Session saved for user:', username);
            
            // Ensure Set-Cookie header is explicitly sent for clients that may
            // not automatically receive the cookie from the session middleware
            // (this is a safe redundancy).
            try {
              // sessionConfig is defined above in this scope; use its cookie options
              // to mirror express-session behavior when setting the cookie explicitly.
              const cookieName = sessionConfig && sessionConfig.name ? sessionConfig.name : 'cafe-session';
              res.cookie(cookieName, req.sessionID, sessionConfig.cookie || {});
            } catch (e) {
              console.warn('Could not explicitly set session cookie:', e);
            }

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
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to log out' });
      }
      
      // Clear the session cookie - use the same name as configured in sessionConfig
      res.clearCookie('cafe-session', { path: '/' });
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check session status (no auth required - used on page load)
  // This endpoint checks if a session exists and returns the user data
  app.get("/api/auth/status", async (req: Request, res: Response) => {
    try {
      if (req.session?.user) {
        console.log(`✅ [AUTH STATUS] Session found for user: ${req.session.user.username}`);
        res.json({ 
          authenticated: true, 
          user: req.session.user 
        });
      } else {
        console.log(`⚠️  [AUTH STATUS] No session found`);
        res.json({ 
          authenticated: false, 
          user: null 
        });
      }
    } catch (error) {
      console.error('❌ [AUTH STATUS] Error:', error);
      res.json({ 
        authenticated: false, 
        user: null 
      });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
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
  });

  // Switch branch (admin/manager only) — updates session branchId so all
  // existing GET endpoints automatically serve data for the new branch.
  app.put("/api/auth/switch-branch", requireAuth, requireRole(["manager", "admin"]), async (req: Request, res: Response) => {
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
            console.log(`✅ Branch switched to ${branch.name} (${branchId}) for user ${req.user!.username}`);
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
  });

  // Shifts routes
  app.get("/api/shifts", requireAuth, async (req, res) => {
    const { startDate, endDate, userId: queryUserId } = req.query;
    const currentUser = req.user!;

    // If querying for another user, require manager role
    const targetUserId = queryUserId as string || currentUser.id;
    if (targetUserId !== currentUser.id && currentUser.role !== "manager") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    console.log('Fetching shifts for user:', targetUserId, 'startDate:', startDate, 'endDate:', endDate);

    const shifts = await storage.getShiftsByUser(
      targetUserId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    console.log('Found shifts:', shifts.length);

    // Enrich shifts with date property extracted from startTime
    const enrichedShifts = shifts.map((shift: any) => ({
      ...shift,
      date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
    }));

    // Log what we're sending back for debugging
    console.log('Returning shifts with data:', enrichedShifts.slice(0, 2).map(s => ({ startTime: s.startTime, date: s.date })));
    
    res.json({ shifts: enrichedShifts });
  });

  app.get("/api/shifts/branch", requireAuth, requireRole(["manager", "employee", "admin"]), async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const branchId = req.user!.branchId;
      
      console.log('📡 [GET /api/shifts/branch] Request from manager:', req.user!.username);
      console.log('📍 Branch ID:', branchId);
      console.log('📅 Date range:', startDate, 'to', endDate);

      // PERFORMANCE FIX: Batch load all users and shifts in parallel instead of N+1 queries
      const [shifts, allUsers] = await Promise.all([
        storage.getShiftsByBranch(
          branchId,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        ),
        storage.getUsersByBranch(branchId)
      ]);
      
      console.log('📊 [GET /api/shifts/branch] Found shifts:', shifts.length, ', users:', allUsers.length);

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
        console.log(`🔒 [GET /api/shifts/branch] Filtered shifts for employee ${req.user!.username} (showing ${activeShifts.length} own shifts)`);
      }
      
      console.log('✅ [GET /api/shifts/branch] Returning shifts:', activeShifts.length);
      if (activeShifts.length > 0) {
        console.log('   Sample:', activeShifts[0].user?.firstName, activeShifts[0].user?.lastName);
      }

      res.json({ shifts: activeShifts });
    } catch (error) {
      console.error('❌ [GET /api/shifts/branch] Error:', error);
      res.status(500).json({ message: 'Failed to fetch shifts' });
    }
  });

  app.post("/api/shifts", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      console.log('Creating shift with data:', req.body);
      const shiftData = insertShiftSchema.parse(req.body);

      // Validate shift times - end time must be after start time
      const timeError = validateShiftTimes(shiftData.startTime, shiftData.endTime);
      if (timeError) {
        return res.status(400).json({ message: timeError });
      }

      // Check for overlapping shifts with the same employee
      const overlappingShift = await storage.checkShiftOverlap(
        shiftData.userId,
        new Date(shiftData.startTime),
        new Date(shiftData.endTime)
      );

      if (overlappingShift) {
        const existingStart = new Date(overlappingShift.startTime);
        const existingEnd = new Date(overlappingShift.endTime);
        return res.status(409).json({
          message: `Employee already has a shift scheduled from ${existingStart.toLocaleString()} to ${existingEnd.toLocaleString()}. Please choose a different time or remove the conflicting shift.`,
          code: 'SHIFT_CONFLICT',
          conflictingShift: overlappingShift
        });
      }

      const shift = await storage.createShift(shiftData);
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
  });

  app.put("/api/shifts/:id", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { id } = req.params;
      console.log('🔧 [PUT /api/shifts/:id] Request for shift:', id);
      console.log('🔧 [PUT /api/shifts/:id] Body:', req.body);
      
      const updateData = insertShiftSchema.partial().parse(req.body);
      console.log('✅ [PUT /api/shifts/:id] Parsed data:', updateData);

      // Get the existing shift first to validate changes
      const existingShift = await storage.getShift(id);
      if (!existingShift) {
        console.log('❌ [PUT /api/shifts/:id] Shift not found:', id);
        return res.status(404).json({ message: "Shift not found" });
      }
      console.log('📍 [PUT /api/shifts/:id] Found existing shift:', existingShift);

      // Determine the new shift times (use existing if not provided)
      const newStartTime = updateData.startTime ? new Date(updateData.startTime) : new Date(existingShift.startTime);
      const newEndTime = updateData.endTime ? new Date(updateData.endTime) : new Date(existingShift.endTime);
      const newUserId = updateData.userId || existingShift.userId;

      // If both times are provided, validate them
      if (updateData.startTime && updateData.endTime) {
        const timeError = validateShiftTimes(updateData.startTime, updateData.endTime);
        if (timeError) {
          console.log('❌ [PUT /api/shifts/:id] Time validation error:', timeError);
          return res.status(400).json({ message: timeError });
        }
      }

      // Check for overlapping shifts (excluding current shift)
      if (updateData.startTime || updateData.endTime || updateData.userId) {
        const overlappingShift = await storage.checkShiftOverlap(newUserId, newStartTime, newEndTime, id);
        
        if (overlappingShift) {
          console.log('❌ [PUT /api/shifts/:id] Overlap detected:', overlappingShift);
          const existingStart = new Date(overlappingShift.startTime);
          const existingEnd = new Date(overlappingShift.endTime);
          return res.status(409).json({
            message: `Employee already has a shift scheduled from ${existingStart.toLocaleString()} to ${existingEnd.toLocaleString()}. Please choose a different time.`,
            code: 'SHIFT_CONFLICT',
            conflictingShift: overlappingShift
          });
        }
      }

      const shift = await storage.updateShift(id, updateData);
      console.log('✅ [PUT /api/shifts/:id] Updated shift:', shift);

      if (!shift) {
        console.log('❌ [PUT /api/shifts/:id] Update returned null');
        return res.status(404).json({ message: "Shift not found" });
      }

      res.json({ shift });
    } catch (error) {
      console.error('❌ [PUT /api/shifts/:id] Error:', error);
      res.status(400).json({ message: "Invalid shift data" });
    }
  });

  // DELETE shift
  app.delete("/api/shifts/:id", requireAuth, requireRole(["manager"]), async (req, res) => {
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

      // TODO: Broadcast shift deletion to connected clients when websocket is available
      // realtimeManager.broadcastShiftDeleted(id);

      res.json({ message: "Shift deleted successfully", shiftId: id });
    } catch (error) {
      console.error('Delete shift error:', error);
      res.status(500).json({ message: "Failed to delete shift" });
    }
  });

  // Manager clock in for employee
  app.post("/api/shifts/:id/clock-in", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage.getShift(id);

      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Update shift with actual start time
      const updatedShift = await storage.updateShift(id, {
        actualStartTime: new Date(),
        status: 'in-progress'
      });

      // Get employee details
      const employee = await storage.getUser(shift.userId);

      // Create notification for employee
      const notification = await storage.createNotification({
        userId: shift.userId,
        type: 'clock_in',
        title: 'Clocked In',
        message: `You have been clocked in for your shift at ${format(new Date(), "h:mm a")}`,
        data: JSON.stringify({
          shiftId: id,
          action: 'clock-in',
          time: format(new Date(), "h:mm a"),
          date: format(new Date(), "MMM d, yyyy")
        })
      } as any);
      realTimeManager.broadcastNotification(notification);

      res.json({
        message: "Employee clocked in successfully",
        shift: updatedShift
      });
    } catch (error: any) {
      console.error('Clock in error:', error);
      res.status(500).json({
        message: error.message || "Failed to clock in employee"
      });
    }
  });

  // Manager clock out for employee
  app.post("/api/shifts/:id/clock-out", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage.getShift(id);

      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Update shift with actual end time and mark as completed
      const updatedShift = await storage.updateShift(id, {
        actualEndTime: new Date(),
        status: 'completed'
      });

      // Create notification for employee
      const notification = await storage.createNotification({
        userId: shift.userId,
        type: 'clock_out',
        title: 'Clocked Out',
        message: `You have been clocked out from your shift at ${format(new Date(), "h:mm a")}`,
        data: JSON.stringify({
          shiftId: id,
          action: 'clock-out',
          time: format(new Date(), "h:mm a"),
          date: format(new Date(), "MMM d, yyyy")
        })
      } as any);
      realTimeManager.broadcastNotification(notification);

      res.json({
        message: "Employee clocked out successfully",
        shift: updatedShift
      });
    } catch (error: any) {
      console.error('Clock out error:', error);
      res.status(500).json({
        message: error.message || "Failed to clock out employee"
      });
    }
  });
  // Employee statistics route - accepts optional startDate and endDate for month selection
  app.get("/api/employees/stats", requireAuth, requireRole(["manager"]), async (req, res) => {
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

    // Calculate total payroll this month from payroll entries
    let totalPayrollThisMonth = 0;
    for (const user of users) {
      const entries = await storage.getPayrollEntriesByUser(user.id);
      for (const entry of entries) {
        if (!entry.createdAt) continue;
        const entryDate = new Date(entry.createdAt);
        if (entryDate >= monthStart && entryDate <= monthEnd) {
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
  });


  // Employee performance data
  app.get("/api/employees/performance", requireAuth, requireRole(["manager"]), async (req, res) => {
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
  });

  // Bulk activate employees
  app.post("/api/employees/bulk-activate", requireAuth, requireRole(["manager"]), async (req, res) => {
    const { employeeIds } = req.body;

    if (!Array.isArray(employeeIds)) {
      return res.status(400).json({ message: "employeeIds must be an array" });
    }

    const updatedEmployees = [];
    for (const id of employeeIds) {
      const employee = await storage.updateUser(id, { isActive: true });
      if (employee) {
        updatedEmployees.push(employee);
      }
    }

    res.json({
      message: `${updatedEmployees.length} employees activated successfully`,
      updatedCount: updatedEmployees.length
    });
  });

  // Bulk deactivate employees
  app.post("/api/employees/bulk-deactivate", requireAuth, requireRole(["manager"]), async (req, res) => {
    const { employeeIds } = req.body;

    if (!Array.isArray(employeeIds)) {
      return res.status(400).json({ message: "employeeIds must be an array" });
    }

    const updatedEmployees = [];
    for (const id of employeeIds) {
      const employee = await storage.updateUser(id, { isActive: false });
      if (employee) {
        updatedEmployees.push(employee);
      }
    }

    res.json({
      message: `${updatedEmployees.length} employees deactivated successfully`,
      updatedCount: updatedEmployees.length
    });
  });

  // Register employee uploads routes (BEFORE createEmployeeRouter to avoid /:id conflict)
  app.use("/api/employees", requireAuth, employeeUploadsRouter);

  // Register employee routes (after specific /api/employees/* routes to avoid conflicts)
  app.use(createEmployeeRouter(realTimeManager));

  // Register hours tracking routes
  app.use(hoursRoutes);

  // Register payslips routes for PDF generation and verification
  app.use('/api/payslips', payslipsRouter);

  // Register audit and reports routes
  app.use(auditRouter);
  app.use(reportsRouter);
  app.use(forecastRouter);
  app.use(seedRatesRouter);

  // ===== ADJUSTMENT LOGS (Manual OT/Lateness/Exception Logging) =====
  
  // Create adjustment log (Manager only)
  app.post("/api/adjustment-logs", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { employeeId, date, type, value, remarks } = req.body;
      const branchId = req.user!.branchId;
      const loggedBy = req.user!.id;

      if (!employeeId || !date || !type || !value) {
        return res.status(400).json({ message: "Employee, date, type, and value are required" });
      }

      // Validate type
      const validTypes = ['overtime', 'late', 'undertime', 'absent', 'rest_day_ot', 'special_holiday_ot', 'regular_holiday_ot', 'night_diff'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: `Invalid type. Valid types: ${validTypes.join(', ')}` });
      }

      const log = await storage.createAdjustmentLog({
        employeeId,
        branchId,
        loggedBy,
        date: new Date(date),
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
  });

  // Get adjustment logs by branch (Manager)
  app.get("/api/adjustment-logs/branch", requireAuth, requireRole(["manager"]), async (req, res) => {
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
  });

  // Get adjustment logs for the current employee (Employee view)
  app.get("/api/adjustment-logs/mine", requireAuth, async (req, res) => {
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
  });

  // Employee verify adjustment log
  app.put("/api/adjustment-logs/:id/verify", requireAuth, async (req, res) => {
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
      
      res.json({ log: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to verify adjustment log" });
    }
  });

  // Approve adjustment log (Manager)
  app.put("/api/adjustment-logs/:id/approve", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { id } = req.params;
      const approvedBy = req.user!.id;
      
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
  });

  // Reject adjustment log (Manager)
  app.put("/api/adjustment-logs/:id/reject", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      const updated = await storage.updateAdjustmentLog(id, {
        status: 'rejected',
      });
      
      if (!updated) return res.status(404).json({ message: "Adjustment log not found" });
      res.json({ log: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to reject adjustment log" });
    }
  });

  // Delete adjustment log (Manager)
  app.delete("/api/adjustment-logs/:id", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAdjustmentLog(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete adjustment log" });
    }
  });

  // Payroll routes
  app.get("/api/payroll", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    console.log(`[Payroll] Fetching entries for user ${userId}`);
    const entries = await storage.getPayrollEntriesByUser(userId);
    console.log(`[Payroll] Found ${entries.length} entries:`, entries.map(e => ({ id: e.id, userId: e.userId })));

    // Enrich entries with pay-period dates so the UI can display them
    const enriched = await Promise.all(
      entries.map(async (entry) => {
        try {
          const period = await storage.getPayrollPeriod(entry.payrollPeriodId);
          return {
            ...entry,
            periodStartDate: period?.startDate ?? null,
            periodEndDate: period?.endDate ?? null,
          };
        } catch {
          return { ...entry, periodStartDate: null, periodEndDate: null };
        }
      }),
    );

    res.json({ entries: enriched });
  });

  // Get all payroll periods (Manager only)
  app.get("/api/payroll/periods", requireAuth, requireRole(["manager"]), async (req, res) => {
    const branchId = req.user!.branchId;
    const periods = await storage.getPayrollPeriodsByBranch(branchId);
    res.json({ periods });
  });

  // Get current payroll period
  app.get("/api/payroll/periods/current", requireAuth, async (req, res) => {
    const branchId = req.user!.branchId;
    const period = await storage.getCurrentPayrollPeriod(branchId);
    res.json({ period });
  });

  // Create payroll period (Manager only)
  app.post("/api/payroll/periods", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const branchId = req.user!.branchId;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const period = await storage.createPayrollPeriod({
        branchId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
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
  });

  // Process payroll for a period (Manager only)
  app.post("/api/payroll/periods/:id/process", requireAuth, requireRole(["manager"]), async (req, res) => {
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

      for (const employee of employees) {
        if (!employee.isActive) continue;

        // Get shifts for this employee in the period
        const shifts = await storage.getShiftsByUser(
          employee.id,
          new Date(period.startDate),
          new Date(period.endDate)
        );

        if (shifts.length === 0) continue;

        // Calculate pay using DOLE-compliant calculations
        // - Daily 8-hour overtime rule
        // - Holiday pay rates (Regular 200%, Special 130%)
        // - Night differential (+10% for 10PM-6AM)
        // - Rest day premiums
        const hourlyRate = parseFloat(employee.hourlyRate);
        const payCalculation = calculatePeriodPay(shifts, hourlyRate, periodHolidays, 0); // 0 = Sunday as rest day

        // Calculate total hours from breakdown
        let employeeTotalHours = 0;
        let regularHours = 0;
        let overtimeHours = 0;
        let nightDiffHours = 0;

        for (const day of payCalculation.breakdown) {
          regularHours += day.regularHours;
          overtimeHours += day.overtimeHours;
          nightDiffHours += day.nightDiffHours;
          employeeTotalHours += day.regularHours + day.overtimeHours;
        }

        const basicPay = payCalculation.basicPay;
        const overtimePay = payCalculation.overtimePay;
        const holidayPay = payCalculation.holidayPay;
        const nightDiffPay = payCalculation.nightDiffPay;
        const restDayPay = payCalculation.restDayPay;
        let grossPay = payCalculation.totalGrossPay;

        // ===== MANUAL ADJUSTMENT LOGS (OT/Lateness from Manager input) =====
        // Process approved adjustment logs for this employee in this period
        const employeeAdjustments = await storage.getAdjustmentLogsByEmployee(
          employee.id,
          new Date(period.startDate),
          new Date(period.endDate)
        );

        let manualOtPay = 0;
        let manualOtHours = 0;
        let lateDeduction = 0;
        let totalLateMinutes = 0;
        let undertimeDeduction = 0;

        for (const adj of employeeAdjustments) {
          // Only process approved or employee-verified adjustments
          if (adj.status !== 'approved' && adj.status !== 'employee_verified') continue;

          const adjValue = parseFloat(adj.value);
          if (isNaN(adjValue) || adjValue <= 0) continue;

          let calcAmount = 0;

          switch (adj.type) {
            case 'overtime':
              // Regular Day OT: Hourly Rate × 125% (DOLE standard)
              calcAmount = hourlyRate * 1.25 * adjValue;
              manualOtPay += calcAmount;
              manualOtHours += adjValue;
              break;
            case 'rest_day_ot':
              // Rest Day OT: Hourly Rate × 130% × 130% = 169%
              calcAmount = hourlyRate * 1.69 * adjValue;
              manualOtPay += calcAmount;
              manualOtHours += adjValue;
              break;
            case 'special_holiday_ot':
              // Special Holiday OT: Hourly Rate × 130% × 130% = 169%
              calcAmount = hourlyRate * 1.69 * adjValue;
              manualOtPay += calcAmount;
              manualOtHours += adjValue;
              break;
            case 'regular_holiday_ot':
              // Regular Holiday OT: Hourly Rate × 200% × 130% = 260%
              calcAmount = hourlyRate * 2.6 * adjValue;
              manualOtPay += calcAmount;
              manualOtHours += adjValue;
              break;
            case 'night_diff':
              // Night Differential: Hourly Rate × 10% premium per hour
              calcAmount = hourlyRate * 0.10 * adjValue;
              manualOtPay += calcAmount;
              break;
            case 'late':
              // Tardiness: (Hourly Rate / 60 mins) × minutes late
              calcAmount = (hourlyRate / 60) * adjValue;
              lateDeduction += calcAmount;
              totalLateMinutes += adjValue;
              break;
            case 'undertime':
              // Undertime: (Hourly Rate / 60 mins) × minutes undertime
              calcAmount = (hourlyRate / 60) * adjValue;
              undertimeDeduction += calcAmount;
              break;
            case 'absent':
              // Absent: Full day deduction (8 hours × hourly rate)
              calcAmount = hourlyRate * 8 * adjValue;
              lateDeduction += calcAmount;
              break;
          }

          // Update the adjustment log with calculated amount
          const isDeduction = ['late', 'undertime', 'absent'].includes(adj.type);
          await storage.updateAdjustmentLog(adj.id, {
            calculatedAmount: (isDeduction ? -calcAmount : calcAmount).toFixed(2),
            payrollPeriodId: id,
          });
        }

        // Apply manual adjustments to gross pay
        grossPay = grossPay + manualOtPay - lateDeduction - undertimeDeduction;
        overtimeHours += manualOtHours;

        // Calculate monthly equivalent salary for deduction calculations
        // For Philippine statutory deductions (SSS/PhilHealth/Pag-IBIG), we need monthly basis
        const periodStartDate = new Date(period.startDate);
        const periodEndDate = new Date(period.endDate);
        const daysInPeriod = Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        
        // Determine if this is approximately a full month period (28-31 days)
        // For full month periods, use actual gross pay as the monthly basis
        // For partial periods (e.g., 2-week payroll), prorate to monthly
        let monthlyBasicSalary: number;
        if (daysInPeriod >= 28 && daysInPeriod <= 31) {
          // Full month period - use actual gross pay as monthly salary
          monthlyBasicSalary = grossPay;
        } else {
          // Partial period - prorate to monthly (assuming 30 days/month average)
          monthlyBasicSalary = (grossPay / daysInPeriod) * 30;
        }

        // Import deduction calculator
        const { calculateAllDeductions, calculateWithholdingTax } = await import('./utils/deductions');

        // Philippine statutory deductions use MONTHLY salary basis.
        // SSS, PhilHealth, Pag-IBIG are computed once per month.
        // For semi-monthly (15-day) periods, we calculate on the monthly equivalent
        // but only deduct HALF per cutoff (the other half comes from the 2nd cutoff).
        const isSemiMonthly = daysInPeriod < 28; // 15-day period = semi-monthly

        // Step 1: Calculate SSS, PhilHealth, Pag-IBIG on monthly basis
        const mandatorySettings = {
          deductSSS: true,
          deductPhilHealth: true,
          deductPagibig: true,
          deductWithholdingTax: false, // Tax computed separately on taxable income
        };
        const mandatoryBreakdown = await calculateAllDeductions(monthlyBasicSalary, mandatorySettings);

        // For semi-monthly payroll, each cutoff pays half the monthly contribution
        const periodFraction = isSemiMonthly ? 0.5 : 1;
        const sssContribution = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
        const philHealthContribution = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
        const pagibigContribution = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;

        // Step 2: BIR withholding tax is computed on TAXABLE INCOME
        // Taxable = monthly gross - SSS - PhilHealth - Pag-IBIG (mandatory deductions)
        const monthlyMandatory = mandatoryBreakdown.sssContribution + mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
        const monthlyTaxableIncome = Math.max(0, monthlyBasicSalary - monthlyMandatory);
        const monthlyTax = await calculateWithholdingTax(monthlyTaxableIncome);
        const withholdingTax = Math.round(monthlyTax * periodFraction * 100) / 100;

        // Get recurring deductions from employee record
        const sssLoan = parseFloat(employee.sssLoanDeduction || '0');
        const pagibigLoan = parseFloat(employee.pagibigLoanDeduction || '0');
        const advances = parseFloat(employee.cashAdvanceDeduction || '0');
        const otherDeductions = parseFloat(employee.otherDeductions || '0');

        const totalDeductions =
          sssContribution +
          philHealthContribution +
          pagibigContribution +
          withholdingTax +
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
          withholdingTax: withholdingTax.toString(),
          advances: advances.toString(),
          otherDeductions: otherDeductions.toString(),
          totalDeductions: totalDeductions.toString(),
          deductions: totalDeductions.toString(), // For backward compatibility
          netPay: netPay.toString(),
          status: 'pending'
        });

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
        await storage.updatePayrollEntry(entry.id, { status: 'paid' });
      }

      res.json({
        message: `Payroll processed successfully for ${payrollEntries.length} employees`,
        entriesCreated: payrollEntries.length,
        totalHours: totalHours.toFixed(2),
        totalPay: totalPay.toFixed(2)
      });

      realTimeManager.broadcastPayrollProcessed(id, {
        entriesCreated: payrollEntries.length,
        totalHours,
        totalPay
      });
    } catch (error: any) {
      console.error('Process payroll error:', error);

      // Rollback: Delete any created payroll entries
      if (createdEntryIds.length > 0) {
        console.log(`Rolling back ${createdEntryIds.length} payroll entries...`);
        for (const entryId of createdEntryIds) {
          try {
            await storage.deletePayrollEntry(entryId);
          } catch (deleteError) {
            console.error(`Failed to rollback entry ${entryId}:`, deleteError);
          }
        }
        console.log('Rollback complete');
      }

      res.status(500).json({
        message: error.message || "Failed to process payroll. All changes have been rolled back."
      });
    }
  });

  // Get all payroll entries for a branch (Manager only)
  app.get("/api/payroll/entries/branch", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const { periodId } = req.query;

      // Get all active employees in the branch
      const allEmployees = await storage.getUsersByBranch(branchId);
      const employees = allEmployees.filter(emp => emp.isActive);

      let allEntries: any[] = [];
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
            const period = await storage.getPayrollPeriod(entry.payrollPeriodId);
            if (period) {
              periodStartDate = period.startDate;
              periodEndDate = period.endDate;
            }
          } catch {}
          return {
            ...entry,
            periodStartDate,
            periodEndDate,
            employee: {
              id: employee.id,
              firstName: employee.firstName,
              lastName: employee.lastName,
              position: employee.position,
              email: employee.email
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
  });

  // Approve payroll entry (Manager only)
  app.put("/api/payroll/entries/:id/approve", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      const entry = await storage.updatePayrollEntry(id, { status: 'approved' });
      
      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }

      res.json({ entry });

      realTimeManager.broadcastPayrollEntryUpdated(id, 'approved', entry);
    } catch (error: any) {
      console.error('Approve payroll entry error:', error);
      res.status(500).json({ 
        message: error.message || "Failed to approve payroll entry" 
      });
    }
  });

  // Mark payroll entry as paid (Manager only)
  app.put("/api/payroll/entries/:id/paid", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { id } = req.params;
      
      const entry = await storage.updatePayrollEntry(id, { status: 'paid' });
      
      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }

      res.json({ entry });

      realTimeManager.broadcastPayrollEntryUpdated(id, 'paid', entry);
    } catch (error: any) {
      console.error('Mark payroll as paid error:', error);
      res.status(500).json({ 
        message: error.message || "Failed to mark payroll as paid" 
      });
    }
  });

  // Payslip generation route
  app.get("/api/payroll/payslip/:entryId", requireAuth, async (req, res) => {
    const { entryId } = req.params;
    const userId = req.user!.id;

    console.log(`[Payslip] Looking for entry ${entryId} for user ${userId}`);

    // Get payroll entry directly by ID
    const entry = await storage.getPayrollEntry(entryId);
    
    if (!entry) {
      console.log(`[Payslip] Entry ${entryId} not found in database`);
      return res.status(404).json({ message: "Payroll entry not found" });
    }
    
    // Verify the entry belongs to the current user or user is admin/manager
    if (entry.userId !== userId && req.user!.role !== 'admin' && req.user!.role !== 'manager') {
      console.log(`[Payslip] Entry ${entryId} belongs to ${entry.userId}, not ${userId}`);
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
    try {
      const period = await storage.getPayrollPeriod(entry.payrollPeriodId);
      if (period) {
        periodStart = period.startDate instanceof Date
          ? period.startDate.toISOString()
          : String(period.startDate);
        periodEnd = period.endDate instanceof Date
          ? period.endDate.toISOString()
          : String(period.endDate);
      }
    } catch {}

    const payslipData = {
      employeeName: `${user.firstName} ${user.lastName}`,
      employeeId: user.id,
      position: user.position,
      period: entry.createdAt!,
      periodStart,
      periodEnd,
      regularHours: entry.regularHours,
      overtimeHours: entry.overtimeHours,
      nightDiffHours: (entry as any).nightDiffHours || 0,
      totalHours: entry.totalHours,
      hourlyRate: user.hourlyRate,
      // Pay breakdown
      basicPay: entry.basicPay || entry.grossPay,
      holidayPay: entry.holidayPay || 0,
      overtimePay: entry.overtimePay || 0,
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
    };

    res.json({ payslip: payslipData });
  });

  // Manager send payslip to employee
  app.post("/api/payroll/entries/:entryId/send", requireAuth, requireRole(["manager"]), async (req, res) => {
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

      realTimeManager.broadcastPayrollSent(entry.id, entry.userId, entry.netPay);
    } catch (error: any) {
      console.error('Send payslip error:', error);
      res.status(500).json({
        message: error.message || "Failed to send payslip"
      });
    }
  });

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
  app.get("/api/payroll/archived", requireAuth, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const branchId = req.user!.branchId;
      const archivedPeriods = await storage.getArchivedPayrollPeriods(branchId);
      res.json({ archivedPeriods });
    } catch (error: any) {
      console.error('Get archived payroll error:', error);
      res.status(500).json({ message: error.message || "Failed to get archived payroll" });
    }
  });

  // Archive a payroll period
  app.post("/api/payroll/periods/:id/archive", requireAuth, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

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
  });

  // Get a specific archived period with entries
  app.get("/api/payroll/archived/:id", requireAuth, requireRole(["manager", "admin"]), async (req, res) => {
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
  });

  // Get all shift trades for current user (with enriched data)
  app.get("/api/shift-trades", requireAuth, async (req, res) => {
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
      
      // Enrich trades with shift and user data
      const enrichedTrades = await Promise.all(
        allTrades.map(async (trade) => {
          const shift = await storage.getShift(trade.shiftId);
          const requester = await storage.getUser(trade.fromUserId);
          const targetUser = trade.toUserId ? await storage.getUser(trade.toUserId) : null;
          
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
        })
      );
      
      res.json({ trades: enrichedTrades });
    } catch (error: any) {
      console.error("Get shift trades error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch shift trades" });
    }
  });

  app.get("/api/shift-trades/available", requireAuth, async (req, res) => {
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
          fromUser: requesterUser, // Legacy compatibility
        };
      })
    );
    
    res.json({ trades: tradesWithDetails });
  });

  // Get pending trades for manager approval
  app.get("/api/shift-trades/pending", requireAuth, requireRole(["manager", "admin"]), async (req, res) => {
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
          fromUser: requesterUser,
          toUser: targetUserData,
        };
      })
    );
    
    res.json({ trades: tradesWithDetails });
  });

  app.post("/api/shift-trades", requireAuth, async (req, res) => {
    try {
      const tradeData = insertShiftTradeSchema.parse(req.body);
      
      // If manager, they can trade any shift. If employee, only their own.
      const shift = await storage.getShift(tradeData.shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
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
      
      console.log(`✅ Shift trade created: ${trade.id} by user ${fromUserId}`);
      
      // Get the requester details for the notification message
      const requester = await storage.getUser(fromUserId);
      const requesterName = requester ? `${requester.firstName} ${requester.lastName}` : "An employee";
      const shiftDate = shift?.startTime ? format(new Date(shift.startTime), "MMM d") : "a shift";

      // 1. Notify the target user if this is a direct trade
      if (trade.toUserId) {
        const notification = await storage.createNotification({
          userId: trade.toUserId,
          type: 'trade_request',
          title: 'Direct Shift Trade Request',
          message: `${requesterName} wants to trade their ${shiftDate} shift with you.`,
          data: JSON.stringify({ 
            tradeId: trade.id, 
            shiftId: trade.shiftId,
            shiftDate,
            requesterName,
            tradeType: 'direct'
          })
        } as any);
        realTimeManager.broadcastNotification(notification);
      } else {
        // 2. If it's an open trade, notify everyone in the branch
        const branchUsers = await storage.getUsersByBranch(req.user!.branchId);
        for (const user of branchUsers) {
          // Don't notify the person who created it
          if (user.id === fromUserId) continue;
          
          const notification = await storage.createNotification({
            userId: user.id,
            type: 'shift_trade',
            title: 'New Shift Available',
            message: `${requesterName} posted a ${shiftDate} shift for trade.`,
            data: JSON.stringify({ 
              tradeId: trade.id, 
              shiftId: trade.shiftId,
              shiftDate,
              requesterName,
              tradeType: 'open'
            })
          } as any);
          realTimeManager.broadcastNotification(notification);
        }
      }

      // 3. Notify all managers (always)
      const branchUsers = await storage.getUsersByBranch(req.user!.branchId);
      const managers = branchUsers.filter(u => u.role === 'manager' || u.role === 'admin');
      for (const manager of managers) {
        // Don't duplicate if manager was already notified as an employee (though usually managers aren't in branchUsers as employees)
        // Check if manager is already the requester
        if (manager.id === req.user!.id) continue;

        const notificationManager = await storage.createNotification({
          userId: manager.id,
          type: 'trade_request',
          title: 'New Shift Trade Posted',
          message: `${requesterName} has posted a shift trade for ${shiftDate}.`,
          data: JSON.stringify({ 
            tradeId: trade.id, 
            shiftId: trade.shiftId,
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
  });

  // PATCH endpoint for responding to a trade (accept/reject by target user)
  app.patch("/api/shift-trades/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;

      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
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
      
      console.log(`📝 Shift trade ${id} status updated to ${status} by user ${userId}`);
      
      // Broadcast real-time events based on status
      if (status === "accepted") {
        realTimeManager.broadcastTradeAccepted(id, enrichedTrade, shift);
      } else if (status === "rejected") {
        realTimeManager.broadcastTradeRejected(id, enrichedTrade);
      } else {
        realTimeManager.broadcastTradeStatusChanged(id, status, enrichedTrade);
      }
      
      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Respond to trade error:", error);
      res.status(500).json({ message: error.message || "Failed to respond to trade" });
    }
  });

  // PATCH endpoint for manager approval of trades
  app.patch("/api/shift-trades/:id/approve", requireAuth, requireRole(["manager", "admin"]), async (req, res) => {
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
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split('T')[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position,
        } : null,
      };

      const action = status === "approved" ? "✅ approved" : "❌ rejected";
      console.log(`${action} shift trade ${id} by manager ${managerId}`);
      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Manager approve trade error:", error);
      res.status(500).json({ message: error.message || "Failed to process trade" });
    }
  });

  app.put("/api/shift-trades/:id/take", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      // If trade is direct to someone else, I can't take it
      if (trade.toUserId && trade.toUserId !== userId) {
        return res.status(403).json({ message: "This trade is reserved for another employee" });
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

      console.log(`✅ User ${userId} took shift trade ${id}`);

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
          tradeId: id, 
          shiftId: trade.shiftId,
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
            tradeId: id, 
            shiftId: trade.shiftId,
            shiftDate,
            takerName,
            status: 'pending_approval'
          })
        } as any);
        realTimeManager.broadcastNotification(notificationManager);
      }

      // 3. Broadcast status change to update UI lists
      realTimeManager.broadcastTradeStatusChanged(id, "pending", enrichedTrade);

      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Take shift trade error:", error);
      res.status(500).json({ message: error.message || "Failed to take shift" });
    }
  });

  app.put("/api/shift-trades/:id/approve", requireAuth, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const managerId = req.user!.id;

      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
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
        title: 'Shift Trade Approved',
        message: `Your trade for the ${shiftDate} shift has been approved.`,
        data: JSON.stringify({ 
          tradeId: id,
          shiftId: trade.shiftId,
          shiftDate,
          status: 'approved'
        })
      } as any);
      realTimeManager.broadcastNotification(notificationRequester);

      const notificationTarget = await storage.createNotification({
        userId: trade.toUserId,
        type: 'shift_trade',
        title: 'Shift Trade Approved',
        message: `You have been assigned a new shift (${shiftDate}) from a trade.`,
        data: JSON.stringify({ 
          tradeId: id,
          shiftId: trade.shiftId,
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

      console.log(`✅ Shift trade ${id} approved by manager ${managerId}`);
      
      // CRITICAL: Broadcast real-time approval with updated shift
      // This triggers instant schedule updates on all clients
      realTimeManager.broadcastTradeApproved(id, enrichedTrade, shift!);
      
      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Approve trade error:", error);
      res.status(500).json({ message: error.message || "Failed to approve trade" });
    }
  });

  app.put("/api/shift-trades/:id/reject", requireAuth, requireRole(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const managerId = req.user!.id;

      const trade = await storage.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
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
        message: `Your shift trade request for ${shiftDate} has been rejected.`,
        data: JSON.stringify({ 
          tradeId: id,
          shiftId: trade.shiftId,
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

      console.log(`❌ Shift trade ${id} rejected by manager ${managerId}`);
      res.json({ trade: enrichedTrade });
    } catch (error: any) {
      console.error("Reject trade error:", error);
      res.status(500).json({ message: error.message || "Failed to reject trade" });
    }
  });

  // DELETE endpoint for canceling shift trades
  app.delete("/api/shift-trades/:id", requireAuth, async (req, res) => {
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

      console.log(`🗑️  Shift trade ${id} cancelled by user ${userId}`);
      res.json({ 
        message: "Trade cancelled successfully",
        trade: enrichedTrade 
      });
    } catch (error: any) {
      console.error("Delete shift trade error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel trade" });
    }
  });

  // Admin Deduction Rates Routes (Admin only)
  app.get("/api/admin/deduction-rates", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const rates = await storage.getAllDeductionRates();
      res.json({ rates });
    } catch (error: any) {
      console.error('Get deduction rates error:', error);
      res.status(500).json({ message: error.message || "Failed to get deduction rates" });
    }
  });

  app.post("/api/admin/deduction-rates", requireAuth, requireRole(["admin"]), async (req, res) => {
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

      res.json({ rate });
    } catch (error: any) {
      console.error('Create deduction rate error:', error);
      res.status(500).json({ message: error.message || "Failed to create deduction rate" });
    }
  });

  app.put("/api/admin/deduction-rates/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
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

      res.json({ rate });
    } catch (error: any) {
      console.error('Update deduction rate error:', error);
      res.status(500).json({ message: error.message || "Failed to update deduction rate" });
    }
  });

  app.delete("/api/admin/deduction-rates/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDeductionRate(id);

      if (!success) {
        return res.status(404).json({ message: "Deduction rate not found" });
      }

      res.json({ message: "Deduction rate deleted successfully" });
    } catch (error: any) {
      console.error('Delete deduction rate error:', error);
      res.status(500).json({ message: error.message || "Failed to delete deduction rate" });
    }
  });

  // Deduction Settings Routes (Manager only)
  app.get("/api/deduction-settings", requireAuth, requireRole(["manager"]), async (req, res) => {
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
  });

  app.put("/api/deduction-settings/:id", requireAuth, requireRole(["manager"]), async (req, res) => {
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

      res.json({ settings });
    } catch (error: any) {
      console.error('Update deduction settings error:', error);
      res.status(500).json({ message: error.message || "Failed to update deduction settings" });
    }
  });

  // Manager approval routes
  app.get("/api/approvals", requireAuth, requireRole(["manager"]), async (req, res) => {
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
  });

  app.put("/api/approvals/:id", requireAuth, requireRole(["manager"]), async (req, res) => {
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
  });

  // Register branches routes
  registerBranchesRoutes(app);

  // Reports API endpoints
  app.get("/api/reports/payroll", requireAuth, requireRole(["manager"]), async (req, res) => {
    const branchId = req.user!.branchId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const users = await storage.getUsersByBranch(branchId);
    let totalPayroll = 0;

    for (const user of users) {
      const entries = await storage.getPayrollEntriesByUser(user.id);
      for (const entry of entries) {
        if (!entry.createdAt) continue;
        const entryDate = new Date(entry.createdAt);
        if (entryDate >= monthStart && entryDate <= monthEnd) {
          totalPayroll += parseFloat(entry.grossPay);
        }
      }
    }

    res.json({ totalPayroll: Number(totalPayroll.toFixed(2)) });
  });

  app.get("/api/reports/attendance", requireAuth, requireRole(["manager"]), async (req, res) => {
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
  });

  app.get("/api/reports/shifts", requireAuth, requireRole(["manager"]), async (req, res) => {
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
  });

  app.get("/api/reports/employees", requireAuth, requireRole(["manager"]), async (req, res) => {
    const branchId = req.user!.branchId;
    const users = await storage.getUsersByBranch(branchId);

    res.json({
      activeCount: users.filter(u => u.isActive).length,
      totalCount: users.length,
      inactiveCount: users.filter(u => !u.isActive).length,
    });
  });

  // Dashboard stats routes
  app.get("/api/dashboard/stats", requireAuth, requireRole(["manager"]), async (req, res) => {
    const branchId = req.user!.branchId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's shifts for the branch
    const todayShifts = await storage.getShiftsByBranch(branchId, today, tomorrow);

    // Calculate clocked in employees - shifts with status 'in-progress'
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

    // Calculate revenue from completed shifts (simplified - based on hours worked)
    // In a real system, this would come from a sales/revenue table
    const completedShifts = todayShifts.filter(shift => shift.status === 'completed');
    let revenue = 0;
    for (const shift of completedShifts) {
      const user = await storage.getUser(shift.userId);
      if (user) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
        // Estimate revenue as 3x labor cost (typical cafe margin)
        revenue += hours * parseFloat(user.hourlyRate) * 3;
      }
    }

    console.log('Sending dashboard stats:', {
      clockedIn,
      onBreak,
      late,
      revenue,
      todayShiftsCount: todayShifts.length
    });

    res.json({
      stats: {
        clockedIn,
        onBreak,
        late,
        revenue: Number(revenue.toFixed(2))
      }
    });
  });

  // Dashboard employee status route
  app.get("/api/dashboard/employee-status", requireAuth, requireRole(["manager"]), async (req, res) => {
    const branchId = req.user!.branchId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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
            status = 'Clocked In';
            statusInfo = `Since ${format(new Date(todayShift.actualStartTime!), "h:mm a")}`;
          } else if (todayShift.status === 'completed') {
            status = 'Completed';
            statusInfo = `Worked ${format(new Date(todayShift.actualStartTime!), "h:mm a")} - ${format(new Date(todayShift.actualEndTime!), "h:mm a")}`;
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
  });

  // Time off request routes
  app.get("/api/time-off-requests", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const branchId = req.user!.branchId;

    let requests;

    // Managers get all requests from their branch, employees get only their own
    if (userRole === 'manager') {
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
  });

  // Employee analytics endpoint
  app.get("/api/employee/performance", requireAuth, async (req, res) => {
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
      const sales = hours * parseFloat(user.hourlyRate) * 3;

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
        sales: Number((currentMonthHours * parseFloat(user.hourlyRate) * 3).toFixed(2)),
        shiftsCompleted: completedShifts,
        totalShifts: totalShifts,
        completionRate: Number(completionRate.toFixed(1)),
      }
    });
  });

  // Time off balance endpoint
  app.get("/api/time-off-balance", requireAuth, async (req, res) => {
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
          // Calculate days (inclusive)
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

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
  });

  // Time off policy routes (for configurable advance notice)
  app.get("/api/time-off-policy", requireAuth, async (req, res) => {
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
  });

  app.put("/api/time-off-policy", requireAuth, requireRole(["manager"]), async (req, res) => {
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
  });

  app.post("/api/time-off-requests", requireAuth, async (req, res) => {
    try {
      console.log('📝 Received time off request body:', req.body);
      
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

      // Explicit payload construction
      const requestPayload: any = {
        userId: req.user!.id,
        startDate: startDate,
        endDate: endDate,
        type: req.body.type,
        reason: req.body.reason || '',
        status: 'pending'
      };

      console.log('🔍 Validating payload manually (Bypassing Zod check to debug):', requestPayload);
      console.log(`📅 Advance notice: ${advanceDays} days (minimum: ${minimumAdvanceDays}, shortNotice: ${shortNotice})`);
      
      // Manual Validation Check
      if (!requestPayload.type) throw new Error("Missing 'type' field");
      if (!requestPayload.userId) throw new Error("Missing 'userId' field (User not authenticated properly?)");

      // DIRECT STORAGE CALL - skipping Zod for diagnosis
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
            requestId: request.id,
            employeeId: req.user!.id,
            type: requestPayload.type,
            startDate: request.startDate,
            endDate: request.endDate,
            advanceDays,
            shortNotice,
            minimumAdvanceDays
          })
        } as any);
        realTimeManager.broadcastNotification(notification);
      }

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
  });

  app.put("/api/time-off-requests/:id/approve", requireAuth, requireRole(["manager"]), async (req, res) => {
    const { id } = req.params;
    const request = await storage.updateTimeOffRequest(id, {
      status: "approved",
      approvedBy: req.user!.id,
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
        requestId: request.id,
        status: 'approved',
        startDate: format(new Date(request.startDate), "MMM d, yyyy"),
        endDate: format(new Date(request.endDate), "MMM d, yyyy"),
        type: request.type
      })
    } as any);
    realTimeManager.broadcastNotification(notification);

    res.json({ request });
  });

  app.put("/api/time-off-requests/:id/reject", requireAuth, requireRole(["manager"]), async (req, res) => {
    const { id } = req.params;
    const request = await storage.updateTimeOffRequest(id, {
      status: "rejected",
      approvedBy: req.user!.id,
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
          reason: "Automatically rejected via time-off request rejection"
        });
      }
    } catch (syncError) {
      console.error('Failed to sync with approvals table:', syncError);
      // Don't fail the main request if sync fails
    }

    // Create notification for employee
    const notification = await storage.createNotification({
      userId: request.userId,
      type: 'time_off_rejected',
      title: 'Time Off Request Rejected',
      message: `Your time off request from ${format(new Date(request.startDate), "MMM d")} to ${format(new Date(request.endDate), "MMM d, yyyy")} has been rejected`,
      isRead: false,
      data: JSON.stringify({
        requestId: request.id,
        status: 'rejected',
        startDate: format(new Date(request.startDate), "MMM d, yyyy"),
        endDate: format(new Date(request.endDate), "MMM d, yyyy"),
        type: request.type
      })
    } as any);
    realTimeManager.broadcastNotification(notification);

    res.json({ request });
  });


  // Update time off request (employee can edit pending requests)
  app.put("/api/time-off-requests/:id", requireAuth, async (req, res) => {
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
  });

  // Delete time off request (employee can delete pending requests)
  app.delete("/api/time-off-requests/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Fetch the request to verify ownership
    const existingRequest = await storage.getTimeOffRequest(id);
    if (!existingRequest) {
      return res.status(404).json({ message: "Time off request not found" });
    }

    // Only allow deleting own requests or if manager
    if (existingRequest.userId !== userId && req.user!.role !== 'manager') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Don't allow deleting approved/rejected requests
    if (existingRequest.status !== 'pending') {
      return res.status(400).json({ message: "Cannot delete approved or rejected requests" });
    }

    await storage.deleteTimeOffRequest(id);
    res.json({ message: "Request deleted successfully" });
  });
  // Notification routes
  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const notifications = await storage.getUserNotifications(userId);
    res.json({ notifications });
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id; // Verify ownership if needed, but for now just mark read
    
    // In a real app we should verify the notification belongs to the user
    // For now, assuming the ID is valid and belongs to user or ignoring ownership check for speed
    const notification = await storage.markNotificationRead(id);
    res.json(notification || { success: true });
  });

  app.patch("/api/notifications/read-all", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    await storage.markAllNotificationsRead(userId);
    res.json({ success: true, message: "All notifications marked as read" });
  });


  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const deleted = await storage.deleteNotification(id, userId);

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  });

  // Blockchain payroll record storage
  app.post("/api/blockchain/payroll/store", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { payrollEntryId } = req.body;

      if (!payrollEntryId) {
        return res.status(400).json({ message: "Payroll entry ID is required" });
      }

      // Get payroll entry details
      const userId = req.user!.id;
      const entries = await storage.getPayrollEntriesByUser(userId);
      const entry = entries.find(e => e.id === payrollEntryId);

      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }

      // Get user details
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prepare blockchain record
      const blockchainRecord = {
        id: entry.id,
        employeeId: user.id,
        employeeName: `${user.firstName} ${user.lastName}`,
        periodStart: entry.createdAt!.toISOString(),
        periodEnd: entry.createdAt!.toISOString(),
        totalHours: parseFloat(entry.totalHours),
        regularHours: parseFloat(entry.regularHours),
        overtimeHours: parseFloat(entry.overtimeHours || "0"),
        hourlyRate: parseFloat(user.hourlyRate),
        grossPay: parseFloat(entry.grossPay),
        deductions: parseFloat(entry.deductions || "0"),
        netPay: parseFloat(entry.netPay),
      };

      // Store on blockchain
      const result = await blockchainService.storePayrollRecord(blockchainRecord);

      // Update database with blockchain details
      await storage.updatePayrollEntry(payrollEntryId, {
        blockchainHash: result.blockchainHash,
        blockNumber: result.blockNumber,
        transactionHash: result.transactionHash,
        verified: true,
      });

      res.json({
        message: "Payroll record stored on blockchain successfully",
        blockchainRecord: result,
      });
    } catch (error: any) {
      console.error('Blockchain storage error:', error);
      res.status(500).json({
        message: error.message || "Failed to store payroll record on blockchain"
      });
    }
  });

  // Blockchain record verification
  app.post("/api/blockchain/payroll/verify", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { payrollEntryId } = req.body;

      if (!payrollEntryId) {
        return res.status(400).json({ message: "Payroll entry ID is required" });
      }

      // Get payroll entry
      const userId = req.user!.id;
      const entries = await storage.getPayrollEntriesByUser(userId);
      const entry = entries.find(e => e.id === payrollEntryId);

      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }

      if (!entry.blockchainHash) {
        return res.status(400).json({ message: "Payroll entry not stored on blockchain" });
      }

      // Verify against blockchain
      const verification = await blockchainService.verifyPayrollRecord(payrollEntryId, entry.blockchainHash);

      res.json({
        message: "Payroll record verification completed",
        verification,
      });
    } catch (error: any) {
      console.error('Blockchain verification error:', error);
      res.status(500).json({
        message: error.message || "Failed to verify payroll record"
      });
    }
  });

  // Get blockchain record details
  app.get("/api/blockchain/record/:transactionHash", requireAuth, async (req, res) => {
    try {
      const { transactionHash } = req.params;

      const record = await blockchainService.getBlockchainRecord(transactionHash);

      res.json({ record });
    } catch (error: any) {
      console.error('Blockchain record lookup error:', error);
      res.status(500).json({
        message: error.message || "Failed to get blockchain record"
      });
    }
  });

  // Batch blockchain storage for multiple payroll records
  app.post("/api/blockchain/payroll/batch-store", requireAuth, requireRole(["manager"]), async (req, res) => {
    try {
      const { payrollEntryIds } = req.body;

      if (!Array.isArray(payrollEntryIds)) {
        return res.status(400).json({ message: "payrollEntryIds must be an array" });
      }

      const userId = req.user!.id;
      const entries = await storage.getPayrollEntriesByUser(userId);
      const selectedEntries = entries.filter(e => payrollEntryIds.includes(e.id));

      if (selectedEntries.length === 0) {
        return res.status(404).json({ message: "No valid payroll entries found" });
      }

      // Get user details for all entries
      const users = await Promise.all(
        selectedEntries.map(async (entry) => await storage.getUser(entry.userId))
      );

      // Prepare blockchain records
      const blockchainRecords = selectedEntries.map((entry, index) => {
        const user = users[index];
        if (!user) throw new Error(`User not found for entry ${entry.id}`);

        return {
          id: entry.id,
          employeeId: user.id,
          employeeName: `${user.firstName} ${user.lastName}`,
          periodStart: entry.createdAt!.toISOString(),
          periodEnd: entry.createdAt!.toISOString(),
          totalHours: parseFloat(entry.totalHours),
          regularHours: parseFloat(entry.regularHours),
          overtimeHours: parseFloat(entry.overtimeHours || "0"),
          hourlyRate: parseFloat(user.hourlyRate),
          grossPay: parseFloat(entry.grossPay),
          deductions: parseFloat(entry.deductions || "0"),
          netPay: parseFloat(entry.netPay),
        };
      });

      // Batch store on blockchain
      const results = await blockchainService.batchStorePayrollRecords(blockchainRecords);

      // Update database with blockchain details
      for (const result of results) {
        await storage.updatePayrollEntry(result.id, {
          blockchainHash: result.blockchainHash,
          blockNumber: result.blockNumber,
          transactionHash: result.transactionHash,
          verified: true,
        });
      }

      res.json({
        message: `${results.length} payroll records stored on blockchain successfully`,
        storedCount: results.length,
        results,
      });
    } catch (error: any) {
      console.error('Batch blockchain storage error:', error);
      res.status(500).json({
        message: error.message || "Failed to store payroll records on blockchain"
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // ADMIN: Force Seed Sample Data with Complete Shifts and Payroll
  // ═══════════════════════════════════════════════════════════════
  app.post('/api/admin/seed-sample-data', requireAuth, requireRole(['admin', 'manager']), async (req: Request, res: Response) => {
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

            // For past shifts, set actual clock in/out times
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
          totalMinutes = daysWorked * 8 * 60;
        }

        const totalHours = totalMinutes / 60;
        const regularHours = Math.min(totalHours, 88); // 88 hours = 11 days × 8 hours
        const overtimeHours = Math.max(0, totalHours - 88);

        const hourlyRate = parseFloat(emp.hourlyRate);
        const basicPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.25;
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
          console.log(`Error creating payroll entry for ${emp.firstName}:`, err.message);
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
  });

  // Create and start the server
  // const httpServer = createServer(app); // Moved to top

  // Update own profile (Self-service)
  app.put("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { email, password, newPassword, firstName, lastName } = req.body;
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
  });

  // Mount employee uploads router - PROTECTED
  // MOVED UP to avoid conflict with /api/employees/:id
  
  // Debug endpoint to force seeding
  app.post("/api/debug/seed", requireAuth, async (req, res) => {
    try {
      // Manual role check with debug output
      if (!['admin', 'manager'].includes(req.user!.role)) {
        return res.status(403).json({ 
          message: "Insufficient permissions", 
          yourRole: req.user!.role,
          userId: req.user!.id
        });
      }

      console.log('🌱 Manual seeding triggered via API');
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
  });

  // Full database reset + reseed (manager/admin only)
  app.post("/api/debug/reset-and-reseed", requireAuth, async (req, res) => {
    try {
      if (!['admin', 'manager'].includes(req.user!.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      console.log('🔄 Full database reset + reseed triggered via API');

      // 1. Drop all tables
      await resetDatabase();
      console.log('   ✅ Database reset');

      // 2. Recreate tables
      await initializeDatabase();
      console.log('   ✅ Tables created');

      // 3. Create admin account
      await createAdminAccount();
      console.log('   ✅ Admin account created');

      // 4. Seed users
      await seedSampleUsers();
      console.log('   ✅ Sample users seeded');

      // 5. Seed schedules + payroll
      await seedSampleSchedulesAndPayroll();
      console.log('   ✅ Schedules + payroll seeded');

      // 6. Seed deduction rates
      await seedDeductionRates();
      console.log('   ✅ Deduction rates seeded');

      // 7. Seed holidays
      await seedPhilippineHolidays();
      console.log('   ✅ Holidays seeded');

      // 8. Seed shift trades
      await seedSampleShiftTrades();
      console.log('   ✅ Shift trades seeded');

      // 9. Mark setup complete
      await markSetupComplete();
      console.log('   ✅ Setup marked complete');

      res.json({
        message: "Database fully reset and reseeded!",
        timestamp: new Date().toISOString(),
        note: "You need to log in again (session was invalidated by reset)."
      });
    } catch (error) {
      console.error('❌ Reset and reseed error:', error);
      res.status(500).json({ message: "Reset failed", error: String(error) });
    }
  });

  return httpServer;
}
