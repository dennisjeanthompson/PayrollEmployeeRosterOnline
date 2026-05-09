// Migration runner for PostgreSQL - reads from .env and executes SQL migrations
// Usage: npx tsx migrations/run-migrations.ts

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

async function runMigrations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('render.com') || DATABASE_URL.includes('neon.tech') 
      ? { rejectUnauthorized: false } 
      : undefined
  });

  console.log('🔄 Running database migrations...\n');

  try {
    const client = await pool.connect();
    
    // Get all SQL migration files in order
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration file(s)\n`);

    for (const file of files) {
      console.log(`🔷 Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      try {
        await client.query(sql);
        console.log(`   ✅ Success\n`);
      } catch (err: any) {
        // Check if it's a "already exists" error - that's okay
        if (err.code === '42P07') { // relation already exists
          console.log(`   ⏭️ Table already exists (skipped)\n`);
        } else if (err.code === '42710') { // object already exists
          console.log(`   ⏭️ Object already exists (skipped)\n`);
        } else {
          throw err;
        }
      }
    }

    client.release();
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
