import 'dotenv/config';
import { dbStorage as storage } from './server/db-storage';
import { db } from './server/db';
import { branches } from './shared/schema';

async function run() {
  const allBranches = await db.select().from(branches);
  const branchId = allBranches[0].id;

  const targetMonth = 2; // March (0-indexed)
  const targetYear = 2026;

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

  console.log('Target date range:', startDate, 'to', endDate);

  const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
  console.log(`Found ${allPeriods.length} total periods for branch`);

  const monthPeriods = allPeriods.filter((p) => {
    const periodEnd = new Date(p.endDate);
    const periodStart = new Date(p.startDate);
    
    // Include period if it overlaps with the target month
    return periodEnd >= startDate && periodStart <= endDate;
  });

  console.log(`Found ${monthPeriods.length} periods overlapping March:`);
  console.log(monthPeriods.map(p => ({
    id: p.id,
    start: p.startDate,
    end: p.endDate,
    status: p.status
  })));

  let totalGross = 0;
  for (const period of monthPeriods) {
    const entries = await storage.getPayrollEntriesByPeriod(period.id);
    console.log(`  Period ${period.id} has ${entries.length} entries`);
    for (const entry of entries) {
      totalGross += parseFloat(String(entry.grossPay || 0));
    }
  }

  console.log(`Total gross: ${totalGross}`);
  process.exit(0);
}

run().catch(console.error);
