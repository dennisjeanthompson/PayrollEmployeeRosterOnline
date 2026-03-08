/**
 * Audit Logs Routes
 * Track and retrieve audit history for compliance
 */

import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { dbStorage as storage } from "../db-storage";
import RealTimeManager from "../services/realtime-manager";

let _realTimeManager: RealTimeManager | null = null;

export function setAuditRealTimeManager(rtm: RealTimeManager) {
  _realTimeManager = rtm;
}

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

    // Enrich logs with user names
    const enrichedLogs = await Promise.all(logs.map(async (log) => {
      let userName = "Unknown";
      try {
        const user = await storage.getUser(log.userId);
        if (user) {
          userName = `${user.firstName} ${user.lastName}`;
        }
      } catch (e) { /* ignore */ }
      return { ...log, userName };
    }));

    // Get total count for pagination
    const stats = await storage.getAuditLogStats();

    res.json({ logs: enrichedLogs, total: stats.totalLogs });
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

    // Broadcast real-time update
    if (_realTimeManager) {
      let userName = "Unknown";
      try {
        const user = await storage.getUser(req.user!.id);
        if (user) userName = `${user.firstName} ${user.lastName}`;
      } catch (e) { /* ignore */ }
      _realTimeManager.broadcastAuditLogCreated({ ...log, userName }, req.user!.branchId);
    }

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

// GET /api/audit-logs/export - Export audit logs as CSV
router.get("/api/audit-logs/export", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const { entityType, action, startDate, endDate } = req.query;

    const logs = await storage.getAuditLogs({
      entityType: entityType as string,
      action: action as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: 10000,
      offset: 0,
    });

    // Enrich with user names
    const enrichedLogs = await Promise.all(logs.map(async (log) => {
      let userName = "Unknown";
      try {
        const user = await storage.getUser(log.userId);
        if (user) userName = `${user.firstName} ${user.lastName}`;
      } catch (e) { /* ignore */ }
      return { ...log, userName };
    }));

    // Build CSV
    const headers = ["Timestamp", "Action", "Entity Type", "Entity ID", "User", "Old Values", "New Values", "Reason", "IP Address"];
    const rows = enrichedLogs.map(log => [
      log.createdAt ? new Date(log.createdAt).toISOString() : "",
      log.action,
      log.entityType,
      log.entityId,
      log.userName,
      log.oldValues || "",
      log.newValues || "",
      log.reason || "",
      log.ipAddress || "",
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=audit-logs-${new Date().toISOString().split("T")[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    res.status(500).json({ message: "Failed to export audit logs" });
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
  branchId?: string;
}) {
  try {
    const log = await storage.createAuditLog({
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

    // Broadcast real-time update
    if (_realTimeManager) {
      let userName = "Unknown";
      let branchId = params.branchId;
      try {
        const user = await storage.getUser(params.userId);
        if (user) {
          userName = `${user.firstName} ${user.lastName}`;
          if (!branchId) branchId = user.branchId;
        }
      } catch (e) { /* ignore */ }
      _realTimeManager.broadcastAuditLogCreated({ ...log, userName }, branchId);
    }

    return log;
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit logging should not break the main operation
  }
}
