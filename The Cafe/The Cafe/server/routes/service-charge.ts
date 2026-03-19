/**
 * Service Charge Distribution Routes (RA 11360)
 * 100% of collected service charges must be distributed to rank-and-file employees.
 * Managers excluded from distribution per RA 11360.
 *
 * Flow:
 *  1. Manager creates a pool (enters totalCollected, selects date range)
 *  2. System auto-calculates eligible headcount and perEmployeeAmount
 *  3. Manager distributes — credits each eligible payroll entry's serviceCharge field
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { serviceChargePools, users, payrollEntries, payrollPeriods } from '@shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// ─── GET /api/service-charge/pools ───────────────────────────────────────────
// Manager: list all service charge pools for branch
router.get('/api/service-charge/pools', requireAuth, requireRole(['manager']), async (req, res) => {
  try {
    const branchId = req.user!.branchId;

    const pools = await db
      .select()
      .from(serviceChargePools)
      .where(eq(serviceChargePools.branchId, branchId))
      .orderBy(desc(serviceChargePools.createdAt));

    res.json({ pools });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ pools: [] });
    }
    res.status(500).json({ message: error.message || 'Failed to fetch service charge pools' });
  }
});

// ─── POST /api/service-charge/pools ──────────────────────────────────────────
// Manager: create a new service charge pool (draft)
router.post('/api/service-charge/pools', requireAuth, requireRole(['manager']), async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const createdBy = req.user!.id;
    const { totalCollected, periodStartDate, periodEndDate } = req.body;

    if (!totalCollected || !periodStartDate || !periodEndDate) {
      return res.status(400).json({ message: 'totalCollected, periodStartDate, and periodEndDate are required' });
    }

    const total = parseFloat(totalCollected);
    if (isNaN(total) || total <= 0) {
      return res.status(400).json({ message: 'totalCollected must be a positive number' });
    }

    const start = new Date(periodStartDate);
    const end = new Date(periodEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    // Rank-and-file = employees with role 'employee' who are active in this branch
    const eligibleEmployees = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.branchId, branchId),
          eq(users.isActive, true),
          eq(users.role, 'employee')
        )
      );

    const eligibleCount = eligibleEmployees.length;
    if (eligibleCount === 0) {
      return res.status(400).json({ message: 'No eligible rank-and-file employees found in this branch' });
    }

    const perEmployee = Math.round((total / eligibleCount) * 100) / 100;

    const id = randomUUID();
    await db.insert(serviceChargePools).values({
      id,
      branchId,
      periodStartDate: start,
      periodEndDate: end,
      totalCollected: total.toFixed(2),
      eligibleEmployeeCount: eligibleCount,
      perEmployeeAmount: perEmployee.toFixed(2),
      status: 'draft',
      createdBy,
      createdAt: new Date(),
    });

    const pool = await db.select().from(serviceChargePools).where(eq(serviceChargePools.id, id)).limit(1);

    res.status(201).json({
      pool: pool[0],
      eligibleEmployees: eligibleEmployees.map(e => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        position: e.position,
      })),
      message: `Pool created. ₱${total.toLocaleString()} ÷ ${eligibleCount} employees = ₱${perEmployee.toLocaleString()} each`,
    });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.status(503).json({ message: 'Service charge table not yet migrated. Run db:push first.' });
    }
    console.error('Error creating service charge pool:', error);
    res.status(500).json({ message: error.message || 'Failed to create service charge pool' });
  }
});

// ─── POST /api/service-charge/pools/:id/distribute ───────────────────────────
// Manager: distribute the pool — credits each eligible employee's most recent payroll entry
router.post('/api/service-charge/pools/:id/distribute', requireAuth, requireRole(['manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.user!.branchId;

    const pool = await db.select().from(serviceChargePools).where(eq(serviceChargePools.id, id)).limit(1);
    if (!pool[0]) return res.status(404).json({ message: 'Pool not found' });
    if (pool[0].branchId !== branchId) return res.status(403).json({ message: 'Not authorized' });
    if (pool[0].status === 'distributed') {
      return res.status(400).json({ message: 'This pool has already been distributed' });
    }

    const perEmployee = parseFloat(pool[0].perEmployeeAmount);
    const periodStart = new Date(pool[0].periodStartDate);
    const periodEnd = new Date(pool[0].periodEndDate);

    // Get all active rank-and-file employees in branch
    const eligibleEmployees = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.branchId, branchId),
          eq(users.isActive, true),
          eq(users.role, 'employee')
        )
      );

    // Find payroll periods overlapping with the pool date range
    const overlappingPeriods = await db
      .select()
      .from(payrollPeriods)
      .where(
        and(
          eq(payrollPeriods.branchId, branchId),
          gte(payrollPeriods.endDate, periodStart),
          lte(payrollPeriods.startDate, periodEnd)
        )
      );

    const periodIds = new Set(overlappingPeriods.map(p => p.id));

    let distributedCount = 0;
    const results: { employeeId: string; employeeName: string; amount: string; status: string }[] = [];

    for (const employee of eligibleEmployees) {
      // Find the most recent payroll entry within the period range for this employee
      const entries = await db
        .select()
        .from(payrollEntries)
        .where(eq(payrollEntries.userId, employee.id))
        .orderBy(desc(payrollEntries.createdAt));

      const matchingEntry = entries.find(e => periodIds.has(e.payrollPeriodId));

      if (matchingEntry) {
        // Update service charge on the entry
        const currentSC = parseFloat(matchingEntry.serviceCharge || '0');
        const newSC = Math.round((currentSC + perEmployee) * 100) / 100;

        // Update netPay to include service charge
        const currentNet = parseFloat(matchingEntry.netPay || '0');
        const newNet = Math.round((currentNet + perEmployee) * 100) / 100;

        await db.update(payrollEntries)
          .set({
            serviceCharge: newSC.toFixed(2),
            netPay: newNet.toFixed(2),
          })
          .where(eq(payrollEntries.id, matchingEntry.id));

        distributedCount++;
        results.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          amount: `₱${perEmployee.toFixed(2)}`,
          status: 'credited',
        });
      } else {
        results.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          amount: `₱${perEmployee.toFixed(2)}`,
          status: 'no_payroll_entry_found',
        });
      }
    }

    // Mark pool as distributed
    await db.update(serviceChargePools).set({
      status: 'distributed',
      distributedAt: new Date(),
    }).where(eq(serviceChargePools.id, id));

    res.json({
      message: `Service charge distributed to ${distributedCount} of ${eligibleEmployees.length} employees`,
      distributedCount,
      totalEmployees: eligibleEmployees.length,
      perEmployeeAmount: perEmployee,
      results,
    });
  } catch (error: any) {
    console.error('Error distributing service charge:', error);
    res.status(500).json({ message: error.message || 'Failed to distribute service charge' });
  }
});

// ─── DELETE /api/service-charge/pools/:id ────────────────────────────────────
// Manager: delete a draft pool only
router.delete('/api/service-charge/pools/:id', requireAuth, requireRole(['manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.user!.branchId;

    const pool = await db.select().from(serviceChargePools).where(eq(serviceChargePools.id, id)).limit(1);
    if (!pool[0]) return res.status(404).json({ message: 'Pool not found' });
    if (pool[0].branchId !== branchId) return res.status(403).json({ message: 'Not authorized' });
    if (pool[0].status === 'distributed') {
      return res.status(400).json({ message: 'Cannot delete a distributed pool' });
    }

    await db.delete(serviceChargePools).where(eq(serviceChargePools.id, id));
    res.json({ message: 'Pool deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete pool' });
  }
});

export { router as serviceChargeRouter };
