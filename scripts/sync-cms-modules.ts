import * as fs from "fs";
import * as path from "path";
import pg from "pg";
import * as dotenv from "dotenv";
import { prisma } from "@/lib/prisma";

// Load environment variables
dotenv.config();

// Use direct PostgreSQL connection for scripts
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface ModuleConfig {
  moduleName: string;
  resourceName: string;
  tableName: string;
  title: string;
  description?: string;
  icon?: string;
  moduleType?: string;
  route?: string;
  classForm?: string;
  printable?: boolean;
  fields: any[];
  stockLogic?: any;
  [key: string]: any;
}

async function syncModules() {
  console.log("🔄 Syncing formJson modules to database...\n");

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
    return;
  }

  console.log(`Found ${jsonFiles.length} module configuration(s)\n`);

  let successCount = 0;
  let failCount = 0;

  for (const file of jsonFiles) {
    try {
      const configPath = path.join(formJsonDir, file);
      const config = JSON.parse(
        fs.readFileSync(configPath, "utf-8"),
      ) as ModuleConfig;

      console.log(`📦 Syncing: ${config.title} (${config.resourceName})`);

      // Check if module already exists
      const existingModule = await prisma.cmsModule.findUnique({
        where: { resourceName: config.resourceName },
      });

      const moduleData: any = {
        name: config.moduleName,
        resourceName: config.resourceName,
        tableName: config.tableName,
        title: config.title,
        description: config.description || "",
        icon: config.icon,
        moduleType: config.moduleType || "master",
        route: config.route,
        classForm: config.classForm,
        printable: config.printable || false,
        published: false,
        metadata: {
          ...(config.stockLogic && { stockLogic: config.stockLogic }),
        },
      };

      if (existingModule) {
        // Update existing module
        await prisma.cmsModule.update({
          where: { id: existingModule.id },
          data: {
            ...moduleData,
            fields: {
              deleteMany: {},
              create: config.fields.map((field: any, index: number) => ({
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required || false,
                readOnly: field.readOnly || false,
                readOnlyOnEdit: field.readOnlyOnEdit || false,
                defaultValue: field.defaultValue?.toString(),
                placeholder: field.placeholder,
                helpText: field.helpText,
                validation: field.validation
                  ? JSON.stringify(field.validation)
                  : null,
                options: field.options ? JSON.stringify(field.options) : null,
                endpoint: field.endpoint,
                labelField: field.labelField,
                valueField: field.valueField,
                relatedTable: field.relatedTable,
                relatedDisplayField: field.relatedDisplayField,
                autoCode: field.autoCode,
                autoFill: field.autoFill
                  ? JSON.stringify(field.autoFill)
                  : null,
                dependency: field.dependency
                  ? JSON.stringify(field.dependency)
                  : null,
                formula: field.formula,
                uploadDir: field.uploadDir,
                detailFields: field.detailFields
                  ? JSON.stringify(field.detailFields)
                  : null,
                sortOrder: index,
                showInList: true,
                showInForm: true,
                showInDetail: true,
              })),
            },
          },
        });
        console.log(`   ✅ Updated existing module`);
      } else {
        // Create new module
        await prisma.cmsModule.create({
          data: {
            ...moduleData,
            fields: {
              create: config.fields.map((field: any, index: number) => ({
                name: field.name,
                label: field.label,
                type: field.type,
                required: field.required || false,
                readOnly: field.readOnly || false,
                readOnlyOnEdit: field.readOnlyOnEdit || false,
                defaultValue: field.defaultValue?.toString(),
                placeholder: field.placeholder,
                helpText: field.helpText,
                validation: field.validation
                  ? JSON.stringify(field.validation)
                  : null,
                options: field.options ? JSON.stringify(field.options) : null,
                endpoint: field.endpoint,
                labelField: field.labelField,
                valueField: field.valueField,
                relatedTable: field.relatedTable,
                relatedDisplayField: field.relatedDisplayField,
                autoCode: field.autoCode,
                autoFill: field.autoFill
                  ? JSON.stringify(field.autoFill)
                  : null,
                dependency: field.dependency
                  ? JSON.stringify(field.dependency)
                  : null,
                formula: field.formula,
                uploadDir: field.uploadDir,
                detailFields: field.detailFields
                  ? JSON.stringify(field.detailFields)
                  : null,
                sortOrder: index,
                showInList: true,
                showInForm: true,
                showInDetail: true,
              })),
            },
          },
        });
        console.log(`   ✅ Created new module`);
      }

      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      failCount++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Sync Summary:");
  console.log("=".repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📝 Total: ${jsonFiles.length}`);
  console.log("\n🎉 Sync completed!\n");

  await prisma.$disconnect();
}

syncModules().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
