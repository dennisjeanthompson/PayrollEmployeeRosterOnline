import 'dotenv/config';
import { db } from './server/db';
import { payrollPeriods, payrollEntries } from './shared/schema';

(async () => {
  const periods = await db.select().from(payrollPeriods);
  console.log('Periods:', periods.length);
  const entries = await db.select().from(payrollEntries).limit(2);
  console.log('Entries:', entries);
  process.exit(0);
})();

