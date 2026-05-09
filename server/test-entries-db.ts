import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// Setup connection
const connectionString = 'postgresql://neondb_owner:npg_S7gzhAYadl1G@ep-divine-hat-a1pv1eo9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

async function test() {
  const allEntries = await db.select().from(schema.payrollEntries);
  console.log(`Found ${allEntries.length} entries.`);

  for (const entry of allEntries) {
    let currentSSS = parseFloat(String((entry as any).sssContribution ?? (entry as any).sss_contribution ?? "0")) || 0;
    
    // Simulate fallback
    if (currentSSS === 0) {
      console.log(`Entry ${entry.id} has 0 SSS.`);
      const basicPay = parseFloat(String(entry.basicPay ?? "0")) || 0;
      console.log(`  basicPay in DB:`, entry.basicPay);
      console.log(`  parsed basicPay:`, basicPay);
      
      const periodFraction = 0.5; // Simulate
      const monthlyBasicSalary = basicPay / periodFraction;
      console.log(`  monthlyBasicSalary:`, monthlyBasicSalary);
    } else {
      console.log(`Entry ${entry.id} has non-zero SSS: ${currentSSS}`);
    }
  }
}
test().catch(console.error).finally(() => pool.end());
