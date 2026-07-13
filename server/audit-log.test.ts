/**
 * Audit Log Coverage Tests
 *
 * Verifies two things:
 *   1. The createAuditLog helper correctly writes entries to storage.
 *   2. Every admin/employee action that must be audited has a corresponding
 *      createAuditLog call in routes.ts (static source scan).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// ─── Mock dbStorage before importing anything that uses it ───────────────────
vi.mock('./db-storage', () => ({
  dbStorage: {
    createAuditLog: vi.fn().mockResolvedValue({
      id: 'test-id',
      action: 'test_action',
      entityType: 'test_entity',
      entityId: 'entity-1',
      userId: 'user-1',
      oldValues: null,
      newValues: null,
      reason: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
    }),
    getUser: vi.fn().mockResolvedValue({ firstName: 'Test', lastName: 'User', branchId: 'branch-1' }),
  },
}));

// ─── Mock uuid ────────────────────────────────────────────────────────────────
vi.mock('uuid', () => ({ v4: () => 'mocked-uuid' }));

// ─── Import after mocks ───────────────────────────────────────────────────────
import { createAuditLog } from './routes/audit';
import { dbStorage } from './db-storage';

// Concatenate all server-side route source files so the scan covers sub-routers too
const routerDir = join(__dirname, 'routes');
const subRouterSources = readdirSync(routerDir)
  .filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'))
  .map(f => readFileSync(join(routerDir, f), 'utf8'))
  .join('\n');
const allRoutesSrc = readFileSync(join(__dirname, 'routes.ts'), 'utf8') + '\n' + subRouterSources;

if (!allRoutesSrc.trim() || subRouterSources.trim().length === 0) {
  throw new Error('Audit coverage scan found no route source files — ensure tests run from the TypeScript source context, not dist.');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strict match: action: 'foo' or action: "foo" */
function countActionOccurrences(action: string): number {
  const escaped = action.replace(/_/g, '[_]');
  const re = new RegExp(`action:\\s*['"]${escaped}['"]`, 'g');
  return (allRoutesSrc.match(re) ?? []).length;
}

/** Loose match: the string literal 'foo' or "foo" appears anywhere (covers ternaries) */
function countLiteralOccurrences(literal: string): number {
  const escaped = literal.replace(/_/g, '[_]');
  const re = new RegExp(`['"]${escaped}['"]`, 'g');
  return (allRoutesSrc.match(re) ?? []).length;
}

function assertActionLogged(action: string): void {
  const count = countActionOccurrences(action);
  if (count === 0) {
    throw new Error(
      `MISSING AUDIT LOG: action '${action}' not found in server route files — add a createAuditLog call with this action.`,
    );
  }
}

function assertLiteralExists(literal: string): void {
  const count = countLiteralOccurrences(literal);
  if (count === 0) {
    throw new Error(
      `MISSING AUDIT LOG: string literal '${literal}' not found in server route files — add a createAuditLog call that produces this action.`,
    );
  }
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('createAuditLog helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes a log entry with all required fields', async () => {
    await createAuditLog({
      action: 'employee_create',
      entityType: 'employee',
      entityId: 'emp-1',
      userId: 'user-1',
      newValues: { firstName: 'Jane', lastName: 'Doe' },
    });

    const mock = vi.mocked(dbStorage.createAuditLog);
    expect(mock).toHaveBeenCalledOnce();
    const call = mock.mock.calls[0][0];
    expect(call.action).toBe('employee_create');
    expect(call.entityType).toBe('employee');
    expect(call.entityId).toBe('emp-1');
    expect(call.userId).toBe('user-1');
    expect(call.id).toBe('mocked-uuid');
  });

  it('JSON-stringifies newValues and oldValues', async () => {
    const oldVals = { status: 'active' };
    const newVals = { status: 'inactive', reason: 'terminated' };

    await createAuditLog({
      action: 'employee_deactivate',
      entityType: 'employee',
      entityId: 'emp-2',
      userId: 'manager-1',
      oldValues: oldVals,
      newValues: newVals,
    });

    const call = vi.mocked(dbStorage.createAuditLog).mock.calls[0][0];
    expect(call.oldValues).toBe(JSON.stringify(oldVals));
    expect(call.newValues).toBe(JSON.stringify(newVals));
  });

  it('stores null when oldValues/newValues are omitted', async () => {
    await createAuditLog({
      action: 'branch_create',
      entityType: 'branch',
      entityId: 'branch-1',
      userId: 'admin-1',
    });

    const call = vi.mocked(dbStorage.createAuditLog).mock.calls[0][0];
    expect(call.oldValues).toBeNull();
    expect(call.newValues).toBeNull();
  });

  it('does not throw when storage.createAuditLog rejects', async () => {
    vi.mocked(dbStorage.createAuditLog).mockRejectedValueOnce(new Error('DB error'));

    await expect(
      createAuditLog({
        action: 'shift_create',
        entityType: 'shift',
        entityId: 'shift-1',
        userId: 'user-1',
      }),
    ).resolves.not.toThrow();
  });

  it('passes ipAddress and userAgent through', async () => {
    await createAuditLog({
      action: 'rate_update',
      entityType: 'deduction_rate',
      entityId: 'rate-1',
      userId: 'admin-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    const call = vi.mocked(dbStorage.createAuditLog).mock.calls[0][0];
    expect(call.ipAddress).toBe('127.0.0.1');
    expect(call.userAgent).toBe('Mozilla/5.0');
  });
});

// ─── Coverage manifest ────────────────────────────────────────────────────────
// Each entry is [action, description].  Failing tests mean a route is missing
// its createAuditLog call.  Add the call in routes.ts to fix.

describe('Audit log coverage — every admin action is logged in routes.ts', () => {
  // ── Employee management ──────────────────────────────────────────────────
  it('employee_create is logged when a new employee is added', () => {
    assertActionLogged('employee_create');
  });

  it('employee_update is logged when employee info is changed', () => {
    assertActionLogged('employee_update');
  });

  it('employee_activate / employee_deactivate are logged on status toggle', () => {
    // Written as a ternary: isActive ? 'employee_activate' : 'employee_deactivate'
    const activateCount = countLiteralOccurrences('employee_activate');
    const deactivateCount = countLiteralOccurrences('employee_deactivate');
    expect(activateCount + deactivateCount).toBeGreaterThanOrEqual(1);
  });

  it('employee_delete is logged when an employee is removed', () => {
    assertActionLogged('employee_delete');
  });

  // ── Shift management ─────────────────────────────────────────────────────
  it('shift_create is logged when a single shift is created', () => {
    assertActionLogged('shift_create');
  });

  it('shift_update is logged when a shift is edited', () => {
    assertActionLogged('shift_update');
  });

  it('shift_delete is logged when a single shift is deleted', () => {
    assertActionLogged('shift_delete');
  });

  it('shift_bulk_create is logged when shifts are bulk-created', () => {
    assertActionLogged('shift_bulk_create');
  });

  it('shift_bulk_delete is logged when shifts/exceptions are bulk-deleted', () => {
    assertActionLogged('shift_bulk_delete');
  });

  // ── Shift trades ─────────────────────────────────────────────────────────
  it('trade_request is logged when an employee posts a shift trade', () => {
    assertActionLogged('trade_request');
  });

  it('trade_take is logged when an employee accepts an open trade', () => {
    assertActionLogged('trade_take');
  });

  it('trade_approve is logged when a manager approves a shift trade', () => {
    assertActionLogged('trade_approve');
  });

  it('trade_reject is logged when a manager rejects a shift trade', () => {
    assertActionLogged('trade_reject');
  });

  // ── Time-off requests ─────────────────────────────────────────────────────
  it('time_off_approve is logged when a manager approves a time-off request', () => {
    assertActionLogged('time_off_approve');
  });

  it('time_off_reject is logged when a manager rejects a time-off request', () => {
    assertActionLogged('time_off_reject');
  });

  it('time_off_cancel is logged when a time-off request is cancelled', () => {
    assertActionLogged('time_off_cancel');
  });

  it('time_off_update is logged when a pending time-off request is edited', () => {
    assertActionLogged('time_off_update');
  });

  // ── Branches ─────────────────────────────────────────────────────────────
  it('branch_create is logged when a branch is created', () => {
    assertActionLogged('branch_create');
  });

  it('branch_update is logged when a branch is updated', () => {
    // Written as a ternary result: condition ? 'branch_delete' : 'branch_update'
    assertLiteralExists('branch_update');
  });

  it('branch_delete is logged when a branch is deleted', () => {
    assertActionLogged('branch_delete');
  });

  // ── Holidays ──────────────────────────────────────────────────────────────
  it('holiday create is logged', () => {
    // holidays router uses action: 'create' on entityType: 'holiday'
    const re = /action:\s*['"]create['"]/g;
    const count = (allRoutesSrc.match(re) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // ── Deduction rates ───────────────────────────────────────────────────────
  it('rate_create is logged when a deduction rate is created', () => {
    assertActionLogged('rate_create');
  });

  it('rate_update is logged when a deduction rate is updated', () => {
    assertActionLogged('rate_update');
  });

  it('rate_delete is logged when a deduction rate is deleted', () => {
    assertActionLogged('rate_delete');
  });

  it('deduction_settings_update is logged when branch deduction toggles change', () => {
    assertActionLogged('deduction_settings_update');
  });

  // ── Payroll ───────────────────────────────────────────────────────────────
  it('payroll_process is logged when a payroll period is processed', () => {
    assertActionLogged('payroll_process');
  });

  it('payroll_period_create is logged when a payroll period is opened', () => {
    assertActionLogged('payroll_period_create');
  });

  it('payroll_period_delete is logged when an open payroll period is deleted', () => {
    assertActionLogged('payroll_period_delete');
  });

  it('payroll_period_archive is logged when a payroll period is archived', () => {
    assertActionLogged('payroll_period_archive');
  });

  it('payroll_approve is logged when a payroll entry is approved', () => {
    assertActionLogged('payroll_approve');
  });

  it('payroll_paid is logged when a payroll entry is marked paid', () => {
    assertActionLogged('payroll_paid');
  });
});
