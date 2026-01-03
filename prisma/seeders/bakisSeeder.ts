import { PrismaClient } from "@prisma/client";

export async function seedBaki(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_baki.count();
  if (count > 0) {
    console.log("⏭️ Baki already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding Baki...");



  const data: any = {
  "kodeGudang": "BAKI-01",
  "kodeBaki": "BAKI-01",
  "namaBaki": "Sample Baki",
  "beratBaki": 0,
  "beratBandrol": 0
};

  await prisma.tm_baki.create({
    data,
  });

  console.log("✅ Baki seeded!");
}
