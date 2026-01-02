import * as fs from "fs";
import * as path from "path";

// Load Config
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Please provide the JSON config filename!");
  console.log("Usage: npm run delete:module bank");
  process.exit(1);
}

// Automatically prepend 'formJson/' and append '.json' if missing
let fileName = args[0];
if (!fileName.endsWith(".json")) fileName += ".json";
const configPath = path.resolve(process.cwd(), "formJson", fileName);

if (!fs.existsSync(configPath)) {
  console.error(`❌ Config file not found at: ${configPath}`);
  process.exit(1);
}

interface GeneratorConfig {
  moduleName: string;
  resourceName: string;
  tableName: string;
  route?: string;
}

const config = JSON.parse(
  fs.readFileSync(configPath, "utf-8")
) as GeneratorConfig;
const { resourceName, tableName } = config;

console.log(`🗑️  Deleting module: ${resourceName}...`);

// Paths to delete
const moduleDir = path.resolve(process.cwd(), "src/modules", resourceName);
const apiDir = path.resolve(process.cwd(), "src/pages/api", resourceName);

// Get page directory from route config
let pageDir: string | null = null;
if (config.route) {
  const route = config.route.startsWith("/")
    ? config.route.slice(1)
    : config.route;
  pageDir = path.resolve(process.cwd(), "src/pages", route);
}

// Helper to remove directory recursively
const removeDir = (dir: string) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`   Deleted: ${dir}`);
  } else {
    console.log(`   Skipped (not found): ${dir}`);
  }
};

removeDir(moduleDir);
removeDir(apiDir);
if (pageDir) {
  removeDir(pageDir);
}

console.log("\n✅ Module Deleted Successfully!");
// Remove from schema.prisma
const prismaSchemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
if (fs.existsSync(prismaSchemaPath)) {
  let schemaContent = fs.readFileSync(prismaSchemaPath, "utf-8");

  // Regex to match the model block including content
  const modelRegex = new RegExp(`model ${tableName} \\{[\\s\\S]*?\\}`, "g");

  if (modelRegex.test(schemaContent)) {
    schemaContent = schemaContent.replace(modelRegex, "");
    fs.writeFileSync(prismaSchemaPath, schemaContent);
    console.log(`\n🗑️  Removed model ${tableName} from prisma/schema.prisma`);

    console.log("⚠️  Running 'npx prisma db push'...");
    try {
      require("child_process").execSync("npx prisma db push", {
        stdio: "inherit",
      });
    } catch (e) {
      console.error("❌ Failed to run prisma db push. Please run it manually.");
    }
  } else {
    console.log(`\nℹ️  Model ${tableName} not found in schema.prisma.`);
  }
}
