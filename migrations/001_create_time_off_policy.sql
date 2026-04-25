-- Migration: Create time_off_policy table for advance notice settings
-- Safe to run multiple times (uses IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS time_off_policy (
    id TEXT PRIMARY KEY,
    branch_id TEXT NOT NULL REFERENCES branches(id),
    leave_type TEXT NOT NULL,
    minimum_advance_days INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_time_off_policy_branch_type 
ON time_off_policy(branch_id, leave_type);

-- Insert default policies for existing branches (if they don't exist)
-- This uses a CTE to get all branch IDs and inserts default policies
INSERT INTO time_off_policy (id, branch_id, leave_type, minimum_advance_days, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid()::text,
    b.id,
    policy.leave_type,
    policy.min_days,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM branches b
CROSS JOIN (
    VALUES 
        ('vacation', 7),
        ('sick', 0),
        ('emergency', 0),
        ('personal', 3),
        ('other', 3)
) AS policy(leave_type, min_days)
WHERE NOT EXISTS (
    SELECT 1 FROM time_off_policy p 
    WHERE p.branch_id = b.id AND p.leave_type = policy.leave_type
);
