import * as fs from "fs";
import * as path from "path";

// Types
type FieldType =
  | "string"
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "email"
  | "currency"
  | "rupiah"
  | "async-select"
  | "gram"
  | "detail"; // New type for cart/detail collections

interface DetailField {
  name: string;
  label: string;
  type: "string" | "number" | "currency" | "rupiah" | "async-select" | "gram";
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  relatedTable?: string;
  autoFill?: Record<string, string>;
  readOnly?: boolean;
}

interface Field {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[];
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  relatedTable?: string;
  relatedDisplayField?: string;
  autoCode?: string;
  defaultValue?: any;
  formula?: string;
  readOnly?: boolean;
  readOnlyOnEdit?: boolean;
  validation?: {
    min?: number;
    max?: number;
  };
  uppercase?: boolean;
  dependency?: {
    field: string;
    queryParam: string;
  };
  autoFill?: Record<string, string>;
  // For detail type
  detailFields?: DetailField[];
}

interface GeneratorConfig {
  moduleName: string;
  resourceName: string;
  tableName: string;
  title: string;
  route?: string;
  classForm?: string;
  fields: Field[];
  printable?: boolean;
  stockLogic?: {
    type: "reduce" | "increase";
    targetTable: string; // e.g., "tm_barang"
    identifierField: string; // e.g., "barangId" -> identifies which item to update
    stockField: string; // e.g., "stock"
    quantityField: string; // e.g., "qty"
  };
}

// Helpers
const toPascalCase = (str: string) =>
  str.charAt(0).toUpperCase() +
  str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());

const toCamelCase = (str: string) =>
  str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, "")
    .replace(/-/g, "");

// Load Config
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Please provide the JSON config filename!");
  console.log("Usage: npm run generate:module bank");
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

console.log(`🚀 Generating module from: formJson/${fileName}...`);

const config = JSON.parse(
  fs.readFileSync(configPath, "utf-8")
) as GeneratorConfig;
const { moduleName, resourceName, tableName, fields, classForm, title } =
  config;

// Auto-detect relations for async-select fields
// Build a map of resourceName → {tableName, labelField}
const formJsonDir = path.resolve(process.cwd(), "formJson");
const resourceMap = new Map<
  string,
  { tableName: string; codeField?: string; nameField?: string }
>();

if (fs.existsSync(formJsonDir)) {
  const jsonFiles = fs
    .readdirSync(formJsonDir)
    .filter((f) => f.endsWith(".json"));
  jsonFiles.forEach((file) => {
    try {
      const cfg = JSON.parse(
        fs.readFileSync(path.join(formJsonDir, file), "utf-8")
      ) as GeneratorConfig;
      // Find the first text field that looks like a code (contains 'kode' or 'code')
      const codeField = cfg.fields.find(
        (f) =>
          f.type === "text" &&
          (f.name.toLowerCase().includes("kode") ||
            f.name.toLowerCase().includes("code"))
      );
      // Find name field
      const nameField = cfg.fields.find(
        (f) =>
          f.type === "text" &&
          (f.name.toLowerCase().includes("nama") ||
            f.name.toLowerCase().includes("name"))
      );

      resourceMap.set(cfg.resourceName, {
        tableName: cfg.tableName,
        codeField: codeField?.name,
        nameField: nameField?.name,
      });
    } catch (e) {
      // Skip invalid files
    }
  });
}

// Enrich async-select fields with relation info
fields.forEach((field) => {
  if (field.type === "async-select" && field.endpoint) {
    // Extract resource name from endpoint: /api/kategoris → kategoris
    const match = field.endpoint.match(/\/api\/([^/?]+)/);
    if (match) {
      const relatedResource = match[1];
      const relatedInfo = resourceMap.get(relatedResource);
      if (relatedInfo) {
        field.relatedTable = relatedInfo.tableName;
        // Prefer the labelField specified in the config, otherwise use codeField or nameField
        field.relatedDisplayField =
          field.labelField ||
          relatedInfo.codeField ||
          relatedInfo.nameField ||
          "name";
      }
    }
  }
});

// Paths
const moduleDir = path.resolve(process.cwd(), "src/modules", resourceName);
const apiDir = path.resolve(process.cwd(), "src/pages/api", resourceName);

[
  path.join(moduleDir, "components"),
  path.join(moduleDir, "services"),
  path.join(moduleDir, "server"),
  path.join(moduleDir, "types"),
  apiDir,
].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Generators

const generateSchema = () => {
  const schemaFields = fields
    .map((f) => {
      const isOptional = f.required === false || f.required === undefined;
      let zodType = "";
      if (
        f.type === "number" ||
        f.type === "currency" ||
        f.type === "rupiah" ||
        f.type === "gram"
      ) {
        zodType = "z.coerce.number()";
      } else if (f.type === "boolean") {
        zodType = "z.boolean()";
      } else if (f.type === "select" && f.options) {
        zodType = `z.enum([${f.options.map((opt) => `"${opt}"`).join(",")}])`;
      } else if (f.type === "async-select") {
        if (f.relatedTable && (!f.valueField || f.valueField === "id")) {
          zodType = "z.coerce.number()";
        } else {
          zodType = "z.string()";
        }
      } else if (f.type === "email") {
        zodType = "z.string().email()";
      } else if (f.type === "detail" && f.detailFields) {
        const detailZodFields = f.detailFields
          .map((df) => {
            let dfZod = "";
            if (
              df.type === "number" ||
              df.type === "currency" ||
              df.type === "rupiah" ||
              df.type === "gram"
            )
              dfZod = "z.coerce.number()";
            else if (df.type === "async-select") dfZod = "z.coerce.number()";
            else dfZod = "z.string()";
            return `${df.name}: ${dfZod}${df.readOnly ? ".optional()" : ""}`;
          })
          .join(", ");
        zodType = `z.array(z.object({ ${detailZodFields} })).default([])`;
      } else {
        zodType = "z.string()";
      }

      if (isOptional) {
        if (f.type === "select" || f.type === "async-select") {
          zodType += ".optional().nullable()";
        } else {
          zodType += ".optional()";
        }
      } else {
        // Only add .min(1) for string-based types
        if (
          f.type === "string" ||
          f.type === "text" ||
          f.type === "email" ||
          (f.type === "async-select" &&
            !(f.relatedTable && (!f.valueField || f.valueField === "id")))
        ) {
          zodType += ".min(1, 'Required')";
        }
      }

      // Add text transformation (uppercase default)
      if (f.type === "string" || f.type === "text" || f.type === "email") {
        const isUppercase = f.uppercase !== false; // Default true
        if (isUppercase) {
          // Use safe transform handling nullable/optional
          zodType += ".transform(v => v?.toUpperCase())";
        } else {
          zodType += ".transform(v => v?.toLowerCase())";
        }
      }

      return `  ${f.name}: ${zodType},`;
    })
    .join("\n");

  const typeFields = fields
    .map((f) => {
      const isOptional = f.required === false || f.required === undefined;
      let tsType = "";
      if (
        f.type === "number" ||
        f.type === "currency" ||
        f.type === "rupiah" ||
        f.type === "gram"
      ) {
        tsType = "number";
      } else if (f.type === "boolean") {
        tsType = "boolean";
      } else if (f.type === "select" && f.options) {
        tsType = f.options.map((opt) => `"${opt}"`).join(" | ");
      } else if (f.type === "async-select") {
        if (f.relatedTable && (!f.valueField || f.valueField === "id")) {
          tsType = "number";
        } else {
          tsType = "string";
        }
      } else if (f.type === "detail" && f.detailFields) {
        const detailTsFields = f.detailFields
          .map((df) => {
            let dfTs =
              df.type === "number" ||
              df.type === "currency" ||
              df.type === "rupiah" ||
              df.type === "gram" ||
              df.type === "async-select"
                ? "number"
                : "string";
            return `    ${df.name}: ${dfTs};`;
          })
          .join("\n");
        tsType = "{\n" + detailTsFields + "\n  }[]";
      } else {
        tsType = "string";
      }
      return `  ${f.name}${isOptional ? "?" : ""}: ${tsType};`;
    })
    .join("\n");

  const relationFields = fields
    .filter((f) => f.type === "async-select")
    .map((f) => `  ${f.name}Rel?: any;`)
    .join("\n");

  return `import { z } from "zod";

export const ${toCamelCase(moduleName)}Schema = z.object({
${schemaFields}
});

export type ${moduleName}FormData = z.infer<typeof ${toCamelCase(
    moduleName
  )}Schema>;

export type ${moduleName} = {
  id: number;
${typeFields}
${relationFields}
  createdAt?: string;
  updatedAt?: string;
};
`;
};

const generateService = () => {
  return `import { ${moduleName}, ${moduleName}FormData } from "../types/${resourceName}.schema";
import { apiClient } from "@/lib/api-client";

const API_BASE = "/api/${resourceName}";

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ${toCamelCase(moduleName)}Service = {
  async getAll(page = 1, limit = 10, search?: string): Promise<PaginatedResult<${moduleName}>> {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) query.append("search", search);
    const res = await apiClient.get(\`\${API_BASE}?\${query.toString()}\`);
    return res.json();
  },

  async create(data: ${moduleName}FormData): Promise<${moduleName}> {
    const res = await apiClient.post(API_BASE, data);
    return res.json();
  },

  async update(id: number, data: ${moduleName}FormData): Promise<${moduleName}> {
    const res = await apiClient.put(\`\${API_BASE}/\${id}\`, data);
    return res.json();
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(\`\${API_BASE}/\${id}\`);
  },
};
`;
};

const generateServer = () => {
  // Build include object for relations
  const asyncSelectFields = fields.filter(
    (f) =>
      f.type === "async-select" &&
      f.relatedTable &&
      (!f.valueField || f.valueField === "id")
  );
  const detailFields = fields.filter((f) => f.type === "detail");

  const includeStr =
    asyncSelectFields.length > 0 || detailFields.length > 0
      ? `\n        include: {\n${[
          ...asyncSelectFields.map((f) => `          ${f.name}Rel: true`),
          ...detailFields.map((f) => {
            const detailRelations = f.detailFields
              ?.filter((df) => df.type === "async-select" && df.relatedTable)
              .map((df) => `${df.name}Rel: true`)
              .join(", ");
            return detailRelations
              ? `          ${f.name}: { include: { ${detailRelations} } }`
              : `          ${f.name}: true`;
          }),
        ].join(",\n")}\n        },`
      : "";

  const autoCodeFields = fields.filter((f) => f.autoCode);
  const autoCodeLogic =
    autoCodeFields.length > 0
      ? `\n    // Auto-generate codes for: ${autoCodeFields
          .map((f) => f.name)
          .join(", ")}
${autoCodeFields
  .map((f) => {
    const pattern = f.autoCode!;
    // Match sequence pattern like {0000} or {0001}
    const seqMatch = pattern.match(/\{0*[01]?\}/);
    const seqPattern = seqMatch ? seqMatch[0] : "{0000}";
    const seqLength = seqPattern.length - 2;

    // Check if pattern has date placeholders
    const hasDate =
      pattern.includes("{YYYY") ||
      pattern.includes("{MM}") ||
      pattern.includes("{DD}");

    // Check if there's any prefix/suffix around the sequence pattern
    // For pure sequential like {00000000}, this will be true
    const isPureSequential = pattern === seqPattern;

    // For patterns with prefix, extract it (without date placeholders for now)
    let staticPrefix = pattern.replace(seqPattern, "");

    // Check if prefix contains date placeholders
    const hasPrefixWithDate =
      staticPrefix.includes("{YYYY") ||
      staticPrefix.includes("{MM}") ||
      staticPrefix.includes("{DD}");

    let codeGenLogic = "";

    // Add date variables only if needed
    if (hasDate) {
      codeGenLogic = `    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

`;
    }

    if (isPureSequential) {
      // No prefix - pure sequential number
      codeGenLogic += `    const lastRecord_${
        f.name
      } = await prisma.${toCamelCase(tableName)}.findFirst({
      orderBy: { ${f.name}: "desc" },
    });

    let nextSeq_${f.name} = 1;
    if (lastRecord_${f.name}) {
      const lastCode = lastRecord_${f.name}.${f.name};
      const lastSeq = parseInt(lastCode);
      if (!isNaN(lastSeq)) {
        nextSeq_${f.name} = lastSeq + 1;
      }
    }
    data.${f.name} = String(nextSeq_${f.name}).padStart(${seqLength}, "0");`;
    } else {
      // Has prefix - need to build the prefix string
      const prefixParts = [];

      // Build prefix with date placeholders replaced
      if (hasPrefixWithDate) {
        const prefixTemplate = staticPrefix
          .replace("{YYYYMMDD}", "${year}${month}${day}")
          .replace("{YYMMDD}", "${String(year).slice(-2)}${month}${day}")
          .replace("{YYYY}", "${year}")
          .replace("{YY}", "${String(year).slice(-2)}")
          .replace("{MM}", "${month}")
          .replace("{DD}", "${day}");

        codeGenLogic += `    const prefix_${f.name} = \`${prefixTemplate}\`;
    const lastRecord_${f.name} = await prisma.${toCamelCase(
          tableName
        )}.findFirst({
      where: {
        ${f.name}: {
          startsWith: prefix_${f.name},
        },
      },
      orderBy: { ${f.name}: "desc" },
    });

    let nextSeq_${f.name} = 1;
    if (lastRecord_${f.name}) {
      const lastCode = lastRecord_${f.name}.${f.name};
      const lastSeqStr = lastCode.substring(prefix_${f.name}.length);
      const lastSeq = parseInt(lastSeqStr);
      if (!isNaN(lastSeq)) {
        nextSeq_${f.name} = lastSeq + 1;
      }
    }
    data.${f.name} = prefix_${f.name} + String(nextSeq_${
          f.name
        }).padStart(${seqLength}, "0");`;
      } else {
        // Static prefix without date
        codeGenLogic += `    const lastRecord_${
          f.name
        } = await prisma.${toCamelCase(tableName)}.findFirst({
      where: {
        ${f.name}: {
          startsWith: "${staticPrefix}",
        },
      },
      orderBy: { ${f.name}: "desc" },
    });

    let nextSeq_${f.name} = 1;
    if (lastRecord_${f.name}) {
      const lastCode = lastRecord_${f.name}.${f.name};
      const lastSeqStr = lastCode.substring("${staticPrefix}".length);
      const lastSeq = parseInt(lastSeqStr);
      if (!isNaN(lastSeq)) {
        nextSeq_${f.name} = lastSeq + 1;
      }
    }
    data.${f.name} = "${staticPrefix}" + String(nextSeq_${
          f.name
        }).padStart(${seqLength}, "0");`;
      }
    }

    return codeGenLogic;
  })
  .join("\n\n")}
`
      : "";

  // Detect search field (try to find name or code field)
  const searchField =
    fields.find(
      (f) =>
        f.name.toLowerCase().includes("nama") ||
        f.name.toLowerCase().includes("name") ||
        f.name.toLowerCase().includes("kode") ||
        f.name.toLowerCase().includes("code")
    ) || fields[0];

  // Try to use @/lib/prisma, fallback to manual fix if needed
  return `import { prisma } from "@/lib/prisma";
import { ${moduleName}FormData } from "../types/${resourceName}.schema";

export const ${toCamelCase(moduleName)}Server = {
  async getPaginated(page: number, limit: number, search?: string, filters?: Record<string, any>) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { ${searchField.name}: { contains: search, mode: "insensitive" } },
      ];
    }
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          if (!isNaN(Number(val))) where[key] = Number(val);
          else where[key] = val;
        }
      });
    }

    const [data, total] = await Promise.all([
      prisma.${toCamelCase(tableName)}.findMany({
        skip,
        take: limit,
        where,${includeStr}
        orderBy: { createdAt: "desc" },
      }),
      prisma.${toCamelCase(tableName)}.count({ where }),
    ]);

    return {
      "${resourceName}": data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: number) {
    return prisma.${toCamelCase(tableName)}.findUnique({
      where: { id },
      include: {
        ${asyncSelectFields
          .map((f) => `${f.name}Rel: true`)
          .join(",\n        ")}
        ${fields
          .filter((f) => f.type === "detail")
          .map((f) => {
            const detailRelations = f.detailFields
              ?.filter((df) => df.type === "async-select" && df.relatedTable)
              .map((df) => `${df.name}Rel: true`)
              .join(", ");
            return detailRelations
              ? `${f.name}: { include: { ${detailRelations} } }`
              : `${f.name}: true`;
          })
          .join(",\n        ")}
      },
    });
  },

  async create(data: ${moduleName}FormData) {${autoCodeLogic}
    const createData: any = { ...data };
    ${fields
      .filter((f) => f.type === "detail")
      .map(
        (f) => `
    if (data.${f.name}) {
      createData.${f.name} = {
        create: data.${f.name}
      };
    }`
      )
      .join("\n")}

    ${
      config.stockLogic
        ? `
    return prisma.$transaction(async (tx) => {
      const result = await tx.${toCamelCase(tableName)}.create({
        data: createData,
        include: { 
          ${fields
            .filter((f) => f.type === "detail")
            .map((f) => `${f.name}: true`)
            .join(", ")} 
        }
      });

      // Stock Logic: ${config.stockLogic.type} ${config.stockLogic.targetTable}
      const detailField = ${JSON.stringify(
        fields.find((f) => f.type === "detail")?.name || ""
      )};
      if (detailField && result[detailField]) {
        for (const item of (result[detailField] as any[])) {
          if (item.${config.stockLogic.identifierField}) {
            await tx.${toCamelCase(config.stockLogic.targetTable)}.update({
              where: { id: item.${config.stockLogic.identifierField} },
              data: {
                ${config.stockLogic.stockField}: {
                  ${
                    config.stockLogic.type === "reduce"
                      ? "decrement"
                      : "increment"
                  }: item.${config.stockLogic.quantityField}
                }
              }
            });
          }
        }
      }
      return result;
    });`
        : `
    return prisma.${toCamelCase(tableName)}.create({
      data: createData,
      include: {
        ${asyncSelectFields.map((f) => `${f.name}Rel: true`).join(",\n")}
        ${fields
          .filter((f) => f.type === "detail")
          .map((f) => `${f.name}: true`)
          .join(",\n")}
      },
    });`
    }
  },

  async update(id: number, data: ${moduleName}FormData) {
    const updateData: any = { ...data };
    ${fields
      .filter((f) => f.type === "detail")
      .map(
        (f) => `
    if (data.${f.name}) {
      updateData.${f.name} = {
        deleteMany: {},
        create: data.${f.name}
      };
    }`
      )
      .join("\n")}

    return prisma.${toCamelCase(tableName)}.update({
      where: { id },
      data: updateData,
      include: {
        ${asyncSelectFields.map((f) => `${f.name}Rel: true`).join(",\n")}
        ${fields
          .filter((f) => f.type === "detail")
          .map((f) => `${f.name}: true`)
          .join(",\n")}
      },
    });
  },

  async delete(id: number) {
    return prisma.${toCamelCase(tableName)}.delete({
      where: { id },
    });
  },
};
`;
};

const generateForm = () => {
  const calculations = fields
    .filter((f) => f.formula)
    .map((f) => {
      const vars = fields
        .map((k) => k.name)
        .filter((k) => f.formula!.includes(k));
      return {
        target: f.name,
        formula: f.formula,
        dependencies: vars,
      };
    });

  const calculationHook =
    calculations.length > 0
      ? `
  // Auto-Calculation
  const values = watch();
  
  useEffect(() => {
    ${calculations
      .map(
        (c) => `
    try {
      // Safe evaluation context
      const ${c.dependencies
        .map((d) => `${d} = Number(values.${d} || 0)`)
        .join(";\n      const ")};
      const result = ${c.formula};
      setValue("${c.target}", result);
    } catch (e) {}`
      )
      .join("\n")}
  }, [${calculations
    .flatMap((c) => c.dependencies.map((d) => `values.${d}`))
    .join(", ")}, setValue]);
`
      : "";

  const formFields = fields
    .map((f) => {
      // Hide autoCode fields from invalid
      if (f.autoCode) return "";

      const isFormula = !!f.formula;
      const readOnlyProp = f.readOnly || isFormula ? "readOnly" : undefined;

      const inputClasses = [];
      if (readOnlyProp) inputClasses.push("bg-muted");
      if ((f.type === "text" || f.type === "string") && f.uppercase !== false) {
        inputClasses.push("uppercase");
      }

      const className =
        inputClasses.length > 0 ? `className="${inputClasses.join(" ")}"` : "";

      if (f.type === "select" && f.options) {
        return `          <FormSelect
            name="${f.name}"
            label="${f.label}"
            placeholder="Select ${f.label.toLowerCase()}"
            options={[${f.options
              .map((opt) => `"${opt}"`)
              .join(", ")}].map(opt => ({ label: opt, value: opt }))}
            disabled={isLoading}
          />`;
      }

      if (f.type === "async-select") {
        const depProps = f.dependency
          ? `paramName="${f.dependency.queryParam}" paramValue={watch("${f.dependency.field}")}`
          : "";

        const autoFillProps = f.autoFill
          ? `onObjectChange={(data) => {
              ${Object.entries(f.autoFill)
                .map(([target, source]) => {
                  const targetField = fields.find((tf) => tf.name === target);
                  let fallback = '""';
                  if (targetField) {
                    if (
                      ["number", "currency", "rupiah", "gram"].includes(
                        targetField.type
                      )
                    ) {
                      fallback = "0";
                    } else if (targetField.type === "boolean") {
                      fallback = "false";
                    }
                  }
                  return `setValue("${target}", data?.${source} ?? ${fallback});`;
                })
                .join(" ")}
            }}`
          : "";

        return `          <FormAsyncSelect
            name="${f.name}"
            label="${f.label}"
            placeholder="Search ${f.label.toLowerCase()}..."
            endpoint="${f.endpoint}"
            labelField="${f.labelField || "name"}"
            valueField="${f.valueField || "id"}"
            disabled={isLoading}
            ${depProps}
            ${autoFillProps}
          />`;
      }

      if (f.type === "detail") {
        return `          <FormCart
            name="${f.name}"
            label="${f.label}"
            fields={${JSON.stringify(f.detailFields || [])}}
            ${
              fields.some((tf) => tf.name === "totalAmount")
                ? 'totalField="totalAmount"'
                : ""
            }
          />`;
      }

      if (f.type === "boolean") {
        return `          <FormCheckbox
            name="${f.name}"
            label="${f.label}"
            disabled={isLoading}
          />`;
      }

      if (f.type === "number") {
        const autoFillProps =
          f.autoFill && f.endpoint
            ? `lookupEndpoint="${f.endpoint}" onObjectChange={(data) => {
              ${Object.entries(f.autoFill)
                .map(([target, source]) => {
                  const targetField = fields.find((tf) => tf.name === target);
                  let fallback = '""';
                  if (targetField) {
                    if (
                      ["number", "currency", "rupiah", "gram"].includes(
                        targetField.type
                      )
                    ) {
                      fallback = "0";
                    } else if (targetField.type === "boolean") {
                      fallback = "false";
                    }
                  }
                  return `setValue("${target}", data?.${source} ?? ${fallback});`;
                })
                .join(" ")}
            }}`
            : "";

        return `          <FormInput
            name="${f.name}"
            label="${f.label}"
            type="number"
            placeholder="0"
            disabled={isLoading}
            ${readOnlyProp ? "readOnly" : ""}
            ${className}
            ${autoFillProps}
          />`;
      }

      if (f.type === "gram") {
        return `          <FormGram
            name="${f.name}"
            label="${f.label}"
            placeholder="0.0"
            disabled={isLoading}
            ${readOnlyProp ? "readOnly" : ""}
            ${className}
          />`;
      }

      if (f.type === "currency" || f.type === "rupiah") {
        return `          <FormCurrency
            name="${f.name}"
            label="${f.label}"
            placeholder="0"
            disabled={isLoading}
            ${readOnlyProp ? "readOnly" : ""}
            ${className}
          />`;
      }

      const autoFillProps =
        f.autoFill && f.endpoint
          ? `lookupEndpoint="${f.endpoint}" onObjectChange={(data) => {
            ${Object.entries(f.autoFill)
              .map(([target, source]) => {
                const targetField = fields.find((tf) => tf.name === target);
                let fallback = '""';
                if (targetField) {
                  if (
                    ["number", "currency", "rupiah", "gram"].includes(
                      targetField.type
                    )
                  ) {
                    fallback = "0";
                  } else if (targetField.type === "boolean") {
                    fallback = "false";
                  }
                }
                return `setValue("${target}", data?.${source} ?? ${fallback});`;
              })
              .join(" ")}
          }}`
          : "";

      return `          <FormInput
            name="${f.name}"
            label="${f.label}"
            type="${f.type === "email" ? "email" : "text"}"
            placeholder="${
              f.type === "email"
                ? "Enter email"
                : `Enter ${f.label.toLowerCase()}`
            }"
            disabled={isLoading}
            ${readOnlyProp ? "readOnly" : ""}
            ${className}
            ${autoFillProps}
          />`;
    })
    .join("\n");

  return `import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ${toCamelCase(
    moduleName
  )}Schema, ${moduleName}FormData, ${moduleName} } from "../types/${resourceName}.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect, FormGram, FormCart } from "@/components/form";
import { ${toCamelCase(
    moduleName
  )}Service } from "../services/${resourceName}.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2${config.printable ? ", Printer" : ""} } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialData?: ${moduleName};
  onSuccess?: () => void;
}

export const ${moduleName}Form = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<${moduleName}FormData>({
    resolver: zodResolver(${toCamelCase(moduleName)}Schema) as any,
    defaultValues: initialData ? {
      ${fields
        .map((f) => {
          if (f.type === "detail") {
            return `${f.name}: initialData.${f.name} ?? []`;
          }
          return `${f.name}: initialData.${f.name} ?? undefined`;
        })
        .join(",\n      ")}
    } : {
      ${fields
        .map((f) => {
          let defaultValue = '""';
          if (f.defaultValue !== undefined) {
            defaultValue = JSON.stringify(f.defaultValue);
            if (f.defaultValue === "today")
              defaultValue = '"' + new Date().toISOString().split("T")[0] + '"';
          } else if (f.type === "boolean") {
            defaultValue = "false";
          } else if (
            ["number", "currency", "rupiah", "gram"].includes(f.type) ||
            (f.type === "async-select" &&
              f.relatedTable &&
              (!f.valueField || f.valueField === "id"))
          ) {
            defaultValue = "0";
          } else if (f.type === "select") {
            defaultValue = "undefined";
          } else if (f.type === "detail") {
            defaultValue = "[]";
          }
          return `${f.name}: ${defaultValue}`;
        })
        .join(",\n      ")}
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  ${
    config.printable
      ? `const [shouldPrint, setShouldPrint] = useState(true);`
      : ""
  }

  ${calculationHook}

  const onSubmit = async (data: ${moduleName}FormData) => {
    try {
      let result;
      if (initialData) {
        result = await ${toCamelCase(
          moduleName
        )}Service.update(initialData.id, data);
        toast.success("${title} updated successfully");
      } else {
        result = await ${toCamelCase(moduleName)}Service.create(data);
        toast.success("${title} created successfully");
      }

      if (${config.printable ? "shouldPrint && " : ""}result) {
        ${
          config.printable
            ? `// Trigger print via hidden iframe
        const printUrl = \`/admin/print/${resourceName}/\${result.id}\`;
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = printUrl;
        document.body.appendChild(iframe);
        
        // Cleanup iframe after some time
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);`
            : ""
        }
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="${classForm || "space-y-4"}">
${formFields}
        </div>
        ${
          config.printable
            ? `<div className="flex items-center space-x-2 py-2 border-t border-dashed">
          <input 
            type="checkbox" 
            id="shouldPrint" 
            checked={shouldPrint} 
            onChange={(e) => setShouldPrint(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="shouldPrint" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt after saving
          </label>
        </div>`
            : ""
        }
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update" : "Create"}
            </Button>
        </div>
      </form>
    </FormProvider>
  );
};
`;
};

const generateTable = () => {
  const detailField = fields.find((f) => f.type === "detail");
  const hasDetail = !!detailField;

  const columns = fields
    .filter((f) => f.type !== "detail") // Don't show detail arrays in main columns
    .map((f) => {
      return `      {
        accessorKey: "${f.name}",
        header: ({ column }) => <DataTableColumnHeader column={column} title="${
          f.label
        }" />,
        ${
          f.type === "boolean"
            ? `cell: ({ row }) => <div>{row.getValue("${f.name}") ? "Yes" : "No"}</div>,`
            : ""
        }
        ${
          f.type === "currency" || f.type === "rupiah"
            ? `cell: ({ row }) => <div className="text-right font-medium">{formatRupiah(row.getValue("${f.name}"))}</div>,`
            : ""
        }
        ${
          f.type === "async-select" && f.relatedTable
            ? `cell: ({ row }) => {
                const original = row.original as any;
                const rel = original.${f.name}Rel;
                return <div>{rel ? rel.${f.relatedDisplayField} : row.getValue("${f.name}")}</div>;
              },`
            : ""
        }
      },`;
    })
    .join("\n");

  const expanderColumn = hasDetail
    ? `      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return (
            <button
              onClick={() => row.toggleExpanded()}
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-muted transition-colors"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          );
        },
      },`
    : "";

  return `import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye${
    config.printable ? ", Printer" : ""
  }, ChevronRight, ChevronDown } from "lucide-react";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { type ButtonConfig } from "@/components/ui/data-table-toolbar";
import { formatRupiah } from "@/lib/utils";
import { ${moduleName} } from "../types/${resourceName}.schema";
import { useModalStore } from "@/stores/modal-store";
import { ${moduleName}Form } from "./${resourceName}-form";
import { ${moduleName}Detail } from "./${resourceName}-detail";
import { ${moduleName}Delete } from "./${resourceName}-delete";
import { ServerDataTable, ServerDataTableRef } from "@/components/ui/server-data-table";
import { ${toCamelCase(
    moduleName
  )}Service } from "../services/${resourceName}.service";

export const ${moduleName}Table = () => {
  const { onOpen } = useModalStore();
  const tableRef = useRef<ServerDataTableRef>(null);

  const refreshTable = useCallback(() => {
    tableRef.current?.refresh();
  }, []);

  const handleAction = useCallback(
    (type: "create" | "update" | "delete" | "view"${
      config.printable ? ' | "reprint"' : ""
    }, row?: ${moduleName}) => {
      switch (type) {
        ${
          config.printable
            ? `case "reprint":
          if (row) {
            const printUrl = \`/admin/print/${resourceName}/\${row.id}\`;
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = printUrl;
            document.body.appendChild(iframe);
            
            // Cleanup iframe after some time
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 5000);
          }
          break;`
            : ""
        }
        case "create":
          onOpen("form", {
            title: "Add ${title}",
            size: "xl",
            content: <${moduleName}Form onSuccess={refreshTable} />,
          });
          break;
        case "view":
          if (row) {
            onOpen("view", {
              title: "${title} Details",
              size: "lg",
              position: "top",
              content: <${moduleName}Detail ${toCamelCase(moduleName)}={row} />,
            });
          }
          break;
        case "update":
          if (row) {
            onOpen("form", {
              title: "Edit ${title}",
              size: "xl",
              content: <${moduleName}Form initialData={row} onSuccess={refreshTable} />,
            });
          }
          break;
        case "delete":
          if (row) {
            onOpen("delete", {
              title: "Delete ${title}",
              size: "lg",
              content: <${moduleName}Delete ${toCamelCase(
    moduleName
  )}={row} onSuccess={refreshTable} />,
            });
          }
          break;
      }
    },
    [onOpen, refreshTable]
  );

  const tableActions: ButtonConfig<${moduleName}>[] = useMemo(
    () => [
      {
        label: "Add ${title}",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => handleAction("create"),
        isAdd: true,
        show: true,
        group: "toolbar",
      },
      {
        label: "View Details",
        icon: <Eye className="h-4 w-4" />,
        onClick: (row?: ${moduleName}) => handleAction("view", row),
        show: true,
        group: "action",
      },
      {
        label: "Edit ${moduleName}",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row?: ${moduleName}) => handleAction("update", row),
        show: true,
        group: "action",
      },
      {
        label: "Delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (row?: ${moduleName}) => handleAction("delete", row),
        show: true,
        group: "action",
        className: "text-destructive focus:text-destructive",
      },
      ${
        config.printable
          ? `{
        label: "Print Receipt",
        icon: <Printer className="h-4 w-4" />,
        onClick: (row?: ${moduleName}) => handleAction("reprint", row),
        show: true,
        group: "action",
      },`
          : ""
      }
    ],
    [handleAction]
  );

  const columns: ColumnDef<${moduleName}>[] = useMemo(
    () => [
${expanderColumn}
${columns}
    ],
    []
  );

  ${
    hasDetail
      ? `const renderSubComponent = ({ row }: { row: any }) => {
    const data = row.original;
    const items = data.${detailField.name} || [];

    if (items.length === 0) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground italic">
          No items found.
        </div>
      );
    }

    return (
      <div className="p-4 bg-muted/20 border-y border-dashed">
        <div className="overflow-hidden rounded-md border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                ${detailField.detailFields
                  ?.map(
                    (df) =>
                      `<th className="px-4 py-2 text-left font-medium text-muted-foreground">${df.label}</th>`
                  )
                  .join("\n                ")}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-muted/30">
                  ${detailField.detailFields
                    ?.map((df) => {
                      if (df.type === "async-select" && df.relatedTable) {
                        return `<td className="px-4 py-2">{item.${df.name}Rel?.${df.labelField} || item.${df.name}}</td>`;
                      }
                      if (df.type === "rupiah" || df.type === "currency") {
                        return `<td className="px-4 py-2">{formatRupiah(item.${df.name})}</td>`;
                      }
                      return `<td className="px-4 py-2">{item.${df.name}}</td>`;
                    })
                    .join("\n                  ")}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };`
      : ""
  }

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/${resourceName}"
      dataPath="${resourceName}"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search ${moduleName.toLowerCase()}s..."
      ${
        hasDetail
          ? `renderSubComponent={renderSubComponent}\n      getRowCanExpand={() => true}`
          : ""
      }
    />
  );
};
`;
};

const generateApiIndex = () => {
  return `import type { NextApiRequest, NextApiResponse } from "next";
import { ${toCamelCase(
    moduleName
  )}Server } from "@/modules/${resourceName}/server/${resourceName}.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        const { page: _page, limit: _limit, search: _search, ...filters } = req.query;
        const page = Number(_page) || 1;
        const limit = Number(_limit) || 10;
        const search = (_search as string) || undefined;
        const result = await ${toCamelCase(
          moduleName
        )}Server.getPaginated(page, limit, search, filters);
        return res.status(200).json(result);

      case "POST":
        const newItem = await ${toCamelCase(moduleName)}Server.create(req.body);
        return res.status(201).json(newItem);

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(\`Method \${req.method} Not Allowed\`);
    }
  } catch (error) {
    console.error("API Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
`;
};

const generateApiDetail = () => {
  return `import type { NextApiRequest, NextApiResponse } from "next";
import { ${toCamelCase(
    moduleName
  )}Server } from "@/modules/${resourceName}/server/${resourceName}.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

  try {
    switch (req.method) {
      case "GET":
        const item = await ${toCamelCase(moduleName)}Server.getById(id);
        if (!item) return res.status(404).json({ message: "Not Found" });
        return res.status(200).json(item);

      case "PUT":
        const updated = await ${toCamelCase(
          moduleName
        )}Server.update(id, req.body);
        return res.status(200).json(updated);

      case "DELETE":
        await ${toCamelCase(moduleName)}Server.delete(id);
        return res.status(204).end();

      default:
        res.setHeader("Allow", ["PUT", "DELETE"]);
        return res.status(405).end(\`Method \${req.method} Not Allowed\`);
    }
  } catch (error) {
    console.error("API Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
`;
};

// 8. Page Generator
const generatePage = () => {
  return `import { PageLayout } from "@/components/page-layout";
import { ${moduleName}Table } from "@/modules/${resourceName}/components/${resourceName}-table";
import { PanelAdmin } from "@/components/ui/panelAdmin";

export default function ${toPascalCase(moduleName)}Page() {
  return (
    <PageLayout
      title="${title}s"
      description="Manage your ${title.toLowerCase()}s"
    >
      <PanelAdmin
        title="All ${title}s"
        description="List of all ${title.toLowerCase()}s"
      >
        <${moduleName}Table />
      </PanelAdmin>
    </PageLayout>
  );
};
`;
};

// 9. Detail Component Generator
const generateDetail = () => {
  // Only show first 6 fields or less in detail view
  const displayFields = fields.slice(0, Math.min(6, fields.length));
  const fieldRows = displayFields
    .map((f) => {
      let valueDisplay = `{row.${f.name}}`;
      if (f.type === "async-select" && f.relatedTable) {
        valueDisplay = `{(row as any).${f.name}Rel?.${f.relatedDisplayField} || row.${f.name}}`;
      } else if (f.type === "boolean") {
        valueDisplay = `{row.${f.name} ? "Yes" : "No"}`;
      } else if (f.type === "number") {
        valueDisplay = `{row.${f.name}}`;
      }

      return `        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">${f.label}</p>
          <p className="text-sm font-semibold">${valueDisplay}</p>
        </div>`;
    })
    .join("\n");

  return `import { ${moduleName} } from "../types/${resourceName}.schema";

interface ${moduleName}DetailProps {
  ${toCamelCase(moduleName)}: ${moduleName};
}

export const ${moduleName}Detail = ({ ${toCamelCase(
    moduleName
  )}: row }: ${moduleName}DetailProps) => {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
${fieldRows}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          ${moduleName} details are managed by the administrator. Any changes will be reflected across the system immediately.
        </p>
      </div>
    </div>
  );
};
`;
};

// 10. Delete Component Generator
const generateDelete = () => {
  // Find a suitable display field (prefer 'name', then first string field)
  const displayField =
    fields.find((f) => f.name === "name") ||
    fields.find((f) => f.type === "string") ||
    fields[0];

  return `import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useModalStore } from "@/stores/modal-store";
import { toast } from "sonner";
import { ${moduleName} } from "../types/${resourceName}.schema";
import { ${toCamelCase(
    moduleName
  )}Service } from "../services/${resourceName}.service";

interface ${moduleName}DeleteProps {
  ${toCamelCase(moduleName)}: ${moduleName};
  onSuccess?: () => void;
}

export function ${moduleName}Delete({ ${toCamelCase(
    moduleName
  )}: row, onSuccess }: ${moduleName}DeleteProps) {
  const { onClose } = useModalStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await ${toCamelCase(moduleName)}Service.delete(row.id);
      toast.success("${title} deleted successfully");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete ${title}. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Confirm Deletion</p>
          <p className="text-sm opacity-90">
            Are you sure you want to delete <strong>{row.${
              displayField.name
            }}</strong>? This action is permanent and cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="min-w-[100px]"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete ${moduleName}"
          )}
        </Button>
      </div>
    </div>
  );
}
`;
};

// 11. Seeder Generator
const generateSeeder = () => {
  const sampleData: Record<string, any> = {};
  const relFetchers: string[] = [];
  const placeholders: Record<string, string> = {};

  fields.forEach((f) => {
    let value: any = undefined;

    if (f.defaultValue !== undefined && f.type !== "detail") {
      if (f.defaultValue === "today") {
        value = new Date().toISOString().split("T")[0];
      } else {
        value = f.defaultValue;
      }
    } else if (f.autoCode) {
      let code = f.autoCode;
      const today = new Date();
      const year = String(today.getFullYear());
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      const seqMatch = code.match(/\{0*[01]?\}/);
      const seqPattern = seqMatch ? seqMatch[0] : "{0000}";
      const seqLength = seqPattern.length - 2;
      const sampleSeq = "1".padStart(seqLength, "0");

      code = code
        .replace(seqPattern, sampleSeq)
        .replace("{YYYY}", year)
        .replace("{YY}", year.slice(-2))
        .replace("{MM}", month)
        .replace("{DD}", day)
        .replace("{YYYYMMDD}", `${year}${month}${day}`)
        .replace("{YYMMDD}", `${year.slice(-2)}${month}${day}`);

      value = code;
    } else if (f.type === "string" || f.type === "text") {
      if (f.name.toLowerCase().includes("nama")) value = `Sample ${moduleName}`;
      else if (f.name.toLowerCase().includes("kode"))
        value = `${moduleName.toUpperCase()}-01`;
      else value = "Sample data";
    } else if (
      f.type === "number" ||
      f.type === "currency" ||
      f.type === "rupiah" ||
      f.type === "gram"
    ) {
      value = f.type === "gram" ? 1.5 : 1000;
    } else if (f.type === "boolean") {
      value = true;
    } else if (f.type === "select" && f.options) {
      value = f.options[0];
    } else if (f.type === "async-select") {
      const isIdValue = !f.valueField || f.valueField === "id";
      if (isIdValue && f.relatedTable) {
        const varName = `first${toPascalCase(f.name)}`;
        relFetchers.push(
          `  const ${varName} = await prisma.${toCamelCase(
            f.relatedTable
          )}.findFirst();`
        );
        placeholders[f.name] = `${varName}?.id || 1`;
        value = `__PLACEHOLDER_${f.name}__`;
      } else if (isIdValue) {
        value = 1;
      } else {
        value = "SAMPLE-CODE";
      }
    } else if (f.type === "email") {
      value = "sample@example.com";
    } else if (f.type === "detail" && f.detailFields) {
      const detailSample: any = {};
      f.detailFields.forEach((df) => {
        if (df.type === "async-select" && df.relatedTable) {
          const varName = `detail${toPascalCase(f.name)}${toPascalCase(
            df.name
          )}`;
          relFetchers.push(
            `  const ${varName} = await prisma.${toCamelCase(
              df.relatedTable
            )}.findFirst();`
          );
          detailSample[df.name] = `__PLACEHOLDER_DETAIL_${f.name}_${df.name}__`;
          placeholders[`DETAIL_${f.name}_${df.name}`] = `${varName}?.id || 1`;
        } else if (
          df.type === "number" ||
          df.type === "currency" ||
          df.type === "rupiah" ||
          df.type === "gram"
        ) {
          detailSample[df.name] = df.type === "gram" ? 1.2 : 500;
        } else {
          detailSample[df.name] = "Sample Detail";
        }
      });
      value = { create: [detailSample] };
    } else if (f.type === "detail") {
      value = { create: [] };
    }

    if (value !== undefined) {
      sampleData[f.name] = value;
    }
  });

  let dataStr = JSON.stringify(sampleData, null, 2);
  Object.entries(placeholders).forEach(([fieldName, replacer]) => {
    dataStr = dataStr.replace(`"__PLACEHOLDER_${fieldName}__"`, replacer);
  });

  return `import { PrismaClient } from "@prisma/client";

export async function seed${toPascalCase(moduleName)}(prisma: PrismaClient) {
  // Check if data already exists
  const count = await prisma.${toCamelCase(tableName)}.count();
  if (count > 0) {
    console.log("⏭️ ${moduleName} already seeded. Skipping...");
    return;
  }

  console.log("🌱 Seeding ${moduleName}...");

${relFetchers.join("\n")}

  const data: any = ${dataStr};

  await prisma.${toCamelCase(tableName)}.create({
    data,
  });

  console.log("✅ ${moduleName} seeded!");
}
`;
};

// WRITE FILES
const write = (p: string, content: string) => {
  console.log(`Writing ${p}...`);
  fs.writeFileSync(p, content);
};

write(
  path.join(moduleDir, `types/${resourceName}.schema.ts`),
  generateSchema()
);
write(
  path.join(moduleDir, `services/${resourceName}.service.ts`),
  generateService()
);
write(
  path.join(moduleDir, `server/${resourceName}.server.ts`),
  generateServer()
);
write(
  path.join(moduleDir, `components/${resourceName}-form.tsx`),
  generateForm()
);
write(
  path.join(moduleDir, `components/${resourceName}-table.tsx`),
  generateTable()
);
write(
  path.join(moduleDir, `components/${resourceName}-detail.tsx`),
  generateDetail()
);
write(
  path.join(moduleDir, `components/${resourceName}-delete.tsx`),
  generateDelete()
);
write(path.join(apiDir, "index.ts"), generateApiIndex());
write(path.join(apiDir, "[id].ts"), generateApiDetail());

// 12. Seeder Generation & Update prisma/seed.ts
const seedersDir = path.resolve(process.cwd(), "prisma/seeders");
if (!fs.existsSync(seedersDir)) fs.mkdirSync(seedersDir, { recursive: true });
const seederPath = path.join(seedersDir, `${resourceName}Seeder.ts`);
write(seederPath, generateSeeder());

const mainSeedPath = path.resolve(process.cwd(), "prisma/seed.ts");
if (fs.existsSync(mainSeedPath)) {
  let mainSeedContent = fs.readFileSync(mainSeedPath, "utf-8");
  const seederFuncName = `seed${toPascalCase(moduleName)}`;
  if (!mainSeedContent.includes(seederFuncName)) {
    // Add import after other imports
    const importStatement = `import { ${seederFuncName} } from "./seeders/${resourceName}Seeder";\n`;
    const lastImportIndex = mainSeedContent.lastIndexOf("import ");
    const endOfLastImport = mainSeedContent.indexOf("\n", lastImportIndex) + 1;
    mainSeedContent =
      mainSeedContent.slice(0, endOfLastImport) +
      importStatement +
      mainSeedContent.slice(endOfLastImport);

    // Add call to main function - append to the end of main function body
    mainSeedContent = mainSeedContent.replace(
      /async function main\(\) \{([\s\S]*?)\}/,
      (match, body) => {
        // Find the return or the end of the body
        return `async function main() {${body}  await ${seederFuncName}(prisma);\n}`;
      }
    );
    fs.writeFileSync(mainSeedPath, mainSeedContent);
    console.log(`✅ Updated prisma/seed.ts with ${seederFuncName}`);
  }
}

// Generate Page if route is specified
if (config.route) {
  const route = config.route.startsWith("/")
    ? config.route.slice(1)
    : config.route;
  const pageDir = path.resolve(process.cwd(), "src/pages", route);
  if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });

  write(path.join(pageDir, "index.tsx"), generatePage());
}

// Generate Prisma Model
const prismaSchemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
let schemaContent = fs.readFileSync(prismaSchemaPath, "utf-8");

const detailTablesDef = fields
  .filter((f) => f.type === "detail")
  .map((f) => {
    const detailTableName = `${tableName}_detail`;
    const detailFieldsList = f.detailFields
      ?.map((df) => {
        if (df.type === "async-select" && df.relatedTable) {
          return `  ${df.name}      Int?
  ${df.name}Rel   ${df.relatedTable}? @relation(fields: [${df.name}], references: [id])`;
        }
        const prismaType =
          df.type === "number" ||
          df.type === "currency" ||
          df.type === "rupiah" ||
          df.type === "gram"
            ? "Float"
            : df.type === "async-select"
            ? "Int"
            : "String";
        return `  ${df.name}      ${prismaType}   ${
          df.readOnly ? "@default(0)" : ""
        }`;
      })
      .join("\n");

    return `model ${detailTableName} {
  id        Int      @id @default(autoincrement())
  parentId  Int
  parent    ${tableName} @relation(fields: [parentId], references: [id], onDelete: Cascade)
${detailFieldsList}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([parentId])
}`;
  })
  .join("\n");

const modelDefinition = `model ${tableName} {
  id        Int      @id @default(autoincrement())
${fields
  .map((f) => {
    if (f.type === "detail") {
      return `  ${f.name}   ${tableName}_detail[]`;
    }
    if (
      f.type === "async-select" &&
      f.relatedTable &&
      (!f.valueField || f.valueField === "id")
    ) {
      return `  ${f.name}      Int?
  ${f.name}Rel   ${f.relatedTable}? @relation(fields: [${f.name}], references: [id])`;
    }
    const prismaType =
      f.type === "number" ||
      f.type === "currency" ||
      f.type === "rupiah" ||
      f.type === "gram"
        ? "Float"
        : f.type === "boolean"
        ? "Boolean"
        : "String";
    return `  ${f.name}      ${prismaType}   ${
      f.required === false ? "?" : ""
    }`;
  })
  .join("\n")}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
${fields
  .filter((f) => f.type === "async-select")
  .map((f) => `  @@index([${f.name}])`)
  .join("\n")}
}

${detailTablesDef}
`;

if (schemaContent.includes(`model ${tableName}`)) {
  console.log(`\nℹ️  Model ${tableName} already exists. Updating schema...`);
  // Replace existing model
  const startStr = `model ${tableName} {`;
  const startIndex = schemaContent.indexOf(startStr);
  const endIndex = schemaContent.indexOf("}", startIndex) + 1;

  // Also try to remove old detail table if exists
  const detailTableName = `${tableName}_detail`;
  if (schemaContent.includes(`model ${detailTableName}`)) {
    const dStart = schemaContent.indexOf(`model ${detailTableName} {`);
    const dEnd = schemaContent.indexOf("}", dStart) + 1;
    // Remove it first to avoid duplication
    schemaContent = schemaContent.slice(0, dStart) + schemaContent.slice(dEnd);
  }

  // Re-calculate startIndex because we might have shifted content
  const newStartIndex = schemaContent.indexOf(startStr);
  const newEndIndex = schemaContent.indexOf("}", newStartIndex) + 1;

  schemaContent =
    schemaContent.slice(0, newStartIndex) +
    modelDefinition +
    schemaContent.slice(newEndIndex);
} else {
  schemaContent += `\n${modelDefinition}`;
  console.log(`\n✅ Added model ${tableName} to prisma/schema.prisma`);
}

fs.writeFileSync(prismaSchemaPath, schemaContent);
console.log("⚠️  Running 'npx prisma format && npx prisma db push'...");
try {
  require("child_process").execSync(
    "npx prisma format && npx prisma db push && npx prisma generate",
    {
      stdio: "inherit",
    }
  );
} catch (e) {
  console.error("❌ Failed to run prisma commands. Please run them manually.");
}

// 13. Menu Update
const menusPath = path.resolve(process.cwd(), "src/config/menus.ts");
if (fs.existsSync(menusPath)) {
  let menusContent = fs.readFileSync(menusPath, "utf-8");
  const href = config.route;

  if (href && !menusContent.includes(`href: "${href}"`)) {
    console.log(`\n📂 Updating sidebar menu for: ${resourceName}...`);
    const menuTitle = config.title;
    const isTransaction =
      resourceName.toLowerCase().includes("transaction") ||
      resourceName.toLowerCase().includes("sale");
    const groupName = isTransaction ? "Transactions" : "Master Data";
    const iconName = isTransaction ? "ShoppingBag" : "Package";

    // Build the menu item string
    const newItem = `      {
        title: "${menuTitle}",
        href: "${href}",
        icon: ${iconName},
      },`;

    // Find the group/section by title
    const groupRegex = new RegExp(
      `(title: "${groupName}",[\\s\\S]*?items: \\[)([\\s\\S]*?)(\\])`,
      "g"
    );

    if (groupRegex.test(menusContent)) {
      // Append to existing group
      menusContent = menusContent.replace(
        groupRegex,
        (match, prefix, items, suffix) => {
          const trimmedItems = items.trim();
          const separator = trimmedItems.endsWith(",") ? "\n" : ",\n";
          return `${prefix}${items}${separator}${newItem}\n      ${suffix}`;
        }
      );
    } else {
      // Create new group and append to navigation array before the last ];
      const lastBracketIndex = menusContent.lastIndexOf("];");
      if (lastBracketIndex !== -1) {
        const newGroup = `  {
    title: "${groupName}",
    items: [
${newItem}
    ],
  },\n`;
        menusContent =
          menusContent.slice(0, lastBracketIndex) +
          newGroup +
          menusContent.slice(lastBracketIndex);
      }
    }

    // Ensure icon is imported
    if (
      !menusContent.includes(`${iconName},`) &&
      !menusContent.includes(`${iconName} }`)
    ) {
      menusContent = menusContent.replace(
        /import \{([\s\S]*?)\} from "lucide-react"/,
        (match, imports) => {
          const trimmed = imports.trim();
          return `import {\n  ${trimmed},\n  ${iconName}\n} from "lucide-react"`;
        }
      );
    }

    fs.writeFileSync(menusPath, menusContent);
    console.log(`✅ Updated src/config/menus.ts with ${menuTitle}`);
  }
}

console.log("\n✅ Module Generated Successfully!");

// Add warning about restarting dev server
console.log("\n" + "=".repeat(70));
console.log(
  "⚠️  PENTING: Restart dev server Anda untuk load Prisma models baru!"
);
console.log(
  "   Matikan server dengan Ctrl+C, lalu jalankan 'npm run dev' lagi."
);
console.log(
  "   Error 'Cannot read properties of undefined' akan muncul jika tidak restart."
);
console.log("=".repeat(70) + "\n");
