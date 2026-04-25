    /**
 * 2025 SSS Contribution Table Seed Data
 * Based on SSS Circular No. 2024-006, effective January 2025
 * 
 * Rate: 15% total (10% Employer, 5% Employee for Regular SS)
 * MSC Range: ₱5,000 - ₱35,000
 * Total brackets: 61
 */

export interface SSSBracket {
  minSalary: number;
  maxSalary: number | null;
  regularSSMSC: number;
  mpfMSC: number;
  totalMSC: number;
  regularSSER: number;
  mpfER: number;
  ecER: number;
  totalER: number;
  regularSSEE: number;
  mpfEE: number;
  totalEE: number;
  totalContributions: number;
}

// Official 2025 SSS Contribution Table (61 brackets)
export const sss2025Brackets: SSSBracket[] = [
  { minSalary: 0, maxSalary: 5249.99, regularSSMSC: 5000, mpfMSC: 0, totalMSC: 5000, regularSSER: 500, mpfER: 0, ecER: 10, totalER: 510, regularSSEE: 250, mpfEE: 0, totalEE: 250, totalContributions: 760 },
  { minSalary: 5250, maxSalary: 5749.99, regularSSMSC: 5500, mpfMSC: 0, totalMSC: 5500, regularSSER: 550, mpfER: 0, ecER: 10, totalER: 560, regularSSEE: 275, mpfEE: 0, totalEE: 275, totalContributions: 835 },
  { minSalary: 5750, maxSalary: 6249.99, regularSSMSC: 6000, mpfMSC: 0, totalMSC: 6000, regularSSER: 600, mpfER: 0, ecER: 10, totalER: 610, regularSSEE: 300, mpfEE: 0, totalEE: 300, totalContributions: 910 },
  { minSalary: 6250, maxSalary: 6749.99, regularSSMSC: 6500, mpfMSC: 0, totalMSC: 6500, regularSSER: 650, mpfER: 0, ecER: 10, totalER: 660, regularSSEE: 325, mpfEE: 0, totalEE: 325, totalContributions: 985 },
  { minSalary: 6750, maxSalary: 7249.99, regularSSMSC: 7000, mpfMSC: 0, totalMSC: 7000, regularSSER: 700, mpfER: 0, ecER: 10, totalER: 710, regularSSEE: 350, mpfEE: 0, totalEE: 350, totalContributions: 1060 },
  { minSalary: 7250, maxSalary: 7749.99, regularSSMSC: 7500, mpfMSC: 0, totalMSC: 7500, regularSSER: 750, mpfER: 0, ecER: 10, totalER: 760, regularSSEE: 375, mpfEE: 0, totalEE: 375, totalContributions: 1135 },
  { minSalary: 7750, maxSalary: 8249.99, regularSSMSC: 8000, mpfMSC: 0, totalMSC: 8000, regularSSER: 800, mpfER: 0, ecER: 10, totalER: 810, regularSSEE: 400, mpfEE: 0, totalEE: 400, totalContributions: 1210 },
  { minSalary: 8250, maxSalary: 8749.99, regularSSMSC: 8500, mpfMSC: 0, totalMSC: 8500, regularSSER: 850, mpfER: 0, ecER: 10, totalER: 860, regularSSEE: 425, mpfEE: 0, totalEE: 425, totalContributions: 1285 },
  { minSalary: 8750, maxSalary: 9249.99, regularSSMSC: 9000, mpfMSC: 0, totalMSC: 9000, regularSSER: 900, mpfER: 0, ecER: 10, totalER: 910, regularSSEE: 450, mpfEE: 0, totalEE: 450, totalContributions: 1360 },
  { minSalary: 9250, maxSalary: 9749.99, regularSSMSC: 9500, mpfMSC: 0, totalMSC: 9500, regularSSER: 950, mpfER: 0, ecER: 10, totalER: 960, regularSSEE: 475, mpfEE: 0, totalEE: 475, totalContributions: 1435 },
  { minSalary: 9750, maxSalary: 10249.99, regularSSMSC: 10000, mpfMSC: 0, totalMSC: 10000, regularSSER: 1000, mpfER: 0, ecER: 10, totalER: 1010, regularSSEE: 500, mpfEE: 0, totalEE: 500, totalContributions: 1510 },
  { minSalary: 10250, maxSalary: 10749.99, regularSSMSC: 10500, mpfMSC: 0, totalMSC: 10500, regularSSER: 1050, mpfER: 0, ecER: 10, totalER: 1060, regularSSEE: 525, mpfEE: 0, totalEE: 525, totalContributions: 1585 },
  { minSalary: 10750, maxSalary: 11249.99, regularSSMSC: 11000, mpfMSC: 0, totalMSC: 11000, regularSSER: 1100, mpfER: 0, ecER: 10, totalER: 1110, regularSSEE: 550, mpfEE: 0, totalEE: 550, totalContributions: 1660 },
  { minSalary: 11250, maxSalary: 11749.99, regularSSMSC: 11500, mpfMSC: 0, totalMSC: 11500, regularSSER: 1150, mpfER: 0, ecER: 10, totalER: 1160, regularSSEE: 575, mpfEE: 0, totalEE: 575, totalContributions: 1735 },
  { minSalary: 11750, maxSalary: 12249.99, regularSSMSC: 12000, mpfMSC: 0, totalMSC: 12000, regularSSER: 1200, mpfER: 0, ecER: 10, totalER: 1210, regularSSEE: 600, mpfEE: 0, totalEE: 600, totalContributions: 1810 },
  { minSalary: 12250, maxSalary: 12749.99, regularSSMSC: 12500, mpfMSC: 0, totalMSC: 12500, regularSSER: 1250, mpfER: 0, ecER: 10, totalER: 1260, regularSSEE: 625, mpfEE: 0, totalEE: 625, totalContributions: 1885 },
  { minSalary: 12750, maxSalary: 13249.99, regularSSMSC: 13000, mpfMSC: 0, totalMSC: 13000, regularSSER: 1300, mpfER: 0, ecER: 10, totalER: 1310, regularSSEE: 650, mpfEE: 0, totalEE: 650, totalContributions: 1960 },
  { minSalary: 13250, maxSalary: 13749.99, regularSSMSC: 13500, mpfMSC: 0, totalMSC: 13500, regularSSER: 1350, mpfER: 0, ecER: 10, totalER: 1360, regularSSEE: 675, mpfEE: 0, totalEE: 675, totalContributions: 2035 },
  { minSalary: 13750, maxSalary: 14249.99, regularSSMSC: 14000, mpfMSC: 0, totalMSC: 14000, regularSSER: 1400, mpfER: 0, ecER: 10, totalER: 1410, regularSSEE: 700, mpfEE: 0, totalEE: 700, totalContributions: 2110 },
  { minSalary: 14250, maxSalary: 14749.99, regularSSMSC: 14500, mpfMSC: 0, totalMSC: 14500, regularSSER: 1450, mpfER: 0, ecER: 10, totalER: 1460, regularSSEE: 725, mpfEE: 0, totalEE: 725, totalContributions: 2185 },
  { minSalary: 14750, maxSalary: 15249.99, regularSSMSC: 15000, mpfMSC: 0, totalMSC: 15000, regularSSER: 1500, mpfER: 0, ecER: 30, totalER: 1530, regularSSEE: 750, mpfEE: 0, totalEE: 750, totalContributions: 2280 },
  { minSalary: 15250, maxSalary: 15749.99, regularSSMSC: 15500, mpfMSC: 0, totalMSC: 15500, regularSSER: 1550, mpfER: 0, ecER: 30, totalER: 1580, regularSSEE: 775, mpfEE: 0, totalEE: 775, totalContributions: 2355 },
  { minSalary: 15750, maxSalary: 16249.99, regularSSMSC: 16000, mpfMSC: 0, totalMSC: 16000, regularSSER: 1600, mpfER: 0, ecER: 30, totalER: 1630, regularSSEE: 800, mpfEE: 0, totalEE: 800, totalContributions: 2430 },
  { minSalary: 16250, maxSalary: 16749.99, regularSSMSC: 16500, mpfMSC: 0, totalMSC: 16500, regularSSER: 1650, mpfER: 0, ecER: 30, totalER: 1680, regularSSEE: 825, mpfEE: 0, totalEE: 825, totalContributions: 2505 },
  { minSalary: 16750, maxSalary: 17249.99, regularSSMSC: 17000, mpfMSC: 0, totalMSC: 17000, regularSSER: 1700, mpfER: 0, ecER: 30, totalER: 1730, regularSSEE: 850, mpfEE: 0, totalEE: 850, totalContributions: 2580 },
  { minSalary: 17250, maxSalary: 17749.99, regularSSMSC: 17500, mpfMSC: 0, totalMSC: 17500, regularSSER: 1750, mpfER: 0, ecER: 30, totalER: 1780, regularSSEE: 875, mpfEE: 0, totalEE: 875, totalContributions: 2655 },
  { minSalary: 17750, maxSalary: 18249.99, regularSSMSC: 18000, mpfMSC: 0, totalMSC: 18000, regularSSER: 1800, mpfER: 0, ecER: 30, totalER: 1830, regularSSEE: 900, mpfEE: 0, totalEE: 900, totalContributions: 2730 },
  { minSalary: 18250, maxSalary: 18749.99, regularSSMSC: 18500, mpfMSC: 0, totalMSC: 18500, regularSSER: 1850, mpfER: 0, ecER: 30, totalER: 1880, regularSSEE: 925, mpfEE: 0, totalEE: 925, totalContributions: 2805 },
  { minSalary: 18750, maxSalary: 19249.99, regularSSMSC: 19000, mpfMSC: 0, totalMSC: 19000, regularSSER: 1900, mpfER: 0, ecER: 30, totalER: 1930, regularSSEE: 950, mpfEE: 0, totalEE: 950, totalContributions: 2880 },
  { minSalary: 19250, maxSalary: 19749.99, regularSSMSC: 19500, mpfMSC: 0, totalMSC: 19500, regularSSER: 1950, mpfER: 0, ecER: 30, totalER: 1980, regularSSEE: 975, mpfEE: 0, totalEE: 975, totalContributions: 2955 },
  { minSalary: 19750, maxSalary: 20249.99, regularSSMSC: 20000, mpfMSC: 0, totalMSC: 20000, regularSSER: 2000, mpfER: 0, ecER: 30, totalER: 2030, regularSSEE: 1000, mpfEE: 0, totalEE: 1000, totalContributions: 3030 },
  // MPF brackets start (salary above ₱20,000)
  { minSalary: 20250, maxSalary: 20749.99, regularSSMSC: 20000, mpfMSC: 500, totalMSC: 20500, regularSSER: 2000, mpfER: 50, ecER: 30, totalER: 2080, regularSSEE: 1000, mpfEE: 25, totalEE: 1025, totalContributions: 3105 },
  { minSalary: 20750, maxSalary: 21249.99, regularSSMSC: 20000, mpfMSC: 1000, totalMSC: 21000, regularSSER: 2000, mpfER: 100, ecER: 30, totalER: 2130, regularSSEE: 1000, mpfEE: 50, totalEE: 1050, totalContributions: 3180 },
  { minSalary: 21250, maxSalary: 21749.99, regularSSMSC: 20000, mpfMSC: 1500, totalMSC: 21500, regularSSER: 2000, mpfER: 150, ecER: 30, totalER: 2180, regularSSEE: 1000, mpfEE: 75, totalEE: 1075, totalContributions: 3255 },
  { minSalary: 21750, maxSalary: 22249.99, regularSSMSC: 20000, mpfMSC: 2000, totalMSC: 22000, regularSSER: 2000, mpfER: 200, ecER: 30, totalER: 2230, regularSSEE: 1000, mpfEE: 100, totalEE: 1100, totalContributions: 3330 },
  { minSalary: 22250, maxSalary: 22749.99, regularSSMSC: 20000, mpfMSC: 2500, totalMSC: 22500, regularSSER: 2000, mpfER: 250, ecER: 30, totalER: 2280, regularSSEE: 1000, mpfEE: 125, totalEE: 1125, totalContributions: 3405 },
  { minSalary: 22750, maxSalary: 23249.99, regularSSMSC: 20000, mpfMSC: 3000, totalMSC: 23000, regularSSER: 2000, mpfER: 300, ecER: 30, totalER: 2330, regularSSEE: 1000, mpfEE: 150, totalEE: 1150, totalContributions: 3480 },
  { minSalary: 23250, maxSalary: 23749.99, regularSSMSC: 20000, mpfMSC: 3500, totalMSC: 23500, regularSSER: 2000, mpfER: 350, ecER: 30, totalER: 2380, regularSSEE: 1000, mpfEE: 175, totalEE: 1175, totalContributions: 3555 },
  { minSalary: 23750, maxSalary: 24249.99, regularSSMSC: 20000, mpfMSC: 4000, totalMSC: 24000, regularSSER: 2000, mpfER: 400, ecER: 30, totalER: 2430, regularSSEE: 1000, mpfEE: 200, totalEE: 1200, totalContributions: 3630 },
  { minSalary: 24250, maxSalary: 24749.99, regularSSMSC: 20000, mpfMSC: 4500, totalMSC: 24500, regularSSER: 2000, mpfER: 450, ecER: 30, totalER: 2480, regularSSEE: 1000, mpfEE: 225, totalEE: 1225, totalContributions: 3705 },
  { minSalary: 24750, maxSalary: 25249.99, regularSSMSC: 20000, mpfMSC: 5000, totalMSC: 25000, regularSSER: 2000, mpfER: 500, ecER: 30, totalER: 2530, regularSSEE: 1000, mpfEE: 250, totalEE: 1250, totalContributions: 3780 },
  { minSalary: 25250, maxSalary: 25749.99, regularSSMSC: 20000, mpfMSC: 5500, totalMSC: 25500, regularSSER: 2000, mpfER: 550, ecER: 30, totalER: 2580, regularSSEE: 1000, mpfEE: 275, totalEE: 1275, totalContributions: 3855 },
  { minSalary: 25750, maxSalary: 26249.99, regularSSMSC: 20000, mpfMSC: 6000, totalMSC: 26000, regularSSER: 2000, mpfER: 600, ecER: 30, totalER: 2630, regularSSEE: 1000, mpfEE: 300, totalEE: 1300, totalContributions: 3930 },
  { minSalary: 26250, maxSalary: 26749.99, regularSSMSC: 20000, mpfMSC: 6500, totalMSC: 26500, regularSSER: 2000, mpfER: 650, ecER: 30, totalER: 2680, regularSSEE: 1000, mpfEE: 325, totalEE: 1325, totalContributions: 4005 },
  { minSalary: 26750, maxSalary: 27249.99, regularSSMSC: 20000, mpfMSC: 7000, totalMSC: 27000, regularSSER: 2000, mpfER: 700, ecER: 30, totalER: 2730, regularSSEE: 1000, mpfEE: 350, totalEE: 1350, totalContributions: 4080 },
  { minSalary: 27250, maxSalary: 27749.99, regularSSMSC: 20000, mpfMSC: 7500, totalMSC: 27500, regularSSER: 2000, mpfER: 750, ecER: 30, totalER: 2780, regularSSEE: 1000, mpfEE: 375, totalEE: 1375, totalContributions: 4155 },
  { minSalary: 27750, maxSalary: 28249.99, regularSSMSC: 20000, mpfMSC: 8000, totalMSC: 28000, regularSSER: 2000, mpfER: 800, ecER: 30, totalER: 2830, regularSSEE: 1000, mpfEE: 400, totalEE: 1400, totalContributions: 4230 },
  { minSalary: 28250, maxSalary: 28749.99, regularSSMSC: 20000, mpfMSC: 8500, totalMSC: 28500, regularSSER: 2000, mpfER: 850, ecER: 30, totalER: 2880, regularSSEE: 1000, mpfEE: 425, totalEE: 1425, totalContributions: 4305 },
  { minSalary: 28750, maxSalary: 29249.99, regularSSMSC: 20000, mpfMSC: 9000, totalMSC: 29000, regularSSER: 2000, mpfER: 900, ecER: 30, totalER: 2930, regularSSEE: 1000, mpfEE: 450, totalEE: 1450, totalContributions: 4380 },
  { minSalary: 29250, maxSalary: 29749.99, regularSSMSC: 20000, mpfMSC: 9500, totalMSC: 29500, regularSSER: 2000, mpfER: 950, ecER: 30, totalER: 2980, regularSSEE: 1000, mpfEE: 475, totalEE: 1475, totalContributions: 4455 },
  { minSalary: 29750, maxSalary: 30249.99, regularSSMSC: 20000, mpfMSC: 10000, totalMSC: 30000, regularSSER: 2000, mpfER: 1000, ecER: 30, totalER: 3030, regularSSEE: 1000, mpfEE: 500, totalEE: 1500, totalContributions: 4530 },
  { minSalary: 30250, maxSalary: 30749.99, regularSSMSC: 20000, mpfMSC: 10500, totalMSC: 30500, regularSSER: 2000, mpfER: 1050, ecER: 30, totalER: 3080, regularSSEE: 1000, mpfEE: 525, totalEE: 1525, totalContributions: 4605 },
  { minSalary: 30750, maxSalary: 31249.99, regularSSMSC: 20000, mpfMSC: 11000, totalMSC: 31000, regularSSER: 2000, mpfER: 1100, ecER: 30, totalER: 3130, regularSSEE: 1000, mpfEE: 550, totalEE: 1550, totalContributions: 4680 },
  { minSalary: 31250, maxSalary: 31749.99, regularSSMSC: 20000, mpfMSC: 11500, totalMSC: 31500, regularSSER: 2000, mpfER: 1150, ecER: 30, totalER: 3180, regularSSEE: 1000, mpfEE: 575, totalEE: 1575, totalContributions: 4755 },
  { minSalary: 31750, maxSalary: 32249.99, regularSSMSC: 20000, mpfMSC: 12000, totalMSC: 32000, regularSSER: 2000, mpfER: 1200, ecER: 30, totalER: 3230, regularSSEE: 1000, mpfEE: 600, totalEE: 1600, totalContributions: 4830 },
  { minSalary: 32250, maxSalary: 32749.99, regularSSMSC: 20000, mpfMSC: 12500, totalMSC: 32500, regularSSER: 2000, mpfER: 1250, ecER: 30, totalER: 3280, regularSSEE: 1000, mpfEE: 625, totalEE: 1625, totalContributions: 4905 },
  { minSalary: 32750, maxSalary: 33249.99, regularSSMSC: 20000, mpfMSC: 13000, totalMSC: 33000, regularSSER: 2000, mpfER: 1300, ecER: 30, totalER: 3330, regularSSEE: 1000, mpfEE: 650, totalEE: 1650, totalContributions: 4980 },
  { minSalary: 33250, maxSalary: 33749.99, regularSSMSC: 20000, mpfMSC: 13500, totalMSC: 33500, regularSSER: 2000, mpfER: 1350, ecER: 30, totalER: 3380, regularSSEE: 1000, mpfEE: 675, totalEE: 1675, totalContributions: 5055 },
  { minSalary: 33750, maxSalary: 34249.99, regularSSMSC: 20000, mpfMSC: 14000, totalMSC: 34000, regularSSER: 2000, mpfER: 1400, ecER: 30, totalER: 3430, regularSSEE: 1000, mpfEE: 700, totalEE: 1700, totalContributions: 5130 },
  { minSalary: 34250, maxSalary: 34749.99, regularSSMSC: 20000, mpfMSC: 14500, totalMSC: 34500, regularSSER: 2000, mpfER: 1450, ecER: 30, totalER: 3480, regularSSEE: 1000, mpfEE: 725, totalEE: 1725, totalContributions: 5205 },
  { minSalary: 34750, maxSalary: null, regularSSMSC: 20000, mpfMSC: 15000, totalMSC: 35000, regularSSER: 2000, mpfER: 1500, ecER: 30, totalER: 3530, regularSSEE: 1000, mpfEE: 750, totalEE: 1750, totalContributions: 5280 },
];

/**
 * Helper function to find SSS contribution for a given monthly salary
 */
export function findSSSBracket(monthlySalary: number): SSSBracket {
  const bracket = sss2025Brackets.find(b => {
    if (b.maxSalary === null) {
      return monthlySalary >= b.minSalary;
    }
    return monthlySalary >= b.minSalary && monthlySalary <= b.maxSalary;
  });
  
  // Default to minimum bracket if not found
  return bracket || sss2025Brackets[0];
}

/**
 * Calculate SSS employee contribution for given monthly salary
 */
export function calculateSSSEmployeeContribution(monthlySalary: number): number {
  const bracket = findSSSBracket(monthlySalary);
  return bracket.totalEE;
}

/**
 * Calculate SSS employer contribution for given monthly salary
 */
export function calculateSSSEmployerContribution(monthlySalary: number): number {
  const bracket = findSSSBracket(monthlySalary);
  return bracket.totalER;
}

/**
 * Get full SSS breakdown for payslip
 */
export function getSSSBreakdown(monthlySalary: number) {
  const bracket = findSSSBracket(monthlySalary);
  return {
    monthlySalaryCredit: bracket.totalMSC,
    regularSSMSC: bracket.regularSSMSC,
    mpfMSC: bracket.mpfMSC,
    employee: {
      regularSS: bracket.regularSSEE,
      mpf: bracket.mpfEE,
      total: bracket.totalEE,
    },
    employer: {
      regularSS: bracket.regularSSER,
      mpf: bracket.mpfER,
      ec: bracket.ecER,
      total: bracket.totalER,
    },
    totalContributions: bracket.totalContributions,
  };
}
