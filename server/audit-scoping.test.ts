/**
 * Audit Log Branch-Scoping & Filtered-Count Regression Tests
 *
 * Covers two bug fixes:
 *   #1 — getAuditLogsCount must honor the SAME filters as getAuditLogs, so the
 *        paginated total is correct when a filter is applied.
 *   #3 — audit logs must be scoped to the acting user's branch when branchId
 *        is supplied (managers), and global when it is not (admins).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from './storage';

async function seedUser(storage: MemStorage, username: string, branchId: string) {
  return storage.createUser({
    username,
    password: 'password123',
    firstName: username,
    lastName: 'Tester',
    email: `${username}@example.com`,
    role: 'employee',
    position: 'Barista',
    hourlyRate: '100',
    branchId,
  } as any);
}

describe('Audit log branch scoping & filtered count', () => {
  let storage: MemStorage;
  let branchAUser: { id: string };
  let branchBUser: { id: string };

  beforeEach(async () => {
    storage = new MemStorage();
    branchAUser = await seedUser(storage, 'alice', 'branch-A');
    branchBUser = await seedUser(storage, 'bob', 'branch-B');

    // Branch A: 2 employee_update, 1 employee_delete
    await storage.createAuditLog({ id: 'a1', action: 'employee_update', entityType: 'employee', entityId: 'e1', userId: branchAUser.id });
    await storage.createAuditLog({ id: 'a2', action: 'employee_update', entityType: 'employee', entityId: 'e2', userId: branchAUser.id });
    await storage.createAuditLog({ id: 'a3', action: 'employee_delete', entityType: 'employee', entityId: 'e3', userId: branchAUser.id });

    // Branch B: 1 shift_create
    await storage.createAuditLog({ id: 'b1', action: 'shift_create', entityType: 'shift', entityId: 's1', userId: branchBUser.id });
  });

  it('scopes logs to the acting user branch when branchId is provided', async () => {
    const logs = await storage.getAuditLogs({ branchId: 'branch-A' });
    expect(logs).toHaveLength(3);
    expect(logs.every(l => l.userId === branchAUser.id)).toBe(true);
  });

  it('returns all logs (global) when no branchId is provided', async () => {
    const logs = await storage.getAuditLogs({});
    expect(logs).toHaveLength(4);
  });

  it('count honors the same branch + action filters as the fetched page (#1)', async () => {
    const count = await storage.getAuditLogsCount({ branchId: 'branch-A', action: 'employee_update' });
    expect(count).toBe(2);

    const logs = await storage.getAuditLogs({ branchId: 'branch-A', action: 'employee_update', limit: 1 });
    // Page returns at most `limit`, but the total count reflects all matches.
    expect(logs).toHaveLength(1);
  });

  it('filtered count excludes other branches', async () => {
    const count = await storage.getAuditLogsCount({ branchId: 'branch-B', action: 'employee_update' });
    expect(count).toBe(0);
  });

  it('stats are scoped by branch', async () => {
    const statsA = await storage.getAuditLogStats('branch-A');
    expect(statsA.totalLogs).toBe(3);
    expect(statsA.byAction['employee_update']).toBe(2);
    expect(statsA.byAction['shift_create']).toBeUndefined();

    const statsGlobal = await storage.getAuditLogStats();
    expect(statsGlobal.totalLogs).toBe(4);
  });
});
