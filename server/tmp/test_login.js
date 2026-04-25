import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function test() {
  const allUsers = await db.select().from(users).limit(1);
  if (allUsers.length === 0) {
    console.log("No users found");
    return;
  }
  
  const targetUser = allUsers[0];
  const oldHash = targetUser.password;
  console.log("Old hash:", oldHash);
  
  const rawPw = "TestPass123!";
  const newHash = await bcrypt.hash(rawPw, 10);
  
  // simulate update
  await db.update(users).set({ password: newHash }).where(eq(users.id, targetUser.id));
  
  const updatedUser = await db.select().from(users).where(eq(users.id, targetUser.id)).limit(1);
  console.log("New hash:", updatedUser[0].password);
  
  const isMatch = await bcrypt.compare(rawPw, updatedUser[0].password);
  console.log("Does the new password match?", isMatch);
  
  // put it back
  await db.update(users).set({ password: oldHash }).where(eq(users.id, targetUser.id));
  console.log("Restored original Hash.");
  process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
