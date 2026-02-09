import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const formJsonDir = path.resolve(process.cwd(), "formJson");

// Check if directory exists
if (!fs.existsSync(formJsonDir)) {
  console.error(`❌ Directory not found: ${formJsonDir}`);
  process.exit(1);
}

// Get all .json files
const files = fs.readdirSync(formJsonDir).filter((f) => f.endsWith(".json"));

if (files.length === 0) {
  console.log("⚠️ No JSON config files found.");
  process.exit(0);
}

console.log(`🚀 Found ${files.length} config files. Deleting modules...`);

// Iterate and execute delete script for each file
files.forEach((file, index) => {
  console.log(`\n[${index + 1}/${files.length}] 🗑️  Processing: ${file}...`);
  try {
    // Run with --skip-db-push to avoid multiple schema syncs
    execSync(`npx tsx scripts/delete-module.ts ${file} --skip-db-push`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.error(`❌ Failed to delete module for ${file}`);
  }
});

// Clean up seed.ts - reset to default with only existing seeders
console.log(`\n🧹 Cleaning up prisma/seed.ts...`);
const seedPath = path.resolve(process.cwd(), "prisma/seed.ts");
const seedersDir = path.resolve(process.cwd(), "prisma/seeders");

if (fs.existsSync(seedPath)) {
  // Get list of existing seeder files
  const existingSeeders: Array<{ file: string; functionName: string }> = [];
  
  if (fs.existsSync(seedersDir)) {
    fs.readdirSync(seedersDir)
      .filter(f => f.endsWith("Seeder.ts"))
      .forEach(file => {
        const fileName = file.replace(".ts", "");
        // Convert kategorisSeeder -> seedKategori, userSeeder -> seedUsers, etc
        const content = fs.readFileSync(
          path.join(seedersDir, file),
          "utf-8"
        );
        const exportMatch = content.match(/export\s+(?:async\s+)?function\s+(\w+)/);
        if (exportMatch) {
          existingSeeders.push({
            file: fileName,
            functionName: exportMatch[1],
          });
        }
      });
  }

  // Build new seed.ts content
  const imports = existingSeeders
    .map(s => `import { ${s.functionName} } from "./seeders/${s.file}";`)
    .join("\n");
  
  const calls = existingSeeders
    .map(s => `  await ${s.functionName}(prisma);`)
    .join("\n");

  const newSeedContent = `import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
${imports}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🚀 Starting database seeding...");
${calls}
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
`;

  fs.writeFileSync(seedPath, newSeedContent);
  console.log(`✅ prisma/seed.ts cleaned up successfully!`);
}

console.log(
  `\n⚠️  All modules files deleted. Now syncing database (db push)...`
);
try {
  execSync(`npx prisma db push`, { stdio: "inherit" });
  console.log(`\n✅ Database synced successfully!`);
} catch (e) {
  console.error("❌ Failed to run prisma db push. Please run it manually.");
}
