import { db } from './db';
import { shifts, adjustmentLogs } from '../shared/schema';
import { lte, and, eq } from 'drizzle-orm';
import { subDays } from 'date-fns';

export function setupCronJobs() {
  console.log("🕒 Setting up background cron jobs...");

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

async function runDataPurge() {
  console.log("🧹 Running soft-deleted data purge job...");
  try {
    const cutoffDate = subDays(new Date(), 90);
    
    // 1. Purge soft-deleted shifts older than 90 days
    const shiftResult = await db.delete(shifts).where(
      and(
        eq(shifts.isDeleted, true),
        lte(shifts.deletedAt, cutoffDate)
      )
    );
    console.log(`✅ Purged soft-deleted shifts older than 90 days.`);
    
    // 2. Purge soft-deleted adjustment logs older than 90 days
    const logResult = await db.delete(adjustmentLogs).where(
      and(
        eq(adjustmentLogs.isDeleted, true),
        lte(adjustmentLogs.deletedAt, cutoffDate)
      )
    );
    console.log(`✅ Purged soft-deleted adjustment logs older than 90 days.`);
    
    // NOTE: Orphaned leave requests are kept permanently as requested.
    
  } catch (err) {
    console.error("❌ Error running data purge job:", err);
  }
}
