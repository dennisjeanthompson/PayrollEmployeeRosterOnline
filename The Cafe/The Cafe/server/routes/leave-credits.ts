/**
 * Leave Credits Routes (DOLE Labor Standards)
 * Manages SIL (5 days), Solo Parent Leave (7 days), VAWC Leave (10 days), etc.
 * Employees view their own balance; Managers grant and edit credits.
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { leaveCredits, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// ─── Leave type config ────────────────────────────────────────────────────────
export const LEAVE_TYPE_CONFIG: Record<string, { label: string; defaultDays: number; color: string; description: string }> = {
  sil: {
    label: 'Service Incentive Leave',
    defaultDays: 5,
    color: '#4caf50',
    description: 'Mandated 5 days paid SIL after 1 year of service (Art. 95, Labor Code)',
  },
  solo_parent: {
    label: 'Solo Parent Leave',
    defaultDays: 7,
    color: '#2196f3',
    description: '7 days paid leave for solo parents (RA 8972)',
  },
  vawc: {
    label: 'VAWC Leave',
    defaultDays: 10,
    color: '#9c27b0',
    description: '10 days paid leave for VAWC victims (RA 9262)',
  },
  vacation: {
    label: 'Vacation Leave',
    defaultDays: 0,
    color: '#ff9800',
    description: 'Company discretionary vacation leave',
  },
  sick: {
    label: 'Sick Leave',
    defaultDays: 0,
    color: '#f44336',
    description: 'Company discretionary sick leave',
  },
  other: {
    label: 'Other Leave',
    defaultDays: 0,
    color: '#607d8b',
    description: 'Other leave types',
  },
};

// ─── GET /api/leave-credits/my ───────────────────────────────────────────────
// Employee: view own leave balances for current year
router.get('/api/leave-credits/my', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const credits = await db
      .select()
      .from(leaveCredits)
      .where(and(eq(leaveCredits.userId, userId), eq(leaveCredits.year, year)))
      .orderBy(leaveCredits.leaveType);

    // Enrich with label info
    const enriched = credits.map(c => ({
      ...c,
      leaveTypeConfig: LEAVE_TYPE_CONFIG[c.leaveType] || LEAVE_TYPE_CONFIG.other,
    }));

    res.json({ credits: enriched, year });
  } catch (error: any) {
    console.error('[/api/leave-credits/my] FULL ERROR:', error);
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ credits: [], year: new Date().getFullYear() });
    }
    res.status(500).json({ message: error.message || 'Failed to fetch leave credits' });
  }
});

// ─── GET /api/leave-credits/branch?year=2025 ─────────────────────────────────
// Manager: view all employees' leave balances for the branch
router.get('/api/leave-credits/branch', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const branchId = req.user!.branchId;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const credits = await db
      .select()
      .from(leaveCredits)
      .where(and(eq(leaveCredits.branchId, branchId), eq(leaveCredits.year, year)))
      .orderBy(desc(leaveCredits.createdAt));

    // Enrich with employee names
    const branchUsers = await db.select().from(users).where(eq(users.branchId, branchId));
    const userMap = new Map(branchUsers.map(u => [u.id, u]));

    const enriched = credits.map(c => {
      const user = userMap.get(c.userId);
      return {
        ...c,
        employeeName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        position: user?.position || '',
        leaveTypeConfig: LEAVE_TYPE_CONFIG[c.leaveType] || LEAVE_TYPE_CONFIG.other,
      };
    });

    res.json({ credits: enriched, year });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ credits: [], year: new Date().getFullYear() });
    }
    res.status(500).json({ message: error.message || 'Failed to fetch branch leave credits' });
  }
});

// ─── POST /api/leave-credits/grant ──────────────────────────────────────────
// Manager: grant leave credits to an employee
router.post('/api/leave-credits/grant', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { userId, leaveType, totalCredits, year, notes } = req.body;
    const branchId = req.user!.branchId;
    const grantedBy = req.user!.id;

    if (!userId || !leaveType || totalCredits === undefined || totalCredits === null) {
      return res.status(400).json({ message: 'userId, leaveType, and totalCredits are required' });
    }

    const validTypes = Object.keys(LEAVE_TYPE_CONFIG);
    if (!validTypes.includes(leaveType)) {
      return res.status(400).json({ message: `Invalid leaveType. Valid: ${validTypes.join(', ')}` });
    }

    const credits = parseFloat(totalCredits);
    if (isNaN(credits) || credits < 0) {
      return res.status(400).json({ message: 'totalCredits must be a non-negative number' });
    }

    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Verify employee belongs to manager's branch
    const employee = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!employee[0]) return res.status(404).json({ message: 'Employee not found' });
    if (employee[0].branchId !== branchId) {
      return res.status(403).json({ message: 'Employee is not in your branch' });
    }

    // Check if a credit row already exists for this employee/year/type
    const existing = await db
      .select()
      .from(leaveCredits)
      .where(
        and(
          eq(leaveCredits.userId, userId),
          eq(leaveCredits.year, targetYear),
          eq(leaveCredits.leaveType, leaveType)
        )
      )
      .limit(1);

    if (existing[0]) {
      // Update the existing row
      const used = parseFloat(existing[0].usedCredits || '0');
      const remaining = Math.max(0, credits - used);

      await db.update(leaveCredits).set({
        totalCredits: credits.toFixed(2),
        remainingCredits: remaining.toFixed(2),
        grantedBy,
        notes: notes || existing[0].notes,
        updatedAt: new Date(),
      }).where(eq(leaveCredits.id, existing[0].id));

      const updated = await db.select().from(leaveCredits).where(eq(leaveCredits.id, existing[0].id)).limit(1);
      return res.json({ credit: updated[0], message: 'Leave credits updated' });
    }

    // Create new row
    const id = randomUUID();
    await db.insert(leaveCredits).values({
      id,
      userId,
      branchId,
      year: targetYear,
      leaveType,
      totalCredits: credits.toFixed(2),
      usedCredits: '0',
      remainingCredits: credits.toFixed(2),
      grantedBy,
      notes: notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await db.select().from(leaveCredits).where(eq(leaveCredits.id, id)).limit(1);
    res.status(201).json({ credit: created[0], message: 'Leave credits granted' });
  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.status(503).json({ message: 'Leave credits table not yet migrated. Run db:push first.' });
    }
    console.error('Error granting leave credits:', error);
    res.status(500).json({ message: error.message || 'Failed to grant leave credits' });
  }
});

// ─── PUT /api/leave-credits/:id ──────────────────────────────────────────────
// Manager: edit a leave credit row
router.put('/api/leave-credits/:id', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const branchId = req.user!.branchId;

    const existing = await db.select().from(leaveCredits).where(eq(leaveCredits.id, id)).limit(1);
    if (!existing[0]) return res.status(404).json({ message: 'Leave credit not found' });
    if (existing[0].branchId !== branchId) {
      return res.status(403).json({ message: 'Not authorized for this branch' });
    }

    const { totalCredits, usedCredits, notes } = req.body;

    const total = totalCredits !== undefined ? parseFloat(totalCredits) : parseFloat(existing[0].totalCredits);
    const used = usedCredits !== undefined ? parseFloat(usedCredits) : parseFloat(existing[0].usedCredits || '0');
    const remaining = Math.max(0, total - used);

    await db.update(leaveCredits).set({
      totalCredits: total.toFixed(2),
      usedCredits: used.toFixed(2),
      remainingCredits: remaining.toFixed(2),
      notes: notes !== undefined ? notes : existing[0].notes,
      updatedAt: new Date(),
    }).where(eq(leaveCredits.id, id));

    const updated = await db.select().from(leaveCredits).where(eq(leaveCredits.id, id)).limit(1);
    res.json({ credit: updated[0] });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update leave credit' });
  }
});

// ─── Internal helper: deduct leave on time-off approval ──────────────────────
// Called by the time-off approval route (not an HTTP endpoint)
export async function deductLeaveCredit(
  userId: string,
  branchId: string,
  leaveType: string,
  daysToDeduct: number,
  year: number
): Promise<{ success: boolean; warning?: string }> {
  try {
    // Map time-off types to leave credit types
    const typeMap: Record<string, string> = {
      vacation: 'vacation',
      sick: 'sick',
      sil: 'sil',
      solo_parent: 'solo_parent',
      vawc: 'vawc',
      other: 'other',
      emergency: 'other',
      personal: 'other',
    };
    const creditType = typeMap[leaveType] || 'other';

    const existing = await db
      .select()
      .from(leaveCredits)
      .where(
        and(
          eq(leaveCredits.userId, userId),
          eq(leaveCredits.year, year),
          eq(leaveCredits.leaveType, creditType)
        )
      )
      .limit(1);

    if (!existing[0]) {
      return {
        success: true,
        warning: `No ${creditType} leave credit balance found for ${year}. Leave approved without deduction.`,
      };
    }

    const current = existing[0];
    const used = parseFloat(current.usedCredits || '0');
    const remaining = parseFloat(current.remainingCredits);

    const newUsed = used + daysToDeduct;
    const newRemaining = Math.max(0, remaining - daysToDeduct);

    await db.update(leaveCredits).set({
      usedCredits: newUsed.toFixed(2),
      remainingCredits: newRemaining.toFixed(2),
      updatedAt: new Date(),
    }).where(eq(leaveCredits.id, current.id));

    const warning = daysToDeduct > remaining
      ? `Leave exceeded balance by ${(daysToDeduct - remaining).toFixed(1)} days. Balance is now negative.`
      : undefined;

    return { success: true, warning };
  } catch (error) {
    // Do not block approval if deduction fails — just warn
    console.error('Leave credit deduction failed (non-blocking):', error);
    return { success: true, warning: 'Leave credit deduction could not be recorded.' };
  }
}

export { router as leaveCreditsRouter };
