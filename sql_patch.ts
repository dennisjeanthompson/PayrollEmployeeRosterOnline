import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql`ALTER TABLE payroll_periods ADD COLUMN run_type TEXT DEFAULT 'regular' NOT NULL;`);
    console.log("Success add run_type");
  } catch (e) {
    if (e.message.includes('already exists')) {
       console.log("Already exists");
    } else {
       console.error("Error", e);
    }
  }
  process.exit(0);
}
main();
