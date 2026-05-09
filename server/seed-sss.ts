import "dotenv/config";
import { db } from "./db";
import { sssContributionTable } from "../shared/schema";

async function seedSSS() {
  console.log("Seeding SSS Contribution Table for 2026...");
  
  const entries = [];
  
  // SSS Programmatic generation for brackets
  // Min MSC: 4000, Max MSC: 35000, Step: 500
  // Employee 5%, Employer 10%
  for (let msc = 4000; msc <= 35000; msc += 500) {
    let minComp = msc - 250;
    let maxComp = msc + 249.9999;
    
    // First bracket catches everything below
    if (msc === 4000) minComp = 0;
    // Last bracket catches everything above
    if (msc === 35000) maxComp = 99999999.9999;

    const employeeShare = msc * 0.05;
    const employerShare = msc * 0.10;
    const ec = msc >= 14500 ? 30 : 10;

    entries.push({
      year: 2026,
      minCompensation: minComp.toFixed(4),
      maxCompensation: maxComp.toFixed(4),
      monthlySalaryCredit: msc.toFixed(4),
      employeeShare: employeeShare.toFixed(4),
      employerShare: employerShare.toFixed(4),
      ecContribution: ec.toFixed(4),
    });
  }

  // Clear existing to prevent duplicates if ran multiple times
  await db.delete(sssContributionTable);
  await db.insert(sssContributionTable).values(entries);
  console.log(`Inserted ${entries.length} SSS brackets.`);
}

seedSSS().catch(console.error).finally(() => process.exit(0));
