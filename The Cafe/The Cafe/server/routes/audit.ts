/**
 * Audit Logs Routes
 * Track and retrieve audit history for compliance
 */

import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { dbStorage as storage } from "../db-storage";

const router = Router();

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  req.user = req.session.user;
  next();
};

// Middleware to check manager/admin role
const requireManagerRole = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

// GET /api/audit-logs - Fetch audit logs with filtering
router.get("/api/audit-logs", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const { 
      entityType, 
      action, 
      startDate, 
      endDate, 
      limit = "50",
      offset = "0"
    } = req.query;

    const logs = await storage.getAuditLogs({
      entityType: entityType as string,
      action: action as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({ logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// POST /api/audit-logs - Create audit log entry (internal use)
router.post("/api/audit-logs", requireAuth, async (req, res) => {
  try {
    const { action, entityType, entityId, oldValues, newValues, reason } = req.body;

    if (!action || !entityType || !entityId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const log = await storage.createAuditLog({
      id: uuidv4(),
      action,
      entityType,
      entityId,
      userId: req.user!.id,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      reason,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({ log });
  } catch (error) {
    console.error("Error creating audit log:", error);
    res.status(500).json({ message: "Failed to create audit log" });
  }
});

// GET /api/audit-logs/stats - Get audit log statistics
router.get("/api/audit-logs/stats", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const stats = await storage.getAuditLogStats();
    res.json({ stats });
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    res.status(500).json({ message: "Failed to fetch audit log stats" });
  }
});

export { router as auditRouter };

// Helper function to create audit log from anywhere in the codebase
export async function createAuditLog(params: {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  return storage.createAuditLog({
    id: uuidv4(),
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    userId: params.userId,
    oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
    newValues: params.newValues ? JSON.stringify(params.newValues) : null,
    reason: params.reason || null,
    ipAddress: params.ipAddress || null,
    userAgent: params.userAgent || null,
  });
}
