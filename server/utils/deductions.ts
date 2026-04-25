/**
 * Philippine Payroll Deduction Calculations
 * Based on 2026 contribution tables for SSS, PhilHealth, Pag-IBIG, and BIR
 * Updated to reflect January 2026 rate changes
 * Now uses database-configurable rates for admin flexibility
 *
 * 2026 Key Rates:
 * - SSS: 15% total (5% Employee / 10% Employer), MSC ₱5,000-₱35,000
 * - PhilHealth: 5% total (2.5% Employee / 2.5% Employer), Floor ₱10,000, Ceiling ₱100,000
 * - Pag-IBIG: 2% Employee share, Max contribution ₱200 (increased from ₱100)
 * - Withholding Tax: TRAIN Law brackets (unchanged)
 */

import { dbStorage } from '../db-storage';
import { db } from '../db';
import { sssContributionTable } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// --- Constants for 2026 Philippine Deductions ---
export const PHILHEALTH_EMPLOYEE_RATE = 0.025;
export const PHILHEALTH_FLOOR = 10000;
export const PHILHEALTH_CEILING = 100000;

export const PAGIBIG_RATE = 0.02;
export const PAGIBIG_MFS_CAP = 10000;
// ------------------------------------------------

export interface DeductionBreakdown {
  sssContribution: number;
  philHealthContribution: number;
  pagibigContribution: number;
  withholdingTax: number;
}

/**
 * Calculate SSS contribution (employee share)
 * 2026 Rate: 5% employee share of Monthly Salary Credit (MSC)
 * MSC Range: ₱5,000 - ₱35,000
 * MPF/WISP applies for salaries above ₱20,000
 */
export async function calculateSSS(monthlyBasicSalary: number): Promise<number> {
  try {
    // Fetch 2026 brackets
    const brackets = await db.select().from(sssContributionTable).where(eq(sssContributionTable.year, 2026));
    
    console.log(`[SSS DEBUG] Monthly salary: ₱${monthlyBasicSalary.toFixed(2)}, Total brackets found: ${brackets.length}`);
    
    for (const b of brackets) {
      if (monthlyBasicSalary >= parseFloat(b.minCompensation) && monthlyBasicSalary <= parseFloat(b.maxCompensation)) {
        const share = parseFloat(b.employeeShare);
        console.log(`[SSS DEBUG] Matched bracket: MSC ₱${b.monthlySalaryCredit} (range ₱${b.minCompensation}-₱${b.maxCompensation}), Employee Share: ₱${share.toFixed(2)}`);
        return share;
      }
    }
    
    console.warn(`[SSS DEBUG] No bracket matched for salary ₱${monthlyBasicSalary.toFixed(2)}`);
    return 0;
  } catch (error) {
    console.error('Error calculating SSS:', error);
    return 0;
  }
}

/**
 * Calculate PhilHealth contribution (employee share)
 * Dynamically driven by database rates configured by Admin
 */
export async function calculatePhilHealth(monthlyBasicSalary: number): Promise<number> {
  try {
    const rates = await dbStorage.getDeductionRatesByType('philhealth');
    const activeRate = rates.find(r => r.isActive);
    
    // Default fallback to 2026 constants if DB is missing
    const floor = activeRate ? parseFloat(activeRate.minSalary) : 10000;
    const ceiling = activeRate?.maxSalary ? parseFloat(activeRate.maxSalary) : 100000;
    const rate = activeRate?.employeeRate ? (parseFloat(activeRate.employeeRate) / 100) : 0.025;
    
    let baseSalary = monthlyBasicSalary;
    if (baseSalary < floor) baseSalary = floor;
    if (baseSalary > ceiling) baseSalary = ceiling;
    
    const contribution = baseSalary * rate;
    return Math.round(contribution * 100) / 100;
  } catch (error) {
    console.error('Error calculating PhilHealth:', error);
    return 0;
  }
}

/**
 * Calculate Pag-IBIG contribution (employee share)
 * Dynamically driven by database rates configured by Admin
 */
export async function calculatePagibig(monthlyBasicSalary: number): Promise<number> {
  try {
    const rates = await dbStorage.getDeductionRatesByType('pagibig');
    const activeRate = rates.find(r => r.isActive);
    
    // Default fallback to 2026 constants if DB is missing
    const cap = activeRate?.maxSalary ? parseFloat(activeRate.maxSalary) : 10000;
    const rate = activeRate?.employeeRate ? (parseFloat(activeRate.employeeRate) / 100) : 0.02;
    
    let baseSalary = monthlyBasicSalary;
    if (baseSalary > cap) baseSalary = cap;
    
    const contribution = baseSalary * rate;
    return Math.round(contribution * 100) / 100;
  } catch (error) {
    console.error('Error calculating Pag-IBIG:', error);
    return 0;
  }
}


/**
 * Calculate withholding tax based on BIR tax table from database
 * Using the TRAIN law tax brackets
 */
export async function calculateWithholdingTax(monthlyBasicSalary: number): Promise<number> {
  try {
    const taxRates = await dbStorage.getDeductionRatesByType('tax');

    // Filter active rates and sort by min salary
    const activeRates = taxRates
      .filter(rate => rate.isActive)
      .sort((a, b) => parseFloat(a.minSalary) - parseFloat(b.minSalary));

    if (activeRates.length === 0) return 0;

    // Convert monthly to annual salary
    const annualSalary = monthlyBasicSalary * 12;

    let annualTax = 0;

    // Find the applicable tax bracket and compute tax dynamically from DB values
    for (let i = 0; i < activeRates.length; i++) {
      const bracket = activeRates[i];
      const min = parseFloat(bracket.minSalary);
      const max = bracket.maxSalary ? parseFloat(bracket.maxSalary) : Infinity;
      const rate = bracket.employeeRate ? parseFloat(bracket.employeeRate) / 100 : 0;

      if (annualSalary >= min && annualSalary <= max) {
        if (rate === 0) {
          annualTax = 0;
        } else {
          // Compute cumulative base tax from all preceding taxable brackets
          let baseTax = 0;
          for (let j = 0; j < i; j++) {
            const prev = activeRates[j];
            const prevMin = parseFloat(prev.minSalary);
            const prevMax = prev.maxSalary ? parseFloat(prev.maxSalary) : 0;
            const prevRate = prev.employeeRate ? parseFloat(prev.employeeRate) / 100 : 0;
            baseTax += (prevMax - prevMin) * prevRate;
          }
          annualTax = baseTax + (annualSalary - min) * rate;
        }
        break;
      }
    }

    // Convert to monthly
    const monthlyTax = annualTax / 12;

    return Math.round(monthlyTax * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error calculating withholding tax:', error);
    return 0;
  }
}

/**
 * Calculate all deductions based on monthly basic salary
 */
export async function calculateAllDeductions(
  monthlyBasicSalary: number,
  settings: {
    deductSSS: boolean;
    deductPhilHealth: boolean;
    deductPagibig: boolean;
    deductWithholdingTax: boolean;
  }
): Promise<DeductionBreakdown> {
  const [sss, philHealth, pagibig, tax] = await Promise.all([
    settings.deductSSS ? calculateSSS(monthlyBasicSalary) : Promise.resolve(0),
    settings.deductPhilHealth ? calculatePhilHealth(monthlyBasicSalary) : Promise.resolve(0),
    settings.deductPagibig ? calculatePagibig(monthlyBasicSalary) : Promise.resolve(0),
    settings.deductWithholdingTax ? calculateWithholdingTax(monthlyBasicSalary) : Promise.resolve(0),
  ]);

  return {
    sssContribution: sss,
    philHealthContribution: philHealth,
    pagibigContribution: pagibig,
    withholdingTax: tax,
  };
}
