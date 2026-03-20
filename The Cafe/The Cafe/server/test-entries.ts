import { db } from './db';
import { payrollEntries, payrollPeriods } from '@shared/schema';

async function test() {
  const allEntries = await db.select().from(payrollEntries);
  const allPeriods = await db.select().from(payrollPeriods);
  
  console.log('Entries:', allEntries.length);
  console.log('Periods:', allPeriods.length);
  
  if (allEntries.length > 0) {
    console.log(allEntries[0]);
  }
}
test().catch(console.error);
