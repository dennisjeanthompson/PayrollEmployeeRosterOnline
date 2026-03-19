/**
 * 13th Month Pay Routes (Presidential Decree 851 / RA 7641)
 * Provides running totals of basic pay earned per employee per year.
 * 13th Month = SUM(basicPayEarned Jan–Dec) / 12
 *
 * Only basicPay is counted — OT, Holiday, Night Diff are excluded per BIR rules.
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  thirteenthMonthLedger,
  users,
  branches,
} from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { format } from 'date-fns';

const router = Router();

const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) return res.status(401).json({ message: 'Not authenticated' });
  req.user = req.session.user;
  next();
};

const requireManagerRole = (req: Request, res: Response, next: Function) => {
  if (req.user?.role !== 'manager' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

// ─── GET /api/thirteenth-month/summary?year=2025 ──────────────────────────────
// Returns per-employee: totalBasicPaid, projectedThirteenthMonth, monthsCovered
router.get('/api/thirteenth-month/summary', requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    if (isNaN(year) || year < 2020 || year > 2100) {
      return res.status(400).json({ message: 'Invalid year' });
    }

    // Get all ledger entries for this branch/year
    const entries = await db
      .select()
      .from(thirteenthMonthLedger)
      .where(
        and(
          eq(thirteenthMonthLedger.branchId, branchId),
          eq(thirteenthMonthLedger.year, year)
        )
      )
      .orderBy(desc(thirteenthMonthLedger.periodStartDate));

    // Group by employee
    const byEmployee = new Map<string, {
      userId: string;
      totalBasicPaid: number;
      periods: number;
      earliestPeriod: Date | null;
      latestPeriod: Date | null;
    }>();

    for (const entry of entries) {
      const existing = byEmployee.get(entry.userId);
      const basicPay = parseFloat(entry.basicPayEarned) || 0;
      const periodEnd = new Date(entry.periodEndDate);
      const periodStart = new Date(entry.periodStartDate);

      if (!existing) {
        byEmployee.set(entry.userId, {
          userId: entry.userId,
          totalBasicPaid: basicPay,
          periods: 1,
          earliestPeriod: periodStart,
          latestPeriod: periodEnd,
        });
      } else {
        existing.totalBasicPaid += basicPay;
        existing.periods += 1;
        if (!existing.earliestPeriod || periodStart < existing.earliestPeriod) {
          existing.earliestPeriod = periodStart;
        }
        if (!existing.latestPeriod || periodEnd > existing.latestPeriod) {
          existing.latestPeriod = periodEnd;
        }
      }
    }

    // Enrich with employee names
    const branchUsers = await db.select().from(users).where(eq(users.branchId, branchId));
    const userMap = new Map(branchUsers.map(u => [u.id, u]));

    const summary = Array.from(byEmployee.values()).map(emp => {
      const user = userMap.get(emp.userId);
      const projectedThirteenthMonth = Math.round((emp.totalBasicPaid / 12) * 100) / 100;

      return {
        userId: emp.userId,
        employeeName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        position: user?.position || '',
        year,
        totalBasicPaid: Math.round(emp.totalBasicPaid * 100) / 100,
        projectedThirteenthMonth,
        periodsCount: emp.periods,
        earliestPeriod: emp.earliestPeriod?.toISOString() || null,
        latestPeriod: emp.latestPeriod?.toISOString() || null,
      };
    });

    // Sort by employee name
    summary.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    res.json({ summary, year });
  } catch (error: any) {
    console.error('Error fetching 13th month summary:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch 13th month summary' });
  }
});

// ─── GET /api/thirteenth-month/export?year=2025 ───────────────────────────────
// Returns a CSV for BIR reporting
router.get('/api/thirteenth-month/export', requireAuth, requireManagerRole, async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const entries = await db
      .select()
      .from(thirteenthMonthLedger)
      .where(
        and(
          eq(thirteenthMonthLedger.branchId, branchId),
          eq(thirteenthMonthLedger.year, year)
        )
      );

    const branchUsers = await db.select().from(users).where(eq(users.branchId, branchId));
    const userMap = new Map(branchUsers.map(u => [u.id, u]));

    // Aggregate by employee
    const byEmployee = new Map<string, number>();
    for (const entry of entries) {
      const existing = byEmployee.get(entry.userId) || 0;
      byEmployee.set(entry.userId, existing + (parseFloat(entry.basicPayEarned) || 0));
    }

    const escapeCSV = (v: any) => {
      const str = String(v ?? '');
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const headerMeta = [
      'PERO PAYROLL SYSTEM \u2014 13TH MONTH PAY LEDGER EXPORT',
      `Year: ${year}`,
      `Generated: ${format(new Date(), 'MMMM d yyyy HH:mm')}`,
      '',
    ].join('\n');

    const header = ['Employee Name', 'Position', 'TIN', 'Total Basic Pay (PHP)', 'Projected 13th Month (PHP)'].map(escapeCSV).join(',');

    const rows = Array.from(byEmployee.entries()).map(([userId, totalBasicPaid]) => {
      const user = userMap.get(userId);
      const projected = totalBasicPaid / 12;
      return [
        user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        user?.position || '',
        (user as any)?.tin || '',
        peso(Math.round(totalBasicPaid * 100) / 100),
        peso(Math.round(projected * 100) / 100),
      ].map(escapeCSV).join(',');
    });

    const csv = '\uFEFF' + [headerMeta, header, ...rows].join('\n');
    const filename = `13th_month_${year}_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(csv, 'utf8'));
  } catch (error: any) {
    console.error('Error exporting 13th month:', error);
    res.status(500).json({ message: error.message || 'Failed to export 13th month data' });
  }
});

export { router as thirteenthMonthRouter };
