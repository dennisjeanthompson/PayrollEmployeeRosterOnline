/**
 * Master Seed Script — PERO Don Mac Citaos, La Union Branch
 * 
 * Creates a full branch with 1 manager + 6 employees.
 * Seeds: schedules, payroll, 13th month, loans, time-off, shift trades,
 *        exception/adjustment logs, audit logs, notifications, leave credits.
 *
 * Run with: npx tsx tools/seed-launion.ts
 */

import 'dotenv/config';
import { db } from '../server/db';
import {
  branches, users, shifts, shiftTrades, payrollPeriods, payrollEntries,
  timeOffRequests, notifications, adjustmentLogs, auditLogs,
  thirteenthMonthLedger, loanRequests, leaveCredits, approvals,
  deductionSettings,
} from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { calculateAllDeductions, calculateWithholdingTax } from '../server/utils/deductions';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const BRANCH_ID = 'branch-launion';
const BRANCH = {
  id: BRANCH_ID,
  name: 'PERO – Don Mac Citaos, La Union',
  address: 'National Highway, Don Mac Citaos, San Fernando, La Union',
  phone: '(072) 888-7654',
  isActive: true,
};

// Manager
const MANAGER = {
  id: 'user-launion-mgr-1',
  username: 'villanueva.j',
  password: 'password123',
  firstName: 'Jose',
  lastName: 'Villanueva',
  email: 'villanueva.j@perocafe.ph',
  role: 'manager',
  position: 'Branch Manager',
  hourlyRate: '120.00',
  branchId: BRANCH_ID,
  tin: '456-789-012',
  sssNumber: '07-7654321-8',
  philhealthNumber: '07-876543210-5',
  pagibigNumber: '8765-4321-0987',
};

// 6 Employees with various positions + some with loans
const EMPLOYEES = [
  {
    id: 'user-launion-emp-1',
    username: 'ramos.m',
    password: 'password123',
    firstName: 'Miguel',
    lastName: 'Ramos',
    email: 'ramos.m@perocafe.ph',
    role: 'employee',
    position: 'Senior Barista',
    hourlyRate: '90.00',
    branchId: BRANCH_ID,
    sssLoanDeduction: '600',
    tin: '111-222-333',
    sssNumber: '07-1111111-1',
    philhealthNumber: '07-111111111-1',
    pagibigNumber: '1111-1111-1111',
  },
  {
    id: 'user-launion-emp-2',
    username: 'aquino.c',
    password: 'password123',
    firstName: 'Carmen',
    lastName: 'Aquino',
    email: 'aquino.c@perocafe.ph',
    role: 'employee',
    position: 'Cashier',
    hourlyRate: '82.00',
    branchId: BRANCH_ID,
    pagibigLoanDeduction: '400',
    tin: '222-333-444',
    sssNumber: '07-2222222-2',
    philhealthNumber: '07-222222222-2',
    pagibigNumber: '2222-2222-2222',
  },
  {
    id: 'user-launion-emp-3',
    username: 'lopez.a',
    password: 'password123',
    firstName: 'Andres',
    lastName: 'Lopez',
    email: 'lopez.a@perocafe.ph',
    role: 'employee',
    position: 'Kitchen Staff',
    hourlyRate: '80.00',
    branchId: BRANCH_ID,
    cashAdvanceDeduction: '500',
    tin: '333-444-555',
    sssNumber: '07-3333333-3',
    philhealthNumber: '07-333333333-3',
    pagibigNumber: '3333-3333-3333',
  },
  {
    id: 'user-launion-emp-4',
    username: 'fernandez.r',
    password: 'password123',
    firstName: 'Rosa',
    lastName: 'Fernandez',
    email: 'fernandez.r@perocafe.ph',
    role: 'employee',
    position: 'Server',
    hourlyRate: '80.00',
    branchId: BRANCH_ID,
    tin: '444-555-666',
    sssNumber: '07-4444444-4',
    philhealthNumber: '07-444444444-4',
    pagibigNumber: '4444-4444-4444',
  },
  {
    id: 'user-launion-emp-5',
    username: 'navarro.d',
    password: 'password123',
    firstName: 'Diego',
    lastName: 'Navarro',
    email: 'navarro.d@perocafe.ph',
    role: 'employee',
    position: 'Barista',
    hourlyRate: '82.50',
    branchId: BRANCH_ID,
    sssLoanDeduction: '450',
    pagibigLoanDeduction: '300',
    tin: '555-666-777',
    sssNumber: '07-5555555-5',
    philhealthNumber: '07-555555555-5',
    pagibigNumber: '5555-5555-5555',
  },
  {
    id: 'user-launion-emp-6',
    username: 'santiago.l',
    password: 'password123',
    firstName: 'Liza',
    lastName: 'Santiago',
    email: 'santiago.l@perocafe.ph',
    role: 'employee',
    position: 'Shift Lead',
    hourlyRate: '95.00',
    branchId: BRANCH_ID,
    tin: '666-777-888',
    sssNumber: '07-6666666-6',
    philhealthNumber: '07-666666666-6',
    pagibigNumber: '6666-6666-6666',
  },
];

const ALL_STAFF = [MANAGER, ...EMPLOYEES];

// Payroll periods (semi-monthly, Jan–Mar 2026)
const PERIODS = [
  { id: 'launion-period-2026-01-01', start: '2026-01-01', end: '2026-01-15', status: 'closed' },
  { id: 'launion-period-2026-01-16', start: '2026-01-16', end: '2026-01-31', status: 'closed' },
  { id: 'launion-period-2026-02-01', start: '2026-02-01', end: '2026-02-15', status: 'closed' },
  { id: 'launion-period-2026-02-16', start: '2026-02-16', end: '2026-02-28', status: 'closed' },
  { id: 'launion-period-2026-03-01', start: '2026-03-01', end: '2026-03-15', status: 'open' },
  { id: 'launion-period-2026-03-16', start: '2026-03-16', end: '2026-03-31', status: 'open' },
];

// Shift patterns (PHT = UTC+8)
const SHIFT_PATTERNS = [
  { start: 0, end: 8 },   // 8AM–4PM PHT
  { start: 1, end: 9 },   // 9AM–5PM
  { start: 2, end: 10 },  // 10AM–6PM
  { start: 4, end: 12 },  // 12PM–8PM
  { start: 6, end: 14 },  // 2PM–10PM
  { start: 8, end: 16 },  // 4PM–12AM
  { start: 10, end: 18 }, // 6PM–2AM (night diff)
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getDaysInRange(start: string, end: string): Date[] {
  const days: Date[] = [];
  const s = new Date(start);
  const e = new Date(end);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n' + '═'.repeat(70));
  console.log('  PERO Don Mac Citaos, La Union — Master Seed');
  console.log('═'.repeat(70));

  // ── 1. BRANCH ──────────────────────────────────────────────
  console.log('\n🏪 Creating branch...');
  await db.insert(branches).values(BRANCH).onConflictDoNothing();
  console.log(`   ✅ ${BRANCH.name}`);

  // ── 2. DEDUCTION SETTINGS ──────────────────────────────────
  console.log('\n⚙️  Setting deduction config...');
  await db.insert(deductionSettings).values({
    id: `deduction-settings-${BRANCH_ID}`,
    branchId: BRANCH_ID,
    deductSSS: true,
    deductPhilHealth: true,
    deductPagibig: true,
    deductWithholdingTax: true,
  }).onConflictDoNothing();
  console.log('   ✅ SSS, PhilHealth, Pag-IBIG, Tax all enabled');

  // ── 3. USERS ───────────────────────────────────────────────
  console.log('\n👥 Creating manager + 6 employees...');
  for (const u of ALL_STAFF) {
    const hashedPw = await bcrypt.hash(u.password, 10);
    await db.insert(users).values({
      ...u,
      password: hashedPw,
      isActive: true,
    } as any).onConflictDoNothing();
    console.log(`   ✅ ${u.username.padEnd(16)} ${u.role.padEnd(9)} ${u.firstName} ${u.lastName} (${u.position})`);
  }

  // ── 4. SHIFTS ─────────────────────────────────────────────
  console.log('\n📅 Creating shifts (Jan–Mar 2026, all staff)...');
  let shiftCount = 0;
  for (const period of PERIODS) {
    const days = getDaysInRange(period.start, period.end);
    for (const day of days) {
      for (let i = 0; i < ALL_STAFF.length; i++) {
        const emp = ALL_STAFF[i];
        const pattern = SHIFT_PATTERNS[i % SHIFT_PATTERNS.length];
        const startTime = new Date(day);
        startTime.setUTCHours(pattern.start, 0, 0, 0);
        const endTime = new Date(day);
        endTime.setUTCHours(pattern.end, 0, 0, 0);

        await db.insert(shifts).values({
          id: randomUUID(),
          userId: emp.id,
          branchId: BRANCH_ID,
          startTime,
          endTime,
          position: emp.position,
          status: 'completed',
        });
        shiftCount++;
      }
    }
  }
  console.log(`   ✅ ${shiftCount} shifts created`);

  // ── 5. PAYROLL PERIODS + ENTRIES ──────────────────────────
  console.log('\n💰 Creating payroll periods & entries with DOLE deductions...');
  for (const period of PERIODS) {
    const days = getDaysInRange(period.start, period.end);
    const daysCount = days.length;
    let periodTotal = 0;

    await db.insert(payrollPeriods).values({
      id: period.id,
      branchId: BRANCH_ID,
      startDate: new Date(period.start),
      endDate: new Date(period.end),
      status: period.status,
      totalHours: '0',
      totalPay: '0',
    }).onConflictDoNothing();

    for (const emp of ALL_STAFF) {
      if (emp.role === 'manager' && emp.id === MANAGER.id) {
        // Manager also gets paid
      }
      const rate = parseFloat(emp.hourlyRate);
      const hoursPerDay = 8;
      const totalHours = daysCount * hoursPerDay;
      const basicPay = totalHours * rate;

      // Random OT for some employees
      const otHours = Math.random() > 0.6 ? Math.round(Math.random() * 4 * 10) / 10 : 0;
      const overtimePay = otHours * rate * 1.25;

      // Night diff for shift pattern 6 (6PM–2AM)
      const empIdx = ALL_STAFF.indexOf(emp);
      const isNightShift = (empIdx % SHIFT_PATTERNS.length) >= 5;
      const ndHours = isNightShift ? daysCount * 4 : 0;
      const nightDiffPay = ndHours * rate * 0.1;

      const grossPay = basicPay + overtimePay + nightDiffPay;

      // Calculate deductions (monthly equivalent)
      const periodFraction = daysCount < 28 ? 0.5 : 1;
      const monthlyBasic = basicPay / periodFraction;
      const deductions = await calculateAllDeductions(monthlyBasic, {
        deductSSS: true, deductPhilHealth: true, deductPagibig: true, deductWithholdingTax: false,
      });

      const sss = Math.round(deductions.sssContribution * periodFraction * 100) / 100;
      const ph = Math.round(deductions.philHealthContribution * periodFraction * 100) / 100;
      const pi = Math.round(deductions.pagibigContribution * periodFraction * 100) / 100;

      // Withholding tax
      const monthlyMandatory = deductions.sssContribution + deductions.philHealthContribution + deductions.pagibigContribution;
      const taxableMonthly = Math.max(0, monthlyBasic - monthlyMandatory);
      const monthlyTax = await calculateWithholdingTax(taxableMonthly);
      const tax = Math.round(monthlyTax * periodFraction * 100) / 100;

      // Loans
      const sssLoan = parseFloat((emp as any).sssLoanDeduction || '0') * periodFraction;
      const pagibigLoan = parseFloat((emp as any).pagibigLoanDeduction || '0') * periodFraction;
      const cashAdvance = parseFloat((emp as any).cashAdvanceDeduction || '0') * periodFraction;

      const totalDeductions = sss + ph + pi + tax + sssLoan + pagibigLoan + cashAdvance;
      const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

      await db.insert(payrollEntries).values({
        id: randomUUID(),
        userId: emp.id,
        payrollPeriodId: period.id,
        totalHours: totalHours.toFixed(2),
        regularHours: (totalHours - otHours - ndHours).toFixed(2),
        overtimeHours: otHours.toFixed(2),
        nightDiffHours: ndHours.toFixed(2),
        basicPay: basicPay.toFixed(2),
        overtimePay: overtimePay.toFixed(2),
        nightDiffPay: nightDiffPay.toFixed(2),
        holidayPay: '0',
        restDayPay: '0',
        grossPay: grossPay.toFixed(2),
        sssContribution: sss.toFixed(2),
        sssLoan: sssLoan.toFixed(2),
        philHealthContribution: ph.toFixed(2),
        pagibigContribution: pi.toFixed(2),
        pagibigLoan: pagibigLoan.toFixed(2),
        withholdingTax: tax.toFixed(2),
        advances: cashAdvance.toFixed(2),
        otherDeductions: '0',
        totalDeductions: totalDeductions.toFixed(2),
        netPay: netPay.toFixed(2),
        status: period.status === 'closed' ? 'paid' : 'pending',
      });

      periodTotal += grossPay;
    }

    // Update period totals
    await db.update(payrollPeriods)
      .set({ totalPay: periodTotal.toFixed(2) })
      .where(eq(payrollPeriods.id, period.id));

    console.log(`   ✅ ${period.id}: ${ALL_STAFF.length} entries, total ₱${periodTotal.toFixed(2)}`);
  }

  // ── 6. 13TH MONTH LEDGER ─────────────────────────────────
  console.log('\n🎄 Seeding 13th month ledger...');
  for (const period of PERIODS) {
    for (const emp of ALL_STAFF) {
      const rate = parseFloat(emp.hourlyRate);
      const days = getDaysInRange(period.start, period.end).length;
      const basicPay = days * 8 * rate;
      await db.insert(thirteenthMonthLedger).values({
        id: randomUUID(),
        userId: emp.id,
        branchId: BRANCH_ID,
        payrollPeriodId: period.id,
        year: 2026,
        basicPayEarned: basicPay.toFixed(2),
        periodStartDate: new Date(period.start),
        periodEndDate: new Date(period.end),
      });
    }
  }
  console.log(`   ✅ ${PERIODS.length * ALL_STAFF.length} ledger rows (Jan–Mar 2026)`);

  // ── 7. LEAVE CREDITS ──────────────────────────────────────
  console.log('\n🏖️  Seeding leave credits...');
  const leaveTypes = [
    { type: 'sil', total: '5.00' },
    { type: 'vacation', total: '5.00' },
    { type: 'sick', total: '5.00' },
  ];
  for (const emp of EMPLOYEES) {
    for (const lt of leaveTypes) {
      const used = Math.random() > 0.5 ? (Math.floor(Math.random() * 3)).toString() : '0';
      const remaining = (parseFloat(lt.total) - parseFloat(used)).toFixed(2);
      await db.insert(leaveCredits).values({
        id: randomUUID(),
        userId: emp.id,
        branchId: BRANCH_ID,
        year: 2026,
        leaveType: lt.type,
        totalCredits: lt.total,
        usedCredits: used,
        remainingCredits: remaining,
        grantedBy: MANAGER.id,
      });
    }
  }
  console.log(`   ✅ ${EMPLOYEES.length * leaveTypes.length} leave credit records`);

  // ── 8. LOAN REQUESTS ──────────────────────────────────────
  console.log('\n🏦 Seeding loan requests...');
  const loans = [
    { emp: EMPLOYEES[0], type: 'SSS', ref: 'SSS-2026-001234', acct: '07-1111111-1', total: '24000', monthly: '600', status: 'approved' },
    { emp: EMPLOYEES[1], type: 'Pag-IBIG', ref: 'PAGIBIG-2026-005678', acct: '2222-2222-2222', total: '16000', monthly: '400', status: 'approved' },
    { emp: EMPLOYEES[4], type: 'SSS', ref: 'SSS-2026-009012', acct: '07-5555555-5', total: '18000', monthly: '450', status: 'approved' },
    { emp: EMPLOYEES[4], type: 'Pag-IBIG', ref: 'PAGIBIG-2026-003456', acct: '5555-5555-5555', total: '12000', monthly: '300', status: 'approved' },
    { emp: EMPLOYEES[3], type: 'SSS', ref: 'SSS-2026-007890', acct: '07-4444444-4', total: '20000', monthly: '500', status: 'pending' },
  ];
  for (const l of loans) {
    const remaining = l.status === 'approved'
      ? (parseFloat(l.total) - parseFloat(l.monthly) * 3).toFixed(2)
      : l.total;
    await db.insert(loanRequests).values({
      id: randomUUID(),
      userId: l.emp.id,
      branchId: BRANCH_ID,
      loanType: l.type,
      referenceNumber: l.ref,
      accountNumber: l.acct,
      totalAmount: l.total,
      remainingBalance: remaining,
      monthlyAmortization: l.monthly,
      deductionStartDate: new Date('2026-01-01'),
      status: l.status,
      approvedBy: l.status === 'approved' ? MANAGER.id : undefined,
      approvedAt: l.status === 'approved' ? new Date('2026-01-01') : undefined,
    });
    console.log(`   ✅ ${l.emp.firstName} ${l.emp.lastName}: ${l.type} ₱${l.total} (${l.status})`);
  }

  // ── 9. TIME-OFF REQUESTS ──────────────────────────────────
  console.log('\n📋 Seeding time-off requests...');
  const timeOffs = [
    { emp: EMPLOYEES[0], type: 'vacation', start: '2026-02-14', end: '2026-02-15', reason: 'Valentine trip to Vigan', status: 'approved' },
    { emp: EMPLOYEES[1], type: 'sick', start: '2026-03-05', end: '2026-03-05', reason: 'Migraine — doctor visit', status: 'approved' },
    { emp: EMPLOYEES[2], type: 'emergency', start: '2026-03-20', end: '2026-03-21', reason: 'Family emergency in Baguio', status: 'pending' },
    { emp: EMPLOYEES[3], type: 'vacation', start: '2026-04-08', end: '2026-04-10', reason: 'Holy Week balik-probinsya', status: 'pending' },
    { emp: EMPLOYEES[4], type: 'sick', start: '2026-02-24', end: '2026-02-24', reason: 'Dental surgery follow-up', status: 'approved' },
    { emp: EMPLOYEES[5], type: 'personal', start: '2026-03-28', end: '2026-03-28', reason: 'Passport renewal at DFA', status: 'pending' },
  ];
  for (const t of timeOffs) {
    await db.insert(timeOffRequests).values({
      id: randomUUID(),
      userId: t.emp.id,
      startDate: new Date(t.start),
      endDate: new Date(t.end),
      type: t.type,
      reason: t.reason,
      status: t.status,
      approvedBy: t.status === 'approved' ? MANAGER.id : undefined,
      approvedAt: t.status === 'approved' ? new Date() : undefined,
    });
    console.log(`   ✅ ${t.emp.firstName}: ${t.type} ${t.start} [${t.status}]`);
  }

  // ── 10. ADJUSTMENT LOGS (OT, Late, Absent, etc.) ──────────
  console.log('\n⏱️  Seeding exception/adjustment logs...');
  const adjustments = [
    { emp: EMPLOYEES[0], type: 'overtime', value: '3', remarks: 'Covered for Miguel on busy Friday', status: 'approved' },
    { emp: EMPLOYEES[1], type: 'late', value: '45', remarks: 'Traffic on national highway', status: 'employee_verified' },
    { emp: EMPLOYEES[2], type: 'absent', value: '1', remarks: 'No call no show — contacted next day, claimed illness', status: 'pending' },
    { emp: EMPLOYEES[3], type: 'overtime', value: '2', remarks: 'Extended shift for catering event', status: 'approved' },
    { emp: EMPLOYEES[4], type: 'undertime', value: '60', remarks: 'Left early — family emergency', status: 'approved' },
    { emp: EMPLOYEES[5], type: 'overtime', value: '4', remarks: 'Inventory count end-of-month', status: 'approved' },
    { emp: EMPLOYEES[5], type: 'night_diff', value: '6', remarks: 'Covered closing shift 10PM–4AM', status: 'approved' },
    { emp: EMPLOYEES[0], type: 'rest_day_ot', value: '8', remarks: 'Worked Sunday for fiesta catering', status: 'approved' },
    { emp: EMPLOYEES[3], type: 'late', value: '30', remarks: 'Jeepney breakdown', status: 'pending' },
    { emp: EMPLOYEES[2], type: 'overtime', value: '1.5', remarks: 'Stayed for deep cleaning', status: 'approved' },
  ];
  for (const a of adjustments) {
    await db.insert(adjustmentLogs).values({
      id: randomUUID(),
      employeeId: a.emp.id,
      branchId: BRANCH_ID,
      loggedBy: MANAGER.id,
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-03-15'),
      type: a.type,
      value: a.value,
      remarks: a.remarks,
      status: a.status,
      verifiedByEmployee: a.status === 'employee_verified' || a.status === 'approved',
      verifiedAt: a.status !== 'pending' ? new Date() : undefined,
      approvedBy: a.status === 'approved' ? MANAGER.id : undefined,
      approvedAt: a.status === 'approved' ? new Date() : undefined,
    });
    console.log(`   ✅ ${a.emp.firstName}: ${a.type} ${a.value} [${a.status}]`);
  }

  // ── 11. SHIFT TRADES ──────────────────────────────────────
  console.log('\n🔄 Seeding shift trades...');
  // Create upcoming scheduled shifts for trades (April 2026)
  const tradeShifts = [
    { emp: EMPLOYEES[0], day: 5 },
    { emp: EMPLOYEES[2], day: 7 },
    { emp: EMPLOYEES[4], day: 9 },
    { emp: EMPLOYEES[5], day: 11 },
  ];
  const tradeShiftIds: string[] = [];
  for (const ts of tradeShifts) {
    const sid = randomUUID();
    await db.insert(shifts).values({
      id: sid,
      userId: ts.emp.id,
      branchId: BRANCH_ID,
      startTime: new Date(Date.UTC(2026, 3, ts.day, 0, 0, 0)),
      endTime: new Date(Date.UTC(2026, 3, ts.day, 8, 0, 0)),
      position: ts.emp.position,
      status: 'scheduled',
    });
    tradeShiftIds.push(sid);
  }

  // Trade 1: Pending (Ramos → Aquino)
  await db.insert(shiftTrades).values({
    id: randomUUID(),
    shiftId: tradeShiftIds[0],
    fromUserId: EMPLOYEES[0].id,
    toUserId: EMPLOYEES[1].id,
    reason: 'Doctor appointment conflict',
    status: 'pending',
    urgency: 'normal',
  });
  // Trade 2: Open/Urgent (Lopez → anyone)
  await db.insert(shiftTrades).values({
    id: randomUUID(),
    shiftId: tradeShiftIds[1],
    fromUserId: EMPLOYEES[2].id,
    toUserId: null,
    reason: 'Family reunion in Baguio — urgent cover needed',
    status: 'pending',
    urgency: 'urgent',
  });
  // Trade 3: Approved (Navarro → Santiago)
  await db.insert(shiftTrades).values({
    id: randomUUID(),
    shiftId: tradeShiftIds[2],
    fromUserId: EMPLOYEES[4].id,
    toUserId: EMPLOYEES[5].id,
    reason: 'Swapping for board exam review',
    status: 'approved',
    urgency: 'normal',
    approvedAt: new Date(),
    approvedBy: MANAGER.id,
  });
  await db.update(shifts).set({ userId: EMPLOYEES[5].id }).where(eq(shifts.id, tradeShiftIds[2]));
  // Trade 4: Rejected (Santiago => Fernandez)
  await db.insert(shiftTrades).values({
    id: randomUUID(),
    shiftId: tradeShiftIds[3],
    fromUserId: EMPLOYEES[5].id,
    toUserId: EMPLOYEES[3].id,
    reason: 'Personal errand',
    status: 'rejected',
    urgency: 'low',
    notes: 'Insufficient coverage — both are evening shift',
  });
  console.log('   ✅ 4 shift trades (pending, urgent/open, approved, rejected)');

  // ── 12. APPROVALS ─────────────────────────────────────────
  console.log('\n✅ Seeding approvals...');
  const approvalItems = [
    { type: 'time_off', requestId: 'time-off-ramos-feb14', requestedBy: EMPLOYEES[0].id, status: 'approved' },
    { type: 'overtime', requestId: 'ot-fernandez-catering', requestedBy: EMPLOYEES[3].id, status: 'approved' },
    { type: 'time_off', requestId: 'time-off-lopez-emergency', requestedBy: EMPLOYEES[2].id, status: 'pending' },
    { type: 'loan', requestId: 'loan-fernandez-sss', requestedBy: EMPLOYEES[3].id, status: 'pending' },
  ];
  for (const a of approvalItems) {
    await db.insert(approvals).values({
      id: randomUUID(),
      type: a.type,
      requestId: a.requestId,
      requestedBy: a.requestedBy,
      approvedBy: a.status === 'approved' ? MANAGER.id : undefined,
      status: a.status,
    });
  }
  console.log(`   ✅ ${approvalItems.length} approval records`);

  // ── 13. AUDIT LOGS ────────────────────────────────────────
  console.log('\n📝 Seeding audit logs...');
  const audits = [
    { action: 'create_employee', entityType: 'employee', entityId: EMPLOYEES[0].id, newValues: { firstName: 'Miguel', lastName: 'Ramos' } },
    { action: 'process_payroll', entityType: 'payroll_period', entityId: PERIODS[0].id, newValues: { status: 'closed', employees: 7 } },
    { action: 'approve_time_off', entityType: 'time_off_request', entityId: 'ramos-vacation', newValues: { type: 'vacation', approved: true } },
    { action: 'approve_loan', entityType: 'loan_request', entityId: 'ramos-sss-loan', newValues: { loanType: 'SSS', amount: 24000 } },
    { action: 'export_payroll', entityType: 'payroll_report', entityId: PERIODS[0].id, newValues: { format: 'csv', entries: 7 } },
    { action: 'export_deductions', entityType: 'deduction_report', entityId: PERIODS[1].id, newValues: { format: 'csv', entries: 7 } },
    { action: 'export_employees', entityType: 'employee_report', entityId: BRANCH_ID, newValues: { format: 'csv', count: 7 } },
    { action: 'update_rate', entityType: 'employee', entityId: EMPLOYEES[5].id, oldValues: JSON.stringify({ hourlyRate: '85.00' }), newValues: { hourlyRate: '95.00', reason: 'Promotion to Shift Lead' } },
    { action: 'approve_adjustment', entityType: 'adjustment_log', entityId: 'ot-ramos', newValues: { type: 'overtime', hours: 3 } },
    { action: 'login', entityType: 'user', entityId: MANAGER.id, newValues: { ip: '192.168.1.100' } },
  ];
  for (const a of audits) {
    await db.insert(auditLogs).values({
      id: randomUUID(),
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      userId: MANAGER.id,
      oldValues: (a as any).oldValues || null,
      newValues: JSON.stringify(a.newValues),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });
  }
  console.log(`   ✅ ${audits.length} audit log entries (login, exports, approvals, rate changes)`);

  // ── 14. NOTIFICATIONS ─────────────────────────────────────
  console.log('\n🔔 Seeding notifications...');
  const notifs = [
    { userId: EMPLOYEES[0].id, type: 'payroll', title: 'Payslip Available', message: 'Your January 1-15 payslip is ready for viewing.' },
    { userId: EMPLOYEES[0].id, type: 'schedule', title: 'Shift Trade Pending', message: 'Your shift trade request for April 5 is pending approval.' },
    { userId: EMPLOYEES[1].id, type: 'time_off', title: 'Sick Leave Approved', message: 'Your sick leave for March 5 has been approved by Manager Villanueva.' },
    { userId: EMPLOYEES[2].id, type: 'approval', title: 'Emergency Leave Pending', message: 'Your emergency leave for March 20-21 is awaiting manager approval.' },
    { userId: EMPLOYEES[3].id, type: 'loan', title: 'Loan Request Submitted', message: 'Your SSS loan request of ₱20,000 has been submitted for review.' },
    { userId: EMPLOYEES[4].id, type: 'payroll', title: 'Deduction Notice', message: 'SSS and Pag-IBIG loan deductions have been applied to your March payslip.' },
    { userId: EMPLOYEES[5].id, type: 'schedule', title: 'Overtime Approved', message: 'Your 4-hour overtime for inventory count has been approved.' },
    { userId: MANAGER.id, type: 'approval', title: '3 Pending Approvals', message: 'You have pending time-off, exception, and loan requests to review.' },
    { userId: MANAGER.id, type: 'payroll', title: 'Payroll Due', message: 'March 16-31 payroll period is open and requires processing.' },
    { userId: MANAGER.id, type: 'schedule', title: 'Urgent Shift Trade', message: 'Andres Lopez has submitted an urgent shift trade request for April 7.' },
  ];
  for (const n of notifs) {
    await db.insert(notifications).values({
      id: randomUUID(),
      userId: n.userId,
      branchId: BRANCH_ID,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: false,
    });
  }
  console.log(`   ✅ ${notifs.length} notifications`);

  // ── DONE ──────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70));
  console.log('  ✅ SEED COMPLETE — Don Mac Citaos, La Union');
  console.log('═'.repeat(70));
  console.log('\n  🔑 LOGIN CREDENTIALS:');
  console.log('  ────────────────────────────────────────────');
  console.log(`  Manager:  ${MANAGER.username.padEnd(16)} pw: ${MANAGER.password}`);
  for (const e of EMPLOYEES) {
    console.log(`  Employee: ${e.username.padEnd(16)} pw: ${e.password}`);
  }
  console.log('  ────────────────────────────────────────────\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ SEED FAILED:', err);
  process.exit(1);
});
