import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface ModuleConfig {
  moduleName: string;
  resourceName: string;
  tableName: string;
  title: string;
  [key: string]: any;
}

// Main execution
console.log("🚀 Generating all modules from formJson directory...\n");

const formJsonDir = path.resolve(process.cwd(), "formJson");

if (!fs.existsSync(formJsonDir)) {
  console.error("❌ formJson directory not found!");
  process.exit(1);
}

const jsonFiles = fs
  .readdirSync(formJsonDir)
  .filter((f) => f.endsWith(".json") && f !== "README.md");

if (jsonFiles.length === 0) {
  console.log("⚠️  No JSON files found in formJson directory");
  process.exit(0);
}

console.log(`Found ${jsonFiles.length} module configuration(s):\n`);

let successCount = 0;
let failCount = 0;
const results: { file: string; status: string; error?: string }[] = [];

for (const file of jsonFiles) {
  try {
    const configPath = path.join(formJsonDir, file);
    const config = JSON.parse(
      fs.readFileSync(configPath, "utf-8"),
    ) as ModuleConfig;

    console.log(`\n📦 Processing: ${config.title} (${config.resourceName})`);
    console.log(`   File: ${file}`);

    // Generate migration first
    console.log(`   ⚙️  Generating database schema...`);
    try {
      execSync(`npx tsx scripts/generate-migration.ts ${file}`, {
        stdio: "pipe",
        encoding: "utf-8",
      });
    } catch (migrationError: any) {
      console.log(`   ⚠️  Migration generation skipped or failed`);
    }

    // Generate module scaffold
    console.log(`   ⚙️  Generating module scaffold...`);
    execSync(`npx tsx scripts/scaffold.ts ${file}`, {
      stdio: "inherit",
    });

    console.log(`   ✅ Success!`);
    results.push({ file, status: "success" });
    successCount++;
  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`);
    results.push({ file, status: "failed", error: error.message });
    failCount++;
  }
}

// Summary
console.log("\n" + "=".repeat(60));
console.log("📊 Generation Summary:");
console.log("=".repeat(60));
console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📝 Total: ${jsonFiles.length}`);

if (failCount > 0) {
  console.log("\n⚠️  Failed modules:");
  results
    .filter((r) => r.status === "failed")
    .forEach((r) => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
}

console.log("\n🎉 Done! Next steps:");
console.log("1. Run: npx prisma migrate dev");
console.log("2. Run: npm run dev");
console.log("3. Check your modules in the admin panel\n");
