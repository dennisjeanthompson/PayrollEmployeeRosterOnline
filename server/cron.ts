import { db } from './db';
import { shifts, adjustmentLogs, shiftTrades } from '../shared/schema';
import { lte, and, eq, isNull, isNotNull, inArray } from 'drizzle-orm';
import { subDays } from 'date-fns';
import { createAuditLog } from './routes/audit';

const TRADE_EXPIRY_DAYS = 3;

export function setupCronJobs() {

  // Run the purge job every day at 3:00 AM
  // Since node-cron is not guaranteed to be installed, we use a simple interval
  // that calculates time until 3 AM and then runs daily.
  
  const scheduleNextPurge = () => {
    const now = new Date();
    const next3AM = new Date(now);
    next3AM.setHours(3, 0, 0, 0);
    
    // If it's past 3 AM today, schedule for 3 AM tomorrow
    if (now.getTime() > next3AM.getTime()) {
      next3AM.setDate(next3AM.getDate() + 1);
    }
    
    const timeUntilNext = next3AM.getTime() - now.getTime();
    
    setTimeout(async () => {
      await runDataPurge();
      // Schedule the next run after this one completes
      scheduleNextPurge();
    }, timeUntilNext);
  };

  // Start the scheduling cycle
  scheduleNextPurge();
  
  // Also run it once on startup if in production just to be safe
  if (process.env.NODE_ENV === 'production') {
    setTimeout(runDataPurge, 1000 * 60 * 5); // 5 minutes after startup
  }
}

async function expireOldTrades() {
  try {
    const now = new Date();

    const expiredTrades = await db
      .select()
      .from(shiftTrades)
      .where(
        and(
          inArray(shiftTrades.status, ['pending', 'accepted']),
          isNotNull(shiftTrades.expiresAt),
          lte(shiftTrades.expiresAt, now)
        )
      );

    if (expiredTrades.length === 0) {
      return;
    }

    const expiredIds = expiredTrades.map(t => t.id);
    await db
      .update(shiftTrades)
      .set({ status: 'cancelled', notes: `Expired — no action within ${TRADE_EXPIRY_DAYS} days` })
      .where(inArray(shiftTrades.id, expiredIds));

    for (const trade of expiredTrades) {
      await createAuditLog({
        action: 'trade_cancel',
        entityType: 'shift_trade',
        entityId: trade.id,
        userId: trade.fromUserId,
        reason: `Auto-expired after ${TRADE_EXPIRY_DAYS} days`,
        newValues: { status: 'cancelled', reason: 'expired', shiftId: trade.shiftId },
      });
    }
  } catch (err) {
    throw new Error(`Failed to expire old trades: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function runDataPurge() {
  try {
    const cutoffDate = subDays(new Date(), 90);

    await db.delete(shifts).where(
      and(
        eq(shifts.isDeleted, true),
        lte(shifts.deletedAt, cutoffDate)
      )
    );

    await db.delete(adjustmentLogs).where(
      and(
        eq(adjustmentLogs.isDeleted, true),
        lte(adjustmentLogs.deletedAt, cutoffDate)
      )
    );

    await expireOldTrades();
  } catch (err) {
    throw new Error(`Data purge failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
