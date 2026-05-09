import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  try {
    const tablesRes = await pool.query(`
      SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename
    `);
    console.log("Tables:", tablesRes.rows.map(r => r.tablename));

    const sessionExists = tablesRes.rows.some(r => r.tablename === 'session');
    if (!sessionExists) {
      console.log("⚠️  'session' table MISSING — creating it now...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL,
          CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        )
      `);
      console.log("✅ 'session' table created.");
    } else {
      console.log("✅ 'session' table exists.");
    }
  } catch (err: any) {
    console.error("DB Error:", err.message);
  } finally {
    await pool.end();
  }
}

main();
