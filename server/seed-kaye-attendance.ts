/**
 * Seed Kaye Anne Gonzales' actual attendance for March 16-27, 2026.
 *
 * Creates:
 *  - ONE shift per day (scheduled 9:00 AM → actual end time)
 *  - "Late" exception logs for days where clock-in > 9:00 AM
 *  - "Break" exception logs (1 hour deducted) for each day
 *  - Payroll with NO overtime, NO holiday pay, NO gov deductions
 *  - Rate: ₱60/hr
 */

import 'dotenv/config';
import { db } from './db';
import { sql, eq, and } from 'drizzle-orm';
import {
  users, branches, shifts, payrollPeriods, payrollEntries,
  adjustmentLogs,
} from '../shared/schema';
import { dbStorage as storage } from './db-storage';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

// ─── Attendance Records (all dates in 2026, PHT = UTC+8) ─────────────────────
// Scheduled start is always 9:00 AM. actualStartTime is the real clock-in.
const ATTENDANCE = [
  { date: '2026-03-16', inH: 9, inM: 2,  outH: 18, outM: 56 },
  { date: '2026-03-17', inH: 9, inM: 7,  outH: 18, outM: 32 },
  { date: '2026-03-18', inH: 9, inM: 7,  outH: 18, outM: 50 },
  { date: '2026-03-19', inH: 9, inM: 21, outH: 18, outM: 47 },
  { date: '2026-03-20', inH: 9, inM: 0,  outH: 18, outM: 51 },
  { date: '2026-03-23', inH: 8, inM: 52, outH: 18, outM: 14 },
  { date: '2026-03-24', inH: 9, inM: 0,  outH: 18, outM: 47 },
  { date: '2026-03-25', inH: 9, inM: 2,  outH: 18, outM: 42 },
  { date: '2026-03-26', inH: 9, inM: 9,  outH: 19, outM: 5  },
  { date: '2026-03-27', inH: 9, inM: 20, outH: 18, outM: 30 },
];

const SCHEDULED_START_HOUR = 9; // 9:00 AM
const HOURLY_RATE = 60;
const BREAK_HOURS = 1;

function phtDate(dateStr: string, hour: number, minute: number): Date {
  // Create dates in PHT (UTC+8)
  const d = new Date(`${dateStr}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00+08:00`);
  return d;
}

function formatTime12(h: number, m: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

async function main() {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Kaye Anne Gonzales — Attendance & Payroll Seeder v2');
  console.log(`  Time: ${new Date().toLocaleString('en-PH')}`);
  console.log('═══════════════════════════════════════════════════════════');

  // 1. Find Kaye
  const kayeRows = await db.select().from(users)
    .where(eq(users.username, 'gonzales.k')).limit(1);
  if (kayeRows.length === 0) throw new Error('Kaye not found');
  const kaye = kayeRows[0];
  console.log(`👤 Found Kaye: ${kaye.firstName} ${kaye.lastName} (${kaye.id})`);
  console.log(`📍 Branch: ${kaye.branchId}`);

  const branchId = kaye.branchId;

  // 2. Define the payroll period
  const periodStart = new Date('2026-03-16T00:00:00+08:00');
  const periodEnd   = new Date('2026-03-31T23:59:59+08:00');

  // 3. Clear existing Kaye data (shifts, adjustment logs, payroll entries)
  console.log('🗑️  Clearing existing Kaye shifts + adjustment logs for Mar 16-27...');
  await db.delete(shifts).where(
    and(
      eq(shifts.userId, kaye.id),
      eq(shifts.branchId, branchId),
    )
  );
  await db.delete(adjustmentLogs).where(
    eq(adjustmentLogs.employeeId, kaye.id)
  );

  // Also clean up existing payroll entries for Kaye
  const existingPeriods = await db.select().from(payrollPeriods).where(
    and(eq(payrollPeriods.branchId, branchId))
  );
  for (const ep of existingPeriods) {
    await db.delete(payrollEntries).where(
      and(eq(payrollEntries.userId, kaye.id), eq(payrollEntries.payrollPeriodId, ep.id))
    );
  }

  // 4. Create ONE shift per day (single block)
  let totalNetMinutes = 0;
  let lateCount = 0;

  for (const day of ATTENDANCE) {
    const scheduledStart = phtDate(day.date, SCHEDULED_START_HOUR, 0); // 9:00 AM
    const actualStart    = phtDate(day.date, day.inH, day.inM);
    const actualEnd      = phtDate(day.date, day.outH, day.outM);

    // Calculate raw hours (actual end - actual start)
    const rawMinutes = (actualEnd.getTime() - actualStart.getTime()) / 60000;
    const netMinutes = rawMinutes - (BREAK_HOURS * 60);
    totalNetMinutes += netMinutes;

    const netHrs = Math.floor(netMinutes / 60);
    const netMins = Math.round(netMinutes % 60);

    console.log(`   📅 ${day.date}: ${formatTime12(day.inH, day.inM)} – ${formatTime12(day.outH, day.outM)}  →  ${netHrs}h${netMins}m net`);

    // Insert ONE shift per day (scheduled 9:00 AM → actual end time)
    await db.insert(shifts).values({
      id: uuid(),
      userId: kaye.id,
      branchId,
      startTime: scheduledStart,
      endTime: actualEnd,
      actualStartTime: actualStart,
      actualEndTime: actualEnd,
      position: kaye.position,
      status: 'completed',
      createdAt: new Date(),
    });

    // 5. Seed lateness exception logs
    const lateMinutes = Math.max(0, (actualStart.getTime() - scheduledStart.getTime()) / 60000);
    if (lateMinutes > 0) {
      lateCount++;
      console.log(`      ⚠️  Late by ${Math.round(lateMinutes)} min`);
      await db.insert(adjustmentLogs).values({
        id: uuid(),
        employeeId: kaye.id,
        branchId,
        loggedBy: 'user-don-mgr-lita', // Manager Lita
        startDate: phtDate(day.date, 0, 0),
        endDate: phtDate(day.date, 23, 59),
        type: 'late',
        value: String(Math.round(lateMinutes)),
        remarks: `Auto-logged: Clocked in at ${formatTime12(day.inH, day.inM)}, scheduled at ${formatTime12(SCHEDULED_START_HOUR, 0)}. Late by ${Math.round(lateMinutes)} minutes.`,
        status: 'approved',
        createdAt: new Date(),
      });
    }

    // 6. Seed break deduction log (1 hour per day)
    await db.insert(adjustmentLogs).values({
      id: uuid(),
      employeeId: kaye.id,
      branchId,
      loggedBy: 'user-don-mgr-lita',
      startDate: phtDate(day.date, 12, 0),
      endDate: phtDate(day.date, 13, 0),
      type: 'undertime' as any,  // "break" is stored as undertime deduction
      value: '60',
      remarks: `1-hour unpaid lunch break (12:00 PM – 1:00 PM)`,
      status: 'approved',
      createdAt: new Date(),
    });
  }

  console.log(`✅ Created ${ATTENDANCE.length} shifts (1 per day)`);
  console.log(`✅ Seeded ${lateCount} Late logs + ${ATTENDANCE.length} Break logs`);

  // 7. Create payroll period
  const periodId = `kaye-payroll-${uuid().substring(0, 8)}`;
  await db.insert(payrollPeriods).values({
    id: periodId,
    branchId,
    startDate: periodStart,
    endDate: periodEnd,
    status: 'open',
    createdAt: new Date(),
  });
  console.log(`📋 Created payroll period: ${periodId}`);

  // 8. Calculate payroll — strictly: NO overtime, NO holiday, NO gov deductions
  const totalNetHours = totalNetMinutes / 60;
  const basicPay = Math.round(totalNetHours * HOURLY_RATE * 100) / 100;

  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(`  💰 PAYROLL CALCULATION SUMMARY`);
  console.log(`══════════════════════════════════════════════════════════`);
  console.log(`  Employee:       ${kaye.firstName} ${kaye.lastName}`);
  console.log(`  Period:         Mar 16 – Mar 27, 2026`);
  console.log(`  Hourly Rate:    ₱${HOURLY_RATE.toFixed(2)}`);
  console.log(`  Days Worked:    ${ATTENDANCE.length}`);
  console.log(`──────────────────────────────────────────────────────────`);
  console.log(`  Total Net Hrs:  ${totalNetHours.toFixed(2)} hrs (after 1h break/day)`);
  console.log(`  Overtime:       DISABLED`);
  console.log(`  Holiday Pay:    DISABLED`);
  console.log(`──────────────────────────────────────────────────────────`);
  console.log(`  Basic Pay:      ₱${basicPay.toFixed(2)}`);
  console.log(`  Overtime Pay:   ₱0.00 (OFF)`);
  console.log(`  Holiday Pay:    ₱0.00 (OFF)`);
  console.log(`  Night Diff Pay: ₱0.00`);
  console.log(`  Gross Pay:      ₱${basicPay.toFixed(2)}`);
  console.log(`──────────────────────────────────────────────────────────`);
  console.log(`  SSS:            ₱0.00 (OFF)`);
  console.log(`  PhilHealth:     ₱0.00 (OFF)`);
  console.log(`  Pag-IBIG:       ₱0.00 (OFF)`);
  console.log(`  Tax:            ₱0.00 (OFF)`);
  console.log(`  Total Deduct:   ₱0.00`);
  console.log(`──────────────────────────────────────────────────────────`);
  console.log(`  NET PAY:        ₱${basicPay.toFixed(2)}`);
  console.log(`══════════════════════════════════════════════════════════`);

  // Daily breakdown
  console.log(`\n  📊 Daily Breakdown:`);
  for (const day of ATTENDANCE) {
    const actualStart = phtDate(day.date, day.inH, day.inM);
    const actualEnd   = phtDate(day.date, day.outH, day.outM);
    const rawMin      = (actualEnd.getTime() - actualStart.getTime()) / 60000;
    const netMin      = rawMin - 60;
    const hrs         = (netMin / 60).toFixed(2);
    console.log(`     ${day.date}:  ${formatTime12(day.inH, day.inM)} – ${formatTime12(day.outH, day.outM)}  →  ${hrs}h net`);
  }

  // 9. Create payroll entry
  const entryId = uuid();
  await db.insert(payrollEntries).values({
    id: entryId,
    userId: kaye.id,
    payrollPeriodId: periodId,
    totalHours: totalNetHours.toFixed(2),
    regularHours: totalNetHours.toFixed(2),
    overtimeHours: '0',
    nightDiffHours: '0',
    basicPay: basicPay.toFixed(2),
    overtimePay: '0',
    holidayPay: '0',
    nightDiffPay: '0',
    grossPay: basicPay.toFixed(2),
    sssContribution: '0',
    philHealthContribution: '0',
    pagibigContribution: '0',
    withholdingTax: '0',
    totalDeductions: '0',
    deductions: '0',
    netPay: basicPay.toFixed(2),
    status: 'completed',
    createdAt: new Date(),
  });

  // Close the period
  await db.update(payrollPeriods).set({ status: 'closed', totalHours: totalNetHours.toFixed(2), totalPay: basicPay.toFixed(2) })
    .where(eq(payrollPeriods.id, periodId));

  console.log(`\n✅ Payroll entry created: ${entryId}`);
  console.log(`✅ Period ${periodId} updated → closed`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  ✅ Kaye attendance + payroll seeded in ${elapsed}s`);
  console.log(`═══════════════════════════════════════════════════════════`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seeder error:', err);
  process.exit(1);
});
