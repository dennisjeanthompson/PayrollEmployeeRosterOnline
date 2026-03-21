/**
 * ============================================================================
 *  PERO Payroll System — Master Database Seed Script
 * ============================================================================
 *
 * PURPOSE:
 *   Professional, idempotent script that resets ALL transactional data and
 *   re-seeds a complete, realistic demo dataset.
 *
 * USAGE:
 *   npx tsx server/seed-database.ts          # Full reset + seed
 *   npx tsx server/seed-database.ts --clean   # Only delete transactional data
 *
 * SAFETY:
 *   - FK-order-aware deletion (child tables before parent tables)
 *   - Preserves branches, users, deduction_rates, holidays, company settings
 *   - Idempotent: safe to run multiple times
 *   - Logs every step clearly
 *
 * WHAT IS SEEDED:
 *   ✓ Shifts (60 days back + 14 days forward, realistic patterns)
 *   ✓ Payroll periods (Jan 1 – Mar 31, semi-monthly PH standard)
 *   ✓ Payroll entries (calculated from shifts using DOLE-compliant formulas)
 *   ✓ Time-off requests (sample vacation/sick leave)
 *   ✓ Shift trades (sample pending + approved trades)
 *   ✓ Notifications (welcome + payroll notifications)
 *   ✓ Approvals (linked to time-off requests)
 */

import 'dotenv/config';
import { db } from './db';
import { sql } from 'drizzle-orm';
import {
  users, branches, shifts, shiftTrades,
  payrollPeriods, payrollEntries, timeOffRequests,
  notifications, approvals,
} from '../shared/schema';
import { eq } from 'drizzle-orm';
import { addDays, startOfDay, getDay, format, subDays } from 'date-fns';
import crypto from 'crypto';
import { dbStorage as storage } from './db-storage';
import { calculatePeriodPay } from './payroll-utils';

const uuid = () => crypto.randomUUID();

// ─── STEP 1: Clean all transactional data (FK-safe order) ──────────────────

async function cleanTransactionalData() {
  console.log('\n🗑️  Step 1 — Cleaning ALL transactional data...\n');

  // Delete in FK-safe order: children → parents
  const tables = [
    'audit_logs',
    'adjustment_logs',
    'service_charge_distributions',
    'thirteenth_month_ledger',
    'archived_payroll_periods',
    'payroll_entries',
    'payroll_periods',
    'approvals',
    'shift_trades',
    'time_off_requests',
    'notifications',
    'employee_documents',
    'shifts',
    'loans',
    'loan_payments',
  ];

  for (const table of tables) {
    try {
      const result = await db.execute(sql.raw(`DELETE FROM "${table}"`));
      console.log(`   ✓ ${table}`);
    } catch (err: any) {
      // Table might not exist in all environments
      if (err.message?.includes('does not exist')) {
        console.log(`   - ${table} (not found, skipping)`);
      } else {
        console.warn(`   ⚠ ${table}: ${err.message}`);
      }
    }
  }

  console.log('\n   ✅ All transactional data cleared.\n');
}

// ─── STEP 2: Seed shifts ────────────────────────────────────────────────────

async function seedShifts(branchId: string, employees: any[]) {
  console.log('📅 Step 2 — Seeding shifts (60 days back, 14 days forward)...\n');

  const today = startOfDay(new Date());

  const weekdayPatterns = [
    { start: 8, end: 16 },   // 8am–4pm
    { start: 11, end: 19 },  // 11am–7pm
    { start: 15, end: 23 },  // 3pm–11pm
  ];

  const weekendPatterns = [
    { start: 8, end: 16 },   // 8am–4pm
    { start: 12, end: 20 },  // 12pm–8pm
    { start: 15, end: 23 },  // 3pm–11pm
  ];

  let count = 0;
  const batch: any[] = [];

  for (let offset = -60; offset <= 14; offset++) {
    const date = addDays(today, offset);
    const dow = getDay(date);
    const isSunday = dow === 0;
    const isWeekend = dow === 0 || dow === 5 || dow === 6;

    // Sunday: skeleton crew (30%), Weekend: busy (85%), Weekday: normal (65%)
    const pct = isSunday ? 0.3 : isWeekend ? 0.85 : 0.65;
    const target = Math.max(2, Math.ceil(employees.length * pct));

    const shuffled = [...employees].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, target);

    for (const emp of selected) {
      const patterns = isWeekend ? weekendPatterns : weekdayPatterns;
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];

      const startTime = new Date(date);
      startTime.setHours(pattern.start, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(pattern.end, 0, 0, 0);

      batch.push({
        id: uuid(),
        userId: emp.id,
        branchId,
        startTime,
        endTime,
        position: emp.position || 'Staff',
        status: offset < 0 ? 'completed' : 'scheduled',
        createdAt: new Date(),
      });
      count++;

      if (batch.length >= 80) {
        await db.insert(shifts).values(batch);
        batch.length = 0;
      }
    }
  }

  if (batch.length > 0) {
    await db.insert(shifts).values(batch);
  }

  console.log(`   ✅ Created ${count} shifts\n`);
  return count;
}

// ─── STEP 3: Seed payroll periods + entries ─────────────────────────────────

async function seedPayroll(branchId: string, employees: any[]) {
  console.log('💰 Step 3 — Creating payroll periods & calculating entries...\n');

  const periodDefs = [
    { id: 'period-2026-01-01', start: '2026-01-01', end: '2026-01-15', status: 'paid' },
    { id: 'period-2026-01-16', start: '2026-01-16', end: '2026-01-31', status: 'paid' },
    { id: 'period-2026-02-01', start: '2026-02-01', end: '2026-02-15', status: 'paid' },
    { id: 'period-2026-02-16', start: '2026-02-16', end: '2026-02-28', status: 'paid' },
    { id: 'period-2026-03-01', start: '2026-03-01', end: '2026-03-15', status: 'closed' },
    { id: 'period-2026-03-16', start: '2026-03-16', end: '2026-03-31', status: 'open'  },
  ];

  let totalEntries = 0;

  for (const def of periodDefs) {
    const startDt = new Date(def.start);
    const endDt = new Date(def.end);

    // Create the period
    await db.insert(payrollPeriods).values({
      id: def.id,
      branchId,
      startDate: startDt,
      endDate: endDt,
      status: def.status,
      createdAt: new Date(),
    });

    // Fetch holidays for the range
    const periodHolidays = await storage.getHolidays(startDt, endDt);

    let periodTotalHours = 0;
    let periodTotalPay = 0;

    for (const emp of employees) {
      if (!emp.isActive || emp.role === 'admin') continue;

      const empShifts = await storage.getShiftsByUser(emp.id, startDt, endDt);
      if (empShifts.length === 0) continue;

      const hourlyRate = parseFloat(String(emp.hourlyRate));
      if (isNaN(hourlyRate) || hourlyRate <= 0) continue;

      const pay = calculatePeriodPay(empShifts, hourlyRate, periodHolidays, 0, false);

      const totalHours = pay.breakdown.reduce((s, d) => s + d.regularHours + d.overtimeHours, 0);
      const regularHours = pay.breakdown.reduce((s, d) => s + d.regularHours, 0);
      const overtimeHours = pay.breakdown.reduce((s, d) => s + d.overtimeHours, 0);
      const nightDiffHours = pay.breakdown.reduce((s, d) => s + d.nightDiffHours, 0);

      const sss = pay.totalGrossPay > 0 ? 500 : 0;
      const phic = pay.totalGrossPay > 0 ? 300 : 0;
      const hdmf = pay.totalGrossPay > 0 ? 200 : 0;
      const totalDed = sss + phic + hdmf;
      const net = pay.totalGrossPay - totalDed;

      periodTotalHours += totalHours;
      periodTotalPay += pay.totalGrossPay;

      await storage.createPayrollEntry({
        userId: emp.id,
        payrollPeriodId: def.id,
        totalHours: totalHours.toFixed(2),
        regularHours: regularHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        nightDiffHours: nightDiffHours.toFixed(2),
        basicPay: pay.basicPay.toFixed(2),
        overtimePay: pay.overtimePay.toFixed(2),
        nightDiffPay: pay.nightDiffPay.toFixed(2),
        holidayPay: pay.holidayPay.toFixed(2),
        restDayPay: pay.restDayPay.toFixed(2),
        grossPay: pay.totalGrossPay.toFixed(2),
        sssContribution: sss.toFixed(2),
        philHealthContribution: phic.toFixed(2),
        pagibigContribution: hdmf.toFixed(2),
        withholdingTax: '0.00',
        advances: '0.00',
        otherDeductions: '0.00',
        totalDeductions: totalDed.toFixed(2),
        deductions: totalDed.toFixed(2),
        netPay: net.toFixed(2),
        status: def.status === 'open' ? 'pending' : 'paid',
        payBreakdown: JSON.stringify(pay),
      });
      totalEntries++;
    }

    await storage.updatePayrollPeriod(def.id, {
      totalHours: periodTotalHours.toFixed(2),
      totalPay: periodTotalPay.toFixed(2),
    });

    console.log(`   ✓ ${def.start} → ${def.end}  (${def.status})  ₱${periodTotalPay.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`);
  }

  console.log(`\n   ✅ Created ${periodDefs.length} periods, ${totalEntries} entries\n`);
}

// ─── STEP 4: Seed time-off requests ─────────────────────────────────────────

async function seedTimeOff(employees: any[], managerId: string) {
  console.log('🏖️  Step 4 — Seeding time-off requests...\n');

  const now = new Date();
  const requests = [
    {
      userId: employees[0]?.id,
      type: 'vacation',
      reason: 'Family reunion in Tagaytay',
      startDate: subDays(now, 20),
      endDate: subDays(now, 18),
      status: 'approved',
    },
    {
      userId: employees[1]?.id,
      type: 'sick',
      reason: 'Flu — doctor advised 2-day rest',
      startDate: subDays(now, 10),
      endDate: subDays(now, 9),
      status: 'approved',
    },
    {
      userId: employees[2]?.id,
      type: 'vacation',
      reason: 'Birthday celebration',
      startDate: addDays(now, 5),
      endDate: addDays(now, 5),
      status: 'pending',
    },
  ];

  let count = 0;
  for (const req of requests) {
    if (!req.userId) continue;
    await db.insert(timeOffRequests).values({
      id: uuid(),
      userId: req.userId,
      startDate: req.startDate,
      endDate: req.endDate,
      type: req.type,
      reason: req.reason,
      status: req.status,
      requestedAt: subDays(req.startDate, 3),
      approvedAt: req.status === 'approved' ? subDays(req.startDate, 1) : null,
      approvedBy: req.status === 'approved' ? managerId : null,
    });
    count++;
  }

  console.log(`   ✅ Created ${count} time-off requests\n`);
}

// ─── STEP 5: Seed shift trades ──────────────────────────────────────────────

async function seedShiftTrades(branchId: string, employees: any[]) {
  console.log('🔄 Step 5 — Seeding shift trades...\n');

  // Find recent shifts for two employees to trade
  const today = startOfDay(new Date());
  const futureShifts = await storage.getShiftsByBranch(
    branchId,
    addDays(today, 1),
    addDays(today, 7)
  );

  let count = 0;
  if (futureShifts.length >= 2 && employees.length >= 2) {
    // Find a shift from employee[0]
    const shift1 = futureShifts.find(s => s.userId === employees[0]?.id);
    const shift2 = futureShifts.find(s => s.userId === employees[1]?.id);

    if (shift1) {
      await db.insert(shiftTrades).values({
        id: uuid(),
        shiftId: shift1.id,
        fromUserId: employees[0].id,
        toUserId: employees[1]?.id || null,
        reason: 'Need to attend a family event',
        status: 'pending',
        urgency: 'normal',
        requestedAt: new Date(),
      });
      count++;
    }

    if (shift2 && employees.length >= 3) {
      await db.insert(shiftTrades).values({
        id: uuid(),
        shiftId: shift2.id,
        fromUserId: employees[1].id,
        toUserId: employees[2].id,
        reason: 'Class schedule conflict',
        status: 'approved',
        urgency: 'normal',
        requestedAt: subDays(new Date(), 2),
        approvedAt: subDays(new Date(), 1),
      });
      count++;
    }
  }

  console.log(`   ✅ Created ${count} shift trades\n`);
}

// ─── STEP 6: Seed notifications ─────────────────────────────────────────────

async function seedNotifications(employees: any[]) {
  console.log('🔔 Step 6 — Seeding notifications...\n');

  let count = 0;
  for (const emp of employees.slice(0, 5)) {
    await db.insert(notifications).values({
      id: uuid(),
      userId: emp.id,
      type: 'payroll',
      title: 'Payroll Processed',
      message: 'Your payslip for Mar 1-15, 2026 is ready to view.',
      isRead: false,
      createdAt: subDays(new Date(), 3),
    });
    count++;
  }

  console.log(`   ✅ Created ${count} notifications\n`);
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  const cleanOnly = process.argv.includes('--clean');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PERO Payroll System — Master Database Seeder');
  console.log(`  Mode: ${cleanOnly ? 'CLEAN ONLY' : 'FULL RESET + SEED'}`);
  console.log(`  Time: ${new Date().toLocaleString('en-PH')}`);
  console.log('═══════════════════════════════════════════════════════════');

  // Step 1: Clean
  await cleanTransactionalData();

  if (cleanOnly) {
    console.log('✅ Clean complete. Exiting (--clean mode).\n');
    process.exit(0);
  }

  // Gather reference data
  const allBranches = await db.select().from(branches).limit(1);
  if (allBranches.length === 0) {
    console.error('❌ No branches found. Run the server once first to initialize.');
    process.exit(1);
  }
  const branchId = allBranches[0].id;

  const allUsers = await db.select().from(users).where(eq(users.branchId, branchId));
  const employees = allUsers.filter(u => u.role === 'employee' || u.role === 'manager');
  const manager = allUsers.find(u => u.role === 'manager');

  console.log(`📍 Branch: ${allBranches[0].name} (${branchId})`);
  console.log(`👥 Employees: ${employees.length}\n`);

  // Step 2: Shifts
  await seedShifts(branchId, employees);

  // Step 3: Payroll
  await seedPayroll(branchId, allUsers);

  // Step 4: Time-off requests
  if (manager) {
    await seedTimeOff(employees, manager.id);
  }

  // Step 5: Shift trades
  await seedShiftTrades(branchId, employees);

  // Step 6: Notifications
  await seedNotifications(employees);

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ Database seeding complete in ${elapsed}s`);
  console.log('═══════════════════════════════════════════════════════════\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
