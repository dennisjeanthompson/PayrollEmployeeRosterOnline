/**
 * Reports Export Routes
 * CSV export for payroll and employee data — Philippine DOLE/BIR compliant
 *
 * Key design decisions:
 * - UTF-8 BOM prepended so ₱ renders correctly in MS Excel and WPS Office
 * - Monetary values are rounded to 2dp using Math.round to avoid floating-point
 *   artifacts (e.g. 1407.6259999…)
 * - Peso symbol NOT placed in column headers (encoding issues in some readers);
 *   instead a note is added in the title rows
 * - Period metadata block prepended to payroll/deductions CSVs so the file is
 *   self-describing when opened standalone
 */

import { Router, Request, Response } from "express";
import { dbStorage as storage } from "../db-storage";
import { format } from "date-fns";
import { createAuditLog } from "./audit";

const router = Router();

// ─── Auth helpers ──────────────────────────────────────────────────────────

const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) return res.status(401).json({ message: "Not authenticated" });
  req.user = req.session.user;
  next();
};

const requireManagerRole = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

// ─── CSV helpers ────────────────────────────────────────────────────────────

/** Escape a single CSV field value */
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return "";
  let str = String(value);
  // Neutralize formula injection
  if (/^[=+\-@\t\r]/.test(str)) str = "'" + str;
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Format a monetary value as Philippine Peso.
 * Uses Math.round to eliminate floating-point artifacts.
 * Returns a plain string like "₱1,407.63" — suitable for CSV cells.
 */
const peso = (value: any): string => {
  if (value === null || value === undefined || value === "") return "₱0.00";
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(n)) return "₱0.00";
  const rounded = Math.round(n * 100) / 100;
  return "₱" + rounded.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/** Build a CSV row from an array of values */
const row = (...cells: any[]) => cells.map(escapeCSV).join(",");

/** Build a CSV from header row + data rows (all pre-built strings) */
const buildCSV = (sections: string[]): string => {
  // Prepend UTF-8 BOM so Excel/WPS recognises ₱ correctly
  // Prepend sep=, to force Excel to use comma separator regardless of regional settings
  return "\uFEFFsep=,\n" + sections.join("\n");
};

// ─── Payroll Summary Export ─────────────────────────────────────────────────

router.get("/api/reports/payroll/export", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const { periodId, startDate, endDate } = req.query;
    const branchId = req.user!.branchId;

    let entries: any[] = [];
    let periodLabel = "All Periods";
    let periodRange = "";

    if (periodId) {
      const period = await storage.getPayrollPeriod(periodId as string);
      if (!period || period.branchId !== branchId) {
        return res.status(403).json({ message: "Payroll period not found or access denied" });
      }
      entries = await storage.getPayrollEntriesByPeriod(periodId as string);
      periodLabel = `${format(new Date(period.startDate), "MMM d yyyy")} – ${format(new Date(period.endDate), "MMM d yyyy")}`;
      periodRange = `${format(new Date(period.startDate), "yyyy-MM-dd")} to ${format(new Date(period.endDate), "yyyy-MM-dd")}`;
    } else if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      entries = await storage.getPayrollEntriesForDateRange(branchId, start, end);
      periodRange = `${format(start, "yyyy-MM-dd")} to ${format(end, "yyyy-MM-dd")}`;
      periodLabel = `${format(start, "MMM d yyyy")} – ${format(end, "MMM d yyyy")}`;
    } else {
      const periods = await storage.getPayrollPeriodsByBranch(branchId);
      for (const period of periods) {
        const periodEntries = await storage.getPayrollEntriesByPeriod(period.id);
        entries.push(...periodEntries);
      }
    }

    // Enrich with employee data
    const enriched = await Promise.all(
      entries.map(async (e) => {
        const user = await storage.getUser(e.userId);
        return { e, user };
      })
    );

    const exportedAt = format(new Date(), "MMMM d yyyy HH:mm");

    // ── Title / metadata block ──
    const meta = [
      row("PERO PAYROLL SYSTEM — PAYROLL SUMMARY EXPORT"),
      row("All monetary values are in Philippine Peso (PHP)"),
      row(`Period:`, periodLabel),
      row(`Generated:`, exportedAt),
      row(`Total Records:`, String(enriched.length)),
      "",
    ];

    // ── Column header ──
    const headers = row(
      "Employee Name",
      "Employee ID",
      "Position",
      "Regular Hours",
      "Overtime Hours",
      "Night Diff Hours",
      "Total Hours",
      "Basic Pay (PHP)",
      "Overtime Pay (PHP)",
      "Night Diff Pay (PHP)",
      "Holiday Pay (PHP)",
      "Rest Day Pay (PHP)",
      "Gross Pay (PHP)",
      "SSS Contribution (PHP)",
      "SSS Loan (PHP)",
      "PhilHealth Contribution (PHP)",
      "Pag-IBIG Contribution (PHP)",
      "Pag-IBIG Loan (PHP)",
      "Withholding Tax (PHP)",
      "Cash Advances (PHP)",
      "Other Deductions (PHP)",
      "Total Deductions (PHP)",
      "Net Pay (PHP)",
      "Status",
    );

    // ── Data rows ──
    const dataRows = enriched.map(({ e, user }) =>
      row(
        user ? `${user.firstName} ${user.lastName}` : "Unknown",
        user?.id || e.userId,
        user?.position || "N/A",
        e.regularHours ?? 0,
        e.overtimeHours ?? 0,
        e.nightDiffHours ?? 0,
        e.totalHours ?? 0,
        peso(e.basicPay),
        peso(e.overtimePay),
        peso(e.nightDiffPay),
        peso(e.holidayPay),
        peso(e.restDayPay),
        peso(e.grossPay),
        peso(e.sssContribution),
        peso(e.sssLoan),
        peso(e.philHealthContribution),
        peso(e.pagibigContribution),
        peso(e.pagibigLoan),
        peso(e.withholdingTax),
        peso(e.advances),
        peso(e.otherDeductions),
        peso(e.totalDeductions),
        peso(e.netPay),
        (e.status || "").toUpperCase(),
      )
    );

    // ── Summary totals ──
    const sum = (field: string) => enriched.reduce((s, { e }) => s + (parseFloat(String((e as any)[field])) || 0), 0);
    const totalRegHours = sum("regularHours");
    const totalOTHours = sum("overtimeHours");
    const totalNDHours = sum("nightDiffHours");
    const totalHours = sum("totalHours");
    const totalBasic = sum("basicPay");
    const totalOTPay = sum("overtimePay");
    const totalNDPay = sum("nightDiffPay");
    const totalHoliday = sum("holidayPay");
    const totalRestDay = sum("restDayPay");
    const totalGross = sum("grossPay");
    const totalSSS = sum("sssContribution");
    const totalSSSLoan = sum("sssLoan");
    const totalPhilHealth = sum("philHealthContribution");
    const totalPagibig = sum("pagibigContribution");
    const totalPagibigLoan = sum("pagibigLoan");
    const totalTax = sum("withholdingTax");
    const totalAdvances = sum("advances");
    const totalOtherDed = sum("otherDeductions");
    const totalDeductions = sum("totalDeductions");
    const totalNet = sum("netPay");

    const summaryRows = [
      "",
      row("TOTALS", "", "",
        totalRegHours.toFixed(2), totalOTHours.toFixed(2), totalNDHours.toFixed(2), totalHours.toFixed(2),
        peso(totalBasic), peso(totalOTPay), peso(totalNDPay), peso(totalHoliday), peso(totalRestDay),
        peso(totalGross), peso(totalSSS), peso(totalSSSLoan), peso(totalPhilHealth),
        peso(totalPagibig), peso(totalPagibigLoan), peso(totalTax),
        peso(totalAdvances), peso(totalOtherDed), peso(totalDeductions), peso(totalNet), ""),
    ];

    const csv = buildCSV([...meta, headers, ...dataRows, ...summaryRows]);
    const filename = `payroll_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(csv, "utf8"));

    await createAuditLog({
      action: "export_payroll",
      entityType: "payroll_report",
      entityId: (periodId as string) || "all",
      userId: req.user!.id,
      newValues: { entriesExported: enriched.length, filename, periodRange },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Error exporting payroll:", error);
    res.status(500).json({ message: "Failed to export payroll data" });
  }
});

// ─── Employee List Export ────────────────────────────────────────────────────

router.get("/api/reports/employees/export", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { includeInactive } = req.query;

    let employees = await storage.getUsersByBranch(branchId);
    if (!includeInactive || includeInactive === "false") {
      employees = employees.filter((e) => e.isActive);
    }

    // Exclude the admin / system accounts from the export
    const exportEmployees = employees.filter((e) => e.role !== "admin");

    const exportedAt = format(new Date(), "MMMM d yyyy HH:mm");

    const meta = [
      row("PERO PAYROLL SYSTEM — EMPLOYEE LIST EXPORT"),
      row(`Generated:`, exportedAt),
      row(`Total Employees:`, String(exportEmployees.length)),
      "",
    ];

    const headers = row(
      "Employee Name",
      "First Name",
      "Last Name",
      "Email",
      "Position",
      "Role",
      "Hourly Rate (PHP)",
      "Employment Status",
      "Hire Date",
      "TIN",
      "SSS Number",
      "PhilHealth Number",
      "Pag-IBIG Number",
    );

    const dataRows = exportEmployees.map((e) =>
      row(
        `${e.firstName} ${e.lastName}`,
        e.firstName,
        e.lastName,
        e.email || "",
        e.position || "",
        e.role || "employee",
        peso(e.hourlyRate),
        e.isActive ? "Active" : "Inactive",
        e.createdAt ? format(new Date(e.createdAt), "MMM d yyyy") : "N/A",
        (e as any).tin || "",
        (e as any).sssNumber || "",
        (e as any).philhealthNumber || "",
        (e as any).pagibigNumber || "",
      )
    );

    const csv = buildCSV([...meta, headers, ...dataRows]);
    const filename = `employees_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(csv, "utf8"));

    await createAuditLog({
      action: "export_employees",
      entityType: "employee_report",
      entityId: branchId,
      userId: req.user!.id,
      newValues: { employeesExported: exportEmployees.length, filename },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Error exporting employees:", error);
    res.status(500).json({ message: "Failed to export employee data" });
  }
});

// ─── Deductions Summary Export ───────────────────────────────────────────────

router.get("/api/reports/deductions/export", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const { periodId } = req.query;
    if (!periodId) return res.status(400).json({ message: "Period ID is required" });

    const branchId = req.user!.branchId;
    const period = await storage.getPayrollPeriod(periodId as string);
    if (!period || period.branchId !== branchId) {
      return res.status(403).json({ message: "Payroll period not found or access denied" });
    }

    const entries = await storage.getPayrollEntriesByPeriod(periodId as string);

    const enriched = await Promise.all(
      entries.map(async (e) => {
        const user = await storage.getUser(e.userId);
        return { e, user };
      })
    );

    const periodLabel = `${format(new Date(period.startDate), "MMM d yyyy")} – ${format(new Date(period.endDate), "MMM d yyyy")}`;
    const exportedAt = format(new Date(), "MMMM d yyyy HH:mm");

    const meta = [
      row("PERO PAYROLL SYSTEM — DEDUCTIONS SUMMARY EXPORT"),
      row("All amounts are in Philippine Peso (PHP). DOLE Order 174 Compliant."),
      row(`Period:`, periodLabel),
      row(`Generated:`, exportedAt),
      row(`Total Employees:`, String(enriched.length)),
      "",
    ];

    const headers = row(
      "Employee Name",
      "Employee ID",
      "Position",
      "TIN",
      "SSS Number",
      "PhilHealth Number",
      "Pag-IBIG Number",
      "SSS Contribution (PHP)",
      "SSS Loan (PHP)",
      "PhilHealth (PHP)",
      "Pag-IBIG Contribution (PHP)",
      "Pag-IBIG Loan (PHP)",
      "Withholding Tax (PHP)",
      "Cash Advances (PHP)",
      "Other Deductions (PHP)",
      "Total Deductions (PHP)",
    );

    const dataRows = enriched.map(({ e, user }) =>
      row(
        user ? `${user.firstName} ${user.lastName}` : "Unknown",
        user?.id || e.userId,
        user?.position || "N/A",
        (user as any)?.tin || "",
        (user as any)?.sssNumber || "",
        (user as any)?.philhealthNumber || "",
        (user as any)?.pagibigNumber || "",
        peso(e.sssContribution),
        peso(e.sssLoan),
        peso(e.philHealthContribution),
        peso(e.pagibigContribution),
        peso(e.pagibigLoan),
        peso(e.withholdingTax),
        peso(e.advances),
        peso(e.otherDeductions),
        peso(e.totalDeductions),
      )
    );

    // Totals row
    const totalSSS = enriched.reduce((s, { e }) => s + (parseFloat(String(e.sssContribution)) || 0), 0);
    const totalPhilHealth = enriched.reduce((s, { e }) => s + (parseFloat(String(e.philHealthContribution)) || 0), 0);
    const totalPagibig = enriched.reduce((s, { e }) => s + (parseFloat(String(e.pagibigContribution)) || 0), 0);
    const totalTax = enriched.reduce((s, { e }) => s + (parseFloat(String(e.withholdingTax)) || 0), 0);
    const totalAdvances = enriched.reduce((s, { e }) => s + (parseFloat(String(e.advances)) || 0), 0);
    const totalOther = enriched.reduce((s, { e }) => s + (parseFloat(String(e.otherDeductions)) || 0), 0);
    const totalDeductions = enriched.reduce((s, { e }) => s + (parseFloat(String(e.totalDeductions)) || 0), 0);
    const totalSSSLoan = enriched.reduce((s, { e }) => s + (parseFloat(String(e.sssLoan)) || 0), 0);
    const totalPagibigLoan = enriched.reduce((s, { e }) => s + (parseFloat(String(e.pagibigLoan)) || 0), 0);

    const summaryRows = [
      "",
      row("TOTALS", "", "", "", "", "", "",
        peso(totalSSS), peso(totalSSSLoan), peso(totalPhilHealth),
        peso(totalPagibig), peso(totalPagibigLoan),
        peso(totalTax), peso(totalAdvances), peso(totalOther), peso(totalDeductions)),
    ];

    const csv = buildCSV([...meta, headers, ...dataRows, ...summaryRows]);
    const filename = `deductions_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.end(Buffer.from(csv, "utf8"));

    await createAuditLog({
      action: "export_deductions",
      entityType: "deduction_report",
      entityId: periodId as string,
      userId: req.user!.id,
      newValues: { entriesExported: enriched.length, filename, periodLabel },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Error exporting deductions:", error);
    res.status(500).json({ message: "Failed to export deduction data" });
  }
});

// ─── Summary stats (for dashboard) ──────────────────────────────────────────

router.get("/api/reports/summary", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { month, year } = req.query;

    const now = new Date();
    const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 0 || targetMonth > 11) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const employees = await storage.getUsersByBranch(branchId);
    const activeEmployees = employees.filter((e) => e.isActive);

    // Get all payroll periods for this branch that fall within the selected month
    const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
    const monthPeriods = allPeriods.filter((p) => {
      const periodEnd = new Date(p.endDate);
      const periodStart = new Date(p.startDate);
      // Include period if it overlaps with the target month
      return periodEnd >= startDate && periodStart <= endDate;
    });

    let totalGross = 0, totalDeductions = 0, totalNet = 0, totalHours = 0;
    let totalSSS = 0, totalPhilHealth = 0, totalPagibig = 0, totalTax = 0;

    console.log(`\n=== REPORTS SUMMARY API [${targetMonth + 1}/${targetYear}] ===`);
    console.log(`Branch: ${branchId}, Active Employees: ${activeEmployees.length}`);
    console.log(`Found ${monthPeriods.length} overlapping periods.`);

    // Helper to calculate deductions on the fly for old entries that saved 0
    const { calculateAllDeductions, calculateWithholdingTax } = await import('../utils/deductions');

    // Collect all entries for matching periods (more reliable than per-user lookup)
    for (const period of monthPeriods) {
      const entries = await storage.getPayrollEntriesByPeriod(period.id);
      console.log(`>> Period ${period.id}: Found ${entries.length} entries. startDate: ${period.startDate}, endDate: ${period.endDate}`);
      
      // Determine if period is semi-monthly (15 days) to halve deductions
      const startDateObj = new Date(period.startDate);
      const endDateObj = new Date(period.endDate);
      const daysInPeriod = Math.round((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const periodFraction = daysInPeriod < 28 ? 0.5 : 1;
      console.log(`   Period days: ${daysInPeriod}, fraction multiplier: ${periodFraction}`);

      for (const entry of entries) {
        totalGross += parseFloat(String(entry.grossPay ?? "0")) || 0;
        totalDeductions += parseFloat(String(entry.totalDeductions ?? "0")) || 0;
        totalNet += parseFloat(String(entry.netPay ?? "0")) || 0;
        totalHours += parseFloat(String(entry.totalHours ?? "0")) || 0;

        // Try getting actual DB values first
        let currentSSS = parseFloat(String((entry as any).sssContribution ?? (entry as any).sss_contribution ?? "0")) || 0;
        let currentPhilHealth = parseFloat(String((entry as any).philHealthContribution ?? (entry as any).phil_health_contribution ?? (entry as any).philhealthContribution ?? "0")) || 0;
        let currentPagibig = parseFloat(String((entry as any).pagibigContribution ?? (entry as any).pagibig_contribution ?? "0")) || 0;
        let currentTax = parseFloat(String((entry as any).withholdingTax ?? (entry as any).withholding_tax ?? "0")) || 0;

        // Fallback: If ALL government deductions are 0 in the DB, it's likely an older entry
        // before the deduction system was active. We must recalculate them dynamically.
        if (currentSSS === 0 && currentPhilHealth === 0 && currentPagibig === 0) {
          const basicPay = parseFloat(String(entry.basicPay ?? "0")) || 0;
          // Calculate monthly equivalent salary (basic pay / period fraction)
          const monthlyBasicSalary = basicPay / periodFraction;

          console.log(`   [User: ${entry.userId}] DB stored "0". Recalculating... BasicPay: ${basicPay}, MonthlyEq: ${monthlyBasicSalary}`);

          if (monthlyBasicSalary > 0) {
            const mandatoryBreakdown = await calculateAllDeductions(monthlyBasicSalary, {
              deductSSS: true,
              deductPhilHealth: true,
              deductPagibig: true,
              deductWithholdingTax: false
            });

            currentSSS = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
            currentPhilHealth = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
            currentPagibig = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;

            // Recalculate tax ONLY IF also 0, taking MWE into account
            if (currentTax === 0) {
              const user = employees.find(e => e.id === entry.userId);
              const isMwe = user ? (user as any).isMwe : false;
              
              if (!isMwe) {
                const monthlyMandatory = mandatoryBreakdown.sssContribution + mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
                const monthlyTaxableIncome = Math.max(0, monthlyBasicSalary - monthlyMandatory);
                const monthlyTax = await calculateWithholdingTax(monthlyTaxableIncome);
                currentTax = Math.round(monthlyTax * periodFraction * 100) / 100;
              }
            }
            console.log(`     Calculated -> SSS: ${currentSSS}, PH: ${currentPhilHealth}, PI: ${currentPagibig}, Tax: ${currentTax}`);
          }
        } else {
          console.log(`   [User: ${entry.userId}] Found saved deductions -> SSS: ${currentSSS}, PH: ${currentPhilHealth}, PI: ${currentPagibig}, Tax: ${currentTax}`);
        }

        totalSSS += currentSSS;
        totalPhilHealth += currentPhilHealth;
        totalPagibig += currentPagibig;
        totalTax += currentTax;
      }
    }

    console.log(`=== GRAND TOTALS -> SSS: ${totalSSS}, PH: ${totalPhilHealth}, PI: ${totalPagibig}, Tax: ${totalTax} ===\n`);

    res.json({
      summary: {
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        totalGross: (Math.round(totalGross * 100) / 100).toFixed(2),
        totalDeductions: (Math.round(totalDeductions * 100) / 100).toFixed(2),
        totalNet: (Math.round(totalNet * 100) / 100).toFixed(2),
        totalHours: totalHours.toFixed(2),
        totalSSS: (Math.round(totalSSS * 100) / 100).toFixed(2),
        totalPhilHealth: (Math.round(totalPhilHealth * 100) / 100).toFixed(2),
        totalPagibig: (Math.round(totalPagibig * 100) / 100).toFixed(2),
        totalTax: (Math.round(totalTax * 100) / 100).toFixed(2),
        month: targetMonth + 1,
        year: targetYear,
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
});

// ─── Remittance Report (For Government PRN Generation) ──────────────────────
router.get("/api/reports/remittance", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { month, year } = req.query;

    const now = new Date();
    const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    if (isNaN(targetMonth) || isNaN(targetYear) || targetMonth < 0 || targetMonth > 11) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const employees = await storage.getUsersByBranch(branchId);
    const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
    
    const monthPeriods = allPeriods.filter((p) => {
      const periodEnd = new Date(p.endDate);
      const periodStart = new Date(p.startDate);
      return periodEnd >= startDate && periodStart <= endDate;
    });

    const employeeRemittances: Record<string, any> = {};

    for (const employee of employees) {
      employeeRemittances[employee.id] = {
        employeeName: `${employee.firstName} ${employee.lastName}`,
        sssContribution: 0,
        sssLoan: 0,
        philHealthContribution: 0,
        pagibigContribution: 0,
        pagibigLoan: 0,
      };
    }

    for (const period of monthPeriods) {
      const entries = await storage.getPayrollEntriesByPeriod(period.id);
      for (const entry of entries) {
        if (!employeeRemittances[entry.userId]) continue;
        
        let sssC = parseFloat(String(entry.sssContribution ?? "0")) || 0;
        let phC = parseFloat(String(entry.philHealthContribution ?? "0")) || 0;
        let pagC = parseFloat(String(entry.pagibigContribution ?? "0")) || 0;
        let sssL = parseFloat(String(entry.sssLoan ?? "0")) || 0;
        let pagL = parseFloat(String(entry.pagibigLoan ?? "0")) || 0;
        
        employeeRemittances[entry.userId].sssContribution += sssC;
        employeeRemittances[entry.userId].philHealthContribution += phC;
        employeeRemittances[entry.userId].pagibigContribution += pagC;
        employeeRemittances[entry.userId].sssLoan += sssL;
        employeeRemittances[entry.userId].pagibigLoan += pagL;
      }
    }

    const activeRemittances = Object.values(employeeRemittances).filter(r => 
      r.sssContribution > 0 || r.sssLoan > 0 || r.philHealthContribution > 0 || r.pagibigContribution > 0 || r.pagibigLoan > 0
    );

    res.json(activeRemittances);
  } catch (error) {
    console.error("Error fetching remittances:", error);
    res.status(500).json({ message: "Failed to fetch remittances" });
  }
});

// ─── Debug endpoint to inspect raw payroll entry data ──────────────────────
router.get("/api/reports/debug", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { month, year } = req.query;

    const now = new Date();
    const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
    const monthPeriods = allPeriods.filter((p) => {
      const periodEnd = new Date(p.endDate);
      const periodStart = new Date(p.startDate);
      return periodEnd >= startDate && periodStart <= endDate;
    });

    const rawEntries: any[] = [];
    for (const period of monthPeriods) {
      const entries = await storage.getPayrollEntriesByPeriod(period.id);
      for (const entry of entries) {
        rawEntries.push({
          id: entry.id,
          userId: entry.userId,
          periodId: period.id,
          grossPay: entry.grossPay,
          totalDeductions: entry.totalDeductions,
          netPay: entry.netPay,
          sssContribution: (entry as any).sssContribution,
          philHealthContribution: (entry as any).philHealthContribution,
          pagibigContribution: (entry as any).pagibigContribution,
          withholdingTax: (entry as any).withholdingTax,
        });
      }
    }

    res.json({
      branchId,
      targetMonth: targetMonth + 1,
      targetYear,
      periodsFound: monthPeriods.length,
      entriesFound: rawEntries.length,
      entries: rawEntries,
    });
  } catch (error) {
    res.status(500).json({ message: "Debug failed", error: String(error) });
  }
});

export { router as reportsRouter };
