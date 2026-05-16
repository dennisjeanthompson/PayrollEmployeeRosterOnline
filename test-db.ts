import { db } from './server/db';
import { payrollPeriods, payrollEntries } from '@shared/schema';

async function test() {
  const periods = await db.select().from(payrollPeriods);
  console.log("Periods:", JSON.stringify(periods, null, 2));
  const entries = await db.select().from(payrollEntries);
  console.log("Entries count:", entries.length);
  process.exit(0);
}
test();
