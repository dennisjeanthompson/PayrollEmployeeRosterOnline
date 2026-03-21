import 'dotenv/config';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Seeder: Assign profile pictures to all users using randomuser.me & dicebear avatars.
 * Uses deterministic URLs so running this twice gives the same result.
 */

// Using randomuser.me CDN — stable, publicly accessible, no API key needed.
// Separate sets for male/female looking avatars; we'll rotate through them.
const femaleAvatars = [
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/women/9.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
  'https://randomuser.me/api/portraits/women/11.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/13.jpg',
];

const maleAvatars = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/men/6.jpg',
  'https://randomuser.me/api/portraits/men/8.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/men/10.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/men/12.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
];

async function seedAvatars() {
  console.log('🖼️  Seeding profile pictures for all users...\n');

  const allUsers = await db.select({
    id: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    role: users.role,
    photoUrl: users.photoUrl,
  }).from(users);

  console.log(`Found ${allUsers.length} users.\n`);

  let femaleIdx = 0;
  let maleIdx = 0;
  let updateCount = 0;

  for (const user of allUsers) {
    // Skip users who already have a custom Cloudinary photo
    if (user.photoUrl && user.photoUrl.includes('cloudinary')) {
      console.log(`  ⏭️  Skipping ${user.firstName} ${user.lastName} (already has Cloudinary photo)`);
      continue;
    }

    // Heuristic: pick female or male based on common Filipino name endings
    // You can adjust this list as needed
    const femaleIndicators = ['ana', 'ina', 'ela', 'ia', 'ita', 'isa', 'ara', 'rea', 'anne', 'marie', 'grace', 'joy', 'rose', 'she', 'lea'];
    const firstName = user.firstName.toLowerCase();
    const isFemale = femaleIndicators.some(f => firstName.includes(f)) || firstName.endsWith('a');

    let avatarUrl: string;
    if (isFemale) {
      avatarUrl = femaleAvatars[femaleIdx % femaleAvatars.length];
      femaleIdx++;
    } else {
      avatarUrl = maleAvatars[maleIdx % maleAvatars.length];
      maleIdx++;
    }

    await db.update(users)
      .set({ photoUrl: avatarUrl })
      .where(eq(users.id, user.id));

    console.log(`  ✅ ${user.role.toUpperCase()} | ${user.firstName} ${user.lastName} → ${avatarUrl}`);
    updateCount++;
  }

  console.log(`\n🎉 Done! Updated ${updateCount} users with profile pictures.`);
  process.exit(0);
}

seedAvatars().catch(err => {
  console.error('❌ Error seeding avatars:', err);
  process.exit(1);
});
