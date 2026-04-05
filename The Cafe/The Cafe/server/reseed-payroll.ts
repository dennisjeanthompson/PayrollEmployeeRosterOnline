/**
 * Reseed Payroll Deductions Script
 * Recalculates SSS, PhilHealth, Pag-IBIG, and Withholding Tax
 * for ALL existing payroll entries using the correct formulas.
 */
import "dotenv/config";
import { db } from "./db";
import { payrollEntries, payrollPeriods, users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { calculateSSS, calculatePhilHealth, calculatePagibig, calculateWithholdingTax } from "./utils/deductions";
import { MONTHLY_WORKING_HOURS } from "./payroll-utils";

async function reseedPayrollDeductions() {
  console.log("🔄 Reseeding payroll deductions for ALL existing entries...\n");

  // Fetch all payroll entries
  const entries = await db.select().from(payrollEntries);
  console.log(`Found ${entries.length} payroll entries to recalculate.\n`);

  let updated = 0;
  let errors = 0;

  for (const entry of entries) {
    try {
      // Get the employee's hourly rate
      const [employee] = await db.select().from(users).where(eq(users.id, entry.userId));
      if (!employee) {
        console.warn(`⚠️  Entry ${entry.id}: Employee ${entry.userId} not found, skipping.`);
        errors++;
        continue;
      }

      // Get the period to determine semi-monthly fraction
      const [period] = await db.select().from(payrollPeriods).where(eq(payrollPeriods.id, entry.payrollPeriodId));
      if (!period) {
        console.warn(`⚠️  Entry ${entry.id}: Period ${entry.payrollPeriodId} not found, skipping.`);
        errors++;
        continue;
      }

      const hourlyRate = parseFloat(employee.hourlyRate);
      const monthlyBasicSalary = hourlyRate * MONTHLY_WORKING_HOURS; // Contractual basis

      const periodStartDate = new Date(period.startDate);
      const periodEndDate = new Date(period.endDate);
      const daysInPeriod = Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      const isSemiMonthly = daysInPeriod < 28;
      const periodFraction = isSemiMonthly ? 0.5 : 1;

      // Recalculate mandatory deductions using the CORRECT formulas
      const monthlySSSShare = await calculateSSS(monthlyBasicSalary);
      const monthlyPhilHealth = await calculatePhilHealth(monthlyBasicSalary);
      const monthlyPagibig = await calculatePagibig(monthlyBasicSalary);

      const sssContribution = Math.round(monthlySSSShare * periodFraction * 100) / 100;
      const philHealthContribution = Math.round(monthlyPhilHealth * periodFraction * 100) / 100;
      const pagibigContribution = Math.round(monthlyPagibig * periodFraction * 100) / 100;

      // Recalculate withholding tax on actual taxable earnings
      const basicPay = parseFloat(entry.basicPay || "0");
      const overtimePay = parseFloat(entry.overtimePay || "0");
      const holidayPay = parseFloat(entry.holidayPay || "0");
      const nightDiffPay = parseFloat(entry.nightDiffPay || "0");
      const restDayPay = parseFloat(entry.restDayPay || "0");
      
      const periodTaxableEarnings = basicPay + overtimePay + holidayPay + nightDiffPay + restDayPay;
      const monthlyMandatory = monthlySSSShare + monthlyPhilHealth + monthlyPagibig;
      const monthlyTaxableIncome = Math.max(0, (periodTaxableEarnings / periodFraction) - monthlyMandatory);
      
      const isMwe = (employee as any).isMwe;
      const monthlyTax = isMwe ? 0 : await calculateWithholdingTax(monthlyTaxableIncome);
      const withholdingTax = Math.round(monthlyTax * periodFraction * 100) / 100;

      // Preserve existing loan deductions, advances, etc.
      const sssLoan = parseFloat(entry.sssLoan || "0");
      const pagibigLoan = parseFloat(entry.pagibigLoan || "0");
      const advances = parseFloat(entry.advances || "0");
      const otherDeductions = parseFloat(entry.otherDeductions || "0");

      const totalDeductions = sssContribution + philHealthContribution + pagibigContribution + withholdingTax + sssLoan + pagibigLoan + advances + otherDeductions;
      const grossPay = parseFloat(entry.grossPay || "0");
      const netPay = grossPay - totalDeductions;

      // Update the entry
      await db.update(payrollEntries).set({
        sssContribution: sssContribution.toString(),
        philHealthContribution: philHealthContribution.toString(),
        pagibigContribution: pagibigContribution.toString(),
        withholdingTax: withholdingTax.toString(),
        totalDeductions: totalDeductions.toString(),
        deductions: totalDeductions.toString(),
        netPay: netPay.toString(),
      }).where(eq(payrollEntries.id, entry.id));

      console.log(`✅ ${employee.firstName} ${employee.lastName} (${entry.id.substring(0, 8)}): SSS=₱${sssContribution.toFixed(2)}, PH=₱${philHealthContribution.toFixed(2)}, PI=₱${pagibigContribution.toFixed(2)}, Tax=₱${withholdingTax.toFixed(2)}, Net=₱${netPay.toFixed(2)}`);
      updated++;
    } catch (err) {
      console.error(`❌ Error processing entry ${entry.id}:`, (err as any).message);
      errors++;
    }
  }

  console.log(`\n🏁 Done! Updated: ${updated}, Errors: ${errors}`);
}

reseedPayrollDeductions().catch(console.error).finally(() => process.exit(0));
