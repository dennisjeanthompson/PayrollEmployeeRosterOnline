import 'dotenv/config';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { 
  branches, users, timeOffRequests, adjustmentLogs, loanRequests, leaveCredits,
  payrollPeriods, payrollEntries
} from '../shared/schema';
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
  const periods = await db.select().from(payrollPeriods).where(eq(payrollPeriods.branchId, branchId));
  console.log(`\n📅 Payroll Periods (${periods.length}):`);
  periods.forEach(p => {
    console.log(`   - ${p.startDate.toLocaleDateString()} to ${p.endDate.toLocaleDateString()}: ${p.status} | Total Hours: ${p.totalHours} | Total Pay: ${p.totalPay}`);
  });

  const entriesCount = await db.select({ count: sql<number>`count(*)` }).from(payrollEntries)
    .where(sql`payroll_period_id IN (SELECT id FROM ${payrollPeriods} WHERE branch_id = ${branchId})`);
  console.log(`\n💰 Payroll Entries: ${entriesCount[0].count}`);

  console.log('Done.');
}

diag().catch(console.error);
