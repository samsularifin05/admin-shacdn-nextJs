import { PrismaClient } from "@prisma/client";

export async function seedBaki(prisma: PrismaClient) {
  console.log("🌱 Seeding Baki...");

  const data = {
  "kodeGudang": "BAKI-01",
  "kodeBaki": "BAKI-01",
  "namaBaki": "Sample Baki",
  "beratBaki": 1000,
  "beratBandrol": 1000
};

  await prisma.tm_baki.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      ...data
    },
  });

  console.log("✅ Baki seeded!");
}
