import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function updateLoans() {
  const DATABASE_URL = 'postgresql://neondb_owner:npg_S7gzhAYadl1G@ep-divine-hat-a1pv1eo9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const sql = neon(DATABASE_URL);
  
  try {
    console.log('Updating Sam Santos...');
    await sql`
      UPDATE loan_requests
      SET "total_amount" = '7272.00', "remaining_balance" = '7272.00', "monthly_amortization" = '303.00'
      WHERE "user_id" IN (SELECT id FROM users WHERE "first_name" = 'Sam' AND "last_name" = 'Santos');
    `;
    
    console.log('Updating Ana Marie Garcia...');
    await sql`
      UPDATE loan_requests
      SET "total_amount" = '15000.00', "remaining_balance" = '15000.00', "monthly_amortization" = '300.00'
      WHERE "user_id" IN (SELECT id FROM users WHERE "first_name" = 'Ana Marie' AND "last_name" = 'Garcia');
    `;
    
    console.log('Updating Bea Alonzo...');
    await sql`
      UPDATE loan_requests
      SET "total_amount" = '12000.00', "remaining_balance" = '0.00', "monthly_amortization" = '0.00', "status" = 'completed'
      WHERE "user_id" IN (SELECT id FROM users WHERE "first_name" = 'Bea' AND "last_name" = 'Alonzo');
    `;
    
    console.log('Loan data updated successfully!');
  } catch (err) {
    console.error('Error updating loan data:', err);
  }
}

updateLoans();
