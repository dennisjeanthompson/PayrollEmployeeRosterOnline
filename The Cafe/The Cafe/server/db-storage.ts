import { db } from './db';
import { branches, users, shifts, shiftTrades, payrollPeriods, payrollEntries, approvals, timeOffRequests, notifications, setupStatus, deductionSettings, deductionRates, holidays, archivedPayrollPeriods, auditLogs, timeOffPolicy, adjustmentLogs, employeeDocuments } from '@shared/schema';
import type { IStorage } from './storage';
import type { User, InsertUser, Branch, InsertBranch, Shift, InsertShift, ShiftTrade, InsertShiftTrade, PayrollPeriod, InsertPayrollPeriod, PayrollEntry, InsertPayrollEntry, Approval, InsertApproval, TimeOffRequest, InsertTimeOffRequest, Notification, InsertNotification, DeductionSettings, InsertDeductionSettings, DeductionRate, InsertDeductionRate, Holiday, InsertHoliday, ArchivedPayrollPeriod, InsertArchivedPayrollPeriod, TimeOffPolicy, InsertTimeOffPolicy, AuditLog, InsertAuditLog, AdjustmentLog, InsertAdjustmentLog } from '@shared/schema';
import { eq, and, gte, lte, gt, lt, ne, desc, or, sql, isNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';



export class DatabaseStorage implements IStorage {
  // Setup Status
  async isSetupComplete(): Promise<boolean> {
    const status = await db.select().from(setupStatus).limit(1);
    return status.length > 0 && status[0].isSetupComplete === true;
  }

  async markSetupComplete(): Promise<void> {
    const existing = await db.select().from(setupStatus).limit(1);
    if (existing.length > 0) {
      await db.update(setupStatus)
        .set({ isSetupComplete: true, setupCompletedAt: new Date() })
        .where(eq(setupStatus.id, existing[0].id));
    } else {
      await db.insert(setupStatus).values({
        id: randomUUID(),
        isSetupComplete: true,
        setupCompletedAt: new Date(),
      });
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    console.log('Creating user:', user.username);
    console.log('Plain password length:', user.password.length);

    const hashedPassword = await bcrypt.hash(user.password, 10);
    console.log('Hashed password starts with:', hashedPassword.substring(0, 10));

    try {
      // Don't pass createdAt - let the database default handle it
      await db.insert(users).values({
        id,
        ...user,
        password: hashedPassword,
        // createdAt will be set by database default: sql`(unixepoch())`
      });

      console.log('User inserted, retrieving...');

      // Give the database a moment to commit
      const created = await this.getUser(id);
      if (!created) {
        console.error('User was inserted but could not be retrieved:', id);
        throw new Error('Failed to create user - database record not found after insertion');
      }

      console.log('User created successfully:', created.username);
      console.log('Stored password hash starts with:', created.password.substring(0, 10));

      return created;
    } catch (error: any) {
      console.error('Error in createUser:', error);
      
      // Improve error messages
      if (error.message?.includes('UNIQUE constraint')) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const updateData: any = { ...user };
    
    // Hash password if it's being updated
    if (user.password) {
      updateData.password = await bcrypt.hash(user.password, 10);
    }
    
    await db.update(users).set(updateData).where(eq(users.id, id));
    return this.getUser(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Check for existing shifts
      const userShifts = await this.getShiftsByUser(id);
      if (userShifts.length > 0) {
        throw new Error("Cannot delete employee with existing shifts. Deactivate them instead.");
      }

      // Check for existing payroll entries
      const userPayroll = await this.getPayrollEntriesByUser(id);
      if (userPayroll.length > 0) {
        throw new Error("Cannot delete employee with existing payroll records. Deactivate them instead.");
      }

      // Clean up remaining FK references before deleting user
      await db.delete(notifications).where(eq(notifications.userId, id));
      await db.delete(approvals).where(
        or(eq(approvals.requestedBy, id), eq(approvals.approvedBy, id))
      );
      await db.delete(employeeDocuments).where(
        or(eq(employeeDocuments.userId, id), eq(employeeDocuments.uploadedBy, id))
      );
      await db.delete(timeOffRequests).where(
        or(eq(timeOffRequests.userId, id), eq(timeOffRequests.approvedBy, id))
      );
      await db.delete(adjustmentLogs).where(
        or(eq(adjustmentLogs.employeeId, id), eq(adjustmentLogs.loggedBy, id), eq(adjustmentLogs.approvedBy, id))
      );

      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      // Re-throw specific errors so they can be handled by the route
      if (error.message.includes("Cannot delete employee")) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Force delete an employee and ALL their related data.
   * This is an admin-only operation that should be used with extreme caution.
   * Creates an audit log entry before deletion for compliance.
   * Uses a transaction to ensure atomicity.
   */
  async forceDeleteUser(id: string, performedBy: string, reason?: string): Promise<void> {
    // Get user info before deletion for audit log
    const userToDelete = await this.getUser(id);
    if (!userToDelete) {
      throw new Error('Employee not found');
    }

    // Use a transaction to ensure all deletes succeed or none do
    await db.transaction(async (tx) => {
      // 1. Create audit log entry FIRST (before any deletions)
      await tx.insert(auditLogs).values({
        id: randomUUID(),
        action: 'FORCE_DELETE_EMPLOYEE',
        entityType: 'employee',
        entityId: id,
        userId: performedBy,
        oldValues: JSON.stringify({
          username: userToDelete.username,
          firstName: userToDelete.firstName,
          lastName: userToDelete.lastName,
          email: userToDelete.email,
          position: userToDelete.position,
          branchId: userToDelete.branchId,
        }),
        newValues: null,
        reason: reason || 'Force deletion requested by admin',
        createdAt: new Date(),
      });

      // 2. Delete in reverse dependency order (most dependent first)
      
      // Delete shift trades (references shifts and users)
      await tx.delete(shiftTrades).where(
        or(
          eq(shiftTrades.fromUserId, id),
          eq(shiftTrades.toUserId, id),
          eq(shiftTrades.approvedBy, id)
        )
      );

      // Delete shifts
      await tx.delete(shifts).where(eq(shifts.userId, id));

      // Delete payroll entries
      await tx.delete(payrollEntries).where(eq(payrollEntries.userId, id));

      // Delete time off requests
      await tx.delete(timeOffRequests).where(
        or(
          eq(timeOffRequests.userId, id),
          eq(timeOffRequests.approvedBy, id)
        )
      );

      // Delete approvals
      await tx.delete(approvals).where(
        or(
          eq(approvals.requestedBy, id),
          eq(approvals.approvedBy, id)
        )
      );

      // Delete adjustment logs
      await tx.delete(adjustmentLogs).where(
        or(
          eq(adjustmentLogs.employeeId, id),
          eq(adjustmentLogs.loggedBy, id),
          eq(adjustmentLogs.approvedBy, id)
        )
      );

      // Delete employee documents
      await tx.delete(employeeDocuments).where(
        or(
          eq(employeeDocuments.userId, id),
          eq(employeeDocuments.uploadedBy, id)
        )
      );

      // Delete notifications
      await tx.delete(notifications).where(eq(notifications.userId, id));

      // Update archived payroll periods (set archivedBy to null instead of deleting)
      await tx.update(archivedPayrollPeriods)
        .set({ archivedBy: null })
        .where(eq(archivedPayrollPeriods.archivedBy, id));

      // 3. Finally delete the user
      await tx.delete(users).where(eq(users.id, id));
    });

    console.log(`🗑️ Force deleted employee: ${userToDelete.firstName} ${userToDelete.lastName} (${id}) by ${performedBy}`);
  }

  /**
   * Get all employee data for export before deletion (GDPR compliance)
   */
  async getEmployeeDataForExport(id: string): Promise<{
    employee: User;
    shifts: Shift[];
    payrollEntries: PayrollEntry[];
    timeOffRequests: TimeOffRequest[];
    shiftTrades: ShiftTrade[];
  } | null> {
    const employee = await this.getUser(id);
    if (!employee) return null;

    const employeeShifts = await this.getShiftsByUser(id);
    const employeePayroll = await this.getPayrollEntriesByUser(id);
    const employeeTimeOff = await this.getTimeOffRequestsByUser(id);
    const employeeShiftTrades = await this.getShiftTradesByUser(id);

    return {
      employee,
      shifts: employeeShifts,
      payrollEntries: employeePayroll,
      timeOffRequests: employeeTimeOff,
      shiftTrades: employeeShiftTrades,
    };
  }

  /**
   * Check if an employee has any related data (shifts, payroll, etc.)
   */
  async employeeHasRelatedData(id: string): Promise<{ hasShifts: boolean; hasPayroll: boolean; hasTotal: number }> {
    const userShifts = await this.getShiftsByUser(id);
    const payroll = await this.getPayrollEntriesByUser(id);
    const timeOff = await this.getTimeOffRequestsByUser(id);
    const trades = await this.getShiftTradesByUser(id);
    const adjLogs = await db.select().from(adjustmentLogs).where(eq(adjustmentLogs.employeeId, id));
    const docs = await db.select().from(employeeDocuments).where(eq(employeeDocuments.userId, id));
    
    const total = userShifts.length + payroll.length + timeOff.length + trades.length + adjLogs.length + docs.length;
    return {
      hasShifts: userShifts.length > 0,
      hasPayroll: payroll.length > 0,
      hasTotal: total,
    };
  }

  async getUsersByBranch(branchId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.branchId, branchId));
  }

  // Get all users across all branches (for admin/manager overview)
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Convenience: return only employees (role === 'employee') for a branch
  async getEmployees(branchId: string): Promise<User[]> {
    // Managers should also be visible in the roster for scheduling
    return this.getUsersByBranch(branchId);
  }

  // Branches
  async getBranch(id: string): Promise<Branch | undefined> {
    const result = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
    return result[0];
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const id = randomUUID();
    await db.insert(branches).values({
      id,
      ...branch,
      createdAt: new Date(),
    });
    
    const created = await this.getBranch(id);
    if (!created) throw new Error('Failed to create branch');
    return created;
  }

  async getAllBranches(): Promise<(Branch & { employeeCount: number })[]> {
    const allBranches = await db.select().from(branches);
    // Count employees for each branch
    const counts = await db
      .select({
        branchId: users.branchId,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .where(eq(users.isActive, true))
      .groupBy(users.branchId);
    
    const countMap = new Map(counts.map(c => [c.branchId, c.count]));
    return allBranches.map(b => ({
      ...b,
      employeeCount: countMap.get(b.id) || 0,
    }));
  }

  async updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch | undefined> {
    await db.update(branches).set(branch).where(eq(branches.id, id));
    return this.getBranch(id);
  }

  // Shifts
  
  /**
   * Check if a shift overlaps with existing shifts for the same user
   * Overlapping means: shift times intersect, even partially
   */
  async checkShiftOverlap(userId: string, startTime: Date, endTime: Date, excludeShiftId?: string): Promise<Shift | null> {
    const conditions = [
      eq(shifts.userId, userId),
      // Shift overlaps if: new_start < existing_end AND new_end > existing_start
      and(
        lt(shifts.startTime, endTime),
        gt(shifts.endTime, startTime)
      )
    ];

    if (excludeShiftId) {
      conditions.push(ne(shifts.id, excludeShiftId));
    }

    const query = db.select().from(shifts).where(and(...conditions));
    
    const result = await query.limit(1);
    return result[0] || null;
  }

  /**
   * Check if an employee already has a shift on a specific date
   */
  async checkShiftOnDate(userId: string, date: Date, excludeShiftId?: string): Promise<Shift[]> {
    // Get start and end of the day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const conditions = [
      eq(shifts.userId, userId),
      gte(shifts.startTime, dayStart),
      lte(shifts.startTime, dayEnd)
    ];

    if (excludeShiftId) {
      conditions.push(sql`${shifts.id} != ${excludeShiftId}`);
    }

    return db.select()
      .from(shifts)
      .where(and(...conditions))
      .orderBy(shifts.startTime);
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const id = randomUUID();
    await db.insert(shifts).values({
      id,
      ...shift,
      createdAt: new Date(),
    });
    
    const created = await this.getShift(id);
    if (!created) throw new Error('Failed to create shift');
    return created;
  }

  async getShift(id: string): Promise<Shift | undefined> {
    const result = await db.select().from(shifts).where(eq(shifts.id, id)).limit(1);
    return result[0];
  }

  async updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift | undefined> {
    await db.update(shifts).set(shift).where(eq(shifts.id, id));
    return this.getShift(id);
  }

  async getShiftsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Shift[]> {
    if (startDate && endDate) {
      return db.select().from(shifts).where(
        and(
          eq(shifts.userId, userId),
          gte(shifts.startTime, startDate),
          lte(shifts.startTime, endDate)
        )
      ).orderBy(shifts.startTime); // Sort by start time ascending for chronological order
    }
    
    return db.select().from(shifts)
      .where(eq(shifts.userId, userId))
      .orderBy(shifts.startTime);
  }

  async getShiftsByBranch(branchId: string, startDate?: Date, endDate?: Date): Promise<Shift[]> {
    if (startDate && endDate) {
      return db.select().from(shifts).where(
        and(
          eq(shifts.branchId, branchId),
          gte(shifts.startTime, startDate),
          lte(shifts.startTime, endDate)
        )
      );
    }
    
    return db.select().from(shifts).where(eq(shifts.branchId, branchId));
  }

  async deleteShift(id: string): Promise<boolean> {
    await db.delete(shifts).where(eq(shifts.id, id));
    return true;
  }

  // Shift Trades
  async createShiftTrade(trade: InsertShiftTrade): Promise<ShiftTrade> {
    const id = randomUUID();
    if (!trade.fromUserId || !trade.shiftId) {
      throw new Error('fromUserId and shiftId are required for shift trade');
    }
    
    await db.insert(shiftTrades).values({
      id,
      shiftId: trade.shiftId,
      fromUserId: trade.fromUserId,
      toUserId: trade.toUserId || null,
      reason: trade.reason,
      status: (trade.status || 'pending') as 'pending' | 'approved' | 'rejected',
      urgency: (trade.urgency || 'normal') as 'urgent' | 'normal' | 'low',
      notes: trade.notes || null,
      approvedAt: trade.approvedAt || null,
      approvedBy: trade.approvedBy || null,
    });
    
    const created = await this.getShiftTrade(id);
    if (!created) throw new Error('Failed to create shift trade');
    return created;
  }

  async getShiftTrade(id: string): Promise<ShiftTrade | undefined> {
    const result = await db.select().from(shiftTrades).where(eq(shiftTrades.id, id)).limit(1);
    return result[0];
  }

  async updateShiftTrade(id: string, trade: Partial<InsertShiftTrade>): Promise<ShiftTrade | undefined> {
    await db.update(shiftTrades).set(trade).where(eq(shiftTrades.id, id));
    return this.getShiftTrade(id);
  }

  async getAvailableShiftTrades(branchId: string): Promise<ShiftTrade[]> {
    // Get all pending trades for shifts in this branch that don't have a target user yet (open trades)
    const result = await db.select({
      trade: shiftTrades,
      shift: shifts,
    })
    .from(shiftTrades)
    .leftJoin(shifts, eq(shiftTrades.shiftId, shifts.id))
    .where(
      and(
        eq(shiftTrades.status, 'pending'),
        eq(shifts.branchId, branchId)
      )
    );
    
    // Filter to only trades without a target user (truly available)
    return result.map(r => r.trade).filter(t => !t.toUserId);
  }

  async getPendingShiftTrades(branchId: string): Promise<ShiftTrade[]> {
    // Get trades that are pending and have a target user (ready for approval)
    const result = await db.select({
      trade: shiftTrades,
      shift: shifts,
    })
    .from(shiftTrades)
    .leftJoin(shifts, eq(shiftTrades.shiftId, shifts.id))
    .where(
      and(
        eq(shiftTrades.status, 'pending'),
        eq(shifts.branchId, branchId)
      )
    );
    
    // Filter to only trades with a target user (pending approval)
    return result.map(r => r.trade).filter(t => t.toUserId !== null && t.toUserId !== undefined);
  }

  async getShiftTradesByUser(userId: string): Promise<ShiftTrade[]> {
    return db.select().from(shiftTrades).where(
      or(
        eq(shiftTrades.fromUserId, userId),
        eq(shiftTrades.toUserId, userId)
      )
    );
  }

  // Payroll
  async createPayrollPeriod(period: InsertPayrollPeriod): Promise<PayrollPeriod> {
    const id = randomUUID();
    await db.insert(payrollPeriods).values({
      id,
      ...period,
      createdAt: new Date(),
    });
    
    const created = await this.getPayrollPeriod(id);
    if (!created) throw new Error('Failed to create payroll period');
    return created;
  }

  async getPayrollPeriod(id: string): Promise<PayrollPeriod | undefined> {
    const result = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, id)).limit(1);
    return result[0];
  }

  async getPayrollPeriodsByBranch(branchId: string): Promise<PayrollPeriod[]> {
    return db.select().from(payrollPeriods)
      .where(eq(payrollPeriods.branchId, branchId))
      .orderBy(desc(payrollPeriods.createdAt));
  }

  // Convenience alias used by some routes
  async getPayrollPeriods(branchId: string): Promise<PayrollPeriod[]> {
    return this.getPayrollPeriodsByBranch(branchId);
  }

  async updatePayrollPeriod(id: string, period: Partial<InsertPayrollPeriod>): Promise<PayrollPeriod | undefined> {
    await db.update(payrollPeriods).set(period).where(eq(payrollPeriods.id, id));
    return this.getPayrollPeriod(id);
  }

  async getCurrentPayrollPeriod(branchId: string): Promise<PayrollPeriod | undefined> {
    const result = await db.select().from(payrollPeriods)
      .where(
        and(
          eq(payrollPeriods.branchId, branchId),
          eq(payrollPeriods.status, 'open')
        )
      )
      .limit(1);
    return result[0];
  }

  async createPayrollEntry(entry: InsertPayrollEntry): Promise<PayrollEntry> {
    const id = randomUUID();
    await db.insert(payrollEntries).values({
      id,
      ...entry,
      createdAt: new Date(),
    });
    
    const created = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id)).limit(1);
    if (!created[0]) throw new Error('Failed to create payroll entry');
    return created[0];
  }

  async getPayrollEntriesByUser(userId: string, periodId?: string): Promise<PayrollEntry[]> {
    if (periodId) {
      return db.select().from(payrollEntries).where(
        and(
          eq(payrollEntries.userId, userId),
          eq(payrollEntries.payrollPeriodId, periodId)
        )
      ).orderBy(desc(payrollEntries.createdAt));
    }
    return db.select().from(payrollEntries)
      .where(eq(payrollEntries.userId, userId))
      .orderBy(desc(payrollEntries.createdAt));
  }

  async getPayrollEntry(id: string): Promise<PayrollEntry | undefined> {
    const result = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id)).limit(1);
    return result[0];
  }

  // Get payroll entries by payroll period id
  async getPayrollEntriesByPeriod(periodId: string): Promise<PayrollEntry[]> {
    return db.select().from(payrollEntries).where(eq(payrollEntries.payrollPeriodId, periodId)).orderBy(desc(payrollEntries.createdAt));
  }

  async updatePayrollEntry(id: string, entry: Partial<InsertPayrollEntry>): Promise<PayrollEntry | undefined> {
    await db.update(payrollEntries).set(entry).where(eq(payrollEntries.id, id));
    const result = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id)).limit(1);
    return result[0];
  }

  async deletePayrollEntry(id: string): Promise<void> {
    await db.delete(payrollEntries).where(eq(payrollEntries.id, id));
  }

  // Approvals
  async createApproval(approval: InsertApproval): Promise<Approval> {
    const id = randomUUID();
    await db.insert(approvals).values({
      id,
      ...approval,
      requestedAt: new Date(),
    });
    
    const created = await db.select().from(approvals).where(eq(approvals.id, id)).limit(1);
    if (!created[0]) throw new Error('Failed to create approval');
    return created[0];
  }

  async updateApproval(id: string, approval: Partial<InsertApproval>): Promise<Approval | undefined> {
    await db.update(approvals).set({
      ...approval,
      respondedAt: new Date(),
    }).where(eq(approvals.id, id));
    const result = await db.select().from(approvals).where(eq(approvals.id, id)).limit(1);
    return result[0];
  }

  async getPendingApprovals(branchId: string): Promise<Approval[]> {
    // Get all pending approvals for users in this branch
    const result = await db.select({
      approval: approvals,
      user: users,
    })
    .from(approvals)
    .leftJoin(users, eq(approvals.requestedBy, users.id))
    .where(
      and(
        eq(approvals.status, 'pending'),
        eq(users.branchId, branchId)
      )
    );
    
    return result.map(r => r.approval);
  }

  // Time Off Requests
  async createTimeOffRequest(request: InsertTimeOffRequest): Promise<TimeOffRequest> {
    const id = randomUUID();
    await db.insert(timeOffRequests).values({
      id,
      ...request,
      requestedAt: new Date(),
    });
    
    const created = await db.select().from(timeOffRequests).where(eq(timeOffRequests.id, id)).limit(1);
    if (!created[0]) throw new Error('Failed to create time off request');
    return created[0] as TimeOffRequest;
  }

  async getTimeOffRequest(id: string): Promise<TimeOffRequest | undefined> {
    const result = await db.select().from(timeOffRequests).where(eq(timeOffRequests.id, id)).limit(1);
    return result[0] ? (result[0] as TimeOffRequest) : undefined;
  }

  async updateTimeOffRequest(id: string, request: Partial<InsertTimeOffRequest>): Promise<TimeOffRequest | undefined> {
    await db.update(timeOffRequests).set(request).where(eq(timeOffRequests.id, id));
    const result = await db.select().from(timeOffRequests).where(eq(timeOffRequests.id, id)).limit(1);
    return result[0] ? (result[0] as TimeOffRequest) : undefined;
  }

  async getTimeOffRequestsByUser(userId: string): Promise<TimeOffRequest[]> {
    const result = await db.select().from(timeOffRequests)
      .where(eq(timeOffRequests.userId, userId))
      .orderBy(desc(timeOffRequests.requestedAt));
    return result as TimeOffRequest[];
  }


  async deleteTimeOffRequest(id: string): Promise<boolean> {
    const result = await db.delete(timeOffRequests)
      .where(eq(timeOffRequests.id, id))
      .returning();
    return result.length > 0;
  }
  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const dataString = notification.data ? JSON.stringify(notification.data) : null;
    
    await db.insert(notifications).values({
      id,
      ...notification,
      data: dataString,
      createdAt: new Date(),
    });
    
    const created = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    if (!created[0]) throw new Error('Failed to create notification');
    
    const result = created[0];
    return {
      ...result,
      data: result.data ? JSON.parse(result.data) : null,
      createdAt: result.createdAt instanceof Date ? result.createdAt : (result.createdAt ? new Date(result.createdAt) : new Date()),
    } as Notification;
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const result = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    if (!result[0]) return undefined;
    
    let parsedData = null;
    if (result[0].data) {
      try {
        parsedData = typeof result[0].data === 'string' ? JSON.parse(result[0].data) : result[0].data;
      } catch (e) {
        parsedData = result[0].data;
      }
    }
    
    return {
      ...result[0],
      data: parsedData,
      createdAt: result[0].createdAt instanceof Date ? result[0].createdAt : (result[0].createdAt ? new Date(result[0].createdAt) : new Date()),
    } as Notification;
  }


  async getUserNotifications(userId: string): Promise<Notification[]> {
    const results = await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50); // Limit to last 50 notifications

    return results.map(n => {
      let parsedData = null;
      if (n.data) {
        try {
          parsedData = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
        } catch (e) {
          parsedData = n.data;
        }
      }
      return {
        ...n,
        data: parsedData,
        createdAt: n.createdAt instanceof Date ? n.createdAt : (n.createdAt ? new Date(n.createdAt) : new Date()),
      } as Notification;
    });
  }

  async markNotificationRead(id: string, userId: string): Promise<Notification | undefined> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
      
    return this.getNotification(id);
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async updateNotification(id: string, notification: Partial<InsertNotification>): Promise<Notification | undefined> {
    const updateData: any = { ...notification };
    if (notification.data) {
      updateData.data = JSON.stringify(notification.data);
    }
    
    await db.update(notifications).set(updateData).where(eq(notifications.id, id));
    return this.getNotification(id);
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const result = await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return result.map(n => {
      let parsedData = null;
      if (n.data) {
        try {
          parsedData = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
        } catch (e) {
          console.error('Error parsing notification data:', e, 'Data:', n.data);
          parsedData = n.data;
        }
      }
      return {
        ...n,
        data: parsedData,
        createdAt: n.createdAt instanceof Date ? n.createdAt : (n.createdAt ? new Date(n.createdAt) : new Date()),
      } as Notification;
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    await db.delete(notifications).where(
      and(
        eq(notifications.id, id),
        eq(notifications.userId, userId)
      )
    );
    return true;
  }

  // Deduction Settings
  async getDeductionSettings(branchId: string): Promise<DeductionSettings | undefined> {
    const result = await db
      .select()
      .from(deductionSettings)
      .where(eq(deductionSettings.branchId, branchId))
      .limit(1);
    return result[0];
  }

  async createDeductionSettings(insertSettings: InsertDeductionSettings): Promise<DeductionSettings> {
    const id = randomUUID();
    const now = new Date();
    
    // Prepare values, converting undefined to null for nullable fields
    const values = {
      id,
      branchId: insertSettings.branchId,
      deductSSS: insertSettings.deductSSS ?? null,
      deductPhilHealth: insertSettings.deductPhilHealth ?? null,
      deductPagibig: insertSettings.deductPagibig ?? null,
      deductWithholdingTax: insertSettings.deductWithholdingTax ?? null,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.insert(deductionSettings).values(values);
    return values as unknown as DeductionSettings;
  }

  async updateDeductionSettings(
    id: string,
    updateData: Partial<InsertDeductionSettings>
  ): Promise<DeductionSettings | undefined> {
    await db
      .update(deductionSettings)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(deductionSettings.id, id));

    const result = await db
      .select()
      .from(deductionSettings)
      .where(eq(deductionSettings.id, id))
      .limit(1);
    return result[0];
  }

  // Deduction Rates methods
  async getAllDeductionRates(): Promise<DeductionRate[]> {
    return await db.select().from(deductionRates);
  }

  async getActiveDeductionRates(): Promise<DeductionRate[]> {
    return await db
      .select()
      .from(deductionRates)
      .where(eq(deductionRates.isActive, true));
  }

  async getDeductionRatesByType(type: string): Promise<DeductionRate[]> {
    return await db
      .select()
      .from(deductionRates)
      .where(eq(deductionRates.type, type));
  }

  async getDeductionRate(id: string): Promise<DeductionRate | undefined> {
    const result = await db
      .select()
      .from(deductionRates)
      .where(eq(deductionRates.id, id))
      .limit(1);
    return result[0];
  }

  async createDeductionRate(rateData: InsertDeductionRate): Promise<DeductionRate> {
    const id = randomUUID();
    await db.insert(deductionRates).values({
      id,
      ...rateData,
    });

    const result = await db
      .select()
      .from(deductionRates)
      .where(eq(deductionRates.id, id))
      .limit(1);
    return result[0];
  }

  async updateDeductionRate(id: string, updateData: Partial<InsertDeductionRate>): Promise<DeductionRate | undefined> {
    await db
      .update(deductionRates)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(deductionRates.id, id));

    const result = await db
      .select()
      .from(deductionRates)
      .where(eq(deductionRates.id, id))
      .limit(1);
    return result[0];
  }

  async deleteDeductionRate(id: string): Promise<boolean> {
    const result = await db
      .delete(deductionRates)
      .where(eq(deductionRates.id, id));
    return true;
  }

  // Holidays
  async getHolidays(startDate?: Date, endDate?: Date): Promise<Holiday[]> {
    if (startDate && endDate) {
      return db.select().from(holidays).where(
        and(
          gte(holidays.date, startDate),
          lte(holidays.date, endDate)
        )
      );
    }
    return db.select().from(holidays);
  }

  async getHolidaysByYear(year: number): Promise<Holiday[]> {
    return db.select().from(holidays).where(eq(holidays.year, year));
  }

  async getHoliday(id: string): Promise<Holiday | undefined> {
    const result = await db.select().from(holidays).where(eq(holidays.id, id)).limit(1);
    return result[0];
  }

  async getHolidayByDate(date: Date): Promise<Holiday | undefined> {
    // Match by date (ignoring time component)
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const result = await db.select().from(holidays).where(
      and(
        gte(holidays.date, dayStart),
        lte(holidays.date, dayEnd)
      )
    ).limit(1);
    return result[0];
  }

  async createHoliday(holidayData: InsertHoliday): Promise<Holiday> {
    const id = randomUUID();
    const holiday: Holiday = {
      ...holidayData,
      id,
      isRecurring: holidayData.isRecurring ?? false,
      notes: holidayData.notes ?? null,
      workAllowed: holidayData.workAllowed ?? null,
      premiumOverride: holidayData.premiumOverride ?? null,
      createdAt: new Date()
    };
    await db.insert(holidays).values(holiday);
    return holiday;
  }

  async updateHoliday(id: string, holidayData: Partial<InsertHoliday>): Promise<Holiday | undefined> {
    await db.update(holidays).set(holidayData).where(eq(holidays.id, id));
    const result = await db.select().from(holidays).where(eq(holidays.id, id)).limit(1);
    return result[0];
  }

  async deleteHoliday(id: string): Promise<boolean> {
    await db.delete(holidays).where(eq(holidays.id, id));
    return true;
  }

  // Archived Payroll Periods
  async getArchivedPayrollPeriods(branchId: string): Promise<ArchivedPayrollPeriod[]> {
    return db.select().from(archivedPayrollPeriods).where(eq(archivedPayrollPeriods.branchId, branchId));
  }

  async archivePayrollPeriod(periodId: string, archivedBy: string, entriesSnapshot: string): Promise<ArchivedPayrollPeriod> {
    const period = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, periodId)).limit(1);
    if (!period[0]) throw new Error('Payroll period not found');

    const id = randomUUID();
    const archived: ArchivedPayrollPeriod = {
      id,
      originalPeriodId: periodId,
      branchId: period[0].branchId,
      startDate: period[0].startDate,
      endDate: period[0].endDate,
      status: period[0].status || 'closed',
      totalHours: period[0].totalHours,
      totalPay: period[0].totalPay,
      archivedAt: new Date(),
      archivedBy,
      entriesSnapshot
    };
    await db.insert(archivedPayrollPeriods).values(archived);
    return archived;
  }

  async getArchivedPayrollPeriod(id: string): Promise<ArchivedPayrollPeriod | undefined> {
    const result = await db.select().from(archivedPayrollPeriods).where(eq(archivedPayrollPeriods.id, id)).limit(1);
    return result[0];
  }

  // Time Off Policy Settings (with graceful fallback if table doesn't exist)
  async getTimeOffPolicyByBranch(branchId: string): Promise<TimeOffPolicy[]> {
    try {
      return await db.select().from(timeOffPolicy)
        .where(eq(timeOffPolicy.branchId, branchId));
    } catch (error: any) {
      // Table might not exist yet - return empty array
      console.warn('getTimeOffPolicyByBranch: Table may not exist, using defaults:', error.message);
      return [];
    }
  }

  async getTimeOffPolicyByType(branchId: string, leaveType: string): Promise<TimeOffPolicy | undefined> {
    try {
      const result = await db.select().from(timeOffPolicy)
        .where(and(
          eq(timeOffPolicy.branchId, branchId),
          eq(timeOffPolicy.leaveType, leaveType)
        ))
        .limit(1);
      return result[0];
    } catch (error: any) {
      // Table might not exist yet - return undefined (will use defaults)
      console.warn('getTimeOffPolicyByType: Table may not exist, using defaults:', error.message);
      return undefined;
    }
  }

  async upsertTimeOffPolicy(branchId: string, leaveType: string, minimumAdvanceDays: number): Promise<TimeOffPolicy> {
    try {
      // Check if policy exists for this branch and leave type
      const existing = await this.getTimeOffPolicyByType(branchId, leaveType);
      
      if (existing) {
        // Update existing policy
        await db.update(timeOffPolicy)
          .set({ minimumAdvanceDays, updatedAt: new Date() })
          .where(eq(timeOffPolicy.id, existing.id));
        const updated = await this.getTimeOffPolicyByType(branchId, leaveType);
        return updated!;
      } else {
        // Create new policy
        const id = randomUUID();
        await db.insert(timeOffPolicy).values({
          id,
          branchId,
          leaveType,
          minimumAdvanceDays,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const created = await this.getTimeOffPolicyByType(branchId, leaveType);
        if (!created) throw new Error('Failed to create time off policy');
        return created;
      }
    } catch (error: any) {
      // Table might not exist - return a virtual policy object
      console.warn('upsertTimeOffPolicy: Table may not exist:', error.message);
      return {
        id: 'virtual',
        branchId,
        leaveType,
        minimumAdvanceDays,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TimeOffPolicy;
    }
  }

  async initializeDefaultTimeOffPolicies(branchId: string): Promise<void> {
    // Default policies based on Philippine cafe practices
    // This is a no-op if the table doesn't exist - defaults will be used inline
    try {
      const defaults = [
        { leaveType: 'vacation', minimumAdvanceDays: 7 },
        { leaveType: 'sick', minimumAdvanceDays: 0 },
        { leaveType: 'emergency', minimumAdvanceDays: 0 },
        { leaveType: 'personal', minimumAdvanceDays: 3 },
        { leaveType: 'other', minimumAdvanceDays: 3 },
      ];
      
      for (const policy of defaults) {
        const existing = await this.getTimeOffPolicyByType(branchId, policy.leaveType);
        if (!existing) {
          await this.upsertTimeOffPolicy(branchId, policy.leaveType, policy.minimumAdvanceDays);
        }
      }
    } catch (error: any) {
      // Table might not exist yet - that's okay, we'll use inline defaults
      console.warn('initializeDefaultTimeOffPolicies: Table may not exist, using inline defaults:', error.message);
    }
  }

  // Archived Payroll Periods - Removing Duplicate
  // Implementation exists at line 948

  // Audit Logs
  async createAuditLog(logData: InsertAuditLog & { id: string }): Promise<AuditLog> {
    const log: AuditLog = {
      ...logData,
      createdAt: new Date(),
      oldValues: logData.oldValues ?? null,
      newValues: logData.newValues ?? null,
      ipAddress: logData.ipAddress ?? null,
      userAgent: logData.userAgent ?? null,
      reason: logData.reason ?? null,
    };
    await db.insert(auditLogs).values(log);
    return log;
  }

  async getAuditLogs(params: { branchId?: string; entityType?: string; action?: string; entityId?: string; userId?: string; startDate?: Date; endDate?: Date; limit?: number; offset?: number }): Promise<AuditLog[]> {
    const conditions = [];

    // Filter by branch via join with users if branchId is provided
    // For now, simpler implementation: ignore branchId if not strictly required or use subquery
    // Since we can't easily join in this structure without changing return type significantly or mapping
    // We'll filter by other params first.
    
    if (params.entityType) conditions.push(eq(auditLogs.entityType, params.entityType));
    if (params.action) conditions.push(eq(auditLogs.action, params.action));
    if (params.entityId) conditions.push(eq(auditLogs.entityId, params.entityId));
    if (params.userId) conditions.push(eq(auditLogs.userId, params.userId));
    if (params.startDate) conditions.push(gte(auditLogs.createdAt, params.startDate));
    if (params.endDate) conditions.push(lte(auditLogs.createdAt, params.endDate));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db.select().from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(params.limit || 50)
      .offset(params.offset || 0);

    return logs;
  }

  async getAuditLogStats(): Promise<{ totalLogs: number; byAction: Record<string, number>; byEntityType: Record<string, number> }> {
    // Global stats if no branchId provided in interface
    const actionCounts = await db.select({ 
      action: auditLogs.action, 
      count: sql<number>`count(*)` 
    })
    .from(auditLogs)
    .groupBy(auditLogs.action);

    const entityTypeCounts = await db.select({ 
      entityType: auditLogs.entityType, 
      count: sql<number>`count(*)` 
    })
    .from(auditLogs)
    .groupBy(auditLogs.entityType);

    const byAction: Record<string, number> = {};
    actionCounts.forEach(row => {
      byAction[row.action] = Number(row.count);
    });

    const byEntityType: Record<string, number> = {};
    entityTypeCounts.forEach(row => {
      if (row.entityType) byEntityType[row.entityType] = Number(row.count);
    });

    const totalLogs = actionCounts.reduce((acc, curr) => acc + Number(curr.count), 0);

    return { totalLogs, byAction, byEntityType };
  }

  async getPayrollEntriesForDateRange(branchId: string, startDate: Date, endDate: Date): Promise<PayrollEntry[]> {
    const result = await db.select({
      entry: payrollEntries
    })
    .from(payrollEntries)
    .innerJoin(payrollPeriods, eq(payrollEntries.payrollPeriodId, payrollPeriods.id))
    .where(
      and(
        eq(payrollPeriods.branchId, branchId),
        lte(payrollPeriods.startDate, endDate),
        gte(payrollPeriods.endDate, startDate)
      )
    );
    
    return result.map(r => r.entry);
  }

  // Adjustment Logs (Manual OT/Lateness/Exception Logging)
  async createAdjustmentLog(log: InsertAdjustmentLog): Promise<AdjustmentLog> {
    const id = randomUUID();
    const adjustmentLog: AdjustmentLog = {
      id,
      employeeId: log.employeeId,
      branchId: log.branchId,
      loggedBy: log.loggedBy,
      date: new Date(log.date),
      type: log.type,
      value: log.value,
      remarks: log.remarks ?? null,
      status: log.status ?? 'pending',
      verifiedByEmployee: log.verifiedByEmployee ?? false,
      verifiedAt: log.verifiedAt ?? null,
      approvedBy: log.approvedBy ?? null,
      approvedAt: log.approvedAt ?? null,
      payrollPeriodId: log.payrollPeriodId ?? null,
      calculatedAmount: log.calculatedAmount ?? null,
      createdAt: new Date(),
    };
    await db.insert(adjustmentLogs).values(adjustmentLog);
    return adjustmentLog;
  }

  async getAdjustmentLog(id: string): Promise<AdjustmentLog | undefined> {
    const result = await db.select().from(adjustmentLogs).where(eq(adjustmentLogs.id, id)).limit(1);
    return result[0];
  }

  async getAdjustmentLogsByEmployee(employeeId: string, startDate?: Date, endDate?: Date): Promise<AdjustmentLog[]> {
    const conditions = [eq(adjustmentLogs.employeeId, employeeId)];
    if (startDate) conditions.push(gte(adjustmentLogs.date, startDate));
    if (endDate) conditions.push(lte(adjustmentLogs.date, endDate));
    return db.select().from(adjustmentLogs).where(and(...conditions)).orderBy(desc(adjustmentLogs.date));
  }

  async getAdjustmentLogsByBranch(branchId: string, startDate?: Date, endDate?: Date): Promise<AdjustmentLog[]> {
    const conditions = [eq(adjustmentLogs.branchId, branchId)];
    if (startDate) conditions.push(gte(adjustmentLogs.date, startDate));
    if (endDate) conditions.push(lte(adjustmentLogs.date, endDate));
    return db.select().from(adjustmentLogs).where(and(...conditions)).orderBy(desc(adjustmentLogs.date));
  }

  async getPendingAdjustmentLogs(branchId: string): Promise<AdjustmentLog[]> {
    return db.select().from(adjustmentLogs).where(
      and(
        eq(adjustmentLogs.branchId, branchId),
        or(
          eq(adjustmentLogs.status, 'pending'),
          eq(adjustmentLogs.status, 'employee_verified')
        )
      )
    ).orderBy(desc(adjustmentLogs.date));
  }

  async updateAdjustmentLog(id: string, log: Partial<InsertAdjustmentLog>): Promise<AdjustmentLog | undefined> {
    await db.update(adjustmentLogs).set(log).where(eq(adjustmentLogs.id, id));
    const result = await db.select().from(adjustmentLogs).where(eq(adjustmentLogs.id, id)).limit(1);
    return result[0];
  }

  async deleteAdjustmentLog(id: string): Promise<boolean> {
    await db.delete(adjustmentLogs).where(eq(adjustmentLogs.id, id));
    return true;
  }
}

export const dbStorage = new DatabaseStorage();
