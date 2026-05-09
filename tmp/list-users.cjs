require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // List all users with roles
  const result = await pool.query("SELECT username, first_name, last_name, role, branch_id FROM users ORDER BY branch_id, role, username");
  
  console.log('\n=== ALL USERS IN DATABASE ===\n');
  let currentBranch = '';
  for (const row of result.rows) {
    if (row.branch_id !== currentBranch) {
      currentBranch = row.branch_id;
      console.log(`\n--- Branch: ${currentBranch} ---`);
    }
    console.log(`  [${row.role.padEnd(8)}] ${row.username.padEnd(15)} - ${row.first_name} ${row.last_name}`);
  }
  
  console.log(`\nTotal: ${result.rowCount} users`);
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
