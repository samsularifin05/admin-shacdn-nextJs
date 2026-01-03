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

console.log(
  `\n⚠️  All modules files deleted. Now syncing database (db push)...`
);
try {
  execSync(`npx prisma db push`, { stdio: "inherit" });
  console.log(`\n✅ Database synced successfully!`);
} catch (e) {
  console.error("❌ Failed to run prisma db push. Please run it manually.");
}
