import { PrismaClient } from "@prisma/client";

export async function seedBarang(prisma: PrismaClient) {
  console.log("🌱 Seeding Barang...");

  const data = {
  "kategori": 1,
  "jenis": 1,
  "kodeBaki": 1,
  "barangSepuhan": "TIDAK",
  "stockSepuh": 1000,
  "beratSepuh": 1000,
  "kodeIntern": "BARANG-01",
  "markis": "TIDAK",
  "namaBarang": "Sample Barang",
  "beratAsli": 1000,
  "berat": 1000,
  "kadarCetak": "Sample data",
  "attributeName": "Sample data",
  "beratAtribut": 1000,
  "hargaAtribut": 1000,
  "beratPlastik": 1000,
  "size": "Sample data"
};

  await prisma.tm_barang.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      ...data
    },
  });

  console.log("✅ Barang seeded!");
}
