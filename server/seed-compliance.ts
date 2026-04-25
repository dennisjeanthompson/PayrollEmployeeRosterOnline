/**
 * seed-compliance.ts
 * Seeds the LIVE Neon DB with:
 *  1. Government IDs (TIN, SSS, PhilHealth, Pag-IBIG) for all employees
 *  2. Leave Credits (SIL + sick) for all employees for current year
 *  3. More realistic schedules (shifts) for the current month
 *  4. 13th month ledger entries back-filled from existing payroll periods
 *
 * Run with: npx tsx server/seed-compliance.ts
 */

import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ─── Government ID data ──────────────────────────────────────────────────────
// Each worker gets a unique (realistic but fictitious) government ID
const GOVERNMENT_IDS: Record<string, {
  tin: string;
  sssNumber: string;
  philhealthNumber: string;
  pagibigNumber: string;
}> = {
  // Keyed by username or firstName+lastName lookup
  'sofia': { tin: '123-456-789-000', sssNumber: '33-1234567-8', philhealthNumber: '12-123456789-0', pagibigNumber: '1234-5678-9012' },
  'bea':   { tin: '234-567-890-001', sssNumber: '33-2345678-9', philhealthNumber: '12-234567890-1', pagibigNumber: '2345-6789-0123' },
  'pedro': { tin: '345-678-901-002', sssNumber: '33-3456789-0', philhealthNumber: '12-345678901-2', pagibigNumber: '3456-7890-1234' },
  'ana':   { tin: '456-789-012-003', sssNumber: '33-4567890-1', philhealthNumber: '12-456789012-3', pagibigNumber: '4567-8901-2345' },
  'sam':   { tin: '567-890-123-004', sssNumber: '33-5678901-2', philhealthNumber: '12-567890123-4', pagibigNumber: '5678-9012-3456' },
  'manager': { tin: '678-901-234-005', sssNumber: '33-6789012-3', philhealthNumber: '12-678901234-5', pagibigNumber: '6789-0123-4567' },
};

// ─── Leave credit defaults (PH Labor Code) ──────────────────────────────────
const LEAVE_TYPES = [
  { leaveType: 'sil',     totalCredits: '5.00', label: 'Service Incentive Leave' },
  { leaveType: 'sick',    totalCredits: '5.00', label: 'Sick Leave (Discretionary)' },
  { leaveType: 'vacation',totalCredits: '5.00', label: 'Vacation Leave (Discretionary)' },
];

async function main() {
  console.log('🌱 Starting compliance seeder...\n');

  // ── 1. Get all users ──────────────────────────────────────────────────────
  const users = await db.select().from(schema.users);
  console.log(`Found ${users.length} users`);

  // ── 2. Seed government IDs by username match ──────────────────────────────
  console.log('\n📋 Seeding government IDs...');
  for (const user of users) {
    if (user.role === 'admin') continue;
    // Try exact username match, then first name lowercase
    const lookup = user.username?.toLowerCase() || user.firstName?.toLowerCase() || '';
    const ids = GOVERNMENT_IDS[lookup]
      || GOVERNMENT_IDS[user.firstName?.toLowerCase() || ''];

    if (ids) {
      await db.update(schema.users)
        .set({
          tin: ids.tin,
          sssNumber: ids.sssNumber,
          philhealthNumber: ids.philhealthNumber,
          pagibigNumber: ids.pagibigNumber,
        })
        .where(eq(schema.users.id, user.id));
      console.log(`  ✅ ${user.firstName} ${user.lastName} → IDs set`);
    } else {
      // Generate deterministic fake IDs based on their position in the list
      const idx = users.indexOf(user) + 1;
      await db.update(schema.users)
        .set({
          tin: `${100 + idx}${200 + idx}-${300 + idx}${400 + idx}-000`,
          sssNumber: `33-${1000000 + idx}-${idx % 10}`,
          philhealthNumber: `12-${100000000 + idx}-${idx % 10}`,
          pagibigNumber: `${1000 + idx}-${2000 + idx}-${3000 + idx}`,
        })
        .where(eq(schema.users.id, user.id));
      console.log(`  ✅ ${user.firstName} ${user.lastName} → auto-generated IDs`);
    }
  }

  // ── 3. Seed Leave Credits ─────────────────────────────────────────────────
  console.log('\n🌴 Seeding leave credits...');
  const currentYear = new Date().getFullYear();
  const branches = await db.select().from(schema.branches);
  const branchId = branches[0]?.id;

  const employees = users.filter(u => u.role === 'employee');
  for (const emp of employees) {
    for (const lt of LEAVE_TYPES) {
      // Check if credit already exists
      const existing = await db.select()
        .from(schema.leaveCredits)
        .where(
          and(
            eq(schema.leaveCredits.userId, emp.id),
            eq(schema.leaveCredits.leaveType, lt.leaveType),
            eq(schema.leaveCredits.year, currentYear),
          )
        );
      if (existing.length > 0) {
        console.log(`  ℹ️  ${emp.firstName} ${lt.label} ${currentYear} exists`);
        continue;
      }
      await db.insert(schema.leaveCredits).values({
        id: randomUUID(),
        userId: emp.id,
        branchId: branchId || '',
        year: currentYear,
        leaveType: lt.leaveType,
        totalCredits: lt.totalCredits,
        usedCredits: '0.00',
        remainingCredits: lt.totalCredits,
        notes: `Auto-seeded (${lt.label})`,
        updatedAt: new Date(),
      });
      console.log(`  ✅ ${emp.firstName} → ${lt.label} (${lt.totalCredits} days)`);
    }
  }

  // ── 4. Back-fill 13th month ledger from payroll entries ──────────────────
  console.log('\n🗓️ Back-filling 13th month ledger...');
  const periods = await db.select().from(schema.payrollPeriods);
  const thisYearPeriods = periods.filter(p => new Date(p.startDate).getFullYear() === currentYear);
  console.log(`  Found ${thisYearPeriods.length} payroll periods this year`);

  for (const period of thisYearPeriods) {
    const entries = await db.select().from(schema.payrollEntries)
      .where(eq(schema.payrollEntries.payrollPeriodId, period.id));

    for (const entry of entries) {
      const existing = await db.select()
        .from(schema.thirteenthMonthLedger)
        .where(
          and(
            eq(schema.thirteenthMonthLedger.userId, entry.userId),
            eq(schema.thirteenthMonthLedger.payrollPeriodId, period.id),
            eq(schema.thirteenthMonthLedger.year, currentYear),
          )
        );
      if (existing.length > 0) continue;

      const basicPay = parseFloat(String(entry.basicPay || entry.grossPay || 0));
      if (basicPay <= 0) continue;

      await db.insert(schema.thirteenthMonthLedger).values({
        id: randomUUID(),
        userId: entry.userId,
        branchId: branchId || '',
        payrollPeriodId: period.id,
        year: currentYear,
        basicPayEarned: String(basicPay),
        periodStartDate: period.startDate,
        periodEndDate: period.endDate,
        createdAt: new Date(),
      });
      console.log(`  ✅ ${entry.userId.substring(0, 8)} → ₱${basicPay.toFixed(2)} recorded for period ${period.startDate.toISOString().substring(0,10)}`);
    }
  }

  // ── 5. Seed extra shifts for this month ──────────────────────────────────
  console.log('\n📅 Seeding extra shifts for March 2026...');
  const today = new Date();
  const year = 2026;
  const month = 2; // March (0-indexed)

  // Create working shifts for all employees for remaining days of March
  let shiftCount = 0;
  for (const emp of employees) {
    // Add 5 upcoming shifts (March 21-25 as an example range)
    for (let day = 21; day <= 25; day++) {
      const shiftDate = new Date(year, month, day);
      // Skip Sundays
      if (shiftDate.getDay() === 0) continue;

      const startHour = [8, 10, 14][day % 3]; // Rotate: morning, mid, afternoon
      const startTime = new Date(year, month, day, startHour, 0, 0);
      const endTime = new Date(year, month, day, startHour + 8, 0, 0);

      // Check if shift already exists
      const existing = await db.select()
        .from(schema.shifts)
        .where(
          and(
            eq(schema.shifts.userId, emp.id),
            eq(schema.shifts.startTime, startTime),
          )
        );
      if (existing.length > 0) continue;

      await db.insert(schema.shifts).values({
        id: randomUUID(),
        userId: emp.id,
        branchId: branchId || '',
        position: 'Barista',
        startTime,
        endTime,
        status: 'scheduled',
        isRecurring: false,
        recurringPattern: null,
        createdAt: new Date(),
        actualStartTime: null,
        actualEndTime: null,
      });
      shiftCount++;
    }
  }
  console.log(`  ✅ ${shiftCount} new shifts created`);

  console.log('\n✅ Compliance seeding complete!');
  await pool.end();
}

main().catch(err => {
  console.error('❌ Seeder failed:', err.message);
  pool.end();
  process.exit(1);
});
