import { db } from './db';
import { holidays } from '@shared/schema';
import { randomUUID } from 'crypto';

async function main() {
  const holidays2026 = [
    { id: randomUUID(), name: "Eid'l Fitr (TBD)", date: new Date('2026-03-20T00:00:00.000Z'), type: 'regular', year: 2026, isRecurring: false, workAllowed: true }
  ];

  for (const h of holidays2026) {
    await db.insert(holidays).values(h);
  }
  console.log('✅ Seeded 2026 holiday for Eidl Fitr with new UUID');
  
  const allHolidays = await db.select().from(holidays);
  console.log("All holidays currently in DB:", allHolidays);
  process.exit(0);
}
main();
