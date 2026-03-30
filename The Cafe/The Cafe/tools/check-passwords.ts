import 'dotenv/config';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function main() {
  const testUsers = ['bautista.m', 'santos.j', 'admin'];
  
  for (const username of testUsers) {
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (user.length === 0) {
      console.log(`❌ User '${username}' NOT FOUND`);
      continue;
    }
    
    const u = user[0];
    const pw = u.password;
    const isBcryptHash = pw.startsWith('$2b$') || pw.startsWith('$2a$');
    console.log(`\n👤 ${username}:`);
    console.log(`   Password starts with: ${pw.substring(0, 10)}...`);
    console.log(`   Length: ${pw.length}`);
    console.log(`   Is bcrypt hash: ${isBcryptHash}`);
    
    if (isBcryptHash) {
      const match = await bcrypt.compare('password123', pw);
      console.log(`   bcrypt.compare('password123'): ${match}`);
    } else {
      console.log(`   Plain text match: ${pw === 'password123'}`);
    }
  }
  
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
