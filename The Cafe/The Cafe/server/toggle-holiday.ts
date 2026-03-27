import { db } from './db';
import { companySettings } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const existing = await db.select().from(companySettings).limit(1);
  if (existing.length === 0) {
    console.log('No company settings found. Creating one with includeHolidayPay: true...');
    await db.insert(companySettings).values({
      id: 'default-settings',
      name: 'The Cafe',
      address: 'Manila, Philippines',
      tin: '000-000-000-000',
      includeHolidayPay: true,
    });
  } else {
    console.log('Updating existing settings to includeHolidayPay: true...');
    await db.update(companySettings)
      .set({ includeHolidayPay: true })
      .where(eq(companySettings.id, existing[0].id));
  }
  console.log('✅ Set includeHolidayPay to true');
  process.exit(0);
}
main();
