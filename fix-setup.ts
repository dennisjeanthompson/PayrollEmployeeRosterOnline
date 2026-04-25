import { db } from "./server/db";
import { setupStatus } from "./shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function run() {
  const existing = await db.select().from(setupStatus).limit(1);
  if (existing.length > 0) {
    await db.update(setupStatus)
      .set({ isSetupComplete: true, setupCompletedAt: new Date() })
      .where(eq(setupStatus.id, existing[0].id));
    console.log("Updated existing setup_status row.");
  } else {
    await db.insert(setupStatus).values({
      id: randomUUID(),
      isSetupComplete: true,
      setupCompletedAt: new Date(),
    });
    console.log("Inserted new setup_status row.");
  }
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
