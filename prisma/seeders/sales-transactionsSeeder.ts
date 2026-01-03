import { PrismaClient } from "@prisma/client";

export async function seedSalesTransaction(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_sales_transaction.count();
  if (count > 0) {
    console.log("⏭️ SalesTransaction already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding SalesTransaction...");

  const detailItemsBarangId = await prisma.tm_barang.findFirst();

  const data: any = {
  "transactionCode": "SLS-20260104-0001",
  "transactionDate": "2026-01-03",
  "customerName": "CASH",
  "items": {
    "create": [
      {
        "barangId": detailItemsBarangId?.id || 1,
        "harga": 500,
        "qty": 500,
        "subtotal": 500
      }
    ]
  },
  "totalAmount": 0,
  "paymentMethod": "TUNAI"
};

  await prisma.tm_sales_transaction.create({
    data,
  });

  console.log("✅ SalesTransaction seeded!");
}
