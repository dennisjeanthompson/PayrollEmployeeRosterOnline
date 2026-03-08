import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { dbStorage } from "../db-storage";

export interface RealTimeEvents {
  "shift:created": { shift: any };
  "shift:updated": { shift: any };
  "shift:deleted": { shiftId: string };
  "trade:created": { trade: any };
  "trade:updated": { trade: any };
  "trade:status-changed": { tradeId: string; status: string };
  "availability:updated": { employeeId: string; availability: any };
  "employee:created": { employee: any };
  "employee:updated": { employee: any };
  "employee:deleted": { employeeId: string };
  "payroll:period-created": { period: any };
  "payroll:period-updated": { period: any };
  "payroll:processed": { periodId: string; stats: any };
  "payroll:entry-updated": { entryId: string; status: string; entry?: any };
  "payroll:sent": { entryId: string; netPay: string | number };
}

class RealTimeManager {
  private io: SocketIOServer;
  private userConnections: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.VITE_API_URL || "http://localhost:5173",
        credentials: true,
      },
      transports: ["websocket", "polling"],
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    this.setupMiddleware();
    this.setupConnections();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      // Extract userId from query or auth token
      const userId = socket.handshake.query.userId as string;
      const authToken = socket.handshake.auth.token as string;

      if (!userId && !authToken) {
        return next(new Error("Authentication required"));
      }

      // Store userId on socket
      socket.data.userId = userId;
      next();
    });
  }

  private setupConnections() {
    this.io.on("connection", async (socket: Socket) => {
      const userId = socket.data.userId;

      if (!userId) {
        console.warn("Socket connected without userId");
        return;
      }

      // Track user connections
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId)!.add(socket.id);

      console.log(`User ${userId} connected (socket: ${socket.id})`);

      // Join user's personal room
      socket.join(`user:${userId}`);
      socket.join(`shifts`); // Subscribe to all shifts for real-time updates

      // Fetch user details to join role/branch rooms
      try {
        const user = await dbStorage.getUser(userId);
        if (user) {
          console.log(`Joining user ${userId} to branch room: branch:${user.branchId}`);
          socket.join(`branch:${user.branchId}`);
          
          if (user.role === 'manager' || user.role === 'admin') {
            socket.join('managers');
            socket.join(`branch:${user.branchId}:managers`);
          } else {
            socket.join('employees');
            socket.join(`branch:${user.branchId}:employees`);
          }
        }
      } catch (err) {
        console.error(`Error joining rooms for user ${userId}:`, err);
      }

      // Handle custom events
      socket.on("subscribe:employee-shifts", () => {
        socket.join(`employee:${userId}:shifts`);
      });

      socket.on("subscribe:shift-trades", () => {
        socket.join(`user:${userId}:trades`);
      });

      socket.on("disconnect", () => {
        const connections = this.userConnections.get(userId);
        if (connections) {
          connections.delete(socket.id);
          if (connections.size === 0) {
            this.userConnections.delete(userId);
          }
        }
        console.log(`User ${userId} disconnected (socket: ${socket.id})`);
      });

      // Error handling
      socket.on("error", (error) => {
        console.error(`Socket error for user ${userId}:`, error);
      });
    });
  }

  // Public methods for broadcasting events
  public broadcastShiftCreated(shift: any) {
    this.io.to("shifts").emit("shift:created", { shift });
  }

  public broadcastShiftUpdated(shift: any) {
    this.io.to("shifts").emit("shift:updated", { shift });
  }

  public broadcastShiftDeleted(shiftId: string) {
    this.io.to("shifts").emit("shift:deleted", { shiftId });
  }

  // ENHANCED SHIFT TRADE EVENTS
  public broadcastTradeCreated(trade: any, shift?: any) {
    const payload = { trade, shift };
    
    // Notify the trade requester
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:created", payload);
      this.io.to(`user:${trade.fromUserId}`).emit("trade:created", payload);
    }
    
    // Notify target employee if specified
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:created", payload);
      this.io.to(`user:${trade.toUserId}`).emit("trade:created", payload);
    }
    
    // Notify all managers in the branch
    this.io.to("managers").emit("trade:created", payload);
    
    // Broadcast to shifts room for schedule updates
    this.io.to("shifts").emit("trade:created", payload);
  }

  public broadcastTradeAccepted(tradeId: string, trade: any, shift?: any) {
    const payload = { tradeId, trade, shift, status: "accepted" };
    
    // Notify requester
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:status-changed", payload);
      this.io.to(`user:${trade.fromUserId}`).emit("trade:status-changed", payload);
    }
    
    // Notify target user
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:status-changed", payload);
      this.io.to(`user:${trade.toUserId}`).emit("trade:status-changed", payload);
    }
    
    // Notify managers for approval
    this.io.to("managers").emit("trade:status-changed", payload);
    
    // Update shifts view
    this.io.to("shifts").emit("trade:status-changed", payload);
  }

  public broadcastTradeRejected(tradeId: string, trade: any, reason?: string) {
    const payload = { tradeId, trade, status: "rejected", reason };
    
    // Notify all relevant parties
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:status-changed", payload);
      this.io.to(`user:${trade.fromUserId}`).emit("trade:status-changed", payload);
    }
    
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:status-changed", payload);
      this.io.to(`user:${trade.toUserId}`).emit("trade:status-changed", payload);
    }
    
    this.io.to("managers").emit("trade:status-changed", payload);
    this.io.to("shifts").emit("trade:status-changed", payload);
  }

  public broadcastTradeApproved(tradeId: string, trade: any, updatedShift: any) {
    const payload = { 
      tradeId, 
      trade, 
      updatedShift, 
      status: "approved",
      message: "Shift ownership has been transferred"
    };
    
    // Notify requester (they lost the shift)
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:approved", payload);
      this.io.to(`user:${trade.fromUserId}`).emit("trade:approved", payload);
    }
    
    // Notify target (they gained the shift)
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:approved", payload);
      this.io.to(`user:${trade.toUserId}`).emit("trade:approved", payload);
    }
    
    // Notify managers
    this.io.to("managers").emit("trade:approved", payload);
    
    // CRITICAL: Broadcast shift update to all for schedule refresh
    this.broadcastShiftUpdated(updatedShift);
  }

  public broadcastTradeStatusChanged(tradeId: string, status: string, trade: any) {
    // Notify relevant parties
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:status-changed", { tradeId, status, trade });
      this.io.to(`user:${trade.fromUserId}`).emit("trade:status-changed", { tradeId, status, trade });
    }
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:status-changed", { tradeId, status, trade });
      this.io.to(`user:${trade.toUserId}`).emit("trade:status-changed", { tradeId, status, trade });
    }
    
    // Notify managers and update shifts
    this.io.to("managers").emit("trade:status-changed", { tradeId, status, trade });
    this.io.to("shifts").emit("trade:status-changed", { tradeId, status, trade });
  }

  public broadcastShiftOwnershipChanged(shiftId: string, fromUserId: string, toUserId: string, shift: any) {
    const payload = { shiftId, fromUserId, toUserId, shift };
    
    // Notify both users
    this.io.to(`user:${fromUserId}`).emit("shift:ownership-changed", payload);
    this.io.to(`user:${toUserId}`).emit("shift:ownership-changed", payload);
    
    // Update all shifts views
    this.io.to("shifts").emit("shift:ownership-changed", payload);
    this.broadcastShiftUpdated(shift);
  }

  public notifyAvailabilityUpdate(employeeId: string, availability: any) {
    this.io.to("shifts").emit("availability:updated", { employeeId, availability });
  }

  public broadcastEmployeeCreated(employee: any) {
    this.io.emit("employee:created", { employee });
  }

  public broadcastEmployeeUpdated(employee: any) {
    this.io.emit("employee:updated", { employee });
  }

  public broadcastEmployeeDeleted(employeeId: string) {
    this.io.emit("employee:deleted", { employeeId });
  }

  // PAYROLL EVENTS
  public broadcastPayrollPeriodCreated(period: any) {
    this.io.emit("payroll:period-created", { period });
  }

  public broadcastPayrollPeriodUpdated(period: any) {
    this.io.emit("payroll:period-updated", { period });
  }

  public broadcastPayrollProcessed(periodId: string, stats: any) {
    this.io.emit("payroll:processed", { periodId, stats });
  }

  public broadcastPayrollEntryUpdated(entryId: string, status: string, entry?: any) {
    if (entry && entry.userId) {
      this.io.to(`user:${entry.userId}`).emit("payroll:entry-updated", { entryId, status, entry });
    }
    // Also emit to everyone (managers need to see it updated too)
    this.io.emit("payroll:entry-updated", { entryId, status, entry });
  }

  public broadcastPayrollSent(entryId: string, userId: string, netPay: string | number) {
    this.io.to(`user:${userId}`).emit("payroll:sent", { entryId, netPay });
    this.io.emit("payroll:sent", { entryId, netPay });
  }

  // AUDIT LOG EVENTS
  public broadcastAuditLogCreated(auditLog: any) {
    // Broadcast to all managers and admins
    this.io.to("managers").emit("audit:created", { auditLog });
  }

  // NOTIFICATION EVENTS
  public broadcastNotification(notification: any) {
    if (notification.userId) {
      this.io.to(`user:${notification.userId}`).emit("notification:created", { notification });
    }
  }

  public broadcastBranchNotification(branchId: string, notification: any) {
    this.io.to(`branch:${branchId}`).emit("notification:created", { notification });
  }

  public broadcastBranchManagerNotification(branchId: string, notification: any) {
    this.io.to(`branch:${branchId}:managers`).emit("notification:created", { notification });
  }

  // TIME-OFF EVENTS
  public broadcastTimeOffCreated(request: any, branchId?: string) {
    // Notify managers and the requester
    this.io.to("managers").emit("time-off:created", { request });
    if (request.userId) {
      this.io.to(`user:${request.userId}`).emit("time-off:created", { request });
    }
    if (branchId) {
      this.io.to(`branch:${branchId}`).emit("time-off:created", { request });
    }
    // Also broadcast to shifts room so schedule views refresh
    this.io.to("shifts").emit("time-off:created", { request });
  }

  public broadcastTimeOffApproved(request: any) {
    if (request.userId) {
      this.io.to(`user:${request.userId}`).emit("time-off:approved", { request });
    }
    this.io.to("managers").emit("time-off:approved", { request });
    this.io.to("shifts").emit("time-off:approved", { request });
  }

  public broadcastTimeOffRejected(request: any) {
    if (request.userId) {
      this.io.to(`user:${request.userId}`).emit("time-off:rejected", { request });
    }
    this.io.to("managers").emit("time-off:rejected", { request });
    this.io.to("shifts").emit("time-off:rejected", { request });
  }

  public isUserOnline(userId: string): boolean {
    return this.userConnections.has(userId) && (this.userConnections.get(userId)?.size ?? 0) > 0;
  }

  public getUserConnections(userId: string): number {
    return this.userConnections.get(userId)?.size ?? 0;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default RealTimeManager;
