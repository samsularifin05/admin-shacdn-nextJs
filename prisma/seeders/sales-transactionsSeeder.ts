import { PrismaClient } from "@prisma/client";

export async function seedSalesTransaction(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_sales_transaction.count();
  if (count > 0) {
    console.log("⏭️ SalesTransaction already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding SalesTransaction...");



  const data = {
  "transactionCode": "CC-FJ-20260103-0001",
  "barcode": "Sample data",
  "namaBarang": "Sample SalesTransaction",
  "berat": 1.5,
  "harga": 1000,
  "customerName": "Sample data",
  "totalAmount": 1000
};

  await prisma.tm_sales_transaction.create({
    data,
  });

  console.log("✅ SalesTransaction seeded!");
}
