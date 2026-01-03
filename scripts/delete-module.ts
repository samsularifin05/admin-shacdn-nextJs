import * as fs from "fs";
import * as path from "path";

// Load Config
const args = process.argv.slice(2);
let fileName = args.find((a) => !a.startsWith("--")) || "";
if (!fileName) {
  console.error("❌ Please provide the JSON config filename!");
  console.log("Usage: npm run delete:module bank [--skip-db-push]");
  process.exit(1);
}

const skipDbPush = args.includes("--skip-db-push");

// Automatically prepend 'formJson/' and append '.json' if missing
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

// Also remove seeder file!
const seederPath = path.resolve(
  process.cwd(),
  "prisma/seeders",
  `${resourceName}Seeder.ts`
);
if (fs.existsSync(seederPath)) {
  fs.rmSync(seederPath);
  console.log(`   Deleted Seeder: ${seederPath}`);

  // Optional: remove import/call from seed.ts?
  // Too risky to parse/regex seed.ts reliably for removal. Let user fix imports manually or just leave them (will error on compile if module missing).
  // But wait, if seed.ts imports missing file, build fails.
  // Ideally we should remove it from seed.ts.
}

// Remove from src/config/menus.ts
const menusPath = path.resolve(process.cwd(), "src/config/menus.ts");
if (fs.existsSync(menusPath)) {
  let menusContent = fs.readFileSync(menusPath, "utf-8");
  const href = config.route;
  if (href) {
    // Regex to match the menu item block containing the href
    const menuRegex = new RegExp(
      `\\{\\s*title:\\s*"[^"]*",\\s*href:\\s*"${href}",[\\s\\S]*?\\},`,
      "g"
    );

    if (menuRegex.test(menusContent)) {
      menusContent = menusContent.replace(menuRegex, "");
      fs.writeFileSync(menusPath, menusContent);
      console.log(`🗑️  Removed menu entry for ${href} from menus.ts`);
    }
  }
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

    if (!skipDbPush) {
      console.log("⚠️  Running 'npx prisma db push'...");
      try {
        require("child_process").execSync("npx prisma db push", {
          stdio: "inherit",
        });
      } catch (e) {
        console.error(
          "❌ Failed to run prisma db push. Please run it manually."
        );
      }
    } else {
      console.log("⏭️  Skipping 'prisma db push'...");
    }
  } else {
    console.log(`\nℹ️  Model ${tableName} not found in schema.prisma.`);
  }
}
