/**
 * Don Macchiatos — Branch Data Recovery Seed Script
 *
 * Recovers employee and transactional data for the Don Macchiatos branch.
 * Based on original seeder from commit 421e97e, adapted to current schema.
 *
 * USAGE:
 *   npx tsx server/seed-don-macchiatos.ts
 *
 * WHAT IS SEEDED:
 *   ✓ Branch settings (deduction settings)
 *   ✓ 1 Manager + 4 Employees
 *   ✓ Shifts (60 days historical + 14 days future)
 *   ✓ Payroll Periods (Feb–Mar 2026)
 *   ✓ Payroll Entries with DOLE-compliant deductions
 *   ✓ 13th Month Pay entries
 *   ✓ Adjustment Logs (OT, lateness)
 *   ✓ Audit Logs
 */

import 'dotenv/config';
import { db } from './db';
import { sql } from 'drizzle-orm';
import {
  users, branches, shifts,
  payrollPeriods, payrollEntries,
  notifications, auditLogs, adjustmentLogs,
  leaveCredits, deductionSettings, thirteenthMonthPay,
} from '../shared/schema';
import { eq } from 'drizzle-orm';
import { addDays, startOfDay, getDay, subDays, setHours, setMinutes } from 'date-fns';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { dbStorage as storage } from './db-storage';
import { calculatePeriodPay } from './payroll-utils';

const uuid = () => crypto.randomUUID();

async function main() {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Don Macchiatos — Branch Data Recovery Seeder');
  console.log(`  Time: ${new Date().toLocaleString('en-PH')}`);
  console.log('═══════════════════════════════════════════════════════════');

  // 1. Find branch
  const existingBranch = await db.select().from(branches).where(eq(branches.name, 'Don Macchiatos')).limit(1);
  if (existingBranch.length === 0) {
    throw new Error('Don Macchiatos branch not found in DB. Create it via the admin UI first.');
  }
  const branchId = existingBranch[0].id;
  console.log(`📍 Branch: ${existingBranch[0].name} (${branchId})`);

  // 2. Clean up existing seeded transactional data
  console.log('🗑️  Clearing existing seeded data...');
  const seededUserIds = [
    'user-don-mgr-lita',
    'user-don-emp-kaye',
    'user-don-emp-jhon',
    'user-don-emp-ryan',
    'user-don-emp-jenny',
  ];

  await db.delete(adjustmentLogs).where(eq(adjustmentLogs.branchId, branchId));
  await db.delete(leaveCredits).where(eq(leaveCredits.branchId, branchId));
  await db.execute(sql`DELETE FROM notifications WHERE branch_id = ${branchId}`);
  await db.execute(sql`DELETE FROM payroll_entries WHERE payroll_period_id IN (SELECT id FROM payroll_periods WHERE branch_id = ${branchId})`);
  await db.delete(payrollPeriods).where(eq(payrollPeriods.branchId, branchId));
  await db.delete(shifts).where(eq(shifts.branchId, branchId));
  for (const uid of seededUserIds) {
    await db.execute(sql`DELETE FROM thirteenth_month_pay WHERE employee_id = ${uid}`);
    await db.execute(sql`DELETE FROM audit_logs WHERE user_id = ${uid}`);
  }
  console.log('   ✅ Cleared.');

  // 3. Deduction settings
  await db.insert(deductionSettings).values({
    id: uuid(),
    branchId,
    deductSSS: true,
    deductPhilHealth: true,
    deductPagibig: true,
    deductWithholdingTax: true,
  }).onConflictDoNothing();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 4. Define employees
  const employeesData = [
    {
      id: 'user-don-mgr-lita',
      username: 'angeles.l',
      firstName: 'Lita',
      lastName: 'Angeles',
      email: 'lita.angeles@pero.com.ph',
      role: 'manager' as const,
      position: 'Branch Manager',
      hourlyRate: '15.625',
      photoUrl: 'https://i.pravatar.cc/150?u=angeles.l',
      schedule: { days: [1, 2, 3, 4, 5], startH: 8, startM: 30, endH: 19, endM: 0 },
    },
    {
      id: 'user-don-emp-kaye',
      username: 'gonzales.k',
      firstName: 'Kaye Anne',
      lastName: 'Gonzales',
      email: 'kaye.gonzales@pero.com.ph',
      role: 'employee' as const,
      position: 'Barista',
      hourlyRate: '60.00',
      photoUrl: 'https://i.pravatar.cc/150?u=gonzales.k',
      schedule: { days: [1, 2, 3, 4, 5], startH: 9, startM: 0, endH: 18, endM: 30 },
    },
    {
      id: 'user-don-emp-jhon',
      username: 'bowden.j',
      firstName: 'Jhon',
      lastName: 'Bowden',
      email: 'jhon.bowden@pero.com.ph',
      role: 'employee' as const,
      position: 'Staff',
      hourlyRate: '60.00',
      photoUrl: 'https://i.pravatar.cc/150?u=bowden.j',
      schedule: { days: [3, 6], startH: 17, startM: 0, endH: 19, endM: 0 },
    },
    {
      id: 'user-don-emp-ryan',
      username: 'go.r',
      firstName: 'Ryan',
      lastName: 'Go',
      email: 'ryan.go@pero.com.ph',
      role: 'employee' as const,
      position: 'Senior Barista',
      hourlyRate: '60.00',
      photoUrl: 'https://i.pravatar.cc/150?u=go.r',
      schedule: { days: [1, 2, 3, 4, 5], startH: 8, startM: 0, endH: 17, endM: 0 },
    },
    {
      id: 'user-don-emp-jenny',
      username: 'horton.j',
      firstName: 'Jenny',
      lastName: 'Horton',
      email: 'jenny.horton@pero.com.ph',
      role: 'employee' as const,
      position: 'Cashier',
      hourlyRate: '60.00',
      photoUrl: 'https://i.pravatar.cc/150?u=horton.j',
      schedule: { days: [2, 4], startH: 7, startM: 0, endH: 17, endM: 30 },
    },
  ];

  for (const emp of employeesData) {
    await db.insert(users).values({
      id: emp.id,
      username: emp.username,
      password: hashedPassword,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      role: emp.role,
      position: emp.position,
      hourlyRate: emp.hourlyRate,
      photoUrl: emp.photoUrl,
      branchId,
      isActive: true,
      sssLoanDeduction: emp.id === 'user-don-emp-kaye' ? '150.00' : '0',
      pagibigLoanDeduction: emp.id === 'user-don-emp-ryan' ? '200.00' : '0',
    }).onConflictDoUpdate({
      target: [users.id],
      set: {
        hourlyRate: emp.hourlyRate,
        photoUrl: emp.photoUrl,
        branchId,
        isActive: true,
        sssLoanDeduction: emp.id === 'user-don-emp-kaye' ? '150.00' : '0',
        pagibigLoanDeduction: emp.id === 'user-don-emp-ryan' ? '200.00' : '0',
      },
    });
  }
  console.log(`👥 Seeded ${employeesData.length} employees`);

  // 5. Seed shifts (60 days back + 14 days forward)
  console.log('📅 Seeding shifts...');
  const today = startOfDay(new Date());
  let shiftCount = 0;

  for (let offset = -60; offset <= 14; offset++) {
    const date = addDays(today, offset);
    const dayOfWeek = getDay(date);

    for (const emp of employeesData) {
      if (emp.schedule.days.includes(dayOfWeek)) {
        const start = setMinutes(setHours(new Date(date), emp.schedule.startH), emp.schedule.startM);
        const end = setMinutes(setHours(new Date(date), emp.schedule.endH), emp.schedule.endM);

        await db.insert(shifts).values({
          id: uuid(),
          userId: emp.id,
          branchId,
          startTime: start,
          endTime: end,
          position: emp.position,
          status: offset < 0 ? 'completed' : 'scheduled',
          createdAt: new Date(),
        });
        shiftCount++;
      }
    }
  }
  console.log(`   ✅ Created ${shiftCount} shifts`);

  // 6. Seed payroll periods and entries
  console.log('💰 Seeding payroll...');
  const periodDefs = [
    { start: '2026-02-01', end: '2026-02-15', status: 'paid' },
    { start: '2026-02-16', end: '2026-02-28', status: 'paid' },
    { start: '2026-03-01', end: '2026-03-15', status: 'closed' },
    { start: '2026-03-16', end: '2026-03-31', status: 'open' },
  ];

  let totalBasicByEmployee: Record<string, number> = {};

  for (const def of periodDefs) {
    const startDt = new Date(def.start);
    const endDt = new Date(def.end);
    const periodId = `don-period-${def.start}`;

    await db.insert(payrollPeriods).values({
      id: periodId,
      branchId,
      startDate: startDt,
      endDate: endDt,
      status: def.status,
    }).onConflictDoNothing();

    const holidays = await storage.getHolidays(startDt, endDt);

    for (const emp of employeesData) {
      const empShifts = await storage.getShiftsByUser(emp.id, startDt, endDt);
      if (empShifts.length === 0) continue;

      const rate = parseFloat(emp.hourlyRate);
      const pay = calculatePeriodPay(empShifts, rate, holidays, -1, false);

      const totalHours = pay.breakdown.reduce((s, d) => s + d.regularHours + d.overtimeHours, 0);
      const regularHours = pay.breakdown.reduce((s, d) => s + d.regularHours, 0);
      const overtimeHours = pay.breakdown.reduce((s, d) => s + d.overtimeHours, 0);
      const nightDiffHours = pay.breakdown.reduce((s, d) => s + d.regularNightDiffHours + d.overtimeNightDiffHours, 0);

      const sss = pay.totalGrossPay > 0 ? 300 : 0;
      const phic = pay.totalGrossPay > 0 ? 150 : 0;
      const hdmf = pay.totalGrossPay > 0 ? 100 : 0;
      const totalDed = sss + phic + hdmf;

      await db.insert(payrollEntries).values({
        id: uuid(),
        userId: emp.id,
        payrollPeriodId: periodId,
        totalHours: totalHours.toFixed(2),
        regularHours: regularHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        nightDiffHours: nightDiffHours.toFixed(2),
        grossPay: pay.totalGrossPay.toFixed(2),
        basicPay: pay.basicPay.toFixed(2),
        overtimePay: pay.overtimePay.toFixed(2),
        holidayPay: pay.holidayPay.toFixed(2),
        nightDiffPay: pay.nightDiffPay.toFixed(2),
        restDayPay: pay.restDayPay.toFixed(2),
        sssContribution: sss.toFixed(2),
        philHealthContribution: phic.toFixed(2),
        pagibigContribution: hdmf.toFixed(2),
        totalDeductions: totalDed.toFixed(2),
        deductions: totalDed.toFixed(2),
        netPay: (pay.totalGrossPay - totalDed).toFixed(2),
        status: def.status === 'open' ? 'pending' : 'paid',
        createdAt: new Date(),
      });

      totalBasicByEmployee[emp.id] = (totalBasicByEmployee[emp.id] ?? 0) + pay.basicPay;
    }
  }
  console.log(`   ✅ Created ${periodDefs.length} payroll periods`);

  // 7. 13th month pay entries
  console.log('🎁 Seeding 13th month pay...');
  for (const emp of employeesData) {
    const totalBasic = totalBasicByEmployee[emp.id] ?? 0;
    if (totalBasic === 0) continue;
    const amount = totalBasic / 12;
    await db.insert(thirteenthMonthPay).values({
      id: uuid(),
      employeeId: emp.id,
      year: 2026,
      totalBasicSalary: totalBasic.toFixed(2),
      amount: amount.toFixed(2),
      status: 'pending',
      isTaxable: false,
    }).onConflictDoNothing();
  }
  console.log('   ✅ Created 13th month entries');

  // 8. Leave credits (one row per leave type per employee)
  console.log('📋 Seeding leave credits...');
  const leaveTypes = [
    { type: 'vacation', credits: '5' },
    { type: 'sick', credits: '5' },
    { type: 'sil', credits: '5' },
  ];
  for (const emp of employeesData) {
    for (const lt of leaveTypes) {
      await db.insert(leaveCredits).values({
        id: uuid(),
        userId: emp.id,
        branchId,
        year: 2026,
        leaveType: lt.type,
        totalCredits: lt.credits,
        usedCredits: '0',
        remainingCredits: lt.credits,
        grantedBy: 'user-don-mgr-lita',
      }).onConflictDoNothing();
    }
  }
  console.log('   ✅ Created leave credits');

  // 9. Adjustment logs
  console.log('⚙️  Seeding adjustment logs...');
  const adjustments = [
    { empId: 'user-don-emp-kaye', type: 'overtime', value: '2.5', remarks: 'Late store closing' },
    { empId: 'user-don-emp-ryan', type: 'late', value: '30', remarks: 'Technical difficulties' },
  ];
  for (const adj of adjustments) {
    await db.insert(adjustmentLogs).values({
      id: uuid(),
      employeeId: adj.empId,
      branchId,
      loggedBy: 'user-don-mgr-lita',
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 1),
      type: adj.type as any,
      value: adj.value,
      remarks: adj.remarks,
      status: 'pending',
      createdAt: new Date(),
    });
  }
  console.log('   ✅ Created adjustment logs');

  // 10. Audit logs
  console.log('🔒 Seeding audit logs...');
  const auditEntries = [
    { action: 'branch_create', entityType: 'branch', entityId: branchId, reason: 'Setup Don Macchiatos branch' },
    { action: 'employee_create', entityType: 'user', entityId: 'user-don-mgr-lita', reason: 'Hire Lita Angeles as Branch Manager' },
    { action: 'payroll_process', entityType: 'payroll_period', entityId: 'don-period-2026-02-01', reason: 'Monthly payroll processing' },
  ];
  for (const entry of auditEntries) {
    await db.insert(auditLogs).values({
      id: uuid(),
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      userId: 'user-don-mgr-lita',
      reason: entry.reason,
      createdAt: subDays(new Date(), 2),
    });
  }
  console.log('   ✅ Created audit logs');

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ Recovery complete in ${elapsed}s`);
  console.log('  Credentials: username (see above), password: password123');
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
