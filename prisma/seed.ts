import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import { seedUsers } from "./seeders/userSeeder";
import { seedKategori } from "./seeders/kategorisSeeder";
import { seedJenis } from "./seeders/jenisSeeder";
import { seedBaki } from "./seeders/bakisSeeder";
import { seedBarang } from "./seeders/barangsSeeder";
import { seedSalesTransaction } from "./seeders/sales-transactionsSeeder";
import { seedBank } from "./seeders/banksSeeder";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🚀 Starting database seeding...");

  await seedKategori(prisma);
  await seedBaki(prisma);
  await seedJenis(prisma);
  await seedBarang(prisma);
  await seedUsers(prisma);

  console.log("✨ Database seeding completed!");
  await seedSalesTransaction(prisma);
  await seedBank(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
