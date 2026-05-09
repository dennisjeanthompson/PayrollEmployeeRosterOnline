import { db } from './server/db.js';
import { companySettings } from './shared/schema.js';

async function main() {
  await db.update(companySettings).set({ includeHolidayPay: true });
  console.log('✅ Set includeHolidayPay to true');
  process.exit(0);
}
main();
