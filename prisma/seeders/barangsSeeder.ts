import { PrismaClient } from "@prisma/client";

export async function seedBarang(prisma: PrismaClient) {
  const count = await prisma.tm_barang.count();
  if (count > 0) {
    console.log("⏭️ Barang already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding Barang...");

  for (let i = 1; i <= 20; i++) {
    await prisma.tm_barang.create({
      data: {
        kodeBarang: String(i).padStart(8, "0"), // 00000001
        kategori: 1,
        jenis: 1,
        kodeBaki: 1,
        barangSepuhan: "TIDAK",
        stockSepuh: 1.5,
        beratSepuh: 1.5,
        kodeIntern: `BARANG-${String(i).padStart(2, "0")}`,
        markis: "TIDAK",
        namaBarang: `Sample Barang ${i}`,
        beratAsli: 1.5,
        berat: 1.5,
        kadarCetak: "Sample data",
        attributeName: "Sample data",
        beratAtribut: 1.5,
        hargaAtribut: 1000 + i * 100,
        beratPlastik: 1.5,
        size: "Sample data",
      },
    });
  }

  console.log("✅ 20 Barang seeded!");
}
