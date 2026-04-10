import { Router, Request, Response, NextFunction } from 'express';
import { dbStorage } from '../db-storage';
import crypto from 'crypto';
import { createAuditLog } from './audit';

const storage = dbStorage;

import RealTimeManager from '../services/realtime-manager';

export function createEmployeeRouter(realTimeManager: RealTimeManager) {
  const router = Router();

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Admin has access to all manager routes
    const effectiveRoles = [...roles];
    if (roles.includes('manager') && !roles.includes('admin')) {
      effectiveRoles.push('admin');
    }

    if (!effectiveRoles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };

  // Get all employees in the same branch (accessible to all authenticated users for shift trading)
  router.get('/api/employees', requireAuth, async (req, res) => {
    try {
      const branchId = req.session.user?.branchId;
      if (!branchId) return res.status(400).json({ message: 'Branch ID not found in session' });

      // Return all users from the same branch (for scheduling and shift trading purposes)
      const employees = await storage.getUsersByBranch(branchId);
      
      // Return ALL employees from the same branch with isActive status
      // Let the frontend handle filtering/display of inactive employees
      let sanitizedEmployees = employees.map(emp => ({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          position: emp.position,
          branchId: emp.branchId,
          role: emp.role,
          isActive: emp.isActive ?? true, // Include isActive for client-side filtering
          photoUrl: emp.photoUrl || null, // Profile picture for schedule avatars
        }));
      
        // Shift trading and schedule assignment require visibility of same-branch coworkers
        // for all authenticated roles, including employee accounts.

      res.json({ employees: sanitizedEmployees });
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Failed to fetch employees' });
    }
  });

  // Get all employees across all branches (admin/manager only - for branch overview)
  router.get('/api/employees/all-branches', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const sanitizedEmployees = allUsers.map(emp => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        position: emp.position,
        branchId: emp.branchId,
        role: emp.role,
        isActive: emp.isActive ?? true,
      }));
      res.json({ employees: sanitizedEmployees });
    } catch (error) {
      console.error('Error fetching all employees:', error);
      res.status(500).json({ message: 'Failed to fetch employees' });
    }
  });

// Get employee stats (must be before /:id route)
router.get('/api/employees/stats', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const branchId = req.session.user?.branchId;
    if (!branchId) return res.status(400).json({ message: 'Branch ID not found in session' });
    const users = await storage.getUsersByBranch(branchId);

    // Calculate statistics
    const totalEmployees = users.length;
    const activeEmployees = users.filter(user => user.isActive).length;

    // Calculate total hours this month from shifts
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get payroll periods that overlap with the current month (used for hours fallback + payroll calc)
    const allPeriods = await storage.getPayrollPeriodsByBranch(branchId);
    const periodsThisMonth = allPeriods.filter(p => {
      const pStart = new Date(p.startDate);
      const pEnd = new Date(p.endDate);
      return pStart <= monthEnd && pEnd >= monthStart;
    });

    let totalHoursThisMonth = 0;
    for (const user of users) {
      const shifts = await storage.getShiftsByUser(user.id, monthStart, monthEnd);
      let userHours = 0;
      for (const shift of shifts) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
        userHours += hours;
      }
      // Fall back to payroll entry hours if no shifts found for this period
      if (userHours === 0 && periodsThisMonth.length > 0) {
        const entries = await storage.getPayrollEntriesByUser(user.id);
        for (const entry of entries) {
          if (periodsThisMonth.some(p => p.id === entry.payrollPeriodId)) {
            userHours += parseFloat(entry.totalHours || '0');
          }
        }
      }
      totalHoursThisMonth += userHours;
    }

    // Calculate total payroll this month from payroll entries
    // Filter by payroll period dates (not createdAt which is just the DB insert timestamp)
    let totalPayrollThisMonth = 0;
    for (const user of users) {
      const entries = await storage.getPayrollEntriesByUser(user.id);
      for (const entry of entries) {
        // Only include entries whose payroll period falls within this month
        if (periodsThisMonth.some(p => p.id === entry.payrollPeriodId)) {
          totalPayrollThisMonth += parseFloat(entry.grossPay);
        }
      }
    }

    // Calculate average performance (simplified - based on completed shifts vs scheduled)
    let totalPerformanceScore = 0;
    let employeesWithShifts = 0;
    for (const user of users) {
      const shifts = await storage.getShiftsByUser(user.id, monthStart, monthEnd);
      if (shifts.length > 0) {
        const completedShifts = shifts.filter(s => s.status === 'completed').length;
        const performanceScore = (completedShifts / shifts.length) * 5; // Scale to 0-5
        totalPerformanceScore += performanceScore;
        employeesWithShifts++;
      }
    }
    const averagePerformance = employeesWithShifts > 0
      ? Number((totalPerformanceScore / employeesWithShifts).toFixed(1))
      : 0;

    res.json({
      totalEmployees,
      activeEmployees,
      totalHoursThisMonth: Number(totalHoursThisMonth.toFixed(2)),
      totalPayrollThisMonth: Number(totalPayrollThisMonth.toFixed(2)),
      averagePerformance,
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ message: 'Failed to fetch employee stats' });
  }
});

// Get employee performance data (must be before /:id route)
router.get('/api/employees/performance', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const branchId = req.session.user?.branchId;
    if (!branchId) return res.status(400).json({ message: 'Branch ID not found in session' });
    const users = await storage.getUsersByBranch(branchId);

    // Calculate real performance data from shifts
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const performanceData = await Promise.all(users.map(async (user) => {
      const shifts = await storage.getShiftsByUser(user.id, monthStart, monthEnd);

      // Calculate hours this month
      let hoursThisMonth = 0;
      for (const shift of shifts) {
        const hours = (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
        hoursThisMonth += hours;
      }

      // Calculate rating based on completed shifts vs scheduled
      const completedShifts = shifts.filter(s => s.status === 'completed').length;
      const missedShifts = shifts.filter(s => s.status === 'missed').length;
      const totalShifts = shifts.length;

      let rating = 5.0;
      if (totalShifts > 0) {
        // Deduct points for missed shifts
        rating = 5.0 - (missedShifts / totalShifts) * 2;
        // Bonus for perfect attendance
        if (completedShifts === totalShifts && totalShifts > 0) {
          rating = 5.0;
        }
        rating = Math.max(0, Math.min(5, rating)); // Clamp between 0 and 5
      }

      return {
        employeeId: user.id,
        employeeName: `${user.firstName} ${user.lastName}`,
        rating: Number(rating.toFixed(1)),
        hoursThisMonth: Number(hoursThisMonth.toFixed(2)),
        shiftsThisMonth: totalShifts,
      };
    }));

    res.json(performanceData);
  } catch (error) {
    console.error('Error fetching employee performance:', error);
    res.status(500).json({ message: 'Failed to fetch employee performance' });
  }
});

// Get a single employee by ID
router.get('/api/employees/:id', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await storage.getUser(id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Only managers from the same branch can view the employee
    if (req.session.user?.role === 'manager' && 
        req.session.user?.branchId !== employee.branchId) {
      return res.status(403).json({ message: 'Unauthorized to view this employee' });
    }
    
    // Filter out sensitive data
    const { password, ...sanitizedEmployee } = employee;
    
    res.json(sanitizedEmployee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Failed to fetch employee' });
  }
});

// Create a new employee
router.post('/api/employees', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      email,
      role = 'employee',
      position,
      hourlyRate,
      branchId,
      isActive = true,
      tin,
      sssNumber,
      philhealthNumber,
      pagibigNumber,
      isMwe,
    } = req.body;

    // Basic validation
    if (!username || !password || !firstName || !lastName || !email || !position || !hourlyRate || !branchId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate hourlyRate is a valid non-negative number
    const parsedRate = parseFloat(String(hourlyRate));
    if (isNaN(parsedRate) || parsedRate < 0) {
      return res.status(400).json({ message: 'hourlyRate must be a non-negative number' });
    }

    // --- DOLE COMPLIANCE: Feature 4 Min Wage Guardian ---
    const calculatedDailyRate = parsedRate * 8;
    const { wageOrders } = await import('../../shared/schema');
    const { eq } = await import('drizzle-orm');
    const { db } = await import('../db');
    
    // Check against NCR minimum wage order
    const ncrOrder = await db.select().from(wageOrders).where(eq(wageOrders.region, 'NCR')).limit(1);
    const minWage = ncrOrder.length > 0 ? parseFloat(ncrOrder[0].dailyRate) : 645.00;
    
    if (calculatedDailyRate < minWage) {
      return res.status(400).json({ 
        message: `DOLE Violation: Calculated daily rate (₱${calculatedDailyRate.toFixed(2)}) is below the Minimum Wage (₱${minWage.toFixed(2)}).` 
      });
    }

    // Restrict role — only admins can create admin accounts
    const allowedRoles = req.session.user?.role === 'admin' ? ['employee', 'manager', 'admin'] : ['employee', 'manager'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Invalid role. Allowed: ${allowedRoles.join(', ')}` });
    }

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create the employee (createUser will hash the password)
    // Note: Don't pass id or createdAt - they're generated by createUser
    // Note: hourlyRate should be a string, not a number
    console.log(`👤 [POST /api/employees] Attempting to create employee: ${username} (${role})`);
    const newEmployee = await storage.createUser({
      username,
      password, // Pass plain password - createUser will hash it
      firstName,
      lastName,
      email,
      role,
      position,
      hourlyRate: String(hourlyRate), // Convert to string
      branchId,
      isActive,
      tin: tin || null,
      sssNumber: sssNumber || null,
      philhealthNumber: philhealthNumber || null,
      pagibigNumber: pagibigNumber || null,
      isMwe: !!isMwe,
      dailyRate: calculatedDailyRate.toString()
    });

    if (!newEmployee) {
      console.error(`❌ [POST /api/employees] storage.createUser returned null for ${username}`);
      return res.status(500).json({ message: 'Failed to create employee in database' });
    }

    console.log(`✅ [POST /api/employees] Successfully created employee: ${newEmployee.username} (ID: ${newEmployee.id})`);

    // Don't send back the password
    const { password: _, ...result } = newEmployee;

    realTimeManager.broadcastEmployeeCreated(result);

    // Audit log
    await createAuditLog({
      action: 'employee_create',
      entityType: 'employee',
      entityId: newEmployee.id,
      userId: req.session.user!.id,
      newValues: { firstName: result.firstName, lastName: result.lastName, email: result.email, role: result.role, position: result.position, branchId: result.branchId },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating employee:', error);
    
    // Provide more detailed error messages based on the error
    let message = 'Failed to create employee';
    if (error.message?.includes('UNIQUE constraint failed')) {
      if (error.message?.includes('username')) {
        message = 'Username already exists';
      } else if (error.message?.includes('email')) {
        message = 'Email already in use';
      }
    } else if (error.message?.includes('Username already exists')) {
      message = 'Username already exists';
    } else if (error.message?.includes('Email already in use')) {
      message = 'Email already in use';
    } else if (error.message) {
      message = error.message;
    }
    
    res.status(500).json({ message });
  }
});

// Update an employee
router.put('/api/employees/:id', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    // Get the existing employee
    const existingEmployee = await storage.getUser(id);
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Only managers from the same branch can update the employee
    if (req.session.user?.role === 'manager' &&
        req.session.user?.branchId !== existingEmployee.branchId) {
      return res.status(403).json({ message: 'Unauthorized to update this employee' });
    }

    // Whitelist allowed fields to prevent mass assignment
    const updates: Record<string, any> = {};
    const allowedFields = ['username', 'password', 'firstName', 'lastName', 'email', 'position', 'hourlyRate', 'role', 'isActive', 'branchId', 'tin', 'sssNumber', 'philhealthNumber', 'pagibigNumber', 'isMwe'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'password') {
          // Only update password if a non-empty string is explicitly provided
          if (typeof body[field] === 'string' && body[field].trim().length > 0) {
            updates[field] = body[field];
          }
          // Skip password entirely if empty, null, or undefined — preserve existing
        } else if (['tin', 'sssNumber', 'philhealthNumber', 'pagibigNumber'].includes(field) && body[field] === '') {
          // Treat empty strings as null for government IDs
          updates[field] = null;
        } else {
          updates[field] = body[field];
        }
      }
    }

    // Check if new username conflicts with another user
    if (updates.username && updates.username !== existingEmployee.username) {
      const existingUserWithUsername = await storage.getUserByUsername(updates.username);
      if (existingUserWithUsername && existingUserWithUsername.id !== id) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Restrict role changes — only admins can set role to 'admin'
    if (updates.role) {
      const allowedRoles = req.session.user?.role === 'admin' ? ['employee', 'manager', 'admin'] : ['employee', 'manager'];
      if (!allowedRoles.includes(updates.role)) {
        return res.status(400).json({ message: `Invalid role. Allowed: ${allowedRoles.join(', ')}` });
      }
    }

    // Convert hourlyRate to string if it exists (database stores as text)
    if (updates.hourlyRate !== undefined) {
      const rate = parseFloat(String(updates.hourlyRate));
      if (isNaN(rate) || rate < 0) {
        return res.status(400).json({ message: 'hourlyRate must be a non-negative number' });
      }

      // --- DOLE COMPLIANCE: Feature 4 Min Wage Guardian ---
      const calculatedDailyRate = rate * 8;
      const { wageOrders } = await import('../../shared/schema');
      const { eq } = await import('drizzle-orm');
      const { db } = await import('../db');
      
      const ncrOrder = await db.select().from(wageOrders).where(eq(wageOrders.region, 'NCR')).limit(1);
      const minWage = ncrOrder.length > 0 ? parseFloat(ncrOrder[0].dailyRate) : 645.00;
      
      if (calculatedDailyRate < minWage) {
        return res.status(400).json({ 
          message: `DOLE Violation: Calculated daily rate (₱${calculatedDailyRate.toFixed(2)}) is below the Minimum Wage (₱${minWage.toFixed(2)}).` 
        });
      }

      updates.hourlyRate = String(rate);
      updates.dailyRate = calculatedDailyRate.toString();
    }

    // Note: Don't hash password here - updateUser will handle it

    // Update the employee
    const updatedEmployee = await storage.updateUser(id, updates);

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Don't send back the password
    const { password, ...result } = updatedEmployee;

    realTimeManager.broadcastEmployeeUpdated(result);

    // Audit log
    await createAuditLog({
      action: 'employee_update',
      entityType: 'employee',
      entityId: id,
      userId: req.session.user!.id,
      oldValues: { firstName: existingEmployee.firstName, lastName: existingEmployee.lastName, email: existingEmployee.email, position: existingEmployee.position, hourlyRate: existingEmployee.hourlyRate },
      newValues: updates,
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Failed to update employee' });
  }
});



// Update employee deductions (Manager only)
router.put('/api/employees/:id/deductions', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { sssLoanDeduction, pagibigLoanDeduction, cashAdvanceDeduction, otherDeductions } = req.body;

    // Get the existing employee
    const existingEmployee = await storage.getUser(id);
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Only managers from the same branch can update the employee
    if (req.session.user?.role === 'manager' &&
        req.session.user?.branchId !== existingEmployee.branchId) {
      return res.status(403).json({ message: 'Unauthorized to update this employee' });
    }

    // Update the employee deductions
    const updatedEmployee = await storage.updateUser(id, {
      sssLoanDeduction: sssLoanDeduction !== undefined ? String(sssLoanDeduction) : existingEmployee.sssLoanDeduction,
      pagibigLoanDeduction: pagibigLoanDeduction !== undefined ? String(pagibigLoanDeduction) : existingEmployee.pagibigLoanDeduction,
      cashAdvanceDeduction: cashAdvanceDeduction !== undefined ? String(cashAdvanceDeduction) : existingEmployee.cashAdvanceDeduction,
      otherDeductions: otherDeductions !== undefined ? String(otherDeductions) : existingEmployee.otherDeductions,
    });

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Don't send back the password
    const { password, ...result } = updatedEmployee;

    realTimeManager.broadcastEmployeeUpdated(result);

    // Audit log for deduction change
    await createAuditLog({
      action: 'deduction_change',
      entityType: 'employee',
      entityId: id,
      userId: req.session.user!.id,
      oldValues: {
        sssLoanDeduction: existingEmployee.sssLoanDeduction,
        pagibigLoanDeduction: existingEmployee.pagibigLoanDeduction,
        cashAdvanceDeduction: existingEmployee.cashAdvanceDeduction,
        otherDeductions: existingEmployee.otherDeductions,
      },
      newValues: {
        sssLoanDeduction: updatedEmployee.sssLoanDeduction,
        pagibigLoanDeduction: updatedEmployee.pagibigLoanDeduction,
        cashAdvanceDeduction: updatedEmployee.cashAdvanceDeduction,
        otherDeductions: updatedEmployee.otherDeductions,
      },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating employee deductions:', error);
    res.status(500).json({ message: 'Failed to update employee deductions' });
  }
});

// Toggle employee status (activate/deactivate) - Manager/Admin only
router.patch('/api/employees/:id/status', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    // Get the existing employee
    const existingEmployee = await storage.getUser(id);
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Update the employee status
    const updatedEmployee = await storage.updateUser(id, { isActive });

    if (!updatedEmployee) {
      return res.status(500).json({ message: 'Failed to update employee status' });
    }

    console.log(`Employee ${id} status updated to isActive=${isActive}`);

    // Don't send back the password
    const { password, ...result } = updatedEmployee;

    realTimeManager.broadcastEmployeeUpdated(result);

    // Audit log for status change
    await createAuditLog({
      action: isActive ? 'employee_activate' : 'employee_deactivate',
      entityType: 'employee',
      entityId: id,
      userId: req.session.user!.id,
      oldValues: { isActive: existingEmployee.isActive },
      newValues: { isActive },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating employee status:', error);
    res.status(500).json({ message: 'Failed to update employee status' });
  }
});

// Check if employee has related data (for UI decision making)
router.get('/api/employees/:id/related-data', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const relatedData = await storage.employeeHasRelatedData(id);
    res.json(relatedData);
  } catch (error) {
    console.error('Error checking related data:', error);
    res.status(500).json({ message: 'Failed to check related data' });
  }
});

// Export employee data (for GDPR compliance / pre-deletion backup)
router.get('/api/employees/:id/export', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const exportData = await storage.getEmployeeDataForExport(id);
    if (!exportData) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Remove sensitive data from export
    const { password, ...safeEmployee } = exportData.employee;
    
    res.json({
      exportedAt: new Date().toISOString(),
      employee: safeEmployee,
      shifts: exportData.shifts,
      payrollEntries: exportData.payrollEntries,
      timeOffRequests: exportData.timeOffRequests,
      shiftTrades: exportData.shiftTrades,
    });
  } catch (error) {
    console.error('Error exporting employee data:', error);
    res.status(500).json({ message: 'Failed to export employee data' });
  }
});

// Delete employee (Manager/Admin only)
// Supports ?force=true for cascade delete (Admin only)
router.delete('/api/employees/:id', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';

    // Get the existing employee
    const existingEmployee = await storage.getUser(id);
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Only managers from the same branch can delete the employee
    if (req.session.user?.role === 'manager' &&
        req.session.user?.branchId !== existingEmployee.branchId) {
      return res.status(403).json({ message: 'Unauthorized to delete this employee' });
    }

    // Prevent deleting yourself
    if (existingEmployee.id === req.session.user?.id) {
      return res.status(400).json({ 
        message: `You cannot delete your own account (${existingEmployee.firstName} ${existingEmployee.lastName})` 
      });
    }

    // Prevent deleting admin accounts (only admins can delete admins)
    if (existingEmployee.role === 'admin' && req.session.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete admin accounts' });
    }

    // Check for related data
    const relatedData = await storage.employeeHasRelatedData(id);

    if (force) {
      // Force delete is admin-only
      if (req.session.user?.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Force delete is only available for administrators',
          requiresAdmin: true 
        });
      }

      // Perform cascade delete
      const reason = req.query.reason as string || 'Force deletion by admin';
      await storage.forceDeleteUser(id, req.session.user.id, reason);
      
      console.log(`🗑️ FORCE deleted employee: ${existingEmployee.firstName} ${existingEmployee.lastName} (${id}) by ${req.session.user.username}`);
      
      realTimeManager.broadcastEmployeeDeleted(id, existingEmployee.branchId);
      await createAuditLog({
        action: 'employee_delete',
        entityType: 'employee',
        entityId: id,
        userId: req.session.user!.id,
        oldValues: { firstName: existingEmployee.firstName, lastName: existingEmployee.lastName, email: existingEmployee.email, role: existingEmployee.role },
        reason: reason,
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      return res.json({ 
        message: 'Employee and all related data permanently deleted',
        forceDeleted: true 
      });
    }

    // Standard delete - check for related data first
    if (relatedData.hasShifts || relatedData.hasPayroll) {
      return res.status(409).json({ 
        message: 'Cannot delete employee with existing data. Use deactivation or force delete.',
        hasRelatedData: true,
        relatedData: {
          hasShifts: relatedData.hasShifts,
          hasPayroll: relatedData.hasPayroll,
          totalRecords: relatedData.hasTotal,
        },
        options: {
          deactivate: 'Set employee as inactive (recommended)',
          forceDelete: req.session.user?.role === 'admin' ? 'Permanently delete all data (admin only)' : null,
        }
      });
    }

    // No related data - safe to delete normally
    const deleted = await storage.deleteUser(id);

    if (!deleted) {
      return res.status(500).json({ message: 'Failed to delete employee' });
    }

    console.log(`🗑️ Employee deleted: ${existingEmployee.firstName} ${existingEmployee.lastName} (${existingEmployee.id})`);

    realTimeManager.broadcastEmployeeDeleted(id, existingEmployee.branchId);
    await createAuditLog({
      action: 'employee_delete',
      entityType: 'employee',
      entityId: id,
      userId: req.session.user!.id,
      oldValues: { firstName: existingEmployee.firstName, lastName: existingEmployee.lastName, email: existingEmployee.email, role: existingEmployee.role },
      ipAddress: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    res.json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: error.message || 'Failed to delete employee' });
  }
});

  return router;
}
