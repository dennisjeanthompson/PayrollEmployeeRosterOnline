var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  dbPath: () => dbPath,
  recreateConnection: () => recreateConnection,
  sql: () => sql
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
function recreateConnection() {
  console.log("\u2139\uFE0F  Using Neon PostgreSQL - connection is managed automatically");
}
var pool, db, sql, dbPath;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL environment variable is required.\nGet a free PostgreSQL database at https://neon.tech\nThen add DATABASE_URL to your Render environment variables."
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool);
    sql = {
      exec: () => {
        console.warn("sql.exec not supported in PostgreSQL mode");
      },
      prepare: () => {
        console.warn("sql.prepare not supported in PostgreSQL mode");
      },
      close: () => pool.end()
    };
    dbPath = "";
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adjustmentLogComments: () => adjustmentLogComments,
  adjustmentLogs: () => adjustmentLogs,
  allowanceTypes: () => allowanceTypes,
  approvals: () => approvals,
  archivedPayrollPeriods: () => archivedPayrollPeriods,
  auditLogs: () => auditLogs,
  branches: () => branches,
  companySettings: () => companySettings,
  deMinimisYtd: () => deMinimisYtd,
  deductionRates: () => deductionRates,
  deductionSettings: () => deductionSettings,
  employeeDocuments: () => employeeDocuments,
  employeeTaxYtd: () => employeeTaxYtd,
  holidays: () => holidays,
  insertAdjustmentLogCommentSchema: () => insertAdjustmentLogCommentSchema,
  insertAdjustmentLogSchema: () => insertAdjustmentLogSchema,
  insertAllowanceTypeSchema: () => insertAllowanceTypeSchema,
  insertApprovalSchema: () => insertApprovalSchema,
  insertArchivedPayrollPeriodSchema: () => insertArchivedPayrollPeriodSchema,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertBranchSchema: () => insertBranchSchema,
  insertCompanySettingsSchema: () => insertCompanySettingsSchema,
  insertDeMinimisYtdSchema: () => insertDeMinimisYtdSchema,
  insertDeductionRatesSchema: () => insertDeductionRatesSchema,
  insertDeductionSettingsSchema: () => insertDeductionSettingsSchema,
  insertEmployeeTaxYtdSchema: () => insertEmployeeTaxYtdSchema,
  insertHolidaySchema: () => insertHolidaySchema,
  insertLeaveCreditsSchema: () => insertLeaveCreditsSchema,
  insertLoanRequestSchema: () => insertLoanRequestSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPayrollEntrySchema: () => insertPayrollEntrySchema,
  insertPayrollPeriodSchema: () => insertPayrollPeriodSchema,
  insertServiceChargePoolSchema: () => insertServiceChargePoolSchema,
  insertShiftSchema: () => insertShiftSchema,
  insertShiftTradeSchema: () => insertShiftTradeSchema,
  insertSssContributionTableSchema: () => insertSssContributionTableSchema,
  insertThirteenthMonthLedgerSchema: () => insertThirteenthMonthLedgerSchema,
  insertTimeOffPolicySchema: () => insertTimeOffPolicySchema,
  insertTimeOffRequestSchema: () => insertTimeOffRequestSchema,
  insertUserSchema: () => insertUserSchema,
  insertWageOrderSchema: () => insertWageOrderSchema,
  insertWorkerAllowanceSchema: () => insertWorkerAllowanceSchema,
  leaveCredits: () => leaveCredits,
  loanRequests: () => loanRequests,
  notifications: () => notifications,
  payrollEntries: () => payrollEntries,
  payrollPeriods: () => payrollPeriods,
  serviceChargePools: () => serviceChargePools,
  session: () => session,
  setupStatus: () => setupStatus,
  shiftTrades: () => shiftTrades,
  shifts: () => shifts,
  sssContributionTable: () => sssContributionTable,
  thirteenthMonthLedger: () => thirteenthMonthLedger,
  timeOffPolicy: () => timeOffPolicy,
  timeOffRequests: () => timeOffRequests,
  users: () => users,
  wageOrders: () => wageOrders,
  workerAllowances: () => workerAllowances
});
import { pgTable, text, boolean, timestamp, integer, numeric, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var session, branches, users, shifts, shiftTrades, payrollPeriods, payrollEntries, approvals, timeOffRequests, notifications, setupStatus, deductionSettings, deductionRates, holidays, archivedPayrollPeriods, companySettings, auditLogs, timeOffPolicy, employeeDocuments, adjustmentLogs, adjustmentLogComments, thirteenthMonthLedger, leaveCredits, loanRequests, sssContributionTable, wageOrders, allowanceTypes, workerAllowances, deMinimisYtd, employeeTaxYtd, insertBranchSchema, insertUserSchema, insertShiftSchema, insertShiftTradeSchema, insertPayrollPeriodSchema, insertPayrollEntrySchema, insertApprovalSchema, insertTimeOffRequestSchema, insertNotificationSchema, insertDeductionSettingsSchema, insertDeductionRatesSchema, insertHolidaySchema, insertArchivedPayrollPeriodSchema, insertAuditLogSchema, insertTimeOffPolicySchema, insertAdjustmentLogSchema, insertAdjustmentLogCommentSchema, insertThirteenthMonthLedgerSchema, insertLeaveCreditsSchema, insertLoanRequestSchema, insertCompanySettingsSchema, serviceChargePools, insertServiceChargePoolSchema, insertSssContributionTableSchema, insertWageOrderSchema, insertAllowanceTypeSchema, insertWorkerAllowanceSchema, insertDeMinimisYtdSchema, insertEmployeeTaxYtdSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    session = pgTable("session", {
      sid: text("sid").primaryKey(),
      sess: text("sess").notNull(),
      expire: timestamp("expire", { precision: 6 }).notNull()
    });
    branches = pgTable("branches", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      address: text("address").notNull(),
      phone: text("phone"),
      intentHolidayExempt: boolean("intent_holiday_exempt").default(false),
      // DOLE: Admin claims < 5 workers exemption
      establishmentType: text("establishment_type").default("other"),
      // 'retail', 'service', 'other'
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    users = pgTable("users", {
      id: text("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      email: text("email").notNull().unique(),
      role: text("role").notNull().default("employee"),
      position: text("position").notNull(),
      hourlyRate: text("hourly_rate").notNull(),
      dailyRate: text("daily_rate").default("0"),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      isActive: boolean("is_active").default(true),
      sssLoanDeduction: text("sss_loan_deduction").default("0"),
      pagibigLoanDeduction: text("pagibig_loan_deduction").default("0"),
      cashAdvanceDeduction: text("cash_advance_deduction").default("0"),
      philhealthDeduction: text("philhealth_deduction").default("0"),
      otherDeductions: text("other_deductions").default("0"),
      // Cloudinary photo fields
      photoUrl: text("photo_url"),
      photoPublicId: text("photo_public_id"),
      // Philippine government ID numbers (per-employee)
      tin: text("tin"),
      // BIR Tax Identification Number
      sssNumber: text("sss_number"),
      // SSS Member ID
      philhealthNumber: text("philhealth_number"),
      // PhilHealth Member Number
      pagibigNumber: text("pagibig_number"),
      // Pag-IBIG / HDMF Member Number
      // BIR Minimum Wage Earner exemption — if true, withholding tax is forced to ₱0.00
      isMwe: boolean("is_mwe").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    shifts = pgTable("shifts", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      startTime: timestamp("start_time").notNull(),
      endTime: timestamp("end_time").notNull(),
      position: text("position").notNull(),
      isRecurring: boolean("is_recurring").default(false),
      recurringPattern: text("recurring_pattern"),
      status: text("status").default("scheduled"),
      actualStartTime: timestamp("actual_start_time"),
      actualEndTime: timestamp("actual_end_time"),
      createdAt: timestamp("created_at").defaultNow()
    });
    shiftTrades = pgTable("shift_trades", {
      id: text("id").primaryKey(),
      shiftId: text("shift_id").references(() => shifts.id).notNull(),
      fromUserId: text("from_user_id").references(() => users.id).notNull(),
      toUserId: text("to_user_id").references(() => users.id),
      reason: text("reason").notNull(),
      status: text("status").default("pending"),
      urgency: text("urgency").default("normal"),
      notes: text("notes"),
      requestedAt: timestamp("requested_at").defaultNow(),
      approvedAt: timestamp("approved_at"),
      approvedBy: text("approved_by").references(() => users.id)
    });
    payrollPeriods = pgTable("payroll_periods", {
      id: text("id").primaryKey(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      payDate: timestamp("pay_date"),
      // Pay Date for DOLE 16-day limit
      status: text("status").default("open"),
      totalHours: text("total_hours"),
      totalPay: text("total_pay"),
      createdAt: timestamp("created_at").defaultNow()
    });
    payrollEntries = pgTable("payroll_entries", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      payrollPeriodId: text("payroll_period_id").references(() => payrollPeriods.id).notNull(),
      totalHours: text("total_hours").notNull(),
      regularHours: text("regular_hours").notNull(),
      overtimeHours: text("overtime_hours").default("0"),
      nightDiffHours: text("night_diff_hours").default("0"),
      basicPay: text("basic_pay").notNull(),
      holidayPay: text("holiday_pay").default("0"),
      overtimePay: text("overtime_pay").default("0"),
      nightDiffPay: text("night_diff_pay").default("0"),
      restDayPay: text("rest_day_pay").default("0"),
      grossPay: text("gross_pay").notNull(),
      sssContribution: text("sss_contribution").default("0"),
      sssLoan: text("sss_loan").default("0"),
      philHealthContribution: text("philhealth_contribution").default("0"),
      pagibigContribution: text("pagibig_contribution").default("0"),
      pagibigLoan: text("pagibig_loan").default("0"),
      withholdingTax: text("withholding_tax").default("0"),
      advances: text("advances").default("0"),
      otherDeductions: text("other_deductions").default("0"),
      totalDeductions: text("total_deductions").default("0"),
      deductions: text("deductions").default("0"),
      netPay: text("net_pay").notNull(),
      payBreakdown: text("pay_breakdown"),
      status: text("status").default("pending"),
      // RA 11360 — Service Charge share for this employee in this period
      serviceCharge: text("service_charge").default("0"),
      createdAt: timestamp("created_at").defaultNow(),
      paidAt: timestamp("paid_at")
    });
    approvals = pgTable("approvals", {
      id: text("id").primaryKey(),
      type: text("type").notNull(),
      requestId: text("request_id").notNull(),
      requestedBy: text("requested_by").references(() => users.id).notNull(),
      approvedBy: text("approved_by").references(() => users.id),
      status: text("status").default("pending"),
      reason: text("reason"),
      requestData: text("request_data"),
      requestedAt: timestamp("requested_at").defaultNow(),
      respondedAt: timestamp("responded_at")
    });
    timeOffRequests = pgTable("time_off_requests", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      type: text("type").notNull(),
      reason: text("reason").notNull(),
      status: text("status").default("pending"),
      isPaid: boolean("is_paid").default(false),
      requestedAt: timestamp("requested_at").defaultNow(),
      approvedAt: timestamp("approved_at"),
      approvedBy: text("approved_by").references(() => users.id),
      rejectionReason: text("rejection_reason")
    });
    notifications = pgTable("notifications", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      branchId: text("branch_id").references(() => branches.id),
      // Added branchId for filtering
      type: text("type").notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      isRead: boolean("is_read").default(false),
      data: text("data"),
      createdAt: timestamp("created_at").defaultNow()
    });
    setupStatus = pgTable("setup_status", {
      id: text("id").primaryKey(),
      isSetupComplete: boolean("is_setup_complete").default(false),
      setupCompletedAt: timestamp("setup_completed_at")
    });
    deductionSettings = pgTable("deduction_settings", {
      id: text("id").primaryKey(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      deductSSS: boolean("deduct_sss").default(true),
      deductPhilHealth: boolean("deduct_philhealth").default(false),
      deductPagibig: boolean("deduct_pagibig").default(false),
      deductWithholdingTax: boolean("deduct_withholding_tax").default(false),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    deductionRates = pgTable("deduction_rates", {
      id: text("id").primaryKey(),
      type: text("type").notNull(),
      minSalary: text("min_salary").notNull(),
      maxSalary: text("max_salary"),
      employeeRate: text("employee_rate"),
      employeeContribution: text("employee_contribution"),
      description: text("description"),
      isActive: boolean("is_active").default(true),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    holidays = pgTable("holidays", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      date: timestamp("date").notNull(),
      type: text("type").notNull(),
      // 'regular', 'special_non_working', 'special_working', 'company'
      year: integer("year").notNull(),
      isRecurring: boolean("is_recurring").default(false),
      workAllowed: boolean("work_allowed").default(true),
      // If false, blocks shift creation
      notes: text("notes"),
      // Admin notes for this holiday
      premiumOverride: text("premium_override"),
      // JSON: { "worked": 2.0, "overtime": 2.6 }
      createdAt: timestamp("created_at").defaultNow()
    });
    archivedPayrollPeriods = pgTable("archived_payroll_periods", {
      id: text("id").primaryKey(),
      originalPeriodId: text("original_period_id").notNull(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      status: text("status").notNull(),
      totalHours: text("total_hours"),
      totalPay: text("total_pay"),
      archivedAt: timestamp("archived_at").defaultNow(),
      archivedBy: text("archived_by").references(() => users.id),
      entriesSnapshot: text("entries_snapshot")
    });
    companySettings = pgTable("company_settings", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      tradeName: text("trade_name"),
      // DBA / trade name
      address: text("address").notNull(),
      city: text("city"),
      province: text("province"),
      zipCode: text("zip_code"),
      country: text("country").default("Philippines"),
      tin: text("tin").notNull(),
      // BIR Tax Identification Number
      sssEmployerNo: text("sss_employer_no"),
      // SSS Employer Number
      philhealthNo: text("philhealth_no"),
      // PhilHealth Employer Number
      pagibigNo: text("pagibig_no"),
      // Pag-IBIG Employer Number
      birRdo: text("bir_rdo"),
      // BIR Revenue District Office code
      secRegistration: text("sec_registration"),
      // SEC/DTI Registration Number
      phone: text("phone"),
      email: text("email"),
      website: text("website"),
      logoUrl: text("logo_url"),
      // Cloudinary or local URL
      logoPublicId: text("logo_public_id"),
      // Cloudinary public ID
      industry: text("industry").default("Food & Beverage"),
      payrollFrequency: text("payroll_frequency").default("semi-monthly"),
      // weekly, bi-weekly, semi-monthly, monthly
      paymentMethod: text("payment_method").default("Bank Transfer"),
      // Bank Transfer, Cash, Check, GCash, PayMaya
      bankName: text("bank_name"),
      bankAccountName: text("bank_account_name"),
      bankAccountNo: text("bank_account_no"),
      // stored masked in responses
      includeHolidayPay: boolean("include_holiday_pay").default(false),
      // Toggle DOLE holiday pay rules
      isActive: boolean("is_active").default(true),
      updatedBy: text("updated_by").references(() => users.id),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    auditLogs = pgTable("audit_logs", {
      id: text("id").primaryKey(),
      action: text("action").notNull(),
      // 'deduction_change', 'rate_update', 'payroll_process'
      entityType: text("entity_type").notNull(),
      // 'employee', 'deduction_rate', 'payroll_entry'
      entityId: text("entity_id").notNull(),
      userId: text("user_id").references(() => users.id).notNull(),
      // Who made the change
      oldValues: text("old_values"),
      // JSON string of previous values
      newValues: text("new_values"),
      // JSON string of new values
      reason: text("reason"),
      // Optional reason/note for the change
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow()
    });
    timeOffPolicy = pgTable("time_off_policy", {
      id: text("id").primaryKey(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      leaveType: text("leave_type").notNull(),
      // 'vacation', 'sick', 'emergency', 'personal', 'other'
      minimumAdvanceDays: integer("minimum_advance_days").notNull().default(0),
      isActive: boolean("is_active").default(true),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    employeeDocuments = pgTable("employee_documents", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      type: text("type").notNull(),
      // 'sss_id', 'philhealth_id', 'pagibig_id', 'tin_id', 'birth_certificate', 'proof_of_address', 'nbi_clearance', 'resume', 'diploma', 'other'
      name: text("name").notNull(),
      // Original filename
      publicId: text("public_id").notNull(),
      // Cloudinary public ID
      url: text("url").notNull(),
      // Cloudinary secure URL
      format: text("format"),
      // 'pdf', 'jpg', 'png', etc.
      size: integer("size"),
      // File size in bytes
      uploadedBy: text("uploaded_by").references(() => users.id),
      // Who uploaded it
      createdAt: timestamp("created_at").defaultNow()
    });
    adjustmentLogs = pgTable("adjustment_logs", {
      id: text("id").primaryKey(),
      employeeId: text("employee_id").references(() => users.id).notNull(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      loggedBy: text("logged_by").references(() => users.id).notNull(),
      // Manager who logged it
      startDate: timestamp("start_date"),
      // Date the exception started (nullable for backward compat)
      endDate: timestamp("end_date"),
      // Date the exception ended (nullable for backward compat)
      type: text("type").notNull(),
      // 'overtime', 'late', 'undertime', 'absent', 'rest_day_ot', 'special_holiday_ot', 'regular_holiday_ot', 'night_diff'
      // For overtime: hours (e.g., 2.0)
      // For lateness: minutes (e.g., 30)
      // For undertime: minutes
      value: text("value").notNull(),
      // Numeric value stored as text
      remarks: text("remarks"),
      // DOLE compliance: reason/context for the adjustment
      status: text("status").default("pending"),
      // 'pending', 'employee_verified', 'disputed', 'approved', 'rejected'
      rejectionReason: text("rejection_reason"),
      // Manager reason if rejected
      disputeReason: text("dispute_reason"),
      // Employee reason when disputing
      disputedAt: timestamp("disputed_at"),
      // When employee disputed
      verifiedByEmployee: boolean("verified_by_employee").default(false),
      verifiedAt: timestamp("verified_at"),
      approvedBy: text("approved_by").references(() => users.id),
      // Admin who approved for payroll
      approvedAt: timestamp("approved_at"),
      payrollPeriodId: text("payroll_period_id").references(() => payrollPeriods.id),
      // Linked when processed
      // Calculated amount (filled when payroll is processed)
      calculatedAmount: text("calculated_amount"),
      // Positive for OT, negative for late deduction
      isIncluded: boolean("is_included").default(true),
      // Toggle on/off for payroll inclusion
      createdAt: timestamp("created_at").defaultNow()
    });
    adjustmentLogComments = pgTable("adjustment_log_comments", {
      id: text("id").primaryKey(),
      adjustmentLogId: text("adjustment_log_id").references(() => adjustmentLogs.id).notNull(),
      userId: text("user_id").references(() => users.id).notNull(),
      message: text("message").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    thirteenthMonthLedger = pgTable("thirteenth_month_ledger", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      payrollPeriodId: text("payroll_period_id").references(() => payrollPeriods.id).notNull(),
      year: integer("year").notNull(),
      basicPayEarned: text("basic_pay_earned").notNull(),
      // Only basic pay — no OT/Holiday/NightDiff
      periodStartDate: timestamp("period_start_date").notNull(),
      periodEndDate: timestamp("period_end_date").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    leaveCredits = pgTable("leave_credits", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      year: integer("year").notNull(),
      // 'sil' | 'solo_parent' | 'vawc' | 'vacation' | 'sick' | 'other'
      leaveType: text("leave_type").notNull(),
      totalCredits: text("total_credits").notNull(),
      // Total days granted (e.g. '5.00')
      usedCredits: text("used_credits").default("0"),
      // Days consumed via approved time-off
      remainingCredits: text("remaining_credits").notNull(),
      // totalCredits - usedCredits
      grantedBy: text("granted_by").references(() => users.id),
      // Manager who granted
      notes: text("notes"),
      updatedAt: timestamp("updated_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    loanRequests = pgTable("loan_requests", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      loanType: text("loan_type").notNull(),
      // 'SSS' | 'Pag-IBIG'
      referenceNumber: text("reference_number").notNull(),
      accountNumber: text("account_number").notNull(),
      totalAmount: text("total_amount").notNull().default("0"),
      remainingBalance: text("remaining_balance").notNull().default("0"),
      monthlyAmortization: text("monthly_amortization").notNull(),
      deductionStartDate: timestamp("deduction_start_date").notNull(),
      status: text("status").default("pending"),
      // 'pending' | 'approved' | 'rejected' | 'completed'
      proofFileUrl: text("proof_file_url"),
      hrApprovalNote: text("hr_approval_note"),
      approvedBy: text("approved_by").references(() => users.id),
      approvedAt: timestamp("approved_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    sssContributionTable = pgTable("sss_contribution_table", {
      id: serial("id").primaryKey(),
      year: integer("year").notNull(),
      minCompensation: numeric("min_compensation", { precision: 12, scale: 4 }).notNull(),
      maxCompensation: numeric("max_compensation", { precision: 12, scale: 4 }).notNull(),
      monthlySalaryCredit: numeric("monthly_salary_credit", { precision: 12, scale: 4 }).notNull(),
      employeeShare: numeric("employee_share", { precision: 12, scale: 4 }).notNull(),
      employerShare: numeric("employer_share", { precision: 12, scale: 4 }).notNull(),
      ecContribution: numeric("ec_contribution", { precision: 12, scale: 4 }).notNull()
    });
    wageOrders = pgTable("wage_orders", {
      id: serial("id").primaryKey(),
      region: text("region").notNull(),
      effectiveDate: timestamp("effective_date").notNull(),
      dailyRate: numeric("daily_rate", { precision: 12, scale: 4 }).notNull(),
      isActive: boolean("is_active").default(true)
    });
    allowanceTypes = pgTable("allowance_types", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      isDeMinimis: boolean("is_de_minimis").default(true),
      ceilingType: text("ceiling_type"),
      // 'peso_monthly', 'peso_annual', 'days_annual'
      ceilingValue: numeric("ceiling_value", { precision: 12, scale: 4 })
    });
    workerAllowances = pgTable("worker_allowances", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      allowanceTypeId: text("allowance_type_id").references(() => allowanceTypes.id).notNull(),
      amount: numeric("amount", { precision: 12, scale: 4 }).notNull(),
      isActive: boolean("is_active").default(true)
    });
    deMinimisYtd = pgTable("de_minimis_ytd", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      year: integer("year").notNull(),
      allowanceTypeId: text("allowance_type_id").references(() => allowanceTypes.id).notNull(),
      amountGivenYtd: numeric("amount_given_ytd", { precision: 12, scale: 4 }).default("0")
    });
    employeeTaxYtd = pgTable("employee_tax_ytd", {
      id: text("id").primaryKey(),
      userId: text("user_id").references(() => users.id).notNull(),
      year: integer("year").notNull(),
      otherBenefitsYtd: numeric("other_benefits_ytd", { precision: 12, scale: 4 }).default("0"),
      thirteenthMonthYtd: numeric("thirteenth_month_ytd", { precision: 12, scale: 4 }).default("0"),
      grossCompensationYtd: numeric("gross_compensation_ytd", { precision: 12, scale: 4 }).default("0"),
      taxableCompensationYtd: numeric("taxable_compensation_ytd", { precision: 12, scale: 4 }).default("0"),
      taxWithheldYtd: numeric("tax_withheld_ytd", { precision: 12, scale: 4 }).default("0")
    });
    insertBranchSchema = createInsertSchema(branches).omit({
      id: true,
      createdAt: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true
    });
    insertShiftSchema = createInsertSchema(shifts).omit({
      id: true,
      createdAt: true
    }).extend({
      startTime: z.union([z.date(), z.string().pipe(z.coerce.date())]),
      endTime: z.union([z.date(), z.string().pipe(z.coerce.date())])
    });
    insertShiftTradeSchema = z.object({
      id: z.string().uuid().optional(),
      shiftId: z.string().uuid(),
      fromUserId: z.string().uuid().optional(),
      toUserId: z.string().uuid().optional(),
      reason: z.string().min(1, "Reason is required"),
      status: z.enum(["open", "pending", "accepted", "approved", "rejected", "cancelled"]).default("pending"),
      urgency: z.enum(["urgent", "normal", "low"]).default("normal"),
      notes: z.string().optional(),
      requestedAt: z.date().optional(),
      approvedAt: z.date().optional(),
      approvedBy: z.string().uuid().optional(),
      createdAt: z.date().optional(),
      updatedAt: z.date().optional()
    });
    insertPayrollPeriodSchema = createInsertSchema(payrollPeriods).omit({
      id: true,
      createdAt: true
    });
    insertPayrollEntrySchema = createInsertSchema(payrollEntries).omit({
      id: true,
      createdAt: true
    });
    insertApprovalSchema = createInsertSchema(approvals).omit({
      id: true,
      requestedAt: true,
      respondedAt: true
    });
    insertTimeOffRequestSchema = createInsertSchema(timeOffRequests).omit({
      id: true,
      requestedAt: true,
      approvedAt: true
    }).extend({
      startDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
      endDate: z.union([z.date(), z.string().pipe(z.coerce.date())])
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertDeductionSettingsSchema = createInsertSchema(deductionSettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertDeductionRatesSchema = createInsertSchema(deductionRates).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertHolidaySchema = createInsertSchema(holidays).omit({
      id: true,
      createdAt: true
    }).extend({
      date: z.union([z.date(), z.string().pipe(z.coerce.date())])
    });
    insertArchivedPayrollPeriodSchema = createInsertSchema(archivedPayrollPeriods).omit({
      id: true,
      archivedAt: true
    });
    insertAuditLogSchema = createInsertSchema(auditLogs).omit({
      id: true,
      createdAt: true
    });
    insertTimeOffPolicySchema = createInsertSchema(timeOffPolicy).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAdjustmentLogSchema = createInsertSchema(adjustmentLogs).omit({
      id: true,
      createdAt: true
    }).extend({
      startDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
      endDate: z.union([z.date(), z.string().pipe(z.coerce.date())])
    });
    insertAdjustmentLogCommentSchema = createInsertSchema(adjustmentLogComments).omit({
      id: true,
      createdAt: true
    });
    insertThirteenthMonthLedgerSchema = createInsertSchema(thirteenthMonthLedger).omit({
      id: true,
      createdAt: true
    }).extend({
      periodStartDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
      periodEndDate: z.union([z.date(), z.string().pipe(z.coerce.date())])
    });
    insertLeaveCreditsSchema = createInsertSchema(leaveCredits).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLoanRequestSchema = createInsertSchema(loanRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      deductionStartDate: z.union([z.date(), z.string().pipe(z.coerce.date())])
    });
    insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    serviceChargePools = pgTable("service_charge_pools", {
      id: text("id").primaryKey(),
      branchId: text("branch_id").references(() => branches.id).notNull(),
      payrollPeriodId: text("payroll_period_id").references(() => payrollPeriods.id).notNull(),
      totalCollected: text("total_collected").notNull(),
      distributedAt: timestamp("distributed_at"),
      status: text("status").default("pending"),
      // 'pending', 'distributed'
      createdAt: timestamp("created_at").defaultNow()
    });
    insertServiceChargePoolSchema = createInsertSchema(serviceChargePools).omit({
      id: true,
      createdAt: true
    });
    insertSssContributionTableSchema = createInsertSchema(sssContributionTable).omit({ id: true });
    insertWageOrderSchema = createInsertSchema(wageOrders).omit({ id: true });
    insertAllowanceTypeSchema = createInsertSchema(allowanceTypes).omit({ id: true });
    insertWorkerAllowanceSchema = createInsertSchema(workerAllowances).omit({ id: true });
    insertDeMinimisYtdSchema = createInsertSchema(deMinimisYtd).omit({ id: true });
    insertEmployeeTaxYtdSchema = createInsertSchema(employeeTaxYtd).omit({ id: true });
  }
});

// server/db-storage.ts
import { eq, and, gte, lte, gt, lt, ne, desc, or, sql as sql2 } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
var DatabaseStorage, dbStorage;
var init_db_storage = __esm({
  "server/db-storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    DatabaseStorage = class {
      // Setup Status
      async isSetupComplete() {
        const status = await db.select().from(setupStatus).limit(1);
        return status.length > 0 && status[0].isSetupComplete === true;
      }
      async markSetupComplete() {
        const existing = await db.select().from(setupStatus).limit(1);
        if (existing.length > 0) {
          await db.update(setupStatus).set({ isSetupComplete: true, setupCompletedAt: /* @__PURE__ */ new Date() }).where(eq(setupStatus.id, existing[0].id));
        } else {
          await db.insert(setupStatus).values({
            id: randomUUID(),
            isSetupComplete: true,
            setupCompletedAt: /* @__PURE__ */ new Date()
          });
        }
      }
      // Users
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
        return result[0];
      }
      async createUser(user) {
        const id = randomUUID();
        const hashedPassword = await bcrypt.hash(user.password, 10);
        try {
          await db.insert(users).values({
            id,
            ...user,
            password: hashedPassword
            // createdAt will be set by database default: sql`(unixepoch())`
          });
          const created = await this.getUser(id);
          if (!created) {
            console.error("User was inserted but could not be retrieved:", id);
            throw new Error("Failed to create user - database record not found after insertion");
          }
          return created;
        } catch (error) {
          console.error("Error in createUser:", error);
          if (error.message?.includes("UNIQUE constraint")) {
            throw new Error("Username or email already exists");
          }
          throw error;
        }
      }
      async updateUser(id, user) {
        const updateData = { ...user };
        if (user.password && typeof user.password === "string" && user.password.trim().length > 0) {
          updateData.password = await bcrypt.hash(user.password, 10);
        } else {
          delete updateData.password;
        }
        await db.update(users).set(updateData).where(eq(users.id, id));
        return this.getUser(id);
      }
      async deleteUser(id) {
        try {
          const userShifts = await this.getShiftsByUser(id);
          if (userShifts.length > 0) {
            throw new Error("Cannot delete employee with existing shifts. Deactivate them instead.");
          }
          const userPayroll = await this.getPayrollEntriesByUser(id);
          if (userPayroll.length > 0) {
            throw new Error("Cannot delete employee with existing payroll records. Deactivate them instead.");
          }
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
        } catch (error) {
          console.error("Error deleting user:", error);
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
      async forceDeleteUser(id, performedBy, reason) {
        const userToDelete = await this.getUser(id);
        if (!userToDelete) {
          throw new Error("Employee not found");
        }
        await db.transaction(async (tx) => {
          await tx.insert(auditLogs).values({
            id: randomUUID(),
            action: "FORCE_DELETE_EMPLOYEE",
            entityType: "employee",
            entityId: id,
            userId: performedBy,
            oldValues: JSON.stringify({
              username: userToDelete.username,
              firstName: userToDelete.firstName,
              lastName: userToDelete.lastName,
              email: userToDelete.email,
              position: userToDelete.position,
              branchId: userToDelete.branchId
            }),
            newValues: null,
            reason: reason || "Force deletion requested by admin",
            createdAt: /* @__PURE__ */ new Date()
          });
          await tx.delete(shiftTrades).where(
            or(
              eq(shiftTrades.fromUserId, id),
              eq(shiftTrades.toUserId, id),
              eq(shiftTrades.approvedBy, id)
            )
          );
          await tx.delete(shifts).where(eq(shifts.userId, id));
          await tx.delete(payrollEntries).where(eq(payrollEntries.userId, id));
          await tx.delete(timeOffRequests).where(
            or(
              eq(timeOffRequests.userId, id),
              eq(timeOffRequests.approvedBy, id)
            )
          );
          await tx.delete(approvals).where(
            or(
              eq(approvals.requestedBy, id),
              eq(approvals.approvedBy, id)
            )
          );
          await tx.delete(adjustmentLogs).where(
            or(
              eq(adjustmentLogs.employeeId, id),
              eq(adjustmentLogs.loggedBy, id),
              eq(adjustmentLogs.approvedBy, id)
            )
          );
          await tx.delete(employeeDocuments).where(
            or(
              eq(employeeDocuments.userId, id),
              eq(employeeDocuments.uploadedBy, id)
            )
          );
          await tx.delete(notifications).where(eq(notifications.userId, id));
          await tx.update(archivedPayrollPeriods).set({ archivedBy: null }).where(eq(archivedPayrollPeriods.archivedBy, id));
          await tx.delete(users).where(eq(users.id, id));
        });
        console.log(`\u{1F5D1}\uFE0F Force deleted employee: ${userToDelete.firstName} ${userToDelete.lastName} (${id}) by ${performedBy}`);
      }
      /**
       * Get all employee data for export before deletion (GDPR compliance)
       */
      async getEmployeeDataForExport(id) {
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
          shiftTrades: employeeShiftTrades
        };
      }
      /**
       * Check if an employee has any related data (shifts, payroll, etc.)
       */
      async employeeHasRelatedData(id) {
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
          hasTotal: total
        };
      }
      async getUsersByBranch(branchId) {
        return db.select().from(users).where(eq(users.branchId, branchId));
      }
      // Get all users across all branches (for admin/manager overview)
      async getAllUsers() {
        return db.select().from(users);
      }
      // Convenience: return only employees (role === 'employee') for a branch
      async getEmployees(branchId) {
        return this.getUsersByBranch(branchId);
      }
      // Branches
      async getBranch(id) {
        const result = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
        return result[0];
      }
      async createBranch(branch) {
        const id = randomUUID();
        await db.insert(branches).values({
          id,
          ...branch,
          createdAt: /* @__PURE__ */ new Date()
        });
        const created = await this.getBranch(id);
        if (!created) throw new Error("Failed to create branch");
        return created;
      }
      async getAllBranches() {
        const allBranches = await db.select().from(branches);
        const counts = await db.select({
          branchId: users.branchId,
          count: sql2`count(*)::int`
        }).from(users).where(eq(users.isActive, true)).groupBy(users.branchId);
        const countMap = new Map(counts.map((c) => [c.branchId, c.count]));
        return allBranches.map((b) => ({
          ...b,
          employeeCount: countMap.get(b.id) || 0
        }));
      }
      async updateBranch(id, branch) {
        await db.update(branches).set(branch).where(eq(branches.id, id));
        return this.getBranch(id);
      }
      // Shifts
      /**
       * Check if a shift overlaps with existing shifts for the same user
       * Overlapping means: shift times intersect, even partially
       */
      async checkShiftOverlap(userId, startTime, endTime, excludeShiftId) {
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
      async checkShiftOnDate(userId, date, excludeShiftId) {
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
          conditions.push(sql2`${shifts.id} != ${excludeShiftId}`);
        }
        return db.select().from(shifts).where(and(...conditions)).orderBy(shifts.startTime);
      }
      async createShift(shift) {
        const id = randomUUID();
        await db.insert(shifts).values({
          id,
          ...shift,
          createdAt: /* @__PURE__ */ new Date()
        });
        const created = await this.getShift(id);
        if (!created) throw new Error("Failed to create shift");
        return created;
      }
      async getShift(id) {
        const result = await db.select().from(shifts).where(eq(shifts.id, id)).limit(1);
        return result[0];
      }
      async updateShift(id, shift) {
        await db.update(shifts).set(shift).where(eq(shifts.id, id));
        return this.getShift(id);
      }
      async getShiftsByUser(userId, startDate, endDate) {
        if (startDate && endDate) {
          return db.select().from(shifts).where(
            and(
              eq(shifts.userId, userId),
              gte(shifts.startTime, startDate),
              lte(shifts.startTime, endDate)
            )
          ).orderBy(shifts.startTime);
        }
        return db.select().from(shifts).where(eq(shifts.userId, userId)).orderBy(shifts.startTime);
      }
      async getShiftsByBranch(branchId, startDate, endDate) {
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
      async deleteShift(id) {
        await db.delete(shifts).where(eq(shifts.id, id));
        return true;
      }
      // Shift Trades
      async createShiftTrade(trade) {
        const id = randomUUID();
        if (!trade.fromUserId || !trade.shiftId) {
          throw new Error("fromUserId and shiftId are required for shift trade");
        }
        await db.insert(shiftTrades).values({
          id,
          shiftId: trade.shiftId,
          fromUserId: trade.fromUserId,
          toUserId: trade.toUserId || null,
          reason: trade.reason,
          status: trade.status || "pending",
          urgency: trade.urgency || "normal",
          notes: trade.notes || null,
          approvedAt: trade.approvedAt || null,
          approvedBy: trade.approvedBy || null
        });
        const created = await this.getShiftTrade(id);
        if (!created) throw new Error("Failed to create shift trade");
        return created;
      }
      async getShiftTrade(id) {
        const result = await db.select().from(shiftTrades).where(eq(shiftTrades.id, id)).limit(1);
        return result[0];
      }
      async updateShiftTrade(id, trade) {
        await db.update(shiftTrades).set(trade).where(eq(shiftTrades.id, id));
        return this.getShiftTrade(id);
      }
      async getAvailableShiftTrades(branchId) {
        const result = await db.select({
          trade: shiftTrades,
          shift: shifts
        }).from(shiftTrades).leftJoin(shifts, eq(shiftTrades.shiftId, shifts.id)).where(
          and(
            eq(shiftTrades.status, "pending"),
            eq(shifts.branchId, branchId)
          )
        );
        return result.map((r) => r.trade).filter((t) => !t.toUserId);
      }
      async getPendingShiftTrades(branchId) {
        const result = await db.select({
          trade: shiftTrades,
          shift: shifts
        }).from(shiftTrades).leftJoin(shifts, eq(shiftTrades.shiftId, shifts.id)).where(
          and(
            eq(shiftTrades.status, "pending"),
            eq(shifts.branchId, branchId)
          )
        );
        return result.map((r) => r.trade).filter((t) => t.toUserId !== null && t.toUserId !== void 0);
      }
      async getShiftTradesByUser(userId) {
        return db.select().from(shiftTrades).where(
          or(
            eq(shiftTrades.fromUserId, userId),
            eq(shiftTrades.toUserId, userId)
          )
        );
      }
      // Payroll
      async createPayrollPeriod(period) {
        const id = randomUUID();
        await db.insert(payrollPeriods).values({
          id,
          ...period,
          createdAt: /* @__PURE__ */ new Date()
        });
        const created = await this.getPayrollPeriod(id);
        if (!created) throw new Error("Failed to create payroll period");
        return created;
      }
      async getPayrollPeriod(id) {
        const result = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, id)).limit(1);
        return result[0];
      }
      async getPayrollPeriodsByBranch(branchId) {
        return db.select().from(payrollPeriods).where(eq(payrollPeriods.branchId, branchId)).orderBy(desc(payrollPeriods.createdAt));
      }
      // Convenience alias used by some routes
      async getPayrollPeriods(branchId) {
        return this.getPayrollPeriodsByBranch(branchId);
      }
      async updatePayrollPeriod(id, period) {
        await db.update(payrollPeriods).set(period).where(eq(payrollPeriods.id, id));
        return this.getPayrollPeriod(id);
      }
      async deletePayrollPeriod(id) {
        await db.delete(payrollPeriods).where(eq(payrollPeriods.id, id));
      }
      async getCurrentPayrollPeriod(branchId) {
        const result = await db.select().from(payrollPeriods).where(
          and(
            eq(payrollPeriods.branchId, branchId),
            eq(payrollPeriods.status, "open")
          )
        ).limit(1);
        return result[0];
      }
      async createPayrollEntry(entry) {
        const id = randomUUID();
        await db.insert(payrollEntries).values({
          id,
          ...entry,
          createdAt: /* @__PURE__ */ new Date()
        });
        const created = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id)).limit(1);
        if (!created[0]) throw new Error("Failed to create payroll entry");
        return created[0];
      }
      async getPayrollEntriesByUser(userId, periodId) {
        if (periodId) {
          return db.select().from(payrollEntries).where(
            and(
              eq(payrollEntries.userId, userId),
              eq(payrollEntries.payrollPeriodId, periodId)
            )
          ).orderBy(desc(payrollEntries.createdAt));
        }
        return db.select().from(payrollEntries).where(eq(payrollEntries.userId, userId)).orderBy(desc(payrollEntries.createdAt));
      }
      async getPayrollEntry(id) {
        const result = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id)).limit(1);
        return result[0];
      }
      // Get payroll entries by payroll period id
      async getPayrollEntriesByPeriod(periodId) {
        return db.select().from(payrollEntries).where(eq(payrollEntries.payrollPeriodId, periodId)).orderBy(desc(payrollEntries.createdAt));
      }
      async updatePayrollEntry(id, entry) {
        await db.update(payrollEntries).set(entry).where(eq(payrollEntries.id, id));
        const result = await db.select().from(payrollEntries).where(eq(payrollEntries.id, id)).limit(1);
        return result[0];
      }
      async deletePayrollEntry(id) {
        await db.delete(payrollEntries).where(eq(payrollEntries.id, id));
      }
      // Approvals
      async createApproval(approval) {
        const id = randomUUID();
        await db.insert(approvals).values({
          id,
          ...approval,
          requestedAt: /* @__PURE__ */ new Date()
        });
        const created = await db.select().from(approvals).where(eq(approvals.id, id)).limit(1);
        if (!created[0]) throw new Error("Failed to create approval");
        return created[0];
      }
      async updateApproval(id, approval) {
        await db.update(approvals).set({
          ...approval,
          respondedAt: /* @__PURE__ */ new Date()
        }).where(eq(approvals.id, id));
        const result = await db.select().from(approvals).where(eq(approvals.id, id)).limit(1);
        return result[0];
      }
      async getPendingApprovals(branchId) {
        const result = await db.select({
          approval: approvals,
          user: users
        }).from(approvals).leftJoin(users, eq(approvals.requestedBy, users.id)).where(
          and(
            eq(approvals.status, "pending"),
            eq(users.branchId, branchId)
          )
        );
        return result.map((r) => ({
          ...r.approval,
          requestedByUser: r.user ? {
            id: r.user.id,
            firstName: r.user.firstName,
            lastName: r.user.lastName,
            username: r.user.username,
            position: r.user.position,
            photoUrl: r.user.photoUrl,
            branchId: r.user.branchId
          } : null
        }));
      }
      // Time Off Requests
      async createTimeOffRequest(request) {
        const id = randomUUID();
        await db.insert(timeOffRequests).values({
          id,
          ...request,
          requestedAt: /* @__PURE__ */ new Date()
        });
        const created = await db.select().from(timeOffRequests).where(eq(timeOffRequests.id, id)).limit(1);
        if (!created[0]) throw new Error("Failed to create time off request");
        return created[0];
      }
      async getTimeOffRequest(id) {
        const result = await db.select().from(timeOffRequests).where(eq(timeOffRequests.id, id)).limit(1);
        return result[0] ? result[0] : void 0;
      }
      async updateTimeOffRequest(id, request) {
        const existing = await db.select().from(timeOffRequests).where(eq(timeOffRequests.id, id)).limit(1);
        if (!existing[0]) return void 0;
        const updateData = { ...request };
        if (Object.prototype.hasOwnProperty.call(request, "status")) {
          updateData.approvedAt = request.status === "approved" ? existing[0].approvedAt ?? /* @__PURE__ */ new Date() : existing[0].approvedAt ?? null;
        }
        await db.update(timeOffRequests).set(updateData).where(eq(timeOffRequests.id, id));
        const result = await db.select().from(timeOffRequests).where(eq(timeOffRequests.id, id)).limit(1);
        return result[0] ? result[0] : void 0;
      }
      async getTimeOffRequestsByUser(userId) {
        const result = await db.select().from(timeOffRequests).where(eq(timeOffRequests.userId, userId)).orderBy(desc(timeOffRequests.requestedAt));
        return result;
      }
      async deleteTimeOffRequest(id) {
        const existing = await db.select().from(timeOffRequests).where(eq(timeOffRequests.id, id)).limit(1);
        if (!existing[0]) return false;
        await db.update(timeOffRequests).set({ status: "cancelled", isPaid: false }).where(eq(timeOffRequests.id, id));
        return true;
      }
      // Notifications
      async createNotification(notification) {
        const id = randomUUID();
        let branchId = notification.branchId;
        if (!branchId && notification.userId) {
          const userResult = await db.select({ branchId: users.branchId }).from(users).where(eq(users.id, notification.userId)).limit(1);
          if (userResult.length > 0) {
            branchId = userResult[0].branchId;
          }
        }
        const dataString = notification.data ? JSON.stringify(notification.data) : null;
        await db.insert(notifications).values({
          id,
          ...notification,
          branchId,
          data: dataString,
          createdAt: /* @__PURE__ */ new Date()
        });
        const created = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
        if (!created[0]) throw new Error("Failed to create notification");
        const result = created[0];
        return {
          ...result,
          data: result.data ? JSON.parse(result.data) : null,
          createdAt: result.createdAt instanceof Date ? result.createdAt : result.createdAt ? new Date(result.createdAt) : /* @__PURE__ */ new Date()
        };
      }
      async getNotification(id) {
        const result = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
        if (!result[0]) return void 0;
        let parsedData = null;
        if (result[0].data) {
          try {
            parsedData = typeof result[0].data === "string" ? JSON.parse(result[0].data) : result[0].data;
          } catch (e) {
            parsedData = result[0].data;
          }
        }
        return {
          ...result[0],
          data: parsedData,
          createdAt: result[0].createdAt instanceof Date ? result[0].createdAt : result[0].createdAt ? new Date(result[0].createdAt) : /* @__PURE__ */ new Date()
        };
      }
      async getUserNotifications(userId) {
        const results = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
        return results.map((n) => {
          let parsedData = null;
          if (n.data) {
            try {
              parsedData = typeof n.data === "string" ? JSON.parse(n.data) : n.data;
            } catch (e) {
              parsedData = n.data;
            }
          }
          return {
            ...n,
            data: parsedData,
            createdAt: n.createdAt instanceof Date ? n.createdAt : n.createdAt ? new Date(n.createdAt) : /* @__PURE__ */ new Date()
          };
        });
      }
      async markNotificationRead(id, userId) {
        await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
        return this.getNotification(id);
      }
      async markAllNotificationsRead(userId) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
      }
      async updateNotification(id, notification) {
        const updateData = { ...notification };
        if (notification.data) {
          updateData.data = JSON.stringify(notification.data);
        }
        await db.update(notifications).set(updateData).where(eq(notifications.id, id));
        return this.getNotification(id);
      }
      async getNotificationsByUser(userId) {
        const result = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
        return result.map((n) => {
          let parsedData = null;
          if (n.data) {
            try {
              parsedData = typeof n.data === "string" ? JSON.parse(n.data) : n.data;
            } catch (e) {
              console.error("Error parsing notification data:", e, "Data:", n.data);
              parsedData = n.data;
            }
          }
          return {
            ...n,
            data: parsedData,
            createdAt: n.createdAt instanceof Date ? n.createdAt : n.createdAt ? new Date(n.createdAt) : /* @__PURE__ */ new Date()
          };
        });
      }
      async markAllNotificationsAsRead(userId) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
      }
      async deleteNotification(id, userId) {
        await db.delete(notifications).where(
          and(
            eq(notifications.id, id),
            eq(notifications.userId, userId)
          )
        );
        return true;
      }
      // Deduction Settings
      async getDeductionSettings(branchId) {
        const result = await db.select().from(deductionSettings).where(eq(deductionSettings.branchId, branchId)).limit(1);
        return result[0];
      }
      async createDeductionSettings(insertSettings) {
        const id = randomUUID();
        const now = /* @__PURE__ */ new Date();
        const values = {
          id,
          branchId: insertSettings.branchId,
          deductSSS: insertSettings.deductSSS ?? null,
          deductPhilHealth: insertSettings.deductPhilHealth ?? null,
          deductPagibig: insertSettings.deductPagibig ?? null,
          deductWithholdingTax: insertSettings.deductWithholdingTax ?? null,
          createdAt: now,
          updatedAt: now
        };
        await db.insert(deductionSettings).values(values);
        return values;
      }
      async updateDeductionSettings(id, updateData) {
        await db.update(deductionSettings).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(deductionSettings.id, id));
        const result = await db.select().from(deductionSettings).where(eq(deductionSettings.id, id)).limit(1);
        return result[0];
      }
      // Deduction Rates methods
      async getAllDeductionRates() {
        return await db.select().from(deductionRates);
      }
      async getActiveDeductionRates() {
        return await db.select().from(deductionRates).where(eq(deductionRates.isActive, true));
      }
      async getDeductionRatesByType(type) {
        return await db.select().from(deductionRates).where(eq(deductionRates.type, type));
      }
      async getDeductionRate(id) {
        const result = await db.select().from(deductionRates).where(eq(deductionRates.id, id)).limit(1);
        return result[0];
      }
      async createDeductionRate(rateData) {
        const id = randomUUID();
        await db.insert(deductionRates).values({
          id,
          ...rateData
        });
        const result = await db.select().from(deductionRates).where(eq(deductionRates.id, id)).limit(1);
        return result[0];
      }
      async updateDeductionRate(id, updateData) {
        await db.update(deductionRates).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(deductionRates.id, id));
        const result = await db.select().from(deductionRates).where(eq(deductionRates.id, id)).limit(1);
        return result[0];
      }
      async deleteDeductionRate(id) {
        const result = await db.delete(deductionRates).where(eq(deductionRates.id, id));
        return true;
      }
      // Holidays
      async getHolidays(startDate, endDate) {
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
      async getHolidaysByYear(year) {
        return db.select().from(holidays).where(eq(holidays.year, year));
      }
      async getHoliday(id) {
        const result = await db.select().from(holidays).where(eq(holidays.id, id)).limit(1);
        return result[0];
      }
      async getHolidayByDate(date) {
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
      async createHoliday(holidayData) {
        const id = randomUUID();
        const holiday = {
          ...holidayData,
          id,
          isRecurring: holidayData.isRecurring ?? false,
          notes: holidayData.notes ?? null,
          workAllowed: holidayData.workAllowed ?? null,
          premiumOverride: holidayData.premiumOverride ?? null,
          createdAt: /* @__PURE__ */ new Date()
        };
        await db.insert(holidays).values(holiday);
        return holiday;
      }
      async updateHoliday(id, holidayData) {
        await db.update(holidays).set(holidayData).where(eq(holidays.id, id));
        const result = await db.select().from(holidays).where(eq(holidays.id, id)).limit(1);
        return result[0];
      }
      async deleteHoliday(id) {
        await db.delete(holidays).where(eq(holidays.id, id));
        return true;
      }
      // Archived Payroll Periods
      async getArchivedPayrollPeriods(branchId) {
        return db.select().from(archivedPayrollPeriods).where(eq(archivedPayrollPeriods.branchId, branchId));
      }
      async archivePayrollPeriod(periodId, archivedBy, entriesSnapshot) {
        const period = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, periodId)).limit(1);
        if (!period[0]) throw new Error("Payroll period not found");
        const id = randomUUID();
        const archived = {
          id,
          originalPeriodId: periodId,
          branchId: period[0].branchId,
          startDate: period[0].startDate,
          endDate: period[0].endDate,
          status: period[0].status || "closed",
          totalHours: period[0].totalHours,
          totalPay: period[0].totalPay,
          archivedAt: /* @__PURE__ */ new Date(),
          archivedBy,
          entriesSnapshot
        };
        await db.insert(archivedPayrollPeriods).values(archived);
        return archived;
      }
      async getArchivedPayrollPeriod(id) {
        const result = await db.select().from(archivedPayrollPeriods).where(eq(archivedPayrollPeriods.id, id)).limit(1);
        return result[0];
      }
      // Time Off Policy Settings (with graceful fallback if table doesn't exist)
      async getTimeOffPolicyByBranch(branchId) {
        try {
          return await db.select().from(timeOffPolicy).where(eq(timeOffPolicy.branchId, branchId));
        } catch (error) {
          console.warn("getTimeOffPolicyByBranch: Table may not exist, using defaults:", error.message);
          return [];
        }
      }
      async getTimeOffPolicyByType(branchId, leaveType) {
        try {
          const result = await db.select().from(timeOffPolicy).where(and(
            eq(timeOffPolicy.branchId, branchId),
            eq(timeOffPolicy.leaveType, leaveType)
          )).limit(1);
          return result[0];
        } catch (error) {
          console.warn("getTimeOffPolicyByType: Table may not exist, using defaults:", error.message);
          return void 0;
        }
      }
      async upsertTimeOffPolicy(branchId, leaveType, minimumAdvanceDays) {
        try {
          const existing = await this.getTimeOffPolicyByType(branchId, leaveType);
          if (existing) {
            await db.update(timeOffPolicy).set({ minimumAdvanceDays, updatedAt: /* @__PURE__ */ new Date() }).where(eq(timeOffPolicy.id, existing.id));
            const updated = await this.getTimeOffPolicyByType(branchId, leaveType);
            return updated;
          } else {
            const id = randomUUID();
            await db.insert(timeOffPolicy).values({
              id,
              branchId,
              leaveType,
              minimumAdvanceDays,
              isActive: true,
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            });
            const created = await this.getTimeOffPolicyByType(branchId, leaveType);
            if (!created) throw new Error("Failed to create time off policy");
            return created;
          }
        } catch (error) {
          console.warn("upsertTimeOffPolicy: Table may not exist:", error.message);
          return {
            id: "virtual",
            branchId,
            leaveType,
            minimumAdvanceDays,
            isActive: true,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          };
        }
      }
      async initializeDefaultTimeOffPolicies(branchId) {
        try {
          const defaults = [
            { leaveType: "vacation", minimumAdvanceDays: 7 },
            { leaveType: "sick", minimumAdvanceDays: 0 },
            { leaveType: "emergency", minimumAdvanceDays: 0 },
            { leaveType: "personal", minimumAdvanceDays: 3 },
            { leaveType: "other", minimumAdvanceDays: 3 }
          ];
          for (const policy of defaults) {
            const existing = await this.getTimeOffPolicyByType(branchId, policy.leaveType);
            if (!existing) {
              await this.upsertTimeOffPolicy(branchId, policy.leaveType, policy.minimumAdvanceDays);
            }
          }
        } catch (error) {
          console.warn("initializeDefaultTimeOffPolicies: Table may not exist, using inline defaults:", error.message);
        }
      }
      // Archived Payroll Periods - Removing Duplicate
      // Implementation exists at line 948
      // Audit Logs
      async createAuditLog(logData) {
        const log2 = {
          ...logData,
          createdAt: /* @__PURE__ */ new Date(),
          oldValues: logData.oldValues ?? null,
          newValues: logData.newValues ?? null,
          ipAddress: logData.ipAddress ?? null,
          userAgent: logData.userAgent ?? null,
          reason: logData.reason ?? null
        };
        await db.insert(auditLogs).values(log2);
        return log2;
      }
      async getAuditLogs(params) {
        const conditions = [];
        if (params.entityType) conditions.push(eq(auditLogs.entityType, params.entityType));
        if (params.action) conditions.push(eq(auditLogs.action, params.action));
        if (params.entityId) conditions.push(eq(auditLogs.entityId, params.entityId));
        if (params.userId) conditions.push(eq(auditLogs.userId, params.userId));
        if (params.startDate) conditions.push(gte(auditLogs.createdAt, params.startDate));
        if (params.endDate) conditions.push(lte(auditLogs.createdAt, params.endDate));
        const whereClause = conditions.length > 0 ? and(...conditions) : void 0;
        const logs = await db.select().from(auditLogs).where(whereClause).orderBy(desc(auditLogs.createdAt)).limit(params.limit || 50).offset(params.offset || 0);
        return logs;
      }
      async getAuditLogStats() {
        const actionCounts = await db.select({
          action: auditLogs.action,
          count: sql2`count(*)`
        }).from(auditLogs).groupBy(auditLogs.action);
        const entityTypeCounts = await db.select({
          entityType: auditLogs.entityType,
          count: sql2`count(*)`
        }).from(auditLogs).groupBy(auditLogs.entityType);
        const byAction = {};
        actionCounts.forEach((row2) => {
          byAction[row2.action] = Number(row2.count);
        });
        const byEntityType = {};
        entityTypeCounts.forEach((row2) => {
          if (row2.entityType) byEntityType[row2.entityType] = Number(row2.count);
        });
        const totalLogs = actionCounts.reduce((acc, curr) => acc + Number(curr.count), 0);
        return { totalLogs, byAction, byEntityType };
      }
      async getPayrollEntriesForDateRange(branchId, startDate, endDate) {
        const result = await db.select({
          entry: payrollEntries
        }).from(payrollEntries).innerJoin(payrollPeriods, eq(payrollEntries.payrollPeriodId, payrollPeriods.id)).where(
          and(
            eq(payrollPeriods.branchId, branchId),
            lte(payrollPeriods.startDate, endDate),
            gte(payrollPeriods.endDate, startDate)
          )
        );
        return result.map((r) => r.entry);
      }
      // Adjustment Logs (Manual OT/Lateness/Exception Logging)
      async createAdjustmentLog(log2) {
        const id = randomUUID();
        const adjustmentLog = {
          id,
          employeeId: log2.employeeId,
          branchId: log2.branchId,
          loggedBy: log2.loggedBy,
          startDate: new Date(log2.startDate),
          endDate: new Date(log2.endDate),
          type: log2.type,
          value: log2.value,
          remarks: log2.remarks ?? null,
          status: log2.status ?? "pending",
          verifiedByEmployee: log2.verifiedByEmployee ?? false,
          verifiedAt: log2.verifiedAt ?? null,
          approvedBy: log2.approvedBy ?? null,
          approvedAt: log2.approvedAt ?? null,
          payrollPeriodId: log2.payrollPeriodId ?? null,
          calculatedAmount: log2.calculatedAmount ?? null,
          rejectionReason: null,
          disputeReason: null,
          disputedAt: null,
          isIncluded: log2.isIncluded ?? true,
          createdAt: /* @__PURE__ */ new Date()
        };
        await db.insert(adjustmentLogs).values(adjustmentLog);
        return adjustmentLog;
      }
      async getAdjustmentLog(id) {
        const result = await db.select().from(adjustmentLogs).where(eq(adjustmentLogs.id, id)).limit(1);
        return result[0];
      }
      async getAdjustmentLogsByEmployee(employeeId, startDate, endDate) {
        const conditions = [eq(adjustmentLogs.employeeId, employeeId)];
        if (startDate) conditions.push(gte(adjustmentLogs.startDate, startDate));
        if (endDate) conditions.push(lte(adjustmentLogs.endDate, endDate));
        return db.select().from(adjustmentLogs).where(and(...conditions)).orderBy(desc(adjustmentLogs.startDate));
      }
      async getAdjustmentLogsByBranch(branchId, startDate, endDate) {
        const conditions = [eq(adjustmentLogs.branchId, branchId)];
        if (startDate) conditions.push(gte(adjustmentLogs.startDate, startDate));
        if (endDate) conditions.push(lte(adjustmentLogs.endDate, endDate));
        return db.select().from(adjustmentLogs).where(and(...conditions)).orderBy(desc(adjustmentLogs.startDate));
      }
      async getPendingAdjustmentLogs(branchId) {
        return db.select().from(adjustmentLogs).where(
          and(
            eq(adjustmentLogs.branchId, branchId),
            or(
              eq(adjustmentLogs.status, "pending"),
              eq(adjustmentLogs.status, "employee_verified")
            )
          )
        ).orderBy(desc(adjustmentLogs.startDate));
      }
      async updateAdjustmentLog(id, log2) {
        await db.update(adjustmentLogs).set(log2).where(eq(adjustmentLogs.id, id));
        const result = await db.select().from(adjustmentLogs).where(eq(adjustmentLogs.id, id)).limit(1);
        return result[0];
      }
      async deleteAdjustmentLog(id) {
        await db.delete(adjustmentLogs).where(eq(adjustmentLogs.id, id));
        return true;
      }
      // Company Settings
      async getCompanySettings() {
        const results = await db.select().from(companySettings).where(eq(companySettings.isActive, true)).limit(1);
        if (results.length > 0) return results[0];
        const all = await db.select().from(companySettings).limit(1);
        return all[0];
      }
      async createCompanySettings(settings) {
        const id = randomUUID();
        await db.insert(companySettings).values({ id, ...settings });
        const result = await db.select().from(companySettings).where(eq(companySettings.id, id)).limit(1);
        return result[0];
      }
      async updateCompanySettings(id, settings) {
        await db.update(companySettings).set({ ...settings, updatedAt: /* @__PURE__ */ new Date() }).where(eq(companySettings.id, id));
        const result = await db.select().from(companySettings).where(eq(companySettings.id, id)).limit(1);
        return result[0];
      }
      // Government Loans (Art. 113 Compliance)
      async createLoanRequest(data) {
        const id = randomUUID();
        const result = await db.insert(loanRequests).values({
          id,
          ...data,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return result[0];
      }
      async getLoanRequestsByUser(userId) {
        return await db.select().from(loanRequests).where(eq(loanRequests.userId, userId)).orderBy(desc(loanRequests.createdAt));
      }
      async getLoanRequestsByBranch(branchId) {
        return await db.select().from(loanRequests).where(eq(loanRequests.branchId, branchId)).orderBy(desc(loanRequests.createdAt));
      }
      async getLoanRequest(id) {
        const result = await db.select().from(loanRequests).where(eq(loanRequests.id, id)).limit(1);
        return result[0];
      }
      async updateLoanRequest(id, status, hrApprovalNote, approvedBy) {
        const updateData = { status, updatedAt: /* @__PURE__ */ new Date() };
        if (hrApprovalNote !== void 0) updateData.hrApprovalNote = hrApprovalNote;
        if (approvedBy) {
          updateData.approvedBy = approvedBy;
          updateData.approvedAt = /* @__PURE__ */ new Date();
        }
        const result = await db.update(loanRequests).set(updateData).where(eq(loanRequests.id, id)).returning();
        return result[0];
      }
      async getActiveApprovedLoans(userId, targetDate) {
        return await db.select().from(loanRequests).where(
          and(
            eq(loanRequests.userId, userId),
            eq(loanRequests.status, "approved"),
            lte(loanRequests.deductionStartDate, targetDate)
          )
        );
      }
    };
    dbStorage = new DatabaseStorage();
  }
});

// server/storage.ts
import { randomUUID as randomUUID2 } from "crypto";
var MemStorage, storage2;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    MemStorage = class {
      users = /* @__PURE__ */ new Map();
      branches = /* @__PURE__ */ new Map();
      shifts = /* @__PURE__ */ new Map();
      shiftTrades = /* @__PURE__ */ new Map();
      payrollPeriods = /* @__PURE__ */ new Map();
      payrollEntries = /* @__PURE__ */ new Map();
      approvals = /* @__PURE__ */ new Map();
      timeOffRequests = /* @__PURE__ */ new Map();
      notifications = /* @__PURE__ */ new Map();
      deductionSettings = /* @__PURE__ */ new Map();
      holidays = /* @__PURE__ */ new Map();
      deductionRates = /* @__PURE__ */ new Map();
      auditLogs = /* @__PURE__ */ new Map();
      adjustmentLogs = /* @__PURE__ */ new Map();
      companySettingsStore = /* @__PURE__ */ new Map();
      loanRequests = /* @__PURE__ */ new Map();
      timeOffPolicies = /* @__PURE__ */ new Map();
      archivedPayrollPeriods = /* @__PURE__ */ new Map();
      setupComplete = false;
      constructor() {
        this.initializeData();
      }
      initializeData() {
        const branch = {
          id: "branch-1",
          name: "Downtown Branch",
          address: "123 Main St, Downtown",
          phone: "(555) 123-4567",
          isActive: true,
          createdAt: /* @__PURE__ */ new Date(),
          intentHolidayExempt: false,
          establishmentType: "other"
        };
        this.branches.set(branch.id, branch);
        const manager = {
          id: "user-1",
          username: "manager",
          password: "password123",
          // In real app, this would be hashed
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@thecafe.com",
          role: "manager",
          position: "Store Manager",
          hourlyRate: "25.00",
          branchId: branch.id,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date(),
          sssLoanDeduction: null,
          pagibigLoanDeduction: null,
          cashAdvanceDeduction: null,
          otherDeductions: null,
          philhealthDeduction: null,
          photoUrl: null,
          photoPublicId: null,
          tin: null,
          sssNumber: null,
          philhealthNumber: null,
          pagibigNumber: null,
          isMwe: false,
          dailyRate: "0"
        };
        this.users.set(manager.id, manager);
        const employee = {
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
          createdAt: /* @__PURE__ */ new Date(),
          sssLoanDeduction: null,
          pagibigLoanDeduction: null,
          cashAdvanceDeduction: null,
          otherDeductions: null,
          philhealthDeduction: null,
          photoUrl: null,
          photoPublicId: null,
          tin: null,
          sssNumber: null,
          philhealthNumber: null,
          pagibigNumber: null,
          isMwe: false,
          dailyRate: "0"
        };
        this.users.set(employee.id, employee);
        const today = /* @__PURE__ */ new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayShift = {
          id: "shift-1",
          userId: employee.id,
          branchId: branch.id,
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
          // 9 AM
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
          // 5 PM
          position: "Barista",
          status: "scheduled",
          isRecurring: false,
          recurringPattern: null,
          createdAt: /* @__PURE__ */ new Date(),
          actualStartTime: null,
          actualEndTime: null
        };
        this.shifts.set(todayShift.id, todayShift);
        const managerShift = {
          id: "shift-2",
          userId: manager.id,
          branchId: branch.id,
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0),
          // 8 AM
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
          // 4 PM
          position: "Store Manager",
          status: "scheduled",
          isRecurring: false,
          recurringPattern: null,
          createdAt: /* @__PURE__ */ new Date(),
          actualStartTime: null,
          actualEndTime: null
        };
        this.shifts.set(managerShift.id, managerShift);
        const tomorrowShift = {
          id: "shift-3",
          userId: employee.id,
          branchId: branch.id,
          startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
          // 10 AM
          endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0),
          // 6 PM
          position: "Barista",
          status: "scheduled",
          isRecurring: false,
          recurringPattern: null,
          createdAt: /* @__PURE__ */ new Date(),
          actualStartTime: null,
          actualEndTime: null
        };
        this.shifts.set(tomorrowShift.id, tomorrowShift);
      }
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find((user) => user.username === username);
      }
      async createUser(insertUser) {
        const id = randomUUID2();
        const user = {
          ...insertUser,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          role: insertUser.role || "employee",
          isActive: insertUser.isActive ?? true,
          sssLoanDeduction: null,
          pagibigLoanDeduction: null,
          cashAdvanceDeduction: null,
          otherDeductions: null,
          philhealthDeduction: null,
          photoUrl: insertUser.photoUrl ?? null,
          photoPublicId: insertUser.photoPublicId ?? null,
          tin: insertUser.tin ?? null,
          sssNumber: insertUser.sssNumber ?? null,
          philhealthNumber: insertUser.philhealthNumber ?? null,
          pagibigNumber: insertUser.pagibigNumber ?? null,
          isMwe: insertUser.isMwe ?? false,
          dailyRate: insertUser.dailyRate ?? "0"
        };
        this.users.set(id, user);
        return user;
      }
      async deleteUser(id) {
        return this.users.delete(id);
      }
      async updateUser(id, userData) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = { ...user, ...userData };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async getUsersByBranch(branchId) {
        return Array.from(this.users.values()).filter((user) => user.branchId === branchId);
      }
      async getEmployees(branchId) {
        return this.getUsersByBranch(branchId);
      }
      async getBranch(id) {
        return this.branches.get(id);
      }
      async createBranch(insertBranch) {
        const id = randomUUID2();
        const branch = {
          ...insertBranch,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          phone: insertBranch.phone || null,
          isActive: insertBranch.isActive ?? true,
          intentHolidayExempt: insertBranch.intentHolidayExempt ?? false,
          establishmentType: insertBranch.establishmentType ?? "other"
        };
        this.branches.set(id, branch);
        return branch;
      }
      async getAllBranches() {
        return Array.from(this.branches.values());
      }
      async updateBranch(id, branchData) {
        const branch = this.branches.get(id);
        if (!branch) return void 0;
        const updatedBranch = { ...branch, ...branchData };
        this.branches.set(id, updatedBranch);
        return updatedBranch;
      }
      async createShift(insertShift) {
        const id = randomUUID2();
        const shift = {
          ...insertShift,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          status: insertShift.status || "scheduled",
          isRecurring: insertShift.isRecurring ?? false,
          recurringPattern: insertShift.recurringPattern || null,
          actualStartTime: null,
          actualEndTime: null
        };
        this.shifts.set(id, shift);
        return shift;
      }
      async getShift(id) {
        return this.shifts.get(id);
      }
      async updateShift(id, shiftData) {
        const shift = this.shifts.get(id);
        if (!shift) return void 0;
        const updatedShift = { ...shift, ...shiftData };
        this.shifts.set(id, updatedShift);
        return updatedShift;
      }
      async getShiftsByUser(userId, startDate, endDate) {
        return Array.from(this.shifts.values()).filter((shift) => {
          if (shift.userId !== userId) return false;
          if (startDate && new Date(shift.startTime) < startDate) return false;
          if (endDate && new Date(shift.startTime) > endDate) return false;
          return true;
        });
      }
      async getShiftsByBranch(branchId, startDate, endDate) {
        return Array.from(this.shifts.values()).filter((shift) => {
          if (shift.branchId !== branchId) return false;
          if (startDate && new Date(shift.startTime) < startDate) return false;
          if (endDate && new Date(shift.startTime) > endDate) return false;
          return true;
        });
      }
      async deleteShift(id) {
        return this.shifts.delete(id);
      }
      async createShiftTrade(insertTrade) {
        const id = randomUUID2();
        const trade = {
          ...insertTrade,
          id,
          fromUserId: insertTrade.fromUserId,
          toUserId: insertTrade.toUserId || null,
          reason: insertTrade.reason || "",
          requestedAt: /* @__PURE__ */ new Date(),
          approvedAt: null,
          status: insertTrade.status || "pending",
          urgency: insertTrade.urgency || "normal",
          notes: insertTrade.notes || null,
          approvedBy: insertTrade.approvedBy || null
        };
        this.shiftTrades.set(id, trade);
        return trade;
      }
      async getShiftTrade(id) {
        return this.shiftTrades.get(id);
      }
      async updateShiftTrade(id, tradeData) {
        const trade = this.shiftTrades.get(id);
        if (!trade) return void 0;
        const updatedTrade = { ...trade, ...tradeData };
        this.shiftTrades.set(id, updatedTrade);
        return updatedTrade;
      }
      async getAvailableShiftTrades(branchId) {
        return Array.from(this.shiftTrades.values()).filter((trade) => {
          const shift = this.shifts.get(trade.shiftId);
          return shift && shift.branchId === branchId && trade.status === "pending";
        });
      }
      async getPendingShiftTrades(branchId) {
        return Array.from(this.shiftTrades.values()).filter((trade) => {
          const shift = this.shifts.get(trade.shiftId);
          return shift && shift.branchId === branchId && trade.status === "pending" && trade.toUserId !== null;
        });
      }
      async getShiftTradesByUser(userId) {
        return Array.from(this.shiftTrades.values()).filter(
          (trade) => trade.fromUserId === userId || trade.toUserId === userId
        );
      }
      async createPayrollPeriod(insertPeriod) {
        const id = randomUUID2();
        const period = {
          ...insertPeriod,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          status: insertPeriod.status || "open",
          totalHours: insertPeriod.totalHours || null,
          totalPay: insertPeriod.totalPay || null,
          payDate: insertPeriod.payDate || null
        };
        this.payrollPeriods.set(id, period);
        this.payrollPeriods.set(id, period);
        return period;
      }
      async getPayrollPeriod(id) {
        return this.payrollPeriods.get(id);
      }
      async createPayrollEntry(insertEntry) {
        const id = randomUUID2();
        const entry = {
          ...insertEntry,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          status: insertEntry.status || "pending",
          serviceCharge: insertEntry.serviceCharge ?? "0",
          overtimeHours: insertEntry.overtimeHours || "0",
          nightDiffHours: insertEntry.nightDiffHours || "0",
          holidayPay: insertEntry.holidayPay ?? null,
          overtimePay: insertEntry.overtimePay ?? null,
          nightDiffPay: insertEntry.nightDiffPay ?? null,
          restDayPay: insertEntry.restDayPay ?? null,
          withholdingTax: insertEntry.withholdingTax ?? null,
          sssLoan: insertEntry.sssLoan ?? null,
          pagibigLoan: insertEntry.pagibigLoan ?? null,
          sssContribution: insertEntry.sssContribution || "0",
          philHealthContribution: insertEntry.philHealthContribution || "0",
          pagibigContribution: insertEntry.pagibigContribution || "0",
          totalDeductions: insertEntry.totalDeductions || "0",
          otherDeductions: insertEntry.otherDeductions || "0",
          deductions: insertEntry.deductions || "0",
          advances: insertEntry.advances ?? null,
          payBreakdown: insertEntry.payBreakdown ?? null,
          paidAt: insertEntry.paidAt ?? null
        };
        this.payrollEntries.set(id, entry);
        return entry;
      }
      async getPayrollEntry(id) {
        return this.payrollEntries.get(id);
      }
      async getPayrollEntriesByPeriod(periodId) {
        return Array.from(this.payrollEntries.values()).filter((entry) => entry.payrollPeriodId === periodId);
      }
      async getPayrollEntriesByUser(userId, periodId) {
        return Array.from(this.payrollEntries.values()).filter((entry) => {
          if (entry.userId !== userId) return false;
          if (periodId && entry.payrollPeriodId !== periodId) return false;
          return true;
        });
      }
      async getPayrollPeriodsByBranch(branchId) {
        return Array.from(this.payrollPeriods.values()).filter(
          (period) => period.branchId === branchId
        );
      }
      async updatePayrollPeriod(id, updateData) {
        const period = this.payrollPeriods.get(id);
        if (!period) return void 0;
        const updatedPeriod = { ...period, ...updateData };
        this.payrollPeriods.set(id, updatedPeriod);
        return updatedPeriod;
      }
      async getCurrentPayrollPeriod(branchId) {
        return Array.from(this.payrollPeriods.values()).find(
          (period) => period.branchId === branchId && period.status === "open"
        );
      }
      async updatePayrollEntry(id, updateData) {
        const entry = this.payrollEntries.get(id);
        if (!entry) return void 0;
        const updatedEntry = { ...entry, ...updateData };
        this.payrollEntries.set(id, updatedEntry);
        return updatedEntry;
      }
      async deletePayrollEntry(id) {
        this.payrollEntries.delete(id);
      }
      async deletePayrollPeriod(id) {
        this.payrollPeriods.delete(id);
      }
      async createApproval(insertApproval) {
        const id = randomUUID2();
        const approval = {
          ...insertApproval,
          id,
          requestedAt: /* @__PURE__ */ new Date(),
          respondedAt: null,
          status: insertApproval.status || "pending",
          reason: insertApproval.reason || null,
          approvedBy: insertApproval.approvedBy || null,
          requestData: insertApproval.requestData || null
        };
        this.approvals.set(id, approval);
        return approval;
      }
      async updateApproval(id, approvalData) {
        const approval = this.approvals.get(id);
        if (!approval) return void 0;
        const updatedApproval = { ...approval, ...approvalData, respondedAt: /* @__PURE__ */ new Date() };
        this.approvals.set(id, updatedApproval);
        return updatedApproval;
      }
      async getPendingApprovals(branchId) {
        return Array.from(this.approvals.values()).filter((approval) => {
          if (approval.status !== "pending") return false;
          const user = this.users.get(approval.requestedBy);
          return user?.branchId === branchId;
        }).map((approval) => {
          const user = this.users.get(approval.requestedBy);
          return {
            ...approval,
            requestedByUser: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              position: user.position,
              photoUrl: user.photoUrl,
              branchId: user.branchId
            } : null
          };
        });
      }
      async createTimeOffRequest(insertRequest) {
        const id = randomUUID2();
        const request = {
          ...insertRequest,
          id,
          requestedAt: /* @__PURE__ */ new Date(),
          approvedAt: null,
          status: insertRequest.status || "pending",
          approvedBy: insertRequest.approvedBy || null,
          rejectionReason: insertRequest.rejectionReason ?? null,
          isPaid: false
        };
        this.timeOffRequests.set(id, request);
        return request;
      }
      async getTimeOffRequest(id) {
        return this.timeOffRequests.get(id);
      }
      async updateTimeOffRequest(id, requestData) {
        const request = this.timeOffRequests.get(id);
        if (!request) return void 0;
        const updatedRequest = { ...request, ...requestData };
        if (Object.prototype.hasOwnProperty.call(requestData, "status")) {
          updatedRequest.approvedAt = requestData.status === "approved" ? request.approvedAt ?? /* @__PURE__ */ new Date() : request.approvedAt ?? null;
        }
        this.timeOffRequests.set(id, updatedRequest);
        return updatedRequest;
      }
      async getTimeOffRequestsByUser(userId) {
        return Array.from(this.timeOffRequests.values()).filter((request) => request.userId === userId);
      }
      async deleteTimeOffRequest(id) {
        const request = this.timeOffRequests.get(id);
        if (!request) return false;
        this.timeOffRequests.set(id, {
          ...request,
          status: "cancelled",
          isPaid: false
        });
        return true;
      }
      async createNotification(insertNotification) {
        const id = randomUUID2();
        const notification = {
          ...insertNotification,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          isRead: false,
          data: insertNotification.data || null,
          branchId: insertNotification.branchId ?? null
        };
        this.notifications.set(id, notification);
        return notification;
      }
      async getNotification(id) {
        return this.notifications.get(id);
      }
      async updateNotification(id, notificationData) {
        const notification = this.notifications.get(id);
        if (!notification) return void 0;
        const updatedNotification = { ...notification, ...notificationData };
        this.notifications.set(id, updatedNotification);
        return updatedNotification;
      }
      async getNotificationsByUser(userId) {
        return Array.from(this.notifications.values()).filter((notification) => notification.userId === userId).sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
      async markAllNotificationsAsRead(userId) {
        const userNotifications = Array.from(this.notifications.values()).filter((notification) => notification.userId === userId && !notification.isRead);
        userNotifications.forEach((notification) => {
          notification.isRead = true;
          this.notifications.set(notification.id, notification);
        });
      }
      async deleteNotification(id, userId) {
        const notification = this.notifications.get(id);
        if (!notification || notification.userId !== userId) {
          return false;
        }
        return this.notifications.delete(id);
      }
      // Deduction Settings
      async getDeductionSettings(branchId) {
        return Array.from(this.deductionSettings.values()).find(
          (settings) => settings.branchId === branchId
        );
      }
      async createDeductionSettings(insertSettings) {
        const id = randomUUID2();
        const settings = {
          ...insertSettings,
          id,
          deductSSS: insertSettings.deductSSS ?? null,
          deductPhilHealth: insertSettings.deductPhilHealth ?? null,
          deductPagibig: insertSettings.deductPagibig ?? null,
          deductWithholdingTax: insertSettings.deductWithholdingTax ?? null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.deductionSettings.set(id, settings);
        return settings;
      }
      async updateDeductionSettings(id, updateData) {
        const settings = this.deductionSettings.get(id);
        if (!settings) return void 0;
        const updatedSettings = {
          ...settings,
          ...updateData,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.deductionSettings.set(id, updatedSettings);
        return updatedSettings;
      }
      // Deduction Rates methods
      async getAllDeductionRates() {
        return Array.from(this.deductionRates.values());
      }
      async getDeductionRatesByType(type) {
        return Array.from(this.deductionRates.values()).filter((rate) => rate.type === type);
      }
      async getDeductionRate(id) {
        return this.deductionRates.get(id);
      }
      async createDeductionRate(rateData) {
        const id = randomUUID2();
        const rate = {
          ...rateData,
          id,
          maxSalary: rateData.maxSalary ?? null,
          employeeRate: rateData.employeeRate ?? null,
          employeeContribution: rateData.employeeContribution ?? null,
          description: rateData.description ?? null,
          isActive: rateData.isActive ?? true,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.deductionRates.set(id, rate);
        return rate;
      }
      async updateDeductionRate(id, updateData) {
        const rate = this.deductionRates.get(id);
        if (!rate) return void 0;
        const updatedRate = {
          ...rate,
          ...updateData,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.deductionRates.set(id, updatedRate);
        return updatedRate;
      }
      async deleteDeductionRate(id) {
        return this.deductionRates.delete(id);
      }
      // Audit Log methods
      async createAuditLog(logData) {
        const log2 = {
          ...logData,
          createdAt: /* @__PURE__ */ new Date(),
          oldValues: logData.oldValues ?? null,
          newValues: logData.newValues ?? null,
          ipAddress: logData.ipAddress ?? null,
          userAgent: logData.userAgent ?? null,
          reason: logData.reason ?? null
        };
        this.auditLogs.set(logData.id, log2);
        return log2;
      }
      async getAuditLogs(params) {
        let logs = Array.from(this.auditLogs.values());
        if (params.entityType) {
          logs = logs.filter((log2) => log2.entityType === params.entityType);
        }
        if (params.action) {
          logs = logs.filter((log2) => log2.action === params.action);
        }
        if (params.startDate) {
          logs = logs.filter((log2) => log2.createdAt && new Date(log2.createdAt) >= params.startDate);
        }
        if (params.endDate) {
          logs = logs.filter((log2) => log2.createdAt && new Date(log2.createdAt) <= params.endDate);
        }
        logs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        const offset = params.offset || 0;
        const limit = params.limit || 50;
        return logs.slice(offset, offset + limit);
      }
      async getAuditLogStats() {
        const logs = Array.from(this.auditLogs.values());
        const byAction = {};
        const byEntityType = {};
        for (const log2 of logs) {
          byAction[log2.action] = (byAction[log2.action] || 0) + 1;
          byEntityType[log2.entityType] = (byEntityType[log2.entityType] || 0) + 1;
        }
        return { totalLogs: logs.length, byAction, byEntityType };
      }
      async getPayrollEntriesForDateRange(branchId, startDate, endDate) {
        const users2 = await this.getUsersByBranch(branchId);
        const userIds = new Set(users2.map((u) => u.id));
        return Array.from(this.payrollEntries.values()).filter((entry) => {
          if (!userIds.has(entry.userId)) return false;
          if (!entry.createdAt) return false;
          const entryDate = new Date(entry.createdAt);
          return entryDate >= startDate && entryDate <= endDate;
        });
      }
      async getPayrollPeriods(branchId) {
        return this.getPayrollPeriodsByBranch(branchId);
      }
      // Holidays
      async createHoliday(holiday) {
        const id = randomUUID2();
        const newHoliday = {
          id,
          name: holiday.name,
          date: new Date(holiday.date),
          type: holiday.type,
          year: holiday.year,
          notes: holiday.notes ?? null,
          workAllowed: holiday.workAllowed ?? true,
          premiumOverride: holiday.premiumOverride ?? null,
          isRecurring: holiday.isRecurring ?? false,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.holidays.set(id, newHoliday);
        return newHoliday;
      }
      async getHolidays(startDate, endDate) {
        let holidays2 = Array.from(this.holidays.values());
        if (startDate && endDate) {
          holidays2 = holidays2.filter((h) => new Date(h.date) >= startDate && new Date(h.date) <= endDate);
        }
        return holidays2;
      }
      async getHolidaysByYear(year) {
        return Array.from(this.holidays.values()).filter((h) => h.year === year);
      }
      async getHoliday(id) {
        return this.holidays.get(id);
      }
      async getHolidayByDate(date) {
        const targetDate = new Date(date).toISOString().substring(0, 10);
        return Array.from(this.holidays.values()).find((h) => new Date(h.date).toISOString().substring(0, 10) === targetDate);
      }
      async updateHoliday(id, holiday) {
        const existing = this.holidays.get(id);
        if (!existing) return void 0;
        const updated = { ...existing, ...holiday };
        this.holidays.set(id, updated);
        return updated;
      }
      async deleteHoliday(id) {
        return this.holidays.delete(id);
      }
      // Adjustment Logs (Manual OT/Lateness/Exception Logging)
      async createAdjustmentLog(log2) {
        const id = randomUUID2();
        const adjustmentLog = {
          id,
          employeeId: log2.employeeId,
          branchId: log2.branchId,
          loggedBy: log2.loggedBy,
          startDate: new Date(log2.startDate),
          endDate: new Date(log2.endDate),
          type: log2.type,
          value: log2.value,
          remarks: log2.remarks ?? null,
          status: log2.status ?? "pending",
          verifiedByEmployee: log2.verifiedByEmployee ?? false,
          verifiedAt: log2.verifiedAt ?? null,
          approvedBy: log2.approvedBy ?? null,
          approvedAt: log2.approvedAt ?? null,
          payrollPeriodId: log2.payrollPeriodId ?? null,
          calculatedAmount: log2.calculatedAmount ?? null,
          rejectionReason: null,
          disputeReason: null,
          disputedAt: null,
          isIncluded: log2.isIncluded ?? true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.adjustmentLogs.set(id, adjustmentLog);
        return adjustmentLog;
      }
      async getAdjustmentLog(id) {
        return this.adjustmentLogs.get(id);
      }
      async getAdjustmentLogsByEmployee(employeeId, startDate, endDate) {
        return Array.from(this.adjustmentLogs.values()).filter((log2) => {
          if (log2.employeeId !== employeeId) return false;
          if (startDate && log2.startDate && new Date(log2.startDate) < startDate) return false;
          if (endDate && log2.startDate && new Date(log2.startDate) > endDate) return false;
          return true;
        }).sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
      }
      async getAdjustmentLogsByBranch(branchId, startDate, endDate) {
        return Array.from(this.adjustmentLogs.values()).filter((log2) => {
          if (log2.branchId !== branchId) return false;
          if (startDate && log2.startDate && new Date(log2.startDate) < startDate) return false;
          if (endDate && log2.startDate && new Date(log2.startDate) > endDate) return false;
          return true;
        }).sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
      }
      async getPendingAdjustmentLogs(branchId) {
        return Array.from(this.adjustmentLogs.values()).filter(
          (log2) => log2.branchId === branchId && (log2.status === "pending" || log2.status === "employee_verified")
        ).sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
      }
      async updateAdjustmentLog(id, log2) {
        const existing = this.adjustmentLogs.get(id);
        if (!existing) return void 0;
        const updated = { ...existing, ...log2 };
        this.adjustmentLogs.set(id, updated);
        return updated;
      }
      async deleteAdjustmentLog(id) {
        return this.adjustmentLogs.delete(id);
      }
      // Company Settings
      async getCompanySettings() {
        const all = Array.from(this.companySettingsStore.values());
        return all.find((s) => s.isActive) || all[0];
      }
      async createCompanySettings(settings) {
        const id = randomUUID2();
        const record = {
          id,
          ...settings,
          country: settings.country ?? "Philippines",
          industry: settings.industry ?? "Food & Beverage",
          payrollFrequency: settings.payrollFrequency ?? "semi-monthly",
          paymentMethod: settings.paymentMethod ?? "Bank Transfer",
          isActive: settings.isActive ?? true,
          tradeName: settings.tradeName ?? null,
          city: settings.city ?? null,
          province: settings.province ?? null,
          zipCode: settings.zipCode ?? null,
          sssEmployerNo: settings.sssEmployerNo ?? null,
          philhealthNo: settings.philhealthNo ?? null,
          pagibigNo: settings.pagibigNo ?? null,
          birRdo: settings.birRdo ?? null,
          secRegistration: settings.secRegistration ?? null,
          phone: settings.phone ?? null,
          email: settings.email ?? null,
          website: settings.website ?? null,
          logoUrl: settings.logoUrl ?? null,
          logoPublicId: settings.logoPublicId ?? null,
          bankName: settings.bankName ?? null,
          bankAccountName: settings.bankAccountName ?? null,
          bankAccountNo: settings.bankAccountNo ?? null,
          includeHolidayPay: settings.includeHolidayPay ?? null,
          updatedBy: settings.updatedBy ?? null,
          updatedAt: /* @__PURE__ */ new Date(),
          createdAt: /* @__PURE__ */ new Date()
        };
        this.companySettingsStore.set(id, record);
        return record;
      }
      async updateCompanySettings(id, settings) {
        const existing = this.companySettingsStore.get(id);
        if (!existing) return void 0;
        const updated = { ...existing, ...settings, updatedAt: /* @__PURE__ */ new Date() };
        this.companySettingsStore.set(id, updated);
        return updated;
      }
      // Setup Management
      async isSetupComplete() {
        return this.setupComplete;
      }
      async markSetupComplete() {
        this.setupComplete = true;
      }
      // Shift Validation
      async checkShiftOverlap(userId, startTime, endTime, excludeShiftId) {
        for (const shift of this.shifts.values()) {
          if (shift.userId !== userId) continue;
          if (excludeShiftId && shift.id === excludeShiftId) continue;
          if (shift.startTime && shift.endTime) {
            const existingStart = new Date(shift.startTime);
            const existingEnd = new Date(shift.endTime);
            if (startTime < existingEnd && endTime > existingStart) {
              return shift;
            }
          }
        }
        return null;
      }
      async checkShiftOnDate(userId, date, excludeShiftId) {
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        const result = [];
        for (const shift of this.shifts.values()) {
          if (shift.userId !== userId) continue;
          if (excludeShiftId && shift.id === excludeShiftId) continue;
          if (shift.startTime) {
            const st = new Date(shift.startTime);
            if (st >= dayStart && st <= dayEnd) {
              result.push(shift);
            }
          }
        }
        return result;
      }
      // Notifications (extended)
      async getUserNotifications(userId) {
        return Array.from(this.notifications.values()).filter((n) => n.userId === userId).sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db2 - da;
        }).slice(0, 50);
      }
      async markNotificationRead(id, userId) {
        const notification = this.notifications.get(id);
        if (!notification || notification.userId !== userId) return void 0;
        const updated = { ...notification, isRead: true };
        this.notifications.set(id, updated);
        return updated;
      }
      async markAllNotificationsRead(userId) {
        for (const [id, notification] of this.notifications.entries()) {
          if (notification.userId === userId) {
            this.notifications.set(id, { ...notification, isRead: true });
          }
        }
      }
      // Archived Payroll
      async getArchivedPayrollPeriods(branchId) {
        return Array.from(this.archivedPayrollPeriods.values()).filter((a) => a.branchId === branchId);
      }
      async archivePayrollPeriod(periodId, archivedBy, entriesSnapshot) {
        const period = this.payrollPeriods.get(periodId);
        if (!period) throw new Error("Payroll period not found");
        const id = randomUUID2();
        const archived = {
          id,
          originalPeriodId: periodId,
          branchId: period.branchId,
          startDate: period.startDate,
          endDate: period.endDate,
          status: period.status || "closed",
          totalHours: period.totalHours,
          totalPay: period.totalPay,
          archivedAt: /* @__PURE__ */ new Date(),
          archivedBy,
          entriesSnapshot
        };
        this.archivedPayrollPeriods.set(id, archived);
        return archived;
      }
      async getArchivedPayrollPeriod(id) {
        return this.archivedPayrollPeriods.get(id);
      }
      // User management (extended)
      async getAllUsers() {
        return Array.from(this.users.values());
      }
      async forceDeleteUser(id, _performedBy, _reason) {
        this.users.delete(id);
        for (const [sid, shift] of this.shifts.entries()) {
          if (shift.userId === id) this.shifts.delete(sid);
        }
        for (const [pid, entry] of this.payrollEntries.entries()) {
          if (entry.userId === id) this.payrollEntries.delete(pid);
        }
        for (const [nid, notif] of this.notifications.entries()) {
          if (notif.userId === id) this.notifications.delete(nid);
        }
      }
      async employeeHasRelatedData(id) {
        const userShifts = Array.from(this.shifts.values()).filter((s) => s.userId === id);
        const payroll = Array.from(this.payrollEntries.values()).filter((p) => p.userId === id);
        const timeOff = Array.from(this.timeOffRequests.values()).filter((t) => t.userId === id);
        const trades = Array.from(this.shiftTrades.values()).filter((t) => t.fromUserId === id || t.toUserId === id);
        const total = userShifts.length + payroll.length + timeOff.length + trades.length;
        return { hasShifts: userShifts.length > 0, hasPayroll: payroll.length > 0, hasTotal: total };
      }
      async getEmployeeDataForExport(id) {
        const employee = this.users.get(id);
        if (!employee) return null;
        return {
          employee,
          shifts: Array.from(this.shifts.values()).filter((s) => s.userId === id),
          payrollEntries: Array.from(this.payrollEntries.values()).filter((p) => p.userId === id),
          timeOffRequests: Array.from(this.timeOffRequests.values()).filter((t) => t.userId === id),
          shiftTrades: Array.from(this.shiftTrades.values()).filter((t) => t.fromUserId === id || t.toUserId === id)
        };
      }
      // Government Loans (Art. 113)
      async createLoanRequest(data) {
        const id = randomUUID2();
        const loan = {
          ...data,
          id,
          status: data.status || "pending",
          proofFileUrl: data.proofFileUrl || null,
          hrApprovalNote: data.hrApprovalNote || null,
          totalAmount: data.totalAmount || "0",
          remainingBalance: data.remainingBalance || data.totalAmount || "0",
          approvedBy: data.approvedBy || null,
          approvedAt: data.approvedAt || null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.loanRequests.set(id, loan);
        return loan;
      }
      async getLoanRequestsByUser(userId) {
        return Array.from(this.loanRequests.values()).filter((l) => l.userId === userId);
      }
      async getLoanRequestsByBranch(branchId) {
        return Array.from(this.loanRequests.values()).filter((l) => l.branchId === branchId);
      }
      async getLoanRequest(id) {
        return this.loanRequests.get(id);
      }
      async updateLoanRequest(id, status, hrApprovalNote, approvedBy) {
        const existing = this.loanRequests.get(id);
        if (!existing) return void 0;
        const updated = {
          ...existing,
          status,
          hrApprovalNote: hrApprovalNote ?? existing.hrApprovalNote,
          approvedBy: approvedBy ?? existing.approvedBy,
          approvedAt: status === "approved" ? /* @__PURE__ */ new Date() : existing.approvedAt,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.loanRequests.set(id, updated);
        return updated;
      }
      async getActiveApprovedLoans(userId, targetDate) {
        return Array.from(this.loanRequests.values()).filter(
          (l) => l.userId === userId && l.status === "approved" && new Date(l.deductionStartDate) <= targetDate && Number(l.remainingBalance) > 0
        );
      }
      // Time Off Policy
      async getTimeOffPolicyByBranch(branchId) {
        return Array.from(this.timeOffPolicies.values()).filter((p) => p.branchId === branchId);
      }
      async getTimeOffPolicyByType(branchId, leaveType) {
        return Array.from(this.timeOffPolicies.values()).find((p) => p.branchId === branchId && p.leaveType === leaveType);
      }
      async upsertTimeOffPolicy(branchId, leaveType, minimumAdvanceDays) {
        const existing = await this.getTimeOffPolicyByType(branchId, leaveType);
        if (existing) {
          const updated = { ...existing, minimumAdvanceDays, updatedAt: /* @__PURE__ */ new Date() };
          this.timeOffPolicies.set(existing.id, updated);
          return updated;
        }
        const id = randomUUID2();
        const policy = {
          id,
          branchId,
          leaveType,
          minimumAdvanceDays,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.timeOffPolicies.set(id, policy);
        return policy;
      }
      async initializeDefaultTimeOffPolicies(branchId) {
        const defaults = [
          { leaveType: "vacation", minimumAdvanceDays: 7 },
          { leaveType: "sick", minimumAdvanceDays: 0 },
          { leaveType: "emergency", minimumAdvanceDays: 0 },
          { leaveType: "personal", minimumAdvanceDays: 3 },
          { leaveType: "other", minimumAdvanceDays: 3 }
        ];
        for (const d of defaults) {
          const existing = await this.getTimeOffPolicyByType(branchId, d.leaveType);
          if (!existing) {
            await this.upsertTimeOffPolicy(branchId, d.leaveType, d.minimumAdvanceDays);
          }
        }
      }
    };
    storage2 = new MemStorage();
  }
});

// server/middleware/auth.ts
var requireAuth3, requireRole;
var init_auth = __esm({
  "server/middleware/auth.ts"() {
    "use strict";
    init_storage();
    requireAuth3 = (req, res, next) => {
      if (!req.session?.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      req.user = req.session.user;
      next();
    };
    requireRole = (roles) => {
      return (req, res, next) => {
        if (!req.session?.user || !roles.includes(req.session.user.role)) {
          return res.status(403).json({ message: "Insufficient permissions" });
        }
        next();
      };
    };
  }
});

// server/routes/leave-credits.ts
var leave_credits_exports = {};
__export(leave_credits_exports, {
  LEAVE_TYPE_CONFIG: () => LEAVE_TYPE_CONFIG,
  deductLeaveCredit: () => deductLeaveCredit,
  leaveCreditsRouter: () => router2,
  restoreLeaveCredit: () => restoreLeaveCredit
});
import { Router as Router3 } from "express";
import { eq as eq2, and as and2, desc as desc2 } from "drizzle-orm";
import { randomUUID as randomUUID3 } from "crypto";
async function deductLeaveCredit(userId, branchId, leaveType, daysToDeduct, year) {
  try {
    const typeMap = {
      vacation: "vacation",
      sick: "sick",
      solo_parent: "solo_parent",
      vawc: "vawc",
      other: "other",
      emergency: "other",
      personal: "other"
    };
    const creditType = typeMap[leaveType] || "other";
    const existing = await db.select().from(leaveCredits).where(
      and2(
        eq2(leaveCredits.userId, userId),
        eq2(leaveCredits.year, year),
        eq2(leaveCredits.leaveType, creditType)
      )
    ).limit(1);
    if (!existing[0]) {
      return {
        success: true,
        warning: `No ${creditType} leave credit balance found for ${year}. Leave approved without deduction.`
      };
    }
    const current = existing[0];
    const used = parseFloat(current.usedCredits || "0");
    const remaining = parseFloat(current.remainingCredits);
    const newUsed = used + daysToDeduct;
    const newRemaining = Math.max(0, remaining - daysToDeduct);
    await db.update(leaveCredits).set({
      usedCredits: newUsed.toFixed(2),
      remainingCredits: newRemaining.toFixed(2),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(leaveCredits.id, current.id));
    const warning = daysToDeduct > remaining ? `Leave exceeded balance by ${(daysToDeduct - remaining).toFixed(1)} days. Balance is now negative.` : void 0;
    return { success: true, warning };
  } catch (error) {
    console.error("Leave credit deduction failed (non-blocking):", error);
    return { success: true, warning: "Leave credit deduction could not be recorded." };
  }
}
async function restoreLeaveCredit(userId, leaveType, daysToRestore, year) {
  try {
    const typeMap = {
      vacation: "vacation",
      sick: "sick",
      solo_parent: "solo_parent",
      vawc: "vawc",
      other: "other",
      emergency: "other",
      personal: "other"
    };
    const creditType = typeMap[leaveType] || "other";
    const existing = await db.select().from(leaveCredits).where(
      and2(
        eq2(leaveCredits.userId, userId),
        eq2(leaveCredits.year, year),
        eq2(leaveCredits.leaveType, creditType)
      )
    ).limit(1);
    if (!existing[0]) {
      return { success: true, warning: `No ${creditType} balance found to restore for ${year}.` };
    }
    const current = existing[0];
    const total = parseFloat(current.totalCredits || "0");
    const used = parseFloat(current.usedCredits || "0");
    let remaining = parseFloat(current.remainingCredits);
    const newUsed = Math.max(0, used - daysToRestore);
    let newRemaining = remaining + daysToRestore;
    let overflow = 0;
    if (newRemaining > total) {
      overflow = newRemaining - total;
      newRemaining = total;
    }
    await db.update(leaveCredits).set({
      usedCredits: newUsed.toFixed(2),
      remainingCredits: newRemaining.toFixed(2),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(leaveCredits.id, current.id));
    return { success: true };
  } catch (error) {
    console.error("Leave credit restoration failed:", error);
    return { success: true, warning: "Leave credit restoration could not be recorded." };
  }
}
var router2, LEAVE_TYPE_CONFIG;
var init_leave_credits = __esm({
  "server/routes/leave-credits.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_auth();
    router2 = Router3();
    LEAVE_TYPE_CONFIG = {
      sil: {
        label: "Service Incentive Leave",
        defaultDays: 5,
        color: "#4caf50",
        description: "Mandated 5 days paid SIL after 1 year of service (Art. 95, Labor Code)"
      },
      solo_parent: {
        label: "Solo Parent Leave",
        defaultDays: 7,
        color: "#2196f3",
        description: "7 days paid leave for solo parents (RA 8972)"
      },
      vawc: {
        label: "VAWC Leave",
        defaultDays: 10,
        color: "#9c27b0",
        description: "10 days paid leave for VAWC victims (RA 9262)"
      },
      vacation: {
        label: "Vacation Leave",
        defaultDays: 0,
        color: "#ff9800",
        description: "Company discretionary vacation leave"
      },
      sick: {
        label: "Sick Leave",
        defaultDays: 0,
        color: "#f44336",
        description: "Company discretionary sick leave"
      },
      other: {
        label: "Other Leave",
        defaultDays: 0,
        color: "#607d8b",
        description: "Other leave types"
      }
    };
    router2.get("/api/leave-credits/my", requireAuth3, async (req, res) => {
      try {
        const userId = req.user.id;
        const year = req.query.year ? parseInt(req.query.year) : (/* @__PURE__ */ new Date()).getFullYear();
        const credits = await db.select().from(leaveCredits).where(and2(eq2(leaveCredits.userId, userId), eq2(leaveCredits.year, year))).orderBy(leaveCredits.leaveType);
        const enriched = credits.map((c) => ({
          ...c,
          leaveTypeConfig: LEAVE_TYPE_CONFIG[c.leaveType] || LEAVE_TYPE_CONFIG.other
        }));
        res.json({ credits: enriched, year });
      } catch (error) {
        console.error("[/api/leave-credits/my] FULL ERROR:", error);
        if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
          return res.json({ credits: [], year: (/* @__PURE__ */ new Date()).getFullYear() });
        }
        res.status(500).json({ message: error.message || "Failed to fetch leave credits" });
      }
    });
    router2.get("/api/leave-credits/branch", requireAuth3, requireRole(["manager", "admin"]), async (req, res) => {
      try {
        const branchId = req.user.branchId;
        const year = req.query.year ? parseInt(req.query.year) : (/* @__PURE__ */ new Date()).getFullYear();
        const credits = await db.select().from(leaveCredits).where(and2(eq2(leaveCredits.branchId, branchId), eq2(leaveCredits.year, year))).orderBy(desc2(leaveCredits.createdAt));
        const branchUsers = await db.select().from(users).where(eq2(users.branchId, branchId));
        const userMap = new Map(branchUsers.map((u) => [u.id, u]));
        const enriched = credits.map((c) => {
          const user = userMap.get(c.userId);
          return {
            ...c,
            employeeName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
            position: user?.position || "",
            leaveTypeConfig: LEAVE_TYPE_CONFIG[c.leaveType] || LEAVE_TYPE_CONFIG.other
          };
        });
        res.json({ credits: enriched, year });
      } catch (error) {
        if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
          return res.json({ credits: [], year: (/* @__PURE__ */ new Date()).getFullYear() });
        }
        res.status(500).json({ message: error.message || "Failed to fetch branch leave credits" });
      }
    });
    router2.post("/api/leave-credits/grant", requireAuth3, requireRole(["manager", "admin"]), async (req, res) => {
      try {
        const { userId, leaveType, totalCredits, year, notes } = req.body;
        const branchId = req.user.branchId;
        const grantedBy = req.user.id;
        if (!userId || !leaveType || totalCredits === void 0 || totalCredits === null) {
          return res.status(400).json({ message: "userId, leaveType, and totalCredits are required" });
        }
        const validTypes = Object.keys(LEAVE_TYPE_CONFIG);
        if (!validTypes.includes(leaveType)) {
          return res.status(400).json({ message: `Invalid leaveType. Valid: ${validTypes.join(", ")}` });
        }
        const credits = parseFloat(totalCredits);
        if (isNaN(credits) || credits < 0) {
          return res.status(400).json({ message: "totalCredits must be a non-negative number" });
        }
        const targetYear = year ? parseInt(year) : (/* @__PURE__ */ new Date()).getFullYear();
        const employee = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
        if (!employee[0]) return res.status(404).json({ message: "Employee not found" });
        if (employee[0].branchId !== branchId) {
          return res.status(403).json({ message: "Employee is not in your branch" });
        }
        const existing = await db.select().from(leaveCredits).where(
          and2(
            eq2(leaveCredits.userId, userId),
            eq2(leaveCredits.year, targetYear),
            eq2(leaveCredits.leaveType, leaveType)
          )
        ).limit(1);
        if (existing[0]) {
          const used = parseFloat(existing[0].usedCredits || "0");
          const remaining = Math.max(0, credits - used);
          await db.update(leaveCredits).set({
            totalCredits: credits.toFixed(2),
            remainingCredits: remaining.toFixed(2),
            grantedBy,
            notes: notes || existing[0].notes,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq2(leaveCredits.id, existing[0].id));
          const updated = await db.select().from(leaveCredits).where(eq2(leaveCredits.id, existing[0].id)).limit(1);
          return res.json({ credit: updated[0], message: "Leave credits updated" });
        }
        const id = randomUUID3();
        await db.insert(leaveCredits).values({
          id,
          userId,
          branchId,
          year: targetYear,
          leaveType,
          totalCredits: credits.toFixed(2),
          usedCredits: "0",
          remainingCredits: credits.toFixed(2),
          grantedBy,
          notes: notes || null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
        const created = await db.select().from(leaveCredits).where(eq2(leaveCredits.id, id)).limit(1);
        res.status(201).json({ credit: created[0], message: "Leave credits granted" });
      } catch (error) {
        if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
          return res.status(503).json({ message: "Leave credits table not yet migrated. Run db:push first." });
        }
        console.error("Error granting leave credits:", error);
        res.status(500).json({ message: error.message || "Failed to grant leave credits" });
      }
    });
    router2.put("/api/leave-credits/:id", requireAuth3, requireRole(["manager", "admin"]), async (req, res) => {
      try {
        const { id } = req.params;
        const branchId = req.user.branchId;
        const existing = await db.select().from(leaveCredits).where(eq2(leaveCredits.id, id)).limit(1);
        if (!existing[0]) return res.status(404).json({ message: "Leave credit not found" });
        if (existing[0].branchId !== branchId) {
          return res.status(403).json({ message: "Not authorized for this branch" });
        }
        const { totalCredits, usedCredits, notes } = req.body;
        const total = totalCredits !== void 0 ? parseFloat(totalCredits) : parseFloat(existing[0].totalCredits);
        const used = usedCredits !== void 0 ? parseFloat(usedCredits) : parseFloat(existing[0].usedCredits || "0");
        const remaining = Math.max(0, total - used);
        await db.update(leaveCredits).set({
          totalCredits: total.toFixed(2),
          usedCredits: used.toFixed(2),
          remainingCredits: remaining.toFixed(2),
          notes: notes !== void 0 ? notes : existing[0].notes,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(leaveCredits.id, id));
        const updated = await db.select().from(leaveCredits).where(eq2(leaveCredits.id, id)).limit(1);
        res.json({ credit: updated[0] });
      } catch (error) {
        res.status(500).json({ message: error.message || "Failed to update leave credit" });
      }
    });
  }
});

// server/payroll-utils.ts
function toLocalDateString(date) {
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function isNightDiffHour(hour) {
  return hour >= NIGHT_DIFF_START || hour < NIGHT_DIFF_END;
}
function calculateNightDiffHours(startTime, endTime) {
  let nightMinutes = 0;
  const current = new Date(startTime);
  while (current < endTime) {
    const hour = current.getHours();
    if (isNightDiffHour(hour)) {
      nightMinutes += 1;
    }
    current.setTime(current.getTime() + 6e4);
  }
  return nightMinutes / 60;
}
function getHolidayType(date, holidays2) {
  const dateStr = toLocalDateString(date);
  for (const holiday of holidays2) {
    const holidayDate = toLocalDateString(new Date(holiday.date));
    if (dateStr === holidayDate) {
      return holiday.type;
    }
  }
  return "normal";
}
function splitCrossMidnightShift(startTime, endTime) {
  const segments = [];
  const current = new Date(startTime);
  while (current < endTime) {
    const segmentStart = new Date(current);
    const nextMidnight = new Date(current);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    const segmentEnd = nextMidnight < endTime ? nextMidnight : new Date(endTime);
    segments.push({
      start: segmentStart,
      end: segmentEnd,
      date: new Date(segmentStart.getFullYear(), segmentStart.getMonth(), segmentStart.getDate())
    });
    current.setTime(nextMidnight.getTime());
  }
  return segments;
}
function calculateSegmentHours(start, end) {
  return (end.getTime() - start.getTime()) / (1e3 * 60 * 60);
}
function isRestDay(date, restDay = 0) {
  return date.getDay() === restDay;
}
function calculateDailyHoursBreakdown(shifts2, holidays2, restDay = 0) {
  const dailyBreakdown = /* @__PURE__ */ new Map();
  for (const shift of shifts2) {
    const startTime = new Date(shift.actualStartTime || shift.startTime);
    const endTime = new Date(shift.actualEndTime || shift.endTime);
    const segments = splitCrossMidnightShift(startTime, endTime);
    for (const segment of segments) {
      const dateKey = toLocalDateString(segment.date);
      const segmentHours = calculateSegmentHours(segment.start, segment.end);
      const holidayType = getHolidayType(segment.date, holidays2);
      const isRest = isRestDay(segment.date, restDay);
      if (!dailyBreakdown.has(dateKey)) {
        dailyBreakdown.set(dateKey, {
          regularHours: 0,
          overtimeHours: 0,
          regularNightDiffHours: 0,
          overtimeNightDiffHours: 0,
          holidayType,
          isRestDay: isRest,
          date: segment.date
        });
      }
      const existing = dailyBreakdown.get(dateKey);
      const currentTotalHours = existing.regularHours + existing.overtimeHours;
      if (currentTotalHours >= DAILY_REGULAR_HOURS) {
        existing.overtimeHours += segmentHours;
        existing.overtimeNightDiffHours += calculateNightDiffHours(segment.start, segment.end);
      } else if (currentTotalHours + segmentHours > DAILY_REGULAR_HOURS) {
        const remainingRegular = DAILY_REGULAR_HOURS - currentTotalHours;
        const boundaryMs = segment.start.getTime() + remainingRegular * 60 * 60 * 1e3;
        const boundaryDate = new Date(boundaryMs);
        existing.regularHours += remainingRegular;
        existing.overtimeHours += segmentHours - remainingRegular;
        existing.regularNightDiffHours += calculateNightDiffHours(segment.start, boundaryDate);
        existing.overtimeNightDiffHours += calculateNightDiffHours(boundaryDate, segment.end);
      } else {
        existing.regularHours += segmentHours;
        existing.regularNightDiffHours += calculateNightDiffHours(segment.start, segment.end);
      }
    }
  }
  return dailyBreakdown;
}
function calculatePeriodPay(shifts2, hourlyRate, holidays2, restDay = 0, isHolidayExempt = false) {
  const dailyBreakdown = calculateDailyHoursBreakdown(shifts2, holidays2, restDay);
  let basicPay = 0;
  let overtimePay = 0;
  let holidayPay = 0;
  let nightDiffPay = 0;
  let restDayPay = 0;
  const breakdown = [];
  for (const [, dayData] of dailyBreakdown) {
    breakdown.push(dayData);
    let rates = HOLIDAY_RATES[dayData.holidayType];
    if (isHolidayExempt && dayData.holidayType !== "normal") {
      rates = HOLIDAY_RATES["normal"];
    }
    let regularRate = rates.worked;
    let otRate = rates.overtime;
    if (dayData.isRestDay) {
      regularRate = rates.restDay;
      otRate = rates.restDayOT;
    }
    const regularPay = dayData.regularHours * hourlyRate * regularRate;
    const otPay = dayData.overtimeHours * hourlyRate * otRate;
    const regularNightDiffBase = dayData.regularNightDiffHours * hourlyRate * regularRate;
    const otNightDiffBase = dayData.overtimeNightDiffHours * hourlyRate * otRate;
    const nightDiff = (regularNightDiffBase + otNightDiffBase) * NIGHT_DIFF_RATE;
    if (dayData.holidayType !== "normal") {
      holidayPay += regularPay - dayData.regularHours * hourlyRate;
      basicPay += dayData.regularHours * hourlyRate;
    } else if (dayData.isRestDay) {
      restDayPay += regularPay - dayData.regularHours * hourlyRate;
      basicPay += dayData.regularHours * hourlyRate;
    } else {
      basicPay += regularPay;
    }
    overtimePay += otPay;
    nightDiffPay += nightDiff;
  }
  if (!isHolidayExempt) {
    for (const holiday of holidays2) {
      if (holiday.type === "regular" || holiday.type === "special_working") {
        if (holiday.type === "regular") {
          const holidayDateStr = toLocalDateString(new Date(holiday.date));
          const workedThatDay = Array.from(dailyBreakdown.values()).some((dayData) => {
            return toLocalDateString(dayData.date) === holidayDateStr;
          });
          if (!workedThatDay) {
            const unworkedHolidayPay = 8 * hourlyRate;
            holidayPay += unworkedHolidayPay;
          }
        }
      }
    }
  }
  return {
    basicPay: Math.round(basicPay * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    holidayPay: Math.round(holidayPay * 100) / 100,
    nightDiffPay: Math.round(nightDiffPay * 100) / 100,
    restDayPay: Math.round(restDayPay * 100) / 100,
    totalGrossPay: Math.round((basicPay + overtimePay + holidayPay + nightDiffPay + restDayPay) * 100) / 100,
    breakdown
  };
}
function validateShiftTimes(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime())) {
    return "Invalid start time";
  }
  if (isNaN(end.getTime())) {
    return "Invalid end time";
  }
  if (end <= start) {
    return "End time must be after start time";
  }
  const hoursWorked = (end.getTime() - start.getTime()) / (1e3 * 60 * 60);
  if (hoursWorked > 24) {
    return "Shift cannot exceed 24 hours";
  }
  return null;
}
var HOLIDAY_RATES, NIGHT_DIFF_START, NIGHT_DIFF_END, NIGHT_DIFF_RATE, DAILY_REGULAR_HOURS, MONTHLY_WORKING_DAYS, MONTHLY_WORKING_HOURS, MINS_PER_HOUR, MS_PER_HOUR;
var init_payroll_utils = __esm({
  "server/payroll-utils.ts"() {
    "use strict";
    HOLIDAY_RATES = {
      regular: {
        notWorked: 1,
        // Paid holiday - 100% of daily wage
        worked: 2,
        // 200% of daily wage
        overtime: 2.6,
        // 200% × 130% = 260%
        restDay: 2.6,
        // 260% on rest day
        restDayOT: 3.38
        // 338% rest day overtime
      },
      special_non_working: {
        notWorked: 0,
        // No work, no pay
        worked: 1.3,
        // 130% of daily wage
        overtime: 1.69,
        // 130% × 130% = 169%
        restDay: 1.5,
        // 150% on rest day
        restDayOT: 1.95
        // 150% × 130% = 195%
      },
      special_working: {
        notWorked: 1,
        // Normal day - 100%
        worked: 1,
        // Normal rate
        overtime: 1.25,
        // Normal OT
        restDay: 1.3,
        // 130% on rest day
        restDayOT: 1.69
        // Rest day OT
      },
      normal: {
        notWorked: 0,
        // No pay for not working
        worked: 1,
        // 100% normal rate
        overtime: 1.25,
        // 125% for OT (first 8 hours at 100%, after that 125%)
        restDay: 1.3,
        // 130% on rest day
        restDayOT: 1.69
        // Rest day OT
      }
    };
    NIGHT_DIFF_START = 22;
    NIGHT_DIFF_END = 6;
    NIGHT_DIFF_RATE = 0.1;
    DAILY_REGULAR_HOURS = 8;
    MONTHLY_WORKING_DAYS = 22;
    MONTHLY_WORKING_HOURS = DAILY_REGULAR_HOURS * MONTHLY_WORKING_DAYS;
    MINS_PER_HOUR = 60;
    MS_PER_HOUR = 1e3 * 60 * 60;
  }
});

// server/routes/hours.ts
var hours_exports = {};
__export(hours_exports, {
  calculateHoursFromShifts: () => calculateHoursFromShifts,
  filterCompletedShifts: () => filterCompletedShifts,
  router: () => router3
});
import { Router as Router4 } from "express";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
function filterCompletedShifts(shifts2) {
  const now = /* @__PURE__ */ new Date();
  return shifts2.filter((shift) => {
    const shiftEndTime = shift.actualEndTime || shift.endTime;
    const hasEnded = new Date(shiftEndTime) <= now;
    const isCompleted = shift.status === "completed";
    return hasEnded || isCompleted;
  });
}
function calculateHoursFromShifts(shifts2) {
  let totalHours = 0;
  const completedShifts = filterCompletedShifts(shifts2);
  for (const shift of completedShifts) {
    let startTime, endTime;
    if (shift.actualStartTime && shift.actualEndTime) {
      startTime = shift.actualStartTime;
      endTime = shift.actualEndTime;
    } else {
      startTime = shift.startTime;
      endTime = shift.endTime;
    }
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn(`Invalid shift dates for shift ${shift.id}:`, { startTime, endTime });
      continue;
    }
    const shiftHours = (endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60);
    if (shiftHours > 0 && shiftHours < 24) {
      totalHours += shiftHours;
    } else if (shiftHours < 0) {
      console.warn(`Skipping shift ${shift.id} with negative hours:`, {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        hours: shiftHours,
        actualStartTime: shift.actualStartTime ? new Date(shift.actualStartTime).toISOString() : null,
        actualEndTime: shift.actualEndTime ? new Date(shift.actualEndTime).toISOString() : null,
        scheduledStart: new Date(shift.startTime).toISOString(),
        scheduledEnd: new Date(shift.endTime).toISOString()
      });
    }
  }
  return totalHours;
}
function calculateAllScheduledHours(shifts2) {
  let totalHours = 0;
  for (const shift of shifts2) {
    const startTime = shift.startTime;
    const endTime = shift.endTime;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      continue;
    }
    const shiftHours = (endDate.getTime() - startDate.getTime()) / (1e3 * 60 * 60);
    if (shiftHours > 0 && shiftHours < 24) {
      totalHours += shiftHours;
    }
  }
  return totalHours;
}
var storage3, router3, requireAuth4, requireRole2;
var init_hours = __esm({
  "server/routes/hours.ts"() {
    "use strict";
    init_db_storage();
    init_payroll_utils();
    storage3 = dbStorage;
    router3 = Router4();
    requireAuth4 = (req, res, next) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      next();
    };
    requireRole2 = (roles) => (req, res, next) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const effectiveRoles = [...roles];
      if (roles.includes("manager") && !roles.includes("admin")) {
        effectiveRoles.push("admin");
      }
      if (!effectiveRoles.includes(req.session.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    };
    router3.get("/api/hours/my-summary", requireAuth4, async (req, res) => {
      try {
        const userId = req.session.user.id;
        const now = /* @__PURE__ */ new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const weekShifts = await storage3.getShiftsByUser(userId, weekStart, weekEnd);
        const weekHours = calculateHoursFromShifts(weekShifts);
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const monthShifts = await storage3.getShiftsByUser(userId, monthStart, monthEnd);
        const monthHours = calculateHoursFromShifts(monthShifts);
        const dayStart = startOfDay(now);
        const dayEnd = endOfDay(now);
        const todayShifts = await storage3.getShiftsByUser(userId, dayStart, dayEnd);
        const todayHours = calculateHoursFromShifts(todayShifts);
        res.json({
          thisWeek: Number(weekHours.toFixed(2)),
          thisMonth: Number(monthHours.toFixed(2)),
          today: Number(todayHours.toFixed(2)),
          weekShifts: filterCompletedShifts(weekShifts).length,
          monthShifts: filterCompletedShifts(monthShifts).length
        });
      } catch (error) {
        console.error("Error fetching employee hours summary:", error);
        res.status(500).json({ message: "Failed to fetch hours summary" });
      }
    });
    router3.get("/api/hours/team-summary", requireAuth4, requireRole2(["manager", "admin"]), async (req, res) => {
      try {
        const branchId = req.session.user.branchId;
        const now = /* @__PURE__ */ new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const weekShifts = await storage3.getShiftsByBranch(branchId, weekStart, weekEnd);
        const weekHours = calculateHoursFromShifts(weekShifts);
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const monthShifts = await storage3.getShiftsByBranch(branchId, monthStart, monthEnd);
        const monthHours = calculateHoursFromShifts(monthShifts);
        const employees = await storage3.getUsersByBranch(branchId);
        const activeEmployees = employees.filter((e) => e.isActive && (e.role === "employee" || e.role === "manager"));
        res.json({
          thisWeek: Number(weekHours.toFixed(2)),
          thisMonth: Number(monthHours.toFixed(2)),
          employeeCount: activeEmployees.length,
          weekShifts: filterCompletedShifts(weekShifts).length,
          monthShifts: filterCompletedShifts(monthShifts).length
        });
      } catch (error) {
        console.error("Error fetching team hours summary:", error);
        res.status(500).json({ message: "Failed to fetch team hours summary" });
      }
    });
    router3.get("/api/hours/employee/:employeeId", requireAuth4, requireRole2(["manager", "admin"]), async (req, res) => {
      try {
        const { employeeId } = req.params;
        const branchId = req.session.user.branchId;
        const employee = await storage3.getUser(employeeId);
        if (!employee || employee.branchId !== branchId) {
          return res.status(404).json({ message: "Employee not found" });
        }
        const now = /* @__PURE__ */ new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const weekShifts = await storage3.getShiftsByUser(employeeId, weekStart, weekEnd);
        const weekHours = calculateHoursFromShifts(weekShifts);
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const monthShifts = await storage3.getShiftsByUser(employeeId, monthStart, monthEnd);
        const monthHours = calculateHoursFromShifts(monthShifts);
        res.json({
          employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          thisWeek: Number(weekHours.toFixed(2)),
          thisMonth: Number(monthHours.toFixed(2)),
          weekShifts: filterCompletedShifts(weekShifts).length,
          monthShifts: filterCompletedShifts(monthShifts).length
        });
      } catch (error) {
        console.error("Error fetching employee hours:", error);
        res.status(500).json({ message: "Failed to fetch employee hours" });
      }
    });
    router3.get("/api/hours/report", requireAuth4, requireRole2(["manager", "admin"]), async (req, res) => {
      try {
        const branchId = req.session.user.branchId;
        const { startDate, endDate, employeeId } = req.query;
        let start;
        let end;
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
          }
        } else {
          const now = /* @__PURE__ */ new Date();
          start = startOfMonth(now);
          end = endOfMonth(now);
        }
        const allEmployees = await storage3.getUsersByBranch(branchId);
        const employees = allEmployees.filter((e) => e.isActive);
        const targetEmployees = employeeId ? employees.filter((e) => e.id === employeeId) : employees;
        const employeeHours = await Promise.all(targetEmployees.map(async (employee) => {
          const shifts2 = await storage3.getShiftsByUser(employee.id, start, end);
          const completedShifts = filterCompletedShifts(shifts2);
          const totalHours2 = calculateHoursFromShifts(shifts2);
          const hoursByDay = {};
          for (const shift of completedShifts) {
            const shiftDate = toLocalDateString(new Date(shift.startTime));
            let startTime, endTime;
            if (shift.actualStartTime && shift.actualEndTime) {
              startTime = shift.actualStartTime;
              endTime = shift.actualEndTime;
            } else {
              startTime = shift.startTime;
              endTime = shift.endTime;
            }
            const hours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1e3 * 60 * 60);
            if (hours > 0 && hours < 24) {
              if (!hoursByDay[shiftDate]) {
                hoursByDay[shiftDate] = 0;
              }
              hoursByDay[shiftDate] += hours;
            }
          }
          return {
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            position: employee.position,
            hourlyRate: parseFloat(employee.hourlyRate),
            totalHours: Number(totalHours2.toFixed(2)),
            totalShifts: completedShifts.length,
            estimatedPay: Number((totalHours2 * parseFloat(employee.hourlyRate)).toFixed(2)),
            hoursByDay: Object.entries(hoursByDay).map(([date, hours]) => ({
              date,
              hours: Number(hours.toFixed(2))
            })).sort((a, b) => a.date.localeCompare(b.date))
          };
        }));
        const totalHours = employeeHours.reduce((sum, emp) => sum + emp.totalHours, 0);
        const totalPay = employeeHours.reduce((sum, emp) => sum + emp.estimatedPay, 0);
        const totalShifts = employeeHours.reduce((sum, emp) => sum + emp.totalShifts, 0);
        res.json({
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          employees: employeeHours,
          summary: {
            totalHours: Number(totalHours.toFixed(2)),
            totalPay: Number(totalPay.toFixed(2)),
            totalShifts,
            employeeCount: employeeHours.length
          }
        });
      } catch (error) {
        console.error("Error generating hours report:", error);
        res.status(500).json({ message: "Failed to generate hours report" });
      }
    });
    router3.get("/api/hours/all-employees", requireAuth4, requireRole2(["manager", "admin"]), async (req, res) => {
      try {
        const branchId = req.session.user.branchId;
        const { startDate, endDate } = req.query;
        let periodStart;
        let periodEnd;
        if (startDate && endDate) {
          periodStart = new Date(startDate);
          periodEnd = new Date(endDate);
          if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
          }
          periodEnd.setHours(23, 59, 59, 999);
        } else {
          const now = /* @__PURE__ */ new Date();
          periodStart = startOfMonth(now);
          periodEnd = endOfMonth(now);
        }
        const allEmployees = await storage3.getUsersByBranch(branchId);
        const allPeriods = await storage3.getPayrollPeriodsByBranch(branchId);
        const overlappingPeriods = allPeriods.filter((p) => {
          const pStart = new Date(p.startDate);
          const pEnd = new Date(p.endDate);
          return pStart <= periodEnd && pEnd >= periodStart;
        });
        const employeesWithHours = await Promise.all(allEmployees.map(async (employee) => {
          const shifts2 = await storage3.getShiftsByUser(employee.id, periodStart, periodEnd);
          let totalHours = calculateAllScheduledHours(shifts2);
          if (totalHours === 0 && overlappingPeriods.length > 0) {
            const entries = await storage3.getPayrollEntriesByUser(employee.id);
            for (const entry of entries) {
              if (overlappingPeriods.some((p) => p.id === entry.payrollPeriodId)) {
                totalHours += parseFloat(entry.totalHours || "0");
              }
            }
          }
          return {
            ...employee,
            hoursThisMonth: Number(totalHours.toFixed(2)),
            shiftsThisMonth: shifts2.length
            // Count ALL shifts, not just completed
          };
        }));
        res.json({ employees: employeesWithHours });
      } catch (error) {
        console.error("Error fetching employees with hours:", error);
        res.status(500).json({ message: "Failed to fetch employee hours" });
      }
    });
  }
});

// server/utils/deductions.ts
var deductions_exports = {};
__export(deductions_exports, {
  PAGIBIG_MFS_CAP: () => PAGIBIG_MFS_CAP,
  PAGIBIG_RATE: () => PAGIBIG_RATE,
  PHILHEALTH_CEILING: () => PHILHEALTH_CEILING,
  PHILHEALTH_EMPLOYEE_RATE: () => PHILHEALTH_EMPLOYEE_RATE,
  PHILHEALTH_FLOOR: () => PHILHEALTH_FLOOR,
  calculateAllDeductions: () => calculateAllDeductions,
  calculatePagibig: () => calculatePagibig,
  calculatePhilHealth: () => calculatePhilHealth,
  calculateSSS: () => calculateSSS,
  calculateWithholdingTax: () => calculateWithholdingTax
});
import { eq as eq3 } from "drizzle-orm";
async function calculateSSS(monthlyBasicSalary) {
  try {
    const brackets = await db.select().from(sssContributionTable).where(eq3(sssContributionTable.year, 2026));
    console.log(`[SSS DEBUG] Monthly salary: \u20B1${monthlyBasicSalary.toFixed(2)}, Total brackets found: ${brackets.length}`);
    for (const b of brackets) {
      if (monthlyBasicSalary >= parseFloat(b.minCompensation) && monthlyBasicSalary <= parseFloat(b.maxCompensation)) {
        const share = parseFloat(b.employeeShare);
        console.log(`[SSS DEBUG] Matched bracket: MSC \u20B1${b.monthlySalaryCredit} (range \u20B1${b.minCompensation}-\u20B1${b.maxCompensation}), Employee Share: \u20B1${share.toFixed(2)}`);
        return share;
      }
    }
    console.warn(`[SSS DEBUG] No bracket matched for salary \u20B1${monthlyBasicSalary.toFixed(2)}`);
    return 0;
  } catch (error) {
    console.error("Error calculating SSS:", error);
    return 0;
  }
}
async function calculatePhilHealth(monthlyBasicSalary) {
  try {
    const rates = await dbStorage.getDeductionRatesByType("philhealth");
    const activeRate = rates.find((r) => r.isActive);
    const floor = activeRate ? parseFloat(activeRate.minSalary) : 1e4;
    const ceiling = activeRate?.maxSalary ? parseFloat(activeRate.maxSalary) : 1e5;
    const rate = activeRate?.employeeRate ? parseFloat(activeRate.employeeRate) / 100 : 0.025;
    let baseSalary = monthlyBasicSalary;
    if (baseSalary < floor) baseSalary = floor;
    if (baseSalary > ceiling) baseSalary = ceiling;
    const contribution = baseSalary * rate;
    return Math.round(contribution * 100) / 100;
  } catch (error) {
    console.error("Error calculating PhilHealth:", error);
    return 0;
  }
}
async function calculatePagibig(monthlyBasicSalary) {
  try {
    const rates = await dbStorage.getDeductionRatesByType("pagibig");
    const activeRate = rates.find((r) => r.isActive);
    const cap = activeRate?.maxSalary ? parseFloat(activeRate.maxSalary) : 1e4;
    const rate = activeRate?.employeeRate ? parseFloat(activeRate.employeeRate) / 100 : 0.02;
    let baseSalary = monthlyBasicSalary;
    if (baseSalary > cap) baseSalary = cap;
    const contribution = baseSalary * rate;
    return Math.round(contribution * 100) / 100;
  } catch (error) {
    console.error("Error calculating Pag-IBIG:", error);
    return 0;
  }
}
async function calculateWithholdingTax(monthlyBasicSalary) {
  try {
    const taxRates = await dbStorage.getDeductionRatesByType("tax");
    const activeRates = taxRates.filter((rate) => rate.isActive).sort((a, b) => parseFloat(a.minSalary) - parseFloat(b.minSalary));
    if (activeRates.length === 0) return 0;
    const annualSalary = monthlyBasicSalary * 12;
    let annualTax = 0;
    for (let i = 0; i < activeRates.length; i++) {
      const bracket = activeRates[i];
      const min = parseFloat(bracket.minSalary);
      const max = bracket.maxSalary ? parseFloat(bracket.maxSalary) : Infinity;
      const rate = bracket.employeeRate ? parseFloat(bracket.employeeRate) / 100 : 0;
      if (annualSalary >= min && annualSalary <= max) {
        if (rate === 0) {
          annualTax = 0;
        } else {
          let baseTax = 0;
          for (let j = 0; j < i; j++) {
            const prev = activeRates[j];
            const prevMin = parseFloat(prev.minSalary);
            const prevMax = prev.maxSalary ? parseFloat(prev.maxSalary) : 0;
            const prevRate = prev.employeeRate ? parseFloat(prev.employeeRate) / 100 : 0;
            baseTax += (prevMax - prevMin) * prevRate;
          }
          annualTax = baseTax + (annualSalary - min) * rate;
        }
        break;
      }
    }
    const monthlyTax = annualTax / 12;
    return Math.round(monthlyTax * 100) / 100;
  } catch (error) {
    console.error("Error calculating withholding tax:", error);
    return 0;
  }
}
async function calculateAllDeductions(monthlyBasicSalary, settings) {
  const [sss, philHealth, pagibig, tax] = await Promise.all([
    settings.deductSSS ? calculateSSS(monthlyBasicSalary) : Promise.resolve(0),
    settings.deductPhilHealth ? calculatePhilHealth(monthlyBasicSalary) : Promise.resolve(0),
    settings.deductPagibig ? calculatePagibig(monthlyBasicSalary) : Promise.resolve(0),
    settings.deductWithholdingTax ? calculateWithholdingTax(monthlyBasicSalary) : Promise.resolve(0)
  ]);
  return {
    sssContribution: sss,
    philHealthContribution: philHealth,
    pagibigContribution: pagibig,
    withholdingTax: tax
  };
}
var PHILHEALTH_EMPLOYEE_RATE, PHILHEALTH_FLOOR, PHILHEALTH_CEILING, PAGIBIG_RATE, PAGIBIG_MFS_CAP;
var init_deductions = __esm({
  "server/utils/deductions.ts"() {
    "use strict";
    init_db_storage();
    init_db();
    init_schema();
    PHILHEALTH_EMPLOYEE_RATE = 0.025;
    PHILHEALTH_FLOOR = 1e4;
    PHILHEALTH_CEILING = 1e5;
    PAGIBIG_RATE = 0.02;
    PAGIBIG_MFS_CAP = 1e4;
  }
});

// shared/sss-2026-rates.ts
var sss_2026_rates_exports = {};
__export(sss_2026_rates_exports, {
  calculateSSSEmployeeContribution: () => calculateSSSEmployeeContribution,
  calculateSSSEmployerContribution: () => calculateSSSEmployerContribution,
  findSSSBracket: () => findSSSBracket,
  getSSSBreakdown: () => getSSSBreakdown,
  sss2026Brackets: () => sss2026Brackets
});
function findSSSBracket(monthlySalary) {
  const bracket = sss2026Brackets.find((b) => {
    if (b.maxSalary === null) {
      return monthlySalary >= b.minSalary;
    }
    return monthlySalary >= b.minSalary && monthlySalary <= b.maxSalary;
  });
  return bracket || sss2026Brackets[0];
}
function calculateSSSEmployeeContribution(monthlySalary) {
  const bracket = findSSSBracket(monthlySalary);
  return bracket.totalEE;
}
function calculateSSSEmployerContribution(monthlySalary) {
  const bracket = findSSSBracket(monthlySalary);
  return bracket.totalER;
}
function getSSSBreakdown(monthlySalary) {
  const bracket = findSSSBracket(monthlySalary);
  return {
    monthlySalaryCredit: bracket.totalMSC,
    regularSSMSC: bracket.regularSSMSC,
    mpfMSC: bracket.mpfMSC,
    employee: {
      regularSS: bracket.regularSSEE,
      mpf: bracket.mpfEE,
      total: bracket.totalEE
    },
    employer: {
      regularSS: bracket.regularSSER,
      mpf: bracket.mpfER,
      ec: bracket.ecER,
      total: bracket.totalER
    },
    totalContributions: bracket.totalContributions
  };
}
var sss2026Brackets;
var init_sss_2026_rates = __esm({
  "shared/sss-2026-rates.ts"() {
    "use strict";
    sss2026Brackets = [
      { minSalary: 0, maxSalary: 5249.99, regularSSMSC: 5e3, mpfMSC: 0, totalMSC: 5e3, regularSSER: 500, mpfER: 0, ecER: 10, totalER: 510, regularSSEE: 250, mpfEE: 0, totalEE: 250, totalContributions: 760 },
      { minSalary: 5250, maxSalary: 5749.99, regularSSMSC: 5500, mpfMSC: 0, totalMSC: 5500, regularSSER: 550, mpfER: 0, ecER: 10, totalER: 560, regularSSEE: 275, mpfEE: 0, totalEE: 275, totalContributions: 835 },
      { minSalary: 5750, maxSalary: 6249.99, regularSSMSC: 6e3, mpfMSC: 0, totalMSC: 6e3, regularSSER: 600, mpfER: 0, ecER: 10, totalER: 610, regularSSEE: 300, mpfEE: 0, totalEE: 300, totalContributions: 910 },
      { minSalary: 6250, maxSalary: 6749.99, regularSSMSC: 6500, mpfMSC: 0, totalMSC: 6500, regularSSER: 650, mpfER: 0, ecER: 10, totalER: 660, regularSSEE: 325, mpfEE: 0, totalEE: 325, totalContributions: 985 },
      { minSalary: 6750, maxSalary: 7249.99, regularSSMSC: 7e3, mpfMSC: 0, totalMSC: 7e3, regularSSER: 700, mpfER: 0, ecER: 10, totalER: 710, regularSSEE: 350, mpfEE: 0, totalEE: 350, totalContributions: 1060 },
      { minSalary: 7250, maxSalary: 7749.99, regularSSMSC: 7500, mpfMSC: 0, totalMSC: 7500, regularSSER: 750, mpfER: 0, ecER: 10, totalER: 760, regularSSEE: 375, mpfEE: 0, totalEE: 375, totalContributions: 1135 },
      { minSalary: 7750, maxSalary: 8249.99, regularSSMSC: 8e3, mpfMSC: 0, totalMSC: 8e3, regularSSER: 800, mpfER: 0, ecER: 10, totalER: 810, regularSSEE: 400, mpfEE: 0, totalEE: 400, totalContributions: 1210 },
      { minSalary: 8250, maxSalary: 8749.99, regularSSMSC: 8500, mpfMSC: 0, totalMSC: 8500, regularSSER: 850, mpfER: 0, ecER: 10, totalER: 860, regularSSEE: 425, mpfEE: 0, totalEE: 425, totalContributions: 1285 },
      { minSalary: 8750, maxSalary: 9249.99, regularSSMSC: 9e3, mpfMSC: 0, totalMSC: 9e3, regularSSER: 900, mpfER: 0, ecER: 10, totalER: 910, regularSSEE: 450, mpfEE: 0, totalEE: 450, totalContributions: 1360 },
      { minSalary: 9250, maxSalary: 9749.99, regularSSMSC: 9500, mpfMSC: 0, totalMSC: 9500, regularSSER: 950, mpfER: 0, ecER: 10, totalER: 960, regularSSEE: 475, mpfEE: 0, totalEE: 475, totalContributions: 1435 },
      { minSalary: 9750, maxSalary: 10249.99, regularSSMSC: 1e4, mpfMSC: 0, totalMSC: 1e4, regularSSER: 1e3, mpfER: 0, ecER: 10, totalER: 1010, regularSSEE: 500, mpfEE: 0, totalEE: 500, totalContributions: 1510 },
      { minSalary: 10250, maxSalary: 10749.99, regularSSMSC: 10500, mpfMSC: 0, totalMSC: 10500, regularSSER: 1050, mpfER: 0, ecER: 10, totalER: 1060, regularSSEE: 525, mpfEE: 0, totalEE: 525, totalContributions: 1585 },
      { minSalary: 10750, maxSalary: 11249.99, regularSSMSC: 11e3, mpfMSC: 0, totalMSC: 11e3, regularSSER: 1100, mpfER: 0, ecER: 10, totalER: 1110, regularSSEE: 550, mpfEE: 0, totalEE: 550, totalContributions: 1660 },
      { minSalary: 11250, maxSalary: 11749.99, regularSSMSC: 11500, mpfMSC: 0, totalMSC: 11500, regularSSER: 1150, mpfER: 0, ecER: 10, totalER: 1160, regularSSEE: 575, mpfEE: 0, totalEE: 575, totalContributions: 1735 },
      { minSalary: 11750, maxSalary: 12249.99, regularSSMSC: 12e3, mpfMSC: 0, totalMSC: 12e3, regularSSER: 1200, mpfER: 0, ecER: 10, totalER: 1210, regularSSEE: 600, mpfEE: 0, totalEE: 600, totalContributions: 1810 },
      { minSalary: 12250, maxSalary: 12749.99, regularSSMSC: 12500, mpfMSC: 0, totalMSC: 12500, regularSSER: 1250, mpfER: 0, ecER: 10, totalER: 1260, regularSSEE: 625, mpfEE: 0, totalEE: 625, totalContributions: 1885 },
      { minSalary: 12750, maxSalary: 13249.99, regularSSMSC: 13e3, mpfMSC: 0, totalMSC: 13e3, regularSSER: 1300, mpfER: 0, ecER: 10, totalER: 1310, regularSSEE: 650, mpfEE: 0, totalEE: 650, totalContributions: 1960 },
      { minSalary: 13250, maxSalary: 13749.99, regularSSMSC: 13500, mpfMSC: 0, totalMSC: 13500, regularSSER: 1350, mpfER: 0, ecER: 10, totalER: 1360, regularSSEE: 675, mpfEE: 0, totalEE: 675, totalContributions: 2035 },
      { minSalary: 13750, maxSalary: 14249.99, regularSSMSC: 14e3, mpfMSC: 0, totalMSC: 14e3, regularSSER: 1400, mpfER: 0, ecER: 10, totalER: 1410, regularSSEE: 700, mpfEE: 0, totalEE: 700, totalContributions: 2110 },
      { minSalary: 14250, maxSalary: 14749.99, regularSSMSC: 14500, mpfMSC: 0, totalMSC: 14500, regularSSER: 1450, mpfER: 0, ecER: 10, totalER: 1460, regularSSEE: 725, mpfEE: 0, totalEE: 725, totalContributions: 2185 },
      { minSalary: 14750, maxSalary: 15249.99, regularSSMSC: 15e3, mpfMSC: 0, totalMSC: 15e3, regularSSER: 1500, mpfER: 0, ecER: 30, totalER: 1530, regularSSEE: 750, mpfEE: 0, totalEE: 750, totalContributions: 2280 },
      { minSalary: 15250, maxSalary: 15749.99, regularSSMSC: 15500, mpfMSC: 0, totalMSC: 15500, regularSSER: 1550, mpfER: 0, ecER: 30, totalER: 1580, regularSSEE: 775, mpfEE: 0, totalEE: 775, totalContributions: 2355 },
      { minSalary: 15750, maxSalary: 16249.99, regularSSMSC: 16e3, mpfMSC: 0, totalMSC: 16e3, regularSSER: 1600, mpfER: 0, ecER: 30, totalER: 1630, regularSSEE: 800, mpfEE: 0, totalEE: 800, totalContributions: 2430 },
      { minSalary: 16250, maxSalary: 16749.99, regularSSMSC: 16500, mpfMSC: 0, totalMSC: 16500, regularSSER: 1650, mpfER: 0, ecER: 30, totalER: 1680, regularSSEE: 825, mpfEE: 0, totalEE: 825, totalContributions: 2505 },
      { minSalary: 16750, maxSalary: 17249.99, regularSSMSC: 17e3, mpfMSC: 0, totalMSC: 17e3, regularSSER: 1700, mpfER: 0, ecER: 30, totalER: 1730, regularSSEE: 850, mpfEE: 0, totalEE: 850, totalContributions: 2580 },
      { minSalary: 17250, maxSalary: 17749.99, regularSSMSC: 17500, mpfMSC: 0, totalMSC: 17500, regularSSER: 1750, mpfER: 0, ecER: 30, totalER: 1780, regularSSEE: 875, mpfEE: 0, totalEE: 875, totalContributions: 2655 },
      { minSalary: 17750, maxSalary: 18249.99, regularSSMSC: 18e3, mpfMSC: 0, totalMSC: 18e3, regularSSER: 1800, mpfER: 0, ecER: 30, totalER: 1830, regularSSEE: 900, mpfEE: 0, totalEE: 900, totalContributions: 2730 },
      { minSalary: 18250, maxSalary: 18749.99, regularSSMSC: 18500, mpfMSC: 0, totalMSC: 18500, regularSSER: 1850, mpfER: 0, ecER: 30, totalER: 1880, regularSSEE: 925, mpfEE: 0, totalEE: 925, totalContributions: 2805 },
      { minSalary: 18750, maxSalary: 19249.99, regularSSMSC: 19e3, mpfMSC: 0, totalMSC: 19e3, regularSSER: 1900, mpfER: 0, ecER: 30, totalER: 1930, regularSSEE: 950, mpfEE: 0, totalEE: 950, totalContributions: 2880 },
      { minSalary: 19250, maxSalary: 19749.99, regularSSMSC: 19500, mpfMSC: 0, totalMSC: 19500, regularSSER: 1950, mpfER: 0, ecER: 30, totalER: 1980, regularSSEE: 975, mpfEE: 0, totalEE: 975, totalContributions: 2955 },
      { minSalary: 19750, maxSalary: 20249.99, regularSSMSC: 2e4, mpfMSC: 0, totalMSC: 2e4, regularSSER: 2e3, mpfER: 0, ecER: 30, totalER: 2030, regularSSEE: 1e3, mpfEE: 0, totalEE: 1e3, totalContributions: 3030 },
      // MPF/WISP brackets start (salary above ₱20,000)
      { minSalary: 20250, maxSalary: 20749.99, regularSSMSC: 2e4, mpfMSC: 500, totalMSC: 20500, regularSSER: 2e3, mpfER: 50, ecER: 30, totalER: 2080, regularSSEE: 1e3, mpfEE: 25, totalEE: 1025, totalContributions: 3105 },
      { minSalary: 20750, maxSalary: 21249.99, regularSSMSC: 2e4, mpfMSC: 1e3, totalMSC: 21e3, regularSSER: 2e3, mpfER: 100, ecER: 30, totalER: 2130, regularSSEE: 1e3, mpfEE: 50, totalEE: 1050, totalContributions: 3180 },
      { minSalary: 21250, maxSalary: 21749.99, regularSSMSC: 2e4, mpfMSC: 1500, totalMSC: 21500, regularSSER: 2e3, mpfER: 150, ecER: 30, totalER: 2180, regularSSEE: 1e3, mpfEE: 75, totalEE: 1075, totalContributions: 3255 },
      { minSalary: 21750, maxSalary: 22249.99, regularSSMSC: 2e4, mpfMSC: 2e3, totalMSC: 22e3, regularSSER: 2e3, mpfER: 200, ecER: 30, totalER: 2230, regularSSEE: 1e3, mpfEE: 100, totalEE: 1100, totalContributions: 3330 },
      { minSalary: 22250, maxSalary: 22749.99, regularSSMSC: 2e4, mpfMSC: 2500, totalMSC: 22500, regularSSER: 2e3, mpfER: 250, ecER: 30, totalER: 2280, regularSSEE: 1e3, mpfEE: 125, totalEE: 1125, totalContributions: 3405 },
      { minSalary: 22750, maxSalary: 23249.99, regularSSMSC: 2e4, mpfMSC: 3e3, totalMSC: 23e3, regularSSER: 2e3, mpfER: 300, ecER: 30, totalER: 2330, regularSSEE: 1e3, mpfEE: 150, totalEE: 1150, totalContributions: 3480 },
      { minSalary: 23250, maxSalary: 23749.99, regularSSMSC: 2e4, mpfMSC: 3500, totalMSC: 23500, regularSSER: 2e3, mpfER: 350, ecER: 30, totalER: 2380, regularSSEE: 1e3, mpfEE: 175, totalEE: 1175, totalContributions: 3555 },
      { minSalary: 23750, maxSalary: 24249.99, regularSSMSC: 2e4, mpfMSC: 4e3, totalMSC: 24e3, regularSSER: 2e3, mpfER: 400, ecER: 30, totalER: 2430, regularSSEE: 1e3, mpfEE: 200, totalEE: 1200, totalContributions: 3630 },
      { minSalary: 24250, maxSalary: 24749.99, regularSSMSC: 2e4, mpfMSC: 4500, totalMSC: 24500, regularSSER: 2e3, mpfER: 450, ecER: 30, totalER: 2480, regularSSEE: 1e3, mpfEE: 225, totalEE: 1225, totalContributions: 3705 },
      { minSalary: 24750, maxSalary: 25249.99, regularSSMSC: 2e4, mpfMSC: 5e3, totalMSC: 25e3, regularSSER: 2e3, mpfER: 500, ecER: 30, totalER: 2530, regularSSEE: 1e3, mpfEE: 250, totalEE: 1250, totalContributions: 3780 },
      { minSalary: 25250, maxSalary: 25749.99, regularSSMSC: 2e4, mpfMSC: 5500, totalMSC: 25500, regularSSER: 2e3, mpfER: 550, ecER: 30, totalER: 2580, regularSSEE: 1e3, mpfEE: 275, totalEE: 1275, totalContributions: 3855 },
      { minSalary: 25750, maxSalary: 26249.99, regularSSMSC: 2e4, mpfMSC: 6e3, totalMSC: 26e3, regularSSER: 2e3, mpfER: 600, ecER: 30, totalER: 2630, regularSSEE: 1e3, mpfEE: 300, totalEE: 1300, totalContributions: 3930 },
      { minSalary: 26250, maxSalary: 26749.99, regularSSMSC: 2e4, mpfMSC: 6500, totalMSC: 26500, regularSSER: 2e3, mpfER: 650, ecER: 30, totalER: 2680, regularSSEE: 1e3, mpfEE: 325, totalEE: 1325, totalContributions: 4005 },
      { minSalary: 26750, maxSalary: 27249.99, regularSSMSC: 2e4, mpfMSC: 7e3, totalMSC: 27e3, regularSSER: 2e3, mpfER: 700, ecER: 30, totalER: 2730, regularSSEE: 1e3, mpfEE: 350, totalEE: 1350, totalContributions: 4080 },
      { minSalary: 27250, maxSalary: 27749.99, regularSSMSC: 2e4, mpfMSC: 7500, totalMSC: 27500, regularSSER: 2e3, mpfER: 750, ecER: 30, totalER: 2780, regularSSEE: 1e3, mpfEE: 375, totalEE: 1375, totalContributions: 4155 },
      { minSalary: 27750, maxSalary: 28249.99, regularSSMSC: 2e4, mpfMSC: 8e3, totalMSC: 28e3, regularSSER: 2e3, mpfER: 800, ecER: 30, totalER: 2830, regularSSEE: 1e3, mpfEE: 400, totalEE: 1400, totalContributions: 4230 },
      { minSalary: 28250, maxSalary: 28749.99, regularSSMSC: 2e4, mpfMSC: 8500, totalMSC: 28500, regularSSER: 2e3, mpfER: 850, ecER: 30, totalER: 2880, regularSSEE: 1e3, mpfEE: 425, totalEE: 1425, totalContributions: 4305 },
      { minSalary: 28750, maxSalary: 29249.99, regularSSMSC: 2e4, mpfMSC: 9e3, totalMSC: 29e3, regularSSER: 2e3, mpfER: 900, ecER: 30, totalER: 2930, regularSSEE: 1e3, mpfEE: 450, totalEE: 1450, totalContributions: 4380 },
      { minSalary: 29250, maxSalary: 29749.99, regularSSMSC: 2e4, mpfMSC: 9500, totalMSC: 29500, regularSSER: 2e3, mpfER: 950, ecER: 30, totalER: 2980, regularSSEE: 1e3, mpfEE: 475, totalEE: 1475, totalContributions: 4455 },
      { minSalary: 29750, maxSalary: 30249.99, regularSSMSC: 2e4, mpfMSC: 1e4, totalMSC: 3e4, regularSSER: 2e3, mpfER: 1e3, ecER: 30, totalER: 3030, regularSSEE: 1e3, mpfEE: 500, totalEE: 1500, totalContributions: 4530 },
      { minSalary: 30250, maxSalary: 30749.99, regularSSMSC: 2e4, mpfMSC: 10500, totalMSC: 30500, regularSSER: 2e3, mpfER: 1050, ecER: 30, totalER: 3080, regularSSEE: 1e3, mpfEE: 525, totalEE: 1525, totalContributions: 4605 },
      { minSalary: 30750, maxSalary: 31249.99, regularSSMSC: 2e4, mpfMSC: 11e3, totalMSC: 31e3, regularSSER: 2e3, mpfER: 1100, ecER: 30, totalER: 3130, regularSSEE: 1e3, mpfEE: 550, totalEE: 1550, totalContributions: 4680 },
      { minSalary: 31250, maxSalary: 31749.99, regularSSMSC: 2e4, mpfMSC: 11500, totalMSC: 31500, regularSSER: 2e3, mpfER: 1150, ecER: 30, totalER: 3180, regularSSEE: 1e3, mpfEE: 575, totalEE: 1575, totalContributions: 4755 },
      { minSalary: 31750, maxSalary: 32249.99, regularSSMSC: 2e4, mpfMSC: 12e3, totalMSC: 32e3, regularSSER: 2e3, mpfER: 1200, ecER: 30, totalER: 3230, regularSSEE: 1e3, mpfEE: 600, totalEE: 1600, totalContributions: 4830 },
      { minSalary: 32250, maxSalary: 32749.99, regularSSMSC: 2e4, mpfMSC: 12500, totalMSC: 32500, regularSSER: 2e3, mpfER: 1250, ecER: 30, totalER: 3280, regularSSEE: 1e3, mpfEE: 625, totalEE: 1625, totalContributions: 4905 },
      { minSalary: 32750, maxSalary: 33249.99, regularSSMSC: 2e4, mpfMSC: 13e3, totalMSC: 33e3, regularSSER: 2e3, mpfER: 1300, ecER: 30, totalER: 3330, regularSSEE: 1e3, mpfEE: 650, totalEE: 1650, totalContributions: 4980 },
      { minSalary: 33250, maxSalary: 33749.99, regularSSMSC: 2e4, mpfMSC: 13500, totalMSC: 33500, regularSSER: 2e3, mpfER: 1350, ecER: 30, totalER: 3380, regularSSEE: 1e3, mpfEE: 675, totalEE: 1675, totalContributions: 5055 },
      { minSalary: 33750, maxSalary: 34249.99, regularSSMSC: 2e4, mpfMSC: 14e3, totalMSC: 34e3, regularSSER: 2e3, mpfER: 1400, ecER: 30, totalER: 3430, regularSSEE: 1e3, mpfEE: 700, totalEE: 1700, totalContributions: 5130 },
      { minSalary: 34250, maxSalary: 34749.99, regularSSMSC: 2e4, mpfMSC: 14500, totalMSC: 34500, regularSSER: 2e3, mpfER: 1450, ecER: 30, totalER: 3480, regularSSEE: 1e3, mpfEE: 725, totalEE: 1725, totalContributions: 5205 },
      { minSalary: 34750, maxSalary: null, regularSSMSC: 2e4, mpfMSC: 15e3, totalMSC: 35e3, regularSSER: 2e3, mpfER: 1500, ecER: 30, totalER: 3530, regularSSEE: 1e3, mpfEE: 750, totalEE: 1750, totalContributions: 5280 }
    ];
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";
import compression from "compression";

// server/routes.ts
init_db_storage();
init_schema();
import { createServer } from "http";
import session2 from "express-session";
import PgSession from "connect-pg-simple";
import cors from "cors";
import { z as z5 } from "zod";

// server/routes/branches.ts
init_db_storage();
import { z as z2 } from "zod";
var requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  req.user = req.session.user;
  next();
};
var requireManagerOrAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role !== "manager" && role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};
var requireAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role !== "admin") {
    return res.status(403).json({ message: "Admin permissions required" });
  }
  next();
};
function registerBranchesRoutes(router13) {
  router13.get("/api/branches", requireAuth, async (req, res) => {
    try {
      const allBranches = await dbStorage.getAllBranches();
      res.json({ branches: allBranches });
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });
  router13.get("/api/branches/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const branch = await dbStorage.getBranch(id);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(branch);
    } catch (error) {
      console.error("Error fetching branch:", error);
      res.status(500).json({ message: "Failed to fetch branch" });
    }
  });
  router13.post("/api/branches", requireAuth, requireAdmin, async (req, res) => {
    try {
      console.log("Received request body:", req.body);
      const schema = z2.object({
        name: z2.string().min(1, "Name is required"),
        address: z2.string().min(1, "Address is required"),
        phone: z2.string().optional(),
        isActive: z2.boolean().default(true)
      });
      const result = schema.safeParse(req.body);
      if (!result.success) {
        console.log("Validation error:", result.error);
        return res.status(400).json({
          message: "Validation error",
          errors: result.error.flatten().fieldErrors
        });
      }
      const newBranch = await dbStorage.createBranch({
        name: result.data.name,
        address: result.data.address,
        phone: result.data.phone,
        isActive: result.data.isActive
      });
      console.log("Branch created:", newBranch);
      res.status(201).json(newBranch);
    } catch (error) {
      console.error("Error creating branch:", error);
      res.status(500).json({
        message: "Failed to create branch",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  const handleUpdate = async (req, res) => {
    try {
      const { id } = req.params;
      if (req.user?.role === "manager" && req.user?.branchId !== id) {
        return res.status(403).json({ message: "Managers can only modify their own branch" });
      }
      const schema = z2.object({
        name: z2.string().min(1, "Name is required").optional(),
        address: z2.string().min(1, "Address is required").optional(),
        phone: z2.string().optional(),
        isActive: z2.boolean().optional()
      });
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: result.error.flatten().fieldErrors
        });
      }
      const updatedBranch = await dbStorage.updateBranch(id, result.data);
      if (!updatedBranch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      res.json(updatedBranch);
    } catch (error) {
      console.error("Error updating branch:", error);
      res.status(500).json({ message: "Failed to update branch" });
    }
  };
  router13.put("/api/branches/:id", requireAuth, requireManagerOrAdmin, handleUpdate);
  router13.patch("/api/branches/:id", requireAuth, requireManagerOrAdmin, handleUpdate);
  router13.delete("/api/branches/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedBranch = await dbStorage.updateBranch(id, { isActive: false });
      if (!updatedBranch) {
        return res.status(404).json({ message: "Active branch not found" });
      }
      res.json({ message: "Branch deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating branch:", error);
      res.status(500).json({ message: "Failed to deactivate branch" });
    }
  });
}

// server/routes/employees.ts
init_db_storage();
import { Router as Router2 } from "express";

// server/routes/audit.ts
init_db_storage();
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
var _realTimeManager = null;
function setAuditRealTimeManager(rtm) {
  _realTimeManager = rtm;
}
var router = Router();
var requireAuth2 = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  req.user = req.session.user;
  next();
};
var requireManagerRole = (req, res, next) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};
router.get("/api/audit-logs", requireAuth2, requireManagerRole, async (req, res) => {
  try {
    const {
      entityType,
      action,
      startDate,
      endDate,
      limit = "50",
      offset = "0"
    } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 500);
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);
    const logs = await dbStorage.getAuditLogs({
      entityType,
      action,
      startDate: startDate ? new Date(startDate) : void 0,
      endDate: endDate ? new Date(endDate) : void 0,
      limit: parsedLimit,
      offset: parsedOffset
    });
    const enrichedLogs = await Promise.all(logs.map(async (log2) => {
      let userName = "Unknown";
      try {
        const user = await dbStorage.getUser(log2.userId);
        if (user) {
          userName = `${user.firstName} ${user.lastName}`;
        }
      } catch (e) {
      }
      return { ...log2, userName };
    }));
    const stats = await dbStorage.getAuditLogStats();
    res.json({ logs: enrichedLogs, total: stats.totalLogs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});
router.post("/api/audit-logs", requireAuth2, requireManagerRole, async (req, res) => {
  try {
    const { action, entityType, entityId, oldValues, newValues, reason } = req.body;
    if (!action || !entityType || !entityId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const log2 = await dbStorage.createAuditLog({
      id: uuidv4(),
      action,
      entityType,
      entityId,
      userId: req.user.id,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      reason,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"]
    });
    if (_realTimeManager) {
      let userName = "Unknown";
      try {
        const user = await dbStorage.getUser(req.user.id);
        if (user) userName = `${user.firstName} ${user.lastName}`;
      } catch (e) {
      }
      _realTimeManager.broadcastAuditLogCreated({ ...log2, userName }, req.user.branchId);
    }
    res.status(201).json({ log: log2 });
  } catch (error) {
    console.error("Error creating audit log:", error);
    res.status(500).json({ message: "Failed to create audit log" });
  }
});
router.get("/api/audit-logs/stats", requireAuth2, requireManagerRole, async (req, res) => {
  try {
    const stats = await dbStorage.getAuditLogStats();
    res.json({ stats });
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    res.status(500).json({ message: "Failed to fetch audit log stats" });
  }
});
router.get("/api/audit-logs/export", requireAuth2, requireManagerRole, async (req, res) => {
  try {
    const { entityType, action, startDate, endDate } = req.query;
    const logs = await dbStorage.getAuditLogs({
      entityType,
      action,
      startDate: startDate ? new Date(startDate) : void 0,
      endDate: endDate ? new Date(endDate) : void 0,
      limit: 1e4,
      offset: 0
    });
    const enrichedLogs = await Promise.all(logs.map(async (log2) => {
      let userName = "Unknown";
      try {
        const user = await dbStorage.getUser(log2.userId);
        if (user) userName = `${user.firstName} ${user.lastName}`;
      } catch (e) {
      }
      return { ...log2, userName };
    }));
    const headers = ["Timestamp", "Action", "Entity Type", "Entity ID", "User", "Old Values", "New Values", "Reason", "IP Address"];
    const rows = enrichedLogs.map((log2) => [
      log2.createdAt ? new Date(log2.createdAt).toISOString() : "",
      log2.action,
      log2.entityType,
      log2.entityId,
      log2.userName,
      log2.oldValues || "",
      log2.newValues || "",
      log2.reason || "",
      log2.ipAddress || ""
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = "\uFEFFsep=,\n" + [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="audit-logs-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`);
    res.end(Buffer.from(csv, "utf8"));
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    res.status(500).json({ message: "Failed to export audit logs" });
  }
});
async function createAuditLog(params) {
  try {
    const log2 = await dbStorage.createAuditLog({
      id: uuidv4(),
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValues: params.newValues ? JSON.stringify(params.newValues) : null,
      reason: params.reason || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null
    });
    if (_realTimeManager) {
      let userName = "Unknown";
      let branchId = params.branchId;
      try {
        const user = await dbStorage.getUser(params.userId);
        if (user) {
          userName = `${user.firstName} ${user.lastName}`;
          if (!branchId) branchId = user.branchId;
        }
      } catch (e) {
      }
      _realTimeManager.broadcastAuditLogCreated({ ...log2, userName }, branchId);
    }
    return log2;
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

// server/routes/employees.ts
var storage = dbStorage;
function createEmployeeRouter(realTimeManager) {
  const router13 = Router2();
  const requireAuth10 = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  const requireRole3 = (roles) => (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const effectiveRoles = [...roles];
    if (roles.includes("manager") && !roles.includes("admin")) {
      effectiveRoles.push("admin");
    }
    if (!effectiveRoles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
  router13.get("/api/employees", requireAuth10, async (req, res) => {
    try {
      const branchId = req.session.user?.branchId;
      if (!branchId) return res.status(400).json({ message: "Branch ID not found in session" });
      const employees = await storage.getUsersByBranch(branchId);
      let sanitizedEmployees = employees.map((emp) => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        position: emp.position,
        branchId: emp.branchId,
        role: emp.role,
        isActive: emp.isActive ?? true,
        // Include isActive for client-side filtering
        photoUrl: emp.photoUrl || null
        // Profile picture for schedule avatars
      }));
      res.json({ employees: sanitizedEmployees });
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  router13.get("/api/employees/all-branches", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const sanitizedEmployees = allUsers.map((emp) => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        position: emp.position,
        branchId: emp.branchId,
        role: emp.role,
        isActive: emp.isActive ?? true
      }));
      res.json({ employees: sanitizedEmployees });
    } catch (error) {
      console.error("Error fetching all employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  router13.get("/api/employees/stats", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const branchId = req.session.user?.branchId;
      if (!branchId) return res.status(400).json({ message: "Branch ID not found in session" });
      const users2 = await storage.getUsersByBranch(branchId);
      const totalEmployees = users2.length;
      const activeEmployees = users2.filter((user) => user.isActive).length;
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
      const periodsThisMonth = allPeriods.filter((p) => {
        const pStart = new Date(p.startDate);
        const pEnd = new Date(p.endDate);
        return pStart <= monthEnd && pEnd >= monthStart;
      });
      let totalHoursThisMonth = 0;
      for (const user of users2) {
        const shifts2 = await storage.getShiftsByUser(user.id, monthStart, monthEnd);
        let userHours = 0;
        for (const shift of shifts2) {
          const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1e3 * 60 * 60);
          userHours += hours;
        }
        if (userHours === 0 && periodsThisMonth.length > 0) {
          const entries = await storage.getPayrollEntriesByUser(user.id);
          for (const entry of entries) {
            if (periodsThisMonth.some((p) => p.id === entry.payrollPeriodId)) {
              userHours += parseFloat(entry.totalHours || "0");
            }
          }
        }
        totalHoursThisMonth += userHours;
      }
      let totalPayrollThisMonth = 0;
      for (const user of users2) {
        const entries = await storage.getPayrollEntriesByUser(user.id);
        for (const entry of entries) {
          if (periodsThisMonth.some((p) => p.id === entry.payrollPeriodId)) {
            totalPayrollThisMonth += parseFloat(entry.grossPay);
          }
        }
      }
      let totalPerformanceScore = 0;
      let employeesWithShifts = 0;
      for (const user of users2) {
        const shifts2 = await storage.getShiftsByUser(user.id, monthStart, monthEnd);
        if (shifts2.length > 0) {
          const completedShifts = shifts2.filter((s) => s.status === "completed").length;
          const performanceScore = completedShifts / shifts2.length * 5;
          totalPerformanceScore += performanceScore;
          employeesWithShifts++;
        }
      }
      const averagePerformance = employeesWithShifts > 0 ? Number((totalPerformanceScore / employeesWithShifts).toFixed(1)) : 0;
      res.json({
        totalEmployees,
        activeEmployees,
        totalHoursThisMonth: Number(totalHoursThisMonth.toFixed(2)),
        totalPayrollThisMonth: Number(totalPayrollThisMonth.toFixed(2)),
        averagePerformance
      });
    } catch (error) {
      console.error("Error fetching employee stats:", error);
      res.status(500).json({ message: "Failed to fetch employee stats" });
    }
  });
  router13.get("/api/employees/performance", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const branchId = req.session.user?.branchId;
      if (!branchId) return res.status(400).json({ message: "Branch ID not found in session" });
      const users2 = await storage.getUsersByBranch(branchId);
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const performanceData = await Promise.all(users2.map(async (user) => {
        const shifts2 = await storage.getShiftsByUser(user.id, monthStart, monthEnd);
        let hoursThisMonth = 0;
        for (const shift of shifts2) {
          const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1e3 * 60 * 60);
          hoursThisMonth += hours;
        }
        const completedShifts = shifts2.filter((s) => s.status === "completed").length;
        const missedShifts = shifts2.filter((s) => s.status === "missed").length;
        const totalShifts = shifts2.length;
        let rating = 5;
        if (totalShifts > 0) {
          rating = 5 - missedShifts / totalShifts * 2;
          if (completedShifts === totalShifts && totalShifts > 0) {
            rating = 5;
          }
          rating = Math.max(0, Math.min(5, rating));
        }
        return {
          employeeId: user.id,
          employeeName: `${user.firstName} ${user.lastName}`,
          rating: Number(rating.toFixed(1)),
          hoursThisMonth: Number(hoursThisMonth.toFixed(2)),
          shiftsThisMonth: totalShifts
        };
      }));
      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching employee performance:", error);
      res.status(500).json({ message: "Failed to fetch employee performance" });
    }
  });
  router13.get("/api/employees/:id", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getUser(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (req.session.user?.role === "manager" && req.session.user?.branchId !== employee.branchId) {
        return res.status(403).json({ message: "Unauthorized to view this employee" });
      }
      const { password, ...sanitizedEmployee } = employee;
      res.json(sanitizedEmployee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });
  router13.post("/api/employees", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const {
        username,
        password,
        firstName,
        lastName,
        email,
        role = "employee",
        position,
        hourlyRate,
        branchId,
        isActive = true,
        tin,
        sssNumber,
        philhealthNumber,
        pagibigNumber,
        isMwe
      } = req.body;
      if (!username || !password || !firstName || !lastName || !email || !position || !hourlyRate || !branchId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const parsedRate = parseFloat(String(hourlyRate));
      if (isNaN(parsedRate) || parsedRate < 0) {
        return res.status(400).json({ message: "hourlyRate must be a non-negative number" });
      }
      const calculatedDailyRate = parsedRate * 8;
      const allowedRoles = req.session.user?.role === "admin" ? ["employee", "manager", "admin"] : ["employee"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role. Allowed: ${allowedRoles.join(", ")}` });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      console.log(`\u{1F464} [POST /api/employees] Attempting to create employee: ${username} (${role})`);
      const newEmployee = await storage.createUser({
        username,
        password,
        // Pass plain password - createUser will hash it
        firstName,
        lastName,
        email,
        role,
        position,
        hourlyRate: String(hourlyRate),
        // Convert to string
        branchId,
        isActive,
        tin: tin || null,
        sssNumber: sssNumber || null,
        philhealthNumber: philhealthNumber || null,
        pagibigNumber: pagibigNumber || null,
        isMwe: !!isMwe,
        dailyRate: calculatedDailyRate.toString()
      });
      if (!newEmployee) {
        console.error(`\u274C [POST /api/employees] storage.createUser returned null for ${username}`);
        return res.status(500).json({ message: "Failed to create employee in database" });
      }
      console.log(`\u2705 [POST /api/employees] Successfully created employee: ${newEmployee.username} (ID: ${newEmployee.id})`);
      const { password: _, ...result } = newEmployee;
      realTimeManager.broadcastEmployeeCreated(result);
      await createAuditLog({
        action: "employee_create",
        entityType: "employee",
        entityId: newEmployee.id,
        userId: req.session.user.id,
        newValues: { firstName: result.firstName, lastName: result.lastName, email: result.email, role: result.role, position: result.position, branchId: result.branchId },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating employee:", error);
      let message = "Failed to create employee";
      if (error.message?.includes("UNIQUE constraint failed")) {
        if (error.message?.includes("username")) {
          message = "Username already exists";
        } else if (error.message?.includes("email")) {
          message = "Email already in use";
        }
      } else if (error.message?.includes("Username already exists")) {
        message = "Username already exists";
      } else if (error.message?.includes("Email already in use")) {
        message = "Email already in use";
      } else if (error.message) {
        message = error.message;
      }
      res.status(500).json({ message });
    }
  });
  router13.put("/api/employees/:id", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const existingEmployee = await storage.getUser(id);
      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (req.session.user?.role === "manager" && req.session.user?.branchId !== existingEmployee.branchId) {
        return res.status(403).json({ message: "Unauthorized to update this employee" });
      }
      if (existingEmployee.role === "admin" && req.session.user?.role !== "admin") {
        return res.status(403).json({ message: "Only admins can modify admin accounts" });
      }
      const updates = {};
      const allowedFields = ["username", "password", "firstName", "lastName", "email", "position", "hourlyRate", "role", "isActive", "branchId", "tin", "sssNumber", "philhealthNumber", "pagibigNumber", "isMwe"];
      for (const field of allowedFields) {
        if (body[field] !== void 0) {
          if (field === "password") {
            if (typeof body[field] === "string" && body[field].trim().length > 0) {
              updates[field] = body[field];
            }
          } else if (["tin", "sssNumber", "philhealthNumber", "pagibigNumber"].includes(field) && body[field] === "") {
            updates[field] = null;
          } else {
            updates[field] = body[field];
          }
        }
      }
      if (updates.username && updates.username !== existingEmployee.username) {
        const existingUserWithUsername = await storage.getUserByUsername(updates.username);
        if (existingUserWithUsername && existingUserWithUsername.id !== id) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      if (updates.role && updates.role !== existingEmployee.role) {
        const allowedRoles = req.session.user?.role === "admin" ? ["employee", "manager", "admin"] : ["employee"];
        if (!allowedRoles.includes(updates.role)) {
          return res.status(400).json({ message: `Invalid role. Allowed: ${allowedRoles.join(", ")}` });
        }
      }
      if (updates.hourlyRate !== void 0) {
        const rate = parseFloat(String(updates.hourlyRate));
        if (isNaN(rate) || rate < 0) {
          return res.status(400).json({ message: "hourlyRate must be a non-negative number" });
        }
        const calculatedDailyRate = rate * 8;
        updates.hourlyRate = String(rate);
        updates.dailyRate = calculatedDailyRate.toString();
      }
      const updatedEmployee = await storage.updateUser(id, updates);
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const { password, ...result } = updatedEmployee;
      realTimeManager.broadcastEmployeeUpdated(result);
      await createAuditLog({
        action: "employee_update",
        entityType: "employee",
        entityId: id,
        userId: req.session.user.id,
        oldValues: { firstName: existingEmployee.firstName, lastName: existingEmployee.lastName, email: existingEmployee.email, position: existingEmployee.position, hourlyRate: existingEmployee.hourlyRate },
        newValues: updates,
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json(result);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });
  router13.put("/api/employees/:id/deductions", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { sssLoanDeduction, pagibigLoanDeduction, cashAdvanceDeduction, otherDeductions } = req.body;
      const existingEmployee = await storage.getUser(id);
      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (req.session.user?.role === "manager" && req.session.user?.branchId !== existingEmployee.branchId) {
        return res.status(403).json({ message: "Unauthorized to update this employee" });
      }
      if (existingEmployee.role === "admin" && req.session.user?.role !== "admin") {
        return res.status(403).json({ message: "Only admins can modify admin deductions" });
      }
      const updatedEmployee = await storage.updateUser(id, {
        sssLoanDeduction: sssLoanDeduction !== void 0 ? String(sssLoanDeduction) : existingEmployee.sssLoanDeduction,
        pagibigLoanDeduction: pagibigLoanDeduction !== void 0 ? String(pagibigLoanDeduction) : existingEmployee.pagibigLoanDeduction,
        cashAdvanceDeduction: cashAdvanceDeduction !== void 0 ? String(cashAdvanceDeduction) : existingEmployee.cashAdvanceDeduction,
        otherDeductions: otherDeductions !== void 0 ? String(otherDeductions) : existingEmployee.otherDeductions
      });
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const { password, ...result } = updatedEmployee;
      realTimeManager.broadcastEmployeeUpdated(result);
      await createAuditLog({
        action: "deduction_change",
        entityType: "employee",
        entityId: id,
        userId: req.session.user.id,
        oldValues: {
          sssLoanDeduction: existingEmployee.sssLoanDeduction,
          pagibigLoanDeduction: existingEmployee.pagibigLoanDeduction,
          cashAdvanceDeduction: existingEmployee.cashAdvanceDeduction,
          otherDeductions: existingEmployee.otherDeductions
        },
        newValues: {
          sssLoanDeduction: updatedEmployee.sssLoanDeduction,
          pagibigLoanDeduction: updatedEmployee.pagibigLoanDeduction,
          cashAdvanceDeduction: updatedEmployee.cashAdvanceDeduction,
          otherDeductions: updatedEmployee.otherDeductions
        },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json(result);
    } catch (error) {
      console.error("Error updating employee deductions:", error);
      res.status(500).json({ message: "Failed to update employee deductions" });
    }
  });
  router13.patch("/api/employees/:id/status", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }
      const existingEmployee = await storage.getUser(id);
      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (existingEmployee.role === "admin" && req.session.user?.role !== "admin") {
        return res.status(403).json({ message: "Only admins can modify admin status" });
      }
      const updatedEmployee = await storage.updateUser(id, { isActive });
      if (!updatedEmployee) {
        return res.status(500).json({ message: "Failed to update employee status" });
      }
      console.log(`Employee ${id} status updated to isActive=${isActive}`);
      const { password, ...result } = updatedEmployee;
      realTimeManager.broadcastEmployeeUpdated(result);
      await createAuditLog({
        action: isActive ? "employee_activate" : "employee_deactivate",
        entityType: "employee",
        entityId: id,
        userId: req.session.user.id,
        oldValues: { isActive: existingEmployee.isActive },
        newValues: { isActive },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json(result);
    } catch (error) {
      console.error("Error updating employee status:", error);
      res.status(500).json({ message: "Failed to update employee status" });
    }
  });
  router13.get("/api/employees/:id/related-data", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const relatedData = await storage.employeeHasRelatedData(id);
      res.json(relatedData);
    } catch (error) {
      console.error("Error checking related data:", error);
      res.status(500).json({ message: "Failed to check related data" });
    }
  });
  router13.get("/api/employees/:id/export", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const exportData = await storage.getEmployeeDataForExport(id);
      if (!exportData) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const { password, ...safeEmployee } = exportData.employee;
      res.json({
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        employee: safeEmployee,
        shifts: exportData.shifts,
        payrollEntries: exportData.payrollEntries,
        timeOffRequests: exportData.timeOffRequests,
        shiftTrades: exportData.shiftTrades
      });
    } catch (error) {
      console.error("Error exporting employee data:", error);
      res.status(500).json({ message: "Failed to export employee data" });
    }
  });
  router13.delete("/api/employees/:id", requireAuth10, requireRole3(["manager", "admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const force = req.query.force === "true";
      const existingEmployee = await storage.getUser(id);
      if (!existingEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (req.session.user?.role === "manager" && req.session.user?.branchId !== existingEmployee.branchId) {
        return res.status(403).json({ message: "Unauthorized to delete this employee" });
      }
      if (existingEmployee.id === req.session.user?.id) {
        return res.status(400).json({
          message: `You cannot delete your own account (${existingEmployee.firstName} ${existingEmployee.lastName})`
        });
      }
      if (existingEmployee.role === "admin" && req.session.user?.role !== "admin") {
        return res.status(403).json({ message: "Only admins can delete admin accounts" });
      }
      const relatedData = await storage.employeeHasRelatedData(id);
      if (force) {
        if (req.session.user?.role !== "admin") {
          return res.status(403).json({
            message: "Force delete is only available for administrators",
            requiresAdmin: true
          });
        }
        const reason = req.query.reason || "Force deletion by admin";
        await storage.forceDeleteUser(id, req.session.user.id, reason);
        console.log(`\u{1F5D1}\uFE0F FORCE deleted employee: ${existingEmployee.firstName} ${existingEmployee.lastName} (${id}) by ${req.session.user.username}`);
        realTimeManager.broadcastEmployeeDeleted(id, existingEmployee.branchId);
        await createAuditLog({
          action: "employee_delete",
          entityType: "employee",
          entityId: id,
          userId: req.session.user.id,
          oldValues: { firstName: existingEmployee.firstName, lastName: existingEmployee.lastName, email: existingEmployee.email, role: existingEmployee.role },
          reason,
          ipAddress: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers["user-agent"]
        });
        return res.json({
          message: "Employee and all related data permanently deleted",
          forceDeleted: true
        });
      }
      if (relatedData.hasShifts || relatedData.hasPayroll) {
        return res.status(409).json({
          message: "Cannot delete employee with existing data. Use deactivation or force delete.",
          hasRelatedData: true,
          relatedData: {
            hasShifts: relatedData.hasShifts,
            hasPayroll: relatedData.hasPayroll,
            totalRecords: relatedData.hasTotal
          },
          options: {
            deactivate: "Set employee as inactive (recommended)",
            forceDelete: req.session.user?.role === "admin" ? "Permanently delete all data (admin only)" : null
          }
        });
      }
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete employee" });
      }
      console.log(`\u{1F5D1}\uFE0F Employee deleted: ${existingEmployee.firstName} ${existingEmployee.lastName} (${existingEmployee.id})`);
      realTimeManager.broadcastEmployeeDeleted(id, existingEmployee.branchId);
      await createAuditLog({
        action: "employee_delete",
        entityType: "employee",
        entityId: id,
        userId: req.session.user.id,
        oldValues: { firstName: existingEmployee.firstName, lastName: existingEmployee.lastName, email: existingEmployee.email, role: existingEmployee.role },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: error.message || "Failed to delete employee" });
    }
  });
  return router13;
}

// server/routes.ts
init_leave_credits();

// server/middleware/api-cache.ts
var LRUCache = class {
  cache;
  maxItems;
  constructor(maxItems = 100) {
    this.cache = /* @__PURE__ */ new Map();
    this.maxItems = maxItems;
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return void 0;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return void 0;
    }
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }
  set(key, value, ttlSeconds) {
    if (this.cache.size >= this.maxItems) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1e3 });
  }
  delete(key) {
    this.cache.delete(key);
  }
  clear() {
    this.cache.clear();
  }
};
var requestCache = new LRUCache(200);
function apiCache(ttlSeconds, keyBuilder) {
  return (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }
    if (req.headers["x-no-cache"] || req.query.fresh) {
      return next();
    }
    const buildKey = () => {
      if (keyBuilder) return keyBuilder(req);
      const userId = req.user?.id || "anonymous";
      const branchId = req.headers["x-branch-id"] || "default-branch";
      return `${userId}:${branchId}:${req.originalUrl}`;
    };
    const cacheKey = buildKey();
    const cachedResponse = requestCache.get(cacheKey);
    if (cachedResponse) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Content-Type", cachedResponse.contentType);
      return res.status(200).send(cachedResponse.body);
    }
    res.setHeader("X-Cache", "MISS");
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        requestCache.set(cacheKey, {
          body: JSON.stringify(body),
          contentType: "application/json; charset=utf-8"
        }, ttlSeconds);
      }
      return originalJson(body);
    };
    res.send = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const contentType = res.get("Content-Type") || "application/json; charset=utf-8";
        requestCache.set(cacheKey, { body, contentType }, ttlSeconds);
      }
      return originalSend(body);
    };
    next();
  };
}

// server/routes.ts
init_hours();

// server/routes/payslips.ts
import { Router as Router5 } from "express";

// server/services/payslip-pdf-generator.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import crypto from "crypto";

// shared/payslip-types.ts
function formatPHPforPDF(amount) {
  const formatted = new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `PHP ${formatted}`;
}
function maskId(id, showLast = 4) {
  if (!id || id.length <= showLast) return id;
  const masked = "X".repeat(id.length - showLast);
  return masked + id.slice(-showLast);
}
function formatPayslipDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function formatPayPeriod(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = startDate.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  const endStr = endDate.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  return `${startStr} - ${endStr}`;
}
function validatePayslipData(data) {
  const errors = [];
  if (!data.payslip_id) errors.push("Payslip ID is required");
  if (!data.company?.name) errors.push("Company name is required");
  if (!data.employee?.name) errors.push("Employee name is required");
  if (!data.pay_period?.start || !data.pay_period?.end) errors.push("Pay period is required");
  if (data.gross < 0) errors.push("Gross pay cannot be negative");
  if (data.total_deductions < 0) errors.push("Total deductions cannot be negative");
  const calculatedNet = data.gross - data.total_deductions;
  if (Math.abs(calculatedNet - data.net_pay) > 1) {
    errors.push(`Net pay mismatch: expected ${calculatedNet.toFixed(2)}, got ${data.net_pay.toFixed(2)}`);
  }
  const earningsTotal = data.earnings.reduce((sum, e) => sum + e.amount, 0);
  if (data.earnings.length > 0 && Math.abs(earningsTotal - data.gross) > 1) {
    errors.push(`Earnings total mismatch: expected ${data.gross.toFixed(2)}, got ${earningsTotal.toFixed(2)}`);
  }
  const deductionsTotal = data.deductions.reduce((sum, d) => sum + d.amount, 0);
  if (data.deductions.length > 0 && Math.abs(deductionsTotal - data.total_deductions) > 1) {
    errors.push(`Deductions total mismatch: expected ${data.total_deductions.toFixed(2)}, got ${deductionsTotal.toFixed(2)}`);
  }
  return { valid: errors.length === 0, errors };
}
var SAMPLE_PAYSLIP_DATA = {
  payslip_id: "PS-2026-000123",
  company: {
    name: "The Caf\xE9 Inc.",
    address: "123 Coffee Lane, Makati City, Metro Manila 1200",
    tin: "123-456-789-000",
    phone: "(02) 8123-4567",
    email: "payroll@thecafe.ph"
  },
  employee: {
    id: "EMP-045",
    name: "Juan Dela Cruz",
    position: "Senior Barista",
    department: "Operations",
    tin: "123-456-789",
    sss: "01-2345678-9",
    philhealth: "12-345678901-2",
    pagibig: "0000-1234-5678"
  },
  pay_period: {
    start: "2026-01-16",
    end: "2026-01-31",
    payment_date: "2026-02-03",
    frequency: "semi-monthly"
  },
  earnings: [
    { code: "BASIC", label: "Basic Salary", hours: 88, rate: 90.91, amount: 8e3 },
    { code: "OT", label: "Overtime Pay (125%)", hours: 5, rate: 113.64, amount: 568.18, is_overtime: true, multiplier: 125 },
    { code: "ND", label: "Night Differential (10%)", hours: 16, rate: 9.09, amount: 145.45 },
    {
      code: "RH",
      label: "Regular Holiday Worked",
      hours: 8,
      rate: 181.82,
      amount: 1454.55,
      holiday_type: "regular",
      holiday_name: "Bonifacio Day",
      multiplier: 200,
      formula: "8.0 hrs \xD7 \u20B190.91 \xD7 200%"
    },
    { code: "ALLOW", label: "Meal Allowance", amount: 1500 },
    { code: "TRANSPO", label: "Transportation Allowance", amount: 1e3 }
  ],
  deductions: [
    { code: "TAX", label: "Withholding Tax", amount: 1250 },
    { code: "SSS", label: "SSS Contribution", amount: 450 },
    { code: "PH", label: "PhilHealth Contribution", amount: 225 },
    { code: "PAGIBIG", label: "Pag-IBIG Contribution", amount: 100 },
    { code: "SSS_LOAN", label: "SSS Loan", amount: 500, is_loan: true, loan_balance: 4500 }
  ],
  gross: 12668.18,
  total_deductions: 2525,
  net_pay: 10143.18,
  ytd: {
    gross: 278400,
    deductions: 55440,
    net: 222960,
    tax_withheld: 27500,
    sss_contributions: 9900,
    philhealth_contributions: 4950,
    pagibig_contributions: 2200
  },
  employer_contributions: [
    { code: "SSS_ER", label: "SSS (Employer Share)", amount: 900 },
    { code: "PH_ER", label: "PhilHealth (Employer Share)", amount: 225 },
    { code: "PAGIBIG_ER", label: "Pag-IBIG (Employer Share)", amount: 100 },
    { code: "EC", label: "EC Contribution", amount: 10 }
  ],
  payment_method: {
    type: "Bank Transfer",
    bank: "BPI",
    account_last4: "4321",
    transaction_id: "TRX-2026020398765"
  },
  verification_code: "7f3a9c",
  notes: "Includes holiday pay for Nov 30 (Bonifacio Day - Regular Holiday). SSS Loan balance after this payment: \u20B14,500.00",
  breakdown: {
    regular_hours: 80,
    overtime_hours: 5,
    night_diff_hours: 16,
    holiday_hours: 8,
    late_minutes: 15,
    undertime_minutes: 0
  }
};

// server/services/payslip-pdf-generator.ts
var formatPHP = formatPHPforPDF;
function formatShortId(id, prefix = "") {
  if (!id) return prefix ? `${prefix}-000000` : "000000";
  const cleanId = id.replace(/^(PS-|EMP-|ID-)/i, "");
  const shortId = cleanId.replace(/-/g, "").substring(0, 6).toUpperCase();
  return prefix ? `${prefix}-${shortId}` : shortId;
}
var COLORS = {
  primary: rgb(0.09, 0.45, 0.35),
  // Emerald-like
  primaryLight: rgb(0.87, 0.95, 0.92),
  // Light emerald bg
  secondary: rgb(0.4, 0.4, 0.4),
  // Gray for text
  black: rgb(0, 0, 0),
  white: rgb(1, 1, 1),
  red: rgb(0.72, 0.14, 0.14),
  // For deductions
  lightRed: rgb(0.96, 0.88, 0.88),
  lightGray: rgb(0.95, 0.95, 0.95),
  border: rgb(0.85, 0.85, 0.85)
};
var PAGE_WIDTH = 595.28;
var PAGE_HEIGHT = 841.89;
var MARGIN = 40;
var CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
var FONT_SIZES = {
  title: 18,
  header: 14,
  subheader: 12,
  body: 11,
  small: 9,
  tiny: 8,
  netPay: 20
};
async function generatePayslipPDF(data, options = {}) {
  const {
    includeQR = true,
    includeVerification = true,
    verificationBaseUrl = "https://payroll.thecafe.ph/verify"
  } = options;
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  y = drawHeader(page, fontRegular, fontBold, data, y);
  y = drawPayPeriod(page, fontRegular, fontBold, data, y);
  y = drawEmployeeInfo(page, fontRegular, fontBold, data, y);
  const earningsStartY = y;
  y = drawEarningsSection(page, fontRegular, fontBold, data, y);
  const deductionsEndY = drawDeductionsSection(page, fontRegular, fontBold, data, earningsStartY);
  y = Math.min(y, deductionsEndY);
  y = drawNetPaySection(page, fontRegular, fontBold, data, y);
  y = drawYTDSection(page, fontRegular, fontBold, data, y);
  y = drawEmployerContributions(page, fontRegular, fontBold, data, y);
  if (includeQR || includeVerification) {
    y = await drawVerificationSection(
      pdfDoc,
      page,
      fontRegular,
      fontBold,
      data,
      y,
      includeQR,
      verificationBaseUrl
    );
  }
  drawFooter(page, fontRegular, data);
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
function drawHeader(page, fontRegular, fontBold, data, y) {
  page.drawText(data.company.name.toUpperCase(), {
    x: MARGIN,
    y,
    size: FONT_SIZES.title,
    font: fontBold,
    color: COLORS.black
  });
  const payslipText = "PAYSLIP";
  const payslipWidth = fontBold.widthOfTextAtSize(payslipText, FONT_SIZES.header);
  page.drawRectangle({
    x: PAGE_WIDTH - MARGIN - payslipWidth - 20,
    y: y - 5,
    width: payslipWidth + 20,
    height: 24,
    color: COLORS.primaryLight
  });
  page.drawText(payslipText, {
    x: PAGE_WIDTH - MARGIN - payslipWidth - 10,
    y,
    size: FONT_SIZES.header,
    font: fontBold,
    color: COLORS.primary
  });
  y -= 18;
  page.drawText(data.company.address, {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: fontRegular,
    color: COLORS.secondary
  });
  y -= 14;
  page.drawText(`TIN: ${data.company.tin}`, {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: fontRegular,
    color: COLORS.secondary
  });
  y -= 8;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: COLORS.border
  });
  return y - 15;
}
function drawPayPeriod(page, fontRegular, fontBold, data, y) {
  const colWidth = CONTENT_WIDTH / 4;
  const formattedPayslipId = formatShortId(data.payslip_id, "PS");
  page.drawText("Payslip ID:", { x: MARGIN, y, size: FONT_SIZES.small, font: fontRegular, color: COLORS.secondary });
  page.drawText(formattedPayslipId, { x: MARGIN + 55, y, size: FONT_SIZES.small, font: fontBold, color: COLORS.black });
  page.drawText("Pay Period:", { x: MARGIN + colWidth, y, size: FONT_SIZES.small, font: fontRegular, color: COLORS.secondary });
  page.drawText(formatPayPeriod(data.pay_period.start, data.pay_period.end), {
    x: MARGIN + colWidth + 60,
    y,
    size: FONT_SIZES.small,
    font: fontBold,
    color: COLORS.black
  });
  page.drawText("Payment Date:", { x: MARGIN + colWidth * 2.5, y, size: FONT_SIZES.small, font: fontRegular, color: COLORS.secondary });
  page.drawText(formatPayslipDate(data.pay_period.payment_date), {
    x: MARGIN + colWidth * 2.5 + 75,
    y,
    size: FONT_SIZES.small,
    font: fontBold,
    color: COLORS.black
  });
  return y - 25;
}
function drawEmployeeInfo(page, fontRegular, fontBold, data, y) {
  const boxHeight = 60;
  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: CONTENT_WIDTH,
    height: boxHeight,
    color: COLORS.lightGray
  });
  y -= 15;
  page.drawText(data.employee.name, {
    x: MARGIN + 10,
    y,
    size: FONT_SIZES.header,
    font: fontBold,
    color: COLORS.black
  });
  y -= 16;
  let positionText = data.employee.position;
  if (data.employee.department) {
    positionText += ` \u2022 ${data.employee.department}`;
  }
  if (data.employee.is_mwe) {
    positionText += ` \u2022 MWE (Tax Exempt)`;
  }
  page.drawText(positionText, {
    x: MARGIN + 10,
    y,
    size: FONT_SIZES.body,
    font: fontRegular,
    color: COLORS.secondary
  });
  y -= 20;
  const idRowY = y;
  const idColWidth = CONTENT_WIDTH / 4;
  const formattedEmployeeId = formatShortId(data.employee.id, "EMP");
  drawLabelValue(page, fontRegular, fontBold, "Employee ID:", formattedEmployeeId, MARGIN + 10, idRowY, FONT_SIZES.tiny);
  drawLabelValue(page, fontRegular, fontBold, "TIN:", maskId(data.employee.tin), MARGIN + idColWidth, idRowY, FONT_SIZES.tiny);
  drawLabelValue(page, fontRegular, fontBold, "SSS:", maskId(data.employee.sss), MARGIN + idColWidth * 2, idRowY, FONT_SIZES.tiny);
  drawLabelValue(page, fontRegular, fontBold, "Pag-IBIG:", maskId(data.employee.pagibig), MARGIN + idColWidth * 3, idRowY, FONT_SIZES.tiny);
  return y - 20;
}
function drawEarningsSection(page, fontRegular, fontBold, data, y) {
  page.drawText("EARNINGS", {
    x: MARGIN,
    y,
    size: FONT_SIZES.subheader,
    font: fontBold,
    color: COLORS.primary
  });
  y -= 5;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + CONTENT_WIDTH / 2 - 10, y },
    thickness: 2,
    color: COLORS.primary
  });
  y -= 15;
  const earningsEndX = MARGIN + CONTENT_WIDTH / 2 - 15;
  page.drawText("Description", { x: MARGIN, y, size: FONT_SIZES.tiny, font: fontBold, color: COLORS.secondary });
  const amtHeaderWidth = fontBold.widthOfTextAtSize("Amount", FONT_SIZES.tiny);
  page.drawText("Amount", { x: earningsEndX - amtHeaderWidth, y, size: FONT_SIZES.tiny, font: fontBold, color: COLORS.secondary });
  y -= 12;
  for (const earning of data.earnings) {
    let label = earning.label;
    if (earning.multiplier) {
      label += ` (${earning.multiplier}%)`;
    }
    if (earning.hours !== void 0 && earning.rate !== void 0) {
      label += ` - ${earning.hours.toFixed(1)}h @ \u20B1${earning.rate.toFixed(0)}`;
    } else if (earning.hours !== void 0) {
      label += ` - ${earning.hours.toFixed(1)}h`;
    }
    const maxLabelWidth = earningsEndX - MARGIN - 80;
    let displayLabel = label;
    while (fontRegular.widthOfTextAtSize(displayLabel, FONT_SIZES.small) > maxLabelWidth && displayLabel.length > 10) {
      displayLabel = displayLabel.substring(0, displayLabel.length - 1);
    }
    if (displayLabel !== label) displayLabel += "...";
    page.drawText(displayLabel, { x: MARGIN, y, size: FONT_SIZES.small, font: fontRegular, color: COLORS.black });
    const amountText = formatPHP(earning.amount);
    const amountWidth = fontBold.widthOfTextAtSize(amountText, FONT_SIZES.small);
    page.drawText(amountText, {
      x: earningsEndX - amountWidth,
      y,
      size: FONT_SIZES.small,
      font: fontBold,
      color: COLORS.black
    });
    y -= 12;
  }
  y -= 5;
  const earningsLineEndX = MARGIN + CONTENT_WIDTH / 2 - 15;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: earningsLineEndX, y },
    thickness: 1,
    color: COLORS.border
  });
  y -= 12;
  page.drawText("GROSS PAY", { x: MARGIN, y, size: FONT_SIZES.body, font: fontBold, color: COLORS.primary });
  const grossText = formatPHP(data.gross);
  const grossWidth = fontBold.widthOfTextAtSize(grossText, FONT_SIZES.body);
  page.drawText(grossText, {
    x: earningsLineEndX - grossWidth,
    y,
    size: FONT_SIZES.body,
    font: fontBold,
    color: COLORS.primary
  });
  return y - 25;
}
function drawDeductionsSection(page, fontRegular, fontBold, data, y) {
  const startX = MARGIN + CONTENT_WIDTH / 2 + 10;
  const sectionWidth = CONTENT_WIDTH / 2 - 10;
  page.drawText("DEDUCTIONS", {
    x: startX,
    y,
    size: FONT_SIZES.subheader,
    font: fontBold,
    color: COLORS.red
  });
  y -= 5;
  page.drawLine({
    start: { x: startX, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 2,
    color: COLORS.red
  });
  y -= 15;
  const colX = {
    label: startX,
    amount: PAGE_WIDTH - MARGIN - 60
  };
  page.drawText("Description", { x: colX.label, y, size: FONT_SIZES.tiny, font: fontBold, color: COLORS.secondary });
  page.drawText("Amount", { x: colX.amount, y, size: FONT_SIZES.tiny, font: fontBold, color: COLORS.secondary });
  y -= 12;
  for (const deduction of data.deductions) {
    let label = deduction.label;
    if (deduction.is_loan) {
      label += " [Loan]";
    }
    page.drawText(label.substring(0, 28), { x: colX.label, y, size: FONT_SIZES.small, font: fontRegular, color: COLORS.black });
    const amountText = `(${formatPHP(deduction.amount)})`;
    const amountWidth = fontBold.widthOfTextAtSize(amountText, FONT_SIZES.small);
    page.drawText(amountText, {
      x: PAGE_WIDTH - MARGIN - amountWidth,
      y,
      size: FONT_SIZES.small,
      font: fontBold,
      color: COLORS.red
    });
    y -= 12;
  }
  y -= 5;
  page.drawLine({
    start: { x: startX, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: COLORS.border
  });
  y -= 12;
  page.drawText("TOTAL DEDUCTIONS", { x: startX, y, size: FONT_SIZES.body, font: fontBold, color: COLORS.red });
  const totalText = `(${formatPHP(data.total_deductions)})`;
  const totalWidth = fontBold.widthOfTextAtSize(totalText, FONT_SIZES.body);
  page.drawText(totalText, {
    x: PAGE_WIDTH - MARGIN - totalWidth,
    y,
    size: FONT_SIZES.body,
    font: fontBold,
    color: COLORS.red
  });
  return Math.min(y - 25, PAGE_HEIGHT - MARGIN - 160 - data.earnings.length * 12 - 50);
}
function drawNetPaySection(page, fontRegular, fontBold, data, y) {
  const boxHeight = 45;
  page.drawRectangle({
    x: MARGIN,
    y: y - boxHeight,
    width: CONTENT_WIDTH,
    height: boxHeight,
    color: COLORS.primary
  });
  page.drawText("NET PAY", {
    x: MARGIN + 15,
    y: y - 30,
    size: FONT_SIZES.header,
    font: fontBold,
    color: COLORS.white
  });
  const netPayText = formatPHP(data.net_pay);
  const netPayWidth = fontBold.widthOfTextAtSize(netPayText, FONT_SIZES.netPay);
  page.drawText(netPayText, {
    x: PAGE_WIDTH - MARGIN - netPayWidth - 15,
    y: y - 32,
    size: FONT_SIZES.netPay,
    font: fontBold,
    color: COLORS.white
  });
  return y - boxHeight - 20;
}
function drawYTDSection(page, fontRegular, fontBold, data, y) {
  page.drawText("YEAR-TO-DATE SUMMARY", {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: fontBold,
    color: COLORS.secondary
  });
  y -= 15;
  const colWidth = CONTENT_WIDTH / 3;
  drawLabelValue(page, fontRegular, fontBold, "YTD Gross:", formatPHP(data.ytd.gross), MARGIN, y, FONT_SIZES.small);
  drawLabelValue(page, fontRegular, fontBold, "YTD Deductions:", formatPHP(data.ytd.deductions), MARGIN + colWidth, y, FONT_SIZES.small);
  drawLabelValue(page, fontRegular, fontBold, "YTD Net:", formatPHP(data.ytd.net), MARGIN + colWidth * 2, y, FONT_SIZES.small);
  return y - 25;
}
function drawEmployerContributions(page, fontRegular, fontBold, data, y) {
  page.drawText("EMPLOYER CONTRIBUTIONS (For Your Information)", {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: fontBold,
    color: COLORS.secondary
  });
  y -= 12;
  let x = MARGIN;
  for (const contrib of data.employer_contributions) {
    const text2 = `${contrib.label}: ${formatPHP(contrib.amount)}`;
    page.drawText(text2, { x, y, size: FONT_SIZES.tiny, font: fontRegular, color: COLORS.secondary });
    x += fontRegular.widthOfTextAtSize(text2, FONT_SIZES.tiny) + 20;
    if (x > PAGE_WIDTH - MARGIN - 100) {
      x = MARGIN;
      y -= 10;
    }
  }
  return y - 20;
}
async function drawVerificationSection(pdfDoc, page, fontRegular, fontBold, data, y, includeQR, verificationBaseUrl) {
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: COLORS.border
  });
  y -= 15;
  page.drawText("[OK] VERIFIED PAYSLIP", {
    x: MARGIN,
    y,
    size: FONT_SIZES.small,
    font: fontBold,
    color: COLORS.primary
  });
  y -= 12;
  page.drawText(`Verification Code: ${data.verification_code.toUpperCase()}`, {
    x: MARGIN,
    y,
    size: FONT_SIZES.tiny,
    font: fontRegular,
    color: COLORS.secondary
  });
  y -= 10;
  page.drawText("Scan QR code or visit verification portal to confirm authenticity", {
    x: MARGIN,
    y,
    size: FONT_SIZES.tiny,
    font: fontRegular,
    color: COLORS.secondary
  });
  if (includeQR) {
    try {
      const verificationUrl = `${verificationBaseUrl}?payslip_id=${data.payslip_id}&hash=${data.verification_code}`;
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 80,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" }
      });
      const base64Data = qrDataUrl.split(",")[1];
      const qrImageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const qrImage = await pdfDoc.embedPng(qrImageBytes);
      page.drawImage(qrImage, {
        x: PAGE_WIDTH - MARGIN - 70,
        y: y - 40,
        width: 60,
        height: 60
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  }
  return y - 50;
}
function drawFooter(page, fontRegular, data) {
  const y = MARGIN / 2;
  let footerText = "This is a computer-generated document.";
  if (data.generated_at) {
    footerText = `Generated: ${formatPayslipDate(data.generated_at)} | ${footerText}`;
  }
  const footerWidth = fontRegular.widthOfTextAtSize(footerText, FONT_SIZES.tiny);
  page.drawText(footerText, {
    x: (PAGE_WIDTH - footerWidth) / 2,
    y,
    size: FONT_SIZES.tiny,
    font: fontRegular,
    color: COLORS.secondary
  });
  if (data.company.email) {
    const emailText = `Payroll inquiries: ${data.company.email}`;
    const emailWidth = fontRegular.widthOfTextAtSize(emailText, FONT_SIZES.tiny);
    page.drawText(emailText, {
      x: (PAGE_WIDTH - emailWidth) / 2,
      y: y + 10,
      size: FONT_SIZES.tiny,
      font: fontRegular,
      color: COLORS.secondary
    });
  }
}
function drawLabelValue(page, fontRegular, fontBold, label, value, x, y, fontSize) {
  page.drawText(label, { x, y, size: fontSize, font: fontRegular, color: COLORS.secondary });
  const labelWidth = fontRegular.widthOfTextAtSize(label, fontSize);
  page.drawText(value, { x: x + labelWidth + 3, y, size: fontSize, font: fontBold, color: COLORS.black });
}
function generatePayslipHash(payslipId, employeeId, timestamp2) {
  const secret = process.env.PAYSLIP_HMAC_SECRET || process.env.SESSION_SECRET || "the-cafe-payslip-verification";
  const data = `${payslipId}-${employeeId}-${timestamp2}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex").substring(0, 16);
}

// server/routes/payslips.ts
init_db_storage();
init_payroll_utils();

// shared/payroll-dates.ts
function getPaymentDate(periodEndDate) {
  const end = new Date(periodEndDate);
  if (isNaN(end.getTime())) {
    return /* @__PURE__ */ new Date();
  }
  const day = end.getUTCDate();
  if (day <= 15) {
    return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 25));
  } else {
    return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 10));
  }
}
function getPaymentDateString(periodEndDate) {
  return getPaymentDate(periodEndDate).toISOString().split("T")[0];
}

// server/routes/payslips.ts
var router4 = Router5();
var storage4 = dbStorage;
var DEFAULT_COMPANY_INFO = {
  name: "Your Company Name",
  address: "Philippines",
  tin: "XXX-XXX-XXX-XXX",
  logo_url: "",
  phone: "",
  email: ""
};
async function getCompanyInfo() {
  const settings = await storage4.getCompanySettings();
  if (!settings) return DEFAULT_COMPANY_INFO;
  const fullAddress = [settings.address, settings.city, settings.province, settings.zipCode].filter(Boolean).join(", ");
  return {
    name: settings.tradeName || settings.name,
    address: fullAddress || settings.address,
    tin: settings.tin,
    logo_url: settings.logoUrl || "",
    phone: settings.phone || "",
    email: settings.email || ""
  };
}
var requireAuth5 = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  next();
};
var requireManagerOrAdmin2 = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  const role = req.session.user.role;
  if (role !== "manager" && role !== "admin") {
    return res.status(403).json({ success: false, error: "Manager or Admin access required" });
  }
  next();
};
var verificationRecords = /* @__PURE__ */ new Map();
router4.get("/entry/:entryId", requireAuth5, async (req, res) => {
  try {
    const { entryId } = req.params;
    const currentUser = req.session.user;
    const entry = await storage4.getPayrollEntry(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, error: "Payroll entry not found" });
    }
    const employee = await storage4.getUser(entry.userId);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }
    if (currentUser.role === "employee" && entry.userId !== currentUser.id) {
      return res.status(403).json({ success: false, error: "Access denied. You can only view your own payslips." });
    }
    const period = await storage4.getPayrollPeriod(entry.payrollPeriodId);
    if (!period) {
      return res.status(404).json({ success: false, error: "Payroll period not found" });
    }
    const deductionRates2 = await storage4.getAllDeductionRates();
    const ratesEffectiveFrom = deductionRates2.length > 0 && deductionRates2[0].createdAt ? toLocalDateString(deductionRates2[0].createdAt) : "2025-01-01";
    let payBreakdown = {};
    if (entry.payBreakdown) {
      try {
        payBreakdown = JSON.parse(entry.payBreakdown);
      } catch (e) {
        console.error("Error parsing pay breakdown:", e);
      }
    }
    const payslipId = `DM-${(/* @__PURE__ */ new Date()).getFullYear()}${String((/* @__PURE__ */ new Date()).getMonth() + 1).padStart(2, "0")}${String((/* @__PURE__ */ new Date()).getDate()).padStart(2, "0")}-${entryId.substring(0, 6).toUpperCase()}`;
    const timestamp2 = Date.now();
    const tamperHash = generatePayslipHash(payslipId, employee.id, timestamp2);
    const earnings = [];
    const basicPay = parseFloat(String(entry.basicPay || entry.grossPay || 0));
    const overtimePay = parseFloat(String(entry.overtimePay || 0));
    const nightDiffPay = parseFloat(String(entry.nightDiffPay || 0));
    const holidayPay = parseFloat(String(entry.holidayPay || 0));
    const restDayPay = parseFloat(String(entry.restDayPay || 0));
    if (basicPay > 0) {
      earnings.push({
        code: "BASIC",
        label: "Basic Salary",
        hours: parseFloat(String(entry.regularHours || 0)),
        rate: parseFloat(String(employee.hourlyRate || 0)),
        amount: basicPay
      });
    }
    const otMultiplierUsed = payBreakdown?.overtimeMultiplier ? Math.round(payBreakdown.overtimeMultiplier * 100) : 125;
    earnings.push({
      code: "OT",
      label: `Overtime Pay (${otMultiplierUsed}%)`,
      hours: parseFloat(String(entry.overtimeHours || 0)),
      amount: overtimePay,
      is_overtime: true,
      multiplier: otMultiplierUsed
    });
    if (nightDiffPay > 0) {
      earnings.push({
        code: "ND",
        label: "Night Differential (10%)",
        hours: parseFloat(String(entry.nightDiffHours || 0)),
        amount: nightDiffPay
      });
    }
    earnings.push({
      code: "HOL",
      label: "Holiday Pay",
      amount: holidayPay
    });
    if (restDayPay > 0) {
      earnings.push({
        code: "RD",
        label: "Rest Day Premium",
        amount: restDayPay
      });
    }
    const serviceChargePay = parseFloat(String(entry.serviceCharge || 0));
    if (serviceChargePay > 0) {
      earnings.push({
        code: "SC",
        label: "Service Charge (RA 11360)",
        amount: serviceChargePay
      });
    }
    const deductions = [];
    const sssContrib = parseFloat(String(entry.sssContribution || 0));
    const sssLoan = parseFloat(String(entry.sssLoan || 0));
    const philHealth = parseFloat(String(entry.philHealthContribution || 0));
    const pagibig = parseFloat(String(entry.pagibigContribution || 0));
    const pagibigLoan = parseFloat(String(entry.pagibigLoan || 0));
    const tax = parseFloat(String(entry.withholdingTax || 0));
    const advances = parseFloat(String(entry.advances || 0));
    const otherDed = parseFloat(String(entry.otherDeductions || 0));
    if (sssContrib > 0) {
      deductions.push({ code: "SSS_EE", label: "SSS (Employee)", amount: sssContrib });
    }
    if (sssLoan > 0) {
      deductions.push({ code: "SSS_LOAN", label: "SSS Loan", amount: sssLoan, is_loan: true });
    }
    if (philHealth > 0) {
      deductions.push({ code: "PH_EE", label: "PhilHealth (Employee)", amount: philHealth });
    }
    if (pagibig > 0) {
      deductions.push({ code: "PB_EE", label: "Pag-IBIG (Employee)", amount: pagibig });
    }
    if (pagibigLoan > 0) {
      deductions.push({ code: "PB_LOAN", label: "Pag-IBIG Loan", amount: pagibigLoan, is_loan: true });
    }
    if (tax > 0) {
      deductions.push({ code: "WHT", label: "Withholding Tax", amount: tax });
    }
    if (advances > 0) {
      deductions.push({ code: "ADV", label: "Cash Advances", amount: advances });
    }
    if (otherDed > 0) {
      deductions.push({ code: "OTHER", label: "Other Deductions", amount: otherDed });
    }
    const employerContributions = [
      { code: "SSS_ER", label: "SSS (Employer Share)", amount: Math.round(sssContrib * 2 * 100) / 100 },
      { code: "PH_ER", label: "PhilHealth (Employer Share)", amount: philHealth },
      { code: "PB_ER", label: "Pag-IBIG (Employer Share)", amount: pagibig }
    ].filter((c) => c.amount > 0);
    const companyInfo = await getCompanyInfo();
    const companyDbSettings = await storage4.getCompanySettings();
    const payslipData = {
      payslip_id: payslipId,
      company: companyInfo,
      employee: {
        id: `DM-EMP-${employee.id.substring(0, 6).toUpperCase()}`,
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: "Operations",
        tin: employee.tin ? `XXX-XXX-${employee.tin.slice(-4)}` : "\u2014",
        sss: employee.sssNumber ? `XX-XXXX${employee.sssNumber.slice(-4)}` : "\u2014",
        philhealth: employee.philhealthNumber ? `XX-XXXXXX${employee.philhealthNumber.slice(-4)}` : "\u2014",
        pagibig: employee.pagibigNumber ? `XXXX-XXXX-${employee.pagibigNumber.slice(-4)}` : "\u2014",
        is_mwe: employee.isMwe || false
      },
      pay_period: {
        start: toLocalDateString(period.startDate),
        end: toLocalDateString(period.endDate),
        payment_date: entry.paidAt ? toLocalDateString(new Date(entry.paidAt)) : getPaymentDateString(period.endDate),
        frequency: "semi-monthly"
      },
      earnings,
      deductions,
      gross: parseFloat(String(entry.grossPay || 0)),
      total_deductions: parseFloat(String(entry.totalDeductions || entry.deductions || 0)),
      net_pay: parseFloat(String(entry.netPay || 0)),
      ytd: {
        gross: 0,
        deductions: 0,
        net: 0
      },
      employer_contributions: employerContributions,
      payment_method: {
        type: companyDbSettings?.paymentMethod || "Bank Transfer",
        bank: companyDbSettings?.bankName || "",
        account_last4: companyDbSettings?.bankAccountNo ? "****" + companyDbSettings.bankAccountNo.slice(-4) : "****"
      },
      verification_code: tamperHash,
      generated_at: (/* @__PURE__ */ new Date()).toISOString(),
      rates_effective_from: ratesEffectiveFrom,
      tamper_hash: `sha256:${tamperHash}`
    };
    verificationRecords.set(payslipId, {
      payslip_id: payslipId,
      employee_id: employee.id,
      timestamp: timestamp2,
      hash: tamperHash,
      employee_name: `${employee.firstName} ${employee.lastName}`,
      pay_period: `${toLocalDateString(period.startDate)} - ${toLocalDateString(period.endDate)}`,
      net_pay: parseFloat(String(entry.netPay || 0)),
      payment_date: toLocalDateString(/* @__PURE__ */ new Date())
    });
    if (verificationRecords.size > 1e4) {
      const keysToDelete = [...verificationRecords.keys()].slice(0, verificationRecords.size - 5e3);
      keysToDelete.forEach((k) => verificationRecords.delete(k));
    }
    res.json({
      success: true,
      payslip: payslipData
    });
  } catch (error) {
    console.error("Error generating payslip from entry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate payslip",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.post("/audit-log", requireAuth5, async (req, res) => {
  try {
    const { action, payslip_id, employee_id, payroll_entry_id } = req.body;
    const currentUser = req.session.user;
    const auditEntry = {
      action: action || "payslip_view",
      entityType: "payslip",
      entityId: payslip_id || "",
      userId: currentUser.id,
      newValues: {
        employee_id: employee_id || "",
        payroll_entry_id: payroll_entry_id || "",
        action: action || "view"
      },
      ipAddress: req.ip || req.socket.remoteAddress || "unknown",
      userAgent: req.headers["user-agent"]
    };
    await createAuditLog(auditEntry);
    console.log("[Payslip Audit]", auditEntry);
    res.json({ success: true, logged: true });
  } catch (error) {
    console.error("Error logging audit event:", error);
    res.status(500).json({ success: false, error: "Failed to log audit event" });
  }
});
router4.get("/audit-log", requireManagerOrAdmin2, async (req, res) => {
  try {
    const { employee_id, limit = 100 } = req.query;
    const logs = await storage4.getAuditLogs({
      entityType: "payslip",
      limit: Number(limit),
      offset: 0
    });
    let filteredLogs = logs;
    if (employee_id) {
      filteredLogs = logs.filter((l) => {
        try {
          const vals = l.newValues ? JSON.parse(l.newValues) : {};
          return vals.employee_id === employee_id;
        } catch {
          return false;
        }
      });
    }
    const sortedLogs = filteredLogs.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
    res.json({ success: true, logs: sortedLogs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ success: false, error: "Failed to fetch audit logs" });
  }
});
router4.post("/generate-pdf", requireAuth5, async (req, res) => {
  console.log("[Payslips] POST /generate-pdf called");
  try {
    const { payslip_data, format: format5 = "pdf", include_qr = true } = req.body;
    console.log("[Payslips] Received payslip_data:", !!payslip_data, "format:", format5);
    if (!payslip_data) {
      return res.status(400).json({
        success: false,
        error: "payslip_data is required"
      });
    }
    const data = payslip_data;
    const validation = validatePayslipData(data);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: "Invalid payslip data",
        validation_errors: validation.errors
      });
    }
    const timestamp2 = Date.now();
    const hash = generatePayslipHash(data.payslip_id, data.employee.id, timestamp2);
    data.verification_code = hash;
    data.generated_at = (/* @__PURE__ */ new Date()).toISOString();
    verificationRecords.set(data.payslip_id, {
      payslip_id: data.payslip_id,
      employee_id: data.employee.id,
      timestamp: timestamp2,
      hash,
      employee_name: data.employee.name,
      pay_period: `${data.pay_period.start} - ${data.pay_period.end}`,
      net_pay: data.net_pay,
      payment_date: data.pay_period.payment_date
    });
    const pdfBytes = await generatePayslipPDF(data, {
      includeQR: include_qr,
      includeVerification: true,
      verificationBaseUrl: `${req.protocol}://${req.get("host")}/api/payslips/verify`
    });
    if (format5 === "json") {
      return res.json({
        success: true,
        payslip_id: data.payslip_id,
        verification_code: hash,
        verification_url: `${req.protocol}://${req.get("host")}/api/payslips/verify?payslip_id=${data.payslip_id}&hash=${hash}`,
        data
      });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${data.payslip_id}.pdf"`);
    res.setHeader("Content-Length", pdfBytes.length);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating payslip PDF:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate payslip PDF",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.get("/verify", async (req, res) => {
  try {
    const { payslip_id, hash } = req.query;
    if (!payslip_id || !hash) {
      return res.status(400).json({
        valid: false,
        error: "payslip_id and hash are required"
      });
    }
    const record = verificationRecords.get(payslip_id);
    if (!record) {
      return res.status(404).json({
        valid: false,
        error: "Payslip not found in verification records"
      });
    }
    const isValid = record.hash === hash;
    if (isValid) {
      return res.json({
        valid: true,
        payslip_summary: {
          payslip_id: record.payslip_id,
          employee_name: record.employee_name,
          pay_period: record.pay_period,
          net_pay: record.net_pay,
          payment_date: record.payment_date,
          generated_at: new Date(record.timestamp).toISOString()
        }
      });
    } else {
      return res.json({
        valid: false,
        error: "Invalid verification hash"
      });
    }
  } catch (error) {
    console.error("Error verifying payslip:", error);
    res.status(500).json({
      valid: false,
      error: "Verification failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router4.get("/sample", requireAuth5, async (_req, res) => {
  res.json({
    success: true,
    data: SAMPLE_PAYSLIP_DATA
  });
});
router4.get("/sample-pdf", requireAuth5, async (req, res) => {
  try {
    const sampleData = { ...SAMPLE_PAYSLIP_DATA };
    sampleData.generated_at = (/* @__PURE__ */ new Date()).toISOString();
    const pdfBytes = await generatePayslipPDF(sampleData, {
      includeQR: true,
      includeVerification: true,
      verificationBaseUrl: `${req.protocol}://${req.get("host")}/api/payslips/verify`
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="sample-payslip.pdf"');
    res.setHeader("Content-Length", pdfBytes.length);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Error generating sample PDF:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate sample PDF",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var payslips_default = router4;

// server/routes/company-settings.ts
init_db_storage();
import { Router as Router6 } from "express";
var router5 = Router6();
var requireAuth6 = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  next();
};
var requireManagerOrAdmin3 = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  if (req.session.user.role !== "manager" && req.session.user.role !== "admin") {
    return res.status(403).json({ success: false, error: "Manager or admin access required" });
  }
  next();
};
router5.get("/", requireAuth6, async (_req, res) => {
  try {
    const settings = await dbStorage.getCompanySettings();
    if (!settings) {
      return res.json({ success: true, settings: null });
    }
    const masked = {
      ...settings,
      bankAccountNo: settings.bankAccountNo ? "****" + settings.bankAccountNo.slice(-4) : null
    };
    res.json({ success: true, settings: masked });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch company settings"
    });
  }
});
router5.get("/full", requireManagerOrAdmin3, async (_req, res) => {
  try {
    const settings = await dbStorage.getCompanySettings();
    res.json({ success: true, settings: settings || null });
  } catch (error) {
    console.error("Error fetching full company settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch company settings"
    });
  }
});
router5.post("/", requireManagerOrAdmin3, async (req, res) => {
  try {
    const existing = await dbStorage.getCompanySettings();
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Company settings already exist. Use PUT to update."
      });
    }
    const {
      name,
      tradeName,
      address,
      city,
      province,
      zipCode,
      country,
      tin,
      sssEmployerNo,
      philhealthNo,
      pagibigNo,
      birRdo,
      secRegistration,
      phone,
      email,
      website,
      logoUrl,
      logoPublicId,
      industry,
      payrollFrequency,
      paymentMethod,
      bankName,
      bankAccountName,
      bankAccountNo,
      includeHolidayPay
    } = req.body;
    if (!name || !address || !tin) {
      return res.status(400).json({
        success: false,
        error: "Company name, address, and TIN are required."
      });
    }
    const settings = await dbStorage.createCompanySettings({
      name,
      tradeName,
      address,
      city,
      province,
      zipCode,
      country: country || "Philippines",
      tin,
      sssEmployerNo,
      philhealthNo,
      pagibigNo,
      birRdo,
      secRegistration,
      phone,
      email,
      website,
      logoUrl,
      logoPublicId,
      industry: industry || "Food & Beverage",
      payrollFrequency: payrollFrequency || "semi-monthly",
      paymentMethod: paymentMethod || "Bank Transfer",
      bankName,
      bankAccountName,
      bankAccountNo,
      includeHolidayPay: includeHolidayPay ?? false,
      isActive: true,
      updatedBy: req.session.user.id
    });
    res.status(201).json({ success: true, settings });
  } catch (error) {
    console.error("Error creating company settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create company settings"
    });
  }
});
router5.put("/:id", requireManagerOrAdmin3, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbStorage.getCompanySettings();
    if (!existing || existing.id !== id) {
      return res.status(404).json({
        success: false,
        error: "Company settings not found."
      });
    }
    const {
      name,
      tradeName,
      address,
      city,
      province,
      zipCode,
      country,
      tin,
      sssEmployerNo,
      philhealthNo,
      pagibigNo,
      birRdo,
      secRegistration,
      phone,
      email,
      website,
      logoUrl,
      logoPublicId,
      industry,
      payrollFrequency,
      paymentMethod,
      bankName,
      bankAccountName,
      bankAccountNo,
      includeHolidayPay
    } = req.body;
    const updates = {};
    if (name !== void 0) updates.name = name;
    if (tradeName !== void 0) updates.tradeName = tradeName;
    if (address !== void 0) updates.address = address;
    if (city !== void 0) updates.city = city;
    if (province !== void 0) updates.province = province;
    if (zipCode !== void 0) updates.zipCode = zipCode;
    if (country !== void 0) updates.country = country;
    if (tin !== void 0) updates.tin = tin;
    if (sssEmployerNo !== void 0) updates.sssEmployerNo = sssEmployerNo;
    if (philhealthNo !== void 0) updates.philhealthNo = philhealthNo;
    if (pagibigNo !== void 0) updates.pagibigNo = pagibigNo;
    if (birRdo !== void 0) updates.birRdo = birRdo;
    if (secRegistration !== void 0) updates.secRegistration = secRegistration;
    if (phone !== void 0) updates.phone = phone;
    if (email !== void 0) updates.email = email;
    if (website !== void 0) updates.website = website;
    if (logoUrl !== void 0) updates.logoUrl = logoUrl;
    if (logoPublicId !== void 0) updates.logoPublicId = logoPublicId;
    if (industry !== void 0) updates.industry = industry;
    if (payrollFrequency !== void 0) updates.payrollFrequency = payrollFrequency;
    if (paymentMethod !== void 0) updates.paymentMethod = paymentMethod;
    if (bankName !== void 0) updates.bankName = bankName;
    if (bankAccountName !== void 0) updates.bankAccountName = bankAccountName;
    if (bankAccountNo !== void 0) updates.bankAccountNo = bankAccountNo;
    if (includeHolidayPay !== void 0) updates.includeHolidayPay = includeHolidayPay;
    updates.updatedBy = req.session.user.id;
    const updated = await dbStorage.updateCompanySettings(id, updates);
    res.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Error updating company settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update company settings"
    });
  }
});
var company_settings_default = router5;

// server/routes/reports.ts
init_db_storage();
import { Router as Router7 } from "express";
import { format } from "date-fns";
var router6 = Router7();
var requireAuth7 = (req, res, next) => {
  if (!req.session?.user) return res.status(401).json({ message: "Not authenticated" });
  req.user = req.session.user;
  next();
};
var requireManagerRole2 = (req, res, next) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};
var escapeCSV = (value) => {
  if (value === null || value === void 0) return "";
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};
var peso = (value) => {
  if (value === null || value === void 0 || value === "") return "0.00";
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(n)) return "0.00";
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
var row = (...cells) => cells.map(escapeCSV).join(",");
var buildCSV = (sections) => {
  return "\uFEFFsep=,\n" + sections.join("\n");
};
router6.get("/api/reports/payroll/export", requireAuth7, requireManagerRole2, async (req, res) => {
  try {
    const { periodId, startDate, endDate } = req.query;
    const branchId = req.user.branchId;
    let entries = [];
    let periodLabel = "All Periods";
    let periodRange = "";
    if (periodId) {
      const period = await dbStorage.getPayrollPeriod(periodId);
      if (!period || period.branchId !== branchId) {
        return res.status(403).json({ message: "Payroll period not found or access denied" });
      }
      entries = await dbStorage.getPayrollEntriesByPeriod(periodId);
      periodLabel = `${format(new Date(period.startDate), "MMM d yyyy")} \u2013 ${format(new Date(period.endDate), "MMM d yyyy")}`;
      periodRange = `${format(new Date(period.startDate), "yyyy-MM-dd")} to ${format(new Date(period.endDate), "yyyy-MM-dd")}`;
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      entries = await dbStorage.getPayrollEntriesForDateRange(branchId, start, end);
      periodRange = `${format(start, "yyyy-MM-dd")} to ${format(end, "yyyy-MM-dd")}`;
      periodLabel = `${format(start, "MMM d yyyy")} \u2013 ${format(end, "MMM d yyyy")}`;
    } else {
      const periods = await dbStorage.getPayrollPeriodsByBranch(branchId);
      for (const period of periods) {
        const periodEntries = await dbStorage.getPayrollEntriesByPeriod(period.id);
        entries.push(...periodEntries);
      }
    }
    const enriched = await Promise.all(
      entries.map(async (e) => {
        const user = await dbStorage.getUser(e.userId);
        return { e, user };
      })
    );
    const exportedAt = format(/* @__PURE__ */ new Date(), "MMMM d yyyy HH:mm");
    const meta = [
      row("PERO PAYROLL SYSTEM \u2014 PAYROLL SUMMARY EXPORT"),
      row("All monetary values are in Philippine Peso (PHP)"),
      row(`Period:`, periodLabel),
      row(`Generated:`, exportedAt),
      row(`Total Records:`, String(enriched.length)),
      ""
    ];
    const headers = row(
      "Employee Name",
      "Employee ID",
      "Position",
      "Regular Hours",
      "Overtime Hours",
      "Night Diff Hours",
      "Total Hours",
      "Basic Pay (PHP)",
      "Overtime Pay (PHP)",
      "Night Diff Pay (PHP)",
      "Holiday Pay (PHP)",
      "Rest Day Pay (PHP)",
      "Gross Pay (PHP)",
      "SSS Contribution (PHP)",
      "SSS Loan (PHP)",
      "PhilHealth Contribution (PHP)",
      "Pag-IBIG Contribution (PHP)",
      "Pag-IBIG Loan (PHP)",
      "Withholding Tax (PHP)",
      "Cash Advances (PHP)",
      "Other Deductions (PHP)",
      "Total Deductions (PHP)",
      "Net Pay (PHP)",
      "Status"
    );
    const dataRows = enriched.map(
      ({ e, user }) => row(
        user ? `${user.firstName} ${user.lastName}` : "Unknown",
        user?.id || e.userId,
        user?.position || "N/A",
        e.regularHours ?? 0,
        e.overtimeHours ?? 0,
        e.nightDiffHours ?? 0,
        e.totalHours ?? 0,
        peso(e.basicPay),
        peso(e.overtimePay),
        peso(e.nightDiffPay),
        peso(e.holidayPay),
        peso(e.restDayPay),
        peso(e.grossPay),
        peso(e.sssContribution),
        peso(e.sssLoan),
        peso(e.philHealthContribution),
        peso(e.pagibigContribution),
        peso(e.pagibigLoan),
        peso(e.withholdingTax),
        peso(e.advances),
        peso(e.otherDeductions),
        peso(e.totalDeductions),
        peso(e.netPay),
        (e.status || "").toUpperCase()
      )
    );
    const sum = (field) => enriched.reduce((s, { e }) => s + (parseFloat(String(e[field])) || 0), 0);
    const totalRegHours = sum("regularHours");
    const totalOTHours = sum("overtimeHours");
    const totalNDHours = sum("nightDiffHours");
    const totalHours = sum("totalHours");
    const totalBasic = sum("basicPay");
    const totalOTPay = sum("overtimePay");
    const totalNDPay = sum("nightDiffPay");
    const totalHoliday = sum("holidayPay");
    const totalRestDay = sum("restDayPay");
    const totalGross = sum("grossPay");
    const totalSSS = sum("sssContribution");
    const totalSSSLoan = sum("sssLoan");
    const totalPhilHealth = sum("philHealthContribution");
    const totalPagibig = sum("pagibigContribution");
    const totalPagibigLoan = sum("pagibigLoan");
    const totalTax = sum("withholdingTax");
    const totalAdvances = sum("advances");
    const totalOtherDed = sum("otherDeductions");
    const totalDeductions = sum("totalDeductions");
    const totalNet = sum("netPay");
    const summaryRows = [
      "",
      row(
        "TOTALS",
        "",
        "",
        totalRegHours.toFixed(2),
        totalOTHours.toFixed(2),
        totalNDHours.toFixed(2),
        totalHours.toFixed(2),
        peso(totalBasic),
        peso(totalOTPay),
        peso(totalNDPay),
        peso(totalHoliday),
        peso(totalRestDay),
        peso(totalGross),
        peso(totalSSS),
        peso(totalSSSLoan),
        peso(totalPhilHealth),
        peso(totalPagibig),
        peso(totalPagibigLoan),
        peso(totalTax),
        peso(totalAdvances),
        peso(totalOtherDed),
        peso(totalDeductions),
        peso(totalNet),
        ""
      )
    ];
    const csv = buildCSV([...meta, headers, ...dataRows, ...summaryRows]);
    const filename = `payroll_export_${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd_HHmmss")}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(csv, "utf8"));
    await createAuditLog({
      action: "export_payroll",
      entityType: "payroll_report",
      entityId: periodId || "all",
      userId: req.user.id,
      newValues: { entriesExported: enriched.length, filename, periodRange },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"]
    });
  } catch (error) {
    console.error("Error exporting payroll:", error);
    res.status(500).json({ message: "Failed to export payroll data" });
  }
});
router6.get("/api/reports/employees/export", requireAuth7, requireManagerRole2, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { includeInactive } = req.query;
    let employees = await dbStorage.getUsersByBranch(branchId);
    if (!includeInactive || includeInactive === "false") {
      employees = employees.filter((e) => e.isActive);
    }
    const exportEmployees = employees.filter((e) => e.role !== "admin");
    const exportedAt = format(/* @__PURE__ */ new Date(), "MMMM d yyyy HH:mm");
    const meta = [
      row("PERO PAYROLL SYSTEM \u2014 EMPLOYEE LIST EXPORT"),
      row(`Generated:`, exportedAt),
      row(`Total Employees:`, String(exportEmployees.length)),
      ""
    ];
    const headers = row(
      "Employee Name",
      "First Name",
      "Last Name",
      "Email",
      "Position",
      "Role",
      "Hourly Rate (PHP)",
      "Employment Status",
      "Hire Date",
      "TIN",
      "SSS Number",
      "PhilHealth Number",
      "Pag-IBIG Number"
    );
    const dataRows = exportEmployees.map(
      (e) => row(
        `${e.firstName} ${e.lastName}`,
        e.firstName,
        e.lastName,
        e.email || "",
        e.position || "",
        e.role || "employee",
        peso(e.hourlyRate),
        e.isActive ? "Active" : "Inactive",
        e.createdAt ? format(new Date(e.createdAt), "MMM d yyyy") : "N/A",
        e.tin || "",
        e.sssNumber || "",
        e.philhealthNumber || "",
        e.pagibigNumber || ""
      )
    );
    const csv = buildCSV([...meta, headers, ...dataRows]);
    const filename = `employees_export_${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd_HHmmss")}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(csv, "utf8"));
    await createAuditLog({
      action: "export_employees",
      entityType: "employee_report",
      entityId: branchId,
      userId: req.user.id,
      newValues: { employeesExported: exportEmployees.length, filename },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"]
    });
  } catch (error) {
    console.error("Error exporting employees:", error);
    res.status(500).json({ message: "Failed to export employee data" });
  }
});
router6.get("/api/reports/deductions/export", requireAuth7, requireManagerRole2, async (req, res) => {
  try {
    const { periodId } = req.query;
    if (!periodId) return res.status(400).json({ message: "Period ID is required" });
    const branchId = req.user.branchId;
    const period = await dbStorage.getPayrollPeriod(periodId);
    if (!period || period.branchId !== branchId) {
      return res.status(403).json({ message: "Payroll period not found or access denied" });
    }
    const entries = await dbStorage.getPayrollEntriesByPeriod(periodId);
    const enriched = await Promise.all(
      entries.map(async (e) => {
        const user = await dbStorage.getUser(e.userId);
        return { e, user };
      })
    );
    const periodLabel = `${format(new Date(period.startDate), "MMM d yyyy")} \u2013 ${format(new Date(period.endDate), "MMM d yyyy")}`;
    const exportedAt = format(/* @__PURE__ */ new Date(), "MMMM d yyyy HH:mm");
    const meta = [
      row("PERO PAYROLL SYSTEM \u2014 DEDUCTIONS SUMMARY EXPORT"),
      row("All amounts are in Philippine Peso (PHP). DOLE Order 174 Compliant."),
      row(`Period:`, periodLabel),
      row(`Generated:`, exportedAt),
      row(`Total Employees:`, String(enriched.length)),
      ""
    ];
    const headers = row(
      "Employee Name",
      "Employee ID",
      "Position",
      "TIN",
      "SSS Number",
      "PhilHealth Number",
      "Pag-IBIG Number",
      "SSS Contribution (PHP)",
      "SSS Loan (PHP)",
      "PhilHealth (PHP)",
      "Pag-IBIG Contribution (PHP)",
      "Pag-IBIG Loan (PHP)",
      "Withholding Tax (PHP)",
      "Cash Advances (PHP)",
      "Other Deductions (PHP)",
      "Total Deductions (PHP)"
    );
    const dataRows = enriched.map(
      ({ e, user }) => row(
        user ? `${user.firstName} ${user.lastName}` : "Unknown",
        user?.id || e.userId,
        user?.position || "N/A",
        user?.tin || "",
        user?.sssNumber || "",
        user?.philhealthNumber || "",
        user?.pagibigNumber || "",
        peso(e.sssContribution),
        peso(e.sssLoan),
        peso(e.philHealthContribution),
        peso(e.pagibigContribution),
        peso(e.pagibigLoan),
        peso(e.withholdingTax),
        peso(e.advances),
        peso(e.otherDeductions),
        peso(e.totalDeductions)
      )
    );
    const totalSSS = enriched.reduce((s, { e }) => s + (parseFloat(String(e.sssContribution)) || 0), 0);
    const totalPhilHealth = enriched.reduce((s, { e }) => s + (parseFloat(String(e.philHealthContribution)) || 0), 0);
    const totalPagibig = enriched.reduce((s, { e }) => s + (parseFloat(String(e.pagibigContribution)) || 0), 0);
    const totalTax = enriched.reduce((s, { e }) => s + (parseFloat(String(e.withholdingTax)) || 0), 0);
    const totalAdvances = enriched.reduce((s, { e }) => s + (parseFloat(String(e.advances)) || 0), 0);
    const totalOther = enriched.reduce((s, { e }) => s + (parseFloat(String(e.otherDeductions)) || 0), 0);
    const totalDeductions = enriched.reduce((s, { e }) => s + (parseFloat(String(e.totalDeductions)) || 0), 0);
    const totalSSSLoan = enriched.reduce((s, { e }) => s + (parseFloat(String(e.sssLoan)) || 0), 0);
    const totalPagibigLoan = enriched.reduce((s, { e }) => s + (parseFloat(String(e.pagibigLoan)) || 0), 0);
    const summaryRows = [
      "",
      row(
        "TOTALS",
        "",
        "",
        "",
        "",
        "",
        "",
        peso(totalSSS),
        peso(totalSSSLoan),
        peso(totalPhilHealth),
        peso(totalPagibig),
        peso(totalPagibigLoan),
        peso(totalTax),
        peso(totalAdvances),
        peso(totalOther),
        peso(totalDeductions)
      )
    ];
    const csv = buildCSV([...meta, headers, ...dataRows, ...summaryRows]);
    const filename = `deductions_export_${format(/* @__PURE__ */ new Date(), "yyyy-MM-dd_HHmmss")}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(csv, "utf8"));
    await createAuditLog({
      action: "export_deductions",
      entityType: "deduction_report",
      entityId: periodId,
      userId: req.user.id,
      newValues: { entriesExported: enriched.length, filename, periodLabel },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"]
    });
  } catch (error) {
    console.error("Error exporting deductions:", error);
    res.status(500).json({ message: "Failed to export deduction data" });
  }
});
router6.get("/api/reports/summary", requireAuth7, requireManagerRole2, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { month, year } = req.query;
    const now = /* @__PURE__ */ new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 0 || targetMonth > 11) {
      return res.status(400).json({ message: "Invalid month or year" });
    }
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    const employees = await dbStorage.getUsersByBranch(branchId);
    const activeEmployees = employees.filter((e) => e.isActive);
    const allPeriods = await dbStorage.getPayrollPeriodsByBranch(branchId);
    const monthPeriods = allPeriods.filter((p) => {
      const periodEnd = new Date(p.endDate);
      const periodStart = new Date(p.startDate);
      return periodEnd >= startDate && periodStart <= endDate;
    });
    let totalGross = 0, totalDeductions = 0, totalNet = 0, totalHours = 0;
    let totalSSS = 0, totalPhilHealth = 0, totalPagibig = 0, totalTax = 0;
    console.log(`
=== REPORTS SUMMARY API [${targetMonth + 1}/${targetYear}] ===`);
    console.log(`Branch: ${branchId}, Active Employees: ${activeEmployees.length}`);
    console.log(`Found ${monthPeriods.length} overlapping periods.`);
    const { calculateAllDeductions: calculateAllDeductions2, calculateWithholdingTax: calculateWithholdingTax2 } = await Promise.resolve().then(() => (init_deductions(), deductions_exports));
    for (const period of monthPeriods) {
      const entries = await dbStorage.getPayrollEntriesByPeriod(period.id);
      console.log(`>> Period ${period.id}: Found ${entries.length} entries. startDate: ${period.startDate}, endDate: ${period.endDate}`);
      const startDateObj = new Date(period.startDate);
      const endDateObj = new Date(period.endDate);
      const daysInPeriod = Math.round((endDateObj.getTime() - startDateObj.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
      const periodFraction = daysInPeriod < 28 ? 0.5 : 1;
      console.log(`   Period days: ${daysInPeriod}, fraction multiplier: ${periodFraction}`);
      for (const entry of entries) {
        totalGross += parseFloat(String(entry.grossPay ?? "0")) || 0;
        totalDeductions += parseFloat(String(entry.totalDeductions ?? "0")) || 0;
        totalNet += parseFloat(String(entry.netPay ?? "0")) || 0;
        totalHours += parseFloat(String(entry.totalHours ?? "0")) || 0;
        let currentSSS = parseFloat(String(entry.sssContribution ?? entry.sss_contribution ?? "0")) || 0;
        let currentPhilHealth = parseFloat(String(entry.philHealthContribution ?? entry.phil_health_contribution ?? entry.philhealthContribution ?? "0")) || 0;
        let currentPagibig = parseFloat(String(entry.pagibigContribution ?? entry.pagibig_contribution ?? "0")) || 0;
        let currentTax = parseFloat(String(entry.withholdingTax ?? entry.withholding_tax ?? "0")) || 0;
        if (currentSSS === 0 && currentPhilHealth === 0 && currentPagibig === 0) {
          const basicPay = parseFloat(String(entry.basicPay ?? "0")) || 0;
          const monthlyBasicSalary = basicPay / periodFraction;
          console.log(`   [User: ${entry.userId}] DB stored "0". Recalculating... BasicPay: ${basicPay}, MonthlyEq: ${monthlyBasicSalary}`);
          if (monthlyBasicSalary > 0) {
            const mandatoryBreakdown = await calculateAllDeductions2(monthlyBasicSalary, {
              deductSSS: true,
              deductPhilHealth: true,
              deductPagibig: true,
              deductWithholdingTax: false
            });
            currentSSS = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
            currentPhilHealth = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
            currentPagibig = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;
            if (currentTax === 0) {
              const user = employees.find((e) => e.id === entry.userId);
              const isMwe = user ? user.isMwe : false;
              if (!isMwe) {
                const monthlyMandatory = mandatoryBreakdown.sssContribution + mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
                const monthlyTaxableIncome = Math.max(0, monthlyBasicSalary - monthlyMandatory);
                const monthlyTax = await calculateWithholdingTax2(monthlyTaxableIncome);
                currentTax = Math.round(monthlyTax * periodFraction * 100) / 100;
              }
            }
            console.log(`     Calculated -> SSS: ${currentSSS}, PH: ${currentPhilHealth}, PI: ${currentPagibig}, Tax: ${currentTax}`);
          }
        } else {
          console.log(`   [User: ${entry.userId}] Found saved deductions -> SSS: ${currentSSS}, PH: ${currentPhilHealth}, PI: ${currentPagibig}, Tax: ${currentTax}`);
        }
        totalSSS += currentSSS;
        totalPhilHealth += currentPhilHealth;
        totalPagibig += currentPagibig;
        totalTax += currentTax;
      }
    }
    console.log(`=== GRAND TOTALS -> SSS: ${totalSSS}, PH: ${totalPhilHealth}, PI: ${totalPagibig}, Tax: ${totalTax} ===
`);
    res.json({
      summary: {
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        totalGross: (Math.round(totalGross * 100) / 100).toFixed(2),
        totalDeductions: (Math.round(totalDeductions * 100) / 100).toFixed(2),
        totalNet: (Math.round(totalNet * 100) / 100).toFixed(2),
        totalHours: totalHours.toFixed(2),
        totalSSS: (Math.round(totalSSS * 100) / 100).toFixed(2),
        totalPhilHealth: (Math.round(totalPhilHealth * 100) / 100).toFixed(2),
        totalPagibig: (Math.round(totalPagibig * 100) / 100).toFixed(2),
        totalTax: (Math.round(totalTax * 100) / 100).toFixed(2),
        month: targetMonth + 1,
        year: targetYear
      }
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
});
router6.get("/api/reports/remittance", requireAuth7, requireManagerRole2, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { month, year } = req.query;
    const now = /* @__PURE__ */ new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 0 || targetMonth > 11) {
      return res.status(400).json({ message: "Invalid month or year" });
    }
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    const employees = await dbStorage.getUsersByBranch(branchId);
    const allPeriods = await dbStorage.getPayrollPeriodsByBranch(branchId);
    const monthPeriods = allPeriods.filter((p) => {
      const periodEnd = new Date(p.endDate);
      const periodStart = new Date(p.startDate);
      return periodEnd >= startDate && periodStart <= endDate;
    });
    const employeeRemittances = {};
    for (const employee of employees) {
      employeeRemittances[employee.id] = {
        employeeName: `${employee.firstName} ${employee.lastName}`,
        sssContribution: 0,
        sssLoan: 0,
        philHealthContribution: 0,
        pagibigContribution: 0,
        pagibigLoan: 0
      };
    }
    for (const period of monthPeriods) {
      const entries = await dbStorage.getPayrollEntriesByPeriod(period.id);
      for (const entry of entries) {
        if (!employeeRemittances[entry.userId]) continue;
        let sssC = parseFloat(String(entry.sssContribution ?? "0")) || 0;
        let phC = parseFloat(String(entry.philHealthContribution ?? "0")) || 0;
        let pagC = parseFloat(String(entry.pagibigContribution ?? "0")) || 0;
        let sssL = parseFloat(String(entry.sssLoan ?? "0")) || 0;
        let pagL = parseFloat(String(entry.pagibigLoan ?? "0")) || 0;
        employeeRemittances[entry.userId].sssContribution += sssC;
        employeeRemittances[entry.userId].philHealthContribution += phC;
        employeeRemittances[entry.userId].pagibigContribution += pagC;
        employeeRemittances[entry.userId].sssLoan += sssL;
        employeeRemittances[entry.userId].pagibigLoan += pagL;
      }
    }
    const activeRemittances = Object.values(employeeRemittances).filter(
      (r) => r.sssContribution > 0 || r.sssLoan > 0 || r.philHealthContribution > 0 || r.pagibigContribution > 0 || r.pagibigLoan > 0
    );
    res.json(activeRemittances);
  } catch (error) {
    console.error("Error fetching remittances:", error);
    res.status(500).json({ message: "Failed to fetch remittances" });
  }
});
router6.get("/api/reports/debug", requireAuth7, requireManagerRole2, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { month, year } = req.query;
    const now = /* @__PURE__ */ new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    const allPeriods = await dbStorage.getPayrollPeriodsByBranch(branchId);
    const monthPeriods = allPeriods.filter((p) => {
      const periodEnd = new Date(p.endDate);
      const periodStart = new Date(p.startDate);
      return periodEnd >= startDate && periodStart <= endDate;
    });
    const rawEntries = [];
    for (const period of monthPeriods) {
      const entries = await dbStorage.getPayrollEntriesByPeriod(period.id);
      for (const entry of entries) {
        rawEntries.push({
          id: entry.id,
          userId: entry.userId,
          periodId: period.id,
          grossPay: entry.grossPay,
          totalDeductions: entry.totalDeductions,
          netPay: entry.netPay,
          sssContribution: entry.sssContribution,
          philHealthContribution: entry.philHealthContribution,
          pagibigContribution: entry.pagibigContribution,
          withholdingTax: entry.withholdingTax
        });
      }
    }
    res.json({
      branchId,
      targetMonth: targetMonth + 1,
      targetYear,
      periodsFound: monthPeriods.length,
      entriesFound: rawEntries.length,
      entries: rawEntries
    });
  } catch (error) {
    res.status(500).json({ message: "Debug failed", error: String(error) });
  }
});

// server/routes/forecast.ts
init_db_storage();
import { Router as Router8 } from "express";
import {
  format as format2,
  subDays,
  subWeeks,
  startOfWeek as startOfWeek2,
  endOfWeek as endOfWeek2,
  startOfDay as startOfDay2,
  endOfDay as endOfDay2,
  addDays,
  getDay,
  differenceInHours,
  parseISO,
  isSameDay
} from "date-fns";
var router7 = Router8();
var PH_HOLIDAYS = [
  // 2025 Regular Holidays
  { date: "2025-01-01", name: "New Year's Day", type: "regular" },
  { date: "2025-04-09", name: "Araw ng Kagitingan", type: "regular" },
  { date: "2025-04-17", name: "Maundy Thursday", type: "regular" },
  { date: "2025-04-18", name: "Good Friday", type: "regular" },
  { date: "2025-05-01", name: "Labor Day", type: "regular" },
  { date: "2025-06-12", name: "Independence Day", type: "regular" },
  { date: "2025-08-25", name: "National Heroes Day", type: "regular" },
  { date: "2025-11-30", name: "Bonifacio Day", type: "regular" },
  { date: "2025-12-25", name: "Christmas Day", type: "regular" },
  { date: "2025-12-30", name: "Rizal Day", type: "regular" },
  // 2025 Special Non-Working Days
  { date: "2025-01-29", name: "Chinese New Year", type: "special" },
  { date: "2025-02-25", name: "EDSA Revolution Anniversary", type: "special" },
  { date: "2025-04-19", name: "Black Saturday", type: "special" },
  { date: "2025-08-21", name: "Ninoy Aquino Day", type: "special" },
  { date: "2025-11-01", name: "All Saints' Day", type: "special" },
  { date: "2025-11-02", name: "All Souls' Day", type: "special" },
  { date: "2025-12-08", name: "Immaculate Conception", type: "special" },
  { date: "2025-12-24", name: "Christmas Eve", type: "special" },
  { date: "2025-12-31", name: "New Year's Eve", type: "special" },
  // 2026 Regular Holidays
  { date: "2026-01-01", name: "New Year's Day", type: "regular" },
  { date: "2026-04-09", name: "Araw ng Kagitingan", type: "regular" },
  { date: "2026-04-02", name: "Maundy Thursday", type: "regular" },
  { date: "2026-04-03", name: "Good Friday", type: "regular" },
  { date: "2026-05-01", name: "Labor Day", type: "regular" },
  { date: "2026-06-12", name: "Independence Day", type: "regular" },
  { date: "2026-08-31", name: "National Heroes Day", type: "regular" },
  { date: "2026-11-30", name: "Bonifacio Day", type: "regular" },
  { date: "2026-12-25", name: "Christmas Day", type: "regular" },
  { date: "2026-12-30", name: "Rizal Day", type: "regular" }
];
var FORECAST_MODEL = {
  name: "Seasonal Naive",
  variant: "Day-of-Week Average",
  label: "Seasonal Naive (Day-of-Week Average)",
  trainingWindow: "8 weeks",
  confidenceBand: "\xB110%",
  description: "Uses the last 8 weeks of branch shift history, groups by weekday, and applies holiday-aware adjustments."
};
function buildForecastMeta() {
  return {
    ...FORECAST_MODEL,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function getHolidayFromDB(date, branchHolidays) {
  const dateStr = format2(date, "yyyy-MM-dd");
  if (branchHolidays && branchHolidays.length > 0) {
    const dbHoliday = branchHolidays.find((h) => {
      const hDate = format2(new Date(h.date), "yyyy-MM-dd");
      return hDate === dateStr;
    });
    if (dbHoliday) {
      const mappedType = dbHoliday.type === "regular" ? "regular" : "special";
      return { name: dbHoliday.name, type: mappedType };
    }
    return null;
  }
  const holiday = PH_HOLIDAYS.find((h) => h.date === dateStr);
  return holiday ? { name: holiday.name, type: holiday.type } : null;
}
function getHoliday(date) {
  const dateStr = format2(date, "yyyy-MM-dd");
  const holiday = PH_HOLIDAYS.find((h) => h.date === dateStr);
  return holiday ? { name: holiday.name, type: holiday.type } : null;
}
async function getUpcomingHolidaysFromDB(days) {
  const today = startOfDay2(/* @__PURE__ */ new Date());
  const endDate = addDays(today, days);
  try {
    const holidays2 = await dbStorage.getHolidays(today, endDate);
    return holidays2.map((h) => ({
      date: format2(new Date(h.date), "yyyy-MM-dd"),
      name: h.name,
      type: h.type === "regular" ? "regular" : "special"
    }));
  } catch (error) {
    console.error("Failed to load upcoming DB holidays, returning empty", error);
    return [];
  }
}
var requireAuth8 = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  req.user = req.session.user;
  next();
};
var requireManagerRole3 = (req, res, next) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};
router7.get("/api/analytics/trends", requireAuth8, requireManagerRole3, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { days = "56", view = "daily" } = req.query;
    const numDays = Math.min(parseInt(days) || 56, 90);
    const endDate = endOfDay2(/* @__PURE__ */ new Date());
    const startDate = startOfDay2(subDays(endDate, numDays - 1));
    const shiftsInRange = await dbStorage.getShiftsByBranch(branchId, startDate, endDate);
    const branchUsers = await dbStorage.getUsersByBranch(branchId);
    const userMap = new Map(branchUsers.map((u) => [u.id, u]));
    const dbHolidays = await dbStorage.getHolidays(startDate, endDate);
    const dailyData = {};
    for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
      const dateKey = format2(d, "yyyy-MM-dd");
      dailyData[dateKey] = { hours: 0, cost: 0, shifts: 0, date: dateKey };
    }
    for (const shift of shiftsInRange) {
      const dateKey = format2(new Date(shift.startTime), "yyyy-MM-dd");
      if (dailyData[dateKey]) {
        const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
        dailyData[dateKey].hours += hours;
        dailyData[dateKey].shifts += 1;
        const user = userMap.get(shift.userId);
        const hourlyRate = parseFloat(user?.hourlyRate || "0");
        if (hourlyRate > 0) {
          dailyData[dateKey].cost += hours * hourlyRate;
        }
      }
    }
    const trends = Object.values(dailyData).map((d) => {
      const parsedDate = parseISO(d.date);
      const isHolidayDb = dbHolidays.find((h) => format2(new Date(h.date), "yyyy-MM-dd") === d.date);
      const holidayFinal = isHolidayDb ? { name: isHolidayDb.name, type: isHolidayDb.type === "regular" ? "regular" : "special" } : getHoliday(parsedDate);
      return {
        ...d,
        dayOfWeek: format2(parsedDate, "EEE"),
        dayOfWeekNum: getDay(parsedDate),
        isHoliday: holidayFinal
      };
    });
    let weeklyData = [];
    if (view === "weekly") {
      const weekMap = {};
      for (const day of trends) {
        const weekStart = format2(startOfWeek2(parseISO(day.date), { weekStartsOn: 1 }), "yyyy-MM-dd");
        if (!weekMap[weekStart]) {
          weekMap[weekStart] = { hours: 0, cost: 0, shifts: 0, weekStart };
        }
        weekMap[weekStart].hours += day.hours;
        weekMap[weekStart].cost += day.cost;
        weekMap[weekStart].shifts += day.shifts;
      }
      weeklyData = Object.values(weekMap);
    }
    const dayOfWeekAverages = {};
    for (let i = 0; i < 7; i++) {
      dayOfWeekAverages[i] = { hours: 0, cost: 0, count: 0 };
    }
    for (const day of trends) {
      const dow = day.dayOfWeekNum;
      dayOfWeekAverages[dow].hours += day.hours;
      dayOfWeekAverages[dow].cost += day.cost;
      dayOfWeekAverages[dow].count += 1;
    }
    const weeklyPatterns = Object.entries(dayOfWeekAverages).map(([dow, data]) => ({
      dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseInt(dow)],
      dayOfWeekNum: parseInt(dow),
      avgHours: data.count > 0 ? data.hours / data.count : 0,
      avgCost: data.count > 0 ? data.cost / data.count : 0
    }));
    const today = /* @__PURE__ */ new Date();
    const thisWeekStart = startOfWeek2(today, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek2(today, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek2(subWeeks(today, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek2(subWeeks(today, 1), { weekStartsOn: 1 });
    const thisWeekShifts = shiftsInRange.filter((s) => {
      const d = new Date(s.startTime);
      return d >= thisWeekStart && d <= thisWeekEnd;
    });
    const lastWeekShifts = shiftsInRange.filter((s) => {
      const d = new Date(s.startTime);
      return d >= lastWeekStart && d <= lastWeekEnd;
    });
    let thisWeekHours = 0, lastWeekHours = 0;
    for (const s of thisWeekShifts) {
      thisWeekHours += differenceInHours(new Date(s.endTime), new Date(s.startTime));
    }
    for (const s of lastWeekShifts) {
      lastWeekHours += differenceInHours(new Date(s.endTime), new Date(s.startTime));
    }
    const comparison = {
      thisWeek: { hours: thisWeekHours, shifts: thisWeekShifts.length },
      lastWeek: { hours: lastWeekHours, shifts: lastWeekShifts.length },
      hoursChange: lastWeekHours > 0 ? (thisWeekHours - lastWeekHours) / lastWeekHours * 100 : 0,
      shiftsChange: lastWeekShifts.length > 0 ? (thisWeekShifts.length - lastWeekShifts.length) / lastWeekShifts.length * 100 : 0
    };
    res.json({
      trends: view === "weekly" ? weeklyData : trends,
      weeklyPatterns,
      comparison,
      meta: { startDate: format2(startDate, "yyyy-MM-dd"), endDate: format2(endDate, "yyyy-MM-dd"), view }
    });
  } catch (error) {
    console.error("Error fetching analytics trends:", error);
    res.status(500).json({ message: "Failed to fetch analytics trends" });
  }
});
router7.get("/api/forecast/labor", requireAuth8, requireManagerRole3, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { days = "14" } = req.query;
    const forecastDays = Math.min(parseInt(days) || 14, 30);
    const today = startOfDay2(/* @__PURE__ */ new Date());
    const historyStart = subWeeks(today, 8);
    const allShifts = await dbStorage.getShiftsByBranch(branchId, historyStart, today);
    const historicalShifts = allShifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= historyStart && d < today;
    });
    let dbHolidays = [];
    try {
      const { db: forecastDb } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { holidays: holidaysTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      dbHolidays = await forecastDb.select().from(holidaysTable);
    } catch (e) {
      console.warn("[Forecast] Could not load DB holidays, using static fallback");
    }
    const dowStats = {};
    for (let i = 0; i < 7; i++) dowStats[i] = { hours: [] };
    const dailyHours = {};
    for (const shift of historicalShifts) {
      const dateKey = format2(new Date(shift.startTime), "yyyy-MM-dd");
      const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      dailyHours[dateKey] = (dailyHours[dateKey] || 0) + hours;
    }
    for (const [dateKey, hours] of Object.entries(dailyHours)) {
      const dow = getDay(parseISO(dateKey));
      dowStats[dow].hours.push(hours);
    }
    const dowAverages = {};
    for (let i = 0; i < 7; i++) {
      const values = dowStats[i].hours;
      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.length > 1 ? values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / (values.length - 1) : 0;
        dowAverages[i] = { avg: isNaN(avg) ? 8 : avg, std: Math.sqrt(variance) };
      } else {
        dowAverages[i] = { avg: 8, std: 2 };
      }
    }
    const forecasts = [];
    for (let i = 0; i < forecastDays; i++) {
      const forecastDate = addDays(today, i);
      const dow = getDay(forecastDate);
      const holiday = await getHolidayFromDB(forecastDate, dbHolidays);
      let predicted = dowAverages[dow].avg;
      if (holiday) {
        if (holiday.type === "regular") {
          predicted *= 0.4;
        } else {
          predicted *= 0.7;
        }
      }
      const validPredicted = isNaN(predicted) ? 8 : predicted;
      const lower = validPredicted * 0.9;
      const upper = validPredicted * 1.1;
      forecasts.push({
        date: format2(forecastDate, "yyyy-MM-dd"),
        dayOfWeek: format2(forecastDate, "EEE"),
        predicted: Math.round(validPredicted * 10) / 10,
        lower: Math.round(lower * 10) / 10,
        upper: Math.round(upper * 10) / 10,
        isHoliday: holiday
      });
    }
    const hasEnoughData = Object.values(dowStats).every((s) => s.hours.length >= 2);
    res.json({
      forecasts,
      confidence: hasEnoughData ? "high" : "low",
      message: hasEnoughData ? "Predictions based on 8-week historical patterns" : "Limited data - predictions based on defaults. Add more shifts for better accuracy.",
      meta: buildForecastMeta()
    });
  } catch (error) {
    console.error("Error generating labor forecast:", error);
    res.status(500).json({ message: "Failed to generate labor forecast" });
  }
});
router7.get("/api/forecast/payroll", requireAuth8, requireManagerRole3, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { days = "14" } = req.query;
    const forecastDays = Math.min(parseInt(days) || 14, 30);
    const today = startOfDay2(/* @__PURE__ */ new Date());
    const historyStart = subWeeks(today, 8);
    const allShifts = await dbStorage.getShiftsByBranch(branchId, historyStart, today);
    const employees = await dbStorage.getUsersByBranch(branchId);
    const rateMap = {};
    for (const emp of employees) {
      const rate = parseFloat(emp.hourlyRate || "0");
      if (rate > 0) {
        rateMap[emp.id] = rate;
      }
    }
    let dbHolidays = [];
    try {
      const { db: forecastDb } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { holidays: holidaysTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      dbHolidays = await forecastDb.select().from(holidaysTable);
    } catch (e) {
      console.warn("[Forecast] Could not load DB holidays, using static fallback");
    }
    const dowCosts = {};
    for (let i = 0; i < 7; i++) dowCosts[i] = [];
    const historicalShifts = allShifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= historyStart && d < today;
    });
    const dailyCosts = {};
    for (const shift of historicalShifts) {
      const dateKey = format2(new Date(shift.startTime), "yyyy-MM-dd");
      const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      const rate = rateMap[shift.userId];
      if (!rate) continue;
      dailyCosts[dateKey] = (dailyCosts[dateKey] || 0) + hours * rate;
    }
    for (const [dateKey, cost] of Object.entries(dailyCosts)) {
      const dow = getDay(parseISO(dateKey));
      dowCosts[dow].push(cost);
    }
    const dowAverages = {};
    for (let i = 0; i < 7; i++) {
      const values = dowCosts[i];
      let avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 800;
      dowAverages[i] = isNaN(avg) ? 800 : avg;
    }
    const forecasts = [];
    let totalPredicted = 0;
    for (let i = 0; i < forecastDays; i++) {
      const forecastDate = addDays(today, i);
      const dow = getDay(forecastDate);
      const holiday = await getHolidayFromDB(forecastDate, dbHolidays);
      let predicted = dowAverages[dow];
      if (holiday) {
        if (holiday.type === "regular") {
          predicted = predicted * 0.4 * 2;
        } else {
          predicted = predicted * 0.7 * 1.3;
        }
      }
      const validPredicted = isNaN(predicted) ? 800 : predicted;
      totalPredicted += validPredicted;
      forecasts.push({
        date: format2(forecastDate, "yyyy-MM-dd"),
        dayOfWeek: format2(forecastDate, "EEE"),
        predicted: Math.round(validPredicted),
        lower: Math.round(validPredicted * 0.9),
        upper: Math.round(validPredicted * 1.1),
        isHoliday: holiday
      });
    }
    res.json({
      forecasts,
      summary: {
        totalPredicted: Math.round(totalPredicted),
        avgDaily: Math.round(totalPredicted / forecastDays),
        period: `${forecastDays} days`
      },
      meta: buildForecastMeta()
    });
  } catch (error) {
    console.error("Error generating payroll forecast:", error);
    res.status(500).json({ message: "Failed to generate payroll forecast" });
  }
});
router7.get("/api/forecast/peaks", requireAuth8, requireManagerRole3, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { days = "30" } = req.query;
    const forecastDays = Math.min(parseInt(days) || 30, 60);
    const today = startOfDay2(/* @__PURE__ */ new Date());
    const historyStart = subWeeks(today, 8);
    const allShifts = await dbStorage.getShiftsByBranch(branchId, historyStart, today);
    const dowHours = {};
    for (let i = 0; i < 7; i++) dowHours[i] = [];
    const historicalShifts = allShifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= historyStart && d < today;
    });
    const dailyHours = {};
    for (const shift of historicalShifts) {
      const dateKey = format2(new Date(shift.startTime), "yyyy-MM-dd");
      const hours = differenceInHours(new Date(shift.endTime), new Date(shift.startTime));
      dailyHours[dateKey] = (dailyHours[dateKey] || 0) + hours;
    }
    for (const [dateKey, hours] of Object.entries(dailyHours)) {
      const dow = getDay(parseISO(dateKey));
      dowHours[dow].push(hours);
    }
    const allHours = Object.values(dailyHours);
    const overallAvg = allHours.length > 0 ? allHours.reduce((a, b) => a + b, 0) / allHours.length : 8;
    const peakThreshold = overallAvg * 1.2;
    const dowAverages = Object.entries(dowHours).map(([dow, hours]) => ({
      dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parseInt(dow)],
      dayOfWeekNum: parseInt(dow),
      avgHours: hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : 0,
      isPeak: false
    }));
    for (const day of dowAverages) {
      day.isPeak = day.avgHours > peakThreshold;
    }
    const upcomingPeaks = [];
    const upcomingHolidays = await getUpcomingHolidaysFromDB(forecastDays);
    for (let i = 0; i < forecastDays; i++) {
      const forecastDate = addDays(today, i);
      const dow = getDay(forecastDate);
      const dayData = dowAverages.find((d) => d.dayOfWeekNum === dow);
      const forecastDateStr = format2(forecastDate, "yyyy-MM-dd");
      const holiday = upcomingHolidays.find((h) => h.date === forecastDateStr) || getHoliday(forecastDate);
      if (dayData?.isPeak || holiday) {
        upcomingPeaks.push({
          date: format2(forecastDate, "yyyy-MM-dd"),
          dayOfWeek: format2(forecastDate, "EEE"),
          reason: holiday ? `Holiday: ${holiday.name}` : "High demand day",
          expectedHours: dayData?.avgHours || 0,
          type: holiday ? "holiday" : "peak"
        });
      }
    }
    res.json({
      peakDaysOfWeek: dowAverages.filter((d) => d.isPeak),
      upcomingPeaks,
      upcomingHolidays,
      averageDailyHours: Math.round(overallAvg * 10) / 10
    });
  } catch (error) {
    console.error("Error detecting peak periods:", error);
    res.status(500).json({ message: "Failed to detect peak periods" });
  }
});
router7.get("/api/forecast/staffing", requireAuth8, requireManagerRole3, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const { days = "14" } = req.query;
    const forecastDays = Math.min(parseInt(days) || 14, 30);
    const today = startOfDay2(/* @__PURE__ */ new Date());
    const historyStart = subWeeks(today, 8);
    const futureEnd = addDays(today, forecastDays);
    const allShifts = await dbStorage.getShiftsByBranch(branchId, historyStart, futureEnd);
    const futureShifts = allShifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= today && d <= futureEnd;
    });
    const employees = await dbStorage.getUsersByBranch(branchId);
    const activeEmployees = employees.filter((e) => e.isActive && e.role !== "manager" && e.role !== "admin");
    const allTimeOffPromises = activeEmployees.map((e) => dbStorage.getTimeOffRequestsByUser(e.id));
    const allTimeOffResults = await Promise.all(allTimeOffPromises);
    const timeOffRequests2 = allTimeOffResults.flat();
    const pendingTimeOff = timeOffRequests2.filter(
      (r) => r.status === "pending" || r.status === "approved"
    );
    const historicalShifts = allShifts.filter((s) => {
      const d = new Date(s.startTime);
      return d >= historyStart && d < today;
    });
    const dailyShiftCounts = {};
    for (const shift of historicalShifts) {
      const dateKey = format2(new Date(shift.startTime), "yyyy-MM-dd");
      dailyShiftCounts[dateKey] = (dailyShiftCounts[dateKey] || 0) + 1;
    }
    const avgShiftsPerDay = Object.values(dailyShiftCounts).length > 0 ? Object.values(dailyShiftCounts).reduce((a, b) => a + b, 0) / Object.values(dailyShiftCounts).length : 3;
    const alerts = [];
    for (let i = 0; i < forecastDays; i++) {
      const checkDate = addDays(today, i);
      const dateStr = format2(checkDate, "yyyy-MM-dd");
      const scheduledShifts = futureShifts.filter(
        (s) => isSameDay(new Date(s.startTime), checkDate)
      );
      const onLeave = pendingTimeOff.filter((r) => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return checkDate >= start && checkDate <= end;
      });
      const availableEmployees = activeEmployees.length - onLeave.length;
      const holiday = getHoliday(checkDate);
      const expectedNeed = holiday ? Math.ceil(avgShiftsPerDay * 0.5) : Math.ceil(avgShiftsPerDay);
      if (scheduledShifts.length < expectedNeed * 0.7) {
        alerts.push({
          date: dateStr,
          dayOfWeek: format2(checkDate, "EEE"),
          type: "understaffed",
          severity: scheduledShifts.length === 0 ? "high" : "medium",
          scheduledShifts: scheduledShifts.length,
          expectedNeed,
          availableEmployees,
          onLeave: onLeave.length,
          message: scheduledShifts.length === 0 ? `No shifts scheduled for ${format2(checkDate, "MMM d")}!` : `Only ${scheduledShifts.length} shifts scheduled (expected ${expectedNeed})`,
          holiday: holiday?.name || null
        });
      }
    }
    res.json({
      alerts: alerts.sort((a, b) => a.severity === "high" ? -1 : 1),
      summary: {
        totalAlerts: alerts.length,
        highSeverity: alerts.filter((a) => a.severity === "high").length,
        mediumSeverity: alerts.filter((a) => a.severity === "medium").length,
        activeEmployees: activeEmployees.length,
        upcomingTimeOff: pendingTimeOff.length
      }
    });
  } catch (error) {
    console.error("Error generating staffing alerts:", error);
    res.status(500).json({ message: "Failed to generate staffing alerts" });
  }
});

// server/routes/seed-rates.ts
init_db_storage();
import { Router as Router9 } from "express";

// shared/sss-2025-rates.ts
var sss2025Brackets = [
  { minSalary: 0, maxSalary: 5249.99, regularSSMSC: 5e3, mpfMSC: 0, totalMSC: 5e3, regularSSER: 500, mpfER: 0, ecER: 10, totalER: 510, regularSSEE: 250, mpfEE: 0, totalEE: 250, totalContributions: 760 },
  { minSalary: 5250, maxSalary: 5749.99, regularSSMSC: 5500, mpfMSC: 0, totalMSC: 5500, regularSSER: 550, mpfER: 0, ecER: 10, totalER: 560, regularSSEE: 275, mpfEE: 0, totalEE: 275, totalContributions: 835 },
  { minSalary: 5750, maxSalary: 6249.99, regularSSMSC: 6e3, mpfMSC: 0, totalMSC: 6e3, regularSSER: 600, mpfER: 0, ecER: 10, totalER: 610, regularSSEE: 300, mpfEE: 0, totalEE: 300, totalContributions: 910 },
  { minSalary: 6250, maxSalary: 6749.99, regularSSMSC: 6500, mpfMSC: 0, totalMSC: 6500, regularSSER: 650, mpfER: 0, ecER: 10, totalER: 660, regularSSEE: 325, mpfEE: 0, totalEE: 325, totalContributions: 985 },
  { minSalary: 6750, maxSalary: 7249.99, regularSSMSC: 7e3, mpfMSC: 0, totalMSC: 7e3, regularSSER: 700, mpfER: 0, ecER: 10, totalER: 710, regularSSEE: 350, mpfEE: 0, totalEE: 350, totalContributions: 1060 },
  { minSalary: 7250, maxSalary: 7749.99, regularSSMSC: 7500, mpfMSC: 0, totalMSC: 7500, regularSSER: 750, mpfER: 0, ecER: 10, totalER: 760, regularSSEE: 375, mpfEE: 0, totalEE: 375, totalContributions: 1135 },
  { minSalary: 7750, maxSalary: 8249.99, regularSSMSC: 8e3, mpfMSC: 0, totalMSC: 8e3, regularSSER: 800, mpfER: 0, ecER: 10, totalER: 810, regularSSEE: 400, mpfEE: 0, totalEE: 400, totalContributions: 1210 },
  { minSalary: 8250, maxSalary: 8749.99, regularSSMSC: 8500, mpfMSC: 0, totalMSC: 8500, regularSSER: 850, mpfER: 0, ecER: 10, totalER: 860, regularSSEE: 425, mpfEE: 0, totalEE: 425, totalContributions: 1285 },
  { minSalary: 8750, maxSalary: 9249.99, regularSSMSC: 9e3, mpfMSC: 0, totalMSC: 9e3, regularSSER: 900, mpfER: 0, ecER: 10, totalER: 910, regularSSEE: 450, mpfEE: 0, totalEE: 450, totalContributions: 1360 },
  { minSalary: 9250, maxSalary: 9749.99, regularSSMSC: 9500, mpfMSC: 0, totalMSC: 9500, regularSSER: 950, mpfER: 0, ecER: 10, totalER: 960, regularSSEE: 475, mpfEE: 0, totalEE: 475, totalContributions: 1435 },
  { minSalary: 9750, maxSalary: 10249.99, regularSSMSC: 1e4, mpfMSC: 0, totalMSC: 1e4, regularSSER: 1e3, mpfER: 0, ecER: 10, totalER: 1010, regularSSEE: 500, mpfEE: 0, totalEE: 500, totalContributions: 1510 },
  { minSalary: 10250, maxSalary: 10749.99, regularSSMSC: 10500, mpfMSC: 0, totalMSC: 10500, regularSSER: 1050, mpfER: 0, ecER: 10, totalER: 1060, regularSSEE: 525, mpfEE: 0, totalEE: 525, totalContributions: 1585 },
  { minSalary: 10750, maxSalary: 11249.99, regularSSMSC: 11e3, mpfMSC: 0, totalMSC: 11e3, regularSSER: 1100, mpfER: 0, ecER: 10, totalER: 1110, regularSSEE: 550, mpfEE: 0, totalEE: 550, totalContributions: 1660 },
  { minSalary: 11250, maxSalary: 11749.99, regularSSMSC: 11500, mpfMSC: 0, totalMSC: 11500, regularSSER: 1150, mpfER: 0, ecER: 10, totalER: 1160, regularSSEE: 575, mpfEE: 0, totalEE: 575, totalContributions: 1735 },
  { minSalary: 11750, maxSalary: 12249.99, regularSSMSC: 12e3, mpfMSC: 0, totalMSC: 12e3, regularSSER: 1200, mpfER: 0, ecER: 10, totalER: 1210, regularSSEE: 600, mpfEE: 0, totalEE: 600, totalContributions: 1810 },
  { minSalary: 12250, maxSalary: 12749.99, regularSSMSC: 12500, mpfMSC: 0, totalMSC: 12500, regularSSER: 1250, mpfER: 0, ecER: 10, totalER: 1260, regularSSEE: 625, mpfEE: 0, totalEE: 625, totalContributions: 1885 },
  { minSalary: 12750, maxSalary: 13249.99, regularSSMSC: 13e3, mpfMSC: 0, totalMSC: 13e3, regularSSER: 1300, mpfER: 0, ecER: 10, totalER: 1310, regularSSEE: 650, mpfEE: 0, totalEE: 650, totalContributions: 1960 },
  { minSalary: 13250, maxSalary: 13749.99, regularSSMSC: 13500, mpfMSC: 0, totalMSC: 13500, regularSSER: 1350, mpfER: 0, ecER: 10, totalER: 1360, regularSSEE: 675, mpfEE: 0, totalEE: 675, totalContributions: 2035 },
  { minSalary: 13750, maxSalary: 14249.99, regularSSMSC: 14e3, mpfMSC: 0, totalMSC: 14e3, regularSSER: 1400, mpfER: 0, ecER: 10, totalER: 1410, regularSSEE: 700, mpfEE: 0, totalEE: 700, totalContributions: 2110 },
  { minSalary: 14250, maxSalary: 14749.99, regularSSMSC: 14500, mpfMSC: 0, totalMSC: 14500, regularSSER: 1450, mpfER: 0, ecER: 10, totalER: 1460, regularSSEE: 725, mpfEE: 0, totalEE: 725, totalContributions: 2185 },
  { minSalary: 14750, maxSalary: 15249.99, regularSSMSC: 15e3, mpfMSC: 0, totalMSC: 15e3, regularSSER: 1500, mpfER: 0, ecER: 30, totalER: 1530, regularSSEE: 750, mpfEE: 0, totalEE: 750, totalContributions: 2280 },
  { minSalary: 15250, maxSalary: 15749.99, regularSSMSC: 15500, mpfMSC: 0, totalMSC: 15500, regularSSER: 1550, mpfER: 0, ecER: 30, totalER: 1580, regularSSEE: 775, mpfEE: 0, totalEE: 775, totalContributions: 2355 },
  { minSalary: 15750, maxSalary: 16249.99, regularSSMSC: 16e3, mpfMSC: 0, totalMSC: 16e3, regularSSER: 1600, mpfER: 0, ecER: 30, totalER: 1630, regularSSEE: 800, mpfEE: 0, totalEE: 800, totalContributions: 2430 },
  { minSalary: 16250, maxSalary: 16749.99, regularSSMSC: 16500, mpfMSC: 0, totalMSC: 16500, regularSSER: 1650, mpfER: 0, ecER: 30, totalER: 1680, regularSSEE: 825, mpfEE: 0, totalEE: 825, totalContributions: 2505 },
  { minSalary: 16750, maxSalary: 17249.99, regularSSMSC: 17e3, mpfMSC: 0, totalMSC: 17e3, regularSSER: 1700, mpfER: 0, ecER: 30, totalER: 1730, regularSSEE: 850, mpfEE: 0, totalEE: 850, totalContributions: 2580 },
  { minSalary: 17250, maxSalary: 17749.99, regularSSMSC: 17500, mpfMSC: 0, totalMSC: 17500, regularSSER: 1750, mpfER: 0, ecER: 30, totalER: 1780, regularSSEE: 875, mpfEE: 0, totalEE: 875, totalContributions: 2655 },
  { minSalary: 17750, maxSalary: 18249.99, regularSSMSC: 18e3, mpfMSC: 0, totalMSC: 18e3, regularSSER: 1800, mpfER: 0, ecER: 30, totalER: 1830, regularSSEE: 900, mpfEE: 0, totalEE: 900, totalContributions: 2730 },
  { minSalary: 18250, maxSalary: 18749.99, regularSSMSC: 18500, mpfMSC: 0, totalMSC: 18500, regularSSER: 1850, mpfER: 0, ecER: 30, totalER: 1880, regularSSEE: 925, mpfEE: 0, totalEE: 925, totalContributions: 2805 },
  { minSalary: 18750, maxSalary: 19249.99, regularSSMSC: 19e3, mpfMSC: 0, totalMSC: 19e3, regularSSER: 1900, mpfER: 0, ecER: 30, totalER: 1930, regularSSEE: 950, mpfEE: 0, totalEE: 950, totalContributions: 2880 },
  { minSalary: 19250, maxSalary: 19749.99, regularSSMSC: 19500, mpfMSC: 0, totalMSC: 19500, regularSSER: 1950, mpfER: 0, ecER: 30, totalER: 1980, regularSSEE: 975, mpfEE: 0, totalEE: 975, totalContributions: 2955 },
  { minSalary: 19750, maxSalary: 20249.99, regularSSMSC: 2e4, mpfMSC: 0, totalMSC: 2e4, regularSSER: 2e3, mpfER: 0, ecER: 30, totalER: 2030, regularSSEE: 1e3, mpfEE: 0, totalEE: 1e3, totalContributions: 3030 },
  // MPF brackets start (salary above ₱20,000)
  { minSalary: 20250, maxSalary: 20749.99, regularSSMSC: 2e4, mpfMSC: 500, totalMSC: 20500, regularSSER: 2e3, mpfER: 50, ecER: 30, totalER: 2080, regularSSEE: 1e3, mpfEE: 25, totalEE: 1025, totalContributions: 3105 },
  { minSalary: 20750, maxSalary: 21249.99, regularSSMSC: 2e4, mpfMSC: 1e3, totalMSC: 21e3, regularSSER: 2e3, mpfER: 100, ecER: 30, totalER: 2130, regularSSEE: 1e3, mpfEE: 50, totalEE: 1050, totalContributions: 3180 },
  { minSalary: 21250, maxSalary: 21749.99, regularSSMSC: 2e4, mpfMSC: 1500, totalMSC: 21500, regularSSER: 2e3, mpfER: 150, ecER: 30, totalER: 2180, regularSSEE: 1e3, mpfEE: 75, totalEE: 1075, totalContributions: 3255 },
  { minSalary: 21750, maxSalary: 22249.99, regularSSMSC: 2e4, mpfMSC: 2e3, totalMSC: 22e3, regularSSER: 2e3, mpfER: 200, ecER: 30, totalER: 2230, regularSSEE: 1e3, mpfEE: 100, totalEE: 1100, totalContributions: 3330 },
  { minSalary: 22250, maxSalary: 22749.99, regularSSMSC: 2e4, mpfMSC: 2500, totalMSC: 22500, regularSSER: 2e3, mpfER: 250, ecER: 30, totalER: 2280, regularSSEE: 1e3, mpfEE: 125, totalEE: 1125, totalContributions: 3405 },
  { minSalary: 22750, maxSalary: 23249.99, regularSSMSC: 2e4, mpfMSC: 3e3, totalMSC: 23e3, regularSSER: 2e3, mpfER: 300, ecER: 30, totalER: 2330, regularSSEE: 1e3, mpfEE: 150, totalEE: 1150, totalContributions: 3480 },
  { minSalary: 23250, maxSalary: 23749.99, regularSSMSC: 2e4, mpfMSC: 3500, totalMSC: 23500, regularSSER: 2e3, mpfER: 350, ecER: 30, totalER: 2380, regularSSEE: 1e3, mpfEE: 175, totalEE: 1175, totalContributions: 3555 },
  { minSalary: 23750, maxSalary: 24249.99, regularSSMSC: 2e4, mpfMSC: 4e3, totalMSC: 24e3, regularSSER: 2e3, mpfER: 400, ecER: 30, totalER: 2430, regularSSEE: 1e3, mpfEE: 200, totalEE: 1200, totalContributions: 3630 },
  { minSalary: 24250, maxSalary: 24749.99, regularSSMSC: 2e4, mpfMSC: 4500, totalMSC: 24500, regularSSER: 2e3, mpfER: 450, ecER: 30, totalER: 2480, regularSSEE: 1e3, mpfEE: 225, totalEE: 1225, totalContributions: 3705 },
  { minSalary: 24750, maxSalary: 25249.99, regularSSMSC: 2e4, mpfMSC: 5e3, totalMSC: 25e3, regularSSER: 2e3, mpfER: 500, ecER: 30, totalER: 2530, regularSSEE: 1e3, mpfEE: 250, totalEE: 1250, totalContributions: 3780 },
  { minSalary: 25250, maxSalary: 25749.99, regularSSMSC: 2e4, mpfMSC: 5500, totalMSC: 25500, regularSSER: 2e3, mpfER: 550, ecER: 30, totalER: 2580, regularSSEE: 1e3, mpfEE: 275, totalEE: 1275, totalContributions: 3855 },
  { minSalary: 25750, maxSalary: 26249.99, regularSSMSC: 2e4, mpfMSC: 6e3, totalMSC: 26e3, regularSSER: 2e3, mpfER: 600, ecER: 30, totalER: 2630, regularSSEE: 1e3, mpfEE: 300, totalEE: 1300, totalContributions: 3930 },
  { minSalary: 26250, maxSalary: 26749.99, regularSSMSC: 2e4, mpfMSC: 6500, totalMSC: 26500, regularSSER: 2e3, mpfER: 650, ecER: 30, totalER: 2680, regularSSEE: 1e3, mpfEE: 325, totalEE: 1325, totalContributions: 4005 },
  { minSalary: 26750, maxSalary: 27249.99, regularSSMSC: 2e4, mpfMSC: 7e3, totalMSC: 27e3, regularSSER: 2e3, mpfER: 700, ecER: 30, totalER: 2730, regularSSEE: 1e3, mpfEE: 350, totalEE: 1350, totalContributions: 4080 },
  { minSalary: 27250, maxSalary: 27749.99, regularSSMSC: 2e4, mpfMSC: 7500, totalMSC: 27500, regularSSER: 2e3, mpfER: 750, ecER: 30, totalER: 2780, regularSSEE: 1e3, mpfEE: 375, totalEE: 1375, totalContributions: 4155 },
  { minSalary: 27750, maxSalary: 28249.99, regularSSMSC: 2e4, mpfMSC: 8e3, totalMSC: 28e3, regularSSER: 2e3, mpfER: 800, ecER: 30, totalER: 2830, regularSSEE: 1e3, mpfEE: 400, totalEE: 1400, totalContributions: 4230 },
  { minSalary: 28250, maxSalary: 28749.99, regularSSMSC: 2e4, mpfMSC: 8500, totalMSC: 28500, regularSSER: 2e3, mpfER: 850, ecER: 30, totalER: 2880, regularSSEE: 1e3, mpfEE: 425, totalEE: 1425, totalContributions: 4305 },
  { minSalary: 28750, maxSalary: 29249.99, regularSSMSC: 2e4, mpfMSC: 9e3, totalMSC: 29e3, regularSSER: 2e3, mpfER: 900, ecER: 30, totalER: 2930, regularSSEE: 1e3, mpfEE: 450, totalEE: 1450, totalContributions: 4380 },
  { minSalary: 29250, maxSalary: 29749.99, regularSSMSC: 2e4, mpfMSC: 9500, totalMSC: 29500, regularSSER: 2e3, mpfER: 950, ecER: 30, totalER: 2980, regularSSEE: 1e3, mpfEE: 475, totalEE: 1475, totalContributions: 4455 },
  { minSalary: 29750, maxSalary: 30249.99, regularSSMSC: 2e4, mpfMSC: 1e4, totalMSC: 3e4, regularSSER: 2e3, mpfER: 1e3, ecER: 30, totalER: 3030, regularSSEE: 1e3, mpfEE: 500, totalEE: 1500, totalContributions: 4530 },
  { minSalary: 30250, maxSalary: 30749.99, regularSSMSC: 2e4, mpfMSC: 10500, totalMSC: 30500, regularSSER: 2e3, mpfER: 1050, ecER: 30, totalER: 3080, regularSSEE: 1e3, mpfEE: 525, totalEE: 1525, totalContributions: 4605 },
  { minSalary: 30750, maxSalary: 31249.99, regularSSMSC: 2e4, mpfMSC: 11e3, totalMSC: 31e3, regularSSER: 2e3, mpfER: 1100, ecER: 30, totalER: 3130, regularSSEE: 1e3, mpfEE: 550, totalEE: 1550, totalContributions: 4680 },
  { minSalary: 31250, maxSalary: 31749.99, regularSSMSC: 2e4, mpfMSC: 11500, totalMSC: 31500, regularSSER: 2e3, mpfER: 1150, ecER: 30, totalER: 3180, regularSSEE: 1e3, mpfEE: 575, totalEE: 1575, totalContributions: 4755 },
  { minSalary: 31750, maxSalary: 32249.99, regularSSMSC: 2e4, mpfMSC: 12e3, totalMSC: 32e3, regularSSER: 2e3, mpfER: 1200, ecER: 30, totalER: 3230, regularSSEE: 1e3, mpfEE: 600, totalEE: 1600, totalContributions: 4830 },
  { minSalary: 32250, maxSalary: 32749.99, regularSSMSC: 2e4, mpfMSC: 12500, totalMSC: 32500, regularSSER: 2e3, mpfER: 1250, ecER: 30, totalER: 3280, regularSSEE: 1e3, mpfEE: 625, totalEE: 1625, totalContributions: 4905 },
  { minSalary: 32750, maxSalary: 33249.99, regularSSMSC: 2e4, mpfMSC: 13e3, totalMSC: 33e3, regularSSER: 2e3, mpfER: 1300, ecER: 30, totalER: 3330, regularSSEE: 1e3, mpfEE: 650, totalEE: 1650, totalContributions: 4980 },
  { minSalary: 33250, maxSalary: 33749.99, regularSSMSC: 2e4, mpfMSC: 13500, totalMSC: 33500, regularSSER: 2e3, mpfER: 1350, ecER: 30, totalER: 3380, regularSSEE: 1e3, mpfEE: 675, totalEE: 1675, totalContributions: 5055 },
  { minSalary: 33750, maxSalary: 34249.99, regularSSMSC: 2e4, mpfMSC: 14e3, totalMSC: 34e3, regularSSER: 2e3, mpfER: 1400, ecER: 30, totalER: 3430, regularSSEE: 1e3, mpfEE: 700, totalEE: 1700, totalContributions: 5130 },
  { minSalary: 34250, maxSalary: 34749.99, regularSSMSC: 2e4, mpfMSC: 14500, totalMSC: 34500, regularSSER: 2e3, mpfER: 1450, ecER: 30, totalER: 3480, regularSSEE: 1e3, mpfEE: 725, totalEE: 1725, totalContributions: 5205 },
  { minSalary: 34750, maxSalary: null, regularSSMSC: 2e4, mpfMSC: 15e3, totalMSC: 35e3, regularSSER: 2e3, mpfER: 1500, ecER: 30, totalER: 3530, regularSSEE: 1e3, mpfEE: 750, totalEE: 1750, totalContributions: 5280 }
];

// server/routes/seed-rates.ts
var router8 = Router9();
var requireAdmin2 = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  req.user = req.session.user;
  next();
};
router8.post("/api/admin/seed-sss-rates", requireAdmin2, async (req, res) => {
  try {
    console.log("[SSS Seed] Starting SSS 2025 rates seeding...");
    const existingRates = await dbStorage.getAllDeductionRates();
    const sssRates = existingRates.filter((r) => r.type === "sss");
    console.log(`[SSS Seed] Removing ${sssRates.length} existing SSS rates...`);
    for (const rate of sssRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }
    console.log(`[SSS Seed] Inserting ${sss2025Brackets.length} new SSS brackets...`);
    const insertedRates = [];
    for (const bracket of sss2025Brackets) {
      const rate = await dbStorage.createDeductionRate({
        type: "sss",
        minSalary: bracket.minSalary.toString(),
        maxSalary: bracket.maxSalary?.toString() || null,
        employeeRate: null,
        // SSS does NOT use %, it uses fixed amounts
        employeeContribution: bracket.totalEE.toString(),
        // Fixed EE contribution
        description: `MSC \u20B1${bracket.totalMSC.toLocaleString()} | EE \u20B1${bracket.totalEE} | ER \u20B1${bracket.totalER} | Total \u20B1${bracket.totalContributions}`,
        isActive: true
      });
      insertedRates.push(rate);
    }
    console.log(`[SSS Seed] Successfully inserted ${insertedRates.length} SSS rates!`);
    res.json({
      success: true,
      message: `Successfully seeded ${insertedRates.length} SSS contribution brackets (Circular 2024-006)`,
      count: insertedRates.length
    });
  } catch (error) {
    console.error("[SSS Seed] Error seeding SSS rates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed SSS rates",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router8.post("/api/admin/seed-philhealth-rates", requireAdmin2, async (req, res) => {
  try {
    const existingRates = await dbStorage.getAllDeductionRates();
    const philhealthRates = existingRates.filter((r) => r.type === "philhealth");
    for (const rate of philhealthRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }
    await dbStorage.createDeductionRate({
      type: "philhealth",
      minSalary: "10000",
      maxSalary: "100000",
      employeeRate: "2.5",
      // 2.5% employee share
      employeeContribution: null,
      // Calculated based on percentage
      description: "PhilHealth 2025: 5% total (2.5% EE, 2.5% ER). Floor \u20B110k, Ceiling \u20B1100k.",
      isActive: true
    });
    res.json({
      success: true,
      message: "Successfully seeded PhilHealth rate",
      count: 1
    });
  } catch (error) {
    console.error("Error seeding PhilHealth rates:", error);
    res.status(500).json({ success: false, message: "Failed to seed PhilHealth rates" });
  }
});
router8.post("/api/admin/seed-pagibig-rates", requireAdmin2, async (req, res) => {
  try {
    const existingRates = await dbStorage.getAllDeductionRates();
    const pagibigRates = existingRates.filter((r) => r.type === "pagibig");
    for (const rate of pagibigRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }
    await dbStorage.createDeductionRate({
      type: "pagibig",
      minSalary: "0",
      maxSalary: "10000",
      employeeRate: "2",
      employeeContribution: null,
      // Calculated based on percentage up to max
      description: "Pag-IBIG 2025: 2% each (max \u20B1200 per share). Ceiling \u20B110k.",
      isActive: true
    });
    res.json({
      success: true,
      message: "Successfully seeded Pag-IBIG rate",
      count: 1
    });
  } catch (error) {
    console.error("Error seeding Pag-IBIG rates:", error);
    res.status(500).json({ success: false, message: "Failed to seed Pag-IBIG rates" });
  }
});
router8.post("/api/admin/seed-tax-rates", requireAdmin2, async (req, res) => {
  try {
    const existingRates = await dbStorage.getAllDeductionRates();
    const taxRates = existingRates.filter((r) => r.type === "tax");
    for (const rate of taxRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }
    const taxBrackets = [
      { minAnnual: 0, maxAnnual: 25e4, rate: 0, description: "0% (Tax-exempt)" },
      { minAnnual: 250001, maxAnnual: 4e5, rate: 15, description: "15% of excess over \u20B1250k" },
      { minAnnual: 400001, maxAnnual: 8e5, rate: 20, description: "\u20B122,500 + 20% of excess over \u20B1400k" },
      { minAnnual: 800001, maxAnnual: 2e6, rate: 25, description: "\u20B1102,500 + 25% of excess over \u20B1800k" },
      { minAnnual: 2000001, maxAnnual: 8e6, rate: 30, description: "\u20B1402,500 + 30% of excess over \u20B12M" },
      { minAnnual: 8000001, maxAnnual: null, rate: 35, description: "\u20B12,202,500 + 35% of excess over \u20B18M" }
    ];
    for (const bracket of taxBrackets) {
      await dbStorage.createDeductionRate({
        type: "tax",
        minSalary: bracket.minAnnual.toString(),
        maxSalary: bracket.maxAnnual ? bracket.maxAnnual.toString() : null,
        employeeRate: bracket.rate.toString(),
        employeeContribution: null,
        description: `BIR TRAIN: ${bracket.description}`,
        isActive: true
      });
    }
    res.json({
      success: true,
      message: "Successfully seeded BIR tax brackets (TRAIN Law)",
      count: taxBrackets.length
    });
  } catch (error) {
    console.error("Error seeding tax rates:", error);
    res.status(500).json({ success: false, message: "Failed to seed tax rates" });
  }
});
router8.post("/api/admin/seed-all-rates", requireAdmin2, async (req, res) => {
  try {
    const results = {
      sss: 0,
      philhealth: 0,
      pagibig: 0,
      tax: 0
    };
    const existingRates = await dbStorage.getAllDeductionRates();
    for (const rate of existingRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }
    for (const bracket of sss2025Brackets) {
      await dbStorage.createDeductionRate({
        type: "sss",
        minSalary: bracket.minSalary.toString(),
        maxSalary: bracket.maxSalary?.toString() || null,
        employeeRate: null,
        // SSS uses fixed amounts, NOT %
        employeeContribution: bracket.totalEE.toString(),
        description: `MSC \u20B1${bracket.totalMSC.toLocaleString()} | EE \u20B1${bracket.totalEE} | ER \u20B1${bracket.totalER}`,
        isActive: true
      });
      results.sss++;
    }
    await dbStorage.createDeductionRate({
      type: "philhealth",
      minSalary: "10000",
      maxSalary: "100000",
      employeeRate: "2.5",
      employeeContribution: null,
      description: "PhilHealth 2025: 5% total (2.5% each). Floor \u20B110k, Ceiling \u20B1100k.",
      isActive: true
    });
    results.philhealth = 1;
    await dbStorage.createDeductionRate({
      type: "pagibig",
      minSalary: "0",
      maxSalary: "10000",
      employeeRate: "2",
      employeeContribution: null,
      description: "Pag-IBIG 2025: 2% each (max \u20B1200). Ceiling \u20B110k.",
      isActive: true
    });
    results.pagibig = 1;
    const taxBrackets = [
      { minAnnual: 0, maxAnnual: 25e4, rate: 0, desc: "0% Tax-exempt" },
      { minAnnual: 250001, maxAnnual: 4e5, rate: 15, desc: "15%" },
      { minAnnual: 400001, maxAnnual: 8e5, rate: 20, desc: "20%" },
      { minAnnual: 800001, maxAnnual: 2e6, rate: 25, desc: "25%" },
      { minAnnual: 2000001, maxAnnual: 8e6, rate: 30, desc: "30%" },
      { minAnnual: 8000001, maxAnnual: null, rate: 35, desc: "35%" }
    ];
    for (const bracket of taxBrackets) {
      await dbStorage.createDeductionRate({
        type: "tax",
        minSalary: Math.round(bracket.minAnnual / 12).toString(),
        maxSalary: bracket.maxAnnual ? Math.round(bracket.maxAnnual / 12).toString() : null,
        employeeRate: bracket.rate.toString(),
        employeeContribution: null,
        description: `BIR TRAIN: ${bracket.desc}`,
        isActive: true
      });
      results.tax++;
    }
    const total = results.sss + results.philhealth + results.pagibig + results.tax;
    res.json({
      success: true,
      message: `Successfully seeded all ${total} Philippine mandatory deduction rates`,
      results
    });
  } catch (error) {
    console.error("Error seeding all rates:", error);
    res.status(500).json({ success: false, message: "Failed to seed rates" });
  }
});

// server/routes/holidays.ts
init_db_storage();
init_auth();
init_schema();
import { Router as Router10 } from "express";
import { z as z3 } from "zod";
import { randomUUID as randomUUID4 } from "crypto";
var router9 = Router10();
var HOLIDAY_PAY_RULES = {
  regular: { worked: "+100% premium (200% total)", notWorked: "Paid holiday (100%)" },
  special_non_working: { worked: "+30% premium (130% total)", notWorked: "No work, no pay" },
  special_working: { worked: "Normal rate (100%)", notWorked: "Normal rate" },
  company: { worked: "Per company policy", notWorked: "Per company policy" }
};
router9.get("/", requireAuth3, async (req, res) => {
  try {
    const { year, startDate, endDate } = req.query;
    let holidaysList;
    if (year) {
      const yearNum = parseInt(year);
      if (isNaN(yearNum)) {
        return res.status(400).json({ message: "Invalid year" });
      }
      holidaysList = await dbStorage.getHolidaysByYear(yearNum);
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      holidaysList = await dbStorage.getHolidays(start, end);
    } else {
      holidaysList = await dbStorage.getHolidays();
    }
    const holidaysWithPayRules = holidaysList.map((holiday) => ({
      ...holiday,
      payRule: HOLIDAY_PAY_RULES[holiday.type] || HOLIDAY_PAY_RULES.special_working
    }));
    res.json({ holidays: holidaysWithPayRules });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    res.status(500).json({ message: "Failed to fetch holidays" });
  }
});
router9.get("/check-date/:date", requireAuth3, async (req, res) => {
  try {
    const dateParam = req.params.date;
    const checkDate = new Date(dateParam);
    if (isNaN(checkDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    const holiday = await dbStorage.getHolidayByDate(checkDate);
    if (holiday) {
      res.json({
        isHoliday: true,
        holiday: {
          ...holiday,
          payRule: HOLIDAY_PAY_RULES[holiday.type] || HOLIDAY_PAY_RULES.special_working
        },
        workAllowed: holiday.workAllowed ?? true
      });
    } else {
      res.json({
        isHoliday: false,
        holiday: null,
        workAllowed: true
      });
    }
  } catch (error) {
    console.error("Error checking holiday date:", error);
    res.status(500).json({ message: "Failed to check holiday date" });
  }
});
router9.get("/:id", requireAuth3, async (req, res) => {
  try {
    const holiday = await dbStorage.getHoliday(req.params.id);
    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    res.json({
      holiday: {
        ...holiday,
        payRule: HOLIDAY_PAY_RULES[holiday.type] || HOLIDAY_PAY_RULES.special_working
      }
    });
  } catch (error) {
    console.error("Error fetching holiday:", error);
    res.status(500).json({ message: "Failed to fetch holiday" });
  }
});
router9.post("/", requireAuth3, requireRole(["admin"]), async (req, res) => {
  try {
    const validatedData = insertHolidaySchema.parse(req.body);
    const holiday = await dbStorage.createHoliday({
      ...validatedData,
      workAllowed: validatedData.workAllowed ?? true
    });
    await dbStorage.createAuditLog({
      id: randomUUID4(),
      action: "create",
      entityType: "holiday",
      entityId: holiday.id,
      userId: req.session?.user?.id || "system",
      oldValues: null,
      newValues: JSON.stringify(holiday),
      reason: "Holiday created"
    });
    res.status(201).json({ holiday, message: "Holiday created successfully" });
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error creating holiday:", error);
    res.status(500).json({ message: "Failed to create holiday" });
  }
});
router9.put("/:id", requireAuth3, requireRole(["admin"]), async (req, res) => {
  try {
    const existingHoliday = await dbStorage.getHoliday(req.params.id);
    if (!existingHoliday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    const validatedData = insertHolidaySchema.partial().parse(req.body);
    const updatedHoliday = await dbStorage.updateHoliday(req.params.id, validatedData);
    await dbStorage.createAuditLog({
      id: randomUUID4(),
      action: "update",
      entityType: "holiday",
      entityId: req.params.id,
      userId: req.session?.user?.id || "system",
      oldValues: JSON.stringify(existingHoliday),
      newValues: JSON.stringify(updatedHoliday),
      reason: "Holiday updated"
    });
    res.json({ holiday: updatedHoliday, message: "Holiday updated successfully" });
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error updating holiday:", error);
    res.status(500).json({ message: "Failed to update holiday" });
  }
});
router9.delete("/:id", requireAuth3, requireRole(["admin"]), async (req, res) => {
  try {
    const existingHoliday = await dbStorage.getHoliday(req.params.id);
    if (!existingHoliday) {
      return res.status(404).json({ message: "Holiday not found" });
    }
    await dbStorage.deleteHoliday(req.params.id);
    await dbStorage.createAuditLog({
      id: randomUUID4(),
      action: "delete",
      entityType: "holiday",
      entityId: req.params.id,
      userId: req.session?.user?.id || "system",
      oldValues: JSON.stringify(existingHoliday),
      newValues: null,
      reason: "Holiday deleted"
    });
    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    res.status(500).json({ message: "Failed to delete holiday" });
  }
});
router9.post("/seed-2025", requireAuth3, requireRole(["admin"]), async (req, res) => {
  try {
    const existing2025 = await dbStorage.getHolidaysByYear(2025);
    if (existing2025.length > 0) {
      return res.status(400).json({
        message: "2025 holidays already exist. Delete them first to re-seed.",
        count: existing2025.length
      });
    }
    const holidays2025 = [
      // Regular Holidays
      { name: "New Year's Day", date: "2025-01-01", type: "regular", isRecurring: true },
      { name: "Araw ng Kagitingan", date: "2025-04-09", type: "regular", isRecurring: true },
      { name: "Maundy Thursday", date: "2025-04-17", type: "regular", isRecurring: false },
      { name: "Good Friday", date: "2025-04-18", type: "regular", isRecurring: false },
      { name: "Eid'l Fitr (TBD)", date: "2025-03-30", type: "regular", isRecurring: false, notes: "Date subject to NCMF announcement" },
      { name: "Labor Day", date: "2025-05-01", type: "regular", isRecurring: true },
      { name: "Eid'l Adha (TBD)", date: "2025-06-06", type: "regular", isRecurring: false, notes: "Date subject to NCMF announcement" },
      { name: "Independence Day", date: "2025-06-12", type: "regular", isRecurring: true },
      { name: "National Heroes Day", date: "2025-08-25", type: "regular", isRecurring: false },
      { name: "Bonifacio Day", date: "2025-11-30", type: "regular", isRecurring: true },
      { name: "Christmas Day", date: "2025-12-25", type: "regular", isRecurring: true },
      { name: "Rizal Day", date: "2025-12-30", type: "regular", isRecurring: true },
      // Special Non-Working Days
      { name: "Chinese New Year", date: "2025-01-29", type: "special_non_working", isRecurring: false },
      { name: "EDSA Revolution Anniversary", date: "2025-02-25", type: "special_non_working", isRecurring: true },
      { name: "Black Saturday", date: "2025-04-19", type: "special_non_working", isRecurring: false },
      { name: "Ninoy Aquino Day", date: "2025-08-21", type: "special_non_working", isRecurring: true },
      { name: "All Saints' Day", date: "2025-11-01", type: "special_non_working", isRecurring: true },
      { name: "All Souls' Day", date: "2025-11-02", type: "special_non_working", isRecurring: true },
      { name: "Feast of Immaculate Conception", date: "2025-12-08", type: "special_non_working", isRecurring: true },
      { name: "Christmas Eve", date: "2025-12-24", type: "special_non_working", isRecurring: true },
      { name: "New Year's Eve", date: "2025-12-31", type: "special_non_working", isRecurring: true }
    ];
    let createdCount = 0;
    for (const holiday of holidays2025) {
      await dbStorage.createHoliday({
        name: holiday.name,
        date: new Date(holiday.date),
        type: holiday.type,
        year: 2025,
        isRecurring: holiday.isRecurring,
        workAllowed: true,
        notes: holiday.notes || null
      });
      createdCount++;
    }
    res.json({
      message: `Successfully seeded ${createdCount} holidays for 2025 (Proclamation 727)`,
      count: createdCount
    });
  } catch (error) {
    console.error("Error seeding 2025 holidays:", error);
    res.status(500).json({ message: "Failed to seed 2025 holidays" });
  }
});
router9.post("/seed-2026", requireAuth3, requireRole(["admin"]), async (req, res) => {
  try {
    const existing2026 = await dbStorage.getHolidaysByYear(2026);
    if (existing2026.length > 0) {
      return res.status(400).json({
        message: "2026 holidays already exist. Delete them first to re-seed.",
        count: existing2026.length
      });
    }
    const holidays2026 = [
      // Regular Holidays
      { name: "New Year's Day", date: "2026-01-01", type: "regular", isRecurring: true },
      { name: "Araw ng Kagitingan", date: "2026-04-09", type: "regular", isRecurring: true },
      { name: "Maundy Thursday", date: "2026-04-02", type: "regular", isRecurring: false },
      { name: "Good Friday", date: "2026-04-03", type: "regular", isRecurring: false },
      { name: "Eid'l Fitr (TBD)", date: "2026-03-20", type: "regular", isRecurring: false, notes: "Date subject to NCMF announcement" },
      { name: "Labor Day", date: "2026-05-01", type: "regular", isRecurring: true },
      { name: "Eid'l Adha (TBD)", date: "2026-05-27", type: "regular", isRecurring: false, notes: "Date subject to NCMF announcement" },
      { name: "Independence Day", date: "2026-06-12", type: "regular", isRecurring: true },
      { name: "National Heroes Day", date: "2026-08-31", type: "regular", isRecurring: false },
      { name: "Bonifacio Day", date: "2026-11-30", type: "regular", isRecurring: true },
      { name: "Christmas Day", date: "2026-12-25", type: "regular", isRecurring: true },
      { name: "Rizal Day", date: "2026-12-30", type: "regular", isRecurring: true },
      // Special Non-Working Days
      { name: "Chinese New Year", date: "2026-02-17", type: "special_non_working", isRecurring: false },
      { name: "EDSA Revolution Anniversary", date: "2026-02-25", type: "special_non_working", isRecurring: true },
      { name: "Black Saturday", date: "2026-04-04", type: "special_non_working", isRecurring: false },
      { name: "Ninoy Aquino Day", date: "2026-08-21", type: "special_non_working", isRecurring: true },
      { name: "All Saints' Day", date: "2026-11-01", type: "special_non_working", isRecurring: true },
      { name: "All Souls' Day", date: "2026-11-02", type: "special_non_working", isRecurring: true },
      { name: "Feast of Immaculate Conception", date: "2026-12-08", type: "special_non_working", isRecurring: true },
      { name: "Christmas Eve", date: "2026-12-24", type: "special_non_working", isRecurring: true },
      { name: "New Year's Eve", date: "2026-12-31", type: "special_non_working", isRecurring: true }
    ];
    let createdCount = 0;
    for (const holiday of holidays2026) {
      await dbStorage.createHoliday({
        name: holiday.name,
        date: new Date(holiday.date),
        type: holiday.type,
        year: 2026,
        isRecurring: holiday.isRecurring,
        workAllowed: true,
        notes: holiday.notes || null
      });
      createdCount++;
    }
    res.json({
      message: `Successfully seeded ${createdCount} holidays for 2026`,
      count: createdCount
    });
  } catch (error) {
    console.error("Error seeding 2026 holidays:", error);
    res.status(500).json({ message: "Failed to seed 2026 holidays" });
  }
});
var holidays_default = router9;

// server/routes/employee-uploads.ts
init_db();
init_schema();
import { Router as Router11 } from "express";
import { eq as eq4 } from "drizzle-orm";
import crypto2 from "crypto";
var router10 = Router11();
var canManageEmployeeData = async (sessionUser, targetUserId) => {
  if (!sessionUser) return false;
  if (sessionUser.id === targetUserId) return true;
  if (sessionUser.role === "admin") return true;
  if (sessionUser.role === "manager") {
    const targetUser = await db.select().from(users).where(eq4(users.id, targetUserId)).limit(1);
    if (targetUser.length > 0 && targetUser[0].branchId === sessionUser.branchId) {
      return true;
    }
  }
  return false;
};
router10.get("/:id/documents", async (req, res) => {
  const { id } = req.params;
  const sessionUser = req.session.user;
  if (!await canManageEmployeeData(sessionUser, id)) {
    return res.status(403).json({ error: "Not authorized to view these documents" });
  }
  try {
    const docs = await db.select().from(employeeDocuments).where(eq4(employeeDocuments.userId, id));
    res.json(
      docs.map((doc) => ({
        id: doc.id,
        type: doc.type,
        name: doc.name,
        publicId: doc.publicId,
        url: doc.url,
        format: doc.format,
        size: doc.size,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.createdAt
      }))
    );
  } catch (error) {
    console.error("Error fetching employee documents:", error);
    res.status(500).json({ error: "Failed to fetch employee documents" });
  }
});
router10.post("/:id/documents", async (req, res) => {
  const { id } = req.params;
  const sessionUser = req.session.user;
  if (!await canManageEmployeeData(sessionUser, id)) {
    return res.status(403).json({ error: "Not authorized to upload documents for this user" });
  }
  const { type, name, publicId, url, format: format5, size } = req.body || {};
  if (!type || !name || !publicId || !url) {
    return res.status(400).json({ error: "type, name, publicId, and url are required" });
  }
  try {
    const docId = crypto2.randomUUID();
    await db.insert(employeeDocuments).values({
      id: docId,
      userId: id,
      type,
      name,
      publicId,
      url,
      format: format5 || null,
      size: typeof size === "number" ? size : null,
      uploadedBy: sessionUser?.id || null,
      createdAt: /* @__PURE__ */ new Date()
    });
    res.status(201).json({
      id: docId,
      type,
      name,
      publicId,
      url,
      format: format5 || null,
      size: typeof size === "number" ? size : null,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error creating employee document:", error);
    res.status(500).json({ error: "Failed to save employee document" });
  }
});
router10.delete("/:id/documents/:docId", async (req, res) => {
  const { id, docId } = req.params;
  const sessionUser = req.session.user;
  if (!await canManageEmployeeData(sessionUser, id)) {
    return res.status(403).json({ error: "Not authorized to delete documents for this user" });
  }
  try {
    await db.delete(employeeDocuments).where(eq4(employeeDocuments.id, docId));
    res.json({ success: true, id: docId });
  } catch (error) {
    console.error("Error deleting employee document:", error);
    res.status(500).json({ error: "Failed to delete employee document" });
  }
});
router10.get("/upload-signature", (req, res) => {
  try {
    const { public_id, folder } = req.query;
    console.log("\u{1F4DD} [GET /upload-signature] Request received", { public_id, folder });
    if (!public_id || !folder) {
      console.warn("\u274C [GET /upload-signature] Missing params");
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const timestamp2 = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    console.log("   Env Check:", {
      hasSecret: !!apiSecret,
      hasKey: !!apiKey,
      hasCloud: !!cloudName
    });
    if (!apiSecret || !apiKey || !cloudName) {
      console.error("\u274C [GET /upload-signature] Missing Cloudinary config");
      return res.status(500).json({ error: "Cloudinary configuration missing on server" });
    }
    const params = {
      folder,
      public_id,
      timestamp: timestamp2
    };
    const signatureString = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&") + apiSecret;
    const signature = crypto2.createHash("sha1").update(signatureString).digest("hex");
    console.log("\u2705 [GET /upload-signature] Signature generated successfully");
    res.json({
      signature,
      timestamp: timestamp2,
      apiKey,
      cloudName
    });
  } catch (error) {
    console.error("\u274C [GET /upload-signature] Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate upload signature" });
  }
});
router10.patch("/:id/photo", async (req, res) => {
  const { id } = req.params;
  const sessionUser = req.session.user;
  if (sessionUser.id !== id && sessionUser.role !== "manager" && sessionUser.role !== "admin") {
    return res.status(403).json({ error: "Not authorized to update this photo" });
  }
  const { photoUrl, photoPublicId } = req.body;
  if (!photoUrl || !photoPublicId) {
    return res.status(400).json({ error: "photoUrl and photoPublicId are required" });
  }
  try {
    await db.update(users).set({
      photoUrl,
      photoPublicId
    }).where(eq4(users.id, id));
    res.json({ success: true, photoUrl, photoPublicId });
  } catch (error) {
    console.error("Error updating photo:", error);
    res.status(500).json({ error: "Failed to update photo" });
  }
});
router10.delete("/:id/photo", async (req, res) => {
  const { id } = req.params;
  const sessionUser = req.session.user;
  if (sessionUser.id !== id && sessionUser.role !== "manager" && sessionUser.role !== "admin") {
    return res.status(403).json({ error: "Not authorized to delete this photo" });
  }
  try {
    await db.update(users).set({
      photoUrl: null,
      photoPublicId: null
    }).where(eq4(users.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing photo:", error);
    res.status(500).json({ error: "Failed to remove photo" });
  }
});
var employee_uploads_default = router10;

// server/routes/thirteenth-month.ts
init_db();
init_schema();
import { Router as Router12 } from "express";
import { eq as eq5, and as and3, desc as desc3 } from "drizzle-orm";
import { format as format3 } from "date-fns";
var router11 = Router12();
var requireAuth9 = (req, res, next) => {
  if (!req.session?.user) return res.status(401).json({ message: "Not authenticated" });
  req.user = req.session.user;
  next();
};
var requireManagerRole4 = (req, res, next) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};
router11.get("/api/thirteenth-month/summary", requireAuth9, requireManagerRole4, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const year = req.query.year ? parseInt(req.query.year) : (/* @__PURE__ */ new Date()).getFullYear();
    if (isNaN(year) || year < 2020 || year > 2100) {
      return res.status(400).json({ message: "Invalid year" });
    }
    const entries = await db.select().from(thirteenthMonthLedger).where(
      and3(
        eq5(thirteenthMonthLedger.branchId, branchId),
        eq5(thirteenthMonthLedger.year, year)
      )
    ).orderBy(desc3(thirteenthMonthLedger.periodStartDate));
    const byEmployee = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      const existing = byEmployee.get(entry.userId);
      const basicPay = parseFloat(entry.basicPayEarned) || 0;
      const periodEnd = new Date(entry.periodEndDate);
      const periodStart = new Date(entry.periodStartDate);
      if (!existing) {
        byEmployee.set(entry.userId, {
          userId: entry.userId,
          totalBasicPaid: basicPay,
          periods: 1,
          earliestPeriod: periodStart,
          latestPeriod: periodEnd
        });
      } else {
        existing.totalBasicPaid += basicPay;
        existing.periods += 1;
        if (!existing.earliestPeriod || periodStart < existing.earliestPeriod) {
          existing.earliestPeriod = periodStart;
        }
        if (!existing.latestPeriod || periodEnd > existing.latestPeriod) {
          existing.latestPeriod = periodEnd;
        }
      }
    }
    const branchUsers = await db.select().from(users).where(eq5(users.branchId, branchId));
    const userMap = new Map(branchUsers.map((u) => [u.id, u]));
    const summary = Array.from(byEmployee.values()).map((emp) => {
      const user = userMap.get(emp.userId);
      const projectedThirteenthMonth = Math.round(emp.totalBasicPaid / 12 * 100) / 100;
      return {
        userId: emp.userId,
        employeeName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        position: user?.position || "",
        year,
        totalBasicPaid: Math.round(emp.totalBasicPaid * 100) / 100,
        projectedThirteenthMonth,
        periodsCount: emp.periods,
        earliestPeriod: emp.earliestPeriod?.toISOString() || null,
        latestPeriod: emp.latestPeriod?.toISOString() || null
      };
    });
    summary.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    res.json({ summary, year });
  } catch (error) {
    console.error("Error fetching 13th month summary:", error);
    res.status(500).json({ message: error.message || "Failed to fetch 13th month summary" });
  }
});
router11.get("/api/thirteenth-month/export", requireAuth9, requireManagerRole4, async (req, res) => {
  try {
    const branchId = req.user.branchId;
    const year = req.query.year ? parseInt(req.query.year) : (/* @__PURE__ */ new Date()).getFullYear();
    const entries = await db.select().from(thirteenthMonthLedger).where(
      and3(
        eq5(thirteenthMonthLedger.branchId, branchId),
        eq5(thirteenthMonthLedger.year, year)
      )
    );
    const branchUsers = await db.select().from(users).where(eq5(users.branchId, branchId));
    const userMap = new Map(branchUsers.map((u) => [u.id, u]));
    const byEmployee = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      const existing = byEmployee.get(entry.userId) || 0;
      byEmployee.set(entry.userId, existing + (parseFloat(entry.basicPayEarned) || 0));
    }
    const escapeCSV2 = (v) => {
      const str = String(v ?? "");
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const peso2 = (n) => n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const headerMeta = [
      "PERO PAYROLL SYSTEM \u2014 13TH MONTH PAY LEDGER EXPORT",
      `Year: ${year}`,
      `Generated: ${format3(/* @__PURE__ */ new Date(), "MMMM d yyyy HH:mm")}`,
      ""
    ].join("\n");
    const header = ["Employee Name", "Position", "TIN", "Total Basic Pay (PHP)", "Projected 13th Month (PHP)"].map(escapeCSV2).join(",");
    const rows = Array.from(byEmployee.entries()).map(([userId, totalBasicPaid]) => {
      const user = userMap.get(userId);
      const projected = totalBasicPaid / 12;
      return [
        user ? `${user.firstName} ${user.lastName}` : "Unknown",
        user?.position || "",
        user?.tin || "",
        peso2(Math.round(totalBasicPaid * 100) / 100),
        peso2(Math.round(projected * 100) / 100)
      ].map(escapeCSV2).join(",");
    });
    const csv = "\uFEFFsep=,\n" + [headerMeta, header, ...rows].join("\n");
    const filename = `13th_month_${year}_${format3(/* @__PURE__ */ new Date(), "yyyy-MM-dd_HHmmss")}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(csv, "utf8"));
  } catch (error) {
    console.error("Error exporting 13th month:", error);
    res.status(500).json({ message: error.message || "Failed to export 13th month data" });
  }
});

// server/routes.ts
init_leave_credits();

// server/routes/loans.ts
init_db_storage();
init_schema();
import { Router as Router13 } from "express";
import { z as z4 } from "zod";
var router12 = Router13();
router12.post("/", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const parsedData = insertLoanRequestSchema.parse(req.body);
    const totalAmount = parseFloat(parsedData.totalAmount || "0");
    const monthlyAmort = parseFloat(parsedData.monthlyAmortization || "0");
    if (totalAmount <= 0) {
      return res.status(400).json({ message: "Total loan amount must be greater than zero." });
    }
    if (monthlyAmort <= 0) {
      return res.status(400).json({ message: "Monthly amortization must be greater than zero." });
    }
    if (monthlyAmort > totalAmount) {
      return res.status(400).json({ message: "Monthly amortization cannot exceed total loan amount." });
    }
    const data = {
      ...parsedData,
      remainingBalance: parsedData.totalAmount || "0"
    };
    if (data.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const allUserLoans = await dbStorage.getLoanRequestsByUser(user.id);
    const existingActive = allUserLoans.find(
      (loan) => loan.loanType === data.loanType && (loan.status === "pending" || loan.status === "approved")
    );
    if (existingActive) {
      return res.status(400).json({
        message: `You already have an active or pending ${data.loanType} loan in the system. Please wait for it to be fully settled or rejected before applying again.`
      });
    }
    const newLoan = await dbStorage.createLoanRequest(data);
    res.status(201).json(newLoan);
  } catch (error) {
    console.error("Error creating loan request:", error);
    if (error instanceof z4.ZodError) {
      return res.status(400).json({ message: "Invalid loan request data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to submit loan request" });
  }
});
router12.get("/my", async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const loans = await dbStorage.getLoanRequestsByUser(user.id);
    res.json(loans);
  } catch (error) {
    console.error("Error fetching user loans:", error);
    res.status(500).json({ message: "Failed to fetch loans" });
  }
});
router12.get("/user/:userId", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const loans = await dbStorage.getLoanRequestsByUser(req.params.userId);
    res.json(loans);
  } catch (error) {
    console.error("Error fetching employee loans:", error);
    res.status(500).json({ message: "Failed to fetch employee loans" });
  }
});
router12.get("/branch", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const branchId = user.branchId;
    const loans = await dbStorage.getLoanRequestsByBranch(branchId);
    const users2 = await dbStorage.getAllUsers();
    const enrichedLoans = loans.map((loan) => {
      const employee = users2.find((u) => u.id === loan.userId);
      return {
        ...loan,
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown"
      };
    });
    res.json(enrichedLoans);
  } catch (error) {
    console.error("Error fetching branch loans:", error);
    res.status(500).json({ message: "Failed to fetch branch loans" });
  }
});
router12.put("/:id", async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "admin" && user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { id } = req.params;
    const { status, hrApprovalNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'." });
    }
    if (status === "rejected" && (!hrApprovalNote || hrApprovalNote.trim() === "")) {
      return res.status(400).json({ message: "A reason (Note) is required when rejecting a loan." });
    }
    const existingLoan = await dbStorage.getLoanRequest(id);
    if (!existingLoan) {
      return res.status(404).json({ message: "Loan request not found" });
    }
    if (existingLoan.branchId !== user.branchId && user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Loan belongs to another branch" });
    }
    const updated = await dbStorage.updateLoanRequest(id, status, hrApprovalNote, user.id);
    res.json(updated);
  } catch (error) {
    console.error("Error updating loan status:", error);
    res.status(500).json({ message: "Failed to update loan status" });
  }
});
var loans_default = router12;

// server/routes.ts
init_db();
init_schema();
import { eq as eq7 } from "drizzle-orm";

// server/init-db.ts
init_db();
init_schema();
import bcrypt2 from "bcrypt";
import { randomUUID as randomUUID5 } from "crypto";
import { eq as eq6, sql as sql4 } from "drizzle-orm";
async function runMigrations() {
  console.log("\u{1F504} Running startup migrations...");
  try {
    console.log("  \u2705 Migrations check complete (no destructive migrations pending)");
  } catch (error) {
    console.warn("  \u26A0\uFE0F Migration error:", error);
  }
}
async function resetDatabase() {
  console.log("\u{1F5D1}\uFE0F Resetting database (dropping all tables)...");
  try {
    await db.execute(sql4`DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;`);
    console.log("\u2705 Database reset complete");
  } catch (error) {
    console.error("\u274C Error resetting database:", error);
    try {
      await db.execute(sql4`
        DROP TABLE IF EXISTS 
        employee_tax_ytd, de_minimis_ytd, worker_allowances, allowance_types, wage_orders, sss_contribution_table,
        loan_requests, leave_credits, thirteenth_month_ledger, service_charge_pools, company_settings,
        audit_logs, archived_payroll_periods, holidays, deduction_rates, deduction_settings, 
        setup_status, notifications, time_off_requests, approvals, payroll_entries, payroll_periods, 
        shift_trades, shifts, users, branches CASCADE
      `);
      console.log("\u2705 Database tables dropped");
    } catch (fallbackError) {
      console.error("\u274C Fallback reset failed:", fallbackError);
      throw fallbackError;
    }
  }
}
async function initializeDatabase() {
  console.log("\u{1F527} Initializing PostgreSQL database with Neon...");
  try {
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS branches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        intent_holiday_exempt BOOLEAN DEFAULT false,
        establishment_type TEXT DEFAULT 'other',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'employee',
        position TEXT NOT NULL,
        hourly_rate TEXT NOT NULL,
        daily_rate TEXT DEFAULT '0',
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        sss_loan_deduction TEXT DEFAULT '0',
        pagibig_loan_deduction TEXT DEFAULT '0',
        cash_advance_deduction TEXT DEFAULT '0',
        philhealth_deduction TEXT DEFAULT '0',
        other_deductions TEXT DEFAULT '0',
        photo_url TEXT,
        photo_public_id TEXT,
        tin TEXT,
        sss_number TEXT,
        philhealth_number TEXT,
        pagibig_number TEXT,
        is_mwe BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    try {
      await db.execute(sql4`ALTER TABLE users ADD COLUMN IF NOT EXISTS tin TEXT`);
      await db.execute(sql4`ALTER TABLE users ADD COLUMN IF NOT EXISTS sss_number TEXT`);
      await db.execute(sql4`ALTER TABLE users ADD COLUMN IF NOT EXISTS philhealth_number TEXT`);
      await db.execute(sql4`ALTER TABLE users ADD COLUMN IF NOT EXISTS pagibig_number TEXT`);
      console.log("\u2705 User table migrations (government IDs) checked/applied");
    } catch (err) {
      console.log("\u26A0\uFE0F Could not apply some users table migrations:", err);
    }
    try {
      await db.execute(sql4`ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS include_holiday_pay BOOLEAN DEFAULT false`);
    } catch (_) {
    }
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        position TEXT NOT NULL,
        is_recurring BOOLEAN DEFAULT false,
        recurring_pattern TEXT,
        status TEXT DEFAULT 'scheduled',
        actual_start_time TIMESTAMP,
        actual_end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS shift_trades (
        id TEXT PRIMARY KEY,
        shift_id TEXT REFERENCES shifts(id) NOT NULL,
        from_user_id TEXT REFERENCES users(id) NOT NULL,
        to_user_id TEXT REFERENCES users(id),
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        urgency TEXT DEFAULT 'normal',
        notes TEXT,
        requested_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP,
        approved_by TEXT REFERENCES users(id)
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS payroll_periods (
        id TEXT PRIMARY KEY,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        pay_date TIMESTAMP,
        status TEXT DEFAULT 'open',
        total_hours TEXT,
        total_pay TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS payroll_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        payroll_period_id TEXT REFERENCES payroll_periods(id) NOT NULL,
        total_hours TEXT NOT NULL,
        regular_hours TEXT NOT NULL,
        overtime_hours TEXT DEFAULT '0',
        night_diff_hours TEXT DEFAULT '0',
        basic_pay TEXT NOT NULL,
        holiday_pay TEXT DEFAULT '0',
        overtime_pay TEXT DEFAULT '0',
        night_diff_pay TEXT DEFAULT '0',
        rest_day_pay TEXT DEFAULT '0',
        gross_pay TEXT NOT NULL,
        sss_contribution TEXT DEFAULT '0',
        sss_loan TEXT DEFAULT '0',
        philhealth_contribution TEXT DEFAULT '0',
        pagibig_contribution TEXT DEFAULT '0',
        pagibig_loan TEXT DEFAULT '0',
        withholding_tax TEXT DEFAULT '0',
        advances TEXT DEFAULT '0',
        other_deductions TEXT DEFAULT '0',
        total_deductions TEXT DEFAULT '0',
        deductions TEXT DEFAULT '0',
        net_pay TEXT NOT NULL,
        pay_breakdown TEXT,
        status TEXT DEFAULT 'pending',
        service_charge TEXT DEFAULT '0',
        created_at TIMESTAMP DEFAULT NOW(),
        paid_at TIMESTAMP
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        request_id TEXT NOT NULL,
        requested_by TEXT REFERENCES users(id) NOT NULL,
        approved_by TEXT REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        reason TEXT,
        request_data TEXT,
        requested_at TIMESTAMP DEFAULT NOW(),
        responded_at TIMESTAMP
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS time_off_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        type TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        is_paid BOOLEAN DEFAULT false,
        requested_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP,
        approved_by TEXT REFERENCES users(id),
        rejection_reason TEXT
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS setup_status (
        id TEXT PRIMARY KEY,
        is_setup_complete BOOLEAN DEFAULT false,
        setup_completed_at TIMESTAMP
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS deduction_settings (
        id TEXT PRIMARY KEY,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        deduct_sss BOOLEAN DEFAULT true,
        deduct_philhealth BOOLEAN DEFAULT false,
        deduct_pagibig BOOLEAN DEFAULT false,
        deduct_withholding_tax BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS deduction_rates (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        min_salary TEXT NOT NULL,
        max_salary TEXT,
        employee_rate TEXT,
        employee_contribution TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS holidays (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        type TEXT NOT NULL,
        year INTEGER NOT NULL,
        is_recurring BOOLEAN DEFAULT false,
        work_allowed BOOLEAN DEFAULT true,
        notes TEXT,
        premium_override TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      ALTER TABLE holidays ADD COLUMN IF NOT EXISTS work_allowed BOOLEAN DEFAULT true
    `).catch(() => {
    });
    await db.execute(sql4`
      ALTER TABLE holidays ADD COLUMN IF NOT EXISTS notes TEXT
    `).catch(() => {
    });
    await db.execute(sql4`
      ALTER TABLE holidays ADD COLUMN IF NOT EXISTS premium_override TEXT
    `).catch(() => {
    });
    await db.execute(sql4`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS philhealth_deduction TEXT DEFAULT '0'
    `).catch(() => {
    });
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS archived_payroll_periods (
        id TEXT PRIMARY KEY,
        original_period_id TEXT NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status TEXT NOT NULL,
        total_hours TEXT,
        total_pay TEXT,
        archived_at TIMESTAMP DEFAULT NOW(),
        archived_by TEXT REFERENCES users(id),
        entries_snapshot TEXT
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        user_id TEXT REFERENCES users(id) NOT NULL,
        old_values TEXT,
        new_values TEXT,
        reason TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS time_off_policy (
        id TEXT PRIMARY KEY,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        leave_type TEXT NOT NULL,
        minimum_advance_days INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS employee_documents (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        public_id TEXT NOT NULL,
        url TEXT NOT NULL,
        format TEXT,
        size INTEGER,
        uploaded_by TEXT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS adjustment_logs (
        id TEXT PRIMARY KEY,
        employee_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        logged_by TEXT REFERENCES users(id) NOT NULL,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        remarks TEXT,
        status TEXT DEFAULT 'pending',
        rejection_reason TEXT,
        verified_by_employee BOOLEAN DEFAULT false,
        verified_at TIMESTAMP,
        approved_by TEXT REFERENCES users(id),
        approved_at TIMESTAMP,
        payroll_period_id TEXT REFERENCES payroll_periods(id),
        calculated_amount TEXT,
        is_included BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      ALTER TABLE adjustment_logs ADD COLUMN IF NOT EXISTS is_included BOOLEAN DEFAULT true
    `).catch(() => {
    });
    await db.execute(sql4`
      ALTER TABLE adjustment_logs ADD COLUMN IF NOT EXISTS dispute_reason TEXT
    `).catch(() => {
    });
    await db.execute(sql4`
      ALTER TABLE adjustment_logs ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMP
    `).catch(() => {
    });
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS adjustment_log_comments (
        id TEXT PRIMARY KEY,
        adjustment_log_id TEXT REFERENCES adjustment_logs(id) NOT NULL,
        user_id TEXT REFERENCES users(id) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS sss_contribution_table (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        min_compensation NUMERIC(12, 4) NOT NULL,
        max_compensation NUMERIC(12, 4) NOT NULL,
        monthly_salary_credit NUMERIC(12, 4) NOT NULL,
        employee_share NUMERIC(12, 4) NOT NULL,
        employer_share NUMERIC(12, 4) NOT NULL,
        ec_contribution NUMERIC(12, 4) NOT NULL
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS wage_orders (
        id SERIAL PRIMARY KEY,
        region TEXT NOT NULL,
        effective_date TIMESTAMP NOT NULL,
        daily_rate NUMERIC(12, 4) NOT NULL,
        is_active BOOLEAN DEFAULT true
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS allowance_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        is_de_minimis BOOLEAN DEFAULT true,
        ceiling_type TEXT,
        ceiling_value NUMERIC(12, 4)
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS worker_allowances (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        allowance_type_id TEXT REFERENCES allowance_types(id) NOT NULL,
        amount NUMERIC(12, 4) NOT NULL,
        is_active BOOLEAN DEFAULT true
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS de_minimis_ytd (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        year INTEGER NOT NULL,
        allowance_type_id TEXT REFERENCES allowance_types(id) NOT NULL,
        amount_given_ytd NUMERIC(12, 4) DEFAULT '0'
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS employee_tax_ytd (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        year INTEGER NOT NULL,
        other_benefits_ytd NUMERIC(12, 4) DEFAULT '0',
        thirteenth_month_ytd NUMERIC(12, 4) DEFAULT '0',
        gross_compensation_ytd NUMERIC(12, 4) DEFAULT '0',
        taxable_compensation_ytd NUMERIC(12, 4) DEFAULT '0',
        tax_withheld_ytd NUMERIC(12, 4) DEFAULT '0'
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS thirteenth_month_ledger (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        payroll_period_id TEXT REFERENCES payroll_periods(id) NOT NULL,
        year INTEGER NOT NULL,
        basic_pay_earned TEXT NOT NULL,
        period_start_date TIMESTAMP NOT NULL,
        period_end_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS leave_credits (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        year INTEGER NOT NULL,
        leave_type TEXT NOT NULL,
        total_credits TEXT NOT NULL,
        used_credits TEXT DEFAULT '0',
        remaining_credits TEXT NOT NULL,
        granted_by TEXT REFERENCES users(id),
        notes TEXT,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS loan_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        loan_type TEXT NOT NULL,
        reference_number TEXT NOT NULL,
        account_number TEXT NOT NULL,
        total_amount TEXT NOT NULL DEFAULT '0',
        remaining_balance TEXT NOT NULL DEFAULT '0',
        monthly_amortization TEXT NOT NULL,
        deduction_start_date TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'pending',
        proof_file_url TEXT,
        hr_approval_note TEXT,
        approved_by TEXT REFERENCES users(id),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS service_charge_pools (
        id TEXT PRIMARY KEY,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        payroll_period_id TEXT REFERENCES payroll_periods(id) NOT NULL,
        total_collected TEXT NOT NULL,
        distributed_at TIMESTAMP,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS company_settings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        trade_name TEXT,
        address TEXT NOT NULL,
        city TEXT,
        province TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'Philippines',
        tin TEXT NOT NULL,
        sss_employer_no TEXT,
        philhealth_no TEXT,
        pagibig_no TEXT,
        bir_rdo TEXT,
        sec_registration TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        logo_url TEXT,
        logo_public_id TEXT,
        industry TEXT DEFAULT 'Food & Beverage',
        payroll_frequency TEXT DEFAULT 'semi-monthly',
        payment_method TEXT DEFAULT 'Bank Transfer',
        bank_name TEXT,
        bank_account_name TEXT,
        bank_account_no TEXT,
        include_holiday_pay BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        updated_by TEXT REFERENCES users(id),
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql4`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL COLLATE "default",
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    await db.execute(sql4`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
    `);
    console.log("\u2705 All database tables created successfully");
  } catch (error) {
    console.error("\u274C Database initialization error:", error);
    throw error;
  }
}
async function createAdminAccount() {
  console.log("\u{1F464} Checking for admin account...");
  try {
    const existingAdmin = await db.select().from(users).where(eq6(users.username, "admin")).limit(1);
    if (existingAdmin.length > 0) {
      console.log("\u2705 Admin account already exists");
      return;
    }
    const existingBranches = await db.select().from(branches);
    let mainBranchId;
    if (existingBranches.length === 0) {
      const branchSeeds = [
        { id: "branch-malate", name: "PERO \u2013 Malate", address: "Taft Avenue, Malate, Manila", phone: "(02) 8521-1234" },
        { id: "branch-tondo", name: "PERO \u2013 Tondo", address: "Dok. Alejandro Roces Avenue, Tondo, Manila", phone: "(02) 8251-5678" },
        { id: "branch-quezon", name: "PERO \u2013 Quezon City", address: "Timog Avenue, Quezon City", phone: "(02) 7902-8900" }
      ];
      for (const b of branchSeeds) {
        await db.insert(branches).values({ ...b, isActive: true });
      }
      mainBranchId = "branch-malate";
      console.log("\u2705 Created 3 PERO branches (Malate, Tondo, Quezon City)");
    } else {
      mainBranchId = existingBranches[0].id;
    }
    const hashedPassword = await bcrypt2.hash("admin123", 10);
    const adminId = randomUUID5();
    await db.insert(users).values({
      id: adminId,
      username: "admin",
      password: hashedPassword,
      firstName: "System",
      lastName: "Administrator",
      email: "admin@pero.com.ph",
      role: "admin",
      position: "Administrator",
      hourlyRate: "0",
      branchId: mainBranchId,
      isActive: true
    });
    console.log("\u2705 Admin account created (username: admin, password: admin123)");
  } catch (error) {
    console.error("\u274C Error creating admin account:", error);
    throw error;
  }
}
async function seedDeductionRates() {
  console.log("\u{1F4B0} Checking deduction rates...");
  try {
    const existing = await db.select().from(deductionRates).limit(1);
    if (existing.length > 0) {
      console.log("\u2705 Deduction rates already exist");
      return;
    }
    const { sss2026Brackets: sss2026Brackets2 } = await Promise.resolve().then(() => (init_sss_2026_rates(), sss_2026_rates_exports));
    const sssRates = sss2026Brackets2.map((b) => ({
      minSalary: String(b.minSalary),
      maxSalary: b.maxSalary !== null ? String(b.maxSalary) : null,
      employeeContribution: String(b.totalEE.toFixed(2))
    }));
    for (const rate of sssRates) {
      await db.insert(deductionRates).values({
        id: randomUUID5(),
        type: "sss",
        minSalary: rate.minSalary,
        maxSalary: rate.maxSalary,
        employeeContribution: rate.employeeContribution,
        isActive: true
      });
    }
    const existingSSSBrackets = await db.select().from(sssContributionTable).where(eq6(sssContributionTable.year, 2026)).limit(1);
    if (existingSSSBrackets.length === 0) {
      console.log("\u{1F4C8} Seeding SSS Contribution Table (2026)...");
      for (const b of sss2026Brackets2) {
        await db.insert(sssContributionTable).values({
          year: 2026,
          minCompensation: String(b.minSalary),
          maxCompensation: b.maxSalary !== null ? String(b.maxSalary) : "999999.99",
          monthlySalaryCredit: String(b.totalMSC),
          employeeShare: String(b.totalEE),
          employerShare: String(b.totalER),
          ecContribution: String(b.ecER)
        });
      }
      console.log(`\u2705 Seeded ${sss2026Brackets2.length} SSS brackets for 2026`);
    }
    await db.insert(deductionRates).values({
      id: randomUUID5(),
      type: "philhealth",
      minSalary: "10000",
      // 2025 floor
      maxSalary: "100000",
      // 2025 ceiling
      employeeRate: "2.5",
      description: "PhilHealth 2025: 5% total (2.5% EE + 2.5% ER). Floor \u20B110k, Ceiling \u20B1100k. Premium \u20B1500-\u20B15,000.",
      isActive: true
    });
    await db.insert(deductionRates).values({
      id: randomUUID5(),
      type: "pagibig",
      minSalary: "0",
      maxSalary: null,
      employeeRate: "2",
      employeeContribution: "200",
      // Max cap ₱200 (effective 2026)
      description: "2% of salary, max \u20B1200 (2026 rate)",
      isActive: true
    });
    const birTaxBrackets = [
      {
        minSalary: "0",
        maxSalary: "250000",
        employeeRate: "0",
        description: "Tax exempt (annual \u2264\u20B1250,000)"
      },
      {
        minSalary: "250001",
        maxSalary: "400000",
        employeeRate: "15",
        description: "15% of excess over \u20B1250k (annual \u20B1250k-\u20B1400k)"
      },
      {
        minSalary: "400001",
        maxSalary: "800000",
        employeeRate: "20",
        description: "\u20B122,500 + 20% of excess over \u20B1400k (annual \u20B1400k-\u20B1800k)"
      },
      {
        minSalary: "800001",
        maxSalary: "2000000",
        employeeRate: "25",
        description: "\u20B1102,500 + 25% of excess over \u20B1800k (annual \u20B1800k-\u20B12M)"
      },
      {
        minSalary: "2000001",
        maxSalary: "8000000",
        employeeRate: "30",
        description: "\u20B1402,500 + 30% of excess over \u20B12M (annual \u20B12M-\u20B18M)"
      },
      {
        minSalary: "8000001",
        maxSalary: null,
        employeeRate: "35",
        description: "\u20B12,202,500 + 35% of excess over \u20B18M (annual >\u20B18M)"
      }
    ];
    for (const bracket of birTaxBrackets) {
      await db.insert(deductionRates).values({
        id: randomUUID5(),
        type: "tax",
        minSalary: bracket.minSalary,
        maxSalary: bracket.maxSalary,
        employeeRate: bracket.employeeRate,
        description: bracket.description,
        isActive: true
      });
    }
    console.log("\u2705 Deduction rates seeded (SSS 61 brackets 2026, PhilHealth 2.5%, Pag-IBIG 2% max \u20B1200, BIR TRAIN law)");
  } catch (error) {
    console.error("\u274C Error seeding deduction rates:", error);
    throw error;
  }
}
async function seedPhilippineHolidays() {
  console.log("\u{1F389} Checking holidays...");
  try {
    const existing = await db.select().from(holidays).limit(1);
    if (existing.length > 0) {
      console.log("\u2705 Holidays already exist");
      return;
    }
    const holidays2025 = [
      // Regular Holidays (200% pay if worked)
      { name: "New Year's Day", date: "2025-01-01", type: "regular", isRecurring: true },
      { name: "Araw ng Kagitingan", date: "2025-04-09", type: "regular", isRecurring: true },
      { name: "Maundy Thursday", date: "2025-04-17", type: "regular", isRecurring: false },
      { name: "Good Friday", date: "2025-04-18", type: "regular", isRecurring: false },
      { name: "Eid'l Fitr (TBD)", date: "2025-03-30", type: "regular", isRecurring: false, notes: "Date subject to NCMF announcement" },
      { name: "Labor Day", date: "2025-05-01", type: "regular", isRecurring: true },
      { name: "Eid'l Adha (TBD)", date: "2025-06-06", type: "regular", isRecurring: false, notes: "Date subject to NCMF announcement" },
      { name: "Independence Day", date: "2025-06-12", type: "regular", isRecurring: true },
      { name: "National Heroes Day", date: "2025-08-25", type: "regular", isRecurring: false },
      { name: "Bonifacio Day", date: "2025-11-30", type: "regular", isRecurring: true },
      { name: "Christmas Day", date: "2025-12-25", type: "regular", isRecurring: true },
      { name: "Rizal Day", date: "2025-12-30", type: "regular", isRecurring: true },
      // Special Non-Working Days (130% pay if worked)
      { name: "Chinese New Year", date: "2025-01-29", type: "special_non_working", isRecurring: false },
      { name: "EDSA Revolution Anniversary", date: "2025-02-25", type: "special_non_working", isRecurring: true },
      { name: "Black Saturday", date: "2025-04-19", type: "special_non_working", isRecurring: false },
      { name: "Ninoy Aquino Day", date: "2025-08-21", type: "special_non_working", isRecurring: true },
      { name: "All Saints' Day", date: "2025-11-01", type: "special_non_working", isRecurring: true },
      { name: "All Souls' Day", date: "2025-11-02", type: "special_non_working", isRecurring: true },
      { name: "Feast of Immaculate Conception", date: "2025-12-08", type: "special_non_working", isRecurring: true },
      { name: "Christmas Eve", date: "2025-12-24", type: "special_non_working", isRecurring: true },
      { name: "New Year's Eve", date: "2025-12-31", type: "special_non_working", isRecurring: true }
    ];
    const holidays2026 = [
      // ===== Regular Holidays (200% pay if worked, 100% if not worked) =====
      { name: "New Year's Day", date: "2026-01-01", type: "regular", isRecurring: true },
      { name: "Eid'l Fitr", date: "2026-03-20", type: "regular", isRecurring: false, notes: "Tentative date \u2014 subject to NCMF announcement" },
      { name: "Maundy Thursday", date: "2026-04-02", type: "regular", isRecurring: false },
      { name: "Good Friday", date: "2026-04-03", type: "regular", isRecurring: false },
      { name: "Araw ng Kagitingan (Day of Valor)", date: "2026-04-09", type: "regular", isRecurring: true },
      { name: "Labor Day", date: "2026-05-01", type: "regular", isRecurring: true },
      { name: "Eid'l Adha", date: "2026-05-27", type: "regular", isRecurring: false, notes: "Tentative date \u2014 subject to NCMF announcement" },
      { name: "Independence Day", date: "2026-06-12", type: "regular", isRecurring: true },
      { name: "National Heroes Day", date: "2026-08-31", type: "regular", isRecurring: false, notes: "Last Monday of August" },
      { name: "Bonifacio Day", date: "2026-11-30", type: "regular", isRecurring: true },
      { name: "Christmas Day", date: "2026-12-25", type: "regular", isRecurring: true },
      { name: "Rizal Day", date: "2026-12-30", type: "regular", isRecurring: true },
      // ===== Special Non-Working Days (130% pay if worked, no pay if not worked) =====
      { name: "Lunar New Year (Chinese New Year)", date: "2026-02-17", type: "special_non_working", isRecurring: false },
      { name: "EDSA People Power Revolution Anniversary", date: "2026-02-25", type: "special_non_working", isRecurring: true },
      { name: "Black Saturday", date: "2026-04-04", type: "special_non_working", isRecurring: false },
      { name: "Ninoy Aquino Day", date: "2026-08-21", type: "special_non_working", isRecurring: true },
      { name: "All Saints' Day", date: "2026-11-01", type: "special_non_working", isRecurring: true },
      { name: "All Souls' Day", date: "2026-11-02", type: "special_non_working", isRecurring: true },
      { name: "Feast of the Immaculate Conception", date: "2026-12-08", type: "special_non_working", isRecurring: true },
      { name: "Christmas Eve", date: "2026-12-24", type: "special_non_working", isRecurring: true },
      { name: "New Year's Eve", date: "2026-12-31", type: "special_non_working", isRecurring: true },
      // ===== Special Working Days (normal 100% pay, commemorative only) =====
      { name: "First Philippine Republic Day", date: "2026-01-23", type: "special_working", isRecurring: true },
      { name: "Founding Anniversary of Iglesia ni Cristo", date: "2026-07-27", type: "special_working", isRecurring: true },
      { name: "Yamashita Surrender Day", date: "2026-09-03", type: "special_working", isRecurring: true },
      { name: "Feast of the Nativity of Mary", date: "2026-09-08", type: "special_working", isRecurring: true },
      { name: "Sheikh Karim'ul Makhdum Day", date: "2026-11-07", type: "special_working", isRecurring: true }
    ];
    const allHolidays = [...holidays2025, ...holidays2026];
    for (const holiday of allHolidays) {
      const year = new Date(holiday.date).getFullYear();
      await db.insert(holidays).values({
        id: randomUUID5(),
        name: holiday.name,
        date: new Date(holiday.date),
        type: holiday.type,
        year,
        isRecurring: holiday.isRecurring,
        workAllowed: true,
        notes: holiday.notes || null
      });
    }
    console.log("\u2705 Philippine holidays seeded (2025 Proclamation 727 + 2026 complete official list)");
  } catch (error) {
    console.error("\u274C Error seeding holidays:", error);
    throw error;
  }
}
async function seedSampleUsers() {
  console.log("\u{1F465} Checking sample users...");
  try {
    const existingEmployees = await db.select().from(users).where(eq6(users.role, "employee")).limit(1);
    if (existingEmployees.length > 0) {
      console.log("\u2705 Sample employees already exist");
      return;
    }
    const allBranches = await db.select().from(branches);
    const getBranchId = (keyword) => {
      const found = allBranches.find((b) => b.name.toLowerCase().includes(keyword.toLowerCase()));
      return found?.id || allBranches[0]?.id || "branch-malate";
    };
    const malateId = getBranchId("malate");
    const tondoId = getBranchId("tondo");
    const quezonId = getBranchId("quezon");
    if (allBranches.length === 0) {
      console.log("\u26A0\uFE0F  No branches found, skipping sample users");
      return;
    }
    const hashedPassword = await bcrypt2.hash("password123", 10);
    const sampleUsers = [
      // === PERO – Malate ===
      {
        id: "user-mgr-sarah",
        username: "marialourdes",
        firstName: "Maria Lourdes",
        lastName: "Bautista",
        email: "maria.bautista@pero.com.ph",
        role: "manager",
        position: "Branch Manager",
        hourlyRate: "120.00",
        branchId: malateId,
        sssLoan: "0",
        pagibigLoan: "0"
      },
      {
        id: "user-emp-sam",
        username: "juan",
        firstName: "Juan Miguel",
        lastName: "Santos",
        email: "juan.santos@pero.com.ph",
        role: "employee",
        position: "Senior Barista",
        hourlyRate: "85.00",
        branchId: malateId,
        sssLoan: "0",
        pagibigLoan: "0"
      },
      {
        id: "user-emp-ana",
        username: "ana",
        firstName: "Ana Marie",
        lastName: "Garcia",
        email: "ana.garcia@pero.com.ph",
        role: "employee",
        position: "Cashier",
        hourlyRate: "82.00",
        branchId: malateId,
        sssLoan: "0",
        pagibigLoan: "0"
      },
      // === PERO – Tondo ===
      {
        id: "user-mgr-tondo",
        username: "renato",
        firstName: "Renato",
        lastName: "Reyes",
        email: "renato.reyes@pero.com.ph",
        role: "manager",
        position: "Branch Manager",
        hourlyRate: "120.00",
        branchId: tondoId,
        sssLoan: "0",
        pagibigLoan: "0"
      },
      {
        id: "user-emp-pedro",
        username: "pedro",
        firstName: "Pedro Miguel",
        lastName: "Dela Cruz",
        email: "pedro.delacruz@pero.com.ph",
        role: "employee",
        position: "Kitchen Staff",
        hourlyRate: "82.50",
        branchId: tondoId,
        sssLoan: "800",
        pagibigLoan: "0"
      },
      {
        id: "user-emp-sofia",
        username: "sofia",
        firstName: "Sofia Isabelle",
        lastName: "Mendoza",
        email: "sofia.mendoza@pero.com.ph",
        role: "employee",
        position: "Shift Lead",
        hourlyRate: "97.50",
        branchId: tondoId,
        sssLoan: "0",
        pagibigLoan: "500"
      },
      // === PERO – Quezon City ===
      {
        id: "user-mgr-quezon",
        username: "maricel",
        firstName: "Maricel",
        lastName: "Cruz",
        email: "maricel.cruz@pero.com.ph",
        role: "manager",
        position: "Branch Manager",
        hourlyRate: "120.00",
        branchId: quezonId,
        sssLoan: "0",
        pagibigLoan: "0"
      },
      {
        id: "user-emp-miguel",
        username: "luis",
        firstName: "Luis Miguel",
        lastName: "Torres",
        email: "luis.torres@pero.com.ph",
        role: "employee",
        position: "Barista",
        hourlyRate: "80.00",
        branchId: quezonId,
        sssLoan: "0",
        pagibigLoan: "0"
      },
      {
        id: "user-emp-bea",
        username: "beatriz",
        firstName: "Beatriz",
        lastName: "Alonzo",
        email: "beatriz.alonzo@pero.com.ph",
        role: "employee",
        position: "Server",
        hourlyRate: "80.00",
        branchId: quezonId,
        sssLoan: "0",
        pagibigLoan: "0"
      }
    ];
    for (const user of sampleUsers) {
      const existing = await db.select().from(users).where(eq6(users.username, user.username));
      if (existing.length > 0) {
        console.log(`   Skipping ${user.username} (already exists)`);
        continue;
      }
      await db.insert(users).values({
        id: user.id || randomUUID5(),
        username: user.username,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        position: user.position,
        hourlyRate: user.hourlyRate,
        branchId: user.branchId,
        isActive: true,
        sssLoanDeduction: user.sssLoan || "0",
        pagibigLoanDeduction: user.pagibigLoan || "0"
      });
    }
    console.log("\u2705 Sample users created \u2014 3 branches \xD7 Filipino names (password: password123)");
  } catch (error) {
    console.error("\u274C Error seeding sample users:", error);
    throw error;
  }
}
async function seedSampleSchedulesAndPayroll() {
  console.log("\u{1F4C5} Seeding sample schedules and payroll...");
  try {
    let getWorkingDays2 = function(year, month, startDay, endDay, holidayDates = []) {
      const days = [];
      for (let d = startDay; d <= endDay; d++) {
        const dt = new Date(Date.UTC(year, month, d));
        if (dt.getUTCDay() === 0) continue;
        const dateStr = dt.toISOString().slice(0, 10);
        if (holidayDates.includes(dateStr)) continue;
        days.push(dt);
      }
      return days;
    };
    var getWorkingDays = getWorkingDays2;
    const existingShifts = await db.select().from(shifts).limit(1);
    if (existingShifts.length > 0) {
      console.log("\u2705 Sample schedules already exist");
      return;
    }
    const existingPayroll = await db.select().from(payrollPeriods).limit(1);
    if (existingPayroll.length > 0) {
      console.log("  \u{1F9F9} Clearing orphaned payroll data (shifts were cleared by migration)...");
      try {
        await db.execute(sql4`DELETE FROM adjustment_logs`);
        await db.execute(sql4`DELETE FROM archived_payroll_periods`);
        await db.execute(sql4`DELETE FROM payroll_entries`);
        await db.execute(sql4`DELETE FROM thirteenth_month_ledger`);
        await db.execute(sql4`DELETE FROM payroll_periods`);
      } catch (e) {
        console.warn("  \u26A0\uFE0F Could not clear payroll data:", e);
      }
    }
    const allBranches = await db.select().from(branches);
    const allUsers = await db.select().from(users);
    const employees = allUsers.filter((u) => u.role === "employee");
    const manager = allUsers.find((u) => u.role === "manager");
    if (allBranches.length === 0 || employees.length === 0) {
      console.log("\u26A0\uFE0F No branch or employees found, skipping schedules");
      return;
    }
    const branchId = allBranches[0].id;
    const shiftPatterns = [
      { name: "Morning", start: 0, end: 8 },
      // 8AM-4PM PHT (UTC: 0-8)
      { name: "Day", start: 3, end: 11 },
      // 11AM-7PM PHT (UTC: 3-11)
      { name: "Afternoon", start: 7, end: 15 }
      // 3PM-11PM PHT (UTC: 7-15)
    ];
    const jan2026Holidays = ["2026-01-01"];
    const feb2026Holidays = ["2026-02-17", "2026-02-25"];
    const mar2026Holidays = ["2026-03-20", "2026-03-28"];
    const jan1_15 = getWorkingDays2(2026, 0, 1, 15, jan2026Holidays);
    const jan16_31 = getWorkingDays2(2026, 0, 16, 31, jan2026Holidays);
    const feb1_15 = getWorkingDays2(2026, 1, 1, 15, feb2026Holidays);
    const feb16_28 = getWorkingDays2(2026, 1, 16, 28, feb2026Holidays);
    const mar1_15 = getWorkingDays2(2026, 2, 1, 15, mar2026Holidays);
    const mar16_31 = getWorkingDays2(2026, 2, 16, 31, mar2026Holidays);
    const allPeriodDays = [
      { periodId: "period-2026-01-01", days: jan1_15 },
      { periodId: "period-2026-01-16", days: jan16_31 },
      { periodId: "period-2026-02-01", days: feb1_15 },
      { periodId: "period-2026-02-16", days: feb16_28 },
      { periodId: "period-2026-03-01", days: mar1_15 },
      { periodId: "period-2026-03-16", days: mar16_31 }
    ];
    const managers = allUsers.filter((u) => u.role === "manager");
    const allStaff = [...employees, ...managers].filter(Boolean);
    for (const { periodId, days } of allPeriodDays) {
      for (const shiftDate of days) {
        for (let i = 0; i < allStaff.length; i++) {
          const emp = allStaff[i];
          const pattern = shiftPatterns[i % shiftPatterns.length];
          const startTime = new Date(shiftDate);
          startTime.setUTCHours(pattern.start, 0, 0, 0);
          const endTime = new Date(shiftDate);
          endTime.setUTCHours(pattern.end, 0, 0, 0);
          await db.insert(shifts).values({
            id: randomUUID5(),
            userId: emp.id,
            branchId: emp.branchId,
            startTime,
            endTime,
            position: emp.position,
            status: "completed"
          });
        }
      }
    }
    console.log("   \u2705 Created shifts for Jan\u2013Mar 2026 (all branches, PHT-aware UTC timestamps)");
    const holidayShiftAssignments = [
      // Sam & Sofia work on New Year's Day (regular holiday — 200% rate)
      { userId: "user-emp-sam", date: new Date(Date.UTC(2026, 0, 1)), staffIdx: 0 },
      { userId: "user-emp-sofia", date: new Date(Date.UTC(2026, 0, 1)), staffIdx: 3 },
      // Miguel works on Lunar New Year (special non-working — 130% rate)
      { userId: "user-emp-miguel", date: new Date(Date.UTC(2026, 1, 17)), staffIdx: 4 }
    ];
    for (const hs of holidayShiftAssignments) {
      const pattern = shiftPatterns[hs.staffIdx % shiftPatterns.length];
      const startTime = new Date(hs.date);
      startTime.setUTCHours(pattern.start, 0, 0, 0);
      const endTime = new Date(hs.date);
      endTime.setUTCHours(pattern.end, 0, 0, 0);
      await db.insert(shifts).values({
        id: randomUUID5(),
        userId: hs.userId,
        branchId,
        startTime,
        endTime,
        position: allStaff.find((s) => s.id === hs.userId)?.position || "Staff",
        status: "completed"
      });
    }
    console.log("   \u2705 Created holiday shifts for skeleton crew (New Year, Lunar New Year)");
    const payrollPeriodsList = [
      {
        startDate: /* @__PURE__ */ new Date("2026-01-01"),
        endDate: /* @__PURE__ */ new Date("2026-01-15"),
        status: "closed",
        id: "period-2026-01-01"
      },
      {
        startDate: /* @__PURE__ */ new Date("2026-01-16"),
        endDate: /* @__PURE__ */ new Date("2026-01-31"),
        status: "closed",
        id: "period-2026-01-16"
      },
      {
        startDate: /* @__PURE__ */ new Date("2026-02-01"),
        endDate: /* @__PURE__ */ new Date("2026-02-15"),
        status: "closed",
        id: "period-2026-02-01"
      },
      {
        startDate: /* @__PURE__ */ new Date("2026-02-16"),
        endDate: /* @__PURE__ */ new Date("2026-02-28"),
        status: "closed",
        id: "period-2026-02-16"
      },
      {
        startDate: /* @__PURE__ */ new Date("2026-03-01"),
        endDate: /* @__PURE__ */ new Date("2026-03-15"),
        status: "open",
        id: "period-2026-03-01"
      },
      {
        startDate: /* @__PURE__ */ new Date("2026-03-16"),
        endDate: /* @__PURE__ */ new Date("2026-03-31"),
        status: "open",
        id: "period-2026-03-16"
      }
    ];
    const periodWorkingDays = {
      "period-2026-01-01": jan1_15.length,
      "period-2026-01-16": jan16_31.length,
      "period-2026-02-01": feb1_15.length,
      "period-2026-02-16": feb16_28.length,
      "period-2026-03-01": mar1_15.length,
      "period-2026-03-16": mar16_31.length
    };
    const periodHolidayDetails = {
      "period-2026-01-01": [{ date: "2026-01-01", type: "regular" }],
      // New Year's Day
      "period-2026-01-16": [],
      // Jan 23 special_working = normal pay
      "period-2026-02-01": [],
      // No holidays
      "period-2026-02-16": [
        { date: "2026-02-17", type: "special_non_working" },
        // Lunar New Year
        { date: "2026-02-25", type: "special_non_working" }
        // EDSA Anniversary
      ],
      "period-2026-03-01": [],
      // No holidays in early March
      "period-2026-03-16": [
        { date: "2026-03-20", type: "special_non_working" },
        // Eid'l Fitr (tentative)
        { date: "2026-03-28", type: "special_non_working" }
        // Black Saturday
      ]
    };
    const empPeriodConfig = {
      "user-emp-sam": {
        "period-2026-01-01": { overtimeHours: 3, workedHolidays: ["2026-01-01"] }
        // 3h OT Jan 10 + worked NY
      },
      "user-emp-sofia": {
        "period-2026-01-01": { overtimeHours: 0, workedHolidays: ["2026-01-01"] },
        // worked NY
        "period-2026-02-01": { overtimeHours: 1.5, workedHolidays: [] }
        // 1.5h OT Feb 5
      },
      "user-emp-miguel": {
        "period-2026-02-16": { overtimeHours: 0, workedHolidays: ["2026-02-17"] }
        // worked Lunar New Year
      },
      "user-emp-bea": {
        "period-2026-02-16": { overtimeHours: 2, workedHolidays: [] }
        // 2h OT Feb 20
      }
    };
    for (const period of payrollPeriodsList) {
      const workingDays = periodWorkingDays[period.id] || 12;
      await db.insert(payrollPeriods).values({
        id: period.id,
        branchId,
        startDate: period.startDate,
        endDate: period.endDate,
        status: period.status,
        totalHours: (workingDays * 8 * allStaff.length).toString(),
        totalPay: "0"
        // Updated after entries are calculated
      });
      let periodTotalPay = 0;
      for (const emp of allStaff) {
        const hourlyRate = parseFloat(emp.hourlyRate);
        const config = empPeriodConfig[emp.id]?.[period.id] || { overtimeHours: 0, workedHolidays: [] };
        const overtimeHours = config.overtimeHours;
        const workedHolidays = config.workedHolidays;
        const nightDiffHours = 0;
        const regularHoursBase = workingDays * 8;
        const holidayWorkHours = workedHolidays.length * 8;
        const basicPay = (regularHoursBase + holidayWorkHours) * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.25;
        const nightDiffPay = 0;
        let holidayPay = 0;
        const holidays2 = periodHolidayDetails[period.id] || [];
        for (const hol of holidays2) {
          if (workedHolidays.includes(hol.date)) {
            if (hol.type === "regular") {
              holidayPay += hourlyRate * 8 * 1;
            } else {
              holidayPay += hourlyRate * 8 * 0.3;
            }
          } else {
            if (hol.type === "regular") {
              holidayPay += hourlyRate * 8;
            }
          }
        }
        const grossPay = basicPay + overtimePay + nightDiffPay + holidayPay;
        const { calculateAllDeductions: calculateAllDeductions2, calculateWithholdingTax: calculateWithholdingTax2 } = await Promise.resolve().then(() => (init_deductions(), deductions_exports));
        const periodStart = period.startDate;
        const periodEnd = period.endDate;
        const calendarDaysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1e3)) + 1;
        const monthlyBasicSalary = grossPay / calendarDaysInPeriod * 30;
        const mandatoryBreakdown = await calculateAllDeductions2(monthlyBasicSalary, {
          deductSSS: true,
          deductPhilHealth: true,
          deductPagibig: true,
          deductWithholdingTax: false
        });
        const periodFraction = 0.5;
        const sssContribution = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
        const philhealthContribution = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
        const pagibigContribution = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;
        const monthlyMandatory = mandatoryBreakdown.sssContribution + mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
        const monthlyTaxableIncome = Math.max(0, monthlyBasicSalary - monthlyMandatory);
        const monthlyTax = await calculateWithholdingTax2(monthlyTaxableIncome);
        const withholdingTax = Math.round(monthlyTax * periodFraction * 100) / 100;
        const sssLoan = parseFloat(emp.sssLoanDeduction || "0");
        const pagibigLoan = parseFloat(emp.pagibigLoanDeduction || "0");
        const totalDeductions = sssContribution + philhealthContribution + pagibigContribution + withholdingTax + sssLoan + pagibigLoan;
        const netPay = grossPay - totalDeductions;
        periodTotalPay += grossPay;
        const totalHours = regularHoursBase + holidayWorkHours + overtimeHours;
        await db.insert(payrollEntries).values({
          id: randomUUID5(),
          userId: emp.id,
          payrollPeriodId: period.id,
          totalHours: totalHours.toFixed(2),
          regularHours: (regularHoursBase + holidayWorkHours).toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          nightDiffHours: nightDiffHours.toFixed(2),
          basicPay: basicPay.toFixed(2),
          overtimePay: overtimePay.toFixed(2),
          nightDiffPay: nightDiffPay.toFixed(2),
          holidayPay: holidayPay.toFixed(2),
          grossPay: grossPay.toFixed(2),
          sssContribution: sssContribution.toFixed(2),
          sssLoan: sssLoan.toFixed(2),
          philHealthContribution: philhealthContribution.toFixed(2),
          pagibigContribution: pagibigContribution.toFixed(2),
          pagibigLoan: pagibigLoan.toFixed(2),
          withholdingTax: withholdingTax.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          deductions: totalDeductions.toFixed(2),
          netPay: netPay.toFixed(2),
          status: period.status === "closed" ? "paid" : "pending",
          paidAt: period.status === "closed" ? getPaymentDate(period.endDate) : null
        });
      }
      await db.update(payrollPeriods).set({ totalPay: periodTotalPay.toFixed(2) }).where(eq6(payrollPeriods.id, period.id));
    }
    console.log("   \u2705 Created 6 payroll periods (Jan\u2013Mar 2026) with DOLE-compliant deductions");
    const timeOffRequests_data = [
      { userId: employees[0].id, startDate: /* @__PURE__ */ new Date("2026-02-23"), endDate: /* @__PURE__ */ new Date("2026-02-24"), type: "vacation", reason: "Family event", status: "approved" },
      { userId: employees[1].id, startDate: /* @__PURE__ */ new Date("2026-02-10"), endDate: /* @__PURE__ */ new Date("2026-02-10"), type: "sick", reason: "Medical checkup", status: "pending" },
      { userId: employees[2].id, startDate: /* @__PURE__ */ new Date("2026-03-02"), endDate: /* @__PURE__ */ new Date("2026-03-03"), type: "vacation", reason: "Personal travel", status: "pending" }
    ];
    for (const req of timeOffRequests_data) {
      await db.insert(timeOffRequests).values({
        id: randomUUID5(),
        userId: req.userId,
        startDate: req.startDate,
        endDate: req.endDate,
        type: req.type,
        reason: req.reason,
        status: req.status
      });
    }
    console.log("   \u2705 Created time-off requests");
    const notificationsList = [
      { userId: employees[0].id, type: "payroll", title: "Payslip Available", message: "Your payslip for Feb 1-15, 2026 is now available." },
      { userId: employees[0].id, type: "schedule", title: "New Shift Assigned", message: "You have been assigned morning shift for Feb 20, 2026." },
      { userId: employees[1].id, type: "time_off", title: "Time-Off Request Pending", message: "Your sick leave request for Feb 10 is under review." },
      { userId: manager?.id || employees[0].id, type: "approval", title: "Pending Approvals", message: "You have 2 time-off requests awaiting your approval." },
      { userId: manager?.id || employees[0].id, type: "payroll", title: "Payroll Due", message: "February 16-28 payroll needs to be processed by Mar 5." }
    ];
    for (const notif of notificationsList) {
      await db.insert(notifications).values({
        id: randomUUID5(),
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: false
      });
    }
    console.log("   \u2705 Created notifications");
    if (manager) {
      const otEntries = [
        // Sam: 3 hrs OT on Jan 10 (busy morning shift)
        {
          employeeId: "user-emp-sam",
          date: new Date(Date.UTC(2026, 0, 10)),
          value: "3",
          payrollPeriodId: "period-2026-01-01",
          remarks: "busy morning \u2014 extra orders during holiday weekend"
        },
        // Sofia: 1.5 hrs OT on Feb 5 (closing duties)
        {
          employeeId: "user-emp-sofia",
          date: new Date(Date.UTC(2026, 1, 5)),
          value: "1.5",
          payrollPeriodId: "period-2026-02-01",
          remarks: "extended closing duties \u2014 inventory count"
        },
        // Bea: 2 hrs OT on Feb 20 (server coverage)
        {
          employeeId: "user-emp-bea",
          date: new Date(Date.UTC(2026, 1, 20)),
          value: "2",
          payrollPeriodId: "period-2026-02-16",
          remarks: "covered absent server \u2014 approved by manager"
        }
      ];
      for (const ot of otEntries) {
        const emp = allStaff.find((u) => u.id === ot.employeeId);
        if (!emp) continue;
        await db.insert(adjustmentLogs).values({
          id: randomUUID5(),
          employeeId: ot.employeeId,
          branchId,
          loggedBy: manager.id,
          startDate: ot.date,
          endDate: ot.date,
          type: "overtime",
          value: ot.value,
          remarks: ot.remarks,
          status: "approved",
          verifiedByEmployee: false,
          approvedBy: manager.id,
          approvedAt: ot.date,
          payrollPeriodId: ot.payrollPeriodId,
          calculatedAmount: (parseFloat(emp.hourlyRate) * 1.25 * parseFloat(ot.value)).toFixed(2)
        });
      }
      console.log("   \u2705 Created OT exception logs (Sam 3h, Sofia 1.5h, Bea 2h)");
    }
    console.log("\u2705 Sample schedules and payroll seeded successfully");
  } catch (error) {
    console.error("\u274C Error seeding schedules and payroll:", error);
    throw error;
  }
}
async function markSetupComplete() {
  console.log("\u{1F3C1} Marking setup as complete...");
  try {
    const existing = await db.select().from(setupStatus).limit(1);
    if (existing.length > 0) {
      await db.update(setupStatus).set({ isSetupComplete: true, setupCompletedAt: /* @__PURE__ */ new Date() }).where(eq6(setupStatus.id, existing[0].id));
    } else {
      await db.insert(setupStatus).values({
        id: randomUUID5(),
        isSetupComplete: true,
        setupCompletedAt: /* @__PURE__ */ new Date()
      });
    }
    console.log("\u2705 Setup marked as complete");
  } catch (error) {
    console.error("\u274C Error marking setup as complete:", error);
    throw error;
  }
}
async function seedSampleShiftTrades() {
  console.log("\u{1F504} Seeding sample shift trades...");
  try {
    const existingTrades = await db.select().from(shiftTrades).limit(1);
    if (existingTrades.length > 0) {
      console.log("\u2705 Shift trades already exist");
      return;
    }
    const allEmps = await db.select().from(users).where(eq6(users.role, "employee"));
    const allBranches = await db.select().from(branches);
    if (allEmps.length < 4) {
      console.log("\u26A0\uFE0F Not enough employees for trades");
      return;
    }
    const tradeShiftIds = [];
    const tradeShiftUsers = [allEmps[0], allEmps[2], allEmps[3]];
    for (let i = 0; i < tradeShiftUsers.length; i++) {
      const emp = tradeShiftUsers[i];
      const shiftId = `trade-shift-${i + 1}`;
      const day = 6 + i * 2;
      await db.insert(shifts).values({
        id: shiftId,
        userId: emp.id,
        branchId: emp.branchId,
        startTime: new Date(Date.UTC(2026, 3, day, 0, 0, 0)),
        // 8AM PHT
        endTime: new Date(Date.UTC(2026, 3, day, 8, 0, 0)),
        // 4PM PHT
        position: emp.position,
        status: "scheduled"
      });
      tradeShiftIds.push(shiftId);
    }
    await db.insert(shiftTrades).values({
      id: randomUUID5(),
      shiftId: tradeShiftIds[0],
      fromUserId: allEmps[0].id,
      toUserId: allEmps[1].id,
      reason: "Personal appointment conflict",
      status: "pending",
      urgency: "normal",
      requestedAt: /* @__PURE__ */ new Date()
    });
    await db.insert(shiftTrades).values({
      id: randomUUID5(),
      shiftId: tradeShiftIds[1],
      fromUserId: allEmps[2].id,
      toUserId: null,
      reason: "Emergency family matter",
      status: "pending",
      urgency: "urgent",
      requestedAt: /* @__PURE__ */ new Date()
    });
    const approvedTime = /* @__PURE__ */ new Date();
    approvedTime.setHours(approvedTime.getHours() - 2);
    await db.insert(shiftTrades).values({
      id: randomUUID5(),
      shiftId: tradeShiftIds[2],
      fromUserId: allEmps[3].id,
      toUserId: allEmps[4].id,
      reason: "Swapping shifts for study time",
      status: "approved",
      urgency: "normal",
      requestedAt: approvedTime,
      approvedAt: /* @__PURE__ */ new Date()
    });
    await db.update(shifts).set({ userId: allEmps[4].id }).where(eq6(shifts.id, tradeShiftIds[2]));
    console.log("   \u2705 Created 3 sample shift trades (Pending, Open/Urgent, Approved)");
  } catch (error) {
    console.error("\u274C Error seeding shift trades:", error);
  }
}

// server/routes.ts
init_payroll_utils();
import bcrypt3 from "bcrypt";
import { format as format4 } from "date-fns";
import crypto3 from "crypto";
import { Pool as Pool2, neonConfig as neonConfig2 } from "@neondatabase/serverless";
import ws2 from "ws";

// server/services/realtime-manager.ts
init_db_storage();
import { Server as SocketIOServer } from "socket.io";
var RealTimeManager = class {
  io;
  userConnections = /* @__PURE__ */ new Map();
  // userId -> Set of socketIds
  constructor(httpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          "http://localhost:5000",
          "http://localhost:5173",
          "http://localhost:3000",
          process.env.VITE_API_URL || "",
          process.env.FRONTEND_URL || ""
        ].filter(Boolean),
        credentials: true
      },
      transports: ["websocket", "polling"],
      pingInterval: 25e3,
      pingTimeout: 6e4
    });
    this.setupMiddleware();
    this.setupConnections();
  }
  setupMiddleware() {
    this.io.use((socket, next) => {
      const userId = socket.handshake.query.userId;
      const authToken = socket.handshake.auth.token;
      if (!userId && !authToken) {
        return next(new Error("Authentication required"));
      }
      socket.data.userId = userId;
      next();
    });
  }
  setupConnections() {
    this.io.on("connection", async (socket) => {
      const userId = socket.data.userId;
      if (!userId) {
        console.warn("Socket connected without userId");
        return;
      }
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, /* @__PURE__ */ new Set());
      }
      this.userConnections.get(userId).add(socket.id);
      console.log(`User ${userId} connected (socket: ${socket.id})`);
      socket.join(`user:${userId}`);
      try {
        const user = await dbStorage.getUser(userId);
        if (user) {
          console.log(`Joining user ${userId} to branch room: branch:${user.branchId}`);
          socket.join(`branch:${user.branchId}`);
          socket.join(`branch:${user.branchId}:shifts`);
          if (user.role === "manager" || user.role === "admin") {
            socket.join(`branch:${user.branchId}:managers`);
          } else {
            socket.join(`branch:${user.branchId}:employees`);
          }
        }
      } catch (err) {
        console.error(`Error joining rooms for user ${userId}:`, err);
      }
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
      socket.on("error", (error) => {
        console.error(`Socket error for user ${userId}:`, error);
      });
    });
  }
  // Public methods for broadcasting events
  broadcastShiftCreated(shift) {
    const room = shift.branchId ? `branch:${shift.branchId}:shifts` : `branch:unknown:shifts`;
    this.io.to(room).emit("shift:created", { shift });
  }
  broadcastShiftUpdated(shift) {
    const room = shift.branchId ? `branch:${shift.branchId}:shifts` : `branch:unknown:shifts`;
    this.io.to(room).emit("shift:updated", { shift });
  }
  broadcastShiftDeleted(shiftId, branchId) {
    const room = branchId ? `branch:${branchId}:shifts` : `branch:unknown:shifts`;
    this.io.to(room).emit("shift:deleted", { shiftId });
  }
  // ENHANCED SHIFT TRADE EVENTS
  broadcastTradeCreated(trade, shift) {
    const payload = { trade, shift };
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:created", payload);
      this.io.to(`user:${trade.fromUserId}`).emit("trade:created", payload);
    }
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:created", payload);
      this.io.to(`user:${trade.toUserId}`).emit("trade:created", payload);
    }
    if (shift?.branchId) {
      this.io.to(`branch:${shift.branchId}:managers`).emit("trade:created", payload);
    }
    if (shift?.branchId) {
      this.io.to(`branch:${shift.branchId}:shifts`).emit("trade:created", payload);
    }
  }
  broadcastTradeAccepted(tradeId, trade, shift) {
    const payload = { tradeId, trade, shift, status: "accepted" };
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:status-changed", payload);
      this.io.to(`user:${trade.fromUserId}`).emit("trade:status-changed", payload);
    }
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:status-changed", payload);
      this.io.to(`user:${trade.toUserId}`).emit("trade:status-changed", payload);
    }
    if (shift?.branchId) {
      this.io.to(`branch:${shift.branchId}:managers`).emit("trade:status-changed", payload);
    }
    if (shift?.branchId) {
      this.io.to(`branch:${shift.branchId}:shifts`).emit("trade:status-changed", payload);
    }
  }
  broadcastTradeRejected(tradeId, trade, reason, branchId) {
    const payload = { tradeId, trade, status: "rejected", reason };
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:status-changed", payload);
      this.io.to(`user:${trade.fromUserId}`).emit("trade:status-changed", payload);
    }
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:status-changed", payload);
      this.io.to(`user:${trade.toUserId}`).emit("trade:status-changed", payload);
    }
    if (branchId) {
      this.io.to(`branch:${branchId}:managers`).emit("trade:status-changed", payload);
      this.io.to(`branch:${branchId}:shifts`).emit("trade:status-changed", payload);
    }
  }
  broadcastTradeApproved(tradeId, trade, updatedShift) {
    const payload = {
      tradeId,
      trade,
      updatedShift,
      status: "approved",
      message: "Shift ownership has been transferred"
    };
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:approved", payload);
      this.io.to(`user:${trade.fromUserId}`).emit("trade:approved", payload);
    }
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:approved", payload);
      this.io.to(`user:${trade.toUserId}`).emit("trade:approved", payload);
    }
    this.io.to(`branch:${updatedShift.branchId}:managers`).emit("trade:approved", payload);
    this.broadcastShiftUpdated(updatedShift);
  }
  broadcastTradeStatusChanged(tradeId, status, trade, branchId) {
    if (trade.fromUserId) {
      this.io.to(`user:${trade.fromUserId}:trades`).emit("trade:status-changed", { tradeId, status, trade });
      this.io.to(`user:${trade.fromUserId}`).emit("trade:status-changed", { tradeId, status, trade });
    }
    if (trade.toUserId) {
      this.io.to(`user:${trade.toUserId}:trades`).emit("trade:status-changed", { tradeId, status, trade });
      this.io.to(`user:${trade.toUserId}`).emit("trade:status-changed", { tradeId, status, trade });
    }
    if (branchId) {
      this.io.to(`branch:${branchId}:managers`).emit("trade:status-changed", { tradeId, status, trade });
      this.io.to(`branch:${branchId}:shifts`).emit("trade:status-changed", { tradeId, status, trade });
    }
  }
  broadcastShiftOwnershipChanged(shiftId, fromUserId, toUserId, shift) {
    const payload = { shiftId, fromUserId, toUserId, shift };
    this.io.to(`user:${fromUserId}`).emit("shift:ownership-changed", payload);
    this.io.to(`user:${toUserId}`).emit("shift:ownership-changed", payload);
    if (shift.branchId) {
      this.io.to(`branch:${shift.branchId}:shifts`).emit("shift:ownership-changed", payload);
    }
    this.broadcastShiftUpdated(shift);
  }
  notifyAvailabilityUpdate(employeeId, availability, branchId) {
    if (branchId) {
      this.io.to(`branch:${branchId}:shifts`).emit("availability:updated", { employeeId, availability });
    }
  }
  broadcastEmployeeCreated(employee) {
    const room = employee.branchId ? `branch:${employee.branchId}` : void 0;
    if (room) {
      this.io.to(room).emit("employee:created", { employee });
    }
  }
  broadcastEmployeeUpdated(employee) {
    const room = employee.branchId ? `branch:${employee.branchId}` : void 0;
    if (room) {
      this.io.to(room).emit("employee:updated", { employee });
    }
  }
  broadcastEmployeeDeleted(employeeId, branchId) {
    if (branchId) {
      this.io.to(`branch:${branchId}`).emit("employee:deleted", { employeeId });
    }
  }
  // PAYROLL EVENTS
  broadcastPayrollPeriodCreated(period) {
    const room = period.branchId ? `branch:${period.branchId}` : void 0;
    if (room) {
      this.io.to(room).emit("payroll:period-created", { period });
    }
  }
  broadcastPayrollPeriodUpdated(period) {
    const room = period.branchId ? `branch:${period.branchId}` : void 0;
    if (room) {
      this.io.to(room).emit("payroll:period-updated", { period });
    }
  }
  broadcastPayrollProcessed(periodId, stats, branchId) {
    if (branchId) {
      this.io.to(`branch:${branchId}`).emit("payroll:processed", { periodId, stats });
    }
  }
  broadcastPayrollEntryUpdated(entryId, status, entry) {
    if (entry && entry.userId) {
      this.io.to(`user:${entry.userId}`).emit("payroll:entry-updated", { entryId, status, entry });
    }
    if (entry?.branchId) {
      this.io.to(`branch:${entry.branchId}:managers`).emit("payroll:entry-updated", { entryId, status, entry });
    }
  }
  broadcastPayrollSent(entryId, userId, netPay, branchId) {
    this.io.to(`user:${userId}`).emit("payroll:sent", { entryId, netPay });
    if (branchId) {
      this.io.to(`branch:${branchId}:managers`).emit("payroll:sent", { entryId, netPay });
    }
  }
  // AUDIT LOG EVENTS
  broadcastAuditLogCreated(auditLog, branchId) {
    if (branchId) {
      this.io.to(`branch:${branchId}:managers`).emit("audit:created", { auditLog });
    }
  }
  // NOTIFICATION EVENTS
  broadcastNotification(notification) {
    if (notification.userId) {
      this.io.to(`user:${notification.userId}`).emit("notification:created", { notification });
    }
  }
  broadcastBranchNotification(branchId, notification) {
    this.io.to(`branch:${branchId}`).emit("notification:created", { notification });
  }
  broadcastBranchManagerNotification(branchId, notification) {
    this.io.to(`branch:${branchId}:managers`).emit("notification:created", { notification });
  }
  // TIME-OFF EVENTS
  broadcastTimeOffCreated(request, branchId) {
    if (request.userId) {
      this.io.to(`user:${request.userId}`).emit("time-off:created", { request });
    }
    if (branchId) {
      this.io.to(`branch:${branchId}:managers`).emit("time-off:created", { request });
      this.io.to(`branch:${branchId}:shifts`).emit("time-off:created", { request });
    }
  }
  broadcastTimeOffApproved(request, branchId) {
    if (request.userId) {
      this.io.to(`user:${request.userId}`).emit("time-off:approved", { request });
    }
    if (branchId) {
      this.io.to(`branch:${branchId}:managers`).emit("time-off:approved", { request });
      this.io.to(`branch:${branchId}:shifts`).emit("time-off:approved", { request });
    }
  }
  broadcastTimeOffRejected(request, branchId) {
    if (request.userId) {
      this.io.to(`user:${request.userId}`).emit("time-off:rejected", { request });
    }
    if (branchId) {
      this.io.to(`branch:${branchId}:managers`).emit("time-off:rejected", { request });
      this.io.to(`branch:${branchId}:shifts`).emit("time-off:rejected", { request });
    }
  }
  isUserOnline(userId) {
    return this.userConnections.has(userId) && (this.userConnections.get(userId)?.size ?? 0) > 0;
  }
  getUserConnections(userId) {
    return this.userConnections.get(userId)?.size ?? 0;
  }
  getIO() {
    return this.io;
  }
};
var realtime_manager_default = RealTimeManager;

// server/routes.ts
neonConfig2.webSocketConstructor = ws2;
var storage5 = dbStorage;
function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.error(`[${req.method} ${req.path}] Unhandled error:`, error.message || error);
      if (!res.headersSent) {
        res.status(500).json({ message: error.message || "Internal server error" });
      }
    });
  };
}
var pgPool = new Pool2({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 1e4,
  // 10s timeout to prevent infinite hangs on cold starts
  idleTimeoutMillis: 3e4,
  // Close idle connections after 30s
  max: 5
  // Limit pool size for session store
});
pgPool.on("error", (err) => {
  console.error("[SESSION POOL] Unexpected error on idle client:", err.message);
});
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const realTimeManager = new realtime_manager_default(httpServer);
  setAuditRealTimeManager(realTimeManager);
  const isAuthenticated = (req) => {
    return !!(req.session && req.session.user);
  };
  const getAuthenticatedUser = (req) => {
    return isAuthenticated(req) ? req.session.user : null;
  };
  const requireAuth10 = (req, res, next) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    req.user = user;
    next();
  };
  const requireRole3 = (roles) => (req, res, next) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const effectiveRoles = [...roles];
    if (roles.includes("manager") && !roles.includes("admin")) {
      effectiveRoles.push("admin");
    }
    if (!effectiveRoles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    req.user = user;
    next();
  };
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    // e.g. https://your-app.vercel.app
    "http://localhost:5000",
    // local dev (same origin)
    "http://localhost:5173",
    // Vite dev server
    "http://localhost:3000"
    // alternative local
  ].filter(Boolean);
  app2.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    // Required for cross-origin cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  }));
  const PgSessionStore = PgSession(session2);
  const sessionConfig = {
    store: new PgSessionStore({
      pool: pgPool,
      tableName: "session",
      createTableIfMissing: true,
      ttl: 24 * 60 * 60,
      // 24 hours in seconds
      disableTouch: false,
      // Allow touch to refresh session
      schemaName: "public",
      pruneSessionInterval: false
      // Disable automatic pruning to avoid stalling on cold connections
    }),
    secret: process.env.SESSION_SECRET || (() => {
      if (process.env.NODE_ENV === "production") {
        console.warn("[WARN] SESSION_SECRET env var is not set! Using auto-generated fallback. Sessions will be invalidated on each restart.");
        return crypto3.randomBytes(64).toString("hex");
      }
      return "cafe-dev-secret-key-local-only";
    })(),
    resave: false,
    // Don't save unless modified
    saveUninitialized: false,
    // Don't create empty sessions
    name: "cafe-session",
    // Custom session cookie name
    proxy: process.env.NODE_ENV === "production",
    // Trust X-Forwarded-* headers on Render
    cookie: {
      // Allow explicit override via SESSION_COOKIE_SECURE env var.
      // By default, keep cookies secure in production (HTTPS). For local testing
      // you can set SESSION_COOKIE_SECURE=false to allow cookies over http://localhost.
      secure: process.env.SESSION_COOKIE_SECURE ? String(process.env.SESSION_COOKIE_SECURE).toLowerCase() === "true" : process.env.NODE_ENV === "production",
      // HTTPS only in production by default
      httpOnly: true,
      // Prevent JavaScript access for security
      // Only use 'none' in production if FRONTEND_URL is set, otherwise use 'lax'.
      // Browsers reject sameSite: 'none' when secure: false.
      sameSite: process.env.NODE_ENV === "production" && process.env.FRONTEND_URL ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours in milliseconds
      path: "/",
      // Cookie available to entire app
      domain: void 0
      // Let browser handle domain
    },
    rolling: true
    // Roll session on each response to extend expiration
  };
  app2.use(session2(sessionConfig));
  app2.use((req, res, next) => {
    if (req.session?.user) {
      req.session.touch();
    }
    next();
  });
  app2.get("/api/setup/status", asyncHandler(async (req, res) => {
    try {
      const isComplete = await storage5.isSetupComplete();
      res.json({
        isSetupComplete: isComplete
      });
    } catch (error) {
      console.error("Setup status check error:", error);
      res.status(500).json({ message: "Failed to check setup status" });
    }
  }));
  app2.use("/api/loans", requireAuth10, loans_default);
  app2.use(router2);
  app2.post("/api/setup", asyncHandler(async (req, res) => {
    try {
      const isComplete = await storage5.isSetupComplete();
      if (isComplete) {
        return res.status(400).json({ message: "Setup already completed" });
      }
      const { branch, manager } = z5.object({
        branch: z5.object({
          name: z5.string().min(1),
          address: z5.string().min(1),
          phone: z5.string().optional()
        }),
        manager: z5.object({
          username: z5.string().min(1),
          password: z5.string().min(6),
          firstName: z5.string().min(1),
          lastName: z5.string().min(1),
          email: z5.string().email(),
          hourlyRate: z5.string()
        })
      }).parse(req.body);
      const createdBranch = await storage5.createBranch({
        name: branch.name,
        address: branch.address,
        phone: branch.phone || null,
        isActive: true
      });
      const createdManager = await storage5.createUser({
        username: manager.username,
        password: manager.password,
        firstName: manager.firstName,
        lastName: manager.lastName,
        email: manager.email,
        role: "manager",
        position: "Store Manager",
        hourlyRate: manager.hourlyRate,
        branchId: createdBranch.id,
        isActive: true
      });
      await storage5.markSetupComplete();
      res.json({
        message: "Setup completed successfully",
        branch: createdBranch,
        manager: {
          id: createdManager.id,
          username: createdManager.username,
          firstName: createdManager.firstName,
          lastName: createdManager.lastName,
          email: createdManager.email
        }
      });
    } catch (error) {
      console.error("Setup error:", error);
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ message: "Invalid setup data", errors: error.errors });
      }
      res.status(500).json({ message: "Setup failed" });
    }
  }));
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      port: process.env.PORT || "5000",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.get("/healthz", (req, res) => {
    res.status(200).send("OK");
  });
  app2.post("/api/admin/fix-passwords", requireAuth10, requireRole3(["admin"]), asyncHandler(async (req, res) => {
    try {
      const { defaultPassword } = req.body;
      const passwordToHash = defaultPassword || "password123";
      const allBranches = await storage5.getAllBranches();
      let fixed = 0;
      let skipped = 0;
      const fixedUsers = [];
      for (const branch of allBranches) {
        const users2 = await storage5.getUsersByBranch(branch.id);
        for (const user of users2) {
          const isBcryptHash = user.password.startsWith("$2b$") || user.password.startsWith("$2a$");
          if (!isBcryptHash) {
            await storage5.updateUser(user.id, { password: passwordToHash });
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
        newPassword: passwordToHash
      });
    } catch (error) {
      console.error("Fix passwords error:", error);
      res.status(500).json({ message: "Failed to fix passwords" });
    }
  }));
  app2.post("/api/admin/reset-password", requireAuth10, requireRole3(["admin", "manager"]), asyncHandler(async (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) {
        return res.status(400).json({ message: "userId and newPassword are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const user = await storage5.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const currentUser = req.user;
      if (currentUser.role === "manager") {
        if (user.branchId !== currentUser.branchId) {
          return res.status(403).json({ message: "Cannot reset password for user in another branch" });
        }
        if (user.role !== "employee") {
          return res.status(403).json({ message: "Managers can only reset employee passwords" });
        }
      }
      await storage5.updateUser(userId, { password: newPassword });
      res.json({ message: `Password reset successfully for ${user.username}` });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  }));
  const clientDebugReports = [];
  app2.post("/api/client-debug", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const payload = req.body || {};
      const entry = {
        receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
        ip: req.ip,
        ua: req.get("user-agent"),
        url: payload.url || req.get("referer") || req.originalUrl,
        payload
      };
      clientDebugReports.unshift(entry);
      if (clientDebugReports.length > 200) clientDebugReports.pop();
      res.status(204).end();
    } catch (error) {
      console.error("Error receiving client debug report:", error);
      res.status(500).json({ message: "Failed to record client debug report" });
    }
  }));
  app2.get("/api/client-debug", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const rows = clientDebugReports.slice(0, 100).map((r, idx) => {
        const p = JSON.stringify(r.payload, null, 2).replace(/</g, "&lt;");
        const safeUrl = String(r.url || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        return `<section style="border-bottom:1px solid #eee;padding:12px 0"><h3>#${idx + 1} - ${r.receivedAt} - ${safeUrl}</h3><pre style="white-space:pre-wrap;background:#111;color:#fff;padding:8px;border-radius:6px;overflow:auto;max-height:240px">${p}</pre></section>`;
      }).join("\n");
      const page = `<!doctype html><html><head><meta charset="utf-8"><title>Client Debug Reports</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:Arial,Helvetica,sans-serif;margin:20px"><h1>Client Debug Reports (recent)</h1>${rows || "<p>No reports yet</p>"}</body></html>`;
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(page);
    } catch (error) {
      console.error("Error rendering client debug reports:", error);
      res.status(500).json({ message: "Failed to render debug reports" });
    }
  }));
  app2.post("/api/auth/login", asyncHandler(async (req, res) => {
    try {
      const { username, password } = z5.object({
        username: z5.string().min(1),
        password: z5.string().min(1)
      }).parse(req.body);
      const user = await storage5.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isBcryptHash = user.password && (user.password.startsWith("$2b$") || user.password.startsWith("$2a$"));
      let isPasswordValid = false;
      if (!isBcryptHash) {
        if (user.password === password) {
          const hashedPassword = await bcrypt3.hash(password, 10);
          await storage5.updateUser(user.id, { password });
          isPasswordValid = true;
        }
      } else {
        isPasswordValid = await bcrypt3.compare(password, user.password);
      }
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const authUser = {
        id: user.id,
        username: user.username,
        role: user.role,
        branchId: user.branchId
      };
      req.session.user = authUser;
      return new Promise((resolve) => {
        req.session.save((err) => {
          if (err) {
            console.error("\u274C Session save error:", err);
            res.status(500).json({ message: "Failed to create session" });
          } else {
            const { password: _, ...userWithoutPassword } = user;
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            res.json({
              user: userWithoutPassword,
              authenticated: true
            });
          }
          resolve();
        });
      });
    } catch (error) {
      console.error("\u274C Login error:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Invalid request data"
      });
    }
  }));
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("cafe-session", {
        path: "/",
        secure: process.env.SESSION_COOKIE_SECURE ? String(process.env.SESSION_COOKIE_SECURE).toLowerCase() === "true" : process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" && process.env.FRONTEND_URL ? "none" : "lax"
      });
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/status", asyncHandler(async (req, res) => {
    try {
      const isSetupComplete = await storage5.isSetupComplete();
      if (req.session?.user?.id) {
        try {
          const freshUser = await storage5.getUser(req.session.user.id);
          if (freshUser) {
            const { password: _, ...userWithoutPassword } = freshUser;
            res.json({
              authenticated: true,
              isSetupComplete,
              user: { ...userWithoutPassword, branchId: req.session.user.branchId || userWithoutPassword.branchId }
            });
          } else {
            res.json({ authenticated: false, isSetupComplete, user: null });
          }
        } catch (dbErr) {
          console.warn("[AUTH STATUS] DB fetch failed, falling back to session:", dbErr);
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
      console.error("\u274C [AUTH STATUS] Error:", error);
      res.json({
        authenticated: false,
        isSetupComplete: false,
        user: null
      });
    }
  }));
  app2.get("/api/auth/me", requireAuth10, asyncHandler(async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage5.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({
        user: { ...userWithoutPassword, branchId: req.user.branchId || userWithoutPassword.branchId }
      });
    } catch (error) {
      console.error("Error in /api/auth/me:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  }));
  app2.put("/api/auth/switch-branch", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { branchId } = req.body;
      if (!branchId || typeof branchId !== "string") {
        return res.status(400).json({ message: "branchId is required" });
      }
      const branch = await storage5.getBranch(branchId);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      req.session.user = { ...req.session.user, branchId };
      req.user = { ...req.user, branchId };
      return new Promise((resolve) => {
        req.session.save((err) => {
          if (err) {
            console.error("\u274C Failed to save session after branch switch:", err);
            res.status(500).json({ message: "Failed to switch branch" });
          } else {
            res.json({
              message: "Branch switched successfully",
              branchId,
              branchName: branch.name
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
  app2.get("/api/shifts", requireAuth10, asyncHandler(async (req, res) => {
    const { startDate, endDate, userId: queryUserId } = req.query;
    const currentUser = req.user;
    const targetUserId = queryUserId || currentUser.id;
    if (targetUserId !== currentUser.id && currentUser.role !== "manager" && currentUser.role !== "admin") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    const shifts2 = await storage5.getShiftsByUser(
      targetUserId,
      startDate ? new Date(startDate) : void 0,
      endDate ? new Date(endDate) : void 0
    );
    const enrichedShifts = shifts2.map((shift) => ({
      ...shift,
      date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null
    }));
    res.json({ shifts: enrichedShifts });
  }));
  app2.get("/api/shifts/branch", requireAuth10, requireRole3(["manager", "employee", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const branchId = req.user.branchId;
      const [shifts2, allUsers] = await Promise.all([
        storage5.getShiftsByBranch(
          branchId,
          startDate ? new Date(startDate) : void 0,
          endDate ? new Date(endDate) : void 0
        ),
        storage5.getUsersByBranch(branchId)
      ]);
      const userMap = new Map(allUsers.map((u) => [u.id, u]));
      const shiftsWithUsers = shifts2.map((shift) => ({
        ...shift,
        user: userMap.get(shift.userId)
      }));
      let activeShifts = shiftsWithUsers.filter((shift) => shift.user?.isActive);
      if (req.user.role === "employee") {
        const userId = req.user.id;
        activeShifts = activeShifts.filter((shift) => shift.userId === userId);
      }
      if (activeShifts.length > 0) {
      }
      res.json({ shifts: activeShifts });
    } catch (error) {
      console.error("\u274C [GET /api/shifts/branch] Error:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  }));
  app2.post("/api/shifts", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const shiftData = insertShiftSchema.parse(req.body);
      if (shiftData.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Cannot create shifts for another branch" });
      }
      const targetUser = await storage5.getUser(shiftData.userId);
      if (!targetUser || targetUser.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Employee does not belong to your branch" });
      }
      const timeError = validateShiftTimes(shiftData.startTime, shiftData.endTime);
      if (timeError) {
        return res.status(400).json({ message: timeError });
      }
      const existingTimeOffs = await storage5.getTimeOffRequestsByUser(shiftData.userId);
      const shiftStart = new Date(shiftData.startTime).getTime();
      const shiftEnd = new Date(shiftData.endTime).getTime();
      const hasTimeOff = existingTimeOffs.some((r) => {
        if (r.status !== "approved") return false;
        const existStart = new Date(r.startDate).setHours(0, 0, 0, 0);
        const existEnd = new Date(r.endDate).setHours(23, 59, 59, 999);
        return shiftStart <= existEnd && shiftEnd >= existStart;
      });
      if (hasTimeOff) {
        return res.status(409).json({
          message: "Conflict: This employee has an approved time-off request covering this shift duration."
        });
      }
      const existingShifts = await storage5.checkShiftOnDate(
        shiftData.userId,
        new Date(shiftData.startTime)
      );
      if (existingShifts.length > 0) {
        const existingStart = new Date(existingShifts[0].startTime);
        const existingEnd = new Date(existingShifts[0].endTime);
        return res.status(409).json({
          message: `Employee already has a shift scheduled on this day (${existingStart.toLocaleTimeString()} to ${existingEnd.toLocaleTimeString()}). Employees can only have 1 shift per day.`,
          code: "SHIFT_CONFLICT",
          conflictingShift: existingShifts[0]
        });
      }
      const shift = await storage5.createShift(shiftData);
      realTimeManager.broadcastShiftCreated(shift);
      await createAuditLog({
        action: "shift_create",
        entityType: "shift",
        entityId: shift.id,
        userId: req.user.id,
        newValues: { userId: shift.userId, branchId: shift.branchId, startTime: shift.startTime, endTime: shift.endTime, position: shift.position },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ shift });
    } catch (error) {
      console.error("Shift creation error:", error);
      if (error.errors) {
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
  app2.put("/api/shifts/:id", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertShiftSchema.partial().parse(req.body);
      const existingShift = await storage5.getShift(id);
      if (!existingShift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      if (existingShift.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Cannot update shift from another branch" });
      }
      const newStartTime = updateData.startTime ? new Date(updateData.startTime) : new Date(existingShift.startTime);
      const newEndTime = updateData.endTime ? new Date(updateData.endTime) : new Date(existingShift.endTime);
      const newUserId = updateData.userId || existingShift.userId;
      if (updateData.startTime && updateData.endTime) {
        const timeError = validateShiftTimes(updateData.startTime, updateData.endTime);
        if (timeError) {
          console.warn("[PUT /api/shifts/:id] Time validation error:", timeError);
          return res.status(400).json({ message: timeError });
        }
      }
      const existingTimeOffs = await storage5.getTimeOffRequestsByUser(newUserId);
      const updShiftStart = newStartTime.getTime();
      const updShiftEnd = newEndTime.getTime();
      const updHasTimeOff = existingTimeOffs.some((r) => {
        if (r.status !== "approved") return false;
        const existStart = new Date(r.startDate).setHours(0, 0, 0, 0);
        const existEnd = new Date(r.endDate).setHours(23, 59, 59, 999);
        return updShiftStart <= existEnd && updShiftEnd >= existStart;
      });
      if (updHasTimeOff) {
        return res.status(409).json({
          message: "Conflict: This employee has an approved time-off request covering this new shift duration."
        });
      }
      if (updateData.startTime || updateData.endTime || updateData.userId) {
        const existingShifts = await storage5.checkShiftOnDate(newUserId, newStartTime, id);
        if (existingShifts.length > 0) {
          const existingStart = new Date(existingShifts[0].startTime);
          const existingEnd = new Date(existingShifts[0].endTime);
          return res.status(409).json({
            message: `Employee already has a shift scheduled on this day (${existingStart.toLocaleTimeString()} to ${existingEnd.toLocaleTimeString()}). Employees can only have 1 shift per day.`,
            code: "SHIFT_CONFLICT",
            conflictingShift: existingShifts[0]
          });
        }
      }
      const shift = await storage5.updateShift(id, updateData);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      realTimeManager.broadcastShiftUpdated(shift);
      await createAuditLog({
        action: "shift_update",
        entityType: "shift",
        entityId: id,
        userId: req.user.id,
        newValues: updateData,
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ shift });
    } catch (error) {
      console.error("\u274C [PUT /api/shifts/:id] Error:", error);
      res.status(400).json({ message: "Invalid shift data" });
    }
  }));
  app2.delete("/api/shifts/:id", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const shift = await storage5.getShift(id);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      if (shift.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Cannot delete shift from another branch" });
      }
      const result = await storage5.deleteShift(id);
      if (!result) {
        return res.status(500).json({ message: "Failed to delete shift" });
      }
      realTimeManager.broadcastShiftDeleted(id, shift.branchId);
      await createAuditLog({
        action: "shift_delete",
        entityType: "shift",
        entityId: id,
        userId: req.user.id,
        oldValues: { userId: shift.userId, branchId: shift.branchId, startTime: shift.startTime, endTime: shift.endTime, position: shift.position },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ message: "Shift deleted successfully", shiftId: id });
    } catch (error) {
      console.error("Delete shift error:", error);
      res.status(500).json({ message: "Failed to delete shift" });
    }
  }));
  app2.get("/api/employees/stats", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const users2 = await storage5.getUsersByBranch(branchId);
    const { startDate, endDate } = req.query;
    const totalEmployees = users2.length;
    const activeEmployees = users2.filter((user) => user.isActive).length;
    let monthStart;
    let monthEnd;
    if (startDate && endDate) {
      monthStart = new Date(startDate);
      monthEnd = new Date(endDate);
      if (isNaN(monthStart.getTime()) || isNaN(monthEnd.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      monthEnd.setHours(23, 59, 59, 999);
    } else {
      const now = /* @__PURE__ */ new Date();
      monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    let totalHoursThisMonth = 0;
    for (const user of users2) {
      const shifts2 = await storage5.getShiftsByUser(user.id, monthStart, monthEnd);
      for (const shift of shifts2) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1e3 * 60 * 60);
        totalHoursThisMonth += hours;
      }
    }
    let totalPayrollThisMonth = 0;
    const allPeriods = await storage5.getPayrollPeriodsByBranch(branchId);
    const periodsThisMonth = allPeriods.filter((p) => {
      const pEnd = new Date(p.endDate);
      return pEnd >= monthStart && pEnd <= monthEnd;
    });
    const periodIds = new Set(periodsThisMonth.map((p) => p.id));
    for (const user of users2) {
      const entries = await storage5.getPayrollEntriesByUser(user.id);
      for (const entry of entries) {
        if (periodIds.has(entry.payrollPeriodId)) {
          totalPayrollThisMonth += parseFloat(entry.grossPay);
        }
      }
    }
    let totalPerformanceScore = 0;
    let employeesWithShifts = 0;
    for (const user of users2) {
      const shifts2 = await storage5.getShiftsByUser(user.id, monthStart, monthEnd);
      if (shifts2.length > 0) {
        const completedShifts = shifts2.filter((s) => s.status === "completed").length;
        const performanceScore = completedShifts / shifts2.length * 5;
        totalPerformanceScore += performanceScore;
        employeesWithShifts++;
      }
    }
    const averagePerformance = employeesWithShifts > 0 ? Number((totalPerformanceScore / employeesWithShifts).toFixed(1)) : 0;
    res.json({
      totalEmployees,
      activeEmployees,
      totalHoursThisMonth: Number(totalHoursThisMonth.toFixed(2)),
      totalPayrollThisMonth: Number(totalPayrollThisMonth.toFixed(2)),
      averagePerformance
    });
  }));
  app2.get("/api/employees/performance", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const users2 = await storage5.getUsersByBranch(branchId);
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const performanceData = await Promise.all(users2.map(async (user) => {
      const shifts2 = await storage5.getShiftsByUser(user.id, monthStart, monthEnd);
      let hoursThisMonth = 0;
      for (const shift of shifts2) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1e3 * 60 * 60);
        hoursThisMonth += hours;
      }
      const completedShifts = shifts2.filter((s) => s.status === "completed").length;
      const missedShifts = shifts2.filter((s) => s.status === "missed").length;
      const totalShifts = shifts2.length;
      let rating = 5;
      if (totalShifts > 0) {
        rating = 5 - missedShifts / totalShifts * 2;
        if (completedShifts === totalShifts && totalShifts > 0) {
          rating = 5;
        }
        rating = Math.max(0, Math.min(5, rating));
      }
      return {
        employeeId: user.id,
        employeeName: `${user.firstName} ${user.lastName}`,
        rating: Number(rating.toFixed(1)),
        hoursThisMonth: Number(hoursThisMonth.toFixed(2)),
        shiftsThisMonth: totalShifts
      };
    }));
    res.json(performanceData);
  }));
  app2.post("/api/employees/bulk-activate", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const { employeeIds } = req.body;
    const managerBranchId = req.user.branchId;
    if (!Array.isArray(employeeIds)) {
      return res.status(400).json({ message: "employeeIds must be an array" });
    }
    const updatedEmployees = [];
    for (const id of employeeIds) {
      const existing = await storage5.getUser(id);
      if (existing && existing.branchId === managerBranchId) {
        if (req.user.role !== "admin" && existing.role !== "employee") {
          continue;
        }
        const employee = await storage5.updateUser(id, { isActive: true });
        if (employee) updatedEmployees.push(employee);
      }
    }
    res.json({
      message: `${updatedEmployees.length} employees activated successfully`,
      updatedCount: updatedEmployees.length
    });
  }));
  app2.post("/api/employees/bulk-deactivate", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const { employeeIds } = req.body;
    const managerBranchId = req.user.branchId;
    if (!Array.isArray(employeeIds)) {
      return res.status(400).json({ message: "employeeIds must be an array" });
    }
    const updatedEmployees = [];
    for (const id of employeeIds) {
      const existing = await storage5.getUser(id);
      if (existing && existing.branchId === managerBranchId) {
        if (req.user.role !== "admin" && existing.role !== "employee") {
          continue;
        }
        const employee = await storage5.updateUser(id, { isActive: false });
        if (employee) updatedEmployees.push(employee);
      }
    }
    res.json({
      message: `${updatedEmployees.length} employees deactivated successfully`,
      updatedCount: updatedEmployees.length
    });
  }));
  app2.use("/api/employees", requireAuth10, employee_uploads_default);
  app2.use(createEmployeeRouter(realTimeManager));
  app2.use(router3);
  app2.use("/api/payslips", payslips_default);
  app2.use("/api/company-settings", company_settings_default);
  app2.use(router);
  app2.use(router6);
  app2.use(router7);
  app2.use(router8);
  app2.use(router11);
  app2.use(router2);
  app2.post("/api/adjustment-logs", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { employeeId, date, type, value, remarks } = req.body;
      const loggedBy = req.user.id;
      if (!employeeId || !date || !type || !value) {
        return res.status(400).json({ message: "Employee, date, type, and value are required" });
      }
      const employee = await storage5.getUser(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      const branchId = employee.branchId;
      if (!branchId) {
        return res.status(400).json({ message: "Target employee does not belong to a valid branch" });
      }
      const validTypes = ["overtime", "late", "undertime", "absent", "rest_day_ot", "special_holiday_ot", "regular_holiday_ot", "night_diff"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: `Invalid type. Valid types: ${validTypes.join(", ")}` });
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return res.status(400).json({ message: "Value must be a positive number." });
      }
      if (req.user.role === "manager" && branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Cannot create exception logs for employees in another branch." });
      }
      const log2 = await storage5.createAdjustmentLog({
        employeeId,
        loggedBy,
        branchId,
        // Guaranteed non-null from employee record
        startDate: new Date(date),
        endDate: new Date(date),
        type,
        value: numValue.toString(),
        remarks: remarks || null,
        status: "pending"
      });
      const manager = await storage5.getUser(loggedBy);
      const typeLabels = {
        overtime: "Overtime",
        late: "Tardiness",
        undertime: "Undertime",
        absent: "Absent",
        rest_day_ot: "Rest Day OT",
        special_holiday_ot: "Special Holiday OT",
        regular_holiday_ot: "Regular Holiday OT",
        night_diff: "Night Differential"
      };
      const valueUnit = type === "late" || type === "undertime" ? "mins" : "hrs";
      await storage5.createNotification({
        userId: employeeId,
        type: "adjustment",
        title: "Exception Log Recorded",
        message: `${manager?.firstName || "Manager"} logged ${typeLabels[type] || type}: ${value} ${valueUnit} for ${new Date(date).toLocaleDateString("en-PH")}. Please verify.`,
        data: JSON.stringify({ adjustmentLogId: log2.id })
      });
      res.json({ log: log2 });
    } catch (error) {
      console.error("Create adjustment log error:", error);
      res.status(500).json({ message: error.message || "Failed to create adjustment log" });
    }
  }));
  app2.get("/api/adjustment-logs/branch", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const { startDate, endDate } = req.query;
      const logs = await storage5.getAdjustmentLogsByBranch(
        branchId,
        startDate ? new Date(startDate) : void 0,
        endDate ? new Date(endDate) : void 0
      );
      const enriched = await Promise.all(logs.map(async (log2) => {
        const employee = await storage5.getUser(log2.employeeId);
        const logger = await storage5.getUser(log2.loggedBy);
        return {
          ...log2,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown",
          loggedByName: logger ? `${logger.firstName} ${logger.lastName}` : "Unknown"
        };
      }));
      res.json({ logs: enriched });
    } catch (error) {
      if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
        return res.json({ logs: [] });
      }
      res.status(500).json({ message: error.message || "Failed to get adjustment logs" });
    }
  }));
  app2.get("/api/adjustment-logs/mine", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const logs = await storage5.getAdjustmentLogsByEmployee(userId);
      res.json({ logs });
    } catch (error) {
      if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
        return res.json({ logs: [] });
      }
      res.status(500).json({ message: error.message || "Failed to get adjustment logs" });
    }
  }));
  app2.post("/api/adjustment-logs/request", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate, type, value, remarks } = req.body;
      if (!startDate || !endDate || !type || !value) {
        return res.status(400).json({ message: "Missing required fields: startDate, endDate, type, value" });
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return res.status(400).json({ message: "Value must be a positive number." });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start.getTime() > end.getTime()) {
        return res.status(400).json({ message: "Start date cannot be after end date." });
      }
      const log2 = await storage5.createAdjustmentLog({
        employeeId: userId,
        branchId: req.user.branchId,
        loggedBy: userId,
        startDate: start,
        endDate: end,
        type,
        value: numValue.toString(),
        remarks: remarks || "",
        status: "pending"
        // Manager needs to approve
      });
      res.status(201).json(log2);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to submit exception request" });
    }
  }));
  app2.put("/api/adjustment-logs/:id/verify", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      if (log2.employeeId !== userId) return res.status(403).json({ message: "Not authorized" });
      const updated = await storage5.updateAdjustmentLog(id, {
        status: "employee_verified",
        verifiedByEmployee: true,
        verifiedAt: /* @__PURE__ */ new Date()
      });
      const employee = await storage5.getUser(userId);
      await storage5.createNotification({
        userId: log2.loggedBy,
        type: "adjustment",
        title: "Exception Log Confirmed",
        message: `${employee?.firstName || "Employee"} ${employee?.lastName || ""} confirmed your ${log2.type} log for ${log2.startDate ? new Date(log2.startDate).toLocaleDateString("en-PH") : "N/A"}.`,
        data: JSON.stringify({ adjustmentLogId: id })
      });
      res.json({ log: updated });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to verify adjustment log" });
    }
  }));
  app2.put("/api/adjustment-logs/:id/approve", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const approvedBy = req.user.id;
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      if (log2.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      if (log2.employeeId === approvedBy && req.user.role !== "admin") {
        return res.status(403).json({ message: "Conflict of Interest: You cannot approve your own exception logs." });
      }
      const updated = await storage5.updateAdjustmentLog(id, {
        status: "approved",
        approvedBy,
        approvedAt: /* @__PURE__ */ new Date()
      });
      if (!updated) return res.status(404).json({ message: "Adjustment log not found" });
      res.json({ log: updated });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to approve adjustment log" });
    }
  }));
  app2.put("/api/adjustment-logs/:id/reject", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      if (log2.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      const updated = await storage5.updateAdjustmentLog(id, {
        status: "rejected",
        rejectionReason: req.body.reason || null
      });
      if (!updated) return res.status(404).json({ message: "Adjustment log not found" });
      res.json({ log: updated });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to reject adjustment log" });
    }
  }));
  app2.delete("/api/adjustment-logs/:id", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      if (log2.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      await storage5.deleteAdjustmentLog(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to delete adjustment log" });
    }
  }));
  app2.put("/api/adjustment-logs/:id", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      if (log2.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      const { type, value, remarks } = req.body;
      const updated = await storage5.updateAdjustmentLog(id, { type, value, remarks });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to update adjustment log" });
    }
  }));
  app2.put("/api/adjustment-logs/:id/toggle-included", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      if (log2.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      const newValue = !(log2.isIncluded ?? true);
      const updated = await storage5.updateAdjustmentLog(id, {
        isIncluded: newValue
      });
      res.json({ log: updated });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to toggle adjustment log inclusion" });
    }
  }));
  app2.put("/api/adjustment-logs/:id/dispute", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;
      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "Dispute reason is required" });
      }
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      if (log2.employeeId !== userId) return res.status(403).json({ message: "Not authorized" });
      const updated = await storage5.updateAdjustmentLog(id, {
        status: "disputed",
        disputeReason: reason.trim(),
        disputedAt: /* @__PURE__ */ new Date(),
        isIncluded: false
        // Auto-exclude disputed logs from payroll
      });
      const employee = await storage5.getUser(userId);
      await storage5.createNotification({
        userId: log2.loggedBy,
        type: "adjustment",
        title: "Exception Log Disputed",
        message: `${employee?.firstName || "Employee"} ${employee?.lastName || ""} disputed your ${log2.type} log: "${reason.trim()}"`,
        data: JSON.stringify({ adjustmentLogId: id })
      });
      const { adjustmentLogComments: adjustmentLogComments2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: routeDb } = await Promise.resolve().then(() => (init_db(), db_exports));
      await routeDb.insert(adjustmentLogComments2).values({
        id: crypto3.randomUUID(),
        adjustmentLogId: id,
        userId,
        message: `\u26A0\uFE0F Disputed: ${reason.trim()}`
      });
      res.json({ log: updated });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to dispute adjustment log" });
    }
  }));
  app2.get("/api/adjustment-logs/:id/comments", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      const userId = req.user.id;
      const isOwner = log2.employeeId === userId;
      const isManager = (req.user.role === "manager" || req.user.role === "admin") && log2.branchId === req.user.branchId;
      if (!isOwner && !isManager) return res.status(403).json({ message: "Not authorized" });
      const { adjustmentLogComments: adjustmentLogComments2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: routeDb } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { eq: drizzleEq } = await import("drizzle-orm");
      const comments = await routeDb.select().from(adjustmentLogComments2).where(drizzleEq(adjustmentLogComments2.adjustmentLogId, id)).orderBy(adjustmentLogComments2.createdAt);
      const enriched = await Promise.all(comments.map(async (c) => {
        const user = await storage5.getUser(c.userId);
        return {
          ...c,
          userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          userRole: user?.role || "employee"
        };
      }));
      res.json({ comments: enriched });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to get comments" });
    }
  }));
  app2.post("/api/adjustment-logs/:id/comments", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Comment message is required" });
      }
      const log2 = await storage5.getAdjustmentLog(id);
      if (!log2) return res.status(404).json({ message: "Adjustment log not found" });
      const isOwner = log2.employeeId === userId;
      const isManager = (req.user.role === "manager" || req.user.role === "admin") && log2.branchId === req.user.branchId;
      if (!isOwner && !isManager) return res.status(403).json({ message: "Not authorized" });
      const { adjustmentLogComments: adjustmentLogComments2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { db: routeDb } = await Promise.resolve().then(() => (init_db(), db_exports));
      const comment = await routeDb.insert(adjustmentLogComments2).values({
        id: crypto3.randomUUID(),
        adjustmentLogId: id,
        userId,
        message: message.trim()
      }).returning();
      const sender = await storage5.getUser(userId);
      const senderName = `${sender?.firstName || "Someone"} ${sender?.lastName || ""}`.trim();
      const recipientId = isOwner ? log2.loggedBy : log2.employeeId;
      await storage5.createNotification({
        userId: recipientId,
        type: "adjustment",
        title: "New Comment on Exception Log",
        message: `${senderName} commented: "${message.trim().substring(0, 80)}${message.length > 80 ? "..." : ""}"`,
        data: JSON.stringify({ adjustmentLogId: id })
      });
      const user = await storage5.getUser(userId);
      res.json({
        comment: {
          ...comment[0],
          userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          userRole: user?.role || "employee"
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to post comment" });
    }
  }));
  app2.get("/api/dashboard/stats/manager", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const now = /* @__PURE__ */ new Date();
      const startTimeMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endTimeMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const [allShifts, allApprovals, allUsers] = await Promise.all([
        storage5.getShiftsByBranch(branchId, startTimeMonth, endTimeMonth),
        storage5.getPendingApprovals(branchId),
        storage5.getUsersByBranch(branchId)
      ]);
      const userMap = new Map(allUsers.map((user) => [user.id, user]));
      const allTimeOffRequests = [];
      for (const user of allUsers) {
        const userRequests = await storage5.getTimeOffRequestsByUser(user.id);
        allTimeOffRequests.push(
          ...userRequests.map((request) => ({
            ...request,
            employeeName: `${user.firstName} ${user.lastName}`,
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              position: user.position,
              photoUrl: user.photoUrl,
              isActive: user.isActive
            }
          }))
        );
      }
      const sortedTimeOffRequests = allTimeOffRequests.sort((a, b) => {
        const left = new Date(a.requestedAt || 0).getTime();
        const right = new Date(b.requestedAt || 0).getTime();
        return right - left;
      });
      const shiftsWithProfiles = allShifts.map((shift) => {
        const user = userMap.get(shift.userId);
        return {
          ...shift,
          user: user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            position: user.position,
            photoUrl: user.photoUrl,
            isActive: user.isActive
          } : null
        };
      }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      const { startOfWeek: startOfWeek3, endOfWeek: endOfWeek3, startOfMonth: startOfMonth2, endOfMonth: endOfMonth2 } = await import("date-fns");
      const { filterCompletedShifts: filterCompletedShifts2, calculateHoursFromShifts: calculateHoursFromShifts2 } = await Promise.resolve().then(() => (init_hours(), hours_exports));
      const weekStart = startOfWeek3(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek3(now, { weekStartsOn: 1 });
      const weekShifts = allShifts.filter((s) => new Date(s.startTime) >= weekStart && new Date(s.startTime) <= weekEnd);
      const weekHours = calculateHoursFromShifts2(weekShifts);
      const monthStart = startOfMonth2(now);
      const monthEnd = endOfMonth2(now);
      const monthShifts = allShifts.filter((s) => new Date(s.startTime) >= monthStart && new Date(s.startTime) <= monthEnd);
      const monthHours = calculateHoursFromShifts2(monthShifts);
      const activeEmployees = allUsers.filter((e) => e.isActive && (e.role === "employee" || e.role === "manager"));
      res.json({
        approvals: allApprovals,
        timeOffRequests: sortedTimeOffRequests.filter((req2) => new Date(req2.startDate) >= new Date(now.getFullYear(), 0, 1)),
        // Filter past 1 year to avoid massive payload
        shifts: shiftsWithProfiles.filter((s) => s.user?.isActive !== false),
        teamHours: {
          thisWeek: Number(weekHours.toFixed(2)),
          thisMonth: Number(monthHours.toFixed(2)),
          employeeCount: activeEmployees.length,
          weekShifts: filterCompletedShifts2(weekShifts).length,
          monthShifts: filterCompletedShifts2(monthShifts).length
        }
      });
    } catch (error) {
      console.error("Error in /api/dashboard/stats/manager:", error);
      res.status(500).json({ message: error.message || "Failed to fetch dashboard stats" });
    }
  }));
  app2.get("/api/deduction-settings", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const rows = await db.select().from(deductionSettings).where(eq7(deductionSettings.branchId, branchId)).limit(1);
      if (rows.length === 0) {
        return res.json({ settings: { deductSSS: true, deductPhilHealth: true, deductPagibig: true, deductWithholdingTax: true } });
      }
      res.json({ settings: rows[0] });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch deduction settings" });
    }
  }));
  app2.put("/api/deduction-settings", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const { deductSSS, deductPhilHealth, deductPagibig, deductWithholdingTax } = req.body;
      const existing = await db.select().from(deductionSettings).where(eq7(deductionSettings.branchId, branchId)).limit(1);
      if (existing.length === 0) {
        await db.insert(deductionSettings).values({
          id: crypto3.randomUUID(),
          branchId,
          deductSSS: deductSSS ?? true,
          deductPhilHealth: deductPhilHealth ?? true,
          deductPagibig: deductPagibig ?? true,
          deductWithholdingTax: deductWithholdingTax ?? true,
          updatedAt: /* @__PURE__ */ new Date()
        });
      } else {
        await db.update(deductionSettings).set({
          deductSSS: deductSSS ?? true,
          deductPhilHealth: deductPhilHealth ?? true,
          deductPagibig: deductPagibig ?? true,
          deductWithholdingTax: deductWithholdingTax ?? true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq7(deductionSettings.branchId, branchId));
      }
      const updated = await db.select().from(deductionSettings).where(eq7(deductionSettings.branchId, branchId)).limit(1);
      res.json({ settings: updated[0] });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to update deduction settings" });
    }
  }));
  app2.get("/api/payroll", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const entries = await storage5.getPayrollEntriesByUser(userId);
      const enriched = await Promise.all(
        entries.map(async (entry) => {
          try {
            const period = await storage5.getPayrollPeriod(entry.payrollPeriodId);
            return {
              ...entry,
              periodStartDate: period?.startDate ?? null,
              periodEndDate: period?.endDate ?? null,
              paidAt: entry.paidAt ?? null
            };
          } catch {
            return { ...entry, periodStartDate: null, periodEndDate: null };
          }
        })
      );
      res.json({ entries: enriched });
    } catch (error) {
      console.error("Get payroll error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch payroll entries" });
    }
  }));
  app2.get("/api/payroll/periods", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const periods = await storage5.getPayrollPeriodsByBranch(branchId);
      res.json({ periods });
    } catch (error) {
      console.error("Get payroll periods error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch payroll periods" });
    }
  }));
  app2.get("/api/payroll/periods/current", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const period = await storage5.getCurrentPayrollPeriod(branchId);
      res.json({ period });
    } catch (error) {
      console.error("Get current payroll period error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch current payroll period" });
    }
  }));
  app2.post("/api/payroll/periods", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { startDate, endDate, payDate } = req.body;
      const branchId = req.user.branchId;
      if (!startDate || !endDate || !payDate) {
        return res.status(400).json({ message: "Start date, end date, and pay date are required" });
      }
      const parsedStart = new Date(startDate);
      const parsedEnd = new Date(endDate);
      const parsedPayDate = new Date(payDate);
      if (parsedEnd <= parsedStart) {
        return res.status(400).json({ message: "End date must be after start date" });
      }
      const existingPeriods = await storage5.getPayrollPeriodsByBranch(branchId);
      const sortedPeriods = [...existingPeriods].sort(
        (a, b) => new Date(b.payDate || b.endDate).getTime() - new Date(a.payDate || a.endDate).getTime()
      );
      const lastPeriod = sortedPeriods[0];
      if (lastPeriod) {
        const lastPayDate = new Date(lastPeriod.payDate || lastPeriod.endDate);
        const msPerDay = 1e3 * 60 * 60 * 24;
        const gapDays = Math.ceil((parsedPayDate.getTime() - lastPayDate.getTime()) / msPerDay);
        if (gapDays > 16) {
          return res.status(400).json({
            message: `DOLE Violation: Maximum interval between successive pay dates cannot exceed 16 days. Gap is ${gapDays} days from previous period's pay date.`
          });
        }
      }
      const hasOverlap = existingPeriods.some((p) => {
        const pStart = new Date(p.startDate);
        const pEnd = new Date(p.endDate);
        return parsedStart < pEnd && parsedEnd > pStart;
      });
      if (hasOverlap) {
        return res.status(400).json({ message: "This period overlaps with an existing payroll period" });
      }
      const period = await storage5.createPayrollPeriod({
        branchId,
        startDate: parsedStart,
        endDate: parsedEnd,
        payDate: parsedPayDate,
        status: "open"
      });
      res.json({ period });
      realTimeManager.broadcastPayrollPeriodCreated(period);
    } catch (error) {
      console.error("Create payroll period error:", error);
      res.status(500).json({
        message: error.message || "Failed to create payroll period"
      });
    }
  }));
  app2.delete("/api/payroll/periods/:id", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const branchId = req.user.branchId;
      const period = await storage5.getPayrollPeriod(id);
      if (!period) {
        return res.status(404).json({ message: "Payroll period not found" });
      }
      if (period.branchId !== branchId) {
        return res.status(403).json({ message: "Access denied to this payroll period" });
      }
      if (period.status !== "open") {
        return res.status(400).json({ message: "Only open payroll periods can be deleted" });
      }
      const entries = await storage5.getPayrollEntriesByPeriod(id);
      for (const entry of entries) {
        await storage5.deletePayrollEntry(entry.id);
      }
      await storage5.deletePayrollPeriod(id);
      res.json({ message: "Payroll period deleted successfully" });
    } catch (error) {
      console.error("Delete payroll period error:", error);
      res.status(500).json({ message: error.message || "Failed to delete payroll period" });
    }
  }));
  app2.post("/api/payroll/periods/:id/process", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const createdEntryIds = [];
    try {
      const { id } = req.params;
      const branchId = req.user.branchId;
      const period = await storage5.getPayrollPeriod(id);
      if (!period) {
        return res.status(404).json({ message: "Payroll period not found" });
      }
      if (period.status !== "open") {
        return res.status(400).json({ message: "Payroll period is not open" });
      }
      if (period.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Cannot process payroll for another branch" });
      }
      const existingEntries = await storage5.getPayrollEntriesByPeriod(id);
      for (const entry of existingEntries) {
        await storage5.deletePayrollEntry(entry.id);
      }
      const employees = await storage5.getUsersByBranch(branchId);
      const payrollEntries2 = [];
      let totalHours = 0;
      let totalPay = 0;
      const periodHolidays = await storage5.getHolidays(
        new Date(period.startDate),
        new Date(period.endDate)
      );
      const dsRows = await db.select().from(deductionSettings).where(eq7(deductionSettings.branchId, branchId)).limit(1);
      const branchDeductionSettings = dsRows[0] || {
        deductSSS: true,
        deductPhilHealth: true,
        deductPagibig: true,
        deductWithholdingTax: true
      };
      const companySettings2 = await storage5.getCompanySettings();
      const globalHolidayPayEnabled = companySettings2 ? companySettings2.includeHolidayPay : false;
      const activeHeadcount = employees.filter((e) => e.isActive).length;
      const branchRecord = await storage5.getBranch(branchId);
      const isBranchExempt = !!(branchRecord?.intentHolidayExempt && ["retail", "service"].includes(branchRecord?.establishmentType || "") && activeHeadcount <= 5);
      const isHolidayExempt = !globalHolidayPayEnabled || isBranchExempt;
      for (const employee of employees) {
        if (!employee.isActive) continue;
        if (!employee.tin || !employee.sssNumber || !employee.philhealthNumber || !employee.pagibigNumber || employee.tin === "\u2014" || employee.sssNumber === "\u2014") {
          console.warn(`[PAYROLL WARNING] ${employee.firstName} ${employee.lastName} is missing government IDs, but processing payroll to prevent DOLE violation.`);
        }
        const shifts2 = await storage5.getShiftsByUser(
          employee.id,
          new Date(period.startDate),
          new Date(period.endDate)
        );
        const timeOffRequests2 = await storage5.getTimeOffRequestsByUser(employee.id);
        const approvedLeaves = timeOffRequests2.filter(
          (req2) => req2.status === "approved" && ["vacation", "sick", "personal"].includes(req2.type) && new Date(req2.startDate) <= new Date(period.endDate) && new Date(req2.endDate) >= new Date(period.startDate)
        );
        if (shifts2.length === 0 && approvedLeaves.length === 0) continue;
        const hourlyRate = parseFloat(employee.hourlyRate);
        if (isNaN(hourlyRate) || hourlyRate <= 0) {
          console.warn(`[PAYROLL SKIP] ${employee.firstName} ${employee.lastName} \u2014 invalid hourlyRate "${employee.hourlyRate}", skipping.`);
          continue;
        }
        const payCalculation = calculatePeriodPay(shifts2, hourlyRate, periodHolidays, 0, isHolidayExempt);
        let paidLeaveHours = 0;
        let paidLeavePay = 0;
        for (const leave of approvedLeaves) {
          const leaveStart = new Date(Math.max(new Date(leave.startDate).getTime(), new Date(period.startDate).getTime()));
          const leaveEnd = new Date(Math.min(new Date(leave.endDate).getTime(), new Date(period.endDate).getTime()));
          if (leaveStart <= leaveEnd) {
            const daysCount = Math.floor((leaveEnd.getTime() - leaveStart.getTime()) / (24 * 60 * 60 * 1e3)) + 1;
            paidLeaveHours += daysCount * 8;
          }
        }
        paidLeavePay = paidLeaveHours * hourlyRate;
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
        let basicPay = payCalculation.basicPay + paidLeavePay;
        let overtimePay = payCalculation.overtimePay;
        let holidayPay = payCalculation.holidayPay;
        let nightDiffPay = payCalculation.nightDiffPay;
        let restDayPay = payCalculation.restDayPay;
        let grossPay = payCalculation.totalGrossPay + paidLeavePay;
        const employeeAdjustments = await storage5.getAdjustmentLogsByEmployee(
          employee.id,
          new Date(period.startDate),
          new Date(period.endDate)
        );
        let lateDeduction = 0;
        let totalLateMinutes = 0;
        let undertimeDeduction = 0;
        for (const adj of employeeAdjustments) {
          if (adj.status !== "approved" && adj.status !== "employee_verified") continue;
          if (adj.isIncluded === false) continue;
          const adjValue = parseFloat(adj.value);
          if (isNaN(adjValue) || adjValue <= 0) continue;
          let calcAmount = 0;
          switch (adj.type) {
            case "overtime":
              calcAmount = hourlyRate * HOLIDAY_RATES.normal.overtime * adjValue;
              overtimePay += calcAmount;
              overtimeHours += adjValue;
              break;
            case "rest_day_ot":
              calcAmount = hourlyRate * HOLIDAY_RATES.normal.restDayOT * adjValue;
              overtimePay += calcAmount;
              overtimeHours += adjValue;
              break;
            case "special_holiday_ot":
              calcAmount = hourlyRate * HOLIDAY_RATES.special_non_working.overtime * adjValue;
              overtimePay += calcAmount;
              overtimeHours += adjValue;
              break;
            case "regular_holiday_ot":
              calcAmount = hourlyRate * HOLIDAY_RATES.regular.overtime * adjValue;
              overtimePay += calcAmount;
              overtimeHours += adjValue;
              break;
            case "night_diff":
              calcAmount = hourlyRate * NIGHT_DIFF_RATE * adjValue;
              nightDiffPay += calcAmount;
              nightDiffHours += adjValue;
              break;
            case "late":
              calcAmount = hourlyRate / MINS_PER_HOUR * adjValue;
              lateDeduction += calcAmount;
              totalLateMinutes += adjValue;
              break;
            case "undertime":
              calcAmount = hourlyRate / MINS_PER_HOUR * adjValue;
              undertimeDeduction += calcAmount;
              break;
            case "absent":
              calcAmount = hourlyRate * DAILY_REGULAR_HOURS * adjValue;
              lateDeduction += calcAmount;
              break;
          }
          const isDeduction = ["late", "undertime", "absent"].includes(adj.type);
          await storage5.updateAdjustmentLog(adj.id, {
            calculatedAmount: (isDeduction ? -calcAmount : calcAmount).toFixed(2),
            payrollPeriodId: id
          });
          if (!isDeduction) {
            grossPay += calcAmount;
          }
        }
        const periodStartDate = new Date(period.startDate);
        const periodEndDate = new Date(period.endDate);
        const daysInPeriod = Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (24 * 60 * 60 * 1e3)) + 1;
        const monthlyBasicSalary = hourlyRate * MONTHLY_WORKING_HOURS;
        const { calculateAllDeductions: calculateAllDeductions2, calculateWithholdingTax: calculateWithholdingTax2 } = await Promise.resolve().then(() => (init_deductions(), deductions_exports));
        const isSemiMonthly = daysInPeriod < 28;
        const mandatorySettings = {
          deductSSS: branchDeductionSettings.deductSSS ?? true,
          deductPhilHealth: branchDeductionSettings.deductPhilHealth ?? true,
          deductPagibig: branchDeductionSettings.deductPagibig ?? true,
          deductWithholdingTax: false
          // Tax computed separately below using branchDeductionSettings
        };
        const mandatoryBreakdown = await calculateAllDeductions2(monthlyBasicSalary, mandatorySettings);
        const periodFraction = isSemiMonthly ? 0.5 : 1;
        const sssContribution = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
        const philHealthContribution = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
        const pagibigContribution = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;
        const { workerAllowances: workerAllowances2, allowanceTypes: allowanceTypes2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8, and: and4 } = await import("drizzle-orm");
        const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        let totalAllowanceAmount = 0;
        let taxableAllowanceExcess = 0;
        const empAllowances = await db2.select({
          amount: workerAllowances2.amount,
          ceiling: allowanceTypes2.ceilingValue,
          isDeMinimis: allowanceTypes2.isDeMinimis
        }).from(workerAllowances2).innerJoin(allowanceTypes2, eq8(workerAllowances2.allowanceTypeId, allowanceTypes2.id)).where(and4(eq8(workerAllowances2.userId, employee.id), eq8(workerAllowances2.isActive, true)));
        for (const al of empAllowances) {
          const periodAllowance = Math.round(parseFloat(al.amount) * periodFraction * 100) / 100;
          const periodCeiling = al.ceiling ? Math.round(parseFloat(al.ceiling) * periodFraction * 100) / 100 : null;
          totalAllowanceAmount += periodAllowance;
          if (al.isDeMinimis) {
            if (periodCeiling !== null && periodAllowance > periodCeiling) {
              taxableAllowanceExcess += periodAllowance - periodCeiling;
            }
          } else {
            taxableAllowanceExcess += periodAllowance;
          }
        }
        const monthlyMandatory = mandatoryBreakdown.sssContribution + mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
        const periodTaxableEarnings = basicPay + overtimePay + holidayPay + nightDiffPay + restDayPay - lateDeduction - undertimeDeduction;
        let monthlyTaxableIncome = Math.max(0, periodTaxableEarnings / periodFraction - monthlyMandatory);
        if (taxableAllowanceExcess > 0) {
          monthlyTaxableIncome += taxableAllowanceExcess / periodFraction;
        }
        const monthlyTax = await calculateWithholdingTax2(monthlyTaxableIncome);
        const withholdingTax = Math.round(monthlyTax * periodFraction * 100) / 100;
        grossPay += totalAllowanceAmount;
        const activeLoans = await storage5.getActiveApprovedLoans(employee.id, new Date(period.endDate));
        let sssLoan = 0;
        let pagibigLoan = 0;
        const { db: payrollDb } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { loanRequests: loanReqSchema } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: drizzleEq } = await import("drizzle-orm");
        for (const loan of activeLoans) {
          let deduction = Math.round(parseFloat(loan.monthlyAmortization) * periodFraction * 100) / 100;
          const remaining = parseFloat(loan.remainingBalance || "0");
          if (deduction > remaining && remaining > 0) {
            deduction = remaining;
          }
          if (loan.loanType === "SSS") {
            sssLoan += deduction;
          } else if (loan.loanType === "Pag-IBIG") {
            pagibigLoan += deduction;
          }
          if (deduction > 0) {
            const newBalance = Math.max(0, remaining - deduction);
            const newStatus = newBalance <= 0.01 ? "completed" : loan.status;
            await payrollDb.update(loanReqSchema).set({ remainingBalance: newBalance.toFixed(2), status: newStatus }).where(drizzleEq(loanReqSchema.id, loan.id));
          }
        }
        const advances = parseFloat(employee.cashAdvanceDeduction || "0");
        const otherDeductions = parseFloat(employee.otherDeductions || "0") + lateDeduction + undertimeDeduction;
        const mweWithholdingTax = !branchDeductionSettings.deductWithholdingTax || employee.isMwe ? 0 : withholdingTax;
        const totalDeductions = sssContribution + philHealthContribution + pagibigContribution + mweWithholdingTax + sssLoan + pagibigLoan + advances + otherDeductions;
        const netPay = Math.max(0, grossPay - totalDeductions);
        const entry = await storage5.createPayrollEntry({
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
          deductions: totalDeductions.toString(),
          // For backward compatibility
          netPay: netPay.toString(),
          status: "pending"
        });
        try {
          const periodYear = new Date(period.startDate).getFullYear();
          await db2.insert(thirteenthMonthLedger).values({
            id: crypto3.randomUUID(),
            userId: employee.id,
            branchId,
            payrollPeriodId: id,
            year: periodYear,
            basicPayEarned: basicPay.toFixed(2),
            periodStartDate: new Date(period.startDate),
            periodEndDate: new Date(period.endDate),
            createdAt: /* @__PURE__ */ new Date()
          });
        } catch (ledgerErr) {
          console.warn("13th month ledger insert skipped (table may not exist yet):", ledgerErr.message);
        }
        payrollEntries2.push(entry);
        createdEntryIds.push(entry.id);
        totalHours += employeeTotalHours;
        totalPay += grossPay;
        const notification = await storage5.createNotification({
          userId: employee.id,
          type: "payroll",
          title: "Payroll Slip Available",
          message: `Your payroll slip for ${format4(new Date(period.startDate), "MMM d")} - ${format4(new Date(period.endDate), "MMM d, yyyy")} is now available. Net Pay: \u20B1${netPay.toFixed(2)}`,
          data: JSON.stringify({
            entryId: entry.id,
            periodId: id,
            netPay: netPay.toFixed(2)
          })
        });
        realTimeManager.broadcastNotification(notification);
      }
      await storage5.updatePayrollPeriod(id, {
        status: "closed",
        totalHours: totalHours.toString(),
        totalPay: totalPay.toString()
      });
      for (const entry of payrollEntries2) {
        await storage5.updatePayrollEntry(entry.id, { status: "paid", paidAt: /* @__PURE__ */ new Date() });
      }
      res.json({
        message: `Payroll processed successfully for ${payrollEntries2.length} employees`,
        entriesCreated: payrollEntries2.length,
        totalHours: totalHours.toFixed(2),
        totalPay: totalPay.toFixed(2)
      });
      await createAuditLog({
        action: "payroll_process",
        entityType: "payroll_period",
        entityId: id,
        userId: req.user.id,
        newValues: { entriesCreated: payrollEntries2.length, totalHours: totalHours.toFixed(2), totalPay: totalPay.toFixed(2) },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      realTimeManager.broadcastPayrollProcessed(id, {
        entriesCreated: payrollEntries2.length,
        totalHours,
        totalPay
      }, req.user.branchId);
    } catch (error) {
      console.error("Process payroll error:", error);
      if (createdEntryIds.length > 0) {
        for (const entryId of createdEntryIds) {
          try {
            await storage5.deletePayrollEntry(entryId);
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
  app2.get("/api/payroll/entries/branch", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const { periodId } = req.query;
      const allEmployees = await storage5.getUsersByBranch(branchId);
      const employees = allEmployees.filter((emp) => emp.isActive);
      let allEntries = [];
      const periodCache = {};
      for (const employee of employees) {
        const entries = await storage5.getPayrollEntriesByUser(
          employee.id,
          periodId
        );
        const entriesWithUser = await Promise.all(entries.map(async (entry) => {
          let periodStartDate = null;
          let periodEndDate = null;
          try {
            if (periodCache[entry.payrollPeriodId] === void 0) {
              const period = await storage5.getPayrollPeriod(entry.payrollPeriodId);
              periodCache[entry.payrollPeriodId] = period ? { startDate: period.startDate, endDate: period.endDate } : null;
            }
            const cachedPeriod = periodCache[entry.payrollPeriodId];
            if (cachedPeriod) {
              periodStartDate = cachedPeriod.startDate;
              periodEndDate = cachedPeriod.endDate;
            }
          } catch (err) {
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
      allEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ entries: allEntries });
    } catch (error) {
      console.error("Get branch payroll entries error:", error);
      res.status(500).json({
        message: error.message || "Failed to get payroll entries"
      });
    }
  }));
  app2.put("/api/payroll/entries/:id/approve", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage5.getPayrollEntry(id);
      if (!existing) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }
      const employee = await storage5.getUser(existing.userId);
      if (!employee || employee.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      const entry = await storage5.updatePayrollEntry(id, { status: "approved" });
      res.json({ entry });
      await createAuditLog({
        action: "payroll_approve",
        entityType: "payroll_entry",
        entityId: id,
        userId: req.user.id,
        newValues: { status: "approved" },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      realTimeManager.broadcastPayrollEntryUpdated(id, "approved", entry);
    } catch (error) {
      console.error("Approve payroll entry error:", error);
      res.status(500).json({
        message: error.message || "Failed to approve payroll entry"
      });
    }
  }));
  app2.put("/api/payroll/entries/:id/paid", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await storage5.getPayrollEntry(id);
      if (!existing) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }
      const employee = await storage5.getUser(existing.userId);
      if (!employee || employee.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      const entry = await storage5.updatePayrollEntry(id, { status: "paid", paidAt: /* @__PURE__ */ new Date() });
      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }
      res.json({ entry });
      await createAuditLog({
        action: "payroll_paid",
        entityType: "payroll_entry",
        entityId: id,
        userId: req.user.id,
        newValues: { status: "paid" },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      realTimeManager.broadcastPayrollEntryUpdated(id, "paid", entry);
    } catch (error) {
      console.error("Mark payroll as paid error:", error);
      res.status(500).json({
        message: error.message || "Failed to mark payroll as paid"
      });
    }
  }));
  app2.get("/api/payroll/payslip/:entryId", requireAuth10, asyncHandler(async (req, res) => {
    const { entryId } = req.params;
    const userId = req.user.id;
    const entry = await storage5.getPayrollEntry(entryId);
    if (!entry) {
      return res.status(404).json({ message: "Payroll entry not found" });
    }
    if (entry.userId !== userId && req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Unauthorized access to payroll entry" });
    }
    const employeeUser = await storage5.getUser(entry.userId);
    if (!employeeUser) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const user = employeeUser;
    let breakdown = null;
    try {
      if (entry.payBreakdown) {
        breakdown = JSON.parse(entry.payBreakdown);
      }
    } catch (e) {
    }
    let periodStart = null;
    let periodEnd = null;
    let payDate = null;
    let includedExceptions = [];
    try {
      const { payrollPeriods: payrollPeriods2, adjustmentLogs: adjustmentLogs2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq8, and: and4, gte: gte3, lte: lte3, inArray } = await import("drizzle-orm");
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const periods = await db2.select().from(payrollPeriods2).where(eq8(payrollPeriods2.id, entry.payrollPeriodId)).limit(1);
      if (periods.length > 0) {
        const period = periods[0];
        periodStart = period.startDate instanceof Date ? period.startDate.toISOString() : String(period.startDate);
        periodEnd = period.endDate instanceof Date ? period.endDate.toISOString() : String(period.endDate);
        payDate = period.payDate ? period.payDate instanceof Date ? period.payDate.toISOString() : String(period.payDate) : null;
        const logs = await db2.select().from(adjustmentLogs2).where(
          and4(
            eq8(adjustmentLogs2.employeeId, entry.userId),
            gte3(adjustmentLogs2.startDate, new Date(periodStart)),
            lte3(adjustmentLogs2.startDate, new Date(periodEnd)),
            inArray(adjustmentLogs2.status, ["employee_verified", "approved"])
          )
        );
        includedExceptions = logs;
      }
    } catch (e) {
      console.error("[Payslip] Error fetching payroll period or exceptions:", e);
    }
    const company = await storage5.getCompanySettings();
    const companyAddress = [
      company?.address,
      company?.city,
      company?.province,
      company?.zipCode
    ].filter(Boolean).join(", ");
    const payslipData = {
      employeeName: `${user.firstName} ${user.lastName}`,
      employeeId: user.id,
      position: user.position,
      department: "Operations",
      period: entry.createdAt,
      periodStart,
      periodEnd,
      payDate,
      regularHours: entry.regularHours,
      overtimeHours: entry.overtimeHours,
      nightDiffHours: entry.nightDiffHours || 0,
      totalHours: entry.totalHours,
      hourlyRate: user.hourlyRate,
      // Pay breakdown
      basicPay: entry.basicPay || entry.grossPay,
      holidayPay: entry.holidayPay || 0,
      overtimePay: entry.overtimePay || 0,
      nightDifferential: entry.nightDiffPay || 0,
      nightDiffPay: entry.nightDiffPay || 0,
      restDayPay: entry.restDayPay || 0,
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
      breakdown,
      companyName: company?.name || company?.tradeName || "The Caf\xE9",
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
      includedExceptions
    };
    res.json({ payslip: payslipData });
  }));
  app2.post("/api/payroll/entries/:entryId/send", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { entryId } = req.params;
      const branchId = req.user.branchId;
      const entry = await storage5.getPayrollEntry(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }
      const employee = await storage5.getUser(entry.userId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (employee.branchId !== branchId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const notification = await storage5.createNotification({
        userId: entry.userId,
        type: "payroll",
        title: "Payslip Sent",
        message: `Your payslip has been sent by your manager. Net Pay: \u20B1${parseFloat(entry.netPay).toFixed(2)}`,
        data: JSON.stringify({
          entryId: entry.id,
          netPay: entry.netPay
        })
      });
      realTimeManager.broadcastNotification(notification);
      res.json({
        message: "Payslip sent to employee successfully"
      });
      realTimeManager.broadcastPayrollSent(entry.id, entry.userId, entry.netPay, req.user.branchId);
    } catch (error) {
      console.error("Send payslip error:", error);
      res.status(500).json({
        message: error.message || "Failed to send payslip"
      });
    }
  }));
  app2.use("/api/holidays", holidays_default);
  app2.get("/api/payroll/archived", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const archivedPeriods = await storage5.getArchivedPayrollPeriods(branchId);
      res.json({ archivedPeriods });
    } catch (error) {
      console.error("Get archived payroll error:", error);
      res.status(500).json({ message: error.message || "Failed to get archived payroll" });
    }
  }));
  app2.post("/api/payroll/periods/:id/archive", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const period = await storage5.getPayrollPeriod(id);
      if (!period) {
        return res.status(404).json({ message: "Payroll period not found" });
      }
      if (period.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Cannot archive payroll for another branch" });
      }
      const entries = await storage5.getPayrollEntriesByPeriod(id);
      const entriesSnapshot = JSON.stringify(entries);
      const archived = await storage5.archivePayrollPeriod(id, userId, entriesSnapshot);
      res.json({
        message: "Payroll period archived successfully",
        archived
      });
    } catch (error) {
      console.error("Archive payroll error:", error);
      res.status(500).json({ message: error.message || "Failed to archive payroll period" });
    }
  }));
  app2.get("/api/payroll/archived/:id", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const archived = await storage5.getArchivedPayrollPeriod(id);
      if (!archived) {
        return res.status(404).json({ message: "Archived period not found" });
      }
      const entries = JSON.parse(archived.entriesSnapshot || "[]");
      res.json({
        archived,
        entries
      });
    } catch (error) {
      console.error("Get archived period error:", error);
      res.status(500).json({ message: error.message || "Failed to get archived period" });
    }
  }));
  app2.get("/api/shift-trades", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const branchId = req.user.branchId;
      const myTrades = await storage5.getShiftTradesByUser(userId);
      const openTrades = await storage5.getAvailableShiftTrades(branchId);
      let managerTrades = [];
      if (req.user.role === "manager" || req.user.role === "admin") {
        managerTrades = await storage5.getPendingShiftTrades(branchId);
      }
      const tradeMap = /* @__PURE__ */ new Map();
      [...myTrades, ...openTrades, ...managerTrades].forEach((trade) => {
        tradeMap.set(trade.id, trade);
      });
      const allTrades = Array.from(tradeMap.values());
      const shiftIds = [...new Set(allTrades.map((t) => t.shiftId))];
      const userIds = [...new Set(allTrades.flatMap((t) => [t.fromUserId, t.toUserId].filter(Boolean)))];
      const [shifts2, users2] = await Promise.all([
        Promise.all(shiftIds.map((sid) => storage5.getShift(sid))),
        Promise.all(userIds.map((uid) => storage5.getUser(uid)))
      ]);
      const shiftMap2 = new Map(shifts2.filter(Boolean).map((s) => [s.id, s]));
      const userMap = new Map(users2.filter(Boolean).map((u) => [u.id, u]));
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
            date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
            startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
            endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null
          } : null,
          requester: requester ? {
            firstName: requester.firstName || "",
            lastName: requester.lastName || ""
          } : null,
          targetUser: targetUser ? {
            firstName: targetUser.firstName || "",
            lastName: targetUser.lastName || ""
          } : null,
          createdAt: trade.requestedAt ?? /* @__PURE__ */ new Date()
        };
      });
      res.json({ trades: enrichedTrades });
    } catch (error) {
      console.error("Get shift trades error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch shift trades" });
    }
  }));
  app2.get("/api/shift-trades/available", requireAuth10, asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const userId = req.user.id;
    const trades = await storage5.getAvailableShiftTrades(branchId);
    const filteredTrades = trades.filter(
      (t) => (t.toUserId === null || t.toUserId === userId) && t.fromUserId !== userId
    );
    const tradesWithDetails = await Promise.all(
      filteredTrades.map(async (trade) => {
        const shift = await storage5.getShift(trade.shiftId);
        const requesterUser = await storage5.getUser(trade.fromUserId);
        return {
          ...trade,
          // Add aliased properties for frontend compatibility
          requesterId: trade.fromUserId,
          targetUserId: trade.toUserId || "",
          shift: shift ? {
            ...shift,
            date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
            startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
            endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null
          } : null,
          // Use consistent property names
          requester: requesterUser ? {
            firstName: requesterUser.firstName || "",
            lastName: requesterUser.lastName || ""
          } : null,
          targetUser: null,
          // Available trades have no target yet
          fromUser: requesterUser ? { id: requesterUser.id, firstName: requesterUser.firstName, lastName: requesterUser.lastName, role: requesterUser.role } : null
        };
      })
    );
    res.json({ trades: tradesWithDetails });
  }));
  app2.get("/api/shift-trades/pending", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const trades = await storage5.getPendingShiftTrades(branchId);
    const tradesWithDetails = await Promise.all(
      trades.map(async (trade) => {
        const shift = await storage5.getShift(trade.shiftId);
        const requesterUser = await storage5.getUser(trade.fromUserId);
        const targetUserData = trade.toUserId ? await storage5.getUser(trade.toUserId) : null;
        return {
          ...trade,
          // Add aliased properties for frontend compatibility
          requesterId: trade.fromUserId,
          targetUserId: trade.toUserId || "",
          shift: shift ? {
            ...shift,
            date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
            startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
            endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null
          } : null,
          // Use consistent property names
          requester: requesterUser ? {
            firstName: requesterUser.firstName || "",
            lastName: requesterUser.lastName || ""
          } : null,
          targetUser: targetUserData ? {
            firstName: targetUserData.firstName || "",
            lastName: targetUserData.lastName || ""
          } : null,
          // Legacy compatibility
          fromUser: requesterUser ? { id: requesterUser.id, firstName: requesterUser.firstName, lastName: requesterUser.lastName, role: requesterUser.role } : null,
          toUser: targetUserData ? { id: targetUserData.id, firstName: targetUserData.firstName, lastName: targetUserData.lastName, role: targetUserData.role } : null
        };
      })
    );
    res.json({ trades: tradesWithDetails });
  }));
  app2.post("/api/shift-trades", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const tradeData = insertShiftTradeSchema.parse(req.body);
      const shift = await storage5.getShift(tradeData.shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      if (new Date(shift.startTime) <= /* @__PURE__ */ new Date()) {
        return res.status(400).json({ message: "Cannot trade a shift that has already started or ended" });
      }
      let fromUserId = req.user.id;
      if (req.user.role === "manager" || req.user.role === "admin") {
        fromUserId = shift.userId;
      } else {
        if (shift.userId !== req.user.id) {
          return res.status(403).json({ message: "You can only trade your own shifts" });
        }
      }
      if (tradeData.toUserId) {
        const overlappingShift = await storage5.checkShiftOverlap(
          tradeData.toUserId,
          new Date(shift.startTime),
          new Date(shift.endTime)
        );
        if (overlappingShift) {
          return res.status(409).json({ message: "The target employee already has an overlapping shift during this time" });
        }
      }
      const trade = await storage5.createShiftTrade({
        ...tradeData,
        fromUserId
      });
      const enrichedTrade = {
        ...trade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position
        } : null
      };
      const requester = await storage5.getUser(fromUserId);
      const requesterName = requester ? `${requester.firstName} ${requester.lastName}` : "An employee";
      const shiftDate = shift?.startTime ? format4(new Date(shift.startTime), "MMM d") : "a shift";
      const branchUsers = await storage5.getUsersByBranch(req.user.branchId);
      const notifiedUserIds = /* @__PURE__ */ new Set();
      if (trade.toUserId) {
        const notification = await storage5.createNotification({
          userId: trade.toUserId,
          type: "trade_request",
          title: "Direct Shift Trade Request",
          message: `${requesterName} wants to trade their ${shiftDate} shift with you.`,
          data: JSON.stringify({
            shiftDate,
            requesterName,
            tradeType: "direct"
          })
        });
        realTimeManager.broadcastNotification(notification);
        notifiedUserIds.add(trade.toUserId);
      } else {
        for (const user of branchUsers) {
          if (user.id === fromUserId) continue;
          const notification = await storage5.createNotification({
            userId: user.id,
            type: "shift_trade",
            title: "New Shift Available",
            message: `${requesterName} posted a ${shiftDate} shift for trade.`,
            data: JSON.stringify({
              shiftDate,
              requesterName,
              tradeType: "open"
            })
          });
          realTimeManager.broadcastNotification(notification);
          notifiedUserIds.add(user.id);
        }
      }
      const managers = branchUsers.filter((u) => u.role === "manager" || u.role === "admin");
      for (const manager of managers) {
        if (manager.id === req.user.id || notifiedUserIds.has(manager.id)) continue;
        const notificationManager = await storage5.createNotification({
          userId: manager.id,
          type: "trade_request",
          title: "New Shift Trade Posted",
          message: `${requesterName} has posted a shift trade for ${shiftDate}.`,
          data: JSON.stringify({
            shiftDate,
            requesterName,
            tradeType: trade.toUserId ? "direct" : "open"
          })
        });
        realTimeManager.broadcastNotification(notificationManager);
      }
      realTimeManager.broadcastTradeCreated(enrichedTrade, shift);
      res.json({ trade: enrichedTrade });
    } catch (error) {
      console.error("Create trade error:", error);
      res.status(400).json({ message: error.message || "Invalid trade data" });
    }
  }));
  app2.patch("/api/shift-trades/:id", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      const trade = await storage5.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      const tradeShift = await storage5.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      const validStatuses = ["accepted", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'rejected'" });
      }
      if (trade.status !== "pending") {
        return res.status(400).json({ message: `Cannot ${status} a trade that is already ${trade.status}` });
      }
      if (trade.fromUserId === userId && status === "accepted") {
        return res.status(400).json({ message: "You cannot accept your own trade request" });
      }
      if (trade.toUserId && trade.toUserId !== userId) {
        return res.status(403).json({ message: "You cannot respond to this trade" });
      }
      const updateData = { status };
      if (!trade.toUserId && (status === "accepted" || status === "pending")) {
        updateData.toUserId = userId;
      }
      const updatedTrade = await storage5.updateShiftTrade(id, updateData);
      const shift = await storage5.getShift(trade.shiftId);
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position
        } : null
      };
      if (status === "accepted") {
        realTimeManager.broadcastTradeAccepted(id, enrichedTrade, shift);
      } else if (status === "rejected") {
        realTimeManager.broadcastTradeRejected(id, enrichedTrade, void 0, req.user.branchId);
      } else {
        realTimeManager.broadcastTradeStatusChanged(id, status, enrichedTrade, req.user.branchId);
      }
      res.json({ trade: enrichedTrade });
    } catch (error) {
      console.error("Respond to trade error:", error);
      res.status(500).json({ message: error.message || "Failed to respond to trade" });
    }
  }));
  app2.patch("/api/shift-trades/:id/approve", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const managerId = req.user.id;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const trade = await storage5.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      const tradeShift = await storage5.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      if (trade.status === "approved" || trade.status === "rejected") {
        return res.status(409).json({ message: `Trade has already been ${trade.status}` });
      }
      if (status === "approved" && !trade.toUserId) {
        return res.status(400).json({ message: "Cannot approve trade without a target user" });
      }
      if (status === "approved") {
        await storage5.updateShift(trade.shiftId, {
          userId: trade.toUserId
        });
      }
      const updatedTrade = await storage5.updateShiftTrade(id, {
        status,
        approvedBy: managerId,
        approvedAt: /* @__PURE__ */ new Date()
      });
      const shift = await storage5.getShift(trade.shiftId);
      const shiftDate = shift?.startTime ? format4(new Date(shift.startTime), "MMM d") : "a shift";
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position
        } : null
      };
      const fromUser = await storage5.getUser(trade.fromUserId);
      const toUser = trade.toUserId ? await storage5.getUser(trade.toUserId) : null;
      const fromName = fromUser ? `${fromUser.firstName} ${fromUser.lastName}` : "An employee";
      const toName = toUser ? `${toUser.firstName} ${toUser.lastName}` : "another employee";
      const manager = await storage5.getUser(managerId);
      const managerName = manager ? `${manager.firstName} ${manager.lastName}` : "A manager";
      if (status === "approved") {
        const nReq = await storage5.createNotification({
          userId: trade.fromUserId,
          type: "shift_trade",
          title: "Shift Trade Approved \u2705",
          message: `Great news! Your trade for the ${shiftDate} shift has been approved by ${managerName}. ${toName} will now cover this shift.`,
          data: JSON.stringify({ shiftDate, status: "approved" })
        });
        realTimeManager.broadcastNotification(nReq);
        if (trade.toUserId) {
          const nTarget = await storage5.createNotification({
            userId: trade.toUserId,
            type: "shift_trade",
            title: "New Shift Assigned",
            message: `You've been assigned ${fromName}'s ${shiftDate} shift from an approved trade.`,
            data: JSON.stringify({ shiftDate, status: "approved" })
          });
          realTimeManager.broadcastNotification(nTarget);
        }
        realTimeManager.broadcastTradeApproved(id, enrichedTrade, shift);
        await createAuditLog({
          action: "trade_approve",
          entityType: "shift_trade",
          entityId: id,
          userId: managerId,
          newValues: { status: "approved", fromUserId: trade.fromUserId, toUserId: trade.toUserId, shiftId: trade.shiftId },
          ipAddress: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers["user-agent"]
        });
      } else {
        const nReq = await storage5.createNotification({
          userId: trade.fromUserId,
          type: "shift_trade",
          title: "Shift Trade Rejected",
          message: `Your shift trade request for ${shiftDate} was not approved by ${managerName}. Your original shift remains unchanged.`,
          data: JSON.stringify({ shiftDate, status: "rejected" })
        });
        realTimeManager.broadcastNotification(nReq);
        if (trade.toUserId) {
          const nTarget = await storage5.createNotification({
            userId: trade.toUserId,
            type: "shift_trade",
            title: "Trade Request Declined",
            message: `The shift trade for ${shiftDate} with ${fromName} was not approved. No changes to your schedule.`,
            data: JSON.stringify({ shiftDate, status: "rejected" })
          });
          realTimeManager.broadcastNotification(nTarget);
        }
        await createAuditLog({
          action: "trade_reject",
          entityType: "shift_trade",
          entityId: id,
          userId: managerId,
          newValues: { status: "rejected", fromUserId: trade.fromUserId, toUserId: trade.toUserId, shiftId: trade.shiftId },
          ipAddress: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers["user-agent"]
        });
      }
      const action = status === "approved" ? "\u2705 approved" : "\u274C rejected";
      res.json({ trade: enrichedTrade });
    } catch (error) {
      console.error("Manager approve trade error:", error);
      res.status(500).json({ message: error.message || "Failed to process trade" });
    }
  }));
  app2.put("/api/shift-trades/:id/take", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const trade = await storage5.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      const tradeShift = await storage5.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      if (trade.toUserId && trade.toUserId !== userId) {
        return res.status(403).json({ message: "This trade is reserved for another employee" });
      }
      if (trade.status !== "pending" && trade.status !== "open") {
        return res.status(409).json({ message: `Trade has already been ${trade.status}` });
      }
      if (trade.fromUserId === userId) {
        return res.status(400).json({ message: "You cannot take your own trade" });
      }
      const overlappingShift = await storage5.checkShiftOverlap(
        userId,
        new Date(tradeShift.startTime),
        new Date(tradeShift.endTime)
      );
      if (overlappingShift) {
        return res.status(409).json({ message: "You already have an overlapping shift during this time" });
      }
      const updatedTrade = await storage5.updateShiftTrade(id, {
        toUserId: userId,
        status: "pending"
        // Still needs manager approval
      });
      const shift = await storage5.getShift(trade.shiftId);
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position
        } : null
      };
      const taker = await storage5.getUser(userId);
      const takerName = taker ? `${taker.firstName} ${taker.lastName}` : "Another employee";
      const shiftDate = shift?.startTime ? format4(new Date(shift.startTime), "MMM d") : "a shift";
      const notificationRequester = await storage5.createNotification({
        userId: trade.fromUserId,
        type: "shift_trade",
        title: "Shift Trade Taken",
        message: `${takerName} has accepted your ${shiftDate} shift trade. It is now pending manager approval.`,
        data: JSON.stringify({
          shiftDate,
          takerName,
          status: "taken"
        })
      });
      realTimeManager.broadcastNotification(notificationRequester);
      const branchUsers = await storage5.getUsersByBranch(req.user.branchId);
      const managers = branchUsers.filter((u) => u.role === "manager" || u.role === "admin");
      for (const manager of managers) {
        const notificationManager = await storage5.createNotification({
          userId: manager.id,
          type: "trade_request",
          title: "Shift Trade Awaiting Approval",
          message: `${takerName} has taken a shift trade from another employee. Please review it.`,
          data: JSON.stringify({
            shiftDate,
            takerName,
            status: "pending_approval"
          })
        });
        realTimeManager.broadcastNotification(notificationManager);
      }
      realTimeManager.broadcastTradeStatusChanged(id, "pending", enrichedTrade, req.user.branchId);
      res.json({ trade: enrichedTrade });
    } catch (error) {
      console.error("Take shift trade error:", error);
      res.status(500).json({ message: error.message || "Failed to take shift" });
    }
  }));
  app2.put("/api/shift-trades/:id/approve", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const managerId = req.user.id;
      const trade = await storage5.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      const tradeShift = await storage5.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      if (trade.status === "approved" || trade.status === "rejected") {
        return res.status(409).json({ message: `Trade has already been ${trade.status}` });
      }
      if (!trade.toUserId) {
        return res.status(400).json({ message: "Cannot approve trade without a target user" });
      }
      const overlappingShift = await storage5.checkShiftOverlap(
        trade.toUserId,
        new Date(tradeShift.startTime),
        new Date(tradeShift.endTime)
      );
      if (overlappingShift) {
        return res.status(409).json({ message: "Approval failed: The target employee now has an overlapping shift" });
      }
      await storage5.updateShift(trade.shiftId, {
        userId: trade.toUserId
      });
      const updatedTrade = await storage5.updateShiftTrade(id, {
        status: "approved",
        approvedBy: managerId,
        approvedAt: /* @__PURE__ */ new Date()
      });
      const shift = await storage5.getShift(trade.shiftId);
      const shiftDate = shift?.startTime ? format4(new Date(shift.startTime), "MMM d") : "a shift";
      const notificationRequester = await storage5.createNotification({
        userId: trade.fromUserId,
        type: "shift_trade",
        title: "Shift Trade Approved \u2705",
        message: `Great news! Your trade for the ${shiftDate} shift has been approved.`,
        data: JSON.stringify({
          shiftDate,
          status: "approved"
        })
      });
      realTimeManager.broadcastNotification(notificationRequester);
      const notificationTarget = await storage5.createNotification({
        userId: trade.toUserId,
        type: "shift_trade",
        title: "New Shift Assigned",
        message: `You've been assigned a new shift on ${shiftDate} from an approved trade.`,
        data: JSON.stringify({
          shiftDate,
          status: "approved"
        })
      });
      realTimeManager.broadcastNotification(notificationTarget);
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position
        } : null
      };
      realTimeManager.broadcastTradeApproved(id, enrichedTrade, shift);
      await createAuditLog({
        action: "trade_approve",
        entityType: "shift_trade",
        entityId: id,
        userId: managerId,
        newValues: { status: "approved", fromUserId: trade.fromUserId, toUserId: trade.toUserId, shiftId: trade.shiftId },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ trade: enrichedTrade });
    } catch (error) {
      console.error("Approve trade error:", error);
      res.status(500).json({ message: error.message || "Failed to approve trade" });
    }
  }));
  app2.put("/api/shift-trades/:id/reject", requireAuth10, requireRole3(["manager", "admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const managerId = req.user.id;
      const trade = await storage5.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      const tradeShift = await storage5.getShift(trade.shiftId);
      if (!tradeShift || tradeShift.branchId !== req.user.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      const updatedTrade = await storage5.updateShiftTrade(id, {
        status: "rejected",
        approvedBy: managerId,
        approvedAt: /* @__PURE__ */ new Date()
      });
      const shift = await storage5.getShift(trade.shiftId);
      const shiftDate = shift?.startTime ? format4(new Date(shift.startTime), "MMM d") : "a shift";
      const notificationRequester = await storage5.createNotification({
        userId: trade.fromUserId,
        type: "shift_trade",
        title: "Shift Trade Rejected",
        message: `Your shift trade request for ${shiftDate} was not approved. Your original shift remains unchanged.`,
        data: JSON.stringify({
          shiftDate,
          status: "rejected"
        })
      });
      realTimeManager.broadcastNotification(notificationRequester);
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position
        } : null
      };
      await createAuditLog({
        action: "trade_reject",
        entityType: "shift_trade",
        entityId: id,
        userId: managerId,
        newValues: { status: "rejected", fromUserId: trade.fromUserId, toUserId: trade.toUserId, shiftId: trade.shiftId },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ trade: enrichedTrade });
    } catch (error) {
      console.error("Reject trade error:", error);
      res.status(500).json({ message: error.message || "Failed to reject trade" });
    }
  }));
  app2.delete("/api/shift-trades/:id", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const trade = await storage5.getShiftTrade(id);
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }
      if (trade.fromUserId !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "You cannot delete this trade" });
      }
      if (trade.status !== "pending") {
        return res.status(400).json({ message: "Can only cancel pending trades" });
      }
      const updatedTrade = await storage5.updateShiftTrade(id, {
        status: "rejected"
      });
      if (trade.toUserId) {
        const notificationTarget = await storage5.createNotification({
          userId: trade.toUserId,
          type: "schedule",
          title: "Shift Trade Cancelled",
          message: "A shift trade request has been cancelled.",
          data: JSON.stringify({ tradeId: id })
        });
        realTimeManager.broadcastNotification(notificationTarget);
      }
      const shift = await storage5.getShift(trade.shiftId);
      const enrichedTrade = {
        ...updatedTrade,
        shift: shift ? {
          date: shift.startTime ? new Date(shift.startTime).toISOString().split("T")[0] : null,
          startTime: shift.startTime ? new Date(shift.startTime).toISOString() : null,
          endTime: shift.endTime ? new Date(shift.endTime).toISOString() : null,
          position: shift.position
        } : null
      };
      res.json({
        message: "Trade cancelled successfully",
        trade: enrichedTrade
      });
    } catch (error) {
      console.error("Delete shift trade error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel trade" });
    }
  }));
  app2.get("/api/admin/deduction-rates", requireAuth10, requireRole3(["admin"]), asyncHandler(async (req, res) => {
    try {
      const rates = await storage5.getAllDeductionRates();
      res.json({ rates });
    } catch (error) {
      console.error("Get deduction rates error:", error);
      res.status(500).json({ message: error.message || "Failed to get deduction rates" });
    }
  }));
  app2.post("/api/admin/deduction-rates", requireAuth10, requireRole3(["admin"]), asyncHandler(async (req, res) => {
    try {
      const { type, minSalary, maxSalary, employeeRate, employeeContribution, description } = req.body;
      const rate = await storage5.createDeductionRate({
        type,
        minSalary,
        maxSalary: maxSalary || null,
        employeeRate: employeeRate || null,
        employeeContribution: employeeContribution || null,
        description: description || null,
        isActive: true
      });
      await createAuditLog({
        action: "rate_create",
        entityType: "deduction_rate",
        entityId: rate.id,
        userId: req.user.id,
        newValues: { type, minSalary, maxSalary, employeeRate, employeeContribution },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ rate });
    } catch (error) {
      console.error("Create deduction rate error:", error);
      res.status(500).json({ message: error.message || "Failed to create deduction rate" });
    }
  }));
  app2.put("/api/admin/deduction-rates/:id", requireAuth10, requireRole3(["admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { type, minSalary, maxSalary, employeeRate, employeeContribution, description } = req.body;
      const rate = await storage5.updateDeductionRate(id, {
        type,
        minSalary,
        maxSalary: maxSalary || null,
        employeeRate: employeeRate || null,
        employeeContribution: employeeContribution || null,
        description: description || null
      });
      if (!rate) {
        return res.status(404).json({ message: "Deduction rate not found" });
      }
      await createAuditLog({
        action: "rate_update",
        entityType: "deduction_rate",
        entityId: id,
        userId: req.user.id,
        newValues: { type, minSalary, maxSalary, employeeRate, employeeContribution },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ rate });
    } catch (error) {
      console.error("Update deduction rate error:", error);
      res.status(500).json({ message: error.message || "Failed to update deduction rate" });
    }
  }));
  app2.delete("/api/admin/deduction-rates/:id", requireAuth10, requireRole3(["admin"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage5.deleteDeductionRate(id);
      if (!success) {
        return res.status(404).json({ message: "Deduction rate not found" });
      }
      await createAuditLog({
        action: "rate_delete",
        entityType: "deduction_rate",
        entityId: id,
        userId: req.user.id,
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ message: "Deduction rate deleted successfully" });
    } catch (error) {
      console.error("Delete deduction rate error:", error);
      res.status(500).json({ message: error.message || "Failed to delete deduction rate" });
    }
  }));
  app2.get("/api/deduction-settings", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      let settings = await storage5.getDeductionSettings(branchId);
      if (!settings) {
        settings = await storage5.createDeductionSettings({
          branchId,
          deductSSS: true,
          deductPhilHealth: false,
          deductPagibig: false,
          deductWithholdingTax: false
        });
      }
      res.json({ settings });
    } catch (error) {
      console.error("Get deduction settings error:", error);
      res.status(500).json({ message: error.message || "Failed to get deduction settings" });
    }
  }));
  app2.put("/api/deduction-settings/:id", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { deductSSS, deductPhilHealth, deductPagibig, deductWithholdingTax } = req.body;
      const settings = await storage5.updateDeductionSettings(id, {
        deductSSS,
        deductPhilHealth,
        deductPagibig,
        deductWithholdingTax
      });
      if (!settings) {
        return res.status(404).json({ message: "Deduction settings not found" });
      }
      await createAuditLog({
        action: "settings_update",
        entityType: "deduction_settings",
        entityId: id,
        userId: req.user.id,
        newValues: { deductSSS, deductPhilHealth, deductPagibig, deductWithholdingTax },
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"]
      });
      res.json({ settings });
    } catch (error) {
      console.error("Update deduction settings error:", error);
      res.status(500).json({ message: error.message || "Failed to update deduction settings" });
    }
  }));
  app2.get("/api/approvals", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const approvals3 = await storage5.getPendingApprovals(branchId);
    const approvalsWithUsers = await Promise.all(
      approvals3.map(async (approval) => {
        const requestedBy = await storage5.getUser(approval.requestedBy);
        return { ...approval, requestedBy };
      })
    );
    res.json({ approvals: approvalsWithUsers });
  }));
  app2.put("/api/approvals/:id", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const approval = await storage5.updateApproval(id, {
      status,
      reason,
      approvedBy: req.user.id
    });
    if (!approval) {
      return res.status(404).json({ message: "Approval not found" });
    }
    res.json({ approval });
  }));
  registerBranchesRoutes(app2);
  app2.get("/api/reports/payroll", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const users2 = await storage5.getUsersByBranch(branchId);
    const allPeriods = await storage5.getPayrollPeriodsByBranch(branchId);
    const periodMap = new Map(allPeriods.map((p) => [p.id, p]));
    let totalPayroll = 0;
    for (const user of users2) {
      const entries = await storage5.getPayrollEntriesByUser(user.id);
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
  app2.get("/api/reports/attendance", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const users2 = await storage5.getUsersByBranch(branchId);
    let totalHours = 0;
    for (const user of users2) {
      const shifts2 = await storage5.getShiftsByUser(user.id, monthStart, monthEnd);
      for (const shift of shifts2) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1e3 * 60 * 60);
        totalHours += hours;
      }
    }
    res.json({ totalHours: Number(totalHours.toFixed(2)) });
  }));
  app2.get("/api/reports/shifts", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const now = /* @__PURE__ */ new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const shifts2 = await storage5.getShiftsByBranch(branchId, monthStart, monthEnd);
    res.json({
      totalShifts: shifts2.length,
      completedShifts: shifts2.filter((s) => s.status === "completed").length,
      missedShifts: shifts2.filter((s) => s.status === "missed").length,
      cancelledShifts: shifts2.filter((s) => s.status === "cancelled").length
    });
  }));
  app2.get("/api/reports/employees", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const users2 = await storage5.getUsersByBranch(branchId);
    res.json({
      activeCount: users2.filter((u) => u.isActive).length,
      totalCount: users2.length,
      inactiveCount: users2.filter((u) => !u.isActive).length
    });
  }));
  app2.get("/api/dashboard/stats", requireAuth10, requireRole3(["manager"]), apiCache(60), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const now = /* @__PURE__ */ new Date();
    const phtOffset = 8 * 60 * 60 * 1e3;
    const phtNow = new Date(now.getTime() + phtOffset);
    const todayUTC = new Date(Date.UTC(phtNow.getUTCFullYear(), phtNow.getUTCMonth(), phtNow.getUTCDate()));
    const today = new Date(todayUTC.getTime() - phtOffset);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1e3);
    const todayShifts = await storage5.getShiftsByBranch(branchId, today, tomorrow);
    const clockedIn = todayShifts.filter((shift) => shift.status === "in-progress").length;
    const onBreak = 0;
    const late = todayShifts.filter((shift) => {
      const scheduledStart = new Date(shift.startTime);
      const actualStart = shift.actualStartTime ? new Date(shift.actualStartTime) : null;
      if (!actualStart) return false;
      const diffMinutes = (actualStart.getTime() - scheduledStart.getTime()) / (1e3 * 60);
      return diffMinutes > 15;
    }).length;
    const branchUsers = await storage5.getUsersByBranch(branchId);
    const userMap = new Map(branchUsers.map((u) => [u.id, u]));
    const completedShifts = todayShifts.filter((shift) => shift.status === "completed");
    let revenue = 0;
    for (const shift of completedShifts) {
      const user = userMap.get(shift.userId);
      if (user) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1e3 * 60 * 60);
        const rate = parseFloat(user.hourlyRate);
        revenue += hours * (isNaN(rate) ? 0 : rate) * 3;
      }
    }
    const totalEmployees = branchUsers.length;
    const scheduledToday = todayShifts.length;
    const pendingTrades = await storage5.getPendingShiftTrades(branchId);
    const allTimeOffRequests = await Promise.all(
      branchUsers.map((u) => storage5.getTimeOffRequestsByUser(u.id))
    );
    const pendingTimeOffCount = allTimeOffRequests.flat().filter((r) => r.status === "pending").length;
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
  app2.get("/api/dashboard/employee-status", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const branchId = req.user.branchId;
    const now = /* @__PURE__ */ new Date();
    const phtOffset = 8 * 60 * 60 * 1e3;
    const phtNow = new Date(now.getTime() + phtOffset);
    const todayUTC = new Date(Date.UTC(phtNow.getUTCFullYear(), phtNow.getUTCMonth(), phtNow.getUTCDate()));
    const today = new Date(todayUTC.getTime() - phtOffset);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1e3);
    const allEmployees = await storage5.getUsersByBranch(branchId);
    const employees = allEmployees.filter((user) => user.isActive);
    const todayShifts = await storage5.getShiftsByBranch(branchId, today, tomorrow);
    const employeeStatus = await Promise.all(
      employees.map(async (user) => {
        const todayShift = todayShifts.find((shift) => shift.userId === user.id);
        let status = "Off Duty";
        let statusInfo = "";
        if (todayShift) {
          if (todayShift.status === "in-progress") {
            status = "Active";
            statusInfo = todayShift.actualStartTime ? `Since ${format4(new Date(todayShift.actualStartTime), "h:mm a")}` : `Scheduled ${format4(new Date(todayShift.startTime), "h:mm a")}`;
          } else if (todayShift.status === "completed") {
            status = "Completed";
            const start = todayShift.actualStartTime ? format4(new Date(todayShift.actualStartTime), "h:mm a") : format4(new Date(todayShift.startTime), "h:mm a");
            const end = todayShift.actualEndTime ? format4(new Date(todayShift.actualEndTime), "h:mm a") : format4(new Date(todayShift.endTime), "h:mm a");
            statusInfo = `Worked ${start} - ${end}`;
          } else if (todayShift.status === "scheduled") {
            status = "Scheduled";
            statusInfo = `${format4(new Date(todayShift.startTime), "h:mm a")} - ${format4(new Date(todayShift.endTime), "h:mm a")}`;
          }
        }
        return {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            position: user.position
          },
          status,
          statusInfo
        };
      })
    );
    res.json({ employeeStatus });
  }));
  app2.get("/api/time-off-requests", requireAuth10, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const branchId = req.user.branchId;
    let requests;
    if (userRole === "manager" || userRole === "admin") {
      const employees = await storage5.getUsersByBranch(branchId);
      const employeeIds = employees.map((emp) => emp.id);
      const allRequests = await Promise.all(
        employeeIds.map((empId) => storage5.getTimeOffRequestsByUser(empId))
      );
      requests = allRequests.flat();
      requests.sort((a, b) => new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime());
    } else {
      requests = await storage5.getTimeOffRequestsByUser(userId);
    }
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const user = await storage5.getUser(request.userId);
        return { ...request, user };
      })
    );
    res.json({ requests: requestsWithUsers });
  }));
  app2.get("/api/employee/performance", requireAuth10, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await storage5.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const monthlyData = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      const shifts2 = await storage5.getShiftsByUser(userId, monthStart, monthEnd);
      let hours = 0;
      for (const shift of shifts2) {
        const shiftHours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1e3 * 60 * 60);
        hours += shiftHours;
      }
      const rate = parseFloat(user.hourlyRate);
      const sales = hours * (isNaN(rate) ? 0 : rate) * 3;
      monthlyData.push({
        name: monthDate.toLocaleDateString("en-US", { month: "short" }),
        hours: Number(hours.toFixed(2)),
        sales: Number(sales.toFixed(2))
      });
    }
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const currentMonthShifts = await storage5.getShiftsByUser(userId, currentMonthStart, currentMonthEnd);
    let currentMonthHours = 0;
    for (const shift of currentMonthShifts) {
      const shiftHours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1e3 * 60 * 60);
      currentMonthHours += shiftHours;
    }
    const completedShifts = currentMonthShifts.filter((s) => s.status === "completed").length;
    const totalShifts = currentMonthShifts.length;
    const completionRate = totalShifts > 0 ? completedShifts / totalShifts * 100 : 0;
    res.json({
      monthlyData,
      currentMonth: {
        hours: Number(currentMonthHours.toFixed(2)),
        sales: Number((currentMonthHours * (isNaN(parseFloat(user.hourlyRate)) ? 0 : parseFloat(user.hourlyRate)) * 3).toFixed(2)),
        shiftsCompleted: completedShifts,
        totalShifts,
        completionRate: Number(completionRate.toFixed(1))
      }
    });
  }));
  app2.get("/api/time-off-balance", requireAuth10, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const requests = await storage5.getTimeOffRequestsByUser(userId);
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
    let vacationUsed = 0;
    let sickUsed = 0;
    let personalUsed = 0;
    for (const request of requests) {
      if (request.status === "approved") {
        const startDate = new Date(request.startDate);
        const endDate = new Date(request.endDate);
        if (startDate >= yearStart && startDate <= yearEnd) {
          const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          const days = Math.round((endDay.getTime() - startDay.getTime()) / (1e3 * 60 * 60 * 24)) + 1;
          if (request.type === "vacation") {
            vacationUsed += days;
          } else if (request.type === "sick") {
            sickUsed += days;
          } else if (request.type === "personal") {
            personalUsed += days;
          }
        }
      }
    }
    const vacationAllowance = 15;
    const sickAllowance = 10;
    const personalAllowance = 5;
    res.json({
      vacation: vacationAllowance - vacationUsed,
      sick: sickAllowance - sickUsed,
      personal: personalAllowance - personalUsed,
      used: {
        vacation: vacationUsed,
        sick: sickUsed,
        personal: personalUsed
      },
      allowance: {
        vacation: vacationAllowance,
        sick: sickAllowance,
        personal: personalAllowance
      }
    });
  }));
  app2.get("/api/time-off-policy", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      await storage5.initializeDefaultTimeOffPolicies(branchId);
      const policies = await storage5.getTimeOffPolicyByBranch(branchId);
      const policyMap = {};
      for (const policy of policies) {
        policyMap[policy.leaveType] = {
          minimumAdvanceDays: policy.minimumAdvanceDays,
          isActive: policy.isActive ?? true
        };
      }
      res.json({ policies: policyMap });
    } catch (error) {
      console.error("Error fetching time off policy:", error);
      res.status(500).json({ message: error.message || "Failed to fetch time off policy" });
    }
  }));
  app2.put("/api/time-off-policy", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    try {
      const branchId = req.user.branchId;
      const { leaveType, minimumAdvanceDays } = req.body;
      if (!leaveType || minimumAdvanceDays === void 0) {
        return res.status(400).json({ message: "leaveType and minimumAdvanceDays are required" });
      }
      if (typeof minimumAdvanceDays !== "number" || minimumAdvanceDays < 0) {
        return res.status(400).json({ message: "minimumAdvanceDays must be a non-negative number" });
      }
      if (["sick", "emergency"].includes(leaveType) && minimumAdvanceDays > 0) {
        return res.status(400).json({
          message: "Sick and Emergency leave must allow same-day requests (0 days notice) per Philippine cafe practices"
        });
      }
      const policy = await storage5.upsertTimeOffPolicy(branchId, leaveType, minimumAdvanceDays);
      res.json({ policy, message: `Policy updated: ${leaveType} now requires ${minimumAdvanceDays} days advance notice` });
    } catch (error) {
      console.error("Error updating time off policy:", error);
      res.status(500).json({ message: error.message || "Failed to update time off policy" });
    }
  }));
  app2.post("/api/time-off-requests", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error(`Invalid date format. Start: ${req.body.startDate}, End: ${req.body.endDate}`);
      }
      if (startDate.getTime() > endDate.getTime()) {
        return res.status(400).json({ message: "End date cannot be before start date" });
      }
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const startDateOnly = new Date(startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const advanceDays = Math.ceil((startDateOnly.getTime() - today.getTime()) / (1e3 * 60 * 60 * 24));
      const branchId = req.user.branchId;
      const leaveType = req.body.type;
      const inlineDefaults = {
        vacation: 7,
        sick: 0,
        emergency: 0,
        personal: 3,
        other: 3
      };
      await storage5.initializeDefaultTimeOffPolicies(branchId);
      const policy = await storage5.getTimeOffPolicyByType(branchId, leaveType);
      const minimumAdvanceDays = policy?.minimumAdvanceDays ?? inlineDefaults[leaveType] ?? 0;
      const shortNotice = advanceDays < minimumAdvanceDays && !["sick", "emergency"].includes(leaveType);
      const validTypes = ["vacation", "sick", "emergency", "personal", "other"];
      const leaveTypeValue = req.body.type;
      if (!leaveTypeValue || !validTypes.includes(leaveTypeValue)) {
        return res.status(400).json({ message: `Invalid type. Must be one of: ${validTypes.join(", ")}` });
      }
      if (!req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const requestPayload = {
        userId: req.user.id,
        startDate,
        endDate,
        type: leaveTypeValue,
        reason: req.body.reason || "",
        status: "pending"
      };
      const existingRequests = await storage5.getTimeOffRequestsByUser(req.user.id);
      const hasOverlap = existingRequests.some((r) => {
        if (r.status === "rejected") return false;
        const existStart = new Date(r.startDate).getTime();
        const existEnd = new Date(r.endDate).getTime();
        return startDate.getTime() <= existEnd && endDate.getTime() >= existStart;
      });
      if (hasOverlap) {
        return res.status(409).json({ message: "You already have a pending or approved time-off request overlapping these dates" });
      }
      const request = await storage5.createTimeOffRequest(requestPayload);
      const employee = await storage5.getUser(req.user.id);
      const branchUsers = await storage5.getUsersByBranch(req.user.branchId);
      const managers = branchUsers.filter((user) => user.role === "manager");
      const shortNoticeText = shortNotice ? ` \u26A0\uFE0F SHORT NOTICE (${advanceDays} days)` : "";
      for (const manager of managers) {
        const notification = await storage5.createNotification({
          userId: manager.id,
          type: "time_off",
          title: shortNotice ? "\u26A0\uFE0F Short Notice Time Off Request" : "New Time Off Request",
          message: `${employee?.firstName} ${employee?.lastName} has requested time off from ${format4(new Date(request.startDate), "MMM d")} to ${format4(new Date(request.endDate), "MMM d, yyyy")} (${requestPayload.type})${shortNoticeText}`,
          isRead: false,
          data: JSON.stringify({
            employeeName: `${employee?.firstName} ${employee?.lastName}`,
            type: requestPayload.type,
            startDate: format4(new Date(request.startDate), "MMM d, yyyy"),
            endDate: format4(new Date(request.endDate), "MMM d, yyyy"),
            advanceDays,
            status: "pending"
          })
        });
        realTimeManager.broadcastNotification(notification);
      }
      realTimeManager.broadcastTimeOffCreated(request, req.user.branchId);
      res.json({
        request,
        advanceDays,
        shortNotice,
        minimumAdvanceDays
      });
    } catch (error) {
      console.error("\u274C Time off request creation error:", error);
      if (error.errors) {
        console.error("\u274C Zod Validation Errors:", JSON.stringify(error.errors, null, 2));
        res.status(400).json({
          message: "Invalid time off request data: " + error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          errors: error.errors
        });
      } else {
        res.status(400).json({
          message: error.message || "Invalid time off request data"
        });
      }
    }
  }));
  app2.put("/api/time-off-requests/:id/approve", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await storage5.getTimeOffRequest(id);
    if (!existing) {
      return res.status(404).json({ message: "Time off request not found" });
    }
    if (existing.status !== "pending") {
      return res.status(409).json({ message: `Request has already been ${existing.status}` });
    }
    const employee = await storage5.getUser(existing.userId);
    if (!employee || employee.branchId !== req.user.branchId) {
      return res.status(403).json({ message: "Not authorized for this branch" });
    }
    const request = await storage5.updateTimeOffRequest(id, {
      status: "approved",
      approvedBy: req.user.id
    });
    if (!request) {
      return res.status(404).json({ message: "Time off request not found" });
    }
    try {
      const overlappingShifts = await storage5.getShiftsByUser(
        request.userId,
        new Date(request.startDate),
        new Date(request.endDate)
      );
      for (const shift of overlappingShifts) {
        if (shift.status === "scheduled") {
          await storage5.deleteShift(shift.id);
        }
      }
    } catch (clearError) {
      console.error("Failed to clear overlapping shifts:", clearError);
    }
    const startD = new Date(request.startDate);
    const endD = new Date(request.endDate);
    const daysToDeduct = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1e3 * 60 * 60 * 24)) + 1);
    let isPaid = false;
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { leaveCredits: leaveCredits2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq8, and: and4 } = await import("drizzle-orm");
      const specificBalance = await db2.select().from(leaveCredits2).where(
        and4(eq8(leaveCredits2.userId, request.userId), eq8(leaveCredits2.year, startD.getFullYear()), eq8(leaveCredits2.leaveType, request.type))
      ).limit(1);
      let deductedFrom = null;
      if (specificBalance[0] && parseFloat(specificBalance[0].remainingCredits) > 0) {
        deductedFrom = request.type;
      }
      if (deductedFrom) {
        await deductLeaveCredit(request.userId, employee.branchId, deductedFrom, daysToDeduct, startD.getFullYear());
        isPaid = true;
      }
    } catch (deductionErr) {
      console.error("Leave deduction error:", deductionErr);
    }
    await storage5.updateTimeOffRequest(id, { isPaid });
    try {
      const pendingApprovals = await storage5.getPendingApprovals(req.user.branchId);
      const relatedApproval = pendingApprovals.find((a) => a.requestId === id && a.type === "time_off");
      if (relatedApproval) {
        await storage5.updateApproval(relatedApproval.id, {
          status: "approved",
          approvedBy: req.user.id,
          reason: "Automatically approved via time-off request approval"
        });
      }
    } catch (syncError) {
      console.error("Failed to sync with approvals table:", syncError);
    }
    const notification = await storage5.createNotification({
      userId: request.userId,
      type: "time_off_approved",
      title: "Time Off Request Approved",
      message: `Your time off request from ${format4(new Date(request.startDate), "MMM d")} to ${format4(new Date(request.endDate), "MMM d, yyyy")} has been approved`,
      isRead: false,
      data: JSON.stringify({
        status: "approved",
        startDate: format4(new Date(request.startDate), "MMM d, yyyy"),
        endDate: format4(new Date(request.endDate), "MMM d, yyyy"),
        type: request.type
      })
    });
    realTimeManager.broadcastNotification(notification);
    realTimeManager.broadcastTimeOffApproved(request, req.user.branchId);
    await createAuditLog({
      action: "time_off_approve",
      entityType: "time_off_request",
      entityId: id,
      userId: req.user.id,
      newValues: { status: "approved", employeeId: request.userId, startDate: request.startDate, endDate: request.endDate, type: request.type },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"]
    });
    res.json({ request });
  }));
  app2.put("/api/time-off-requests/:id/reject", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const existing = await storage5.getTimeOffRequest(id);
    if (!existing) {
      return res.status(404).json({ message: "Time off request not found" });
    }
    if (existing.status !== "pending") {
      return res.status(409).json({ message: `Request has already been ${existing.status}` });
    }
    const employee = await storage5.getUser(existing.userId);
    if (!employee || employee.branchId !== req.user.branchId) {
      return res.status(403).json({ message: "Not authorized for this branch" });
    }
    const request = await storage5.updateTimeOffRequest(id, {
      status: "rejected",
      approvedBy: req.user.id,
      rejectionReason: rejectionReason || null
    });
    if (!request) {
      return res.status(404).json({ message: "Time off request not found" });
    }
    try {
      const pendingApprovals = await storage5.getPendingApprovals(req.user.branchId);
      const relatedApproval = pendingApprovals.find((a) => a.requestId === id && a.type === "time_off");
      if (relatedApproval) {
        await storage5.updateApproval(relatedApproval.id, {
          status: "rejected",
          approvedBy: req.user.id,
          reason: rejectionReason || "Rejected via time-off request"
        });
      }
    } catch (syncError) {
      console.error("Failed to sync with approvals table:", syncError);
    }
    const reasonNote = rejectionReason ? ` Reason: ${rejectionReason}` : "";
    const notification = await storage5.createNotification({
      userId: request.userId,
      type: "time_off_rejected",
      title: "Time Off Request Rejected",
      message: `Your time off request from ${format4(new Date(request.startDate), "MMM d")} to ${format4(new Date(request.endDate), "MMM d, yyyy")} has been rejected.${reasonNote}`,
      isRead: false,
      data: JSON.stringify({
        status: "rejected",
        startDate: format4(new Date(request.startDate), "MMM d, yyyy"),
        endDate: format4(new Date(request.endDate), "MMM d, yyyy"),
        type: request.type,
        rejectionReason: rejectionReason || null
      })
    });
    realTimeManager.broadcastNotification(notification);
    realTimeManager.broadcastTimeOffRejected(request, req.user.branchId);
    await createAuditLog({
      action: "time_off_reject",
      entityType: "time_off_request",
      entityId: id,
      userId: req.user.id,
      newValues: { status: "rejected", employeeId: request.userId, startDate: request.startDate, endDate: request.endDate, type: request.type, rejectionReason: rejectionReason || null },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"]
    });
    res.json({ request });
  }));
  app2.put("/api/time-off-requests/:id", requireAuth10, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user.id;
    const existingRequest = await storage5.getTimeOffRequest(id);
    if (!existingRequest) {
      return res.status(404).json({ message: "Time off request not found" });
    }
    if (existingRequest.userId !== userId && req.user.role !== "manager") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (existingRequest.status !== "pending") {
      return res.status(400).json({ message: "Cannot edit approved or rejected requests" });
    }
    const updated = await storage5.updateTimeOffRequest(id, {
      type,
      startDate,
      endDate,
      reason
    });
    res.json({ request: updated });
  }));
  app2.put("/api/time-off-requests/:id/toggle-paid", requireAuth10, requireRole3(["manager"]), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isPaid } = req.body;
    const existing = await storage5.getTimeOffRequest(id);
    if (!existing) {
      return res.status(404).json({ message: "Time off request not found" });
    }
    if (existing.status !== "approved") {
      return res.status(400).json({ message: "Can only toggle paid status on approved requests" });
    }
    const employee = await storage5.getUser(existing.userId);
    if (!employee || employee.branchId !== req.user.branchId) {
      return res.status(403).json({ message: "Not authorized for this branch" });
    }
    const startD = new Date(existing.startDate);
    const endD = new Date(existing.endDate);
    const daysToAdjust = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1e3 * 60 * 60 * 24)) + 1);
    if (isPaid && !existing.isPaid) {
      try {
        const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { leaveCredits: leaveCredits2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const { eq: eq8, and: and4 } = await import("drizzle-orm");
        const specificBalance = await db2.select().from(leaveCredits2).where(
          and4(eq8(leaveCredits2.userId, existing.userId), eq8(leaveCredits2.year, startD.getFullYear()), eq8(leaveCredits2.leaveType, existing.type))
        ).limit(1);
        let deductedFrom = null;
        if (specificBalance[0] && parseFloat(specificBalance[0].remainingCredits) > 0) {
          deductedFrom = existing.type;
        }
        if (deductedFrom) {
          await deductLeaveCredit(existing.userId, employee.branchId, deductedFrom, daysToAdjust, startD.getFullYear());
        }
      } catch (e) {
        console.error("Adjustment deduction error:", e);
      }
    } else if (!isPaid && existing.isPaid) {
      try {
        const { restoreLeaveCredit: restoreLeaveCredit2 } = await Promise.resolve().then(() => (init_leave_credits(), leave_credits_exports));
        await restoreLeaveCredit2(existing.userId, existing.type, daysToAdjust, startD.getFullYear());
      } catch (e) {
        console.error("Adjustment restore error:", e);
      }
    }
    const updated = await storage5.updateTimeOffRequest(id, { isPaid });
    res.json({ request: updated });
  }));
  app2.delete("/api/time-off-requests/:id", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const actor = req.user;
      const existingRequest = await storage5.getTimeOffRequest(id);
      if (!existingRequest) {
        return res.status(404).json({ message: "Time off request not found" });
      }
      if (existingRequest.status === "cancelled") {
        return res.status(409).json({ message: "Request has already been cancelled" });
      }
      const requestOwner = await storage5.getUser(existingRequest.userId);
      if (!requestOwner) {
        return res.status(404).json({ message: "Time off request owner not found" });
      }
      const isOwner = existingRequest.userId === actor.id;
      const isManagerOrAdmin = actor.role === "manager" || actor.role === "admin";
      if (!isOwner && !isManagerOrAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (actor.role === "manager" && requestOwner.branchId !== actor.branchId) {
        return res.status(403).json({ message: "Not authorized for this branch" });
      }
      if (existingRequest.status !== "pending" && !isManagerOrAdmin) {
        return res.status(400).json({ message: "Only managers can cancel approved or rejected requests" });
      }
      if (existingRequest.status === "approved" && existingRequest.isPaid) {
        try {
          const { restoreLeaveCredit: restoreLeaveCredit2 } = await Promise.resolve().then(() => (init_leave_credits(), leave_credits_exports));
          const startD = new Date(existingRequest.startDate);
          const endD = new Date(existingRequest.endDate);
          const daysToRestore = Math.max(1, Math.ceil((endD.getTime() - startD.getTime()) / (1e3 * 60 * 60 * 24)) + 1);
          await restoreLeaveCredit2(existingRequest.userId, existingRequest.type, daysToRestore, startD.getFullYear());
        } catch (restoreErr) {
          console.error("Failed to restore leave credits during time-off deletion:", restoreErr);
        }
      }
      const cancelled = await storage5.deleteTimeOffRequest(id);
      if (!cancelled) {
        return res.status(500).json({ message: "Failed to cancel request" });
      }
      const actorProfile = await storage5.getUser(actor.id);
      const actorName = actorProfile ? `${actorProfile.firstName} ${actorProfile.lastName}` : actor.username;
      const cancelledByLabel = isOwner ? "you" : actorName;
      const notification = await storage5.createNotification({
        userId: existingRequest.userId,
        branchId: requestOwner.branchId,
        type: "time_off_cancelled",
        title: "Time Off Request Cancelled",
        message: `Your ${existingRequest.type} request from ${format4(new Date(existingRequest.startDate), "MMM d")} to ${format4(new Date(existingRequest.endDate), "MMM d, yyyy")} was cancelled by ${cancelledByLabel}.`,
        isRead: false,
        data: JSON.stringify({
          status: "cancelled",
          startDate: format4(new Date(existingRequest.startDate), "MMM d, yyyy"),
          endDate: format4(new Date(existingRequest.endDate), "MMM d, yyyy"),
          type: existingRequest.type,
          cancelledBy: actor.id
        })
      });
      realTimeManager.broadcastNotification(notification);
      await createAuditLog({
        action: "time_off_cancel",
        entityType: "time_off_request",
        entityId: id,
        userId: actor.id,
        oldValues: {
          status: existingRequest.status,
          isPaid: existingRequest.isPaid,
          approvedBy: existingRequest.approvedBy,
          approvedAt: existingRequest.approvedAt
        },
        newValues: {
          status: "cancelled",
          cancelledBy: actor.id,
          cancelledByRole: actor.role,
          employeeId: existingRequest.userId,
          startDate: existingRequest.startDate,
          endDate: existingRequest.endDate,
          type: existingRequest.type
        },
        reason: isOwner ? "Employee withdrew request" : "Manager cancelled request",
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
        branchId: requestOwner.branchId
      });
      res.json({ message: "Request cancelled successfully" });
    } catch (error) {
      console.error("Cancel time-off request error:", error);
      res.status(500).json({ message: error.message || "Failed to cancel request" });
    }
  }));
  app2.get("/api/notifications", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const activeBranchId = req.user.branchId;
      const notifications2 = await storage5.getUserNotifications(userId);
      const branchFiltered = notifications2.filter((n) => !n.branchId || n.branchId === activeBranchId);
      const filteredNotifications = req.user.role === "employee" ? branchFiltered.filter((notification) => notification.type !== "adjustment") : branchFiltered;
      res.json({ notifications: filteredNotifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: error.message || "Failed to fetch notifications" });
    }
  }));
  app2.patch("/api/notifications/:id/read", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const notification = await storage5.markNotificationRead(id, userId);
      res.json(notification || { success: true });
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }));
  app2.patch("/api/notifications/read-all", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      await storage5.markAllNotificationsRead(userId);
      res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  }));
  app2.delete("/api/notifications/:id", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const deleted = await storage5.deleteNotification(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({ message: error.message || "Failed to delete notification" });
    }
  }));
  app2.post("/api/admin/seed-sample-data", requireAuth10, requireRole3(["admin", "manager"]), asyncHandler(async (req, res) => {
    try {
      const user = getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const branchId = user.branchId;
      const allEmployees = await storage5.getEmployees(branchId);
      const employees = allEmployees.filter((e) => e.role === "employee");
      if (employees.length === 0) {
        return res.status(400).json({ message: "No employees found. Please add employees first." });
      }
      const now = /* @__PURE__ */ new Date();
      let shiftsCreated = 0;
      let shiftsUpdated = 0;
      const shiftPatterns = [
        { start: 6, end: 14 },
        // Morning 8 hours
        { start: 8, end: 17 },
        // Day 9 hours (with 1hr lunch)
        { start: 14, end: 22 }
        // Afternoon 8 hours
      ];
      for (const emp of employees) {
        for (let day = -14; day <= 7; day++) {
          const shiftDate = new Date(now);
          shiftDate.setDate(shiftDate.getDate() + day);
          if (shiftDate.getDay() === 0) continue;
          if (Math.random() > 0.7) continue;
          const pattern = shiftPatterns[Math.floor(Math.random() * shiftPatterns.length)];
          const startTime = new Date(shiftDate);
          startTime.setHours(pattern.start, 0, 0, 0);
          const endTime = new Date(shiftDate);
          endTime.setHours(pattern.end, 0, 0, 0);
          const isPast = day < 0;
          const isToday = day === 0;
          const status = isPast ? "completed" : isToday ? "scheduled" : "scheduled";
          try {
            const shift = await storage5.createShift({
              userId: emp.id,
              branchId,
              startTime,
              endTime,
              position: emp.position,
              status
            });
            if (isPast && shift) {
              const actualStart = new Date(startTime);
              actualStart.setMinutes(actualStart.getMinutes() + Math.floor(Math.random() * 15) - 5);
              const actualEnd = new Date(endTime);
              actualEnd.setMinutes(actualEnd.getMinutes() + Math.floor(Math.random() * 30));
              await storage5.updateShift(shift.id, {
                status: "completed",
                actualStartTime: actualStart,
                actualEndTime: actualEnd
              });
              shiftsUpdated++;
            }
            shiftsCreated++;
          } catch (err) {
          }
        }
      }
      const currentDay = now.getDate();
      let periodStart;
      let periodEnd;
      if (currentDay <= 15) {
        periodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        periodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 15));
      } else {
        periodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 16));
        periodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
      }
      let payrollPeriod = null;
      const existingPeriods = await storage5.getPayrollPeriods(branchId);
      payrollPeriod = existingPeriods.find((p) => {
        const pStart = new Date(p.startDate);
        const pEnd = new Date(p.endDate);
        return pStart.getTime() === periodStart.getTime() && pEnd.getTime() === periodEnd.getTime();
      });
      if (!payrollPeriod) {
        payrollPeriod = await storage5.createPayrollPeriod({
          branchId,
          startDate: periodStart,
          endDate: periodEnd,
          status: "open",
          totalHours: "0",
          totalPay: "0"
        });
      }
      let entriesCreated = 0;
      let totalPayrollAmount = 0;
      for (const emp of employees) {
        const empShifts = await storage5.getShiftsByUser(emp.id);
        const completedShifts = empShifts.filter((s) => {
          const shiftDate = new Date(s.startTime);
          return s.status === "completed" && shiftDate >= periodStart && shiftDate <= periodEnd;
        });
        let totalMinutes = 0;
        for (const shift of completedShifts) {
          const start = shift.actualStartTime || shift.startTime;
          const end = shift.actualEndTime || shift.endTime;
          const minutes = (new Date(end).getTime() - new Date(start).getTime()) / (1e3 * 60);
          totalMinutes += minutes;
        }
        if (totalMinutes === 0) {
          const daysWorked = 8 + Math.floor(Math.random() * 3);
          totalMinutes = daysWorked * DAILY_REGULAR_HOURS * MINS_PER_HOUR;
        }
        const totalHours = totalMinutes / MINS_PER_HOUR;
        const regularHours = Math.min(totalHours, 88);
        const overtimeHours = Math.max(0, totalHours - 88);
        const hourlyRate = parseFloat(emp.hourlyRate);
        if (isNaN(hourlyRate) || hourlyRate <= 0) {
          console.error(`[PAYROLL] Invalid hourly rate for ${emp.firstName}: ${emp.hourlyRate}`);
          continue;
        }
        const basicPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * HOLIDAY_RATES.normal.overtime;
        const grossPay = basicPay + overtimePay;
        const { calculateAllDeductions: calculateAllDeductions2, calculateWithholdingTax: calculateWithholdingTax2 } = await Promise.resolve().then(() => (init_deductions(), deductions_exports));
        const monthlyBasicSalary = hourlyRate * MONTHLY_WORKING_HOURS;
        const mandatoryBreakdown = await calculateAllDeductions2(monthlyBasicSalary, {
          deductSSS: true,
          deductPhilHealth: true,
          deductPagibig: true,
          deductWithholdingTax: false
          // Tax computed separately on taxable income
        });
        const periodFraction = 0.5;
        const sssContribution = mandatoryBreakdown.sssContribution * periodFraction;
        const philhealthContribution = mandatoryBreakdown.philHealthContribution * periodFraction;
        const pagibigContribution = mandatoryBreakdown.pagibigContribution * periodFraction;
        const periodMandatory = sssContribution + philhealthContribution + pagibigContribution;
        const periodTaxableIncome = Math.max(0, grossPay - periodMandatory);
        const projectedMonthlyTaxable = periodTaxableIncome / periodFraction;
        const monthlyTax = await calculateWithholdingTax2(projectedMonthlyTaxable);
        const withholdingTax = monthlyTax * periodFraction;
        const totalDeductions = periodMandatory + withholdingTax;
        const netPay = Math.max(0, grossPay - totalDeductions);
        totalPayrollAmount += netPay;
        try {
          const existingEntries = await storage5.getPayrollEntriesByPeriod(payrollPeriod.id);
          const hasEntry = existingEntries.some((e) => e.userId === emp.id);
          if (!hasEntry) {
            await storage5.createPayrollEntry({
              userId: emp.id,
              payrollPeriodId: payrollPeriod.id,
              totalHours: totalHours.toFixed(2),
              regularHours: regularHours.toFixed(2),
              overtimeHours: overtimeHours.toFixed(2),
              nightDiffHours: "0",
              basicPay: basicPay.toFixed(2),
              overtimePay: overtimePay.toFixed(2),
              nightDiffPay: "0",
              holidayPay: "0",
              restDayPay: "0",
              grossPay: grossPay.toFixed(2),
              sssContribution: sssContribution.toFixed(2),
              philHealthContribution: philhealthContribution.toFixed(2),
              pagibigContribution: pagibigContribution.toFixed(2),
              withholdingTax: withholdingTax.toFixed(2),
              totalDeductions: totalDeductions.toFixed(2),
              deductions: totalDeductions.toFixed(2),
              netPay: netPay.toFixed(2),
              status: "pending"
            });
            entriesCreated++;
          }
        } catch (err) {
          console.error(`[PAYROLL] Error creating entry for ${emp.firstName}:`, err.message);
        }
      }
      const allEntries = await storage5.getPayrollEntriesByPeriod(payrollPeriod.id);
      const totalHoursAll = allEntries.reduce((sum, e) => sum + parseFloat(e.totalHours || "0"), 0);
      const totalPayAll = allEntries.reduce((sum, e) => sum + parseFloat(e.netPay || "0"), 0);
      await storage5.updatePayrollPeriod(payrollPeriod.id, {
        totalHours: totalHoursAll.toFixed(2),
        totalPay: totalPayAll.toFixed(2)
      });
      res.json({
        success: true,
        message: "Sample shifts and payroll data created successfully!",
        data: {
          employeesProcessed: employees.length,
          shiftsCreated,
          shiftsWithHours: shiftsUpdated,
          payrollEntriesCreated: entriesCreated,
          totalPayrollAmount: totalPayAll.toFixed(2)
        },
        instructions: "Refresh the page to see the updated data. Go to Payroll > View to see employee entries."
      });
    } catch (error) {
      console.error("Seed sample data error:", error);
      res.status(500).json({
        message: error.message || "Failed to seed sample data"
      });
    }
  }));
  app2.put("/api/auth/profile", requireAuth10, asyncHandler(async (req, res) => {
    try {
      const { email, password, newPassword, firstName, lastName, tin, sssNumber, philhealthNumber, pagibigNumber } = req.body;
      const userId = req.user.id;
      const user = await storage5.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updateData = {};
      const norm = (v) => v || null;
      if (firstName !== void 0 && norm(firstName) !== norm(user.firstName)) {
        updateData.firstName = firstName;
      }
      if (lastName !== void 0 && norm(lastName) !== norm(user.lastName)) {
        updateData.lastName = lastName;
      }
      if (email !== void 0 && norm(email) !== norm(user.email)) {
        updateData.email = email;
      }
      if (tin !== void 0) {
        updateData.tin = tin || null;
      }
      if (sssNumber !== void 0) {
        updateData.sssNumber = sssNumber || null;
      }
      if (philhealthNumber !== void 0) {
        updateData.philhealthNumber = philhealthNumber || null;
      }
      if (pagibigNumber !== void 0) {
        updateData.pagibigNumber = pagibigNumber || null;
      }
      if (newPassword) {
        if (!password) {
          return res.status(400).json({ message: "Current password is required to set a new password" });
        }
        if (newPassword.length < 6) {
          return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }
        const validPassword = await bcrypt3.compare(password, user.password);
        if (!validPassword) {
          return res.status(403).json({ message: "Invalid current password" });
        }
        updateData.password = newPassword;
      }
      if (Object.keys(updateData).length === 0) {
        const { password: _p, ...userWithoutPassword2 } = user;
        return res.json({ message: "No changes needed", user: userWithoutPassword2 });
      }
      const updatedUser = await storage5.updateUser(userId, updateData);
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({
        message: "Profile updated successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        message: error.message || "Failed to update profile"
      });
    }
  }));
  app2.post("/api/debug/seed", requireAuth10, asyncHandler(async (req, res) => {
    try {
      if (!["admin", "manager"].includes(req.user.role)) {
        return res.status(403).json({
          message: "Insufficient permissions",
          yourRole: req.user.role,
          userId: req.user.id
        });
      }
      await seedSampleUsers();
      await seedSampleSchedulesAndPayroll();
      const userCount = await storage5.getUsersByBranch(req.user.branchId);
      res.json({
        message: "Seeding completed successfully",
        usersFound: userCount.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Manual seeding error:", error);
      res.status(500).json({ message: "Seeding failed", error: String(error) });
    }
  }));
  app2.post("/api/debug/reset-and-reseed", requireAuth10, requireRole3(["admin"]), asyncHandler(async (req, res) => {
    try {
      await resetDatabase();
      await initializeDatabase();
      await createAdminAccount();
      await seedDeductionRates();
      await seedSampleUsers();
      await seedSampleSchedulesAndPayroll();
      await seedPhilippineHolidays();
      await seedSampleShiftTrades();
      await markSetupComplete();
      res.json({
        message: "Database fully reset and reseeded!",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        note: "You need to log in again (session was invalidated by reset)."
      });
    } catch (error) {
      console.error("\u274C Reset and reseed error:", error);
      res.status(500).json({ message: "Reset failed", error: String(error) });
    }
  }));
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  // ESBuild options for maximum production compression
  esbuild: {
    drop: ["console", "debugger"],
    legalComments: "none",
    treeShaking: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    target: "esnext",
    chunkSizeWarningLimit: 1e3,
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      treeshake: true,
      input: {
        main: path.resolve(__dirname, "client", "index.html")
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
          if (id.includes("node_modules")) {
            if (id.includes("@fullcalendar")) {
              if (!id.includes("resource")) {
                return "vendor-calendar";
              }
            }
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            return "vendor";
          }
        },
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    hmr: process.env.CODESPACES ? {
      clientPort: 443,
      protocol: "wss",
      host: `${process.env.CODESPACE_NAME}-5000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || "app.github.dev"}`
    } : true,
    proxy: {
      // Proxy frontend API requests to the backend dev server.
      // Start the backend with `npm run dev` (it listens on port 5000).
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    },
    fs: {
      // Keep strict but allow access to the project root (parent of `client`)
      // so Vite can serve optimized deps from the repository `node_modules`.
      strict: true,
      // Allow the repo root (The Cafe folder) so `node_modules/.vite` can be read
      // when the Vite root is set to `client`.
      allow: [path.resolve(__dirname)],
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/_vite_hmr", clientPort: process.env.CODESPACES ? 443 : void 0 },
    allowedHosts: true,
    strictPort: false
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/.well-known")) {
      return next();
    }
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      vite.transformIndexHtml(url, template).then((page) => {
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      });
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath, {
    setHeaders: (res, pathStr) => {
      if (pathStr.includes("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (pathStr.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=86400");
      }
    }
  }));
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/.well-known")) {
      return next();
    }
    try {
      const indexPath = path2.resolve(distPath, "index.html");
      const html = fs.readFileSync(indexPath, "utf-8");
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(html);
    } catch (err) {
      next(err);
    }
  });
}

// server/index.ts
import { networkInterfaces } from "os";

// server/db-manager.ts
async function promptDatabaseChoice() {
  console.log("\u2139\uFE0F  Using PostgreSQL (Neon) database");
  return "continue";
}
function deleteDatabaseFile() {
  console.log("\u2139\uFE0F  PostgreSQL mode - no local database file to delete");
}
function displayDatabaseStats() {
  console.log("\u2139\uFE0F  Using PostgreSQL database via Neon");
}
async function loadSampleData() {
  console.log("\u2139\uFE0F  Sample data loading not implemented for PostgreSQL");
}

// server/index.ts
init_db();
process.env.TZ = "Asia/Manila";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(compression({
  level: 6,
  // Balanced compression vs CPU usage
  threshold: 1024,
  // Only compress files larger than 1KB
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  }
}));
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
(async () => {
  let loadSample = false;
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    if (process.env.FRESH_DB === "true") {
      console.log("\n\u{1F504} FRESH_DB flag detected. Deleting existing database...\n");
      await resetDatabase();
      recreateConnection();
    }
    const isInteractive = process.stdin.isTTY && !process.env.CI && !process.env.NON_INTERACTIVE;
    if (isInteractive && process.env.FRESH_DB !== "true") {
      const choice = await promptDatabaseChoice();
      if (choice === "fresh") {
        deleteDatabaseFile();
        recreateConnection();
        console.log("\u{1F504} Starting with a fresh database...\n");
      } else if (choice === "sample") {
        deleteDatabaseFile();
        recreateConnection();
        console.log("\u{1F504} Starting with a fresh database...\n");
        loadSample = true;
      } else {
        displayDatabaseStats();
      }
    }
  } else {
    console.log("\u{1F680} Production mode: Using PostgreSQL (Neon) database");
    if (process.env.FORCE_RESEED === "true") {
      console.log("\n\u{1F504} FORCE_RESEED flag detected. Resetting production database...\n");
      await resetDatabase();
      await initializeDatabase();
      loadSample = true;
      console.log("\u2705 Production database reset complete. Will reseed with sample data.\n");
    }
  }
  await initializeDatabase();
  if (loadSample) {
    await loadSampleData();
  }
  await createAdminAccount();
  await seedSampleUsers();
  await seedDeductionRates();
  await runMigrations();
  await seedSampleSchedulesAndPayroll();
  await seedPhilippineHolidays();
  await seedSampleShiftTrades();
  await markSetupComplete();
  console.log("\u2705 Setup marked as complete");
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    console.log("\u{1F527} Using Vite dev server for frontend...");
    await setupVite(app, server);
  } else {
    console.log("\u{1F4E6} Serving static frontend files from dist/public...");
    serveStatic(app);
  }
  const getLocalNetworkIP = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      const netInfo = nets[name];
      if (!netInfo) continue;
      for (const net of netInfo) {
        const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
        if (net.family === familyV4Value && !net.internal) {
          return net.address;
        }
      }
    }
    return null;
  };
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, () => {
    const localIP = getLocalNetworkIP();
    console.log("\n" + "=".repeat(70));
    console.log("\u{1F5A5}\uFE0F The Caf\xE9 Server (single origin)");
    console.log("=".repeat(70));
    console.log("\n\u{1F4CD} Server URLs:");
    console.log(`  \u279C Local:    http://localhost:${port}`);
    if (localIP) {
      console.log(`  \u279C Network:  http://${localIP}:${port}`);
    }
    console.log("\n\u{1F465} Access:");
    console.log(`  \u279C App URL: http://localhost:${port}`);
    if (localIP) {
      console.log(`  \u279C Network:  http://${localIP}:${port}`);
    }
    console.log("\n" + "=".repeat(70) + "\n");
    log(`Server ready on port ${port}`);
  });
})();
var index_default = app;
export {
  index_default as default
};
