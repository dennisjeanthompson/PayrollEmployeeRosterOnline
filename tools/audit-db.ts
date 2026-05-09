import 'dotenv/config';
import { db } from '../server/db';
import { 
  users, branches, shifts, shiftTrades, payrollPeriods, payrollEntries,
  approvals, timeOffRequests, notifications, setupStatus, deductionSettings,
  deductionRates, holidays, archivedPayrollPeriods, adjustmentLogs, sssContributionTable
} from '../shared/schema';
import { eq, sql, count } from 'drizzle-orm';

async function audit() {
  console.log('\n' + '═'.repeat(80));
  console.log('  P.E.R.O. DATABASE AUDIT — Full Seed Verification');
  console.log('═'.repeat(80));

  // ── 1. BRANCHES ──────────────────────────────────────────────
  console.log('\n┌─ BRANCHES ─────────────────────────────────────────────');
  const allBranches = await db.select().from(branches);
  for (const b of allBranches) {
    console.log(`  📍 ${b.name} (${b.id}) — ${b.address} | Phone: ${b.phone || 'N/A'} | Active: ${b.isActive}`);
  }
  console.log(`  Total: ${allBranches.length} branches`);

  // ── 2. USERS (with branch assignment) ────────────────────────
  console.log('\n┌─ USERS BY BRANCH ──────────────────────────────────────');
  const allUsers = await db.select().from(users);
  
  // Group by branch
  const usersByBranch: Record<string, typeof allUsers> = {};
  for (const u of allUsers) {
    const key = u.branchId;
    if (!usersByBranch[key]) usersByBranch[key] = [];
    usersByBranch[key].push(u);
  }

  for (const b of allBranches) {
    const branchUsers = usersByBranch[b.id] || [];
    console.log(`\n  🏪 ${b.name}`);
    console.log('  ' + '─'.repeat(70));
    console.log('  Role       │ Username      │ Name                    │ Position         │ Rate/hr │ Loans');
    console.log('  ' + '─'.repeat(70));
    for (const u of branchUsers) {
      const role = u.role.padEnd(10);
      const username = u.username.padEnd(13);
      const name = `${u.firstName} ${u.lastName}`.padEnd(23);
      const position = u.position.padEnd(16);
      const rate = `₱${u.hourlyRate}`.padEnd(7);
      const loans = [];
      if (parseFloat(u.sssLoanDeduction || '0') > 0) loans.push(`SSS:₱${u.sssLoanDeduction}`);
      if (parseFloat(u.pagibigLoanDeduction || '0') > 0) loans.push(`PagIBIG:₱${u.pagibigLoanDeduction}`);
      if (parseFloat(u.cashAdvanceDeduction || '0') > 0) loans.push(`CA:₱${u.cashAdvanceDeduction}`);
      console.log(`  ${role} │ ${username} │ ${name} │ ${position} │ ${rate} │ ${loans.length > 0 ? loans.join(', ') : '—'}`);
    }
  }

  // Check for users NOT assigned to a known branch
  const orphanUsers = allUsers.filter(u => !allBranches.find(b => b.id === u.branchId));
  if (orphanUsers.length > 0) {
    console.log(`\n  ⚠️  ${orphanUsers.length} orphan user(s) with invalid branch_id!`);
    orphanUsers.forEach(u => console.log(`     - ${u.username} (branch: ${u.branchId})`));
  }

  // ── 3. LOGIN CREDENTIALS ────────────────────────────────────
  console.log('\n┌─ LOGIN CREDENTIALS ────────────────────────────────────');
  console.log('  All employee/manager accounts use password: password123');
  console.log('  Admin account uses password: admin123');
  console.log('  ' + '─'.repeat(50));
  for (const u of allUsers) {
    const pw = u.role === 'admin' ? 'admin123' : 'password123';
    const isBcrypt = u.password.startsWith('$2b$') || u.password.startsWith('$2a$');
    console.log(`  👤 ${u.username.padEnd(15)} │ pw: ${pw.padEnd(12)} │ bcrypt: ${isBcrypt ? '✅' : '❌ PLAIN TEXT!'}`);
  }

  // ── 4. DUPLICATE CHECK ───────────────────────────────────────
  console.log('\n┌─ DUPLICATE CHECK ──────────────────────────────────────');
  const usernames = allUsers.map(u => u.username);
  const emails = allUsers.map(u => u.email);
  const dupUsernames = usernames.filter((u, i) => usernames.indexOf(u) !== i);
  const dupEmails = emails.filter((e, i) => emails.indexOf(e) !== i);
  if (dupUsernames.length > 0) {
    console.log(`  ❌ Duplicate usernames: ${dupUsernames.join(', ')}`);
  } else {
    console.log('  ✅ No duplicate usernames');
  }
  if (dupEmails.length > 0) {
    console.log(`  ❌ Duplicate emails: ${dupEmails.join(', ')}`);
  } else {
    console.log('  ✅ No duplicate emails');
  }

  // Check duplicate user IDs
  const userIds = allUsers.map(u => u.id);
  const dupIds = userIds.filter((id, i) => userIds.indexOf(id) !== i);
  if (dupIds.length > 0) {
    console.log(`  ❌ Duplicate user IDs: ${dupIds.join(', ')}`);
  } else {
    console.log('  ✅ No duplicate user IDs');
  }

  // ── 5. SHIFTS ────────────────────────────────────────────────
  console.log('\n┌─ SHIFTS ───────────────────────────────────────────────');
  const allShifts = await db.select().from(shifts);
  const shiftsByStatus: Record<string, number> = {};
  for (const s of allShifts) {
    shiftsByStatus[s.status || 'null'] = (shiftsByStatus[s.status || 'null'] || 0) + 1;
  }
  console.log(`  Total shifts: ${allShifts.length}`);
  for (const [status, cnt] of Object.entries(shiftsByStatus)) {
    console.log(`    ${status}: ${cnt}`);
  }

  // Check for duplicate shifts (same user, same start time)
  const shiftKeys = allShifts.map(s => `${s.userId}|${s.startTime}`);
  const dupShifts = shiftKeys.filter((k, i) => shiftKeys.indexOf(k) !== i);
  if (dupShifts.length > 0) {
    console.log(`  ⚠️  ${dupShifts.length} potential duplicate shifts (same user + start time)`);
  } else {
    console.log('  ✅ No duplicate shifts');
  }

  // Shifts per employee
  console.log('\n  Shifts per employee:');
  for (const u of allUsers.filter(u => u.role !== 'admin')) {
    const empShifts = allShifts.filter(s => s.userId === u.id);
    console.log(`    ${u.firstName} ${u.lastName}: ${empShifts.length} shifts`);
  }

  // ── 6. PAYROLL PERIODS ───────────────────────────────────────
  console.log('\n┌─ PAYROLL PERIODS ──────────────────────────────────────');
  const allPeriods = await db.select().from(payrollPeriods);
  for (const p of allPeriods) {
    const start = new Date(p.startDate).toISOString().slice(0, 10);
    const end = new Date(p.endDate).toISOString().slice(0, 10);
    console.log(`  📋 ${p.id.padEnd(22)} │ ${start} → ${end} │ Status: ${(p.status || 'N/A').padEnd(6)} │ Total: ₱${p.totalPay}`);
  }
  console.log(`  Total periods: ${allPeriods.length}`);

  // Check for duplicate periods
  const periodKeys = allPeriods.map(p => `${p.startDate}|${p.endDate}`);
  const dupPeriods = periodKeys.filter((k, i) => periodKeys.indexOf(k) !== i);
  if (dupPeriods.length > 0) {
    console.log(`  ❌ ${dupPeriods.length} duplicate payroll periods!`);
  } else {
    console.log('  ✅ No duplicate payroll periods');
  }

  // ── 7. PAYROLL ENTRIES ───────────────────────────────────────
  console.log('\n┌─ PAYROLL ENTRIES ──────────────────────────────────────');
  const allEntries = await db.select().from(payrollEntries);
  console.log(`  Total entries: ${allEntries.length}`);
  
  // Per period summary
  for (const p of allPeriods) {
    const periodEntries = allEntries.filter(e => e.payrollPeriodId === p.id);
    const totalGross = periodEntries.reduce((sum, e) => sum + parseFloat(e.grossPay), 0);
    const totalNet = periodEntries.reduce((sum, e) => sum + parseFloat(e.netPay), 0);
    const totalDeductions = periodEntries.reduce((sum, e) => sum + parseFloat(e.totalDeductions || '0'), 0);
    console.log(`  ${p.id}: ${periodEntries.length} entries │ Gross: ₱${totalGross.toFixed(2)} │ Deductions: ₱${totalDeductions.toFixed(2)} │ Net: ₱${totalNet.toFixed(2)}`);
  }

  // Check for duplicate entries (same user + same period)
  const entryKeys = allEntries.map(e => `${e.userId}|${e.payrollPeriodId}`);
  const dupEntries = entryKeys.filter((k, i) => entryKeys.indexOf(k) !== i);
  if (dupEntries.length > 0) {
    console.log(`  ❌ ${dupEntries.length} DUPLICATE payroll entries (same user + period)!`);
    for (const dk of [...new Set(dupEntries)]) {
      const [userId, periodId] = dk.split('|');
      const user = allUsers.find(u => u.id === userId);
      console.log(`     - ${user?.username || userId} in ${periodId}`);
    }
  } else {
    console.log('  ✅ No duplicate payroll entries');
  }

  // Sample payroll entry detail
  if (allEntries.length > 0) {
    const sample = allEntries[0];
    const empName = allUsers.find(u => u.id === sample.userId);
    console.log(`\n  📊 Sample entry (${empName?.username || 'unknown'}, ${sample.payrollPeriodId}):`);
    console.log(`     Hours: total=${sample.totalHours} regular=${sample.regularHours} OT=${sample.overtimeHours} ND=${sample.nightDiffHours}`);
    console.log(`     Pay: basic=₱${sample.basicPay} OT=₱${sample.overtimePay} ND=₱${sample.nightDiffPay} holiday=₱${sample.holidayPay} gross=₱${sample.grossPay}`);
    console.log(`     Deductions: SSS=₱${sample.sssContribution} PhilHealth=₱${sample.philHealthContribution} PagIBIG=₱${sample.pagibigContribution} Tax=₱${sample.withholdingTax}`);
    console.log(`     Loans: SSS=₱${sample.sssLoan} PagIBIG=₱${sample.pagibigLoan}`);
    console.log(`     Net: ₱${sample.netPay} │ Status: ${sample.status}`);
  }

  // ── 8. DEDUCTION RATES ───────────────────────────────────────
  console.log('\n┌─ DEDUCTION RATES ──────────────────────────────────────');
  const allRates = await db.select().from(deductionRates);
  const ratesByType: Record<string, number> = {};
  for (const r of allRates) {
    ratesByType[r.type] = (ratesByType[r.type] || 0) + 1;
  }
  for (const [type, cnt] of Object.entries(ratesByType)) {
    console.log(`  ${type}: ${cnt} brackets`);
  }

  // ── 9. SSS CONTRIBUTION TABLE ────────────────────────────────
  console.log('\n┌─ SSS CONTRIBUTION TABLE ───────────────────────────────');
  const sssRows = await db.select().from(sssContributionTable);
  console.log(`  Total SSS brackets: ${sssRows.length}`);
  if (sssRows.length > 0) {
    const first = sssRows[0];
    const last = sssRows[sssRows.length - 1];
    console.log(`  First: ₱${first.minCompensation}–₱${first.maxCompensation} (EE: ₱${first.employeeShare})`);
    console.log(`  Last:  ₱${last.minCompensation}–₱${last.maxCompensation} (EE: ₱${last.employeeShare})`);
  }

  // ── 10. HOLIDAYS ─────────────────────────────────────────────
  console.log('\n┌─ HOLIDAYS ─────────────────────────────────────────────');
  const allHolidays = await db.select().from(holidays);
  const hol2025 = allHolidays.filter(h => h.year === 2025);
  const hol2026 = allHolidays.filter(h => h.year === 2026);
  console.log(`  2025: ${hol2025.length} holidays`);
  console.log(`  2026: ${hol2026.length} holidays`);
  console.log(`  Total: ${allHolidays.length}`);

  // Check for duplicate holidays
  const holKeys = allHolidays.map(h => `${h.name}|${h.year}`);
  const dupHols = holKeys.filter((k, i) => holKeys.indexOf(k) !== i);
  if (dupHols.length > 0) {
    console.log(`  ⚠️  ${dupHols.length} duplicate holidays!`);
  } else {
    console.log('  ✅ No duplicate holidays');
  }

  // ── 11. TIME-OFF REQUESTS ────────────────────────────────────
  console.log('\n┌─ TIME-OFF REQUESTS ────────────────────────────────────');
  const allTimeOff = await db.select().from(timeOffRequests);
  console.log(`  Total: ${allTimeOff.length}`);
  for (const t of allTimeOff) {
    const emp = allUsers.find(u => u.id === t.userId);
    const start = new Date(t.startDate).toISOString().slice(0, 10);
    const end = new Date(t.endDate).toISOString().slice(0, 10);
    console.log(`  📝 ${emp?.username || 'unknown'}: ${t.type} ${start}→${end} [${t.status}] — ${t.reason}`);
  }

  // ── 12. NOTIFICATIONS ────────────────────────────────────────
  console.log('\n┌─ NOTIFICATIONS ────────────────────────────────────────');
  const allNotifs = await db.select().from(notifications);
  console.log(`  Total: ${allNotifs.length}`);
  for (const n of allNotifs) {
    const emp = allUsers.find(u => u.id === n.userId);
    console.log(`  🔔 ${emp?.username || 'unknown'}: [${n.type}] ${n.title} — Read: ${n.isRead}`);
  }

  // ── 13. SHIFT TRADES ─────────────────────────────────────────
  console.log('\n┌─ SHIFT TRADES ─────────────────────────────────────────');
  const allTrades = await db.select().from(shiftTrades);
  console.log(`  Total: ${allTrades.length}`);
  for (const t of allTrades) {
    const from = allUsers.find(u => u.id === t.fromUserId);
    const to = allUsers.find(u => u.id === t.toUserId);
    console.log(`  🔄 ${from?.username || 'unknown'} → ${to?.username || 'open'} │ Status: ${t.status} │ Reason: ${t.reason}`);
  }

  // ── 14. ADJUSTMENT LOGS (OT/Exceptions) ──────────────────────
  console.log('\n┌─ ADJUSTMENT LOGS ──────────────────────────────────────');
  const allAdj = await db.select().from(adjustmentLogs);
  console.log(`  Total: ${allAdj.length}`);
  for (const a of allAdj) {
    const emp = allUsers.find(u => u.id === a.employeeId);
    const loggedBy = allUsers.find(u => u.id === a.loggedBy);
    console.log(`  ⏱️  ${emp?.username || 'unknown'}: ${a.type} ${a.value}hrs │ Status: ${a.status} │ By: ${loggedBy?.username || 'unknown'} │ ${a.remarks}`);
  }

  // ── 15. SETUP STATUS ─────────────────────────────────────────
  console.log('\n┌─ SETUP STATUS ─────────────────────────────────────────');
  const setup = await db.select().from(setupStatus);
  if (setup.length > 0) {
    console.log(`  Setup complete: ${setup[0].isSetupComplete} │ Completed at: ${setup[0].setupCompletedAt}`);
  } else {
    console.log('  ❌ No setup status record!');
  }

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(80));
  console.log('  SUMMARY');
  console.log('═'.repeat(80));
  console.log(`  Branches:          ${allBranches.length}`);
  console.log(`  Users:             ${allUsers.length} (${allUsers.filter(u=>u.role==='admin').length} admin, ${allUsers.filter(u=>u.role==='manager').length} managers, ${allUsers.filter(u=>u.role==='employee').length} employees)`);
  console.log(`  Shifts:            ${allShifts.length}`);
  console.log(`  Payroll Periods:   ${allPeriods.length}`);
  console.log(`  Payroll Entries:   ${allEntries.length}`);
  console.log(`  Deduction Rates:   ${allRates.length}`);
  console.log(`  SSS Brackets:      ${sssRows.length}`);
  console.log(`  Holidays:          ${allHolidays.length}`);
  console.log(`  Time-Off Requests: ${allTimeOff.length}`);
  console.log(`  Notifications:     ${allNotifs.length}`);
  console.log(`  Shift Trades:      ${allTrades.length}`);
  console.log(`  Adjustment Logs:   ${allAdj.length}`);
  console.log('═'.repeat(80) + '\n');

  process.exit(0);
}

audit().catch(err => { console.error('AUDIT FAILED:', err); process.exit(1); });
