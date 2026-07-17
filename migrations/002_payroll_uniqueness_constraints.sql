-- Prevent duplicate payroll entries for the same employee in the same period
CREATE UNIQUE INDEX IF NOT EXISTS payroll_entries_user_period_unique
  ON payroll_entries (user_id, payroll_period_id);

-- Prevent more than one open payroll period per branch at a time
CREATE UNIQUE INDEX IF NOT EXISTS payroll_periods_one_open_per_branch
  ON payroll_periods (branch_id)
  WHERE status = 'open';
