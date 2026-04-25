import 'dotenv/config';
import { db } from './db';
import { users, branches, shifts } from '../shared/schema';
import crypto from 'crypto';
import { format, addDays, startOfDay, getDay } from 'date-fns';
import { eq } from 'drizzle-orm';

async function seedHistoricalShifts() {
  console.log('🌱 Seeding historical and future shifts for accurate forecasting...\n');

  try {
    const allUsers = await db.select().from(users);
    const allBranches = await db.select().from(branches).limit(1);
    const branch = allBranches[0];
    
    if (!branch) {
      console.log('❌ No branch found. Please run setup first.');
      return;
    }

    const employees = allUsers.filter(u => u.role === 'employee' || u.role === 'manager');

    console.log(`📍 Branch: ${branch.name}`);
    console.log(`👥 Generating shifts for ${employees.length} employees/managers\n`);

    const today = startOfDay(new Date());

    const getDateObj = (date: Date, hour: number = 0, minute: number = 0) => {
      const d = new Date(date);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    // PHT-safe shift patterns — avoid UTC hours 6, 10, 14 which trigger old migration
    // These hours represent Philippine Time (UTC+8) standard café shifts
    const weekdayPatterns = [
      { start: 8, end: 16 },   // 8am - 4pm
      { start: 11, end: 19 },  // 11am - 7pm
      { start: 15, end: 23 },  // 3pm - 11pm
    ];
    
    const weekendPatterns = [
      { start: 7, end: 15 },   // 7am - 3pm
      { start: 8, end: 16 },   // 8am - 4pm
      { start: 12, end: 20 },  // 12pm - 8pm
      { start: 15, end: 23 },  // 3pm - 11pm
    ];

    let shiftCount = 0;
    const batchSize = 100;
    let shiftsToInsert: any[] = [];
    
    for (let dayOffset = -60; dayOffset <= 14; dayOffset++) {
      const currentDate = addDays(today, dayOffset);
      const dayOfWeek = getDay(currentDate); 
      const isSunday = dayOfWeek === 0;
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
      
      // Sunday: skeleton crew only (30% of staff)
      // Weekend (Fri/Sat): busy, 90% of staff
      // Weekday: normal, 60% of staff
      const staffPercentage = isSunday ? 0.3 : (isWeekend ? 0.9 : 0.6);
      const targetStaffCount = Math.max(2, Math.ceil(employees.length * staffPercentage));
      
      const shuffledEmployees = [...employees].sort(() => 0.5 - Math.random());
      const selectedEmployees = shuffledEmployees.slice(0, targetStaffCount);
      
      for (const emp of selectedEmployees) {
        const patterns = isWeekend ? weekendPatterns : weekdayPatterns;
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        const shiftId = `hist-shift-${emp.id}-d${dayOffset}-${crypto.randomUUID().slice(0, 8)}`;
        let status = 'completed';
        if (dayOffset === 0) status = 'scheduled';
        if (dayOffset > 0) status = 'scheduled';
        
        shiftsToInsert.push({
          id: shiftId,
          userId: emp.id,
          branchId: branch.id,
          startTime: getDateObj(currentDate, pattern.start),
          endTime: getDateObj(currentDate, pattern.end),
          position: emp.position || 'Staff',
          status: status,
          createdAt: new Date(),
        });
        
        shiftCount++;

        if (shiftsToInsert.length >= batchSize) {
          await db.insert(shifts).values(shiftsToInsert).onConflictDoNothing();
          shiftsToInsert = [];
        }
      }
    }

    if (shiftsToInsert.length > 0) {
      await db.insert(shifts).values(shiftsToInsert).onConflictDoNothing();
    }

    console.log(`✅ Created ${shiftCount} realistic historical and future shifts (60 days back, 14 days forward).`);
    console.log('📈 Forecasting APIs will now detect clear weekly patterns and use real data instead of defaults.\n');
  } catch (err) {
    console.error('Error seeding shifts:', err);
  }
}

seedHistoricalShifts().catch(console.error);
