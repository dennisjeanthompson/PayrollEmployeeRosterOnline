import 'dotenv/config';
import { db } from './db';
import { sql } from 'drizzle-orm';
import {
  users, branches, shifts, shiftTrades,
  payrollPeriods, payrollEntries, timeOffRequests,
  notifications, approvals, thirteenthMonthLedger,
  leaveCredits, loanRequests, adjustmentLogs, auditLogs,
  companySettings, deductionSettings
} from '../shared/schema';
import { eq, or } from 'drizzle-orm';
import { addDays, startOfDay, getDay, subDays, setHours, setMinutes } from 'date-fns';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { dbStorage as storage } from './db-storage';
import { calculatePeriodPay } from './payroll-utils';

const uuid = () => crypto.randomUUID();

async function main() {
  const startTime = Date.now();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Don Macchiatos — Specialized Branch Seeder (Smart ID)');
  console.log(`  Time: ${new Date().toLocaleString('en-PH')}`);
  console.log('═══════════════════════════════════════════════════════════');

  // 1. Find or Create Branch
  let branchId = '';
  const branchName = 'Don Macchiatos';
  
  const existingBranch = await db.select().from(branches).where(eq(branches.name, branchName)).limit(1);
  
  if (existingBranch.length > 0) {
    branchId = existingBranch[0].id;
    console.log(`📍 Found existing branch: ${branchName} (${branchId})`);
  } else {
    branchId = 'branch-don-macchiatos';
    await db.insert(branches).values({
      id: branchId,
      name: branchName,
      address: '123 Coffee St, Metro Manila',
      phone: '0917-DON-MACC',
      isActive: true,
    });
    console.log(`📍 Created new branch: ${branchName} (${branchId})`);
  }

  // Cleanup existing transactional data for this branch
  console.log('🗑️  Cleaning existing data for this branch...');
  // We identify seeded users by ID prefix to avoid deleting real users if any
  const seededUserIds = [
    'user-don-mgr-lita', 
    'user-don-emp-kaye', 
    'user-don-emp-jhon', 
    'user-don-emp-ryan', 
    'user-don-emp-jenny'
  ];

  await db.delete(auditLogs).where(sql`user_id IN (${sql.join(seededUserIds.map(id => sql`${id}`), sql`, `)})`);
  await db.delete(adjustmentLogs).where(eq(adjustmentLogs.branchId, branchId));
  await db.delete(loanRequests).where(eq(loanRequests.branchId, branchId));
  await db.delete(thirteenthMonthLedger).where(eq(thirteenthMonthLedger.branchId, branchId));
  await db.delete(payrollEntries).where(sql`payroll_period_id IN (SELECT id FROM payroll_periods WHERE branch_id = ${branchId})`);
  await db.delete(payrollPeriods).where(eq(payrollPeriods.branchId, branchId));
  await db.delete(shifts).where(eq(shifts.branchId, branchId));
  console.log('   ✅ Branch data cleared.');

  // 2. Initialize Branch Settings
  await db.insert(deductionSettings).values({
    id: uuid(),
    branchId,
    deductSSS: true,
    deductPhilHealth: true,
    deductPagibig: true,
    deductWithholdingTax: true,
  }).onConflictDoNothing();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Define Employees
  const employeesData = [
    {
      id: 'user-don-mgr-lita',
      username: 'lita',
      firstName: 'Lita',
      lastName: 'Angeles',
      email: 'lita.angeles@pero.com.ph',
      role: 'manager',
      position: 'Branch Manager',
      hourlyRate: '15.625', // ₱125 per day / 8 hours
      photoUrl: 'https://i.pravatar.cc/150?u=angeles.l',
      schedule: { days: [1, 2, 3, 4, 5], startH: 8, startM: 30, endH: 19, endM: 0 }
    },
    {
      id: 'user-don-emp-kaye',
      username: 'kaye',
      firstName: 'Kaye Anne',
      lastName: 'Gonzales',
      email: 'kaye.gonzales@pero.com.ph',
      role: 'employee',
      position: 'Barista',
      hourlyRate: '60.00',
      photoUrl: 'https://i.pravatar.cc/150?u=gonzales.k',
      schedule: { days: [1, 2, 3, 4, 5], startH: 9, startM: 0, endH: 18, endM: 30 }
    },
    {
      id: 'user-don-emp-jhon',
      username: 'jhon',
      firstName: 'Jhon',
      lastName: 'Bowden',
      email: 'jhon.bowden@pero.com.ph',
      role: 'employee',
      position: 'Staff',
      hourlyRate: '60.00',
      photoUrl: 'https://i.pravatar.cc/150?u=bowden.j',
      schedule: { days: [3, 6], startH: 17, startM: 0, endH: 19, endM: 0 }
    },
    {
      id: 'user-don-emp-ryan',
      username: 'ryan',
      firstName: 'Ryan',
      lastName: 'Go',
      email: 'ryan.go@pero.com.ph',
      role: 'employee',
      position: 'Senior Barista',
      hourlyRate: '60.00',
      photoUrl: 'https://i.pravatar.cc/150?u=go.r',
      schedule: { days: [1, 2, 3, 4, 5], startH: 8, startM: 0, endH: 17, endM: 0 }
    },
    {
      id: 'user-don-emp-jenny',
      username: 'jenny',
      firstName: 'Jenny',
      lastName: 'Horton',
      email: 'jenny.horton@pero.com.ph',
      role: 'employee',
      position: 'Cashier',
      hourlyRate: '60.00',
      photoUrl: 'https://i.pravatar.cc/150?u=horton.j',
      schedule: { days: [2, 4], startH: 7, startM: 0, endH: 17, endM: 30 }
    }
  ];

  const seededEmployees = [];
  for (const emp of employeesData) {
    await db.insert(users).values({
      id: emp.id,
      username: emp.username,
      password: hashedPassword,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      role: emp.role as any,
      position: emp.position,
      hourlyRate: emp.hourlyRate,
      photoUrl: emp.photoUrl,
      branchId,
      isActive: true,
      sssLoanDeduction: emp.id === 'user-don-emp-kaye' ? '150.00' : '0.00',
      pagibigLoanDeduction: emp.id === 'user-don-emp-ryan' ? '200.00' : '0.00',
      cashAdvanceDeduction: emp.id === 'user-don-emp-jenny' ? '500.00' : '0.00',
    }).onConflictDoUpdate({
      target: [users.id],
      set: { 
        hourlyRate: emp.hourlyRate, 
        photoUrl: emp.photoUrl,
        branchId, 
        isActive: true,
        sssLoanDeduction: emp.id === 'user-don-emp-kaye' ? '150.00' : '0.00',
        pagibigLoanDeduction: emp.id === 'user-don-emp-ryan' ? '200.00' : '0.00',
        cashAdvanceDeduction: emp.id === 'user-don-emp-jenny' ? '500.00' : '0.00',
      }
    });
    seededEmployees.push(emp);
  }
  console.log(`👥 Seeded ${seededEmployees.length} employees`);

  // 4. Seed Shifts (8 weeks historical + 2 weeks future)
  console.log('📅 Seeding shifts for forecasting (8 weeks back + 2 weeks forward)...');
  const today = startOfDay(new Date());
  let shiftCount = 0;
  
  for (let offset = -60; offset <= 14; offset++) {
    const date = addDays(today, offset);
    const dayOfWeek = getDay(date);

    for (const emp of seededEmployees) {
      if (emp.schedule.days.includes(dayOfWeek)) {
        const start = setMinutes(setHours(new Date(date), emp.schedule.startH), emp.schedule.startM);
        const end = setMinutes(setHours(new Date(date), emp.schedule.endH), emp.schedule.endM);

        await db.insert(shifts).values({
          id: uuid(),
          userId: emp.id,
          branchId,
          startTime: start,
          endTime: end,
          position: emp.position,
          status: offset < 0 ? 'completed' : 'scheduled',
          createdAt: new Date(),
        });
        shiftCount++;
      }
    }
  }
  console.log(`   ✅ Created ${shiftCount} shifts`);

  // 5. Seed Payroll
  console.log('💰 Seeding payroll periods & entries...');
  const periodDefs = [
    { start: '2026-02-01', end: '2026-02-15', status: 'paid' },
    { start: '2026-02-16', end: '2026-02-28', status: 'paid' },
    { start: '2026-03-01', end: '2026-03-15', status: 'closed' },
    { start: '2026-03-16', end: '2026-03-31', status: 'open' },
  ];

  for (const def of periodDefs) {
    const startDt = new Date(def.start);
    const endDt = new Date(def.end);
    const periodId = `don-period-${def.start}-${branchId.substring(0,8)}`;

    await db.insert(payrollPeriods).values({
      id: periodId,
      branchId,
      startDate: startDt,
      endDate: endDt,
      status: def.status,
    }).onConflictDoNothing();

    const holidays = await storage.getHolidays(startDt, endDt);

    const periodEntries = [];
    let periodTotalHours = 0;
    let periodTotalPay = 0;

    for (const emp of seededEmployees) {
      if (emp.role === 'admin') continue;
      const empShifts = await storage.getShiftsByUser(emp.id, startDt, endDt);
      if (empShifts.length === 0) continue;

      const rate = parseFloat(emp.hourlyRate);
      const pay = calculatePeriodPay(empShifts, rate, holidays, 0, false);
      
      const totalHours = pay.breakdown.reduce((s, d) => s + d.regularHours + d.overtimeHours, 0);
      const regularHours = pay.breakdown.reduce((s, d) => s + d.regularHours, 0);
      const overtimeHours = pay.breakdown.reduce((s, d) => s + d.overtimeHours, 0);
      const nightDiffHours = pay.breakdown.reduce((s, d) => s + d.regularNightDiffHours + d.overtimeNightDiffHours, 0);

      const sss = pay.totalGrossPay > 0 ? 300 : 0;
      const phic = pay.totalGrossPay > 0 ? 150 : 0;
      const hdmf = pay.totalGrossPay > 0 ? 100 : 0;
      const totalDed = sss + phic + hdmf;

      const entry = {
        id: uuid(),
        userId: emp.id,
        payrollPeriodId: periodId,
        totalHours: totalHours.toFixed(2),
        regularHours: regularHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        nightDiffHours: nightDiffHours.toFixed(2),
        grossPay: pay.totalGrossPay.toFixed(2),
        basicPay: pay.basicPay.toFixed(2),
        overtimePay: pay.overtimePay.toFixed(2),
        holidayPay: pay.holidayPay.toFixed(2),
        nightDiffPay: pay.nightDiffPay.toFixed(2),
        restDayPay: pay.restDayPay.toFixed(2),
        sssContribution: sss.toFixed(2),
        philHealthContribution: phic.toFixed(2),
        pagibigContribution: hdmf.toFixed(2),
        totalDeductions: totalDed.toFixed(2),
        deductions: totalDed.toFixed(2),
        netPay: (pay.totalGrossPay - totalDed).toFixed(2),
        status: def.status === 'open' ? 'pending' : 'paid',
        createdAt: new Date(),
      };

      await db.insert(payrollEntries).values(entry);
      periodEntries.push(entry);
      periodTotalHours += totalHours;
      periodTotalPay += pay.totalGrossPay;

      // 13th Month Ledger
      await db.insert(thirteenthMonthLedger).values({
        id: uuid(),
        userId: emp.id,
        branchId,
        payrollPeriodId: periodId,
        year: startDt.getFullYear(),
        basicPayEarned: pay.totalGrossPay.toFixed(2),
        periodStartDate: startDt,
        periodEndDate: endDt,
      });
    }

    // Update the period with totals
    await db.update(payrollPeriods)
      .set({
        totalHours: periodTotalHours.toFixed(2),
        totalPay: periodTotalPay.toFixed(2),
      })
      .where(eq(payrollPeriods.id, periodId));
  }
  console.log('   ✅ Created 4 payroll periods with totals');

  // 6. Seed Loans
  console.log('🏦 Seeding loan requests...');
  const loans = [
    { type: 'SSS', amount: '5000', reason: 'Emergency medical expenses', ref: 'SSS-12345' },
    { type: 'Pag-IBIG', amount: '10000', reason: 'Home renovation', ref: 'HDMF-67890' },
    { type: 'SSS', amount: '2000', reason: 'Personal use', ref: 'SSS-99999' }
  ];

  for (let i = 0; i < loans.length; i++) {
    const loan = loans[i];
    const emp = seededEmployees[i + 1]; // Offset from manager
    await db.insert(loanRequests).values({
      id: uuid(),
      userId: emp.id,
      branchId,
      loanType: loan.type,
      referenceNumber: loan.ref,
      accountNumber: '1234567890',
      totalAmount: loan.amount,
      remainingBalance: loan.amount,
      monthlyAmortization: (parseFloat(loan.amount) / 12).toFixed(2),
      deductionStartDate: addDays(new Date(), 30),
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // 7. Seed Audit Logs
  console.log('🔒 Seeding audit logs...');
  const actions = [
    { action: 'branch_create', entityType: 'branch', entityId: branchId, reason: 'Setup Don Macchiatos office' },
    { action: 'employee_create', entityType: 'user', entityId: 'user-don-mgr-lita', reason: 'Hire Lita Angeles' },
    { action: 'payroll_process', entityType: 'payroll_period', entityId: `don-period-2026-02-01-${branchId.substring(0,8)}`, reason: 'Monthly processing' }
  ];

  for (const act of actions) {
    await db.insert(auditLogs).values({
      id: uuid(),
      action: act.action,
      entityType: act.entityType,
      entityId: act.entityId,
      userId: 'user-don-mgr-lita',
      reason: act.reason,
      createdAt: subDays(new Date(), 2),
    });
  }

  // 8. Seed Adjustment Logs (Exception Logs)
  console.log('⚙️ Seeding adjustment logs...');
  const adjustments = [
    { type: 'overtime', value: '2.5', remarks: 'Late store closing' },
    { type: 'late', value: '30', remarks: 'Technical difficulties' }
  ];

  for (let i = 0; i < adjustments.length; i++) {
    const adj = adjustments[i];
    const emp = seededEmployees[i+1];
    await db.insert(adjustmentLogs).values({
      id: uuid(),
      employeeId: emp.id,
      branchId,
      loggedBy: 'user-don-mgr-lita',
      startDate: subDays(new Date(), 1),
      endDate: subDays(new Date(), 1),
      type: adj.type as any,
      value: adj.value,
      remarks: adj.remarks,
      status: 'pending',
      createdAt: new Date(),
    });
  }

  // 9. Seed Time Off Requests
  console.log('🏖️ Seeding time off requests...');
  const timeOffs = [
    { type: 'vacation', days: 3, offset: -5, reason: 'Family reunion in Batangas', status: 'approved' },
    { type: 'sick', days: 1, offset: -2, reason: 'Flu and fever', status: 'approved' },
    { type: 'personal', days: 2, offset: 4, reason: 'Personal errands', status: 'pending' }
  ];

  for (let i = 0; i < timeOffs.length; i++) {
    const to = timeOffs[i];
    const emp = seededEmployees[i + 1];
    const startDate = addDays(new Date(), to.offset);
    const endDate = addDays(startDate, to.days - 1);

    await db.insert(timeOffRequests).values({
      id: uuid(),
      userId: emp.id,
      startDate: startDate,
      endDate: endDate,
      type: to.type,
      reason: to.reason,
      status: to.status,
      requestedAt: subDays(startDate, 10),
      approvedBy: to.status === 'approved' ? 'user-don-mgr-lita' : null,
      approvedAt: to.status === 'approved' ? subDays(startDate, 8) : null,
    });
  }

  // 10. Seed Leave Credits
  console.log('💳 Seeding leave credits...');
  const currentYear = new Date().getFullYear();
  for (const emp of seededEmployees) {
    if (emp.role === 'admin') continue;
    
    const leaveTypes = [
      { type: 'vacation', total: '15' },
      { type: 'sick', total: '10' },
      { type: 'personal', total: '5' }
    ];

    for (const lt of leaveTypes) {
      await db.insert(leaveCredits).values({
        id: uuid(),
        userId: emp.id,
        branchId,
        year: currentYear,
        leaveType: lt.type,
        totalCredits: lt.total,
        usedCredits: '0',
        remainingCredits: lt.total,
        updatedAt: new Date(),
      });
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ Seeding complete in ${elapsed}s`);
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
