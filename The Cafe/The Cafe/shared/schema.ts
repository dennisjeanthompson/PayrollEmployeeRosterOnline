import { sql } from "drizzle-orm";
import { pgTable, text, boolean, timestamp, integer, numeric, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const branches = pgTable("branches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  intentHolidayExempt: boolean("intent_holiday_exempt").default(false), // DOLE: Admin claims < 5 workers exemption
  establishmentType: text("establishment_type").default("other"), // 'retail', 'service', 'other'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
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
  tin: text("tin"),               // BIR Tax Identification Number
  sssNumber: text("sss_number"),  // SSS Member ID
  philhealthNumber: text("philhealth_number"), // PhilHealth Member Number
  pagibigNumber: text("pagibig_number"),       // Pag-IBIG / HDMF Member Number
  // BIR Minimum Wage Earner exemption — if true, withholding tax is forced to ₱0.00
  isMwe: boolean("is_mwe").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});


export const shifts = pgTable("shifts", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const shiftTrades = pgTable("shift_trades", {
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
  approvedBy: text("approved_by").references(() => users.id),
});

export const payrollPeriods = pgTable("payroll_periods", {
  id: text("id").primaryKey(),
  branchId: text("branch_id").references(() => branches.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  payDate: timestamp("pay_date"), // Pay Date for DOLE 16-day limit
  status: text("status").default("open"),
  totalHours: text("total_hours"),
  totalPay: text("total_pay"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payrollEntries = pgTable("payroll_entries", {
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
  paidAt: timestamp("paid_at"),
});

export const approvals = pgTable("approvals", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  requestId: text("request_id").notNull(),
  requestedBy: text("requested_by").references(() => users.id).notNull(),
  approvedBy: text("approved_by").references(() => users.id),
  status: text("status").default("pending"),
  reason: text("reason"),
  requestData: text("request_data"),
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const timeOffRequests = pgTable("time_off_requests", {
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
  rejectionReason: text("rejection_reason"),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  branchId: text("branch_id").references(() => branches.id), // Added branchId for filtering
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  data: text("data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const setupStatus = pgTable("setup_status", {
  id: text("id").primaryKey(),
  isSetupComplete: boolean("is_setup_complete").default(false),
  setupCompletedAt: timestamp("setup_completed_at"),
});

export const deductionSettings = pgTable("deduction_settings", {
  id: text("id").primaryKey(),
  branchId: text("branch_id").references(() => branches.id).notNull(),
  deductSSS: boolean("deduct_sss").default(true),
  deductPhilHealth: boolean("deduct_philhealth").default(false),
  deductPagibig: boolean("deduct_pagibig").default(false),
  deductWithholdingTax: boolean("deduct_withholding_tax").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deductionRates = pgTable("deduction_rates", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  minSalary: text("min_salary").notNull(),
  maxSalary: text("max_salary"),
  employeeRate: text("employee_rate"),
  employeeContribution: text("employee_contribution"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const holidays = pgTable("holidays", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'regular', 'special_non_working', 'special_working', 'company'
  year: integer("year").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  workAllowed: boolean("work_allowed").default(true), // If false, blocks shift creation
  notes: text("notes"), // Admin notes for this holiday
  premiumOverride: text("premium_override"), // JSON: { "worked": 2.0, "overtime": 2.6 }
  createdAt: timestamp("created_at").defaultNow(),
});

export const archivedPayrollPeriods = pgTable("archived_payroll_periods", {
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
  entriesSnapshot: text("entries_snapshot"),
});

// Company Settings - dynamic company profile for payslips, receipts, and branding
export const companySettings = pgTable("company_settings", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  tradeName: text("trade_name"), // DBA / trade name
  address: text("address").notNull(),
  city: text("city"),
  province: text("province"),
  zipCode: text("zip_code"),
  country: text("country").default("Philippines"),
  tin: text("tin").notNull(), // BIR Tax Identification Number
  sssEmployerNo: text("sss_employer_no"), // SSS Employer Number
  philhealthNo: text("philhealth_no"), // PhilHealth Employer Number
  pagibigNo: text("pagibig_no"), // Pag-IBIG Employer Number
  birRdo: text("bir_rdo"), // BIR Revenue District Office code
  secRegistration: text("sec_registration"), // SEC/DTI Registration Number
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logoUrl: text("logo_url"), // Cloudinary or local URL
  logoPublicId: text("logo_public_id"), // Cloudinary public ID
  industry: text("industry").default("Food & Beverage"),
  payrollFrequency: text("payroll_frequency").default("semi-monthly"), // weekly, bi-weekly, semi-monthly, monthly
  paymentMethod: text("payment_method").default("Bank Transfer"), // Bank Transfer, Cash, Check, GCash, PayMaya
  bankName: text("bank_name"),
  bankAccountName: text("bank_account_name"),
  bankAccountNo: text("bank_account_no"), // stored masked in responses
  isActive: boolean("is_active").default(true),
  updatedBy: text("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit logs for tracking deduction and rate changes (compliance requirement)
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(), // 'deduction_change', 'rate_update', 'payroll_process'
  entityType: text("entity_type").notNull(), // 'employee', 'deduction_rate', 'payroll_entry'
  entityId: text("entity_id").notNull(),
  userId: text("user_id").references(() => users.id).notNull(), // Who made the change
  oldValues: text("old_values"), // JSON string of previous values
  newValues: text("new_values"), // JSON string of new values
  reason: text("reason"), // Optional reason/note for the change
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Time off policy settings per branch (configurable advance notice requirements)
export const timeOffPolicy = pgTable("time_off_policy", {
  id: text("id").primaryKey(),
  branchId: text("branch_id").references(() => branches.id).notNull(),
  leaveType: text("leave_type").notNull(), // 'vacation', 'sick', 'emergency', 'personal', 'other'
  minimumAdvanceDays: integer("minimum_advance_days").notNull().default(0),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee documents (ID cards, certificates, supporting documents)
export const employeeDocuments = pgTable("employee_documents", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'sss_id', 'philhealth_id', 'pagibig_id', 'tin_id', 'birth_certificate', 'proof_of_address', 'nbi_clearance', 'resume', 'diploma', 'other'
  name: text("name").notNull(), // Original filename
  publicId: text("public_id").notNull(), // Cloudinary public ID
  url: text("url").notNull(), // Cloudinary secure URL
  format: text("format"), // 'pdf', 'jpg', 'png', etc.
  size: integer("size"), // File size in bytes
  uploadedBy: text("uploaded_by").references(() => users.id), // Who uploaded it
  createdAt: timestamp("created_at").defaultNow(),
});

// Manual Adjustment Logs for OT, Lateness, and other exceptions
// Managers log these manually; employees can verify; admin approves for payroll
export const adjustmentLogs = pgTable("adjustment_logs", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").references(() => users.id).notNull(),
  branchId: text("branch_id").references(() => branches.id).notNull(),
  loggedBy: text("logged_by").references(() => users.id).notNull(), // Manager who logged it
  startDate: timestamp("start_date"), // Date the exception started (nullable for backward compat)
  endDate: timestamp("end_date"), // Date the exception ended (nullable for backward compat)
  type: text("type").notNull(), // 'overtime', 'late', 'undertime', 'absent', 'rest_day_ot', 'special_holiday_ot', 'regular_holiday_ot', 'night_diff'
  // For overtime: hours (e.g., 2.0)
  // For lateness: minutes (e.g., 30)
  // For undertime: minutes
  value: text("value").notNull(), // Numeric value stored as text
  remarks: text("remarks"), // DOLE compliance: reason/context for the adjustment
  status: text("status").default("pending"), // 'pending', 'employee_verified', 'approved', 'rejected'
  verifiedByEmployee: boolean("verified_by_employee").default(false),
  verifiedAt: timestamp("verified_at"),
  approvedBy: text("approved_by").references(() => users.id), // Admin who approved for payroll
  approvedAt: timestamp("approved_at"),
  payrollPeriodId: text("payroll_period_id").references(() => payrollPeriods.id), // Linked when processed
  // Calculated amount (filled when payroll is processed)
  calculatedAmount: text("calculated_amount"), // Positive for OT, negative for late deduction
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── PH Compliance Tables ───────────────────────────────────────────────────

/**
 * 13th Month Pay Ledger (RA 7641 / Presidential Decree 851)
 * Each processed payroll period adds a row per employee recording basicPay only
 * (OT, Holiday, Night Diff excluded per BIR rules).
 * Year-end 13th month = SUM(basicPayEarned for year) / 12
 */
export const thirteenthMonthLedger = pgTable("thirteenth_month_ledger", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  branchId: text("branch_id").references(() => branches.id).notNull(),
  payrollPeriodId: text("payroll_period_id").references(() => payrollPeriods.id).notNull(),
  year: integer("year").notNull(),
  basicPayEarned: text("basic_pay_earned").notNull(), // Only basic pay — no OT/Holiday/NightDiff
  periodStartDate: timestamp("period_start_date").notNull(),
  periodEndDate: timestamp("period_end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Leave Credits / Leave Balance (DOLE Labor Standards)
 * Tracks SIL (5 days), Solo Parent Leave (7 days), VAWC Leave (10 days), etc.
 * One row per employee per year per leave type.
 */
export const leaveCredits = pgTable("leave_credits", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  branchId: text("branch_id").references(() => branches.id).notNull(),
  year: integer("year").notNull(),
  // 'sil' | 'solo_parent' | 'vawc' | 'vacation' | 'sick' | 'other'
  leaveType: text("leave_type").notNull(),
  totalCredits: text("total_credits").notNull(),   // Total days granted (e.g. '5.00')
  usedCredits: text("used_credits").default("0"),  // Days consumed via approved time-off
  remainingCredits: text("remaining_credits").notNull(), // totalCredits - usedCredits
  grantedBy: text("granted_by").references(() => users.id), // Manager who granted
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});



/**
 * Government Loan Requests (SSS & Pag-IBIG) - DOLE Art. 113 Compliance
 * Tracks employee loan applications, proofs, and Manager/HR approval statuses.
 * Only approved loans are deducted during payroll processing.
 */
export const loanRequests = pgTable("loan_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  branchId: text("branch_id").references(() => branches.id).notNull(),
  loanType: text("loan_type").notNull(), // 'SSS' | 'Pag-IBIG'
  referenceNumber: text("reference_number").notNull(),
  accountNumber: text("account_number").notNull(),
  totalAmount: text("total_amount").notNull().default("0"),
  remainingBalance: text("remaining_balance").notNull().default("0"),
  monthlyAmortization: text("monthly_amortization").notNull(),
  deductionStartDate: timestamp("deduction_start_date").notNull(),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected' | 'completed'
  proofFileUrl: text("proof_file_url"),
  hrApprovalNote: text("hr_approval_note"),
  approvedBy: text("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Phase 2 Compliance Tables ───────────────────────────────────────────────────

export const sssContributionTable = pgTable("sss_contribution_table", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  minCompensation: numeric("min_compensation", { precision: 12, scale: 4 }).notNull(),
  maxCompensation: numeric("max_compensation", { precision: 12, scale: 4 }).notNull(),
  monthlySalaryCredit: numeric("monthly_salary_credit", { precision: 12, scale: 4 }).notNull(),
  employeeShare: numeric("employee_share", { precision: 12, scale: 4 }).notNull(),
  employerShare: numeric("employer_share", { precision: 12, scale: 4 }).notNull(),
  ecContribution: numeric("ec_contribution", { precision: 12, scale: 4 }).notNull(),
});

export const wageOrders = pgTable("wage_orders", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  dailyRate: numeric("daily_rate", { precision: 12, scale: 4 }).notNull(),
  isActive: boolean("is_active").default(true),
});

export const allowanceTypes = pgTable("allowance_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isDeMinimis: boolean("is_de_minimis").default(true),
  ceilingType: text("ceiling_type"), // 'peso_monthly', 'peso_annual', 'days_annual'
  ceilingValue: numeric("ceiling_value", { precision: 12, scale: 4 }),
});

export const workerAllowances = pgTable("worker_allowances", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  allowanceTypeId: text("allowance_type_id").references(() => allowanceTypes.id).notNull(),
  amount: numeric("amount", { precision: 12, scale: 4 }).notNull(),
  isActive: boolean("is_active").default(true),
});

export const deMinimisYtd = pgTable("de_minimis_ytd", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  branchId: text("branch_id").references(() => branches.id).notNull(),
  year: integer("year").notNull(),
  allowanceTypeId: text("allowance_type_id").references(() => allowanceTypes.id).notNull(),
  amountGivenYtd: numeric("amount_given_ytd", { precision: 12, scale: 4 }).default("0"),
});

export const employeeTaxYtd = pgTable("employee_tax_ytd", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  year: integer("year").notNull(),
  otherBenefitsYtd: numeric("other_benefits_ytd", { precision: 12, scale: 4 }).default("0"),
  thirteenthMonthYtd: numeric("thirteenth_month_ytd", { precision: 12, scale: 4 }).default("0"),
  grossCompensationYtd: numeric("gross_compensation_ytd", { precision: 12, scale: 4 }).default("0"),
  taxableCompensationYtd: numeric("taxable_compensation_ytd", { precision: 12, scale: 4 }).default("0"),
  taxWithheldYtd: numeric("tax_withheld_ytd", { precision: 12, scale: 4 }).default("0"),
});

// Insert Schemas
export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
}).extend({
  startTime: z.union([z.date(), z.string().pipe(z.coerce.date())]),
  endTime: z.union([z.date(), z.string().pipe(z.coerce.date())]),
});

export const insertShiftTradeSchema = z.object({
  id: z.string().uuid().optional(),
  shiftId: z.string().uuid(),
  fromUserId: z.string().uuid().optional(),
  toUserId: z.string().uuid().optional(),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(['open', 'pending', 'accepted', 'approved', 'rejected', 'cancelled']).default('pending'),
  urgency: z.enum(['urgent', 'normal', 'low']).default('normal'),
  notes: z.string().optional(),
  requestedAt: z.date().optional(),
  approvedAt: z.date().optional(),
  approvedBy: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertPayrollPeriodSchema = createInsertSchema(payrollPeriods).omit({
  id: true,
  createdAt: true,
});

export const insertPayrollEntrySchema = createInsertSchema(payrollEntries).omit({
  id: true,
  createdAt: true,
});

export const insertApprovalSchema = createInsertSchema(approvals).omit({
  id: true,
  requestedAt: true,
  respondedAt: true,
});

export const insertTimeOffRequestSchema = createInsertSchema(timeOffRequests).omit({
  id: true,
  requestedAt: true,
  approvedAt: true,
  isPaid: true,
}).extend({
  startDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
  endDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertDeductionSettingsSchema = createInsertSchema(deductionSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeductionRatesSchema = createInsertSchema(deductionRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHolidaySchema = createInsertSchema(holidays).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.union([z.date(), z.string().pipe(z.coerce.date())]),
});

export const insertArchivedPayrollPeriodSchema = createInsertSchema(archivedPayrollPeriods).omit({
  id: true,
  archivedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertTimeOffPolicySchema = createInsertSchema(timeOffPolicy).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdjustmentLogSchema = createInsertSchema(adjustmentLogs).omit({
  id: true,
  createdAt: true,
}).extend({
  startDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
  endDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
});

export const insertThirteenthMonthLedgerSchema = createInsertSchema(thirteenthMonthLedger).omit({
  id: true,
  createdAt: true,
}).extend({
  periodStartDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
  periodEndDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
});

export const insertLeaveCreditsSchema = createInsertSchema(leaveCredits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertLoanRequestSchema = createInsertSchema(loanRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  deductionStartDate: z.union([z.date(), z.string().pipe(z.coerce.date())]),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export interface DashboardStats {
  stats: {
    totalEmployees: number;
    scheduledToday: number;
    pendingRequests: number;
    clockedIn: number;
    onBreak: number;
    late: number;
    revenue: number;
  };
}

// Types
export type Branch = typeof branches.$inferSelect;
export type User = typeof users.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type ShiftTrade = typeof shiftTrades.$inferSelect;
export type PayrollPeriod = typeof payrollPeriods.$inferSelect;
export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type Approval = typeof approvals.$inferSelect;
export type TimeOffRequest = typeof timeOffRequests.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type SetupStatus = typeof setupStatus.$inferSelect;
export type DeductionSettings = typeof deductionSettings.$inferSelect;
export type DeductionRate = typeof deductionRates.$inferSelect;
export type Holiday = typeof holidays.$inferSelect;
export type ArchivedPayrollPeriod = typeof archivedPayrollPeriods.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type TimeOffPolicy = typeof timeOffPolicy.$inferSelect;
export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type AdjustmentLog = typeof adjustmentLogs.$inferSelect;
export type CompanySettings = typeof companySettings.$inferSelect;
export type ThirteenthMonthLedger = typeof thirteenthMonthLedger.$inferSelect;
export type LeaveCredit = typeof leaveCredits.$inferSelect;
export type ServiceChargePool = typeof serviceChargePools.$inferSelect;


export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertShift = z.infer<typeof insertShiftSchema>;
export type InsertShiftTrade = z.infer<typeof insertShiftTradeSchema>;
export type InsertPayrollPeriod = z.infer<typeof insertPayrollPeriodSchema>;
export type InsertPayrollEntry = z.infer<typeof insertPayrollEntrySchema>;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type InsertTimeOffRequest = z.infer<typeof insertTimeOffRequestSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertDeductionSettings = z.infer<typeof insertDeductionSettingsSchema>;
export type InsertDeductionRate = z.infer<typeof insertDeductionRatesSchema>;
export type InsertHoliday = z.infer<typeof insertHolidaySchema>;
export type InsertArchivedPayrollPeriod = z.infer<typeof insertArchivedPayrollPeriodSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertTimeOffPolicy = z.infer<typeof insertTimeOffPolicySchema>;
export type InsertAdjustmentLog = z.infer<typeof insertAdjustmentLogSchema>;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type InsertThirteenthMonthLedger = z.infer<typeof insertThirteenthMonthLedgerSchema>;
export type InsertLeaveCredit = z.infer<typeof insertLeaveCreditsSchema>;
export type InsertServiceChargePool = z.infer<typeof insertServiceChargePoolSchema>;

// Phase 2 Types
export const insertSssContributionTableSchema = createInsertSchema(sssContributionTable).omit({ id: true });
export const insertWageOrderSchema = createInsertSchema(wageOrders).omit({ id: true });
export const insertAllowanceTypeSchema = createInsertSchema(allowanceTypes).omit({ id: true });
export const insertWorkerAllowanceSchema = createInsertSchema(workerAllowances).omit({ id: true });
export const insertDeMinimisYtdSchema = createInsertSchema(deMinimisYtd).omit({ id: true });
export const insertEmployeeTaxYtdSchema = createInsertSchema(employeeTaxYtd).omit({ id: true });

export type SssContributionTable = typeof sssContributionTable.$inferSelect;
export type WageOrder = typeof wageOrders.$inferSelect;
export type AllowanceType = typeof allowanceTypes.$inferSelect;
export type WorkerAllowance = typeof workerAllowances.$inferSelect;
export type DeMinimisYtd = typeof deMinimisYtd.$inferSelect;
export type EmployeeTaxYtd = typeof employeeTaxYtd.$inferSelect;

export type InsertSssContributionTable = z.infer<typeof insertSssContributionTableSchema>;
export type InsertWageOrder = z.infer<typeof insertWageOrderSchema>;
export type InsertAllowanceType = z.infer<typeof insertAllowanceTypeSchema>;
export type InsertWorkerAllowance = z.infer<typeof insertWorkerAllowanceSchema>;
export type InsertDeMinimisYtd = z.infer<typeof insertDeMinimisYtdSchema>;
export type InsertEmployeeTaxYtd = z.infer<typeof insertEmployeeTaxYtdSchema>;
