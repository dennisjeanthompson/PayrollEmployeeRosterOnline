import 'dotenv/config';
import { db } from './server/db';
import { leaveCredits } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

async function main() {
  const userId = 'user-emp-sam';
  const year = 2026;
  try {
    const credits = await db
      .select()
      .from(leaveCredits)
      .where(and(eq(leaveCredits.userId, userId), eq(leaveCredits.year, year)));
    console.log('SUCCESS - credits:', JSON.stringify(credits));
  } catch (error: any) {
    console.error('FAILED - error:', error.message);
    console.error('FULL ERROR:', error);
  }
  process.exit(0);
}

main();

main().catch(console.error);
