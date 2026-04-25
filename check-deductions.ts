import 'dotenv/config';
import { db } from './server/db';
import { payrollEntries } from './shared/schema';

async function run() {
  const entries = await db.select().from(payrollEntries);
  for (const e of entries) {
    if (e.payrollPeriodId.includes('2026-03-01') || e.payrollPeriodId.includes('2026-03-16')) {
      console.log(`[${e.payrollPeriodId}] User: ${e.userId}, Gross: ${e.grossPay}, SSS: ${e.sssContribution}, PHIC: ${e.philHealthContribution}`);
    }
  }
}

run().catch(console.error).then(() => process.exit(0));
