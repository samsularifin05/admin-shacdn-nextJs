import { PrismaClient } from "@prisma/client";

export async function seedBarang(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_barang.count();
  if (count > 0) {
    console.log("⏭️ Barang already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding Barang...");

  const firstKategori = await prisma.tm_kategori.findFirst();
  const firstJenis = await prisma.tm_jenis.findFirst();
  const firstKodeBaki = await prisma.tm_baki.findFirst();

  const data: any = {
  "kodeBarang": "00000001",
  "kategori": firstKategori?.id || 1,
  "jenis": firstJenis?.id || 1,
  "kodeBaki": firstKodeBaki?.id || 1,
  "barangSepuhan": "TIDAK",
  "stockSepuh": 0,
  "beratSepuh": 0,
  "kodeIntern": "BARANG-01",
  "markis": "TIDAK",
  "namaBarang": "Sample Barang",
  "beratAsli": 0,
  "berat": 0,
  "kadarCetak": "Sample data",
  "attributeName": "Sample data",
  "beratAtribut": 0,
  "hargaAtribut": 0,
  "beratPlastik": 0,
  "size": "Sample data",
  "stock": 10,
  "hargaJual": 100000
};

  await prisma.tm_barang.create({
    data,
  });

  console.log("✅ Barang seeded!");
}
