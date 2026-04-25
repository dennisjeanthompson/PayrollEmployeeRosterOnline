import 'dotenv/config';
import { db } from './server/db';
import { payrollEntries, payrollPeriods } from './shared/schema';
import { eq } from 'drizzle-orm';
import { calculateAllDeductions, calculateWithholdingTax } from './server/utils/deductions';

async function backfill() {
  console.log('--- Starting Backfill of Deductions ---');
  
  const entries = await db.select().from(payrollEntries);
  console.log(`Found ${entries.length} payroll entries.`);

  let updatedCount = 0;

  for (const entry of entries) {
    if (parseFloat(entry.grossPay || '0') > 0 && 
        parseFloat(entry.sssContribution || '0') === 0 &&
        parseFloat(entry.withholdingTax || '0') === 0) {
      
      const grossPay = parseFloat(entry.grossPay || '0');
      // Semi-monthly period: 15 days roughly
      const monthlyBasicSalary = (grossPay / 15) * 30;

      // Calculate mandatory deductions for the month
      const mandatoryBreakdown = await calculateAllDeductions(monthlyBasicSalary, {
        deductSSS: true,
        deductPhilHealth: true,
        deductPagibig: true,
        deductWithholdingTax: false,
      });

      const periodFraction = 0.5; // Semi-monthly
      const sssContribution = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
      const philhealthContribution = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
      const pagibigContribution = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;

      const monthlyMandatory = mandatoryBreakdown.sssContribution +
        mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
      
      const monthlyTaxableIncome = Math.max(0, monthlyBasicSalary - monthlyMandatory);
      const monthlyTax = await calculateWithholdingTax(monthlyTaxableIncome);
      const withholdingTax = Math.round(monthlyTax * periodFraction * 100) / 100;

      const sssLoan = parseFloat(entry.sssLoan || '0');
      const pagibigLoan = parseFloat(entry.pagibigLoan || '0');

      const totalDeductions = sssContribution + philhealthContribution +
        pagibigContribution + withholdingTax + sssLoan + pagibigLoan;
      
      const netPay = grossPay - totalDeductions;

      await db.update(payrollEntries)
        .set({
          sssContribution: sssContribution.toFixed(2),
          philHealthContribution: philhealthContribution.toFixed(2),
          pagibigContribution: pagibigContribution.toFixed(2),
          withholdingTax: withholdingTax.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          deductions: totalDeductions.toFixed(2),
          netPay: netPay.toFixed(2),
        })
        .where(eq(payrollEntries.id, entry.id));
      
      updatedCount++;
    }
  }

  console.log(`✅ Backfilled deductions for ${updatedCount} payroll entries.`);
  process.exit(0);
}

backfill().catch(err => {
  console.error(err);
  process.exit(1);
});
