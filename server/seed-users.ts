import { sql } from './db';
import bcrypt from 'bcrypt';

async function seedUsers() {
  // Get the first branch
  const branch = sql.prepare('SELECT * FROM branches LIMIT 1').get() as any;
  if (!branch) {
    console.log('No branches found');
    return;
  }
  console.log('Using branch:', branch.name);

  const defaultPassword = await bcrypt.hash('password123', 10);

  const users = [
    // Manager
    {
      id: 'user-manager-1',
      username: 'sarah',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@thecafe.com',
      role: 'manager',
      position: 'Store Manager',
      hourlyRate: '350.00',
    },
    // Employees
    {
      id: 'user-emp-1',
      username: 'john',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@thecafe.com',
      role: 'employee',
      position: 'Barista',
      hourlyRate: '125.00',
    },
    {
      id: 'user-emp-2',
      username: 'jane',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@thecafe.com',
      role: 'employee',
      position: 'Cashier',
      hourlyRate: '120.00',
    },
    {
      id: 'user-emp-3',
      username: 'mike',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'mike.brown@thecafe.com',
      role: 'employee',
      position: 'Kitchen Staff',
      hourlyRate: '130.00',
    },
    {
      id: 'user-emp-4',
      username: 'emma',
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@thecafe.com',
      role: 'employee',
      position: 'Barista',
      hourlyRate: '125.00',
    },
    {
      id: 'user-emp-5',
      username: 'alex',
      firstName: 'Alexander',
      lastName: 'Garcia',
      email: 'alex.garcia@thecafe.com',
      role: 'employee',
      position: 'Server',
      hourlyRate: '115.00',
    },
    {
      id: 'user-emp-6',
      username: 'maria',
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@thecafe.com',
      role: 'employee',
      position: 'Shift Lead',
      hourlyRate: '145.00',
    },
  ];

  const insertUser = sql.prepare(`
    INSERT OR IGNORE INTO users (id, username, password, first_name, last_name, email, role, position, hourly_rate, branch_id, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of users) {
    try {
      const result = insertUser.run(
        user.id,
        user.username,
        defaultPassword,
        user.firstName,
        user.lastName,
        user.email,
        user.role,
        user.position,
        user.hourlyRate,
        branch.id,
        1,
        Math.floor(Date.now() / 1000)
      );
      if (result.changes > 0) {
        console.log('✅ Added:', user.username, '-', user.role, '-', user.position);
      } else {
        console.log('ℹ️  Exists:', user.username);
      }
    } catch (e: any) {
      console.log('⚠️  Skipped:', user.username, '-', e.message);
    }
  }

  // Show all users
  const allUsers = sql.prepare('SELECT username, role, position, first_name, last_name FROM users ORDER BY role, username').all() as any[];
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('                    ALL USERS IN DATABASE                    ');
  console.log('════════════════════════════════════════════════════════════');
  console.log('Role       │ Username   │ Name                │ Position');
  console.log('───────────┼────────────┼─────────────────────┼─────────────');
  allUsers.forEach(u => {
    const role = u.role.padEnd(10);
    const username = u.username.padEnd(10);
    const name = `${u.first_name} ${u.last_name}`.padEnd(19);
    console.log(`${role} │ ${username} │ ${name} │ ${u.position}`);
  });
  console.log('════════════════════════════════════════════════════════════');
  console.log('\n📋 Login Credentials (all use password: password123)');
  console.log('   Except admin which uses: admin123');
}

seedUsers().catch(console.error);
