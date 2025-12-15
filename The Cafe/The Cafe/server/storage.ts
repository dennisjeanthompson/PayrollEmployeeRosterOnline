import { type User, type InsertUser, type Branch, type InsertBranch, type Shift, type InsertShift, type ShiftTrade, type InsertShiftTrade, type PayrollPeriod, type InsertPayrollPeriod, type PayrollEntry, type InsertPayrollEntry, type Approval, type InsertApproval, type TimeOffRequest, type InsertTimeOffRequest, type Notification, type InsertNotification, type DeductionSettings, type InsertDeductionSettings, type DeductionRate, type InsertDeductionRate, type AuditLog, type InsertAuditLog, type Holiday, type InsertHoliday } from "@shared/schema";
import { randomUUID } from "crypto";



export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsersByBranch(branchId: string): Promise<User[]>;
  getEmployees(branchId: string): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;

  // Branches
  getBranch(id: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  getAllBranches(): Promise<Branch[]>;
  updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch | undefined>;

  // Shifts
  createShift(shift: InsertShift): Promise<Shift>;
  getShift(id: string): Promise<Shift | undefined>;
  updateShift(id: string, shift: Partial<InsertShift>): Promise<Shift | undefined>;
  getShiftsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Shift[]>;
  getShiftsByBranch(branchId: string, startDate?: Date, endDate?: Date): Promise<Shift[]>;
  deleteShift(id: string): Promise<boolean>;

  // Shift Trades
  createShiftTrade(trade: InsertShiftTrade): Promise<ShiftTrade>;
  getShiftTrade(id: string): Promise<ShiftTrade | undefined>;
  updateShiftTrade(id: string, trade: Partial<InsertShiftTrade>): Promise<ShiftTrade | undefined>;
  getAvailableShiftTrades(branchId: string): Promise<ShiftTrade[]>;
  getPendingShiftTrades(branchId: string): Promise<ShiftTrade[]>;
  getShiftTradesByUser(userId: string): Promise<ShiftTrade[]>;

  // Payroll
  createPayrollPeriod(period: InsertPayrollPeriod): Promise<PayrollPeriod>;
  getPayrollPeriod(id: string): Promise<PayrollPeriod | undefined>;
  getPayrollPeriodsByBranch(branchId: string): Promise<PayrollPeriod[]>;
  // Convenience alias
  getPayrollPeriods(branchId: string): Promise<PayrollPeriod[]>;
  updatePayrollPeriod(id: string, period: Partial<InsertPayrollPeriod>): Promise<PayrollPeriod | undefined>;
  getCurrentPayrollPeriod(branchId: string): Promise<PayrollPeriod | undefined>;
  createPayrollEntry(entry: InsertPayrollEntry): Promise<PayrollEntry>;
  getPayrollEntry(id: string): Promise<PayrollEntry | undefined>;
  getPayrollEntriesByUser(userId: string, periodId?: string): Promise<PayrollEntry[]>;
  // Get entries by payroll period id
  getPayrollEntriesByPeriod(periodId: string): Promise<PayrollEntry[]>;
  updatePayrollEntry(id: string, entry: Partial<InsertPayrollEntry>): Promise<PayrollEntry | undefined>;
  deletePayrollEntry(id: string): Promise<void>;

  // Approvals
  createApproval(approval: InsertApproval): Promise<Approval>;
  updateApproval(id: string, approval: Partial<InsertApproval>): Promise<Approval | undefined>;
  getPendingApprovals(branchId: string): Promise<Approval[]>;

  // Time Off Requests
  createTimeOffRequest(request: InsertTimeOffRequest): Promise<TimeOffRequest>;
  getTimeOffRequest(id: string): Promise<TimeOffRequest | undefined>;
  updateTimeOffRequest(id: string, request: Partial<InsertTimeOffRequest>): Promise<TimeOffRequest | undefined>;
  getTimeOffRequestsByUser(userId: string): Promise<TimeOffRequest[]>;
  deleteTimeOffRequest(id: string): Promise<boolean>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: string): Promise<Notification | undefined>;
  updateNotification(id: string, notification: Partial<InsertNotification>): Promise<Notification | undefined>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<boolean>;

  // Deduction Settings
  getDeductionSettings(branchId: string): Promise<DeductionSettings | undefined>;
  createDeductionSettings(settings: InsertDeductionSettings): Promise<DeductionSettings>;
  updateDeductionSettings(id: string, settings: Partial<InsertDeductionSettings>): Promise<DeductionSettings | undefined>;

  // Deduction Rates (Admin-editable)
  getAllDeductionRates(): Promise<DeductionRate[]>;
  getDeductionRatesByType(type: string): Promise<DeductionRate[]>;
  getDeductionRate(id: string): Promise<DeductionRate | undefined>;
  createDeductionRate(rate: InsertDeductionRate): Promise<DeductionRate>;
  updateDeductionRate(id: string, rate: Partial<InsertDeductionRate>): Promise<DeductionRate | undefined>;
  deleteDeductionRate(id: string): Promise<boolean>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog & { id: string }): Promise<AuditLog>;
  getAuditLogs(params: {
    entityType?: string;
    action?: string;
    entityId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]>;
  getAuditLogStats(): Promise<{ totalLogs: number; byAction: Record<string, number>; byEntityType: Record<string, number> }>;

  // Reports helpers
  getPayrollEntriesForDateRange(branchId: string, startDate: Date, endDate: Date): Promise<PayrollEntry[]>;
  getEmployees(branchId: string): Promise<User[]>;


  // Holidays
  createHoliday(holiday: InsertHoliday): Promise<Holiday>;
  getHolidays(startDate?: Date, endDate?: Date): Promise<Holiday[]>;
  getHolidaysByYear(year: number): Promise<Holiday[]>;
  getHoliday(id: string): Promise<Holiday | undefined>;
  getHolidayByDate(date: Date): Promise<Holiday | undefined>;
  updateHoliday(id: string, holiday: Partial<InsertHoliday>): Promise<Holiday | undefined>;
  deleteHoliday(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private branches: Map<string, Branch> = new Map();
  private shifts: Map<string, Shift> = new Map();
  private shiftTrades: Map<string, ShiftTrade> = new Map();
  private payrollPeriods: Map<string, PayrollPeriod> = new Map();
  private payrollEntries: Map<string, PayrollEntry> = new Map();
  private approvals: Map<string, Approval> = new Map();
  private timeOffRequests: Map<string, TimeOffRequest> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private deductionSettings: Map<string, DeductionSettings> = new Map();
  private holidays: Map<string, Holiday> = new Map();
  private deductionRates: Map<string, DeductionRate> = new Map();
  private auditLogs: Map<string, AuditLog> = new Map();



  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Create default branch
    const branch: Branch = {
      id: "branch-1",
      name: "Downtown Branch",
      address: "123 Main St, Downtown",
      phone: "(555) 123-4567",
      isActive: true,
      createdAt: new Date(),
    };
    this.branches.set(branch.id, branch);

    // Create manager user
    const manager: User = {
      id: "user-1",
      username: "manager",
      password: "password123", // In real app, this would be hashed
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@thecafe.com",
      role: "manager",
      position: "Store Manager",
      hourlyRate: "25.00",
      branchId: branch.id,
      isActive: true,
      createdAt: new Date(),
      blockchainVerified: false,
      blockchainHash: null,
      verifiedAt: null,
      sssLoanDeduction: null,
      pagibigLoanDeduction: null,
      cashAdvanceDeduction: null,
      otherDeductions: null,
      philhealthDeduction: null,
    };
    this.users.set(manager.id, manager);

    // Create employee user
    const employee: User = {
      id: "user-2", 
      username: "employee",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@thecafe.com",
      role: "employee",
      position: "Barista",
      hourlyRate: "16.00",
      branchId: branch.id,
      isActive: true,
      createdAt: new Date(),
      blockchainVerified: false,
      blockchainHash: null,
      verifiedAt: null,
      sssLoanDeduction: null,
      pagibigLoanDeduction: null,
      cashAdvanceDeduction: null,
      otherDeductions: null,
      philhealthDeduction: null,
    };
    this.users.set(employee.id, employee);

    // Create sample shifts for testing
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Employee shift for today
    const todayShift: Shift = {
      id: "shift-1",
      userId: employee.id,
      branchId: branch.id,
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), // 9 AM
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0), // 5 PM
      position: "Barista",
      status: "scheduled",
      isRecurring: false,
      recurringPattern: null,
      createdAt: new Date(),
      actualStartTime: null,
      actualEndTime: null,
    };
    this.shifts.set(todayShift.id, todayShift);
    
    // Manager shift for today
    const managerShift: Shift = {
      id: "shift-2", 
      userId: manager.id,
      branchId: branch.id,
      startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0), // 8 AM
      endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0), // 4 PM
      position: "Store Manager",
      status: "scheduled",
      isRecurring: false,
      recurringPattern: null,
      createdAt: new Date(),
      actualStartTime: null,
      actualEndTime: null,
    };
    this.shifts.set(managerShift.id, managerShift);
    
    // Employee shift for tomorrow (for shift trading test)
    const tomorrowShift: Shift = {
      id: "shift-3",
      userId: employee.id,
      branchId: branch.id, 
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0), // 10 AM
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0), // 6 PM
      position: "Barista",
      status: "scheduled",
      isRecurring: false,
      recurringPattern: null,
      createdAt: new Date(),
      actualStartTime: null,
      actualEndTime: null,
    };
    this.shifts.set(tomorrowShift.id, tomorrowShift);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || 'employee',
      isActive: insertUser.isActive ?? true,
      blockchainVerified: false,
      blockchainHash: null,
      verifiedAt: null,
      sssLoanDeduction: null,
      pagibigLoanDeduction: null,
      cashAdvanceDeduction: null,
      otherDeductions: null,
      philhealthDeduction: null,
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByBranch(branchId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.branchId === branchId);
  }

  async getEmployees(branchId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => 
      user.branchId === branchId && user.role === 'employee'
    );
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const id = randomUUID();
    const branch: Branch = {
      ...insertBranch,
      id,
      createdAt: new Date(),
      phone: insertBranch.phone || null,
      isActive: insertBranch.isActive ?? true
    };
    this.branches.set(id, branch);
    return branch;
  }

  async getAllBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }

  async updateBranch(id: string, branchData: Partial<InsertBranch>): Promise<Branch | undefined> {
    const branch = this.branches.get(id);
    if (!branch) return undefined;

    const updatedBranch = { ...branch, ...branchData };
    this.branches.set(id, updatedBranch);
    return updatedBranch;
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const id = randomUUID();
    const shift: Shift = { 
      ...insertShift, 
      id, 
      createdAt: new Date(),
      status: insertShift.status || 'scheduled',
      isRecurring: insertShift.isRecurring ?? false,
      recurringPattern: insertShift.recurringPattern || null,
      actualStartTime: null,
      actualEndTime: null,
    };
    this.shifts.set(id, shift);
    return shift;
  }

  async getShift(id: string): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }

  async updateShift(id: string, shiftData: Partial<InsertShift>): Promise<Shift | undefined> {
    const shift = this.shifts.get(id);
    if (!shift) return undefined;
    
    const updatedShift = { ...shift, ...shiftData };
    this.shifts.set(id, updatedShift);
    return updatedShift;
  }

  async getShiftsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(shift => {
      if (shift.userId !== userId) return false;
      if (startDate && new Date(shift.startTime) < startDate) return false;
      if (endDate && new Date(shift.startTime) > endDate) return false;
      return true;
    });
  }

  async getShiftsByBranch(branchId: string, startDate?: Date, endDate?: Date): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(shift => {
      if (shift.branchId !== branchId) return false;
      if (startDate && new Date(shift.startTime) < startDate) return false;
      if (endDate && new Date(shift.startTime) > endDate) return false;
      return true;
    });
  }

  async deleteShift(id: string): Promise<boolean> {
    return this.shifts.delete(id);
  }

  async createShiftTrade(insertTrade: InsertShiftTrade): Promise<ShiftTrade> {
    const id = randomUUID();
    const trade: ShiftTrade = {
      ...insertTrade,
      id,
      fromUserId: insertTrade.fromUserId!,
      toUserId: insertTrade.toUserId || null,
      reason: insertTrade.reason || '',
      requestedAt: new Date(),
      approvedAt: null,
      status: insertTrade.status || 'pending',
      urgency: insertTrade.urgency || 'normal',
      notes: insertTrade.notes || null,
      approvedBy: insertTrade.approvedBy || null
    };
    this.shiftTrades.set(id, trade);
    return trade;
  }

  async getShiftTrade(id: string): Promise<ShiftTrade | undefined> {
    return this.shiftTrades.get(id);
  }

  async updateShiftTrade(id: string, tradeData: Partial<InsertShiftTrade>): Promise<ShiftTrade | undefined> {
    const trade = this.shiftTrades.get(id);
    if (!trade) return undefined;
    
    const updatedTrade = { ...trade, ...tradeData };
    this.shiftTrades.set(id, updatedTrade);
    return updatedTrade;
  }

  async getAvailableShiftTrades(branchId: string): Promise<ShiftTrade[]> {
    return Array.from(this.shiftTrades.values()).filter(trade => {
      // Get the shift to check branch
      const shift = this.shifts.get(trade.shiftId);
      return shift && shift.branchId === branchId && trade.status === 'pending';
    });
  }

  async getPendingShiftTrades(branchId: string): Promise<ShiftTrade[]> {
    return Array.from(this.shiftTrades.values()).filter(trade => {
      const shift = this.shifts.get(trade.shiftId);
      return shift && shift.branchId === branchId && trade.status === 'pending' && trade.toUserId !== null;
    });
  }

  async getShiftTradesByUser(userId: string): Promise<ShiftTrade[]> {
    return Array.from(this.shiftTrades.values()).filter(trade => 
      trade.fromUserId === userId || trade.toUserId === userId
    );
  }

  async createPayrollPeriod(insertPeriod: InsertPayrollPeriod): Promise<PayrollPeriod> {
    const id = randomUUID();
    const period: PayrollPeriod = { 
      ...insertPeriod, 
      id, 
      createdAt: new Date(),
      status: insertPeriod.status || 'open',
      totalHours: insertPeriod.totalHours || null,
      totalPay: insertPeriod.totalPay || null
    };
    this.payrollPeriods.set(id, period);
    this.payrollPeriods.set(id, period);
    return period;
  }

  async getPayrollPeriod(id: string): Promise<PayrollPeriod | undefined> {
    return this.payrollPeriods.get(id);
  }

  async createPayrollEntry(insertEntry: InsertPayrollEntry): Promise<PayrollEntry> {
    const id = randomUUID();
    const entry: PayrollEntry = { 
      ...insertEntry, 
      id, 
      createdAt: new Date(),
      status: insertEntry.status || 'pending',
      overtimeHours: insertEntry.overtimeHours || '0',
      nightDiffHours: insertEntry.nightDiffHours || '0',
      holidayPay: (insertEntry.holidayPay ?? null) as string | null,
      overtimePay: (insertEntry.overtimePay ?? null) as string | null,
      nightDiffPay: (insertEntry.nightDiffPay ?? null) as string | null,
      restDayPay: (insertEntry.restDayPay ?? null) as string | null,
      withholdingTax: (insertEntry.withholdingTax ?? null) as string | null,
      sssLoan: (insertEntry.sssLoan ?? null) as string | null,
      pagibigLoan: (insertEntry.pagibigLoan ?? null) as string | null,
      sssContribution: insertEntry.sssContribution || '0',
      philHealthContribution: insertEntry.philHealthContribution || '0',
      pagibigContribution: insertEntry.pagibigContribution || '0',
      totalDeductions: insertEntry.totalDeductions || '0',
      otherDeductions: insertEntry.otherDeductions || '0',
      deductions: insertEntry.deductions || '0',
      advances: (insertEntry.advances ?? null) as string | null,
      payBreakdown: (insertEntry.payBreakdown ?? null) as string | null,
      blockNumber: (insertEntry.blockNumber ?? null) as number | null,
      transactionHash: (insertEntry.transactionHash ?? null) as string | null,
      blockchainHash: (insertEntry.blockchainHash ?? null) as string | null,
      verified: false
    };
    this.payrollEntries.set(id, entry);
    return entry;
  }

  async getPayrollEntry(id: string): Promise<PayrollEntry | undefined> {
    return this.payrollEntries.get(id);
  }

  async getPayrollEntriesByPeriod(periodId: string): Promise<PayrollEntry[]> {
    return Array.from(this.payrollEntries.values()).filter(entry => entry.payrollPeriodId === periodId);
  }

  async getPayrollEntriesByUser(userId: string, periodId?: string): Promise<PayrollEntry[]> {
    return Array.from(this.payrollEntries.values()).filter(entry => {
      if (entry.userId !== userId) return false;
      if (periodId && entry.payrollPeriodId !== periodId) return false;
      return true;
    });
  }



  async getPayrollPeriodsByBranch(branchId: string): Promise<PayrollPeriod[]> {
    return Array.from(this.payrollPeriods.values()).filter(period => 
      period.branchId === branchId
    );
  }

  async updatePayrollPeriod(id: string, updateData: Partial<InsertPayrollPeriod>): Promise<PayrollPeriod | undefined> {
    const period = this.payrollPeriods.get(id);
    if (!period) return undefined;

    const updatedPeriod = { ...period, ...updateData };
    this.payrollPeriods.set(id, updatedPeriod);
    return updatedPeriod;
  }

  async getCurrentPayrollPeriod(branchId: string): Promise<PayrollPeriod | undefined> {
    return Array.from(this.payrollPeriods.values()).find(period => 
      period.branchId === branchId && period.status === "open"
    );
  }

  async updatePayrollEntry(id: string, updateData: Partial<InsertPayrollEntry>): Promise<PayrollEntry | undefined> {
    const entry = this.payrollEntries.get(id);
    if (!entry) return undefined;

    const updatedEntry = { ...entry, ...updateData };
    this.payrollEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deletePayrollEntry(id: string): Promise<void> {
    this.payrollEntries.delete(id);
  }

  async createApproval(insertApproval: InsertApproval): Promise<Approval> {
    const id = randomUUID();
    const approval: Approval = { 
      ...insertApproval, 
      id, 
      requestedAt: new Date(),
      respondedAt: null,
      status: insertApproval.status || 'pending',
      reason: insertApproval.reason || null,
      approvedBy: insertApproval.approvedBy || null,
      requestData: insertApproval.requestData || null
    };
    this.approvals.set(id, approval);
    return approval;
  }

  async updateApproval(id: string, approvalData: Partial<InsertApproval>): Promise<Approval | undefined> {
    const approval = this.approvals.get(id);
    if (!approval) return undefined;
    
    const updatedApproval = { ...approval, ...approvalData, respondedAt: new Date() };
    this.approvals.set(id, updatedApproval);
    return updatedApproval;
  }

  async getPendingApprovals(branchId: string): Promise<Approval[]> {
    return Array.from(this.approvals.values()).filter(approval => {
      if (approval.status !== "pending") return false;
      
      // Get the user who made the request to check their branch
      const user = this.users.get(approval.requestedBy);
      return user?.branchId === branchId;
    });
  }

  async createTimeOffRequest(insertRequest: InsertTimeOffRequest): Promise<TimeOffRequest> {
    const id = randomUUID();
    const request: TimeOffRequest = {
      ...insertRequest,
      id,
      requestedAt: new Date(),
      approvedAt: null,
      status: insertRequest.status || 'pending',
      approvedBy: insertRequest.approvedBy || null
    };
    this.timeOffRequests.set(id, request);
    return request;
  }

  async getTimeOffRequest(id: string): Promise<TimeOffRequest | undefined> {
    return this.timeOffRequests.get(id);
  }

  async updateTimeOffRequest(id: string, requestData: Partial<InsertTimeOffRequest>): Promise<TimeOffRequest | undefined> {
    const request = this.timeOffRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, ...requestData, approvedAt: new Date() };
    this.timeOffRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getTimeOffRequestsByUser(userId: string): Promise<TimeOffRequest[]> {
    return Array.from(this.timeOffRequests.values()).filter(request => request.userId === userId);
  }

  async deleteTimeOffRequest(id: string): Promise<boolean> {
    return this.timeOffRequests.delete(id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
      isRead: false,
      data: insertNotification.data || null
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async updateNotification(id: string, notificationData: Partial<InsertNotification>): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;

    const updatedNotification = { ...notification, ...notificationData };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead);

    userNotifications.forEach(notification => {
      notification.isRead = true;
      this.notifications.set(notification.id, notification);
    });
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification || notification.userId !== userId) {
      return false;
    }

    return this.notifications.delete(id);
  }

  // Deduction Settings
  async getDeductionSettings(branchId: string): Promise<DeductionSettings | undefined> {
    return Array.from(this.deductionSettings.values()).find(
      settings => settings.branchId === branchId
    );
  }

  async createDeductionSettings(insertSettings: InsertDeductionSettings): Promise<DeductionSettings> {
    const id = randomUUID();
    const settings: DeductionSettings = {
      ...insertSettings,
      id,
      deductSSS: insertSettings.deductSSS ?? null,
      deductPhilHealth: insertSettings.deductPhilHealth ?? null,
      deductPagibig: insertSettings.deductPagibig ?? null,
      deductWithholdingTax: insertSettings.deductWithholdingTax ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deductionSettings.set(id, settings);
    return settings;
  }

  async updateDeductionSettings(
    id: string,
    updateData: Partial<InsertDeductionSettings>
  ): Promise<DeductionSettings | undefined> {
    const settings = this.deductionSettings.get(id);
    if (!settings) return undefined;

    const updatedSettings = {
      ...settings,
      ...updateData,
      updatedAt: new Date(),
    };
    this.deductionSettings.set(id, updatedSettings);
    return updatedSettings;
  }

  // Deduction Rates methods
  async getAllDeductionRates(): Promise<DeductionRate[]> {
    return Array.from(this.deductionRates.values());
  }

  async getDeductionRatesByType(type: string): Promise<DeductionRate[]> {
    return Array.from(this.deductionRates.values()).filter(rate => rate.type === type);
  }

  async getDeductionRate(id: string): Promise<DeductionRate | undefined> {
    return this.deductionRates.get(id);
  }

  async createDeductionRate(rateData: InsertDeductionRate): Promise<DeductionRate> {
    const id = randomUUID();
    const rate: DeductionRate = {
      ...rateData,
      id,
      maxSalary: rateData.maxSalary ?? null,
      employeeRate: rateData.employeeRate ?? null,
      employeeContribution: rateData.employeeContribution ?? null,
      description: rateData.description ?? null,
      isActive: rateData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deductionRates.set(id, rate);
    return rate;
  }

  async updateDeductionRate(id: string, updateData: Partial<InsertDeductionRate>): Promise<DeductionRate | undefined> {
    const rate = this.deductionRates.get(id);
    if (!rate) return undefined;

    const updatedRate = {
      ...rate,
      ...updateData,
      updatedAt: new Date(),
    };
    this.deductionRates.set(id, updatedRate);
    return updatedRate;
  }

  async deleteDeductionRate(id: string): Promise<boolean> {
    return this.deductionRates.delete(id);
  }

  // Audit Log methods
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
    this.auditLogs.set(logData.id, log);
    return log;
  }

  async getAuditLogs(params: {
    entityType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    
    if (params.entityType) {
      logs = logs.filter(log => log.entityType === params.entityType);
    }
    if (params.action) {
      logs = logs.filter(log => log.action === params.action);
    }
    if (params.startDate) {
      logs = logs.filter(log => log.createdAt && new Date(log.createdAt) >= params.startDate!);
    }
    if (params.endDate) {
      logs = logs.filter(log => log.createdAt && new Date(log.createdAt) <= params.endDate!);
    }
    
    // Sort by date descending
    logs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    return logs.slice(offset, offset + limit);
  }

  async getAuditLogStats(): Promise<{ totalLogs: number; byAction: Record<string, number>; byEntityType: Record<string, number> }> {
    const logs = Array.from(this.auditLogs.values());
    const byAction: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    
    for (const log of logs) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
    }
    
    return { totalLogs: logs.length, byAction, byEntityType };
  }

  async getPayrollEntriesForDateRange(branchId: string, startDate: Date, endDate: Date): Promise<PayrollEntry[]> {
    const users = await this.getUsersByBranch(branchId);
    const userIds = new Set(users.map(u => u.id));
    
    return Array.from(this.payrollEntries.values()).filter(entry => {
      if (!userIds.has(entry.userId)) return false;
      if (!entry.createdAt) return false;
      const entryDate = new Date(entry.createdAt);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  async getPayrollPeriods(branchId: string): Promise<PayrollPeriod[]> {
    return this.getPayrollPeriodsByBranch(branchId);
  }

  // Holidays
  async createHoliday(holiday: InsertHoliday): Promise<Holiday> {
    const id = randomUUID();
    const newHoliday: Holiday = { 
      id,
      name: holiday.name,
      date: new Date(holiday.date),
      type: holiday.type,
      year: holiday.year,
      notes: holiday.notes ?? null,
      workAllowed: holiday.workAllowed ?? true,
      premiumOverride: holiday.premiumOverride ?? null,
      isRecurring: holiday.isRecurring ?? false,
      createdAt: new Date() 
    };
    this.holidays.set(id, newHoliday);
    return newHoliday;
  }

  async getHolidays(startDate?: Date, endDate?: Date): Promise<Holiday[]> {
    let holidays = Array.from(this.holidays.values());
    if (startDate && endDate) {
      holidays = holidays.filter(h => new Date(h.date) >= startDate && new Date(h.date) <= endDate);
    }
    return holidays;
  }

  async getHolidaysByYear(year: number): Promise<Holiday[]> {
    return Array.from(this.holidays.values()).filter(h => h.year === year);
  }

  async getHoliday(id: string): Promise<Holiday | undefined> {
    return this.holidays.get(id);
  }

  async getHolidayByDate(date: Date): Promise<Holiday | undefined> {
    const targetDate = new Date(date).toISOString().split('T')[0];
    return Array.from(this.holidays.values()).find(h => new Date(h.date).toISOString().split('T')[0] === targetDate);
  }

  async updateHoliday(id: string, holiday: Partial<InsertHoliday>): Promise<Holiday | undefined> {
    const existing = this.holidays.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...holiday };
    this.holidays.set(id, updated);
    return updated;
  }

  async deleteHoliday(id: string): Promise<boolean> {
    return this.holidays.delete(id);
  }
}

export const storage = new MemStorage();
