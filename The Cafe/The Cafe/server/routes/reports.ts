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
  return "\uFEFF" + sections.join("\n");
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
    const totalGross = enriched.reduce((s, { e }) => s + (parseFloat(String(e.grossPay)) || 0), 0);
    const totalNet = enriched.reduce((s, { e }) => s + (parseFloat(String(e.netPay)) || 0), 0);
    const totalDeductions = enriched.reduce((s, { e }) => s + (parseFloat(String(e.totalDeductions)) || 0), 0);
    const totalHours = enriched.reduce((s, { e }) => s + (parseFloat(String(e.totalHours)) || 0), 0);

    const summaryRows = [
      "",
      row("TOTALS", "", "", "", "", "", totalHours.toFixed(2), "", "", "", "", "", peso(totalGross), "", "", "", "", "", "", "", "", peso(totalDeductions), peso(totalNet), ""),
    ];

    const csv = buildCSV([...meta, headers, ...dataRows, ...summaryRows]);
    const filename = `payroll_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    // Pass explicit Buffer to prevent Express from messing with the BOM bytes
    res.send(Buffer.from(csv, "utf8"));

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
        (e as any).tinNumber || "",
        (e as any).sssNumber || "",
        (e as any).philHealthNumber || "",
        (e as any).pagIbigNumber || "",
      )
    );

    const csv = buildCSV([...meta, headers, ...dataRows]);
    const filename = `employees_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(csv, "utf8"));

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
      "Position",
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
        user?.position || "N/A",
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
      row("TOTALS", "",
        peso(totalSSS), peso(totalSSSLoan), peso(totalPhilHealth),
        peso(totalPagibig), peso(totalPagibigLoan),
        peso(totalTax), peso(totalAdvances), peso(totalOther), peso(totalDeductions)),
    ];

    const csv = buildCSV([...meta, headers, ...dataRows, ...summaryRows]);
    const filename = `deductions_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(csv, "utf8"));

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

    const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
    const periodMap = new Map(allPeriods.map((p) => [p.id, p]));

    let totalGross = 0, totalDeductions = 0, totalNet = 0, totalHours = 0;
    let totalSSS = 0, totalPhilHealth = 0, totalPagibig = 0, totalTax = 0;

    for (const employee of activeEmployees) {
      const entries = await storage.getPayrollEntriesByUser(employee.id);
      for (const entry of entries) {
        const period = periodMap.get(entry.payrollPeriodId);
        if (period) {
          const periodEnd = new Date(period.endDate);
          if (periodEnd >= startDate && periodEnd <= endDate) {
            totalGross += parseFloat(entry.grossPay || "0");
            totalDeductions += parseFloat(entry.totalDeductions || "0");
            totalNet += parseFloat(entry.netPay || "0");
            totalHours += parseFloat(entry.totalHours || "0");
            
            totalSSS += parseFloat(entry.sssContribution || "0");
            totalPhilHealth += parseFloat(entry.philHealthContribution || "0");
            totalPagibig += parseFloat(entry.pagibigContribution || "0");
            totalTax += parseFloat(entry.withholdingTax || "0");
          }
        }
      }
    }

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

export { router as reportsRouter };
