import { PrismaClient } from "@prisma/client";

export async function seedKategori(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_kategori.count();
  if (count > 0) {
    console.log("⏭️ Kategori already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding Kategori...");



  const data: any = {
  "kodeGroup": "KATEGORI-01",
  "namaGroup": "Sample Kategori",
  "jenisGroup": "Sample data",
  "harga": 1000,
  "hargaModal": 1000,
  "kodeWarnaNota": "KATEGORI-01"
};

  await prisma.tm_kategori.create({
    data,
  });

  console.log("✅ Kategori seeded!");
}
