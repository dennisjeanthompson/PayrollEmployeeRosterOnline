
import * as dotenv from 'dotenv';
dotenv.config();

// Standard imports that don't depend on env vars can stay, 
// but db and schema depend on connection which needs env vars.
// To be safe, we'll dynamic import everything related to DB.

import { randomUUID } from 'crypto';

async function seedFullData() {
  console.log('🌱 Starting comprehensive data seeding...');

  try {
    // Dynamic imports to ensure env vars are loaded first
    const { db } = await import('./db');
    const { users, branches, shifts, shiftTrades } = await import('@shared/schema');
    const { eq, and, gt } = await import('drizzle-orm');
    const { seedSampleSchedulesAndPayroll } = await import('./init-db');

    // 1. Ensure basics (Employees, Schedules, Payroll, Time-off, Notifications)
    // This existing function handles most of the heavy lifting
    await seedSampleSchedulesAndPayroll();

    console.log('🔄 Seeding Shift Trades...');
    
    // 2. Seed Shift Trades
    // Find some future shifts to trade
    const allUsers = await db.select().from(users).where(eq(users.role, 'employee'));
    const branch = await db.select().from(branches).limit(1);
    
    if (allUsers.length < 2) {
      console.log('⚠️ Not enough employees to seed trades.');
      return;
    }

    const branchId = branch[0].id;
    const now = new Date();
    
    // Get future shifts
    const futureShifts = await db.select().from(shifts).where(
      and(
        eq(shifts.branchId, branchId),
        gt(shifts.startTime, now)
      )
    ).limit(10);

    if (futureShifts.length === 0) {
       console.log('⚠️ No future shifts found to create trades.');
    } else {
       // Create a few trades
       const tradeStatuses = ['pending', 'rejected'];
       const urgencies = ['normal', 'high', 'low'];
       const reasons = ['Personal Emergency', 'Family Event', 'Not Feeling Well', 'Conflict with School'];

       for (let i = 0; i < Math.min(5, futureShifts.length); i++) {
         const shift = futureShifts[i];
         const fromUser = allUsers.find(u => u.id === shift.userId);
         if (!fromUser) continue;

         // Randomly pick a target user (or null for open trade)
         const isDirectTrade = Math.random() > 0.5;
         let toUserId = null;
         if (isDirectTrade) {
            const potentialTargets = allUsers.filter(u => u.id !== fromUser.id);
            if (potentialTargets.length > 0) {
                toUserId = potentialTargets[Math.floor(Math.random() * potentialTargets.length)].id;
            }
         }

         const tradeId = randomUUID();
         await db.insert(shiftTrades).values({
           id: tradeId,
           shiftId: shift.id,
           fromUserId: fromUser.id,
           toUserId: toUserId,
           reason: reasons[Math.floor(Math.random() * reasons.length)],
           status: 'pending', // Keep mostly pending for demo
           urgency: urgencies[Math.floor(Math.random() * urgencies.length)], // Schema expects 'normal' | 'urgent' but let's stick to safe values
           notes: 'Please help cover this shift!',
           requestedAt: new Date(),
         });
         console.log(`   Created trade request for shift ${shift.id} from ${fromUser.username}`);
       }
    }

    console.log('✅ Comprehensive data seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during full seeding:', error);
    process.exit(1);
  }
}

seedFullData();
