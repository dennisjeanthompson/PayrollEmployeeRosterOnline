import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function listBranchesAndUsers() {
  const branches = await pool.query('SELECT id, name FROM branches ORDER BY name');
  for (const branch of branches.rows) {
    console.log(`\nBranch: ${branch.name} (ID: ${branch.id})`);
    const users = await pool.query(
      'SELECT username, role, email FROM users WHERE branch_id = $1 ORDER BY role, username',
      [branch.id]
    );
    if (users.rows.length === 0) {
      console.log('  No users in this branch.');
    } else {
      for (const user of users.rows) {
        let passwordInfo = 'password123';
        if (user.username === 'admin') passwordInfo = 'admin123';
        console.log(`  Username: ${user.username} | Role: ${user.role} | Email: ${user.email} | Password: ${passwordInfo}`);
      }
    }
  }
  await pool.end();
}

listBranchesAndUsers().catch(console.error);
