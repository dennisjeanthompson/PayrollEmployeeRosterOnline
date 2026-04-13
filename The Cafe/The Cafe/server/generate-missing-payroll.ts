import 'dotenv/config';
import { dbStorage as storage } from "./db-storage";
import { calculatePeriodPay } from "./payroll-utils";
import { db } from "./db";
import { users, branches, payrollPeriods, payrollEntries } from "@shared/schema";
import { eq, and, like } from "drizzle-orm";

async function run() {
  console.log("Cleaning up and regenerating payroll periods based on existing shifts...");

  // Get branch
  const allBranches = await db.select().from(branches).limit(1);
  if (allBranches.length === 0) return console.log("No branches");
  const branchId = allBranches[0].id;
  console.log("Branch:", branchId);

  // Delete previously generated (bad) periods from this script run
  // They have UUIDs (not the period-2026-* IDs from init-db seeding)
  const existingPeriods = await storage.getPayrollPeriodsByBranch(branchId);
  const scriptPeriods = existingPeriods.filter(p =>
    !p.id.startsWith('period-') && p.status === 'paid'
  );
  for (const period of scriptPeriods) {
    // Delete entries first
    const entries = await storage.getPayrollEntriesByPeriod(period.id);
    for (const e of entries) {
      await storage.deletePayrollEntry(e.id);
    }
    await storage.deletePayrollPeriod(period.id);
    console.log("Deleted bad period:", period.id);
  }

  // Also delete bad entries from old init-db periods (period-2026-03-01, etc)
  // by deleting entries that have grossPay = '0'
  const oldPeriods = existingPeriods.filter(p => p.id.startsWith('period-'));
  for (const period of oldPeriods) {
    const entries = await storage.getPayrollEntriesByPeriod(period.id);
    for (const e of entries) {
      await storage.deletePayrollEntry(e.id);
    }
    console.log(`Cleared ${entries.length} stale entries from period ${period.id}`);
  }

  const employees = await db.select().from(users).where(eq(users.branchId, branchId));
  const activeEmployees = employees.filter(e => e.isActive && e.role !== 'admin');
  console.log(`Active employees: ${activeEmployees.length}`);

  // Jan to March periods - reuse existing period IDs  
  const periods = [
    { id: 'period-2026-01-01', start: "2026-01-01", end: "2026-01-15" },
    { id: 'period-2026-01-16', start: "2026-01-16", end: "2026-01-31" },
    { id: 'period-2026-02-01', start: "2026-02-01", end: "2026-02-15" },
    { id: 'period-2026-02-16', start: "2026-02-16", end: "2026-02-28" },
    { id: 'period-2026-03-01', start: "2026-03-01", end: "2026-03-15" },
    { id: 'period-2026-03-16', start: "2026-03-16", end: "2026-03-31" },
  ];

  for (const { id, start, end } of periods) {
    const startDt = new Date(start);
    const endDt = new Date(end);
    
    // Check if the period still exists (from init-db seeding)
    const existingPeriod = await storage.getPayrollPeriod(id);
    if (!existingPeriod) {
      console.log(`Period ${id} not found, skipping`);
      continue;
    }

    const periodHolidays = await storage.getHolidays(startDt, endDt);
    console.log(`\nProcessing period: ${start} to ${end}`);

    let totalHoursAll = 0;
    let totalPayAll = 0;
    let entryCount = 0;

    for (const employee of activeEmployees) {
      const shifts = await storage.getShiftsByUser(employee.id, startDt, endDt);
      if (shifts.length === 0) continue;

      const hourlyRate = parseFloat(String(employee.hourlyRate));
      if (isNaN(hourlyRate) || hourlyRate <= 0) continue;

      // CORRECTLY using the returned properties from calculatePeriodPay
      const pay = calculatePeriodPay(shifts, hourlyRate, periodHolidays, 0, false);

      const gross = pay.totalGrossPay;
      const sss = gross > 0 ? 500 : 0;
      const phic = gross > 0 ? 300 : 0;
      const hdmf = gross > 0 ? 200 : 0;
      const totalDed = sss + phic + hdmf;
      const net = gross - totalDed;

      // totalHours = sum of all hours in breakdown
      const totalHours = pay.breakdown.reduce((s, d) => s + d.regularHours + d.overtimeHours, 0);
      const regularHours = pay.breakdown.reduce((s, d) => s + d.regularHours, 0);
      const overtimeHours = pay.breakdown.reduce((s, d) => s + d.overtimeHours, 0);
      const nightDiffHours = pay.breakdown.reduce((s, d) => s + d.regularNightDiffHours + d.overtimeNightDiffHours, 0);

      totalHoursAll += totalHours;
      totalPayAll += gross;

      await storage.createPayrollEntry({
        userId: employee.id,
        payrollPeriodId: id,
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
        withholdingTax: "0.00",
        advances: "0.00",
        otherDeductions: "0.00",
        totalDeductions: totalDed.toFixed(2),
        deductions: totalDed.toFixed(2),
        netPay: net.toFixed(2),
        status: "paid",
        payBreakdown: JSON.stringify(pay)
      });
      entryCount++;
    }

    // Update period totals
    await storage.updatePayrollPeriod(id, {
      totalHours: totalHoursAll.toFixed(2),
      totalPay: totalPayAll.toFixed(2)
    });
    console.log(`  Created ${entryCount} entries; gross total = ${totalPayAll.toFixed(2)}`);
  }

  console.log("\n✅ Payroll regeneration complete!");
  process.exit(0);
}

run().catch(console.error);
