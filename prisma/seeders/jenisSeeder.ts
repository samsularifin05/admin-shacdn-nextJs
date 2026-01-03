import { PrismaClient } from "@prisma/client";

export async function seedJenis(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_jenis.count();
  if (count > 0) {
    console.log("⏭️ Jenis already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding Jenis...");

  const firstKodeGroup = await prisma.tm_kategori.findFirst();

  const data: any = {
  "kodeJenis": "JENIS-01",
  "namaJenis": "Sample Jenis",
  "kodeGroup": firstKodeGroup?.id || 1
};

  await prisma.tm_jenis.create({
    data,
  });

  console.log("✅ Jenis seeded!");
}
