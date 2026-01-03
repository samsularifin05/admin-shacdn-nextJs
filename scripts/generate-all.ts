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

console.log(`🚀 Found ${files.length} config files. Generating modules...`);

// Iterate and execute scaffold script for each file
files.forEach((file, index) => {
  console.log(`\n[${index + 1}/${files.length}] 🔨 Processing: ${file}...`);
  try {
    // Run the scaffold script synchronously
    execSync(`npx tsx scripts/scaffold.ts ${file}`, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Failed to generate module for ${file}`);
    // We continue to the next file even if one fails
  }
});

console.log(
  `\n✅ All modules processed! Don't forget to restart your dev server.`
);
