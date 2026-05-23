import { db } from '../server/db';
import { shifts, adjustmentLogs } from '../shared/schema';
import { eq, inArray } from 'drizzle-orm';

async function cleanupOrphanedLogs() {
  const allLogs = await db.select().from(adjustmentLogs).where(
    inArray(adjustmentLogs.type, ['absent', 'late', 'undertime'])
  );
  
  const allShifts = await db.select().from(shifts).where(eq(shifts.isDeleted, false));
  
  let deletedCount = 0;

  for (const log of allLogs) {
    if (log.isDeleted) continue;
    if (!log.startDate) continue;

    const logDateStr = new Date(log.startDate).toISOString().split('T')[0];
    
    // Check if employee has a shift on this date
    const hasShift = allShifts.some(s => {
      if (s.userId !== log.employeeId) return false;
      const shiftDateStr = new Date(s.startTime).toISOString().split('T')[0];
      return shiftDateStr === logDateStr;
    });

    if (!hasShift) {
      console.log(`Deleting orphaned '${log.type}' log for employee ${log.employeeId} on ${logDateStr} (ID: ${log.id})`);
      await db.update(adjustmentLogs).set({ isDeleted: true }).where(eq(adjustmentLogs.id, log.id));
      deletedCount++;
    }
  }

  console.log(`Deleted ${deletedCount} orphaned exception logs.`);
  process.exit(0);
}

cleanupOrphanedLogs().catch(console.error);
