/**
 * Payslip API Routes
 * GET /api/payslips/entry/:entryId - Get payslip data from payroll entry
 * POST /api/payslips/generate-pdf - Generate PDF payslip from data
 * GET /api/payslips/verify - Verify payslip authenticity
 * GET /api/payslips/sample - Get sample payslip data
 * GET /api/payslips/sample-pdf - Generate sample PDF for testing
 * POST /api/payslips/audit-log - Log payslip access for audit
 */

import { Router, Request, Response, NextFunction } from 'express';
import { generatePayslipPDF, generatePayslipHash } from '../services/payslip-pdf-generator';
import { PayslipData, validatePayslipData, SAMPLE_PAYSLIP_DATA } from '../../shared/payslip-types';
import { dbStorage } from '../db-storage';
import { toLocalDateString, MONTHLY_WORKING_HOURS } from '../payroll-utils';
import { getPaymentDateString } from '../../shared/payroll-dates';
import { createAuditLog } from './audit';
import { calculateSSSEmployerShare } from '../utils/deductions';
import crypto from 'crypto';

const router = Router();
const storage = dbStorage;

// Default fallback company info (used only when no DB settings exist yet)
const DEFAULT_COMPANY_INFO = {
  name: "Your Company Name",
  address: "Philippines",
  tin: "XXX-XXX-XXX-XXX",
  logo_url: "",
  phone: "",
  email: "",
};

/**
 * Fetches company info from the database.
 * Falls back to DEFAULT_COMPANY_INFO if no settings have been configured yet.
 */
async function getCompanyInfo() {
  const settings = await storage.getCompanySettings();
  if (!settings) return DEFAULT_COMPANY_INFO;
  const fullAddress = [settings.address, settings.city, settings.province, settings.zipCode]
    .filter(Boolean).join(', ');
  return {
    name: settings.tradeName || settings.name,
    address: fullAddress || settings.address,
    tin: settings.tin,
    logo_url: settings.logoUrl || '',
    phone: settings.phone || '',
    email: settings.email || '',
  };
}

interface PayslipBuildParams {
  entry: Awaited<ReturnType<typeof storage.getPayrollEntry>>;
  employee: NonNullable<Awaited<ReturnType<typeof storage.getUser>>>;
  period: NonNullable<Awaited<ReturnType<typeof storage.getPayrollPeriod>>>;
  ratesEffectiveFrom: string;
  payslipId: string;
  verificationHash: string;
}

async function buildPayslipData(p: PayslipBuildParams): Promise<PayslipData> {
  let payBreakdown: any = {};
  if (p.entry!.payBreakdown) {
    try { payBreakdown = JSON.parse(p.entry!.payBreakdown); } catch {}
  }

  const basicPay = parseFloat(String(p.entry!.basicPay || p.entry!.grossPay || 0));
  const overtimePay = parseFloat(String(p.entry!.overtimePay || 0));
  const nightDiffPay = parseFloat(String(p.entry!.nightDiffPay || 0));
  const holidayPay = parseFloat(String(p.entry!.holidayPay || 0));
  const restDayPay = parseFloat(String(p.entry!.restDayPay || 0));
  const serviceChargePay = parseFloat(String(p.entry!.serviceCharge || 0));
  const sssContrib = parseFloat(String(p.entry!.sssContribution || 0));
  const sssLoan = parseFloat(String(p.entry!.sssLoan || 0));
  const philHealth = parseFloat(String(p.entry!.philHealthContribution || 0));
  const pagibig = parseFloat(String(p.entry!.pagibigContribution || 0));
  const pagibigLoan = parseFloat(String(p.entry!.pagibigLoan || 0));
  const tax = parseFloat(String(p.entry!.withholdingTax || 0));
  const otherDed = parseFloat(String(p.entry!.otherDeductions || 0));

  const otMultiplierUsed = payBreakdown?.overtimeMultiplier
    ? Math.round(payBreakdown.overtimeMultiplier * 100)
    : 125;

  const earnings: any[] = [];
  if (basicPay > 0) earnings.push({ code: 'BASIC', label: 'Basic Salary', hours: parseFloat(String(p.entry!.regularHours || 0)), rate: parseFloat(String(p.employee.hourlyRate || 0)), amount: basicPay });
  earnings.push({ code: 'OT', label: `Overtime Pay (${otMultiplierUsed}%)`, hours: parseFloat(String(p.entry!.overtimeHours || 0)), amount: overtimePay, is_overtime: true, multiplier: otMultiplierUsed });
  if (nightDiffPay > 0) earnings.push({ code: 'ND', label: 'Night Differential (10%)', hours: parseFloat(String(p.entry!.nightDiffHours || 0)), amount: nightDiffPay });
  earnings.push({ code: 'HOL', label: 'Holiday Pay', amount: holidayPay });
  if (restDayPay > 0) earnings.push({ code: 'RD', label: 'Rest Day Premium', amount: restDayPay });
  if (serviceChargePay > 0) earnings.push({ code: 'SC', label: 'Service Charge (RA 11360)', amount: serviceChargePay });

  const deductions: any[] = [];
  if (sssContrib > 0) deductions.push({ code: 'SSS_EE', label: 'SSS (Employee)', amount: sssContrib });
  if (sssLoan > 0) deductions.push({ code: 'SSS_LOAN', label: 'SSS Loan', amount: sssLoan, is_loan: true });
  if (philHealth > 0) deductions.push({ code: 'PH_EE', label: 'PhilHealth (Employee)', amount: philHealth });
  if (pagibig > 0) deductions.push({ code: 'PB_EE', label: 'Pag-IBIG (Employee)', amount: pagibig });
  if (pagibigLoan > 0) deductions.push({ code: 'PB_LOAN', label: 'Pag-IBIG Loan', amount: pagibigLoan, is_loan: true });
  if (tax > 0) deductions.push({ code: 'WHT', label: 'Withholding Tax', amount: tax });
  if (otherDed > 0) deductions.push({ code: 'OTHER', label: 'Other Deductions', amount: otherDed });

  // Employer contributions (display only — not deducted from employee net pay)
  // SSS: look up actual employer share from bracket table (10% ER vs 5% EE, ratio varies by MSC)
  const monthlyBasicSalary = parseFloat(String(p.employee.hourlyRate || 0)) * MONTHLY_WORKING_HOURS;
  const sssEmployerShare = await calculateSSSEmployerShare(monthlyBasicSalary);
  const employerContributions = [
    { code: 'SSS_ER', label: 'SSS (Employer Share)', amount: sssEmployerShare },
    { code: 'PH_ER', label: 'PhilHealth (Employer Share)', amount: philHealth },
    { code: 'PB_ER', label: 'Pag-IBIG (Employer Share)', amount: pagibig },
  ].filter(c => c.amount > 0);

  const companyInfo = await getCompanyInfo();
  const companyDbSettings = await storage.getCompanySettings();

  return {
    payslip_id: p.payslipId,
    company: companyInfo,
    employee: {
      id: `DM-EMP-${p.employee.id.substring(0, 6).toUpperCase()}`,
      name: `${p.employee.firstName} ${p.employee.lastName}`,
      position: p.employee.position,
      department: 'Operations',
      tin: p.employee.tin ? `XXX-XXX-${p.employee.tin.slice(-4)}` : '—',
      sss: p.employee.sssNumber ? `XX-XXXX${p.employee.sssNumber.slice(-4)}` : '—',
      philhealth: p.employee.philhealthNumber ? `XX-XXXXXX${p.employee.philhealthNumber.slice(-4)}` : '—',
      pagibig: p.employee.pagibigNumber ? `XXXX-XXXX-${p.employee.pagibigNumber.slice(-4)}` : '—',
      is_mwe: (p.employee as any).isMwe || false,
    },
    pay_period: {
      start: toLocalDateString(p.period.startDate),
      end: toLocalDateString(p.period.endDate),
      payment_date: p.entry!.paidAt
        ? toLocalDateString(new Date(p.entry!.paidAt))
        : getPaymentDateString(p.period.endDate),
      frequency: 'semi-monthly',
    },
    earnings,
    deductions,
    gross: parseFloat(String(p.entry!.grossPay || 0)),
    total_deductions: parseFloat(String(p.entry!.totalDeductions || (p.entry! as any).deductions || 0)),
    net_pay: parseFloat(String(p.entry!.netPay || 0)),
    ytd: { gross: 0, deductions: 0, net: 0 },
    employer_contributions: employerContributions,
    payment_method: {
      type: (companyDbSettings?.paymentMethod as any) || 'Bank Transfer',
      bank: companyDbSettings?.bankName || '',
      account_last4: companyDbSettings?.bankAccountNo
        ? '****' + companyDbSettings.bankAccountNo.slice(-4)
        : '****',
    },
    verification_code: p.verificationHash,
    generated_at: new Date().toISOString(),
    rates_effective_from: p.ratesEffectiveFrom,
    tamper_hash: `sha256:${p.verificationHash}`,
  };
}

// Auth middleware for payslip routes
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  next();
};

// Role check for manager/admin
const requireManagerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  const role = req.session.user.role;
  if (role !== 'manager' && role !== 'admin') {
    return res.status(403).json({ success: false, error: "Manager or Admin access required" });
  }
  next();
};

// Audit log storage (persistent via DB audit system)
// Uses createAuditLog() for database-backed audit trail

// Store verification records (in production, use database)
const verificationRecords: Map<string, {
  payslip_id: string;
  employee_id: string;
  timestamp: number;
  hash: string;
  employee_name: string;
  pay_period: string;
  net_pay: number;
  payment_date: string;
}> = new Map();

/**
 * GET /api/payslips/entry/:entryId
 * Get payslip data from a payroll entry
 * Access: Employee can view their own, Manager/Admin can view any
 */
router.get('/entry/:entryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;
    const currentUser = req.session.user!;
    
    // Get the payroll entry
    const entry = await storage.getPayrollEntry(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Payroll entry not found' });
    }
    
    // Get the employee
    const employee = await storage.getUser(entry.userId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    
    // Access control: employees can only view their own payslips
    if (currentUser.role === 'employee' && entry.userId !== currentUser.id) {
      return res.status(403).json({ success: false, error: 'Access denied. You can only view your own payslips.' });
    }

    // Managers can only view payslips of employees in their own branch
    if (currentUser.role === 'manager' && employee.branchId !== currentUser.branchId) {
      return res.status(403).json({ success: false, error: 'Access denied. Employee is not in your branch.' });
    }

    // Get the payroll period
    const period = await storage.getPayrollPeriod(entry.payrollPeriodId);
    if (!period) {
      return res.status(404).json({ success: false, error: 'Payroll period not found' });
    }
    
    // Get deduction rates for effective date display
    const deductionRates = await storage.getAllDeductionRates();
const ratesEffectiveFrom = (deductionRates.length > 0 && deductionRates[0].createdAt)
      ? toLocalDateString(deductionRates[0].createdAt)
      : '2025-01-01';
    
    // Parse pay breakdown if available
    let payBreakdown: any = {};
    if (entry.payBreakdown) {
      try {
        payBreakdown = JSON.parse(entry.payBreakdown);
      } catch (e) {
        console.error('Error parsing pay breakdown:', e);
      }
    }
    
    // Generate payslip ID
    const payslipId = `DM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${entryId.substring(0, 6).toUpperCase()}`;
    
    // Generate tamper hash
    const timestamp = Date.now();
    const tamperHash = generatePayslipHash(payslipId, employee.id, timestamp);
    
    const payslipData = await buildPayslipData({ entry, employee, period, ratesEffectiveFrom, payslipId, verificationHash: tamperHash });
    
    // Store verification record
    verificationRecords.set(payslipId, {
      payslip_id: payslipId,
      employee_id: employee.id,
      timestamp,
      hash: tamperHash,
      employee_name: `${employee.firstName} ${employee.lastName}`,
      pay_period: `${toLocalDateString(period.startDate)} - ${toLocalDateString(period.endDate)}`,
      net_pay: parseFloat(String(entry.netPay || 0)),
      payment_date: toLocalDateString(new Date()),
    });
    // Cap verification records to prevent unbounded memory growth
    if (verificationRecords.size > 10000) {
      const keysToDelete = [...verificationRecords.keys()].slice(0, verificationRecords.size - 5000);
      keysToDelete.forEach(k => verificationRecords.delete(k));
    }
    
    res.json({
      success: true,
      payslip: payslipData,
    });
    
  } catch (error) {
    console.error('Error generating payslip from entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate payslip',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/payslips/audit-log
 * Log payslip access for audit trail
 */
router.post('/audit-log', requireAuth, async (req: Request, res: Response) => {
  try {
    const { action, payslip_id, employee_id, payroll_entry_id } = req.body;
    const currentUser = req.session.user!;
    
    const auditEntry = {
      action: action || 'payslip_view',
      entityType: 'payslip',
      entityId: payslip_id || '',
      userId: currentUser.id,
      newValues: {
        employee_id: employee_id || '',
        payroll_entry_id: payroll_entry_id || '',
        action: action || 'view',
      },
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'],
    };
    
    await createAuditLog(auditEntry);
    
    res.json({ success: true, logged: true });
  } catch (error) {
    console.error('Error logging audit event:', error);
    res.status(500).json({ success: false, error: 'Failed to log audit event' });
  }
});

/**
 * GET /api/payslips/audit-log
 * Get audit logs (Manager/Admin only)
 */
router.get('/audit-log', requireManagerOrAdmin, async (req: Request, res: Response) => {
  try {
    const { employee_id, limit = 100 } = req.query;
    
    // Use the DB audit log system
    const logs = await storage.getAuditLogs({
      entityType: 'payslip',
      limit: Number(limit),
      offset: 0,
    });
    
    let filteredLogs = logs;
    if (employee_id) {
      filteredLogs = logs.filter(l => {
        try {
          const vals = l.newValues ? JSON.parse(l.newValues) : {};
          return vals.employee_id === employee_id;
        } catch { return false; }
      });
    }
    
    // Sort by timestamp descending
    const sortedLogs = filteredLogs
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    
    res.json({ success: true, logs: sortedLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

/**
 * POST /api/payslips/generate-pdf
 * Generate a PDF payslip from a payroll entry ID.
 * All payslip data is sourced from the database — client-supplied financial figures are never trusted.
 */
router.post('/generate-pdf', requireAuth, async (req: Request, res: Response) => {
  try {
    const { entryId, format = 'pdf', include_qr = true } = req.body;

    if (!entryId) {
      return res.status(400).json({ success: false, error: 'entryId is required' });
    }

    const currentUser = req.session.user!;

    const entry = await storage.getPayrollEntry(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Payroll entry not found' });
    }

    const employee = await storage.getUser(entry.userId);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    if (currentUser.role === 'employee' && entry.userId !== currentUser.id) {
      return res.status(403).json({ success: false, error: 'Access denied. You can only generate your own payslip.' });
    }
    if (currentUser.role === 'manager' && employee.branchId !== currentUser.branchId) {
      return res.status(403).json({ success: false, error: 'Access denied. Employee is not in your branch.' });
    }

    const period = await storage.getPayrollPeriod(entry.payrollPeriodId);
    if (!period) {
      return res.status(404).json({ success: false, error: 'Payroll period not found' });
    }

    const deductionRates = await storage.getAllDeductionRates();
    const ratesEffectiveFrom = (deductionRates.length > 0 && deductionRates[0].createdAt)
      ? toLocalDateString(deductionRates[0].createdAt)
      : '2025-01-01';

    const payslipId = `DM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${entryId.substring(0, 6).toUpperCase()}`;
    const timestamp = Date.now();
    const hash = generatePayslipHash(payslipId, employee.id, timestamp);

    const data = await buildPayslipData({ entry, employee, period, ratesEffectiveFrom, payslipId, verificationHash: hash });

    verificationRecords.set(payslipId, {
      payslip_id: payslipId,
      employee_id: employee.id,
      timestamp,
      hash,
      employee_name: `${employee.firstName} ${employee.lastName}`,
      pay_period: `${toLocalDateString(period.startDate)} - ${toLocalDateString(period.endDate)}`,
      net_pay: parseFloat(String(entry.netPay || 0)),
      payment_date: toLocalDateString(new Date()),
    });

    const pdfBytes = await generatePayslipPDF(data, {
      includeQR: include_qr,
      includeVerification: true,
      verificationBaseUrl: `${req.protocol}://${req.get('host')}/api/payslips/verify`,
    });

    if (format === 'json') {
      return res.json({
        success: true,
        payslip_id: payslipId,
        verification_code: hash,
        verification_url: `${req.protocol}://${req.get('host')}/api/payslips/verify?payslip_id=${payslipId}&hash=${hash}`,
        data,
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${payslipId}.pdf"`);
    res.setHeader('Content-Length', pdfBytes.length);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Error generating payslip PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate payslip PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/payslips/verify
 * Verify payslip authenticity
 */
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const { payslip_id, hash } = req.query;
    
    if (!payslip_id || !hash) {
      return res.status(400).json({
        valid: false,
        error: 'payslip_id and hash are required',
      });
    }
    
    // Look up verification record
    const record = verificationRecords.get(payslip_id as string);
    
    if (!record) {
      return res.status(404).json({
        valid: false,
        error: 'Payslip not found in verification records',
      });
    }
    
    // Verify hash
    const isValid = record.hash === hash;
    
    if (isValid) {
      return res.json({
        valid: true,
        payslip_summary: {
          payslip_id: record.payslip_id,
          employee_name: record.employee_name,
          pay_period: record.pay_period,
          net_pay: record.net_pay,
          payment_date: record.payment_date,
          generated_at: new Date(record.timestamp).toISOString(),
        },
      });
    } else {
      return res.json({
        valid: false,
        error: 'Invalid verification hash',
      });
    }
    
  } catch (error) {
    console.error('Error verifying payslip:', error);
    res.status(500).json({
      valid: false,
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/payslips/sample
 * Get sample payslip data for testing
 */
router.get('/sample', requireAuth, async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: SAMPLE_PAYSLIP_DATA,
  });
});

/**
 * GET /api/payslips/sample-pdf
 * Generate sample PDF for testing
 */
router.get('/sample-pdf', requireAuth, async (req: Request, res: Response) => {
  try {
    // Generate sample payslip
    const sampleData = { ...SAMPLE_PAYSLIP_DATA };
    sampleData.generated_at = new Date().toISOString();
    
    const pdfBytes = await generatePayslipPDF(sampleData, {
      includeQR: true,
      includeVerification: true,
      verificationBaseUrl: `${req.protocol}://${req.get('host')}/api/payslips/verify`,
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="sample-payslip.pdf"');
    res.setHeader('Content-Length', pdfBytes.length);
    res.send(Buffer.from(pdfBytes));
    
  } catch (error) {
    console.error('Error generating sample PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sample PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
