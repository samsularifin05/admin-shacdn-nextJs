import { PrismaClient } from "@prisma/client";

export async function seedKategori(prisma: PrismaClient) {
  console.log("🌱 Seeding Kategori...");

  const data = {
  "kodeGroup": "KATEGORI-01",
  "namaGroup": "Sample Kategori",
  "jenisGroup": "Sample data",
  "harga": 1000,
  "hargaModal": 1000,
  "kodeWarnaNota": "KATEGORI-01"
};

  await prisma.tm_kategori.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      ...data
    },
  });

  console.log("✅ Kategori seeded!");
}
