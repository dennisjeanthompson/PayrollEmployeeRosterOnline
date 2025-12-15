/**
 * Holidays API Routes
 * DOLE-compliant Philippine holiday management for The Café
 * Supports admin/manager CRUD with role-based access control
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dbStorage as storage } from '../db-storage';
import { requireAuth, requireRole } from '../middleware/auth';
import { randomUUID } from 'crypto';
import { insertHolidaySchema, Holiday } from '@shared/schema';

const router = Router();

// Types for holiday pay rules (used in tooltips)
const HOLIDAY_PAY_RULES: Record<string, { worked: string; notWorked: string }> = {
  regular: { worked: '+100% premium (200% total)', notWorked: 'Paid holiday (100%)' },
  special_non_working: { worked: '+30% premium (130% total)', notWorked: 'No work, no pay' },
  special_working: { worked: 'Normal rate (100%)', notWorked: 'Normal rate' },
  company: { worked: 'Per company policy', notWorked: 'Per company policy' },
};

// GET /api/holidays - List all holidays (optionally filtered by year or date range)
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { year, startDate, endDate } = req.query;

    let holidaysList: Holiday[];

    if (year) {
      holidaysList = await storage.getHolidaysByYear(parseInt(year as string));
    } else if (startDate && endDate) {
      holidaysList = await storage.getHolidays(new Date(startDate as string), new Date(endDate as string));
    } else {
      holidaysList = await storage.getHolidays();
    }

    // Add pay rule info to each holiday for frontend tooltips
    const holidaysWithPayRules = holidaysList.map(holiday => ({
      ...holiday,
      payRule: HOLIDAY_PAY_RULES[holiday.type] || HOLIDAY_PAY_RULES.special_working,
    }));

    res.json({ holidays: holidaysWithPayRules });
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Failed to fetch holidays' });
  }
});

// GET /api/holidays/check-date/:date - Check if a specific date is a holiday
router.get('/check-date/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    const dateParam = req.params.date;
    const checkDate = new Date(dateParam);

    if (isNaN(checkDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const holiday = await storage.getHolidayByDate(checkDate);

    if (holiday) {
      res.json({
        isHoliday: true,
        holiday: {
          ...holiday,
          payRule: HOLIDAY_PAY_RULES[holiday.type] || HOLIDAY_PAY_RULES.special_working,
        },
        workAllowed: holiday.workAllowed ?? true,
      });
    } else {
      res.json({
        isHoliday: false,
        holiday: null,
        workAllowed: true,
      });
    }
  } catch (error) {
    console.error('Error checking holiday date:', error);
    res.status(500).json({ message: 'Failed to check holiday date' });
  }
});

// GET /api/holidays/:id - Get a single holiday
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const holiday = await storage.getHoliday(req.params.id);

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    res.json({
      holiday: {
        ...holiday,
        payRule: HOLIDAY_PAY_RULES[holiday.type] || HOLIDAY_PAY_RULES.special_working,
      },
    });
  } catch (error) {
    console.error('Error fetching holiday:', error);
    res.status(500).json({ message: 'Failed to fetch holiday' });
  }
});

// POST /api/holidays - Create a new holiday (admin/manager only)
router.post('/', requireAuth, requireRole(['admin', 'manager']), async (req: Request, res: Response) => {
  try {
    const validatedData = insertHolidaySchema.parse(req.body);

    const holiday = await storage.createHoliday({
      ...validatedData,
      workAllowed: validatedData.workAllowed ?? true,
    });

    // Create audit log
    await storage.createAuditLog({
      id: randomUUID(),
      action: 'create',
      entityType: 'holiday',
      entityId: holiday.id,
      userId: req.session?.user?.id || 'system',
      oldValues: null,
      newValues: JSON.stringify(holiday),
      reason: 'Holiday created',
    });

    res.status(201).json({ holiday, message: 'Holiday created successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating holiday:', error);
    res.status(500).json({ message: 'Failed to create holiday' });
  }
});

// PUT /api/holidays/:id - Update a holiday (admin/manager only)
router.put('/:id', requireAuth, requireRole(['admin', 'manager']), async (req: Request, res: Response) => {
  try {
    const existingHoliday = await storage.getHoliday(req.params.id);

    if (!existingHoliday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    const validatedData = insertHolidaySchema.partial().parse(req.body);

    const updatedHoliday = await storage.updateHoliday(req.params.id, validatedData);

    // Create audit log
    await storage.createAuditLog({
      id: randomUUID(),
      action: 'update',
      entityType: 'holiday',
      entityId: req.params.id,
      userId: req.session?.user?.id || 'system',
      oldValues: JSON.stringify(existingHoliday),
      newValues: JSON.stringify(updatedHoliday),
      reason: 'Holiday updated',
    });

    res.json({ holiday: updatedHoliday, message: 'Holiday updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating holiday:', error);
    res.status(500).json({ message: 'Failed to update holiday' });
  }
});

// DELETE /api/holidays/:id - Delete a holiday (admin/manager only)
router.delete('/:id', requireAuth, requireRole(['admin', 'manager']), async (req: Request, res: Response) => {
  try {
    const existingHoliday = await storage.getHoliday(req.params.id);

    if (!existingHoliday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    await storage.deleteHoliday(req.params.id);

    // Create audit log
    await storage.createAuditLog({
      id: randomUUID(),
      action: 'delete',
      entityType: 'holiday',
      entityId: req.params.id,
      userId: req.session?.user?.id || 'system',
      oldValues: JSON.stringify(existingHoliday),
      newValues: null,
      reason: 'Holiday deleted',
    });

    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ message: 'Failed to delete holiday' });
  }
});

// POST /api/holidays/seed-2025 - Seed 2025 holidays (admin only)
router.post('/seed-2025', requireAuth, requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    // Check if 2025 holidays already exist
    const existing2025 = await storage.getHolidaysByYear(2025);

    if (existing2025.length > 0) {
      return res.status(400).json({ 
        message: '2025 holidays already exist. Delete them first to re-seed.',
        count: existing2025.length 
      });
    }

    // 2025 Philippine Holidays (Proclamation 727)
    const holidays2025 = [
      // Regular Holidays
      { name: "New Year's Day", date: '2025-01-01', type: 'regular', isRecurring: true },
      { name: 'Araw ng Kagitingan', date: '2025-04-09', type: 'regular', isRecurring: true },
      { name: 'Maundy Thursday', date: '2025-04-17', type: 'regular', isRecurring: false },
      { name: 'Good Friday', date: '2025-04-18', type: 'regular', isRecurring: false },
      { name: "Eid'l Fitr (TBD)", date: '2025-03-30', type: 'regular', isRecurring: false, notes: 'Date subject to NCMF announcement' },
      { name: 'Labor Day', date: '2025-05-01', type: 'regular', isRecurring: true },
      { name: "Eid'l Adha (TBD)", date: '2025-06-06', type: 'regular', isRecurring: false, notes: 'Date subject to NCMF announcement' },
      { name: 'Independence Day', date: '2025-06-12', type: 'regular', isRecurring: true },
      { name: 'National Heroes Day', date: '2025-08-25', type: 'regular', isRecurring: false },
      { name: 'Bonifacio Day', date: '2025-11-30', type: 'regular', isRecurring: true },
      { name: 'Christmas Day', date: '2025-12-25', type: 'regular', isRecurring: true },
      { name: 'Rizal Day', date: '2025-12-30', type: 'regular', isRecurring: true },
      // Special Non-Working Days
      { name: 'Chinese New Year', date: '2025-01-29', type: 'special_non_working', isRecurring: false },
      { name: 'EDSA Revolution Anniversary', date: '2025-02-25', type: 'special_non_working', isRecurring: true },
      { name: 'Black Saturday', date: '2025-04-19', type: 'special_non_working', isRecurring: false },
      { name: 'Ninoy Aquino Day', date: '2025-08-21', type: 'special_non_working', isRecurring: true },
      { name: "All Saints' Day", date: '2025-11-01', type: 'special_non_working', isRecurring: true },
      { name: "All Souls' Day", date: '2025-11-02', type: 'special_non_working', isRecurring: true },
      { name: 'Feast of Immaculate Conception', date: '2025-12-08', type: 'special_non_working', isRecurring: true },
      { name: 'Christmas Eve', date: '2025-12-24', type: 'special_non_working', isRecurring: true },
      { name: "New Year's Eve", date: '2025-12-31', type: 'special_non_working', isRecurring: true },
    ];

    let createdCount = 0;
    for (const holiday of holidays2025) {
      await storage.createHoliday({
        name: holiday.name,
        date: new Date(holiday.date),
        type: holiday.type,
        year: 2025,
        isRecurring: holiday.isRecurring,
        workAllowed: true,
        notes: (holiday as any).notes || null,
      });
      createdCount++;
    }

    res.json({ 
      message: `Successfully seeded ${createdCount} holidays for 2025 (Proclamation 727)`,
      count: createdCount 
    });
  } catch (error) {
    console.error('Error seeding 2025 holidays:', error);
    res.status(500).json({ message: 'Failed to seed 2025 holidays' });
  }
});

export default router;
