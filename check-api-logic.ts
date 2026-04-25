import 'dotenv/config';
import { db } from './server/db';
import { payrollEntries, payrollPeriods, users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function run() {
  const activeEmployees = await db.select().from(users).where(eq(users.isActive, true));
  const allPeriods = await db.select().from(payrollPeriods);
  const periodMap = new Map(allPeriods.map((p) => [p.id, p]));

  let totalGross = 0, totalSSS = 0, totalPhilHealth = 0, totalPagibig = 0, totalTax = 0;

  const targetMonth = 2; // March is 2 (0-indexed)
  const targetYear = 2026;
  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

  for (const employee of activeEmployees) {
    const entries = await db.select().from(payrollEntries).where(eq(payrollEntries.userId, employee.id));
    for (const entry of entries) {
      const period = periodMap.get(entry.payrollPeriodId);
      if (period) {
        const periodEnd = new Date(period.endDate);
        if (periodEnd >= startDate && periodEnd <= endDate) {
          totalGross += parseFloat(entry.grossPay || "0");
          totalSSS += parseFloat(entry.sssContribution || "0");
          totalPhilHealth += parseFloat(entry.philHealthContribution || "0");
          totalPagibig += parseFloat(entry.pagibigContribution || "0");
          totalTax += parseFloat(entry.withholdingTax || "0");
          console.log(`Matched entry for ${employee.id}. Gross: ${entry.grossPay}, SSS: ${entry.sssContribution}, PHIC: ${entry.philHealthContribution}`);
        }
      }
    }
  }

  console.log('Result:');
  console.log({
    totalGross: (Math.round(totalGross * 100) / 100).toFixed(2),
    totalSSS: (Math.round(totalSSS * 100) / 100).toFixed(2),
    totalPhilHealth: (Math.round(totalPhilHealth * 100) / 100).toFixed(2),
  });
}

run().catch(console.error).then(() => process.exit(0));
