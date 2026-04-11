/**
 * Seed April 2026 Payroll Data for ALL branches
 * 
 * This script:
 * 1. Fixes existing payroll periods (Jan-Mar) to be per-branch instead of all Malate
 * 2. Creates April 2026 payroll periods for every branch
 * 3. Seeds April 2026 shifts for every employee
 * 4. Creates payroll entries with DOLE-compliant deductions for every employee
 * 
 * Run: DATABASE_URL=<your-url> npx tsx server/seed-april-payroll.ts
 */

import 'dotenv/config';
import { db } from './db';
import { users, branches, shifts, payrollPeriods, payrollEntries } from '../shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getWorkingDays(year: number, month: number, startDay: number, endDay: number, holidayDates: string[] = []): Date[] {
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

const shiftPatterns = [
  { name: 'Morning', start: 0, end: 8 },     // 8AM-4PM PHT
  { name: 'Day', start: 3, end: 11 },         // 11AM-7PM PHT
  { name: 'Afternoon', start: 7, end: 15 },   // 3PM-11PM PHT
];

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  PERO Payroll — April 2026 Seed + Period Fix        ║');
  console.log(`║  Time: ${new Date().toLocaleString('en-PH')}            ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // ─── Step 1: Load all branches and employees ─────────────────────
  const allBranches = await db.select().from(branches);
  const allUsers = await db.select().from(users);

  console.log(`📦 Found ${allBranches.length} branches:`);
  for (const b of allBranches) {
    const branchUsers = allUsers.filter(u => u.branchId === b.id);
    console.log(`   • ${b.name} (${b.id}) — ${branchUsers.length} users`);
  }

  // ─── Step 2: Fix existing payroll periods to be per-branch ───────
  console.log('\n🔧 Step 2 — Fixing existing payroll periods to be per-branch...\n');

  // The original seed created all periods with branchId = allBranches[0].id (Malate only).
  // We need to duplicate them for Tondo, QC, and La Union.
  const existingPeriods = await db.select().from(payrollPeriods);
  const existingPeriodBranches = new Set(existingPeriods.map(p => p.branchId));
  
  console.log(`   Found ${existingPeriods.length} existing periods across branches: ${[...existingPeriodBranches].join(', ')}`);

  // Find primary branch (the one that currently has all periods)
  const primaryBranchId = existingPeriods[0]?.branchId;

  // Get periods that belong to the primary branch only (these are the template periods)
  const templatePeriods = existingPeriods.filter(p => p.branchId === primaryBranchId);

  // For each OTHER branch that has employees but no periods, clone the template periods
  for (const branch of allBranches) {
    if (branch.id === primaryBranchId) continue; // Skip the branch that already has data
    
    const branchEmployees = allUsers.filter(u => u.branchId === branch.id && u.role !== 'admin');
    if (branchEmployees.length === 0) continue;

    // Check if this branch already has periods
    const branchPeriods = existingPeriods.filter(p => p.branchId === branch.id);
    if (branchPeriods.length > 0) {
      console.log(`   ✅ ${branch.name} already has ${branchPeriods.length} periods — skipping`);
      continue;
    }

    console.log(`   🔄 Cloning ${templatePeriods.length} periods for ${branch.name}...`);

    const staff = branchEmployees;
    const { calculateAllDeductions, calculateWithholdingTax } = await import('./utils/deductions');

    for (const tp of templatePeriods) {
      const newPeriodId = `${tp.id}-${branch.id}`;
      
      // Calculate working days for the period
      const start = new Date(tp.startDate);
      const end = new Date(tp.endDate);
      const calendarDaysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      // Count working days (Mon-Sat)
      let workingDays = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0) workingDays++; // Skip Sunday
      }

      let periodTotalPay = 0;

      await db.insert(payrollPeriods).values({
        id: newPeriodId,
        branchId: branch.id,
        startDate: tp.startDate,
        endDate: tp.endDate,
        status: tp.status,
        totalHours: (workingDays * 8 * staff.length).toString(),
        totalPay: '0',
      });

      // Create payroll entries for each employee
      for (let i = 0; i < staff.length; i++) {
        const emp = staff[i];
        const hourlyRate = parseFloat(emp.hourlyRate || '80');
        const regularHours = workingDays * 8;
        const overtimeHours = Math.random() < 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;

        const basicPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.25;
        const grossPay = basicPay + overtimePay;

        // Deductions
        const monthlyBasicSalary = (grossPay / calendarDaysInPeriod) * 30;
        const mandatory = await calculateAllDeductions(monthlyBasicSalary, {
          deductSSS: true, deductPhilHealth: true, deductPagibig: true, deductWithholdingTax: false,
        });

        const periodFraction = 0.5;
        const sssC = Math.round(mandatory.sssContribution * periodFraction * 100) / 100;
        const phC = Math.round(mandatory.philHealthContribution * periodFraction * 100) / 100;
        const piC = Math.round(mandatory.pagibigContribution * periodFraction * 100) / 100;

        const monthlyMandatory = mandatory.sssContribution + mandatory.philHealthContribution + mandatory.pagibigContribution;
        const monthlyTaxable = Math.max(0, monthlyBasicSalary - monthlyMandatory);
        const monthlyTax = await calculateWithholdingTax(monthlyTaxable);
        const tax = Math.round(monthlyTax * periodFraction * 100) / 100;

        const sssLoan = parseFloat(emp.sssLoanDeduction || '0');
        const pagibigLoan = parseFloat(emp.pagibigLoanDeduction || '0');
        const totalDeductions = sssC + phC + piC + tax + sssLoan + pagibigLoan;
        const netPay = grossPay - totalDeductions;
        periodTotalPay += grossPay;

        await db.insert(payrollEntries).values({
          id: randomUUID(),
          userId: emp.id,
          payrollPeriodId: newPeriodId,
          totalHours: (regularHours + overtimeHours).toFixed(2),
          regularHours: regularHours.toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          nightDiffHours: '0.00',
          basicPay: basicPay.toFixed(2),
          overtimePay: overtimePay.toFixed(2),
          nightDiffPay: '0.00',
          holidayPay: '0.00',
          grossPay: grossPay.toFixed(2),
          sssContribution: sssC.toFixed(2),
          sssLoan: sssLoan.toFixed(2),
          philHealthContribution: phC.toFixed(2),
          pagibigContribution: piC.toFixed(2),
          pagibigLoan: pagibigLoan.toFixed(2),
          withholdingTax: tax.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          deductions: totalDeductions.toFixed(2),
          netPay: netPay.toFixed(2),
          status: tp.status === 'closed' ? 'paid' : 'pending',
          paidAt: tp.status === 'closed' ? new Date(end.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
        });
      }

      // Update period totalPay
      await db.update(payrollPeriods)
        .set({ totalPay: periodTotalPay.toFixed(2) })
        .where(eq(payrollPeriods.id, newPeriodId));
    }
    console.log(`   ✅ ${branch.name}: Created ${templatePeriods.length} periods with payroll entries`);
  }

  // ─── Step 3: Create April 2026 shifts & payroll for ALL branches ─
  console.log('\n📅 Step 3 — Creating April 2026 data for ALL branches...\n');

  const apr2026Holidays = ['2026-04-02', '2026-04-03', '2026-04-04', '2026-04-09']; // Holy Week + Araw ng Kagitingan
  const apr1_15 = getWorkingDays(2026, 3, 1, 15, apr2026Holidays);   // April month=3
  const apr16_30 = getWorkingDays(2026, 3, 16, 30, apr2026Holidays);

  const { calculateAllDeductions, calculateWithholdingTax } = await import('./utils/deductions');

  for (const branch of allBranches) {
    const branchEmployees = allUsers.filter(u => u.branchId === branch.id && u.role !== 'admin');
    const staff = branchEmployees;
    
    if (staff.length === 0) {
      console.log(`   ⏭️  ${branch.name}: No employees — skipping`);
      continue;
    }

    // Check if April periods already exist for this branch
    const existingAprilPeriods = (await db.select().from(payrollPeriods).where(
      and(eq(payrollPeriods.branchId, branch.id))
    )).filter(p => {
      const s = new Date(p.startDate);
      return s.getFullYear() === 2026 && s.getMonth() === 3; // April = month 3
    });

    if (existingAprilPeriods.length > 0) {
      console.log(`   ✅ ${branch.name}: April periods already exist — skipping`);
      continue;
    }

    console.log(`   🏗️  ${branch.name}: Creating shifts + payroll for ${staff.length} employees...`);

    // ── Create shifts ───────────────────────────────────────────
    const allAprilDays = [...apr1_15, ...apr16_30];
    let shiftCount = 0;
    for (const shiftDate of allAprilDays) {
      for (let i = 0; i < staff.length; i++) {
        const emp = staff[i];
        const pattern = shiftPatterns[i % shiftPatterns.length];
        const startTime = new Date(shiftDate);
        startTime.setUTCHours(pattern.start, 0, 0, 0);
        const endTime = new Date(shiftDate);
        endTime.setUTCHours(pattern.end, 0, 0, 0);

        const isPast = shiftDate < new Date();

        await db.insert(shifts).values({
          id: randomUUID(),
          userId: emp.id,
          branchId: branch.id,
          startTime,
          endTime,
          position: emp.position || 'Staff',
          status: isPast ? 'completed' : 'scheduled',
        });
        shiftCount++;
      }
    }
    console.log(`      📋 Created ${shiftCount} shifts`);

    // ── Create payroll periods + entries ─────────────────────────
    const periodDefs = [
      { id: `period-2026-04-01-${branch.id}`, start: '2026-04-01', end: '2026-04-15', days: apr1_15, status: 'closed' as const },
      { id: `period-2026-04-16-${branch.id}`, start: '2026-04-16', end: '2026-04-30', days: apr16_30, status: 'open' as const },
    ];

    for (const pd of periodDefs) {
      const startDt = new Date(pd.start);
      const endDt = new Date(pd.end);
      const workingDays = pd.days.length;
      const calendarDaysInPeriod = Math.ceil((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      let periodTotalPay = 0;

      await db.insert(payrollPeriods).values({
        id: pd.id,
        branchId: branch.id,
        startDate: startDt,
        endDate: endDt,
        status: pd.status,
        totalHours: (workingDays * 8 * staff.length).toString(),
        totalPay: '0',
      });

      for (let i = 0; i < staff.length; i++) {
        const emp = staff[i];
        const hourlyRate = parseFloat(emp.hourlyRate || '80');

        // Vary hours slightly per employee for realism
        const regularHours = workingDays * 8;
        const overtimeHours = i % 3 === 0 ? 2 : (i % 3 === 1 ? 1 : 0);
        const basicPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.25;
        const grossPay = basicPay + overtimePay;

        // DOLE-compliant deductions
        const monthlyBasicSalary = (grossPay / calendarDaysInPeriod) * 30;
        const mandatory = await calculateAllDeductions(monthlyBasicSalary, {
          deductSSS: true, deductPhilHealth: true, deductPagibig: true, deductWithholdingTax: false,
        });

        const periodFraction = 0.5;
        const sssC = Math.round(mandatory.sssContribution * periodFraction * 100) / 100;
        const phC = Math.round(mandatory.philHealthContribution * periodFraction * 100) / 100;
        const piC = Math.round(mandatory.pagibigContribution * periodFraction * 100) / 100;

        const monthlyMandatory = mandatory.sssContribution + mandatory.philHealthContribution + mandatory.pagibigContribution;
        const monthlyTaxable = Math.max(0, monthlyBasicSalary - monthlyMandatory);
        const monthlyTax = await calculateWithholdingTax(monthlyTaxable);
        const tax = Math.round(monthlyTax * periodFraction * 100) / 100;

        const sssLoan = parseFloat(emp.sssLoanDeduction || '0');
        const pagibigLoan = parseFloat(emp.pagibigLoanDeduction || '0');
        const totalDeductions = sssC + phC + piC + tax + sssLoan + pagibigLoan;
        const netPay = grossPay - totalDeductions;
        periodTotalPay += grossPay;

        await db.insert(payrollEntries).values({
          id: randomUUID(),
          userId: emp.id,
          payrollPeriodId: pd.id,
          totalHours: (regularHours + overtimeHours).toFixed(2),
          regularHours: regularHours.toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          nightDiffHours: '0.00',
          basicPay: basicPay.toFixed(2),
          overtimePay: overtimePay.toFixed(2),
          nightDiffPay: '0.00',
          holidayPay: '0.00',
          grossPay: grossPay.toFixed(2),
          sssContribution: sssC.toFixed(2),
          sssLoan: sssLoan.toFixed(2),
          philHealthContribution: phC.toFixed(2),
          pagibigContribution: piC.toFixed(2),
          pagibigLoan: pagibigLoan.toFixed(2),
          withholdingTax: tax.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          deductions: totalDeductions.toFixed(2),
          netPay: netPay.toFixed(2),
          status: pd.status === 'closed' ? 'paid' : 'pending',
          paidAt: pd.status === 'closed' ? new Date(endDt.getTime() + 5 * 24 * 60 * 60 * 1000) : null,
        });
      }

      await db.update(payrollPeriods)
        .set({ totalPay: periodTotalPay.toFixed(2) })
        .where(eq(payrollPeriods.id, pd.id));

      console.log(`      💰 Period ${pd.start}→${pd.end} (${pd.status}): ${staff.length} entries, Total: ₱${periodTotalPay.toFixed(2)}`);
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────
  const finalPeriods = await db.select().from(payrollPeriods);
  const finalEntries = await db.select().from(payrollEntries);
  
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  ✅ SEEDING COMPLETE                                ║');
  console.log(`║  Payroll Periods: ${String(finalPeriods.length).padStart(4)}                              ║`);
  console.log(`║  Payroll Entries: ${String(finalEntries.length).padStart(4)}                              ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

main()
  .catch(err => {
    console.error('❌ FATAL:', err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
