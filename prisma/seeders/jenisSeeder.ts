import { PrismaClient } from "@prisma/client";

export async function seedJenis(prisma: PrismaClient) {
  console.log("🌱 Seeding Jenis...");

  const data = {
  "kodeJenis": "JENIS-01",
  "namaJenis": "Sample Jenis",
  "kodeGroup": 1
};

  await prisma.tm_jenis.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      ...data
    },
  });

  console.log("✅ Jenis seeded!");
}
