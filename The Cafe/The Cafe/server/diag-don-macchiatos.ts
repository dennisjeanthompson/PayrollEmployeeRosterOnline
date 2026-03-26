import 'dotenv/config';
import { db } from './db';
import { branches, users, timeOffRequests, adjustmentLogs, loanRequests, leaveCredits } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function diag() {
  console.log('🔍 Running Don Macchiatos Diagnostic...');
  
  // 1. Find Branch
  const donBranch = await db.select().from(branches).where(eq(branches.name, 'Don Macchiatos')).limit(1);
  if (donBranch.length === 0) {
    console.log('❌ Branch "Don Macchiatos" not found!');
    return;
  }
  const branchId = donBranch[0].id;
  console.log(`✅ Found Branch: ${donBranch[0].name} (ID: ${branchId})`);

  // 2. Count Users
  const branchUsers = await db.select().from(users).where(eq(users.branchId, branchId));
  console.log(`👥 Users in branch: ${branchUsers.length}`);
  branchUsers.forEach(u => console.log(`   - ${u.username} (${u.role}) [ID: ${u.id}]`));

  // 3. Count Time Off Requests
  const userIds = branchUsers.map(u => u.id);
  let totalTimeOff = 0;
  for (const uid of userIds) {
    const reqs = await db.select().from(timeOffRequests).where(eq(timeOffRequests.userId, uid));
    totalTimeOff += reqs.length;
    if (reqs.length > 0) {
      console.log(`📅 User ${uid} has ${reqs.length} time off requests`);
    }
  }
  console.log(`📊 Total Time Off Requests: ${totalTimeOff}`);

  // 4. Count Exception Logs
  const logs = await db.select().from(adjustmentLogs).where(eq(adjustmentLogs.branchId, branchId));
  console.log(`📊 Total Exception Logs: ${logs.length}`);

  // 5. Count Loans
  const loans = await db.select().from(loanRequests).where(eq(loanRequests.branchId, branchId));
  console.log(`📊 Total Loan Requests: ${loans.length}`);

  // 6. Count Leave Credits
  const credits = await db.select().from(leaveCredits).where(eq(leaveCredits.branchId, branchId));
  console.log(`📊 Total Leave Credits: ${credits.length}`);

  console.log('Done.');
}

diag().catch(console.error);
