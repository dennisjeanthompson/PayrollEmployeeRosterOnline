import 'dotenv/config';
import { db } from './server/db';
import { users } from './shared/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function fix() {
  try {
    const allUsers = await db.select().from(users);
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    for (const u of allUsers) {
      // First name, lowercase, alphanumeric only
      let newUsername = u.firstName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Keep admin as admin ONLY for the main admin account
      if (u.role === 'admin') {
        if (newUsername.includes('admin') || u.username === 'admin') {
          newUsername = 'admin';
        } else {
           // For regional branch admins, leave it as their first name
           // or keep their existing username if we don't want to change it
           newUsername = u.username.includes('admin') ? u.username : newUsername;
        }
      }
      
      // Handle potential duplicate usernames by appending first letter of last name if needed
      let finalUsername = newUsername;
      
      // Check if someone else already has this username
      if (newUsername !== 'admin') {
         const existing = allUsers.find(x => x.id !== u.id && 
           (x.firstName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') === newUsername || x.username === newUsername)
         );
         if (existing) {
             finalUsername = `${newUsername}${u.lastName.charAt(0).toLowerCase()}`;
         }
      }

      await db.update(users)
        .set({ 
          password: defaultPassword, 
          username: finalUsername 
        })
        .where(eq(users.id, u.id));
        
      console.log(`✅ Fixed user: ${u.firstName} ${u.lastName} -> Username: ${finalUsername} (Password: password123)`);
    }
    
    console.log('\n🎉 ALL passwords and usernames have been fixed in the live database!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing users:', error);
    process.exit(1);
  }
}

fix();
