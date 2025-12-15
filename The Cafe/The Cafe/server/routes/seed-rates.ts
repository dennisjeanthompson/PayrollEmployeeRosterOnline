/**
 * SSS Rates Seeding Route
 * Populates the deduction_rates table with official 2025 SSS contribution brackets
 * 
 * Based on SSS Circular No. 2024-006, effective January 2025
 */

import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { dbStorage } from "../db-storage";
import { sss2025Brackets } from "@shared/sss-2025-rates";

const router = Router();

// Middleware to check admin role
const requireAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  req.user = req.session.user;
  next();
};

/**
 * POST /api/admin/seed-sss-rates
 * Seeds the database with all 61 official 2025 SSS contribution brackets
 */
router.post("/api/admin/seed-sss-rates", requireAdmin, async (req, res) => {
  try {
    console.log("[SSS Seed] Starting SSS 2025 rates seeding...");
    
    // First, delete existing SSS rates
    const existingRates = await dbStorage.getAllDeductionRates();
    const sssRates = existingRates.filter(r => r.type === "sss");
    
    console.log(`[SSS Seed] Removing ${sssRates.length} existing SSS rates...`);
    for (const rate of sssRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }

    // Insert all 61 new SSS brackets
    console.log(`[SSS Seed] Inserting ${sss2025Brackets.length} new SSS brackets...`);
    
    const insertedRates = [];
    for (const bracket of sss2025Brackets) {
      // SSS uses FIXED AMOUNTS per MSC bracket, NOT percentages
      const rate = await dbStorage.createDeductionRate({
        type: "sss",
        minSalary: bracket.minSalary.toString(),
        maxSalary: bracket.maxSalary?.toString() || null,
        employeeRate: null, // SSS does NOT use %, it uses fixed amounts
        employeeContribution: bracket.totalEE.toString(), // Fixed EE contribution
        description: `MSC ₱${bracket.totalMSC.toLocaleString()} | EE ₱${bracket.totalEE} | ER ₱${bracket.totalER} | Total ₱${bracket.totalContributions}`,
        isActive: true,
      });
      insertedRates.push(rate);
    }

    console.log(`[SSS Seed] Successfully inserted ${insertedRates.length} SSS rates!`);
    
    res.json({
      success: true,
      message: `Successfully seeded ${insertedRates.length} SSS contribution brackets (Circular 2024-006)`,
      count: insertedRates.length,
    });
  } catch (error) {
    console.error("[SSS Seed] Error seeding SSS rates:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to seed SSS rates",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * POST /api/admin/seed-philhealth-rates
 * Seeds PhilHealth rates (5% total, 2.5% employee share)
 */
router.post("/api/admin/seed-philhealth-rates", requireAdmin, async (req, res) => {
  try {
    // Delete existing PhilHealth rates
    const existingRates = await dbStorage.getAllDeductionRates();
    const philhealthRates = existingRates.filter(r => r.type === "philhealth");
    
    for (const rate of philhealthRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }

    // PhilHealth 2025: 5% of basic salary, shared 50-50
    // Floor: ₱10,000 | Ceiling: ₱100,000
    await dbStorage.createDeductionRate({
      type: "philhealth",
      minSalary: "10000",
      maxSalary: "100000",
      employeeRate: "2.5", // 2.5% employee share
      employeeContribution: null, // Calculated based on percentage
      description: "PhilHealth 2025: 5% total (2.5% EE, 2.5% ER). Floor ₱10k, Ceiling ₱100k.",
      isActive: true,
    });

    res.json({
      success: true,
      message: "Successfully seeded PhilHealth rate",
      count: 1,
    });
  } catch (error) {
    console.error("Error seeding PhilHealth rates:", error);
    res.status(500).json({ success: false, message: "Failed to seed PhilHealth rates" });
  }
});

/**
 * POST /api/admin/seed-pagibig-rates
 * Seeds Pag-IBIG rates (2% employee, 2% employer, max ₱200)
 */
router.post("/api/admin/seed-pagibig-rates", requireAdmin, async (req, res) => {
  try {
    // Delete existing Pag-IBIG rates
    const existingRates = await dbStorage.getAllDeductionRates();
    const pagibigRates = existingRates.filter(r => r.type === "pagibig");
    
    for (const rate of pagibigRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }

    // Pag-IBIG 2025: 2% each (max ₱200 per share = ₱10,000 ceiling)
    await dbStorage.createDeductionRate({
      type: "pagibig",
      minSalary: "0",
      maxSalary: "10000",
      employeeRate: "2",
      employeeContribution: null, // Calculated based on percentage up to max
      description: "Pag-IBIG 2025: 2% each (max ₱200 per share). Ceiling ₱10k.",
      isActive: true,
    });

    res.json({
      success: true,
      message: "Successfully seeded Pag-IBIG rate",
      count: 1,
    });
  } catch (error) {
    console.error("Error seeding Pag-IBIG rates:", error);
    res.status(500).json({ success: false, message: "Failed to seed Pag-IBIG rates" });
  }
});

/**
 * POST /api/admin/seed-tax-rates
 * Seeds BIR withholding tax brackets (TRAIN Law)
 */
router.post("/api/admin/seed-tax-rates", requireAdmin, async (req, res) => {
  try {
    // Delete existing tax rates
    const existingRates = await dbStorage.getAllDeductionRates();
    const taxRates = existingRates.filter(r => r.type === "tax");
    
    for (const rate of taxRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }

    // TRAIN Law Annual Brackets (converted to monthly)
    const taxBrackets = [
      { minAnnual: 0, maxAnnual: 250000, rate: 0, description: "0% (Tax-exempt)" },
      { minAnnual: 250001, maxAnnual: 400000, rate: 15, description: "15% of excess over ₱250k" },
      { minAnnual: 400001, maxAnnual: 800000, rate: 20, description: "₱22,500 + 20% of excess over ₱400k" },
      { minAnnual: 800001, maxAnnual: 2000000, rate: 25, description: "₱102,500 + 25% of excess over ₱800k" },
      { minAnnual: 2000001, maxAnnual: 8000000, rate: 30, description: "₱402,500 + 30% of excess over ₱2M" },
      { minAnnual: 8000001, maxAnnual: null, rate: 35, description: "₱2,202,500 + 35% of excess over ₱8M" },
    ];

    for (const bracket of taxBrackets) {
      await dbStorage.createDeductionRate({
        type: "tax",
        minSalary: Math.round(bracket.minAnnual / 12).toString(), // Convert to monthly
        maxSalary: bracket.maxAnnual ? Math.round(bracket.maxAnnual / 12).toString() : null,
        employeeRate: bracket.rate.toString(),
        employeeContribution: null,
        description: `BIR TRAIN: ${bracket.description}`,
        isActive: true,
      });
    }

    res.json({
      success: true,
      message: "Successfully seeded BIR tax brackets (TRAIN Law)",
      count: taxBrackets.length,
    });
  } catch (error) {
    console.error("Error seeding tax rates:", error);
    res.status(500).json({ success: false, message: "Failed to seed tax rates" });
  }
});

/**
 * POST /api/admin/seed-all-rates
 * Seeds all Philippine mandatory deduction rates at once
 */
router.post("/api/admin/seed-all-rates", requireAdmin, async (req, res) => {
  try {
    const results = {
      sss: 0,
      philhealth: 0,
      pagibig: 0,
      tax: 0,
    };

    // Delete all existing rates
    const existingRates = await dbStorage.getAllDeductionRates();
    for (const rate of existingRates) {
      await dbStorage.deleteDeductionRate(rate.id);
    }

    // Seed SSS (61 brackets) - FIXED AMOUNTS, not percentages
    for (const bracket of sss2025Brackets) {
      await dbStorage.createDeductionRate({
        type: "sss",
        minSalary: bracket.minSalary.toString(),
        maxSalary: bracket.maxSalary?.toString() || null,
        employeeRate: null, // SSS uses fixed amounts, NOT %
        employeeContribution: bracket.totalEE.toString(),
        description: `MSC ₱${bracket.totalMSC.toLocaleString()} | EE ₱${bracket.totalEE} | ER ₱${bracket.totalER}`,
        isActive: true,
      });
      results.sss++;
    }

    // Seed PhilHealth
    await dbStorage.createDeductionRate({
      type: "philhealth",
      minSalary: "10000",
      maxSalary: "100000",
      employeeRate: "2.5",
      employeeContribution: null,
      description: "PhilHealth 2025: 5% total (2.5% each). Floor ₱10k, Ceiling ₱100k.",
      isActive: true,
    });
    results.philhealth = 1;

    // Seed Pag-IBIG
    await dbStorage.createDeductionRate({
      type: "pagibig",
      minSalary: "0",
      maxSalary: "10000",
      employeeRate: "2",
      employeeContribution: null,
      description: "Pag-IBIG 2025: 2% each (max ₱200). Ceiling ₱10k.",
      isActive: true,
    });
    results.pagibig = 1;

    // Seed Tax Brackets
    const taxBrackets = [
      { minAnnual: 0, maxAnnual: 250000, rate: 0, desc: "0% Tax-exempt" },
      { minAnnual: 250001, maxAnnual: 400000, rate: 15, desc: "15%" },
      { minAnnual: 400001, maxAnnual: 800000, rate: 20, desc: "20%" },
      { minAnnual: 800001, maxAnnual: 2000000, rate: 25, desc: "25%" },
      { minAnnual: 2000001, maxAnnual: 8000000, rate: 30, desc: "30%" },
      { minAnnual: 8000001, maxAnnual: null, rate: 35, desc: "35%" },
    ];

    for (const bracket of taxBrackets) {
      await dbStorage.createDeductionRate({
        type: "tax",
        minSalary: Math.round(bracket.minAnnual / 12).toString(),
        maxSalary: bracket.maxAnnual ? Math.round(bracket.maxAnnual / 12).toString() : null,
        employeeRate: bracket.rate.toString(),
        employeeContribution: null,
        description: `BIR TRAIN: ${bracket.desc}`,
        isActive: true,
      });
      results.tax++;
    }

    const total = results.sss + results.philhealth + results.pagibig + results.tax;

    res.json({
      success: true,
      message: `Successfully seeded all ${total} Philippine mandatory deduction rates`,
      results,
    });
  } catch (error) {
    console.error("Error seeding all rates:", error);
    res.status(500).json({ success: false, message: "Failed to seed rates" });
  }
});

export { router as seedRatesRouter };
