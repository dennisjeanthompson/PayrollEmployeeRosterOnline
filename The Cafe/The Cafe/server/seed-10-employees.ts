import * as dotenv from 'dotenv';
dotenv.config();

async function seed() {
  const { db } = await import('./db');
  const { users, branches, shifts } = await import('../shared/schema');
  const { eq } = await import('drizzle-orm');
  const { randomUUID } = await import('crypto');
  const bcrypt = (await import('bcrypt')).default;
  const { seedSampleSchedulesAndPayroll } = await import('./init-db');

  console.log('🌱 Seeding 10 employees...');

  try {
    // 1. Get Branch
    const branchRes = await db.select().from(branches).limit(1);
    let branchId;
    if (branchRes.length === 0) {
      console.log('Creating default branch...');
      branchId = randomUUID();
      await db.insert(branches).values({
        id: branchId,
        name: 'Main Branch',
        address: '123 Main St, Manila',
        phone: '09170000000',
        isActive: true,
      });
    } else {
      branchId = branchRes[0].id;
    }

    // 2. Create Users
    const password = await bcrypt.hash('password123', 10);
    
    const newEmployees = [
      { firstName: 'Sam', lastName: 'Santos', position: 'Barista', rate: '112.50' },
      { firstName: 'Ana Marie', lastName: 'Garcia', position: 'Cashier', rate: '93.75' },
      { firstName: 'Pedro Miguel', lastName: 'Reyes', position: 'Kitchen Staff', rate: '100.00' },
      { firstName: 'Sofia', lastName: 'Mendoza', position: 'Shift Lead', rate: '150.00' },
      { firstName: 'Luis Miguel', lastName: 'Torres', position: 'Barista', rate: '112.50' },
      { firstName: 'Bea', lastName: 'Alonzo', position: 'Server', rate: '100.00' },
      // Manager is usually seeded separately or handled here if needed, but this script seems to focus on employees
      // We can add the manager if this script is intended to be comprehensive
      { firstName: 'Sarah', lastName: 'Thompson', position: 'Branch Manager', role: 'manager', rate: '187.50' },
    ];

    for (const emp of newEmployees) {
      const username = `${emp.firstName.toLowerCase()}${emp.lastName.toLowerCase()}`;
      const email = `${username}@thecafe.ph`;

      // Check if exists
      const existing = await db.select().from(users).where(eq(users.username, username));
      if (existing.length > 0) {
        console.log(`Skipping ${username} (already exists)`);
        continue;
      }

      await db.insert(users).values({
        id: randomUUID(),
        username,
        password, // password123
        firstName: emp.firstName,
        lastName: emp.lastName,
        email,
        role: (emp.role as any) || 'employee',
        position: emp.position,
        hourlyRate: emp.rate,
        branchId,
        isActive: true,
        photoUrl: null,
        photoPublicId: null
      });
      console.log(`Created user: ${username}`);
    }

    // 3. Generate Schedules and Payroll
    console.log('Generating schedules and payroll...');
    await seedSampleSchedulesAndPayroll();

    console.log('✅ Successfully seeded employees and schedules.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
}

seed();
