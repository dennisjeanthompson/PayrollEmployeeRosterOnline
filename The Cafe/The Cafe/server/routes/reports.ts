/**
 * Reports Export Routes
 * CSV/Excel export for payroll and employee data
 */

import { Router, Request, Response } from "express";
import { dbStorage as storage } from "../db-storage";
import { format } from "date-fns";

const router = Router();

// Middleware to check if user is authenticated
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  req.user = req.session.user;
  next();
};

// Middleware to check manager/admin role
const requireManagerRole = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== "manager" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

// Helper to escape CSV values
const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Helper to generate CSV from array of objects
const generateCSV = (data: any[], columns: { key: string; header: string }[]): string => {
  const headers = columns.map(c => c.header).join(",");
  const rows = data.map(row => 
    columns.map(c => escapeCSV(row[c.key])).join(",")
  );
  return [headers, ...rows].join("\n");
};

// GET /api/reports/payroll/export - Export payroll data as CSV
router.get("/api/reports/payroll/export", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const { periodId, startDate, endDate } = req.query;
    const branchId = req.user!.branchId;

    let entries: any[] = [];

    if (periodId) {
      // Get entries for specific period
      entries = await storage.getPayrollEntriesByPeriod(periodId as string);
    } else if (startDate && endDate) {
      // Get entries for date range
      entries = await storage.getPayrollEntriesForDateRange(
        branchId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
    } else {
      // Get all entries for branch
      const periods = await storage.getPayrollPeriodsByBranch(branchId);
      for (const period of periods) {
        const periodEntries = await storage.getPayrollEntriesByPeriod(period.id);
        entries.push(...periodEntries);
      }
    }

    // Enrich with employee names
    const enrichedEntries = await Promise.all(
      entries.map(async (entry) => {
        const user = await storage.getUser(entry.userId);
        return {
          ...entry,
          employeeName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          employeeId: user?.id || entry.userId,
          position: user?.position || "N/A",
        };
      })
    );

    const columns = [
      { key: "employeeName", header: "Employee Name" },
      { key: "employeeId", header: "Employee ID" },
      { key: "position", header: "Position" },
      { key: "totalHours", header: "Total Hours" },
      { key: "regularHours", header: "Regular Hours" },
      { key: "overtimeHours", header: "Overtime Hours" },
      { key: "basicPay", header: "Basic Pay (₱)" },
      { key: "overtimePay", header: "Overtime Pay (₱)" },
      { key: "nightDiffPay", header: "Night Diff Pay (₱)" },
      { key: "holidayPay", header: "Holiday Pay (₱)" },
      { key: "grossPay", header: "Gross Pay (₱)" },
      { key: "sssContribution", header: "SSS (₱)" },
      { key: "philHealthContribution", header: "PhilHealth (₱)" },
      { key: "pagibigContribution", header: "Pag-IBIG (₱)" },
      { key: "withholdingTax", header: "Tax (₱)" },
      { key: "totalDeductions", header: "Total Deductions (₱)" },
      { key: "netPay", header: "Net Pay (₱)" },
      { key: "status", header: "Status" },
    ];

    const csv = generateCSV(enrichedEntries, columns);
    const filename = `payroll_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting payroll:", error);
    res.status(500).json({ message: "Failed to export payroll data" });
  }
});

// GET /api/reports/employees/export - Export employee data as CSV
router.get("/api/reports/employees/export", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { includeInactive } = req.query;

    let employees = await storage.getUsersByBranch(branchId);

    if (!includeInactive || includeInactive === "false") {
      employees = employees.filter(e => e.isActive);
    }

    const columns = [
      { key: "id", header: "Employee ID" },
      { key: "firstName", header: "First Name" },
      { key: "lastName", header: "Last Name" },
      { key: "email", header: "Email" },
      { key: "position", header: "Position" },
      { key: "hourlyRate", header: "Hourly Rate (₱)" },
      { key: "role", header: "Role" },
      { key: "isActive", header: "Active" },
      { key: "createdAt", header: "Hire Date" },
    ];

    const formattedEmployees = employees.map(e => ({
      ...e,
      isActive: e.isActive ? "Yes" : "No",
      createdAt: e.createdAt ? format(new Date(e.createdAt), "yyyy-MM-dd") : "N/A",
    }));

    const csv = generateCSV(formattedEmployees, columns);
    const filename = `employees_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting employees:", error);
    res.status(500).json({ message: "Failed to export employee data" });
  }
});

// GET /api/reports/deductions/export - Export deduction summary as CSV
router.get("/api/reports/deductions/export", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const { periodId } = req.query;
    
    if (!periodId) {
      return res.status(400).json({ message: "Period ID is required" });
    }

    const entries = await storage.getPayrollEntriesByPeriod(periodId as string);

    const enrichedEntries = await Promise.all(
      entries.map(async (entry) => {
        const user = await storage.getUser(entry.userId);
        return {
          employeeName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
          sssContribution: entry.sssContribution,
          sssLoan: entry.sssLoan,
          philHealthContribution: entry.philHealthContribution,
          pagibigContribution: entry.pagibigContribution,
          pagibigLoan: entry.pagibigLoan,
          withholdingTax: entry.withholdingTax,
          advances: entry.advances,
          otherDeductions: entry.otherDeductions,
          totalDeductions: entry.totalDeductions,
        };
      })
    );

    const columns = [
      { key: "employeeName", header: "Employee Name" },
      { key: "sssContribution", header: "SSS (₱)" },
      { key: "sssLoan", header: "SSS Loan (₱)" },
      { key: "philHealthContribution", header: "PhilHealth (₱)" },
      { key: "pagibigContribution", header: "Pag-IBIG (₱)" },
      { key: "pagibigLoan", header: "Pag-IBIG Loan (₱)" },
      { key: "withholdingTax", header: "Tax (₱)" },
      { key: "advances", header: "Advances (₱)" },
      { key: "otherDeductions", header: "Other (₱)" },
      { key: "totalDeductions", header: "Total (₱)" },
    ];

    const csv = generateCSV(enrichedEntries, columns);
    const filename = `deductions_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.csv`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting deductions:", error);
    res.status(500).json({ message: "Failed to export deduction data" });
  }
});

// GET /api/reports/summary - Get summary statistics for dashboard
router.get("/api/reports/summary", requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const { month, year } = req.query;

    const now = new Date();
    const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const employees = await storage.getUsersByBranch(branchId);
    const activeEmployees = employees.filter(e => e.isActive);

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalHours = 0;

    for (const employee of activeEmployees) {
      const entries = await storage.getPayrollEntriesByUser(employee.id);
      for (const entry of entries) {
        if (entry.createdAt) {
          const entryDate = new Date(entry.createdAt);
          if (entryDate >= startDate && entryDate <= endDate) {
            totalGross += parseFloat(entry.grossPay || "0");
            totalDeductions += parseFloat(entry.totalDeductions || "0");
            totalNet += parseFloat(entry.netPay || "0");
            totalHours += parseFloat(entry.totalHours || "0");
          }
        }
      }
    }

    res.json({
      summary: {
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        totalGross: totalGross.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        totalNet: totalNet.toFixed(2),
        totalHours: totalHours.toFixed(2),
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
