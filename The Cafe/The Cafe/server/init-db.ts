import { db } from './db';
import { 
  branches, users, shifts, shiftTrades, payrollPeriods, payrollEntries, 
  approvals, timeOffRequests, notifications, setupStatus, deductionSettings, 
  deductionRates, holidays, archivedPayrollPeriods, adjustmentLogs 
} from '@shared/schema';
import { getPaymentDate } from '@shared/payroll-dates';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { eq, sql } from 'drizzle-orm';

// Startup migrations - automatic data cleanup
export async function runMigrations() {
  console.log('🔄 Running startup migrations...');
  try {
    // Migration 1: Delete any shifts on Sunday in Philippine time (UTC+8 hours)
    // First delete related shift_trades to respect FK constraints
    await db.execute(
      sql`DELETE FROM shift_trades WHERE shift_id IN (
        SELECT id FROM shifts WHERE EXTRACT(DOW FROM start_time + INTERVAL '8 hours') = 0
        OR EXTRACT(DOW FROM start_time) = 0
      )`
    );
    await db.execute(
      sql`DELETE FROM shifts WHERE EXTRACT(DOW FROM start_time + INTERVAL '8 hours') = 0`
    );
    await db.execute(
      sql`DELETE FROM shifts WHERE EXTRACT(DOW FROM start_time) = 0`
    );
    console.log('  ✅ Sunday shifts cleanup complete');

    // Migration 2: Delete old-pattern shifts that used raw UTC hours (6,10,14)
    // These cause midnight-crossing in PHT and display on wrong days
    // New pattern uses PHT-aware UTC hours (0,3,7) that don't cross midnight in PHT
    const oldPattern = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM shifts WHERE EXTRACT(HOUR FROM start_time) IN (6, 10, 14)`
    );
    const oldCount = Number((oldPattern as any)?.[0]?.cnt || (oldPattern as any)?.rows?.[0]?.cnt || 0);
    if (oldCount > 0) {
      console.log(`  🔄 Found ${oldCount} old-pattern shifts (UTC hours 6/10/14), deleting for re-seed...`);
      // Delete in correct order to respect foreign key constraints
      await db.execute(sql`DELETE FROM shift_trades`);
      await db.execute(sql`DELETE FROM shifts`);
      // Clear payroll data (respect FK: adjustment_logs → payroll_periods)
      await db.execute(sql`DELETE FROM adjustment_logs`);
      await db.execute(sql`DELETE FROM archived_payroll_periods`);
      await db.execute(sql`DELETE FROM payroll_entries`);
      await db.execute(sql`DELETE FROM payroll_periods`);
      console.log('  ✅ Old data cleared — will re-seed with PHT-correct timestamps');
    }
  } catch (error) {
    console.warn('  ⚠️ Migration error:', error);
  }
}

export async function resetDatabase() {
  console.log('🗑️ Resetting database (dropping all tables)...');
  try {
    // Drop schema public cascade is the cleanest way to wipe everything in Postgres
    // Note: Neon doesn't have a 'postgres' role, so we only grant to 'public'
    await db.execute(sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;`);
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    // Fallback: Try dropping tables individually if schema drop fails (e.g. permissions)
    try {
      await db.execute(sql`
        DROP TABLE IF EXISTS audit_logs, archived_payroll_periods, holidays, deduction_rates, deduction_settings, 
        setup_status, notifications, time_off_requests, approvals, payroll_entries, payroll_periods, 
        shift_trades, shifts, users, branches CASCADE
      `);
      console.log('✅ Database tables dropped');
    } catch (fallbackError) {
      console.error('❌ Fallback reset failed:', fallbackError);
      throw fallbackError;
    }
  }
}

export async function initializeDatabase() {
  console.log('🔧 Initializing PostgreSQL database with Neon...');

  try {
    // Create all tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS branches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'employee',
        position TEXT NOT NULL,
        hourly_rate TEXT NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        blockchain_verified BOOLEAN DEFAULT false,
        blockchain_hash TEXT,
        verified_at TIMESTAMP,
        sss_loan_deduction TEXT DEFAULT '0',
        pagibig_loan_deduction TEXT DEFAULT '0',
        cash_advance_deduction TEXT DEFAULT '0',
        philhealth_deduction TEXT DEFAULT '0',
        other_deductions TEXT DEFAULT '0',
        photo_url TEXT,
        photo_public_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS shifts (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        position TEXT NOT NULL,
        is_recurring BOOLEAN DEFAULT false,
        recurring_pattern TEXT,
        status TEXT DEFAULT 'scheduled',
        actual_start_time TIMESTAMP,
        actual_end_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS shift_trades (
        id TEXT PRIMARY KEY,
        shift_id TEXT REFERENCES shifts(id) NOT NULL,
        from_user_id TEXT REFERENCES users(id) NOT NULL,
        to_user_id TEXT REFERENCES users(id),
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        urgency TEXT DEFAULT 'normal',
        notes TEXT,
        requested_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP,
        approved_by TEXT REFERENCES users(id)
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payroll_periods (
        id TEXT PRIMARY KEY,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'open',
        total_hours TEXT,
        total_pay TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payroll_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        payroll_period_id TEXT REFERENCES payroll_periods(id) NOT NULL,
        total_hours TEXT NOT NULL,
        regular_hours TEXT NOT NULL,
        overtime_hours TEXT DEFAULT '0',
        night_diff_hours TEXT DEFAULT '0',
        basic_pay TEXT NOT NULL,
        holiday_pay TEXT DEFAULT '0',
        overtime_pay TEXT DEFAULT '0',
        night_diff_pay TEXT DEFAULT '0',
        rest_day_pay TEXT DEFAULT '0',
        gross_pay TEXT NOT NULL,
        sss_contribution TEXT DEFAULT '0',
        sss_loan TEXT DEFAULT '0',
        philhealth_contribution TEXT DEFAULT '0',
        pagibig_contribution TEXT DEFAULT '0',
        pagibig_loan TEXT DEFAULT '0',
        withholding_tax TEXT DEFAULT '0',
        advances TEXT DEFAULT '0',
        other_deductions TEXT DEFAULT '0',
        total_deductions TEXT DEFAULT '0',
        deductions TEXT DEFAULT '0',
        net_pay TEXT NOT NULL,
        pay_breakdown TEXT,
        status TEXT DEFAULT 'pending',
        blockchain_hash TEXT,
        block_number INTEGER,
        transaction_hash TEXT,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        request_id TEXT NOT NULL,
        requested_by TEXT REFERENCES users(id) NOT NULL,
        approved_by TEXT REFERENCES users(id),
        status TEXT DEFAULT 'pending',
        reason TEXT,
        request_data TEXT,
        requested_at TIMESTAMP DEFAULT NOW(),
        responded_at TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS time_off_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        type TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT NOW(),
        approved_at TIMESTAMP,
        approved_by TEXT REFERENCES users(id)
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        data TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS setup_status (
        id TEXT PRIMARY KEY,
        is_setup_complete BOOLEAN DEFAULT false,
        setup_completed_at TIMESTAMP
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS deduction_settings (
        id TEXT PRIMARY KEY,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        deduct_sss BOOLEAN DEFAULT true,
        deduct_philhealth BOOLEAN DEFAULT false,
        deduct_pagibig BOOLEAN DEFAULT false,
        deduct_withholding_tax BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS deduction_rates (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        min_salary TEXT NOT NULL,
        max_salary TEXT,
        employee_rate TEXT,
        employee_contribution TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS holidays (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        type TEXT NOT NULL,
        year INTEGER NOT NULL,
        is_recurring BOOLEAN DEFAULT false,
        work_allowed BOOLEAN DEFAULT true,
        notes TEXT,
        premium_override TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add new columns to holidays if they don't exist (migration for existing databases)
    await db.execute(sql`
      ALTER TABLE holidays ADD COLUMN IF NOT EXISTS work_allowed BOOLEAN DEFAULT true
    `).catch(() => {});
    await db.execute(sql`
      ALTER TABLE holidays ADD COLUMN IF NOT EXISTS notes TEXT
    `).catch(() => {});
    await db.execute(sql`
      ALTER TABLE holidays ADD COLUMN IF NOT EXISTS premium_override TEXT
    `).catch(() => {});

    // Add new columns to users if they don't exist
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS philhealth_deduction TEXT DEFAULT '0'
    `).catch(() => {});

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS archived_payroll_periods (
        id TEXT PRIMARY KEY,
        original_period_id TEXT NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status TEXT NOT NULL,
        total_hours TEXT,
        total_pay TEXT,
        archived_at TIMESTAMP DEFAULT NOW(),
        archived_by TEXT REFERENCES users(id),
        entries_snapshot TEXT
      )
    `);

    // Audit logs for compliance tracking
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        user_id TEXT REFERENCES users(id) NOT NULL,
        old_values TEXT,
        new_values TEXT,
        reason TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Time off policy settings
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS time_off_policy (
        id TEXT PRIMARY KEY,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        leave_type TEXT NOT NULL,
        minimum_advance_days INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Employee documents (Cloudinary)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS employee_documents (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) NOT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        public_id TEXT NOT NULL,
        url TEXT NOT NULL,
        format TEXT,
        size INTEGER,
        uploaded_by TEXT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Adjustment logs for manager OT/lateness exceptions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS adjustment_logs (
        id TEXT PRIMARY KEY,
        employee_id TEXT REFERENCES users(id) NOT NULL,
        branch_id TEXT REFERENCES branches(id) NOT NULL,
        logged_by TEXT REFERENCES users(id) NOT NULL,
        date TIMESTAMP NOT NULL,
        type TEXT NOT NULL,
        value TEXT NOT NULL,
        remarks TEXT,
        status TEXT DEFAULT 'pending',
        verified_by_employee BOOLEAN DEFAULT false,
        verified_at TIMESTAMP,
        approved_by TEXT REFERENCES users(id),
        approved_at TIMESTAMP,
        payroll_period_id TEXT REFERENCES payroll_periods(id),
        calculated_amount TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Session table for connect-pg-simple (express-session)
    // Must exist before any auth middleware runs
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL COLLATE "default",
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
    `);

    console.log('✅ All database tables created successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

export async function createAdminAccount() {
  console.log('👤 Checking for admin account...');

  try {
    // Check if admin exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin account already exists');
      return;
    }

    // Check if default branch exists, create if not
    let branch = await db.select().from(branches).limit(1);
    
    if (branch.length === 0) {
      const branchId = randomUUID();
      await db.insert(branches).values({
        id: branchId,
        name: 'Main Branch',
        address: '123 Main Street',
        phone: '555-0100',
        isActive: true,
      });
      branch = await db.select().from(branches).where(eq(branches.id, branchId));
      console.log('✅ Created default branch');
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminId = randomUUID();
    
    await db.insert(users).values({
      id: adminId,
      username: 'admin',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@thecafe.com',
      role: 'admin',
      position: 'Administrator',
      hourlyRate: '0',
      branchId: branch[0].id,
      isActive: true,
    });

    console.log('✅ Admin account created (username: admin, password: admin123)');
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  }
}

export async function seedDeductionRates() {
  console.log('💰 Checking deduction rates...');

  try {
    const existing = await db.select().from(deductionRates).limit(1);
    
    if (existing.length > 0) {
      console.log('✅ Deduction rates already exist');
      return;
    }

    // Insert SSS contribution table — 2026 rates (61 brackets)
    // 15% total: 5% Employee / 10% Employer, MSC ₱5,000–₱35,000
    // MPF/WISP applies for salaries above ₱20,000
    const { sss2026Brackets } = await import('../shared/sss-2026-rates');
    const sssRates = sss2026Brackets.map(b => ({
      minSalary: String(b.minSalary),
      maxSalary: b.maxSalary !== null ? String(b.maxSalary) : null,
      employeeContribution: String(b.totalEE.toFixed(2)),
    }));

    for (const rate of sssRates) {
      await db.insert(deductionRates).values({
        id: randomUUID(),
        type: 'sss',
        minSalary: rate.minSalary,
        maxSalary: rate.maxSalary,
        employeeContribution: rate.employeeContribution,
        isActive: true,
      });
    }

    // PhilHealth rate (2025: 5% of salary, employee pays half = 2.5%)
    // Floor: ₱10,000, Ceiling: ₱100,000
    // Monthly premium range: ₱500 (at floor) to ₱5,000 (at ceiling)
    // Employee share: ₱250 to ₱2,500
    await db.insert(deductionRates).values({
      id: randomUUID(),
      type: 'philhealth',
      minSalary: '10000',  // 2025 floor
      maxSalary: '100000', // 2025 ceiling
      employeeRate: '2.5',
      description: 'PhilHealth 2025: 5% total (2.5% EE + 2.5% ER). Floor ₱10k, Ceiling ₱100k. Premium ₱500-₱5,000.',
      isActive: true,
    });

    // Pag-IBIG rate (2% of salary, max contribution ₱100, soon ₱200)
    await db.insert(deductionRates).values({
      id: randomUUID(),
      type: 'pagibig',
      minSalary: '0',
      maxSalary: null,
      employeeRate: '2',
      employeeContribution: '200', // Max cap ₱200 (effective 2026)
      description: '2% of salary, max ₱200 (2026 rate)',
      isActive: true,
    });

    // BIR Withholding Tax - TRAIN Law Progressive Brackets (2025)
    // Based on BIR RR 11-2018 / TRAIN Law
    // Using ANNUAL income thresholds for calculation
    const birTaxBrackets = [
      { 
        minSalary: '0', 
        maxSalary: '250000', 
        employeeRate: '0',
        description: 'Tax exempt (annual ≤₱250,000)'
      },
      { 
        minSalary: '250001', 
        maxSalary: '400000', 
        employeeRate: '15',
        description: '15% of excess over ₱250k (annual ₱250k-₱400k)'
      },
      { 
        minSalary: '400001', 
        maxSalary: '800000', 
        employeeRate: '20',
        description: '₱22,500 + 20% of excess over ₱400k (annual ₱400k-₱800k)'
      },
      { 
        minSalary: '800001', 
        maxSalary: '2000000', 
        employeeRate: '25',
        description: '₱102,500 + 25% of excess over ₱800k (annual ₱800k-₱2M)'
      },
      { 
        minSalary: '2000001', 
        maxSalary: '8000000', 
        employeeRate: '30',
        description: '₱402,500 + 30% of excess over ₱2M (annual ₱2M-₱8M)'
      },
      { 
        minSalary: '8000001', 
        maxSalary: null, 
        employeeRate: '35',
        description: '₱2,202,500 + 35% of excess over ₱8M (annual >₱8M)'
      },
    ];

    for (const bracket of birTaxBrackets) {
      await db.insert(deductionRates).values({
        id: randomUUID(),
        type: 'tax',
        minSalary: bracket.minSalary,
        maxSalary: bracket.maxSalary,
        employeeRate: bracket.employeeRate,
        description: bracket.description,
        isActive: true,
      });
    }

    console.log('✅ Deduction rates seeded (SSS 61 brackets 2026, PhilHealth 2.5%, Pag-IBIG 2% max ₱200, BIR TRAIN law)');
  } catch (error) {
    console.error('❌ Error seeding deduction rates:', error);
    throw error;
  }
}

export async function seedPhilippineHolidays() {
  console.log('🎉 Checking holidays...');

  try {
    const existing = await db.select().from(holidays).limit(1);
    
    if (existing.length > 0) {
      console.log('✅ Holidays already exist');
      return;
    }

    // 2025 Philippine Holidays (Proclamation 727)
    const holidays2025 = [
      // Regular Holidays (200% pay if worked)
      { name: "New Year's Day", date: '2025-01-01', type: 'regular', isRecurring: true },
      { name: 'Araw ng Kagitingan', date: '2025-04-09', type: 'regular', isRecurring: true },
      { name: 'Maundy Thursday', date: '2025-04-17', type: 'regular', isRecurring: false },
      { name: 'Good Friday', date: '2025-04-18', type: 'regular', isRecurring: false },
      { name: 'Eid\'l Fitr (TBD)', date: '2025-03-30', type: 'regular', isRecurring: false, notes: 'Date subject to NCMF announcement' },
      { name: 'Labor Day', date: '2025-05-01', type: 'regular', isRecurring: true },
      { name: 'Eid\'l Adha (TBD)', date: '2025-06-06', type: 'regular', isRecurring: false, notes: 'Date subject to NCMF announcement' },
      { name: 'Independence Day', date: '2025-06-12', type: 'regular', isRecurring: true },
      { name: 'National Heroes Day', date: '2025-08-25', type: 'regular', isRecurring: false },
      { name: 'Bonifacio Day', date: '2025-11-30', type: 'regular', isRecurring: true },
      { name: 'Christmas Day', date: '2025-12-25', type: 'regular', isRecurring: true },
      { name: 'Rizal Day', date: '2025-12-30', type: 'regular', isRecurring: true },
      
      // Special Non-Working Days (130% pay if worked)
      { name: 'Chinese New Year', date: '2025-01-29', type: 'special_non_working', isRecurring: false },
      { name: 'EDSA Revolution Anniversary', date: '2025-02-25', type: 'special_non_working', isRecurring: true },
      { name: 'Black Saturday', date: '2025-04-19', type: 'special_non_working', isRecurring: false },
      { name: 'Ninoy Aquino Day', date: '2025-08-21', type: 'special_non_working', isRecurring: true },
      { name: 'All Saints\' Day', date: '2025-11-01', type: 'special_non_working', isRecurring: true },
      { name: 'All Souls\' Day', date: '2025-11-02', type: 'special_non_working', isRecurring: true },
      { name: 'Feast of Immaculate Conception', date: '2025-12-08', type: 'special_non_working', isRecurring: true },
      { name: 'Christmas Eve', date: '2025-12-24', type: 'special_non_working', isRecurring: true },
      { name: "New Year's Eve", date: '2025-12-31', type: 'special_non_working', isRecurring: true },
    ];

    // 2026 Philippine Holidays — Complete official list from timeanddate.com
    // Based on expected Proclamation for 2026
    const holidays2026 = [
      // ===== Regular Holidays (200% pay if worked, 100% if not worked) =====
      { name: "New Year's Day", date: '2026-01-01', type: 'regular', isRecurring: true },
      { name: 'Eid\'l Fitr', date: '2026-03-20', type: 'regular', isRecurring: false, notes: 'Tentative date — subject to NCMF announcement' },
      { name: 'Maundy Thursday', date: '2026-04-02', type: 'regular', isRecurring: false },
      { name: 'Good Friday', date: '2026-04-03', type: 'regular', isRecurring: false },
      { name: 'Araw ng Kagitingan (Day of Valor)', date: '2026-04-09', type: 'regular', isRecurring: true },
      { name: 'Labor Day', date: '2026-05-01', type: 'regular', isRecurring: true },
      { name: 'Eid\'l Adha', date: '2026-05-27', type: 'regular', isRecurring: false, notes: 'Tentative date — subject to NCMF announcement' },
      { name: 'Independence Day', date: '2026-06-12', type: 'regular', isRecurring: true },
      { name: 'National Heroes Day', date: '2026-08-31', type: 'regular', isRecurring: false, notes: 'Last Monday of August' },
      { name: 'Bonifacio Day', date: '2026-11-30', type: 'regular', isRecurring: true },
      { name: 'Christmas Day', date: '2026-12-25', type: 'regular', isRecurring: true },
      { name: 'Rizal Day', date: '2026-12-30', type: 'regular', isRecurring: true },

      // ===== Special Non-Working Days (130% pay if worked, no pay if not worked) =====
      { name: 'Lunar New Year (Chinese New Year)', date: '2026-02-17', type: 'special_non_working', isRecurring: false },
      { name: 'EDSA People Power Revolution Anniversary', date: '2026-02-25', type: 'special_non_working', isRecurring: true },
      { name: 'Black Saturday', date: '2026-04-04', type: 'special_non_working', isRecurring: false },
      { name: 'Ninoy Aquino Day', date: '2026-08-21', type: 'special_non_working', isRecurring: true },
      { name: "All Saints' Day", date: '2026-11-01', type: 'special_non_working', isRecurring: true },
      { name: "All Souls' Day", date: '2026-11-02', type: 'special_non_working', isRecurring: true },
      { name: 'Feast of the Immaculate Conception', date: '2026-12-08', type: 'special_non_working', isRecurring: true },
      { name: 'Christmas Eve', date: '2026-12-24', type: 'special_non_working', isRecurring: true },
      { name: "New Year's Eve", date: '2026-12-31', type: 'special_non_working', isRecurring: true },

      // ===== Special Working Days (normal 100% pay, commemorative only) =====
      { name: 'First Philippine Republic Day', date: '2026-01-23', type: 'special_working', isRecurring: true },
      { name: 'Founding Anniversary of Iglesia ni Cristo', date: '2026-07-27', type: 'special_working', isRecurring: true },
      { name: 'Yamashita Surrender Day', date: '2026-09-03', type: 'special_working', isRecurring: true },
      { name: 'Feast of the Nativity of Mary', date: '2026-09-08', type: 'special_working', isRecurring: true },
      { name: "Sheikh Karim'ul Makhdum Day", date: '2026-11-07', type: 'special_working', isRecurring: true },
    ];

    const allHolidays = [...holidays2025, ...holidays2026];

    for (const holiday of allHolidays) {
      const year = new Date(holiday.date).getFullYear();
      await db.insert(holidays).values({
        id: randomUUID(),
        name: holiday.name,
        date: new Date(holiday.date),
        type: holiday.type,
        year: year,
        isRecurring: holiday.isRecurring,
        workAllowed: true,
        notes: (holiday as any).notes || null,
      });
    }

    console.log('✅ Philippine holidays seeded (2025 Proclamation 727 + 2026 complete official list)');
  } catch (error) {
    console.error('❌ Error seeding holidays:', error);
    throw error;
  }
}

export async function seedSampleUsers() {
  console.log('👥 Checking sample users...');

  try {
    // Check if we already have employees (not just admin)
    const existingEmployees = await db.select().from(users).where(eq(users.role, 'employee')).limit(1);
    
    if (existingEmployees.length > 0) {
      console.log('✅ Sample employees already exist');
      return;
    }

    // Get the default branch
    const branch = await db.select().from(branches).limit(1);
    if (branch.length === 0) {
      console.log('⚠️  No branch found, skipping sample users');
      return;
    }

    const branchId = branch[0].id;
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Realistic NCR café employees — 2026 minimum-wage-based rates
    // NCR daily minimum ~₱645 (2026 est.) = ₱80.63/hr
    // Rates: Manager ~₱120/hr, Shift Lead ~₱97.50, Barista ~₱85, Cashier ~₱82, Kitchen ~₱82.50, Server ~₱80
    const sampleUsers = [
      // Manager (monthly ~₱24,960)
      { 
        id: 'user-mgr-sarah',
        username: 'sarah', 
        firstName: 'Sarah', 
        lastName: 'Cruz', 
        email: 'sarah.cruz@thecafe.ph', 
        role: 'manager', 
        position: 'Branch Manager', 
        hourlyRate: '120.00',
        sssLoan: '0',
        pagibigLoan: '0',
      },
      // Employees
      { 
        id: 'user-emp-sam',
        username: 'sam', 
        firstName: 'Sam', 
        lastName: 'Santos', 
        email: 'sam.santos@thecafe.ph', 
        role: 'employee', 
        position: 'Senior Barista', 
        hourlyRate: '85.00',
        sssLoan: '0',
        pagibigLoan: '0',
      },
      { 
        id: 'user-emp-ana',
        username: 'ana', 
        firstName: 'Ana Marie', 
        lastName: 'Garcia', 
        email: 'ana.garcia@thecafe.ph', 
        role: 'employee', 
        position: 'Cashier', 
        hourlyRate: '82.00',
        sssLoan: '0',
        pagibigLoan: '0',
      },
      { 
        id: 'user-emp-pedro',
        username: 'pedro', 
        firstName: 'Pedro Miguel', 
        lastName: 'Reyes', 
        email: 'pedro.reyes@thecafe.ph', 
        role: 'employee', 
        position: 'Kitchen Staff', 
        hourlyRate: '82.50',
        sssLoan: '800',
        pagibigLoan: '0',
      },
      {
        id: 'user-emp-sofia',
        username: 'sofia',
        firstName: 'Sofia',
        lastName: 'Mendoza',
        email: 'sofia.mendoza@thecafe.ph',
        role: 'employee',
        position: 'Shift Lead',
        hourlyRate: '97.50',
        sssLoan: '0',
        pagibigLoan: '500',
      },
      {
        id: 'user-emp-miguel',
        username: 'miguel',
        firstName: 'Luis Miguel',
        lastName: 'Torres',
        email: 'miguel.torres@thecafe.ph',
        role: 'employee',
        position: 'Barista',
        hourlyRate: '80.00',
        sssLoan: '0',
        pagibigLoan: '0',
      },
      {
        id: 'user-emp-bea',
        username: 'bea',
        firstName: 'Bea',
        lastName: 'Alonzo',
        email: 'bea.alonzo@thecafe.ph',
        role: 'employee',
        position: 'Server',
        hourlyRate: '80.00',
        sssLoan: '0',
        pagibigLoan: '0',
      },
    ];

    for (const user of sampleUsers) {
      // Check if user already exists to avoid unique constraint errors
      const existing = await db.select().from(users).where(eq(users.username, user.username));
      if (existing.length > 0) {
        console.log(`   Skipping ${user.username} (already exists)`);
        continue;
      }

      await db.insert(users).values({
        id: user.id || randomUUID(),
        username: user.username,
        password: hashedPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        position: user.position,
        hourlyRate: user.hourlyRate,
        branchId: branchId,
        isActive: true,
        sssLoanDeduction: user.sssLoan || '0',
        pagibigLoanDeduction: user.pagibigLoan || '0',
      });
    }

    console.log('✅ Sample users created (password: password123)');
  } catch (error) {
    console.error('❌ Error seeding sample users:', error);
    throw error;
  }
}

export async function seedSampleSchedulesAndPayroll() {
  console.log('📅 Seeding sample schedules and payroll...');

  try {
    // Check if shifts already exist
    const existingShifts = await db.select().from(shifts).limit(1);
    if (existingShifts.length > 0) {
      console.log('✅ Sample schedules already exist');
      return;
    }

    // If shifts were cleared but payroll data remains (e.g., after migration cleanup),
    // also clear the orphaned payroll data so we can re-seed cleanly
    const existingPayroll = await db.select().from(payrollPeriods).limit(1);
    if (existingPayroll.length > 0) {
      console.log('  🧹 Clearing orphaned payroll data (shifts were cleared by migration)...');
      try {
        await db.execute(sql`DELETE FROM adjustment_logs`);
        await db.execute(sql`DELETE FROM archived_payroll_periods`);
        await db.execute(sql`DELETE FROM payroll_entries`);
        await db.execute(sql`DELETE FROM payroll_periods`);
      } catch (e) {
        console.warn('  ⚠️ Could not clear payroll data:', e);
      }
    }

    // Get branch and employees
    const branch = await db.select().from(branches).limit(1);
    const allUsers = await db.select().from(users);
    const employees = allUsers.filter(u => u.role === 'employee');
    const manager = allUsers.find(u => u.role === 'manager');

    if (branch.length === 0 || employees.length === 0) {
      console.log('⚠️ No branch or employees found, skipping schedules');
      return;
    }

    const branchId = branch[0].id;

    // ═══════════════════════════════════════════════════════════════
    // CREATE SHIFTS (January–March 2026 Schedule)
    // Each employee works 8-hour shifts, consistent with payroll.
    // All 2026 rates apply (SSS 2026, PhilHealth 2.5%, Pag-IBIG ₱200 cap)
    //
    // IMPORTANT: Hours are stored as UTC but represent Philippine Time (PHT = UTC+8).
    // We subtract 8 from the desired PHT hour to get the UTC hour.
    // This ensures no shift crosses midnight in the user's PHT browser.
    // ═══════════════════════════════════════════════════════════════
    
    const shiftPatterns = [
      { name: 'Morning', start: 0, end: 8 },     // 8AM-4PM PHT (UTC: 0-8)
      { name: 'Day', start: 3, end: 11 },         // 11AM-7PM PHT (UTC: 3-11)
      { name: 'Afternoon', start: 7, end: 15 },   // 3PM-11PM PHT (UTC: 7-15)
    ];

    // Helper: generate working days (Mon-Sat, skip Sundays + holidays)
    function getWorkingDays(year: number, month: number, startDay: number, endDay: number, holidayDates: string[] = []): Date[] {
      const days: Date[] = [];
      for (let d = startDay; d <= endDay; d++) {
        const dt = new Date(Date.UTC(year, month, d));
        if (dt.getUTCDay() === 0) continue; // Skip Sundays
        const dateStr = dt.toISOString().slice(0, 10);
        if (holidayDates.includes(dateStr)) continue; // Skip holidays
        days.push(dt);
      }
      return days;
    }

    // 2026 holidays that affect working days in Jan-Mar
    const jan2026Holidays = ['2026-01-01']; // New Year's Day (regular holiday — paid day off)
    const feb2026Holidays = ['2026-02-17', '2026-02-25']; // Lunar New Year + EDSA (special non-working)
    const mar2026Holidays = ['2026-03-20', '2026-03-28']; // Eid'l Fitr (tentative) + Black Saturday

    // Generate working days for each semi-monthly period
    const jan1_15 = getWorkingDays(2026, 0, 1, 15, jan2026Holidays);  // Jan (month=0)
    const jan16_31 = getWorkingDays(2026, 0, 16, 31, jan2026Holidays);
    const feb1_15 = getWorkingDays(2026, 1, 1, 15, feb2026Holidays);   // Feb (month=1)
    const feb16_28 = getWorkingDays(2026, 1, 16, 28, feb2026Holidays); // Feb 16-28
    const mar1_15 = getWorkingDays(2026, 2, 1, 15, mar2026Holidays);   // Mar (month=2)
    const mar16_31 = getWorkingDays(2026, 2, 16, 31, mar2026Holidays); // Mar 16-31

    const allPeriodDays = [
      { periodId: 'period-2026-01-01', days: jan1_15 },
      { periodId: 'period-2026-01-16', days: jan16_31 },
      { periodId: 'period-2026-02-01', days: feb1_15 },
      { periodId: 'period-2026-02-16', days: feb16_28 },
      { periodId: 'period-2026-03-01', days: mar1_15 },
      { periodId: 'period-2026-03-16', days: mar16_31 },
    ];

    // All staff including manager get shifts
    const allStaff = [...employees, manager].filter(Boolean) as typeof employees;

    for (const { periodId, days } of allPeriodDays) {
      for (const shiftDate of days) {
        for (let i = 0; i < allStaff.length; i++) {
          const emp = allStaff[i];
          const pattern = shiftPatterns[i % shiftPatterns.length];

          const startTime = new Date(shiftDate);
          startTime.setUTCHours(pattern.start, 0, 0, 0);

          const endTime = new Date(shiftDate);
          endTime.setUTCHours(pattern.end, 0, 0, 0);

          await db.insert(shifts).values({
            id: randomUUID(),
            userId: emp.id,
            branchId: branchId,
            startTime: startTime,
            endTime: endTime,
            position: emp.position,
            status: 'completed',
          });
        }
      }
    }
    console.log('   ✅ Created shifts for Jan–Mar 2026 (PHT-aware UTC timestamps)');

    // ── HOLIDAY SHIFTS — skeleton crew works on holidays ─────────
    // In a real café, some staff work on holidays for premium pay.
    const holidayShiftAssignments = [
      // Sam & Sofia work on New Year's Day (regular holiday — 200% rate)
      { userId: 'user-emp-sam', date: new Date(Date.UTC(2026, 0, 1)), staffIdx: 0 },
      { userId: 'user-emp-sofia', date: new Date(Date.UTC(2026, 0, 1)), staffIdx: 3 },
      // Miguel works on Lunar New Year (special non-working — 130% rate)
      { userId: 'user-emp-miguel', date: new Date(Date.UTC(2026, 1, 17)), staffIdx: 4 },
    ];
    for (const hs of holidayShiftAssignments) {
      const pattern = shiftPatterns[hs.staffIdx % shiftPatterns.length];
      const startTime = new Date(hs.date);
      startTime.setUTCHours(pattern.start, 0, 0, 0);
      const endTime = new Date(hs.date);
      endTime.setUTCHours(pattern.end, 0, 0, 0);
      await db.insert(shifts).values({
        id: randomUUID(),
        userId: hs.userId,
        branchId: branchId,
        startTime,
        endTime,
        position: allStaff.find(s => s.id === hs.userId)?.position || 'Staff',
        status: 'completed',
      });
    }
    console.log('   ✅ Created holiday shifts for skeleton crew (New Year, Lunar New Year)');

    // ═══════════════════════════════════════════════════════════════
    // CREATE PAYROLL PERIODS (Jan 1-15, Jan 16-31, Feb 1-15, Feb 16-28, Mar 1-15, Mar 16-31 2026)
    // All deductions use 2026 rates — no year-mismatch issue
    // ═══════════════════════════════════════════════════════════════

    const payrollPeriodsList = [
      { 
        startDate: new Date('2026-01-01'), 
        endDate: new Date('2026-01-15'), 
        status: 'closed',
        id: 'period-2026-01-01'
      },
      { 
        startDate: new Date('2026-01-16'), 
        endDate: new Date('2026-01-31'), 
        status: 'closed',
        id: 'period-2026-01-16'
      },
      { 
        startDate: new Date('2026-02-01'), 
        endDate: new Date('2026-02-15'), 
        status: 'closed',
        id: 'period-2026-02-01'
      },
      { 
        startDate: new Date('2026-02-16'), 
        endDate: new Date('2026-02-28'), 
        status: 'closed',
        id: 'period-2026-02-16'
      },
      { 
        startDate: new Date('2026-03-01'), 
        endDate: new Date('2026-03-15'), 
        status: 'open',
        id: 'period-2026-03-01'
      },
      { 
        startDate: new Date('2026-03-16'), 
        endDate: new Date('2026-03-31'), 
        status: 'open',
        id: 'period-2026-03-16'
      },
    ];

    // Count working days per period for consistent hour calculations
    const periodWorkingDays: Record<string, number> = {
      'period-2026-01-01': jan1_15.length,
      'period-2026-01-16': jan16_31.length,
      'period-2026-02-01': feb1_15.length,
      'period-2026-02-16': feb16_28.length,
      'period-2026-03-01': mar1_15.length,
      'period-2026-03-16': mar16_31.length,
    };

    // ── HOLIDAY & OT CONFIG PER EMPLOYEE/PERIOD ────────────────────
    // Holiday details per period (for pay calculation)
    const periodHolidayDetails: Record<string, { date: string; type: 'regular' | 'special_non_working' }[]> = {
      'period-2026-01-01': [{ date: '2026-01-01', type: 'regular' }],       // New Year's Day
      'period-2026-01-16': [],                                               // Jan 23 special_working = normal pay
      'period-2026-02-01': [],                                               // No holidays
      'period-2026-02-16': [
        { date: '2026-02-17', type: 'special_non_working' },                // Lunar New Year
        { date: '2026-02-25', type: 'special_non_working' },                // EDSA Anniversary
      ],
      'period-2026-03-01': [],                                               // No holidays in early March
      'period-2026-03-16': [
        { date: '2026-03-20', type: 'special_non_working' },                // Eid'l Fitr (tentative)
        { date: '2026-03-28', type: 'special_non_working' },                // Black Saturday
      ],
    };

    // Employee-specific OT hours and holiday work assignments
    const empPeriodConfig: Record<string, Record<string, { overtimeHours: number; workedHolidays: string[] }>> = {
      'user-emp-sam': {
        'period-2026-01-01': { overtimeHours: 3, workedHolidays: ['2026-01-01'] },    // 3h OT Jan 10 + worked NY
      },
      'user-emp-sofia': {
        'period-2026-01-01': { overtimeHours: 0, workedHolidays: ['2026-01-01'] },    // worked NY
        'period-2026-02-01': { overtimeHours: 1.5, workedHolidays: [] },              // 1.5h OT Feb 5
      },
      'user-emp-miguel': {
        'period-2026-02-16': { overtimeHours: 0, workedHolidays: ['2026-02-17'] },    // worked Lunar New Year
      },
      'user-emp-bea': {
        'period-2026-02-16': { overtimeHours: 2, workedHolidays: [] },                // 2h OT Feb 20
      },
    };

    for (const period of payrollPeriodsList) {
      const workingDays = periodWorkingDays[period.id] || 12;

      await db.insert(payrollPeriods).values({
        id: period.id,
        branchId: branchId,
        startDate: period.startDate,
        endDate: period.endDate,
        status: period.status,
        totalHours: (workingDays * 8 * allStaff.length).toString(),
        totalPay: '0', // Updated after entries are calculated
      });

      let periodTotalPay = 0;

      // Create payroll entries for all employees AND the manager
      for (const emp of allStaff) {
        const hourlyRate = parseFloat(emp.hourlyRate);
        const config = empPeriodConfig[emp.id]?.[period.id] || { overtimeHours: 0, workedHolidays: [] };
        const overtimeHours = config.overtimeHours;
        const workedHolidays = config.workedHolidays;
        const nightDiffHours = 0;

        // Regular hours = normal working days × 8 (holidays excluded from working days)
        const regularHoursBase = workingDays * 8;
        // Holiday work hours (employee physically works on the holiday)
        const holidayWorkHours = workedHolidays.length * 8;

        // Basic pay: 1x rate for all hours (regular + holiday-worked)
        const basicPay = (regularHoursBase + holidayWorkHours) * hourlyRate;
        const overtimePay = overtimeHours * hourlyRate * 1.25;
        const nightDiffPay = 0;

        // ── Holiday Pay (DOLE-compliant) ─────────────────────────
        // Regular holiday WORKED:     200% total (1x in basicPay + 1x premium here)
        // Regular holiday NOT WORKED: 100% paid holiday (DOLE Art. 94)
        // SNWD WORKED:               130% total (1x in basicPay + 0.30x premium here)
        // SNWD NOT WORKED:           ₱0 (no work, no pay)
        let holidayPay = 0;
        const holidays = periodHolidayDetails[period.id] || [];
        for (const hol of holidays) {
          if (workedHolidays.includes(hol.date)) {
            // Employee worked on this holiday — premium on top of base
            if (hol.type === 'regular') {
              holidayPay += hourlyRate * 8 * 1.0;   // Extra 100% premium (200% total)
            } else {
              holidayPay += hourlyRate * 8 * 0.30;  // Extra 30% premium (130% total)
            }
          } else {
            // Employee did NOT work on this holiday
            if (hol.type === 'regular') {
              holidayPay += hourlyRate * 8;          // Paid regular holiday (100%)
            }
            // SNWD: no pay if not worked
          }
        }

        const grossPay = basicPay + overtimePay + nightDiffPay + holidayPay;

        // ── Deductions (DOLE-compliant, semi-monthly) ─────────────
        // Matches the live payroll processor logic in routes.ts:
        // 1. Calculate mandatory on MONTHLY salary basis
        // 2. Apply periodFraction = 0.5 (semi-monthly cutoff)
        // 3. Tax on TAXABLE income (gross minus mandatory deductions)
        const { calculateAllDeductions, calculateWithholdingTax } = await import('./utils/deductions');
        // Use calendar days (not working days) to prorate to monthly — matches runtime in routes.ts
        const periodStart = period.startDate;
        const periodEnd = period.endDate;
        const calendarDaysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        const monthlyBasicSalary = (grossPay / calendarDaysInPeriod) * 30;

        // Step 1: SSS, PhilHealth, Pag-IBIG on monthly basis (tax excluded)
        const mandatoryBreakdown = await calculateAllDeductions(monthlyBasicSalary, {
          deductSSS: true,
          deductPhilHealth: true,
          deductPagibig: true,
          deductWithholdingTax: false,
        });

        // Step 2: Semi-monthly = half the monthly contributions
        const periodFraction = 0.5;
        const sssContribution = Math.round(mandatoryBreakdown.sssContribution * periodFraction * 100) / 100;
        const philhealthContribution = Math.round(mandatoryBreakdown.philHealthContribution * periodFraction * 100) / 100;
        const pagibigContribution = Math.round(mandatoryBreakdown.pagibigContribution * periodFraction * 100) / 100;

        // Step 3: BIR withholding tax on TAXABLE income (gross minus mandatory)
        const monthlyMandatory = mandatoryBreakdown.sssContribution +
          mandatoryBreakdown.philHealthContribution + mandatoryBreakdown.pagibigContribution;
        const monthlyTaxableIncome = Math.max(0, monthlyBasicSalary - monthlyMandatory);
        const monthlyTax = await calculateWithholdingTax(monthlyTaxableIncome);
        const withholdingTax = Math.round(monthlyTax * periodFraction * 100) / 100;

        // Recurring loan deductions
        const sssLoan = parseFloat(emp.sssLoanDeduction || '0');
        const pagibigLoan = parseFloat(emp.pagibigLoanDeduction || '0');

        const totalDeductions = sssContribution + philhealthContribution +
          pagibigContribution + withholdingTax + sssLoan + pagibigLoan;
        const netPay = grossPay - totalDeductions;
        periodTotalPay += grossPay;

        const totalHours = regularHoursBase + holidayWorkHours + overtimeHours;

        await db.insert(payrollEntries).values({
          id: randomUUID(),
          userId: emp.id,
          payrollPeriodId: period.id,
          totalHours: totalHours.toFixed(2),
          regularHours: (regularHoursBase + holidayWorkHours).toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          nightDiffHours: nightDiffHours.toFixed(2),
          basicPay: basicPay.toFixed(2),
          overtimePay: overtimePay.toFixed(2),
          nightDiffPay: nightDiffPay.toFixed(2),
          holidayPay: holidayPay.toFixed(2),
          grossPay: grossPay.toFixed(2),
          sssContribution: sssContribution.toFixed(2),
          sssLoan: sssLoan.toFixed(2),
          philHealthContribution: philhealthContribution.toFixed(2),
          pagibigContribution: pagibigContribution.toFixed(2),
          pagibigLoan: pagibigLoan.toFixed(2),
          withholdingTax: withholdingTax.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          deductions: totalDeductions.toFixed(2),
          netPay: netPay.toFixed(2),
          status: period.status === 'closed' ? 'paid' : 'pending',
          paidAt: period.status === 'closed' ? getPaymentDate(period.endDate) : null,
        });
      }

      // Update period totalPay with actual calculated sum
      await db.update(payrollPeriods)
        .set({ totalPay: periodTotalPay.toFixed(2) })
        .where(eq(payrollPeriods.id, period.id));
    }
    console.log('   ✅ Created 6 payroll periods (Jan–Mar 2026) with DOLE-compliant deductions');

    // ═══════════════════════════════════════════════════════════════
    // CREATE TIME-OFF REQUESTS (2026 dates)
    // ═══════════════════════════════════════════════════════════════

    const timeOffRequests_data = [
      { userId: employees[0].id, startDate: new Date('2026-02-23'), endDate: new Date('2026-02-24'), type: 'vacation', reason: 'Family event', status: 'approved' },
      { userId: employees[1].id, startDate: new Date('2026-02-10'), endDate: new Date('2026-02-10'), type: 'sick', reason: 'Medical checkup', status: 'pending' },
      { userId: employees[2].id, startDate: new Date('2026-03-02'), endDate: new Date('2026-03-03'), type: 'vacation', reason: 'Personal travel', status: 'pending' },
    ];

    for (const req of timeOffRequests_data) {
      await db.insert(timeOffRequests).values({
        id: randomUUID(),
        userId: req.userId,
        startDate: req.startDate,
        endDate: req.endDate,
        type: req.type,
        reason: req.reason,
        status: req.status,
      });
    }
    console.log('   ✅ Created time-off requests');

    // ═══════════════════════════════════════════════════════════════
    // CREATE NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════

    const notificationsList = [
      { userId: employees[0].id, type: 'payroll', title: 'Payslip Available', message: 'Your payslip for Feb 1-15, 2026 is now available.' },
      { userId: employees[0].id, type: 'schedule', title: 'New Shift Assigned', message: 'You have been assigned morning shift for Feb 20, 2026.' },
      { userId: employees[1].id, type: 'time_off', title: 'Time-Off Request Pending', message: 'Your sick leave request for Feb 10 is under review.' },
      { userId: manager?.id || employees[0].id, type: 'approval', title: 'Pending Approvals', message: 'You have 2 time-off requests awaiting your approval.' },
      { userId: manager?.id || employees[0].id, type: 'payroll', title: 'Payroll Due', message: 'February 16-28 payroll needs to be processed by Mar 5.' },
    ];

    for (const notif of notificationsList) {
      await db.insert(notifications).values({
        id: randomUUID(),
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: false,
      });
    }
    console.log('   ✅ Created notifications');

    // ═══════════════════════════════════════════════════════════════
    // CREATE ADJUSTMENT LOGS — OT records for Sam, Sofia, and Bea
    // These match the empPeriodConfig above used in payroll calculation.
    // ═══════════════════════════════════════════════════════════════

    if (manager) {
      const otEntries = [
        // Sam: 3 hrs OT on Jan 10 (busy morning shift)
        {
          employeeId: 'user-emp-sam',
          date: new Date(Date.UTC(2026, 0, 10)),
          value: '3',
          payrollPeriodId: 'period-2026-01-01',
          remarks: 'busy morning — extra orders during holiday weekend',
        },
        // Sofia: 1.5 hrs OT on Feb 5 (closing duties)
        {
          employeeId: 'user-emp-sofia',
          date: new Date(Date.UTC(2026, 1, 5)),
          value: '1.5',
          payrollPeriodId: 'period-2026-02-01',
          remarks: 'extended closing duties — inventory count',
        },
        // Bea: 2 hrs OT on Feb 20 (server coverage)
        {
          employeeId: 'user-emp-bea',
          date: new Date(Date.UTC(2026, 1, 20)),
          value: '2',
          payrollPeriodId: 'period-2026-02-16',
          remarks: 'covered absent server — approved by manager',
        },
      ];

      for (const ot of otEntries) {
        const emp = allStaff.find(u => u.id === ot.employeeId);
        if (!emp) continue;
        await db.insert(adjustmentLogs).values({
          id: randomUUID(),
          employeeId: ot.employeeId,
          branchId: branchId,
          loggedBy: manager.id,
          date: ot.date,
          type: 'overtime',
          value: ot.value,
          remarks: ot.remarks,
          status: 'approved',
          verifiedByEmployee: false,
          approvedBy: manager.id,
          approvedAt: ot.date,
          payrollPeriodId: ot.payrollPeriodId,
          calculatedAmount: (parseFloat(emp.hourlyRate) * 1.25 * parseFloat(ot.value)).toFixed(2),
        });
      }
      console.log('   ✅ Created OT exception logs (Sam 3h, Sofia 1.5h, Bea 2h)');
    }

    console.log('✅ Sample schedules and payroll seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding schedules and payroll:', error);
    throw error;
  }
}

export async function markSetupComplete() {
  console.log('🏁 Marking setup as complete...');
  try {
    const existing = await db.select().from(setupStatus).limit(1);
    if (existing.length > 0) {
      await db.update(setupStatus)
        .set({ isSetupComplete: true, setupCompletedAt: new Date() })
        .where(eq(setupStatus.id, existing[0].id));
    } else {
      await db.insert(setupStatus).values({
        id: randomUUID(),
        isSetupComplete: true,
        setupCompletedAt: new Date(),
      });
    }
    console.log('✅ Setup marked as complete');
  } catch (error) {
    console.error('❌ Error marking setup as complete:', error);
    throw error;
  }
}


export async function seedSampleShiftTrades() {
  console.log('🔄 Seeding sample shift trades...');
  try {
    const existingTrades = await db.select().from(shiftTrades).limit(1);
    if (existingTrades.length > 0) {
      console.log('✅ Shift trades already exist');
      return;
    }

    // Get shifts and employees
    const upcomingShifts = await db.select().from(shifts).where(eq(shifts.status, 'scheduled'));
    const allUsers = await db.select().from(users).where(eq(users.role, 'employee'));

    if (upcomingShifts.length < 2 || allUsers.length < 2) {
      console.log('⚠️ Not enough shifts or employees for trades');
      return;
    }

    // Trade 1: Pending Trade (User 1 -> User 2)
    // Find a shift for User 1
    const shift1 = upcomingShifts.find(s => s.userId === allUsers[0].id);
    if (shift1) {
      await db.insert(shiftTrades).values({
        id: randomUUID(),
        shiftId: shift1.id,
        fromUserId: allUsers[0].id,
        toUserId: allUsers[1].id,
        reason: 'Personal duplicate appointment',
        status: 'pending',
        urgency: 'normal',
        requestedAt: new Date(),
      });
    }

    // Trade 2: Open Trade (User 3 offers shift to anyone)
    const shift2 = upcomingShifts.find(s => s.userId === allUsers[2].id);
    if (shift2) {
      await db.insert(shiftTrades).values({
        id: randomUUID(),
        shiftId: shift2.id,
        fromUserId: allUsers[2].id,
        toUserId: null, // Open to anyone
        reason: 'Emergency family matter',
        status: 'pending',
        urgency: 'urgent',
        requestedAt: new Date(),
      });
    }

    // Trade 3: Approved Trade (User 4 -> User 5)
    const shift3 = upcomingShifts.find(s => s.userId === allUsers[3].id);
    if (shift3 && allUsers.length > 4) {
      const tradeId = randomUUID();
      const approvedTime = new Date();
      approvedTime.setHours(approvedTime.getHours() - 2);

      await db.insert(shiftTrades).values({
        id: tradeId,
        shiftId: shift3.id,
        fromUserId: allUsers[3].id,
        toUserId: allUsers[4].id,
        reason: 'Swapping shifts for study time',
        status: 'approved',
        urgency: 'normal',
        requestedAt: approvedTime,
        approvedAt: new Date(),
      });
      
      // Update the shift owner effectively
      await db.update(shifts).set({ userId: allUsers[4].id }).where(eq(shifts.id, shift3.id));
    }

    console.log('   ✅ Created sample shift trades (Pending, Open, Approved)');
  } catch (error) {
    console.error('❌ Error seeding shift trades:', error);
    // Don't throw, just log - we don't want to break the whole init flow for sample data
  }
}
