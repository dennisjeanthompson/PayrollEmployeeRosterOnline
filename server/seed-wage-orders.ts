import "dotenv/config";
import { db } from "./db";
import { wageOrders } from "../shared/schema";

async function seedWageOrders() {
  console.log("Seeding Minimum Wage Orders for 2026...");
  
  const orders = [
    {
      region: "NCR",
      effectiveDate: new Date("2024-07-17"),
      dailyRate: "645.0000",
      isActive: true,
    },
    {
      region: "Region III (Central Luzon)",
      effectiveDate: new Date("2024-01-01"),
      dailyRate: "500.0000",
      isActive: true,
    },
    {
      region: "Region IV-A (CALABARZON)",
      effectiveDate: new Date("2024-01-01"),
      dailyRate: "520.0000",
      isActive: true,
    },
    {
      region: "Region VII (Central Visayas)",
      effectiveDate: new Date("2024-01-01"),
      dailyRate: "468.0000",
      isActive: true,
    }
  ];

  await db.delete(wageOrders);
  await db.insert(wageOrders).values(orders);
  console.log(`Inserted ${orders.length} Wage Orders.`);
}

seedWageOrders().catch(console.error).finally(() => process.exit(0));
