require('dotenv').config();
const bcrypt = require('bcrypt');
const { Pool } = require('@neondatabase/serverless');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const hash = await bcrypt.hash('password123', 10);

  // Check which users have broken passwords
  const allUsers = await pool.query("SELECT username, substring(password, 1, 20) as pw_prefix FROM users ORDER BY username");
  console.log('\n=== All users & password hash prefixes ===');
  for (const row of allUsers.rows) {
    console.log(`  ${row.username}: ${row.pw_prefix}...`);
  }

  // Reset marialourdes and lita
  const r1 = await pool.query("UPDATE users SET password = $1 WHERE username = 'marialourdes' RETURNING username", [hash]);
  const r2 = await pool.query("UPDATE users SET password = $1 WHERE username = 'lita' RETURNING username", [hash]);
  
  console.log('\n=== Password Reset Results ===');
  console.log('marialourdes:', r1.rowCount, 'rows updated');
  console.log('lita:', r2.rowCount, 'rows updated');

  await pool.end();
  console.log('\nDone!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
