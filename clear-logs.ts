import { db } from './server/db';
import { adjustmentLogs } from './shared/schema';

async function clearLogs() {
  await db.delete(adjustmentLogs);
  console.log("Cleared adjustment logs");
  process.exit(0);
}

clearLogs().catch(console.error);
