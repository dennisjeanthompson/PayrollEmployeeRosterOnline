import 'dotenv/config';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      ALTER TABLE time_off_requests
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `);
    console.log('✓ Migration complete: rejection_reason column added to time_off_requests');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
