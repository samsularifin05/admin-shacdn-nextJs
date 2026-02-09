import * as fs from "fs";
import * as path from "path";

interface FieldConfig {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  relatedTable?: string;
  unique?: boolean;
}

interface ModuleConfig {
  moduleName: string;
  resourceName: string;
  tableName: string;
  fields: FieldConfig[];
}

// Type mapping from form types to Prisma types
const typeMappings: { [key: string]: string } = {
  text: "String",
  textarea: "String",
  email: "String",
  password: "String",
  url: "String",
  color: "String",
  number: "Int",
  currency: "Int",
  rupiah: "Int",
  gram: "Float",
  boolean: "Boolean",
  date: "DateTime",
  datetime: "DateTime",
  time: "DateTime",
  file: "String",
  image: "String",
  select: "String",
  "async-select": "Int", // Usually references another table
};

function generatePrismaSchema(config: ModuleConfig): string {
  const { moduleName, tableName, fields } = config;

  let schema = `model ${moduleName} {\n`;
  schema += `  id        Int      @id @default(autoincrement())\n`;

  fields.forEach((field) => {
    const prismaType = typeMappings[field.type] || "String";
    let fieldLine = `  ${field.name}  ${prismaType}`;

    // Add modifiers
    if (!field.required && field.type !== "boolean") {
      fieldLine += "?";
    }

    // Add default value
    if (field.defaultValue !== undefined) {
      if (typeof field.defaultValue === "string") {
        if (field.defaultValue === "today" || field.defaultValue === "now") {
          fieldLine += " @default(now())";
        } else {
          fieldLine += ` @default("${field.defaultValue}")`;
        }
      } else if (typeof field.defaultValue === "boolean") {
        fieldLine += ` @default(${field.defaultValue})`;
      } else {
        fieldLine += ` @default(${field.defaultValue})`;
      }
    }

    // Add unique constraint
    if (field.unique) {
      fieldLine += " @unique";
    }

    schema += fieldLine + "\n";
  });

  // Add timestamps
  schema += `  createdAt DateTime @default(now())\n`;
  schema += `  updatedAt DateTime @updatedAt\n`;

  // Add table mapping
  schema += `\n  @@map("${tableName}")\n`;
  schema += `}\n`;

  return schema;
}

function generateMigrationSQL(config: ModuleConfig): string {
  const { tableName, fields } = config;

  let sql = `-- CreateTable\n`;
  sql += `CREATE TABLE "${tableName}" (\n`;
  sql += `    "id" SERIAL NOT NULL,\n`;

  fields.forEach((field) => {
    const pgType = getSQLType(field.type);
    let fieldLine = `    "${field.name}" ${pgType}`;

    if (field.required) {
      fieldLine += " NOT NULL";
    }

    if (field.defaultValue !== undefined) {
      if (typeof field.defaultValue === "string") {
        if (field.defaultValue === "today" || field.defaultValue === "now") {
          fieldLine += " DEFAULT CURRENT_TIMESTAMP";
        } else {
          fieldLine += ` DEFAULT '${field.defaultValue}'`;
        }
      } else {
        fieldLine += ` DEFAULT ${field.defaultValue}`;
      }
    }

    sql += fieldLine + ",\n";
  });

  sql += `    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,\n`;
  sql += `    "updatedAt" TIMESTAMP(3) NOT NULL,\n`;
  sql += `\n    CONSTRAINT "${tableName}_pkey" PRIMARY KEY ("id")\n`;
  sql += `);\n`;

  return sql;
}

function getSQLType(fieldType: string): string {
  const sqlTypes: { [key: string]: string } = {
    text: "TEXT",
    textarea: "TEXT",
    email: "VARCHAR(255)",
    password: "TEXT",
    url: "TEXT",
    color: "VARCHAR(7)",
    number: "INTEGER",
    currency: "INTEGER",
    rupiah: "INTEGER",
    gram: "DOUBLE PRECISION",
    boolean: "BOOLEAN",
    date: "TIMESTAMP(3)",
    datetime: "TIMESTAMP(3)",
    time: "TIMESTAMP(3)",
    file: "TEXT",
    image: "TEXT",
    select: "TEXT",
    "async-select": "INTEGER",
  };

  return sqlTypes[fieldType] || "TEXT";
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Please provide the JSON config filename!");
  console.log("Usage: npm run generate:migration bank");
  process.exit(1);
}

let fileName = args[0];
if (!fileName.endsWith(".json")) fileName += ".json";
const configPath = path.resolve(process.cwd(), "formJson", fileName);

if (!fs.existsSync(configPath)) {
  console.error(`❌ Config file not found at: ${configPath}`);
  process.exit(1);
}

console.log(
  `🚀 Generating Prisma schema and migration from: formJson/${fileName}...`,
);

const config = JSON.parse(fs.readFileSync(configPath, "utf-8")) as ModuleConfig;

// Generate Prisma schema
const prismaSchema = generatePrismaSchema(config);
const schemaPath = path.resolve(process.cwd(), "prisma", "schema.prisma");

// Read existing schema
let existingSchema = "";
if (fs.existsSync(schemaPath)) {
  existingSchema = fs.readFileSync(schemaPath, "utf-8");
}

// Check if model already exists
const modelRegex = new RegExp(`model ${config.moduleName} {[\\s\\S]*?}`, "g");
if (modelRegex.test(existingSchema)) {
  console.log(`⚠️  Model ${config.moduleName} already exists in schema.prisma`);
  console.log("Generated schema:");
  console.log(prismaSchema);
} else {
  // Append new model to schema
  fs.appendFileSync(schemaPath, "\n" + prismaSchema);
  console.log(`✅ Added ${config.moduleName} model to schema.prisma`);
}

// Generate migration SQL
const migrationSQL = generateMigrationSQL(config);
const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
const migrationDir = path.resolve(
  process.cwd(),
  "prisma",
  "migrations",
  `${timestamp}_add_${config.tableName}`,
);

if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

const migrationFile = path.join(migrationDir, "migration.sql");
fs.writeFileSync(migrationFile, migrationSQL);

console.log(`✅ Generated migration: ${migrationDir}`);
console.log("\nNext steps:");
console.log("1. Review the generated schema and migration");
console.log("2. Run: npx prisma migrate dev");
console.log("3. Run: npm run generate:module " + config.resourceName);
