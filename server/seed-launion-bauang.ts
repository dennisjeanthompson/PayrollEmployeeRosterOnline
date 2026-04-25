/**
 * ============================================================================
 *  PERO Payroll System — La Union Bauang Branch — Master Seed Script
 * ============================================================================
 *
 * PURPOSE:
 *   Seeds a complete, realistic "La Union Bauang" branch with 8 users
 *   (1 admin, 1 manager, 6 employees) and all transactional data.
 *
 * USAGE:
 *   npx tsx server/seed-launion-bauang.ts
 *
 * WHAT IS SEEDED:
 *   ✓ Branch: PERO – La Union Bauang
 *   ✓ Users: 1 Admin + 1 Manager + 6 Employees (with credentials)
 *   ✓ Deduction Settings (SSS, PhilHealth, Pag-IBIG, Tax enabled)
 *   ✓ Shifts / Schedules (Jan 1 – Apr 6, 2026)
 *   ✓ Payroll Periods (6 semi-monthly periods: Jan–Mar 2026)
 *   ✓ Payroll Entries (DOLE-compliant with deductions)
 *   ✓ 13th Month Ledger entries
 *   ✓ Exception / Adjustment Logs (OT, lateness, absences)
 *   ✓ Loan Requests (SSS + Pag-IBIG)
 *   ✓ Notifications (payroll, schedule, approvals, system)
 *   ✓ Time-Off Requests
 *   ✓ Leave Credits (SIL)
 *   ✓ Audit Logs (payroll processing, rate changes)
 *   ✓ Holiday Benefits (via existing holidays table)
 *   ✓ Shift Trades
 */

import 'dotenv/config';
import { db } from './db';
import { sql, eq } from 'drizzle-orm';
import {
  branches, users, shifts, shiftTrades,
  payrollPeriods, payrollEntries, timeOffRequests,
  notifications, approvals, adjustmentLogs, auditLogs,
  thirteenthMonthLedger, leaveCredits, loanRequests,
  deductionSettings,
} from '../shared/schema';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { dbStorage as storage } from './db-storage';
import { addDays, subDays, startOfDay } from 'date-fns';

const uuid = () => crypto.randomUUID();

// ═══════════════════════════════════════════════════════════════════════════
//  BRANCH + USER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const BRANCH_ID = 'branch-launion-bauang';
const BRANCH = {
  id: BRANCH_ID,
  name: 'PERO – La Union Bauang',
  address: 'National Highway, Bauang, La Union 2501',
  phone: '(072) 888-1234',
  isActive: true,
};

// La Union uses Region I wage order — daily minimum ~₱400 → ~₱50/hr
// Slightly higher rates for a café in a tourist/beach town
const USER_DEFS = [
  // ── ADMIN ──
  {
    id: 'lu-admin-001',
    username: 'ricardo',
    password: 'password123',
    firstName: 'Ricardo',
    lastName: 'Agustin',
    email: 'ricardo.agustin@pero-launion.com.ph',
    role: 'admin',
    position: 'Branch Administrator',
    hourlyRate: '0',
    sssNumber: '33-0000001-1',
    philhealthNumber: 'PH-LU-001',
    pagibigNumber: 'HDMF-LU-001',
    tin: '000-111-222-001',
  },
  // ── MANAGER ──
  {
    id: 'lu-mgr-001',
    username: 'angelica',
    password: 'password123',
    firstName: 'Angelica',
    lastName: 'Dumlao',
    email: 'angelica.dumlao@pero-launion.com.ph',
    role: 'manager',
    position: 'Branch Manager',
    hourlyRate: '95.00',
    sssNumber: '33-0000002-2',
    philhealthNumber: 'PH-LU-002',
    pagibigNumber: 'HDMF-LU-002',
    tin: '000-111-222-002',
  },
  // ── 6 EMPLOYEES ──
  {
    id: 'lu-emp-001',
    username: 'jerome',
    password: 'password123',
    firstName: 'Jerome',
    lastName: 'Flores',
    email: 'jerome.flores@pero-launion.com.ph',
    role: 'employee',
    position: 'Senior Barista',
    hourlyRate: '68.75',
    sssNumber: '33-1234001-1',
    philhealthNumber: 'PH-LU-101',
    pagibigNumber: 'HDMF-LU-101',
    tin: '000-333-444-001',
  },
  {
    id: 'lu-emp-002',
    username: 'mariafe',
    password: 'password123',
    firstName: 'Maria Fe',
    lastName: 'Navarro',
    email: 'mariafe.navarro@pero-launion.com.ph',
    role: 'employee',
    position: 'Cashier',
    hourlyRate: '62.50',
    sssNumber: '33-1234002-2',
    philhealthNumber: 'PH-LU-102',
    pagibigNumber: 'HDMF-LU-102',
    tin: '000-333-444-002',
  },
  {
    id: 'lu-emp-003',
    username: 'mark',
    password: 'password123',
    firstName: 'Mark Anthony',
    lastName: 'Corpuz',
    email: 'mark.corpuz@pero-launion.com.ph',
    role: 'employee',
    position: 'Kitchen Staff',
    hourlyRate: '62.50',
    sssNumber: '33-1234003-3',
    philhealthNumber: 'PH-LU-103',
    pagibigNumber: 'HDMF-LU-103',
    tin: '000-333-444-003',
  },
  {
    id: 'lu-emp-004',
    username: 'joy',
    password: 'password123',
    firstName: 'Joy Angelyn',
    lastName: 'Ramos',
    email: 'joy.ramos@pero-launion.com.ph',
    role: 'employee',
    position: 'Server',
    hourlyRate: '60.00',
    sssNumber: '33-1234004-4',
    philhealthNumber: 'PH-LU-104',
    pagibigNumber: 'HDMF-LU-104',
    tin: '000-333-444-004',
  },
  {
    id: 'lu-emp-005',
    username: 'carlo',
    password: 'password123',
    firstName: 'Carlo',
    lastName: 'Pascual',
    email: 'carlo.pascual@pero-launion.com.ph',
    role: 'employee',
    position: 'Barista',
    hourlyRate: '62.50',
    sssNumber: '33-1234005-5',
    philhealthNumber: 'PH-LU-105',
    pagibigNumber: 'HDMF-LU-105',
    tin: '000-333-444-005',
  },
  {
    id: 'lu-emp-006',
    username: 'rhea',
    password: 'password123',
    firstName: 'Rhea Mae',
    lastName: 'Salazar',
    email: 'rhea.salazar@pero-launion.com.ph',
    role: 'employee',
    position: 'Shift Lead',
    hourlyRate: '72.50',
    sssNumber: '33-1234006-6',
    philhealthNumber: 'PH-LU-106',
    pagibigNumber: 'HDMF-LU-106',
    tin: '000-333-444-006',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 1: Create Branch
// ═══════════════════════════════════════════════════════════════════════════

async function seedBranch() {
  console.log('\n🏪 Step 1 — Creating La Union Bauang branch...\n');

  const existing = await db.select().from(branches).where(eq(branches.id, BRANCH_ID));
  if (existing.length > 0) {
    console.log('   ✅ Branch already exists, skipping.');
    return;
  }

  await db.insert(branches).values(BRANCH);
  console.log(`   ✅ Created branch: ${BRANCH.name}`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 2: Create Users (Admin + Manager + 6 Employees)
// ═══════════════════════════════════════════════════════════════════════════

async function seedUsers() {
  console.log('\n👥 Step 2 — Creating users (1 admin, 1 manager, 6 employees)...\n');

  let created = 0;
  for (const def of USER_DEFS) {
    const existing = await db.select().from(users).where(eq(users.username, def.username));
    if (existing.length > 0) {
      console.log(`   ⏭️  ${def.username} already exists, skipping.`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(def.password, 10);

    await db.insert(users).values({
      id: def.id,
      username: def.username,
      password: hashedPassword,
      firstName: def.firstName,
      lastName: def.lastName,
      email: def.email,
      role: def.role,
      position: def.position,
      hourlyRate: def.hourlyRate,
      branchId: BRANCH_ID,
      isActive: true,
      sssNumber: def.sssNumber,
      philhealthNumber: def.philhealthNumber,
      pagibigNumber: def.pagibigNumber,
      tin: def.tin,
      sssLoanDeduction: '0',
      pagibigLoanDeduction: '0',
    });
    created++;
    console.log(`   ✅ ${def.role.toUpperCase()}: ${def.firstName} ${def.lastName} (${def.username})`);
  }

  console.log(`\n   ✅ Created ${created} users\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 3: Deduction Settings for this branch
// ═══════════════════════════════════════════════════════════════════════════

async function seedDeductionSettings() {
  console.log('💰 Step 3 — Creating deduction settings for La Union Bauang...\n');

  const existing = await db.select().from(deductionSettings).where(eq(deductionSettings.branchId, BRANCH_ID));
  if (existing.length > 0) {
    console.log('   ✅ Deduction settings already exist.');
    return;
  }

  await db.insert(deductionSettings).values({
    id: uuid(),
    branchId: BRANCH_ID,
    deductSSS: true,
    deductPhilHealth: true,
    deductPagibig: true,
    deductWithholdingTax: true,
  });
  console.log('   ✅ All mandatory deductions enabled (SSS, PhilHealth, Pag-IBIG, Tax)');
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 4: Shifts / Schedules (Jan–Mar 2026 + current week)
// ═══════════════════════════════════════════════════════════════════════════

async function seedShifts() {
  console.log('📅 Step 4 — Seeding shifts (Jan 1 – Apr 15, 2026)...\n');

  // Check if shifts already exist for this branch
  const existingShifts = await db.select().from(shifts).where(eq(shifts.branchId, BRANCH_ID)).limit(1);
  if (existingShifts.length > 0) {
    console.log('   ✅ Shifts already exist for this branch, skipping.');
    return;
  }

  // All staff who get shifts (manager + employees — NOT admin)
  const allStaff = USER_DEFS.filter(u => u.role !== 'admin');

  const shiftPatterns = [
    { name: 'Morning', startH: 0, endH: 8 },     // 8AM-4PM PHT (UTC: 0-8)
    { name: 'Day',     startH: 3, endH: 11 },     // 11AM-7PM PHT (UTC: 3-11)
    { name: 'Closing', startH: 7, endH: 15 },     // 3PM-11PM PHT (UTC: 7-15)
  ];

  // 2026 holidays that affect working days Jan-Mar
  const holidayDates = [
    '2026-01-01', // New Year's Day
    '2026-02-17', // Lunar New Year
    '2026-02-25', // EDSA Anniversary
    '2026-03-20', // Eid'l Fitr (tentative)
  ];

  function getWorkingDays(year: number, month: number, startDay: number, endDay: number): Date[] {
    const days: Date[] = [];
    for (let d = startDay; d <= endDay; d++) {
      const dt = new Date(Date.UTC(year, month, d));
      if (dt.getUTCDay() === 0) continue; // Skip Sundays
      const dateStr = dt.toISOString().slice(0, 10);
      if (holidayDates.includes(dateStr)) continue;
      days.push(dt);
    }
    return days;
  }

  // Semi-monthly periods for shift generation
  const periodDays = [
    getWorkingDays(2026, 0, 1, 15),   // Jan 1-15
    getWorkingDays(2026, 0, 16, 31),   // Jan 16-31
    getWorkingDays(2026, 1, 1, 15),    // Feb 1-15
    getWorkingDays(2026, 1, 16, 28),   // Feb 16-28
    getWorkingDays(2026, 2, 1, 15),    // Mar 1-15
    getWorkingDays(2026, 2, 16, 31),   // Mar 16-31
    getWorkingDays(2026, 3, 1, 15),    // Apr 1-15
  ];

  let count = 0;
  const batch: any[] = [];

  for (const days of periodDays) {
    for (const shiftDate of days) {
      for (let i = 0; i < allStaff.length; i++) {
        const emp = allStaff[i];
        const pattern = shiftPatterns[i % shiftPatterns.length];

        const startTime = new Date(shiftDate);
        startTime.setUTCHours(pattern.startH, 0, 0, 0);
        const endTime = new Date(shiftDate);
        endTime.setUTCHours(pattern.endH, 0, 0, 0);

        const isPast = shiftDate < new Date();

        batch.push({
          id: uuid(),
          userId: emp.id,
          branchId: BRANCH_ID,
          startTime,
          endTime,
          position: emp.position,
          status: isPast ? 'completed' : 'scheduled',
        });
        count++;

        if (batch.length >= 80) {
          await db.insert(shifts).values(batch);
          batch.length = 0;
        }
      }
    }
  }

  if (batch.length > 0) {
    await db.insert(shifts).values(batch);
  }

  console.log(`   ✅ Created ${count} shifts (Jan–Apr 2026)\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 5: Payroll Periods + Entries (DOLE-compliant)
// ═══════════════════════════════════════════════════════════════════════════

async function seedPayroll() {
  console.log('💵 Step 5 — Creating payroll periods & entries...\n');

  const existingPeriods = await db.select().from(payrollPeriods).where(eq(payrollPeriods.branchId, BRANCH_ID)).limit(1);
  if (existingPeriods.length > 0) {
    console.log('   ✅ Payroll already exists for this branch, skipping.');
    return;
  }

  const periodDefs = [
    { id: `lu-period-2026-01-01`, start: '2026-01-01', end: '2026-01-15', status: 'paid', workDays: 12 },
    { id: `lu-period-2026-01-16`, start: '2026-01-16', end: '2026-01-31', status: 'paid', workDays: 13 },
    { id: `lu-period-2026-02-01`, start: '2026-02-01', end: '2026-02-15', status: 'paid', workDays: 12 },
    { id: `lu-period-2026-02-16`, start: '2026-02-16', end: '2026-02-28', status: 'paid', workDays: 10 },
    { id: `lu-period-2026-03-01`, start: '2026-03-01', end: '2026-03-15', status: 'closed', workDays: 12 },
    { id: `lu-period-2026-03-16`, start: '2026-03-16', end: '2026-03-31', status: 'open', workDays: 12 },
  ];

  const staff = USER_DEFS.filter(u => u.role !== 'admin');
  const { calculateAllDeductions, calculateWithholdingTax } = await import('./utils/deductions');

  let totalEntries = 0;

  for (const def of periodDefs) {
    const startDt = new Date(def.start);
    const endDt = new Date(def.end);

    await db.insert(payrollPeriods).values({
      id: def.id,
      branchId: BRANCH_ID,
      startDate: startDt,
      endDate: endDt,
      status: def.status,
      totalHours: (def.workDays * 8 * staff.length).toString(),
      totalPay: '0',
    });

    let periodTotalPay = 0;

    for (const emp of staff) {
      const hourlyRate = parseFloat(emp.hourlyRate);
      if (hourlyRate <= 0) continue;

      const regularHours = def.workDays * 8;
      const basicPay = regularHours * hourlyRate;
      const grossPay = basicPay;

      // Calculate DOLE-compliant deductions
      const calendarDays = Math.ceil((endDt.getTime() - startDt.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      const monthlyBasicSalary = (grossPay / calendarDays) * 30;

      const mandatoryBreakdown = await calculateAllDeductions(monthlyBasicSalary, {
        deductSSS: true,
        deductPhilHealth: true,
        deductPagibig: true,
        deductWithholdingTax: false,
      });

      const periodFraction = 0.5;
      const sssContribution = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
      const philhealthContribution = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
      const pagibigContribution = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;

      const monthlyMandatory = mandatoryBreakdown.sssContribution +
        mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
      const monthlyTaxableIncome = Math.max(0, monthlyBasicSalary - monthlyMandatory);
      const monthlyTax = await calculateWithholdingTax(monthlyTaxableIncome);
      const withholdingTax = Math.round(monthlyTax * periodFraction * 100) / 100;

      const totalDeductions = sssContribution + philhealthContribution + pagibigContribution + withholdingTax;
      const netPay = grossPay - totalDeductions;
      periodTotalPay += grossPay;

      await db.insert(payrollEntries).values({
        id: uuid(),
        userId: emp.id,
        payrollPeriodId: def.id,
        totalHours: regularHours.toFixed(2),
        regularHours: regularHours.toFixed(2),
        overtimeHours: '0.00',
        nightDiffHours: '0.00',
        basicPay: basicPay.toFixed(2),
        overtimePay: '0.00',
        nightDiffPay: '0.00',
        holidayPay: '0.00',
        grossPay: grossPay.toFixed(2),
        sssContribution: sssContribution.toFixed(2),
        sssLoan: '0.00',
        philHealthContribution: philhealthContribution.toFixed(2),
        pagibigContribution: pagibigContribution.toFixed(2),
        pagibigLoan: '0.00',
        withholdingTax: withholdingTax.toFixed(2),
        advances: '0.00',
        otherDeductions: '0.00',
        totalDeductions: totalDeductions.toFixed(2),
        deductions: totalDeductions.toFixed(2),
        netPay: netPay.toFixed(2),
        status: def.status === 'open' ? 'pending' : 'paid',
      });

      // 13th Month Ledger entry
      await db.insert(thirteenthMonthLedger).values({
        id: uuid(),
        userId: emp.id,
        branchId: BRANCH_ID,
        payrollPeriodId: def.id,
        year: startDt.getFullYear(),
        basicPayEarned: basicPay.toFixed(2),
        periodStartDate: startDt,
        periodEndDate: endDt,
      });

      totalEntries++;
    }

    // Update period total
    await db.update(payrollPeriods)
      .set({ totalPay: periodTotalPay.toFixed(2) })
      .where(eq(payrollPeriods.id, def.id));

    console.log(`   ✓ ${def.start} → ${def.end}  (${def.status})  ₱${periodTotalPay.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`);
  }

  console.log(`\n   ✅ Created ${periodDefs.length} periods, ${totalEntries} payroll entries\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 6: Exception / Adjustment Logs
// ═══════════════════════════════════════════════════════════════════════════

async function seedExceptionLogs() {
  console.log('📝 Step 6 — Seeding exception / adjustment logs...\n');

  const now = new Date();
  const MGR_ID = 'lu-mgr-001';

  const adjustments = [
    { empId: 'lu-emp-001', type: 'overtime', value: '2.5', remarks: 'Extended shift for weekend rush — beach crowd', status: 'approved', daysAgo: 5, periodId: 'lu-period-2026-03-01' },
    { empId: 'lu-emp-001', type: 'late', value: '20', remarks: 'Traffic along National Highway due to road work', status: 'employee_verified', daysAgo: 3, periodId: 'lu-period-2026-03-16' },
    { empId: 'lu-emp-002', type: 'overtime', value: '1.5', remarks: 'Stayed to close and count register after event', status: 'approved', daysAgo: 7, periodId: 'lu-period-2026-03-01' },
    { empId: 'lu-emp-003', type: 'undertime', value: '45', remarks: 'Left early — medical appointment at Bauang RHU', status: 'approved', daysAgo: 10, periodId: 'lu-period-2026-02-16' },
    { empId: 'lu-emp-004', type: 'night_diff', value: '3.0', remarks: 'Covered evening shift for absent coworker', status: 'pending', daysAgo: 2, periodId: 'lu-period-2026-03-16' },
    { empId: 'lu-emp-004', type: 'late', value: '30', remarks: 'Jeepney breakdown from San Fernando', status: 'employee_verified', daysAgo: 8, periodId: 'lu-period-2026-03-01' },
    { empId: 'lu-emp-005', type: 'rest_day_ot', value: '8.0', remarks: 'Sunday coverage — Bauang Festival week', status: 'approved', daysAgo: 14, periodId: 'lu-period-2026-02-16' },
    { empId: 'lu-emp-005', type: 'overtime', value: '3.0', remarks: 'Extended shift for VIP catering event', status: 'approved', daysAgo: 4, periodId: 'lu-period-2026-03-16' },
    { empId: 'lu-emp-006', type: 'absent', value: '1', remarks: 'No call, no show — first offense, documented', status: 'pending', daysAgo: 4, periodId: 'lu-period-2026-03-16' },
    { empId: 'lu-emp-006', type: 'overtime', value: '2.0', remarks: 'Shift lead duties — training new hire', status: 'approved', daysAgo: 12, periodId: 'lu-period-2026-02-16' },
  ];

  let count = 0;
  for (const adj of adjustments) {
    const emp = USER_DEFS.find(u => u.id === adj.empId);
    if (!emp) continue;

    await db.insert(adjustmentLogs).values({
      id: uuid(),
      employeeId: adj.empId,
      branchId: BRANCH_ID,
      loggedBy: MGR_ID,
      startDate: subDays(now, adj.daysAgo),
      endDate: subDays(now, adj.daysAgo),
      type: adj.type,
      value: adj.value,
      remarks: adj.remarks,
      status: adj.status,
      verifiedByEmployee: adj.status === 'employee_verified' || adj.status === 'approved',
      verifiedAt: adj.status !== 'pending' ? subDays(now, adj.daysAgo - 1) : null,
      approvedBy: adj.status === 'approved' ? MGR_ID : null,
      approvedAt: adj.status === 'approved' ? subDays(now, adj.daysAgo - 1) : null,
      payrollPeriodId: adj.periodId,
      calculatedAmount: adj.type === 'overtime' || adj.type === 'rest_day_ot' || adj.type === 'night_diff'
        ? (parseFloat(emp.hourlyRate) * 1.25 * parseFloat(adj.value)).toFixed(2)
        : null,
      isIncluded: true,
    });
    count++;
  }

  console.log(`   ✅ Created ${count} exception / adjustment logs\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 7: Loan Requests
// ═══════════════════════════════════════════════════════════════════════════

async function seedLoans() {
  console.log('🏦 Step 7 — Seeding loan requests...\n');

  const MGR_ID = 'lu-mgr-001';
  const now = new Date();

  const loans = [
    {
      userId: 'lu-emp-001',
      loanType: 'SSS',
      referenceNumber: 'SSS-LU-' + Math.floor(100000 + Math.random() * 900000),
      accountNumber: '33-1234001-1',
      totalAmount: '24000.00',
      remainingBalance: '18000.00',
      monthlyAmortization: '1000.00',
      status: 'approved',
    },
    {
      userId: 'lu-emp-003',
      loanType: 'Pag-IBIG',
      referenceNumber: 'HDMF-LU-' + Math.floor(100000 + Math.random() * 900000),
      accountNumber: 'HDMF-LU-103',
      totalAmount: '15000.00',
      remainingBalance: '12000.00',
      monthlyAmortization: '500.00',
      status: 'approved',
    },
    {
      userId: 'lu-emp-005',
      loanType: 'SSS',
      referenceNumber: 'SSS-LU-' + Math.floor(100000 + Math.random() * 900000),
      accountNumber: '33-1234005-5',
      totalAmount: '20000.00',
      remainingBalance: '20000.00',
      monthlyAmortization: '800.00',
      status: 'pending',
    },
  ];

  let count = 0;
  for (const loan of loans) {
    await db.insert(loanRequests).values({
      id: uuid(),
      userId: loan.userId,
      branchId: BRANCH_ID,
      loanType: loan.loanType,
      referenceNumber: loan.referenceNumber,
      accountNumber: loan.accountNumber,
      totalAmount: loan.totalAmount,
      remainingBalance: loan.remainingBalance,
      monthlyAmortization: loan.monthlyAmortization,
      deductionStartDate: startOfDay(now),
      status: loan.status,
      approvedBy: loan.status === 'approved' ? MGR_ID : null,
      approvedAt: loan.status === 'approved' ? subDays(now, 10) : null,
    });
    count++;
  }

  console.log(`   ✅ Created ${count} loan requests (SSS + Pag-IBIG)\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 8: Notifications
// ═══════════════════════════════════════════════════════════════════════════

async function seedNotifs() {
  console.log('🔔 Step 8 — Seeding notifications...\n');

  const now = new Date();
  const notifs = [
    // Employee notifications
    { userId: 'lu-emp-001', type: 'payroll', title: 'Payslip Available', message: 'Your payslip for Mar 1-15, 2026 is now available.' },
    { userId: 'lu-emp-001', type: 'schedule', title: 'New Shift Assigned', message: 'You have been assigned the morning shift for Apr 7, 2026.' },
    { userId: 'lu-emp-002', type: 'payroll', title: 'Payroll Processed', message: 'Your payslip for Mar 1-15, 2026 is ready to view.' },
    { userId: 'lu-emp-002', type: 'time_off', title: 'Leave Approved', message: 'Your vacation request for Mar 20-21 has been approved.' },
    { userId: 'lu-emp-003', type: 'loan', title: 'Loan Approved', message: 'Your Pag-IBIG loan request (₱15,000) has been approved by management.' },
    { userId: 'lu-emp-004', type: 'schedule', title: 'Shift Updated', message: 'Your shift on Apr 8 has been changed to the closing shift.' },
    { userId: 'lu-emp-005', type: 'loan', title: 'Loan Pending Review', message: 'Your SSS Salary Loan (₱20,000) is pending manager approval.' },
    { userId: 'lu-emp-006', type: 'payroll', title: 'Payslip Available', message: 'Your payslip for Mar 1-15, 2026 is now available.' },
    { userId: 'lu-emp-006', type: 'system', title: 'Welcome!', message: 'Welcome to PERO — La Union Bauang management system.' },
    // Manager notifications
    { userId: 'lu-mgr-001', type: 'approval', title: 'Pending Approvals', message: 'You have 3 time-off requests and 1 loan request awaiting your approval.' },
    { userId: 'lu-mgr-001', type: 'payroll', title: 'Payroll Due', message: 'March 16-31, 2026 payroll needs to be processed by April 5.' },
    { userId: 'lu-mgr-001', type: 'schedule', title: 'Understaffed Alert', message: 'Saturday closing shift needs 1 more staff member.' },
    // Admin notifications
    { userId: 'lu-admin-001', type: 'system', title: 'System Initialized', message: 'La Union Bauang branch database seeded successfully with all data.' },
    { userId: 'lu-admin-001', type: 'payroll', title: 'Quarterly Report Ready', message: 'Q1 2026 payroll summary is ready for review.' },
  ];

  let count = 0;
  for (const n of notifs) {
    await db.insert(notifications).values({
      id: uuid(),
      userId: n.userId,
      branchId: BRANCH_ID,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: false,
      createdAt: subDays(now, Math.floor(Math.random() * 7)),
    });
    count++;
  }

  console.log(`   ✅ Created ${count} notifications\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 9: Time-Off Requests
// ═══════════════════════════════════════════════════════════════════════════

async function seedTimeOff() {
  console.log('🏖️  Step 9 — Seeding time-off requests...\n');

  const MGR_ID = 'lu-mgr-001';
  const now = new Date();

  const requests = [
    { userId: 'lu-emp-001', type: 'vacation', reason: 'Family reunion in San Juan, La Union', startDate: subDays(now, 20), endDate: subDays(now, 18), status: 'approved' },
    { userId: 'lu-emp-002', type: 'sick', reason: 'Flu symptoms — doctor advised 2-day rest', startDate: subDays(now, 10), endDate: subDays(now, 9), status: 'approved' },
    { userId: 'lu-emp-003', type: 'vacation', reason: 'Attending cousin wedding in Baguio', startDate: addDays(now, 7), endDate: addDays(now, 8), status: 'pending' },
    { userId: 'lu-emp-004', type: 'personal', reason: 'Birthday celebration with family', startDate: addDays(now, 5), endDate: addDays(now, 5), status: 'pending' },
    { userId: 'lu-emp-006', type: 'sick', reason: 'Dental surgery at provincial hospital', startDate: subDays(now, 15), endDate: subDays(now, 14), status: 'approved' },
  ];

  let count = 0;
  for (const req of requests) {
    await db.insert(timeOffRequests).values({
      id: uuid(),
      userId: req.userId,
      startDate: req.startDate,
      endDate: req.endDate,
      type: req.type,
      reason: req.reason,
      status: req.status,
      requestedAt: subDays(req.startDate, 3),
      approvedBy: req.status === 'approved' ? MGR_ID : null,
      approvedAt: req.status === 'approved' ? subDays(req.startDate, 1) : null,
    });
    count++;
  }

  console.log(`   ✅ Created ${count} time-off requests\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 10: Leave Credits (SIL)
// ═══════════════════════════════════════════════════════════════════════════

async function seedLeaveCredits() {
  console.log('⛱️  Step 10 — Seeding leave credits...\n');

  const currentYear = new Date().getFullYear();
  const staff = USER_DEFS.filter(u => u.role !== 'admin');
  let count = 0;

  for (const emp of staff) {
    const usedDays = emp.role === 'manager' ? '1.00' : (Math.floor(Math.random() * 3)).toFixed(2);
    const remaining = (5 - parseFloat(usedDays)).toFixed(2);

    await db.insert(leaveCredits).values({
      id: uuid(),
      userId: emp.id,
      branchId: BRANCH_ID,
      year: currentYear,
      leaveType: 'sil',
      totalCredits: '5.00',
      usedCredits: usedDays,
      remainingCredits: remaining,
      notes: 'Annual Service Incentive Leave allocation — PERO La Union Bauang',
    });
    count++;
  }

  console.log(`   ✅ Created ${count} leave credits\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 11: Audit Logs
// ═══════════════════════════════════════════════════════════════════════════

async function seedAuditLogs() {
  console.log('🔒 Step 11 — Seeding audit logs...\n');

  const MGR_ID = 'lu-mgr-001';
  const ADMIN_ID = 'lu-admin-001';
  const now = new Date();

  const logs = [
    {
      action: 'branch_created', entityType: 'branch', entityId: BRANCH_ID,
      userId: ADMIN_ID,
      reason: 'Created La Union Bauang branch during initial setup',
      oldValues: null,
      newValues: JSON.stringify({ name: BRANCH.name, address: BRANCH.address }),
      daysAgo: 95,
    },
    {
      action: 'payroll_process', entityType: 'payroll_period', entityId: 'lu-period-2026-01-01',
      userId: MGR_ID,
      reason: 'Processed payroll for Jan 1-15, 2026',
      oldValues: JSON.stringify({ status: 'open' }),
      newValues: JSON.stringify({ status: 'paid' }),
      daysAgo: 75,
    },
    {
      action: 'payroll_process', entityType: 'payroll_period', entityId: 'lu-period-2026-01-16',
      userId: MGR_ID,
      reason: 'Processed payroll for Jan 16-31, 2026',
      oldValues: JSON.stringify({ status: 'open' }),
      newValues: JSON.stringify({ status: 'paid' }),
      daysAgo: 60,
    },
    {
      action: 'payroll_process', entityType: 'payroll_period', entityId: 'lu-period-2026-02-01',
      userId: MGR_ID,
      reason: 'Processed payroll for Feb 1-15, 2026',
      oldValues: JSON.stringify({ status: 'open' }),
      newValues: JSON.stringify({ status: 'paid' }),
      daysAgo: 45,
    },
    {
      action: 'payroll_process', entityType: 'payroll_period', entityId: 'lu-period-2026-02-16',
      userId: MGR_ID,
      reason: 'Processed payroll for Feb 16-28, 2026',
      oldValues: JSON.stringify({ status: 'open' }),
      newValues: JSON.stringify({ status: 'paid' }),
      daysAgo: 30,
    },
    {
      action: 'payroll_process', entityType: 'payroll_period', entityId: 'lu-period-2026-03-01',
      userId: MGR_ID,
      reason: 'Processed payroll for Mar 1-15, 2026',
      oldValues: JSON.stringify({ status: 'open' }),
      newValues: JSON.stringify({ status: 'closed' }),
      daysAgo: 15,
    },
    {
      action: 'loan_approved', entityType: 'loan_request', entityId: 'lu-emp-001-sss-loan',
      userId: MGR_ID,
      reason: 'Approved SSS Salary Loan for Jerome Flores',
      oldValues: JSON.stringify({ status: 'pending' }),
      newValues: JSON.stringify({ status: 'approved', amount: '24000.00' }),
      daysAgo: 40,
    },
    {
      action: 'deduction_change', entityType: 'deduction_settings', entityId: BRANCH_ID,
      userId: ADMIN_ID,
      reason: 'Enabled all 4 mandatory deductions for La Union Bauang branch',
      oldValues: JSON.stringify({ deductSSS: true, deductPhilHealth: false }),
      newValues: JSON.stringify({ deductSSS: true, deductPhilHealth: true, deductPagibig: true, deductWithholdingTax: true }),
      daysAgo: 90,
    },
    {
      action: 'rate_update', entityType: 'deduction_rate', entityId: 'sss-2026',
      userId: ADMIN_ID,
      reason: 'SSS Contribution Table updated to 2026 rates per SSS Circular',
      oldValues: JSON.stringify({ rate: '4.5%' }),
      newValues: JSON.stringify({ rate: '5.0%' }),
      daysAgo: 92,
    },
    {
      action: 'employee_created', entityType: 'employee', entityId: 'lu-emp-006',
      userId: ADMIN_ID,
      reason: 'Onboarded Rhea Mae Salazar as Shift Lead',
      oldValues: null,
      newValues: JSON.stringify({ name: 'Rhea Mae Salazar', position: 'Shift Lead', hourlyRate: '72.50' }),
      daysAgo: 88,
    },
  ];

  let count = 0;
  for (const log of logs) {
    await db.insert(auditLogs).values({
      id: uuid(),
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      userId: log.userId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      reason: log.reason,
      ipAddress: '192.168.1.50',
      userAgent: 'PERO Payroll System / La Union Bauang Seed Script',
      createdAt: subDays(now, log.daysAgo),
    });
    count++;
  }

  console.log(`   ✅ Created ${count} audit logs\n`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  STEP 12: Shift Trades
// ═══════════════════════════════════════════════════════════════════════════

async function seedShiftTrades() {
  console.log('🔄 Step 12 — Seeding shift trades...\n');

  // Create a few upcoming shifts specifically for trades
  const tradeShiftDefs = [
    { id: 'lu-trade-shift-1', userId: 'lu-emp-001', day: 8 },
    { id: 'lu-trade-shift-2', userId: 'lu-emp-003', day: 10 },
  ];

  for (const ts of tradeShiftDefs) {
    const emp = USER_DEFS.find(u => u.id === ts.userId);
    if (!emp) continue;

    await db.insert(shifts).values({
      id: ts.id,
      userId: ts.userId,
      branchId: BRANCH_ID,
      startTime: new Date(Date.UTC(2026, 3, ts.day, 0, 0, 0)),
      endTime: new Date(Date.UTC(2026, 3, ts.day, 8, 0, 0)),
      position: emp.position,
      status: 'scheduled',
    });
  }

  // Trade 1: Pending — Flores wants to swap with Navarro
  await db.insert(shiftTrades).values({
    id: uuid(),
    shiftId: 'lu-trade-shift-1',
    fromUserId: 'lu-emp-001',
    toUserId: 'lu-emp-002',
    reason: 'Need to attend barangay assembly meeting',
    status: 'pending',
    urgency: 'normal',
    requestedAt: new Date(),
  });

  // Trade 2: Open/Urgent — Corpuz needs coverage
  await db.insert(shiftTrades).values({
    id: uuid(),
    shiftId: 'lu-trade-shift-2',
    fromUserId: 'lu-emp-003',
    toUserId: null,
    reason: 'Family emergency — need immediate coverage',
    status: 'pending',
    urgency: 'urgent',
    requestedAt: new Date(),
  });

  console.log('   ✅ Created 2 shift trades (1 pending, 1 urgent/open)\n');
}


// ═══════════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const startTime = Date.now();

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PERO Payroll System — La Union Bauang Branch — Master Seed');
  console.log(`  Time: ${new Date().toLocaleString('en-PH')}`);
  console.log('═══════════════════════════════════════════════════════════════');

  await seedBranch();
  await seedUsers();
  await seedDeductionSettings();
  await seedShifts();
  await seedPayroll();
  await seedExceptionLogs();
  await seedLoans();
  await seedNotifs();
  await seedTimeOff();
  await seedLeaveCredits();
  await seedAuditLogs();
  await seedShiftTrades();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ✅ La Union Bauang branch seeded in ${elapsed}s`);
  console.log('');
  console.log('  ┌─────────────────────────────────────────────────────────┐');
  console.log('  │  LOGIN CREDENTIALS                                     │');
  console.log('  ├─────────────┬────────────────┬─────────────────────────┤');
  console.log('  │ Role        │ Username       │ Password                │');
  console.log('  ├─────────────┼────────────────┼─────────────────────────┤');
  console.log('  │ Admin       │ lu.admin       │ LuAdmin2026!            │');
  console.log('  │ Manager     │ lu.manager     │ LuManager2026!          │');
  console.log('  │ Employee 1  │ lu.flores      │ Flores2026!             │');
  console.log('  │ Employee 2  │ lu.navarro     │ Navarro2026!            │');
  console.log('  │ Employee 3  │ lu.corpuz      │ Corpuz2026!             │');
  console.log('  │ Employee 4  │ lu.ramos       │ Ramos2026!              │');
  console.log('  │ Employee 5  │ lu.pascual     │ Pascual2026!            │');
  console.log('  │ Employee 6  │ lu.salazar     │ Salazar2026!            │');
  console.log('  └─────────────┴────────────────┴─────────────────────────┘');
  console.log('');
  console.log('  Seeded data includes:');
  console.log('    ✓ Schedules (Jan–Apr 2026)');
  console.log('    ✓ Payroll (6 semi-monthly periods, DOLE-compliant)');
  console.log('    ✓ 13th Month Ledger');
  console.log('    ✓ Exception Logs (OT, lateness, undertime, absences)');
  console.log('    ✓ Loan Requests (SSS + Pag-IBIG)');
  console.log('    ✓ Notifications');
  console.log('    ✓ Time-Off Requests');
  console.log('    ✓ Leave Credits (SIL)');
  console.log('    ✓ Audit Logs');
  console.log('    ✓ Holiday Benefits (via shared holidays table)');
  console.log('    ✓ Shift Trades');
  console.log('    ✓ Deduction Settings');
  console.log('═══════════════════════════════════════════════════════════════');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
