import { PrismaClient } from "@prisma/client";

export async function seedBarang(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_barang.count();
  if (count > 0) {
    console.log("⏭️ Barang already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding Barang...");

  const data = {
  "kodeBarang": "00000001",
  "kategori": 1,
  "jenis": 1,
  "kodeBaki": 1,
  "barangSepuhan": "TIDAK",
  "stockSepuh": 1.5,
  "beratSepuh": 1.5,
  "kodeIntern": "BARANG-01",
  "markis": "TIDAK",
  "namaBarang": "Sample Barang",
  "beratAsli": 1.5,
  "berat": 1.5,
  "kadarCetak": "Sample data",
  "attributeName": "Sample data",
  "beratAtribut": 1.5,
  "hargaAtribut": 1000,
  "beratPlastik": 1.5,
  "size": "Sample data"
};

  await prisma.tm_barang.create({
    data,
  });

  console.log("✅ Barang seeded!");
}
