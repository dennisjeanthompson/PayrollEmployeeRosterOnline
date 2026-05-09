/**
 * seed-fresh.ts — Complete database reset + reseed
 * 3 branches, 1 admin, 3 managers, 24 employees (8 per branch)
 * Pay rate: ₱450/day (₱56.25/hr × 8hrs)
 * Run: npx tsx server/seed-fresh.ts
 */

import 'dotenv/config';
import { db } from './db';
import { sql, eq } from 'drizzle-orm';
import {
  branches, users, shifts, payrollPeriods, payrollEntries,
  notifications, approvals, timeOffRequests, adjustmentLogs,
  auditLogs, deductionSettings, holidays, leaveCredits,
  shiftTrades, setupStatus,
} from '../shared/schema';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();
const HOURLY_RATE = '56.25'; // ₱450/day ÷ 8hrs
const DAILY_RATE = '450';
const PW = 'password123';

// ═══════════════════════════════════════════════════════════════
// BRANCH DEFINITIONS
// ═══════════════════════════════════════════════════════════════
const BRANCHES = [
  { id: 'branch-bauang', name: 'Bauang La Union', address: 'National Highway, Bauang, La Union', phone: '(072) 700-1001' },
  { id: 'branch-sanfernando', name: 'San Fernando, La Union', address: 'Quezon Ave, City of San Fernando, La Union', phone: '(072) 700-1002' },
  { id: 'branch-sancarlo', name: 'San Carlos City, Pangasinan', address: 'Maharlika Highway, San Carlos City, Pangasinan', phone: '(075) 700-1003' },
];

// ═══════════════════════════════════════════════════════════════
// USER DEFINITIONS
// ═══════════════════════════════════════════════════════════════
const ADMIN = {
  id: 'user-admin-global', username: 'admin.pero', email: 'admin@pero.ph',
  firstName: 'System', lastName: 'Admin', role: 'admin',
  position: 'System Administrator', branchId: 'branch-bauang',
};

const MANAGERS = [
  { id: 'user-mgr-bauang', username: 'mgr.bauang', email: 'mgr.bauang@pero.ph', firstName: 'Juan', lastName: 'Santos', branchId: 'branch-bauang', position: 'Branch Manager' },
  { id: 'user-mgr-sanfernando', username: 'mgr.sanfernando', email: 'mgr.sanfernando@pero.ph', firstName: 'Elena', lastName: 'Aquino', branchId: 'branch-sanfernando', position: 'Branch Manager' },
  { id: 'user-mgr-sancarlo', username: 'mgr.sancarlo', email: 'mgr.sancarlo@pero.ph', firstName: 'Roberto', lastName: 'Diaz', branchId: 'branch-sancarlo', position: 'Branch Manager' },
];

interface EmpDef {
  id: string; username: string; email: string;
  firstName: string; lastName: string; branchId: string; position: string;
}

const makeEmployees = (branchId: string, prefix: string, defs: Array<[string, string, string, string]>): EmpDef[] =>
  defs.map(([id, first, last, pos], i) => ({
    id: `user-${prefix}-${String(i + 1).padStart(2, '0')}`,
    username: `${id}.${prefix}`,
    email: `${id}.${prefix}@pero.ph`,
    firstName: first, lastName: last, branchId, position: pos,
  }));

const EMPLOYEES_BAUANG = makeEmployees('branch-bauang', 'bauang', [
  ['maria.cruz', 'Maria', 'Cruz', 'Senior Barista'],
  ['jose.reyes', 'Jose', 'Reyes', 'Barista'],
  ['ana.flores', 'Ana', 'Flores', 'Cashier'],
  ['pedro.garcia', 'Pedro', 'Garcia', 'Kitchen Staff'],
  ['rosa.delacruz', 'Rosa', 'Dela Cruz', 'Server'],
  ['miguel.santos', 'Miguel', 'Santos', 'Barista'],
  ['liza.torres', 'Liza', 'Torres', 'Shift Lead'],
  ['carlo.ramos', 'Carlo', 'Ramos', 'Kitchen Staff'],
]);

const EMPLOYEES_SANFERNANDO = makeEmployees('branch-sanfernando', 'sanfernando', [
  ['rico.mendoza', 'Rico', 'Mendoza', 'Senior Barista'],
  ['jessa.villanueva', 'Jessa', 'Villanueva', 'Cashier'],
  ['mark.lopez', 'Mark', 'Lopez', 'Barista'],
  ['gina.navarro', 'Gina', 'Navarro', 'Server'],
  ['ryan.fernandez', 'Ryan', 'Fernandez', 'Kitchen Staff'],
  ['pia.castillo', 'Pia', 'Castillo', 'Barista'],
  ['bong.soriano', 'Bong', 'Soriano', 'Shift Lead'],
  ['nena.pascual', 'Nena', 'Pascual', 'Kitchen Staff'],
]);

const EMPLOYEES_SANCARLO = makeEmployees('branch-sancarlo', 'sancarlo', [
  ['luz.gonzales', 'Luz', 'Gonzales', 'Senior Barista'],
  ['arnel.macaraeg', 'Arnel', 'Macaraeg', 'Barista'],
  ['cris.bautista', 'Cris', 'Bautista', 'Cashier'],
  ['mila.aguilar', 'Mila', 'Aguilar', 'Server'],
  ['danny.estrada', 'Danny', 'Estrada', 'Kitchen Staff'],
  ['tess.molina', 'Tess', 'Molina', 'Barista'],
  ['felix.hernandez', 'Felix', 'Hernandez', 'Shift Lead'],
  ['nora.domingo', 'Nora', 'Domingo', 'Kitchen Staff'],
]);

// ═══════════════════════════════════════════════════════════════
// 2026 PH OFFICIAL HOLIDAYS
// ═══════════════════════════════════════════════════════════════
const PH_HOLIDAYS_2026 = [
  { name: "New Year's Day", date: '2026-01-01', type: 'regular' },
  { name: 'Chinese New Year', date: '2026-02-17', type: 'special_non_working' },
  { name: 'EDSA People Power Anniversary', date: '2026-02-25', type: 'special_working' },
  { name: "Eid'l Fitr (Feast of Ramadan)", date: '2026-03-20', type: 'regular' },
  { name: 'Maundy Thursday', date: '2026-04-02', type: 'regular' },
  { name: 'Good Friday', date: '2026-04-03', type: 'regular' },
  { name: 'Black Saturday', date: '2026-04-04', type: 'special_non_working' },
  { name: 'Araw ng Kagitingan (Day of Valor)', date: '2026-04-09', type: 'regular' },
  { name: 'Labor Day', date: '2026-05-01', type: 'regular' },
  { name: "Eid'l Adha (Feast of Sacrifice)", date: '2026-05-27', type: 'regular' },
  { name: 'Independence Day', date: '2026-06-12', type: 'regular' },
  { name: 'Ninoy Aquino Day', date: '2026-08-21', type: 'special_non_working' },
  { name: 'National Heroes Day', date: '2026-08-31', type: 'regular' },
  { name: "All Saints' Day", date: '2026-11-01', type: 'special_non_working' },
  { name: "All Souls' Day", date: '2026-11-02', type: 'special_non_working' },
  { name: 'Bonifacio Day', date: '2026-11-30', type: 'regular' },
  { name: 'Feast of Immaculate Conception', date: '2026-12-08', type: 'special_non_working' },
  { name: 'Christmas Eve', date: '2026-12-24', type: 'special_non_working' },
  { name: 'Christmas Day', date: '2026-12-25', type: 'regular' },
  { name: 'Rizal Day', date: '2026-12-30', type: 'regular' },
  { name: "Last Day of the Year (New Year's Eve)", date: '2026-12-31', type: 'special_non_working' },
];

// ═══════════════════════════════════════════════════════════════
// PAYROLL PERIOD DEFINITIONS (Jan–Mar 2026)
// ═══════════════════════════════════════════════════════════════
const PERIOD_TEMPLATES = [
  { suffix: '2026-01-01', start: '2026-01-01', end: '2026-01-15', status: 'closed', workDays: 12 }, // Jan 1 is holiday
  { suffix: '2026-01-16', start: '2026-01-16', end: '2026-01-31', status: 'closed', workDays: 13 },
  { suffix: '2026-02-01', start: '2026-02-01', end: '2026-02-15', status: 'closed', workDays: 13 },
  { suffix: '2026-02-16', start: '2026-02-16', end: '2026-02-28', status: 'closed', workDays: 11 },
  { suffix: '2026-03-01', start: '2026-03-01', end: '2026-03-15', status: 'closed', workDays: 13 },
  { suffix: '2026-03-16', start: '2026-03-16', end: '2026-03-31', status: 'open', workDays: 13 },
];

// ═══════════════════════════════════════════════════════════════
// DEDUCTION CALCULATION HELPERS
// ═══════════════════════════════════════════════════════════════
function calcSSS(monthlyBasic: number): number {
  // 2026 SSS employee share: 4.5% of monthly salary credit (MSC)
  // MSC ranges. For ₱11,700 monthly: MSC = ₱12,000, employee share = ₱540
  const msc = Math.min(Math.max(Math.ceil(monthlyBasic / 500) * 500, 5000), 35000);
  return Math.round(msc * 0.045 * 100) / 100;
}

function calcPhilHealth(monthlyBasic: number): number {
  // 2026: 5% total, employee pays 2.5%
  const premium = Math.min(Math.max(monthlyBasic * 0.025, 250), 2500);
  return Math.round(premium * 100) / 100;
}

const PAGIBIG_MONTHLY = 200; // employee max contribution

async function computePayroll(workDays: number, periodFraction: 0.5 | 1 = 0.5) {
  const hourlyRate = parseFloat(HOURLY_RATE);
  const regularHours = workDays * 8;
  const basicPay = regularHours * hourlyRate;
  const grossPay = basicPay; // No OT in seed for simplicity

  const monthlyEquivalent = basicPay / periodFraction;
  const sss = Math.round(calcSSS(monthlyEquivalent) * periodFraction * 100) / 100;
  const phic = Math.round(calcPhilHealth(monthlyEquivalent) * periodFraction * 100) / 100;
  const hdmf = Math.round(PAGIBIG_MONTHLY * periodFraction * 100) / 100;
  const totalDeductions = sss + phic + hdmf;
  const netPay = Math.round((grossPay - totalDeductions) * 100) / 100;

  return {
    regularHours: regularHours.toFixed(2),
    totalHours: regularHours.toFixed(2),
    overtimeHours: '0.00',
    nightDiffHours: '0.00',
    basicPay: basicPay.toFixed(2),
    overtimePay: '0.00',
    nightDiffPay: '0.00',
    holidayPay: '0.00',
    restDayPay: '0.00',
    grossPay: grossPay.toFixed(2),
    sssContribution: sss.toFixed(2),
    sssLoan: '0.00',
    philHealthContribution: phic.toFixed(2),
    pagibigLoan: '0.00',
    withholdingTax: '0.00',
    otherDeductions: hdmf.toFixed(2), // Pag-IBIG contribution stored here
    totalDeductions: totalDeductions.toFixed(2),
    deductions: totalDeductions.toFixed(2),
    netPay: netPay.toFixed(2),
    status: 'paid' as const,
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════
async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('  PERO — Fresh Database Seed');
  console.log(`  Time: ${new Date().toLocaleString('en-PH')}`);
  console.log('═'.repeat(60));

  // ─── STEP 1: WIPE ALL DATA ───────────────────────────────────
  console.log('\n🗑️  Step 1 — Wiping all existing data...\n');
  const tablesToWipe = [
    'audit_logs', 'adjustment_log_comments', 'adjustment_logs',
    'shift_trades', 'time_off_requests', 'approvals', 'notifications',
    'leave_credits', 'service_charge_distributions', 'service_charge_pools',
    'archived_payroll_periods', 'payroll_entries', 'payroll_periods',
    'shifts', 'deduction_settings', 'employee_documents',
    'loan_requests', 'worker_allowances', 'de_minimis_ytd',
    'employee_tax_ytd', 'users', 'branches', 'holidays',
    'setup_status',
  ];
  for (const t of tablesToWipe) {
    try {
      await db.execute(sql.raw(`DELETE FROM "${t}"`));
      console.log(`   ✓ ${t}`);
    } catch (e: any) {
      console.log(`   ⚠ ${t}: ${e.message?.substring(0, 60)}`);
    }
  }

  // ─── STEP 2: BRANCHES ────────────────────────────────────────
  console.log('\n🏪 Step 2 — Creating branches...\n');
  for (const b of BRANCHES) {
    await db.insert(branches).values({ ...b, isActive: true });
    console.log(`   ✅ ${b.name}`);
  }

  // ─── STEP 3: USERS ───────────────────────────────────────────
  console.log('\n👥 Step 3 — Creating users...\n');
  const hashedPw = await bcrypt.hash(PW, 10);

  // Admin
  await db.insert(users).values({
    id: ADMIN.id, username: ADMIN.username, password: hashedPw,
    email: ADMIN.email, firstName: ADMIN.firstName, lastName: ADMIN.lastName,
    role: 'admin', position: ADMIN.position, branchId: ADMIN.branchId,
    hourlyRate: HOURLY_RATE, dailyRate: DAILY_RATE, isActive: true,
  });
  console.log(`   ✅ ADMIN: ${ADMIN.username}`);

  // Managers
  for (const m of MANAGERS) {
    await db.insert(users).values({
      id: m.id, username: m.username, password: hashedPw,
      email: m.email, firstName: m.firstName, lastName: m.lastName,
      role: 'manager', position: m.position, branchId: m.branchId,
      hourlyRate: HOURLY_RATE, dailyRate: DAILY_RATE, isActive: true,
    });
    console.log(`   ✅ MGR: ${m.username} → ${m.branchId}`);
  }

  // Employees (all 3 branches)
  const allEmployees = [...EMPLOYEES_BAUANG, ...EMPLOYEES_SANFERNANDO, ...EMPLOYEES_SANCARLO];
  for (const e of allEmployees) {
    await db.insert(users).values({
      id: e.id, username: e.username, password: hashedPw,
      email: e.email, firstName: e.firstName, lastName: e.lastName,
      role: 'employee', position: e.position, branchId: e.branchId,
      hourlyRate: HOURLY_RATE, dailyRate: DAILY_RATE, isActive: true,
    });
  }
  console.log(`   ✅ ${allEmployees.length} employees created (8 per branch)`);

  // ─── STEP 4: DEDUCTION SETTINGS ──────────────────────────────
  console.log('\n⚙️  Step 4 — Deduction settings per branch...\n');
  for (const b of BRANCHES) {
    await db.insert(deductionSettings).values({
      id: `deduction-settings-${b.id}`, branchId: b.id,
      deductSSS: true, deductPhilHealth: true, deductPagibig: true,
      deductWithholdingTax: false, includeExceptionLogs: true,
    });
    console.log(`   ✅ ${b.name}`);
  }

  // ─── STEP 5: 2026 PH HOLIDAYS ────────────────────────────────
  console.log('\n📅 Step 5 — Seeding 2026 PH holidays...\n');
  for (const h of PH_HOLIDAYS_2026) {
    await db.insert(holidays).values({
      id: uuid(), name: h.name, date: new Date(h.date),
      type: h.type, year: 2026, isRecurring: false, workAllowed: true,
    });
    const badge = h.type === 'regular' ? 'Regular' : h.type === 'special_working' ? 'Spec W' : 'Spec NW';
    console.log(`   ✅ ${h.date} ${h.name.padEnd(40)} [${badge}]`);
  }

  // ─── STEP 6: PAYROLL PERIODS + ENTRIES ───────────────────────
  console.log('\n💰 Step 6 — Payroll periods + entries...\n');
  let totalPeriods = 0; let totalEntries = 0;

  for (const branch of BRANCHES) {
    const branchMgr = MANAGERS.find(m => m.branchId === branch.id)!;
    const branchEmps = allEmployees.filter(e => e.branchId === branch.id);
    const staff = [branchMgr, ...branchEmps]; // manager also gets payroll

    for (const pt of PERIOD_TEMPLATES) {
      const periodId = `period-${branch.id}-${pt.suffix}`;
      let periodTotal = 0;

      await db.insert(payrollPeriods).values({
        id: periodId, branchId: branch.id,
        startDate: new Date(pt.start), endDate: new Date(pt.end),
        status: pt.status, totalHours: '0', totalPay: '0',
      });

      for (const emp of staff) {
        const pay = await computePayroll(pt.workDays, 0.5);
        periodTotal += parseFloat(pay.grossPay);

        await db.insert(payrollEntries).values({
          id: uuid(), userId: emp.id, payrollPeriodId: periodId,
          ...pay,
        });
        totalEntries++;
      }

      await db.execute(sql`
        UPDATE payroll_periods SET total_pay = ${periodTotal.toFixed(2)},
        total_hours = ${(parseFloat(staff[0] ? (await computePayroll(pt.workDays, 0.5)).totalHours : '0') * staff.length).toString()}
        WHERE id = ${periodId}
      `);

      console.log(`   ✅ ${branch.name.substring(0, 20).padEnd(22)} ${pt.start}→${pt.end} (${pt.status}) ₱${periodTotal.toFixed(0)}`);
      totalPeriods++;
    }
  }
  console.log(`\n   ✅ ${totalPeriods} periods, ${totalEntries} payroll entries`);

  // ─── STEP 7: SHIFTS (Jan 2026) ───────────────────────────────
  console.log('\n📋 Step 7 — Seeding shifts (January 2026)...\n');
  let totalShifts = 0;

  const SHIFT_PATTERNS = [
    { start: 0, end: 8 },   // 8AM–4PM PHT (UTC 0–8)
    { start: 1, end: 9 },   // 9AM–5PM PHT
    { start: 2, end: 10 },  // 10AM–6PM PHT
    { start: 4, end: 12 },  // 12PM–8PM PHT
  ];

  for (const branch of BRANCHES) {
    const branchMgr = MANAGERS.find(m => m.branchId === branch.id)!;
    const branchEmps = allEmployees.filter(e => e.branchId === branch.id);
    const staff = [...branchEmps]; // employees only get scheduled

    for (let day = 1; day <= 31; day++) {
      const dt = new Date(Date.UTC(2026, 0, day)); // Jan 2026
      if (dt.getMonth() !== 0) break;
      if (dt.getUTCDay() === 0) continue; // Skip Sundays

      for (let i = 0; i < staff.length; i++) {
        const emp = staff[i];
        const pattern = SHIFT_PATTERNS[i % SHIFT_PATTERNS.length];
        const startTime = new Date(Date.UTC(2026, 0, day, pattern.start, 0, 0));
        const endTime = new Date(Date.UTC(2026, 0, day, pattern.end, 0, 0));

        await db.insert(shifts).values({
          id: uuid(), userId: emp.id, branchId: branch.id,
          startTime, endTime, position: emp.position,
          status: day < 20 ? 'completed' : 'scheduled',
          breakDurationMinutes: 30,
          isRecurring: false,
        });
        totalShifts++;
      }
    }
    console.log(`   ✅ ${branch.name}: shifts seeded`);
  }
  console.log(`\n   ✅ ${totalShifts} shifts total`);

  // ─── STEP 8: LEAVE CREDITS ───────────────────────────────────
  console.log('\n🏖️  Step 8 — Leave credits...\n');
  const LEAVE_TYPES = [
    { leaveType: 'sil', totalCredits: '5.00', label: 'Service Incentive Leave' },
    { leaveType: 'sick', totalCredits: '5.00', label: 'Sick Leave' },
    { leaveType: 'vacation', totalCredits: '5.00', label: 'Vacation Leave' },
  ];

  for (const emp of allEmployees) {
    for (const lt of LEAVE_TYPES) {
      await db.insert(leaveCredits).values({
        id: uuid(), userId: emp.id, branchId: emp.branchId,
        year: 2026, leaveType: lt.leaveType,
        totalCredits: lt.totalCredits, usedCredits: '0',
        remainingCredits: lt.totalCredits,
      });
    }
  }
  console.log(`   ✅ ${allEmployees.length * LEAVE_TYPES.length} leave credit records`);

  // ─── STEP 9: SETUP STATUS ────────────────────────────────────
  console.log('\n✅ Step 9 — Setup status...\n');
  await db.insert(setupStatus).values({
    id: 'setup-status-main', isSetupComplete: true, setupCompletedAt: new Date(),
  });

  // ─── DONE ─────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('  ✅ SEED COMPLETE!');
  console.log('═'.repeat(60));
  console.log('\n  🔑 LOGIN CREDENTIALS (all password: password123)');
  console.log('  ─────────────────────────────────────────────────');
  console.log(`  Admin:          admin.pero`);
  for (const m of MANAGERS) {
    console.log(`  Manager:        ${m.username.padEnd(22)} → ${m.branchId}`);
  }
  console.log(`  Employees:      emp.[name].[branch] (e.g. maria.cruz.bauang)`);
  console.log('  ─────────────────────────────────────────────────\n');
}

main().catch(err => {
  console.error('❌ SEED FAILED:', err);
  process.exit(1);
}).finally(() => process.exit(0));
