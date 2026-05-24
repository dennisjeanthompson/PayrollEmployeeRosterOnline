import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS include_rest_day_premium boolean DEFAULT false;`);
    console.log("Added include_rest_day_premium column to company_settings");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
