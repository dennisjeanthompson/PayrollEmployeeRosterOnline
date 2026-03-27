/**
 * Seed Kaye Anne Gonzales' actual attendance for March 16-27, 2026.
 *
 * Attendance data (La Union, Philippines — all regular working days):
 *   Mar 16  9:02 AM – 6:56 PM   (raw 9h54m, net 8h54m after 1h break)
 *   Mar 17  9:07 AM – 6:32 PM   (raw 9h25m, net 8h25m)
 *   Mar 18  9:07 AM – 6:50 PM   (raw 9h43m, net 8h43m)
 *   Mar 19  9:21 AM – 6:47 PM   (raw 9h26m, net 8h26m)
 *   Mar 20  9:00 AM – 6:51 PM   (raw 9h51m, net 8h51m)
 *   Mar 23  8:52 AM – 6:14 PM   (raw 9h22m, net 8h22m)
 *   Mar 24  9:00 AM – 6:47 PM   (raw 9h47m, net 8h47m)
 *   Mar 25  9:02 AM – 6:42 PM   (raw 9h40m, net 8h40m)
 *   Mar 26  9:09 AM – 7:05 PM   (raw 9h56m, net 8h56m)
 *   Mar 27  9:20 AM – 6:30 PM   (raw 9h10m, net 8h10m)
 *
 * The system does NOT auto-deduct break. We model the 1-hour break as a gap
 * in the middle of the shift (12:00-13:00) by creating TWO shift records per day:
 *   AM segment: time-in → 12:00
 *   PM segment: 13:00  → time-out
 * This preserves the exact clock-in/clock-out data while ensuring the payroll
 * engine sees the correct net hours.
 */

import 'dotenv/config';
import { db } from './db';
import { sql, eq, and } from 'drizzle-orm';
import {
  users, branches, shifts, payrollPeriods, payrollEntries,
  thirteenthMonthLedger,
} from '../shared/schema';
import { dbStorage as storage } from './db-storage';
import { calculatePeriodPay } from './payroll-utils';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

// ─── Attendance Records (all dates in 2026, PHT = UTC+8) ─────────────────────
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

async function main() {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Kaye Anne Gonzales — Attendance & Payroll Seeder');
  console.log(`  Time: ${new Date().toLocaleString('en-PH')}`);
  console.log('═══════════════════════════════════════════════════════════');

  // 1. Find Kaye
  const kayeRows = await db.select().from(users)
    .where(eq(users.username, 'gonzales.k')).limit(1);
  if (kayeRows.length === 0) {
    console.error('❌ User gonzales.k not found. Run seed-don-macchiatos first.');
    process.exit(1);
  }
  const kaye = kayeRows[0];
  const branchId = kaye.branchId;
  console.log(`👤 Found Kaye: ${kaye.firstName} ${kaye.lastName} (${kaye.id})`);
  console.log(`📍 Branch: ${branchId}`);

  // 2. Clear Kaye's existing shifts in the FULL payroll period (Mar 16-31)
  //    This ensures no leftover schedule-based shifts contaminate the calculation
  const rangeStart = new Date('2026-03-16T00:00:00');
  const rangeEnd   = new Date('2026-04-01T00:00:00'); // exclusive upper bound (covers thru Mar 31)
  await db.delete(shifts).where(
    sql`user_id = ${kaye.id} AND start_time >= ${rangeStart} AND start_time < ${rangeEnd}`
  );
  console.log('🗑️  Cleared existing Kaye shifts for Mar 16-27');

  // 3. Insert real attendance as split AM/PM shifts (break = 12:00-13:00)
  let shiftCount = 0;
  const createdShiftIds: string[] = [];

  for (const rec of ATTENDANCE) {
    const [year, month, day] = rec.date.split('-').map(Number);

    // AM segment: time-in → 12:00
    const amStart = new Date(year, month - 1, day, rec.inH, rec.inM, 0);
    const amEnd   = new Date(year, month - 1, day, 12, 0, 0);

    // PM segment: 13:00 → time-out
    const pmStart = new Date(year, month - 1, day, 13, 0, 0);
    const pmEnd   = new Date(year, month - 1, day, rec.outH, rec.outM, 0);

    for (const [segStart, segEnd] of [[amStart, amEnd], [pmStart, pmEnd]]) {
      const id = uuid();
      await db.insert(shifts).values({
        id,
        userId: kaye.id,
        branchId,
        startTime: segStart,
        endTime: segEnd,
        position: kaye.position,
        status: 'completed',
        actualStartTime: segStart,
        actualEndTime: segEnd,
        createdAt: new Date(),
      });
      createdShiftIds.push(id);
      shiftCount++;
    }

    // Compute net hours for logging
    const rawMin = (rec.outH * 60 + rec.outM) - (rec.inH * 60 + rec.inM);
    const netMin = rawMin - 60; // subtract 1hr break
    const netH = Math.floor(netMin / 60);
    const netM = netMin % 60;
    console.log(`   📅 ${rec.date}: ${rec.inH}:${String(rec.inM).padStart(2, '0')} – ${rec.outH}:${String(rec.outM).padStart(2, '0')}  →  ${netH}h${String(netM).padStart(2, '0')}m net`);
  }
  console.log(`✅ Created ${shiftCount} shift segments (${ATTENDANCE.length} days × 2 segments)`);

  // 4. Find or create the payroll period for Mar 16-31
  const periodStart = new Date('2026-03-16');
  const periodEnd   = new Date('2026-03-31');
  let periodId: string;

  const existingPeriods = await db.select().from(payrollPeriods)
    .where(and(
      eq(payrollPeriods.branchId, branchId),
      eq(payrollPeriods.status, 'open'),
    ));

  const matchingPeriod = existingPeriods.find(p => {
    const ps = new Date(p.startDate);
    return ps.getFullYear() === 2026 && ps.getMonth() === 2 && ps.getDate() === 16;
  });

  if (matchingPeriod) {
    periodId = matchingPeriod.id;
    console.log(`📋 Using existing open period: ${periodId}`);
  } else {
    periodId = `kaye-payroll-${uuid().substring(0, 8)}`;
    await db.insert(payrollPeriods).values({
      id: periodId,
      branchId,
      startDate: periodStart,
      endDate: periodEnd,
      status: 'open',
    });
    console.log(`📋 Created new payroll period: ${periodId}`);
  }

  // 5. Remove any existing payroll entries for Kaye in this period
  await db.delete(payrollEntries).where(
    sql`user_id = ${kaye.id} AND payroll_period_id = ${periodId}`
  );

  // 6. Calculate payroll using the system's actual engine
  const kayeShifts = await storage.getShiftsByUser(kaye.id, periodStart, periodEnd);
  const holidays = await storage.getHolidays(periodStart, periodEnd);
  const hourlyRate = parseFloat(kaye.hourlyRate);

  const pay = calculatePeriodPay(kayeShifts, hourlyRate, holidays, 0, false);

  const totalHours  = pay.breakdown.reduce((s, d) => s + d.regularHours + d.overtimeHours, 0);
  const regularHrs  = pay.breakdown.reduce((s, d) => s + d.regularHours, 0);
  const overtimeHrs = pay.breakdown.reduce((s, d) => s + d.overtimeHours, 0);
  const nightDiffHrs = pay.breakdown.reduce((s, d) => s + d.nightDiffHours, 0);

  // Deductions (simplified for seed — actual processing uses SSS/PhilHealth/PagIBIG tables)
  const sss  = pay.totalGrossPay > 0 ? 225 : 0;   // Semi-monthly SSS
  const phic = pay.totalGrossPay > 0 ? 150 : 0;   // Semi-monthly PhilHealth
  const hdmf = pay.totalGrossPay > 0 ? 100 : 0;   // Semi-monthly Pag-IBIG
  const totalDed = sss + phic + hdmf;
  const netPay = pay.totalGrossPay - totalDed;

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  💰 PAYROLL CALCULATION SUMMARY');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Employee:       ${kaye.firstName} ${kaye.lastName}`);
  console.log(`  Period:         Mar 16 – Mar 31, 2026`);
  console.log(`  Hourly Rate:    ₱${hourlyRate.toFixed(2)}`);
  console.log(`  Days Worked:    ${pay.breakdown.length}`);
  console.log('──────────────────────────────────────────────────────────');
  console.log(`  Regular Hours:  ${regularHrs.toFixed(2)} hrs`);
  console.log(`  Overtime Hours: ${overtimeHrs.toFixed(2)} hrs (125% rate)`);
  console.log(`  Night Diff Hrs: ${nightDiffHrs.toFixed(2)} hrs`);
  console.log(`  Total Hours:    ${totalHours.toFixed(2)} hrs`);
  console.log('──────────────────────────────────────────────────────────');
  console.log(`  Basic Pay:      ₱${pay.basicPay.toFixed(2)}`);
  console.log(`  Overtime Pay:   ₱${pay.overtimePay.toFixed(2)}`);
  console.log(`  Holiday Pay:    ₱${pay.holidayPay.toFixed(2)}`);
  console.log(`  Night Diff Pay: ₱${pay.nightDiffPay.toFixed(2)}`);
  console.log(`  Gross Pay:      ₱${pay.totalGrossPay.toFixed(2)}`);
  console.log('──────────────────────────────────────────────────────────');
  console.log(`  SSS:            -₱${sss.toFixed(2)}`);
  console.log(`  PhilHealth:     -₱${phic.toFixed(2)}`);
  console.log(`  Pag-IBIG:       -₱${hdmf.toFixed(2)}`);
  console.log(`  Total Deduct:   -₱${totalDed.toFixed(2)}`);
  console.log('──────────────────────────────────────────────────────────');
  console.log(`  NET PAY:        ₱${netPay.toFixed(2)}`);
  console.log('══════════════════════════════════════════════════════════');

  // Daily breakdown
  console.log('\n  📊 Daily Breakdown:');
  for (const day of pay.breakdown) {
    const d = new Date(day.date);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const reg = day.regularHours.toFixed(2);
    const ot  = day.overtimeHours.toFixed(2);
    const total = (day.regularHours + day.overtimeHours).toFixed(2);
    console.log(`     ${dateStr}:  Reg ${reg}h + OT ${ot}h = ${total}h`);
  }

  // 7. Insert the payroll entry
  const entryId = uuid();
  await db.insert(payrollEntries).values({
    id: entryId,
    userId: kaye.id,
    payrollPeriodId: periodId,
    totalHours: totalHours.toFixed(2),
    regularHours: regularHrs.toFixed(2),
    overtimeHours: overtimeHrs.toFixed(2),
    nightDiffHours: nightDiffHrs.toFixed(2),
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
    netPay: netPay.toFixed(2),
    status: 'paid',
    createdAt: new Date(),
    paidAt: new Date(),
  });
  console.log(`\n✅ Payroll entry created: ${entryId}`);

  // 8. Update the payroll period with totals
  await db.update(payrollPeriods)
    .set({
      totalHours: totalHours.toFixed(2),
      totalPay: pay.totalGrossPay.toFixed(2),
      status: 'closed',
    })
    .where(eq(payrollPeriods.id, periodId));
  console.log(`✅ Period ${periodId} updated → closed`);

  // 9. 13th Month Ledger
  await db.insert(thirteenthMonthLedger).values({
    id: uuid(),
    userId: kaye.id,
    branchId,
    payrollPeriodId: periodId,
    year: 2026,
    basicPayEarned: pay.basicPay.toFixed(2),
    periodStartDate: periodStart,
    periodEndDate: periodEnd,
  }).onConflictDoNothing();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`  ✅ Kaye attendance + payroll seeded in ${elapsed}s`);
  console.log(`═══════════════════════════════════════════════════════════\n`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
