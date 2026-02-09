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
  fs.readFileSync(configPath, "utf-8"),
) as GeneratorConfig;
const { moduleName, resourceName, tableName } = config;

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
  `${resourceName}Seeder.ts`,
);
if (fs.existsSync(seederPath)) {
  fs.rmSync(seederPath);
  console.log(`   Deleted Seeder: ${seederPath}`);

  // Remove import and call from seed.ts
  const seedPath = path.resolve(process.cwd(), "prisma/seed.ts");
  if (fs.existsSync(seedPath)) {
    let seedContent = fs.readFileSync(seedPath, "utf-8");

    // Remove import line
    const importRegex = new RegExp(
      `import\\s+\\{\\s*seed${moduleName}\\s*\\}\\s+from\\s+["']\\./seeders/${resourceName}Seeder["'];?\\n`,
      "gi",
    );
    seedContent = seedContent.replace(importRegex, "");

    // Remove function call
    const callRegex = new RegExp(
      `\\s*await\\s+seed${moduleName}\\(prisma\\);?\\n`,
      "gi",
    );
    seedContent = seedContent.replace(callRegex, "");

    fs.writeFileSync(seedPath, seedContent);
    console.log(
      `   Updated seed.ts: removed ${resourceName} seeder references`,
    );
  }
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
      "g",
    );

    if (menuRegex.test(menusContent)) {
      menusContent = menusContent.replace(menuRegex, "");
      fs.writeFileSync(menusPath, menusContent);
      console.log(`🗑️  Removed menu entry for ${href} from menus.ts`);
    }
  }
}

console.log("\n✅ Module Deleted Successfully!");

// Remove from schema.prisma (use moduleName for PascalCase model)
const prismaSchemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
if (fs.existsSync(prismaSchemaPath)) {
  let schemaContent = fs.readFileSync(prismaSchemaPath, "utf-8");

  // Regex to match the model block including content and @@map directive
  const modelRegex = new RegExp(`model ${moduleName} \\{[\\s\\S]*?\\}`, "g");

  if (modelRegex.test(schemaContent)) {
    schemaContent = schemaContent.replace(modelRegex, "");
    // Clean up extra blank lines
    schemaContent = schemaContent.replace(/\n{3,}/g, "\n\n");
    fs.writeFileSync(prismaSchemaPath, schemaContent);
    console.log(`\n🗑️  Removed model ${moduleName} from prisma/schema.prisma`);

    if (!skipDbPush) {
      console.log(
        "⚠️  Running 'npx prisma format && npx prisma db push && npx prisma generate'...",
      );
      try {
        require("child_process").execSync(
          "npx prisma format && npx prisma db push && npx prisma generate",
          {
            stdio: "inherit",
          },
        );
      } catch (e) {
        console.error(
          "❌ Failed to run prisma commands. Please run them manually.",
        );
      }
    } else {
      console.log("⏭️  Skipping prisma commands...");
    }
  } else {
    console.log(
      `\nℹ️  Model ${moduleName} not found in schema.prisma (tried both ${moduleName} and ${tableName}).`,
    );
  }
}
