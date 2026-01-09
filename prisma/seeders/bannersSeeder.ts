import { PrismaClient } from "@prisma/client";

export async function seedBanner(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.tm_banner.count();
  if (count > 0) {
    console.log("⏭️ Banner already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding Banner...");



  const data: any = {
  "name": "Sample data",
  "image": "/assets/banners/sample.pdf",
  "link": "Sample data",
  "sequence": 1,
  "isActive": true,
  "description": "Sample data"
};

  await prisma.tm_banner.create({
    data,
  });

  console.log("✅ Banner seeded!");
}
