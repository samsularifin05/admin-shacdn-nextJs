import { PrismaClient } from "@prisma/client";

export async function seedBank(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_banks.count();
  if (count > 0) {
    console.log("⏭️ Bank already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding Bank...");



  const data: any = {
  "code": "Sample data",
  "name": "Sample data",
  "category": "Local",
  "balance": 0,
  "conversionRate": 1,
  "totalValue": 1000,
  "isActive": true
};

  await prisma.tm_banks.create({
    data,
  });

  console.log("✅ Bank seeded!");
}
