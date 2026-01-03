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
  | "async-select";

interface Field {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[];
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  relatedTable?: string; // For async-select: the Prisma model name to join
  relatedDisplayField?: string; // For async-select: which field to display in table
  defaultValue?: any;
  formula?: string;
  readOnly?: boolean;
  readOnlyOnEdit?: boolean;
  validation?: {
    min?: number;
    max?: number;
  };
}

interface GeneratorConfig {
  moduleName: string;
  resourceName: string;
  tableName: string;
  title: string;
  route?: string;
  classForm?: string;
  fields: Field[];
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
  const fieldDefs = fields
    .map((f) => {
      let zType = "z.string()";
      if (
        f.type === "number" ||
        f.type === "currency" ||
        f.type === "rupiah" ||
        f.type === "async-select"
      )
        zType = "z.coerce.number()";
      if (f.type === "boolean") zType = "z.boolean()";
      if (f.type === "select" && f.options)
        zType = `z.enum(${JSON.stringify(f.options)})`;
      if (f.type === "email") zType = "z.string().email()";

      let validation = zType;
      // Zod modifiers
      if (f.validation?.min) validation += `.min(${f.validation.min})`;
      if (f.required === false) validation += ".optional()";

      return `  ${f.name}: ${validation},`;
    })
    .join("\n");

  const tsTypes = fields
    .map((f) => {
      let t = "string";
      if (
        f.type === "number" ||
        f.type === "currency" ||
        f.type === "rupiah" ||
        f.type === "async-select"
      )
        t = "number";
      if (f.type === "boolean") t = "boolean";
      if (f.type === "select" && f.options)
        t = f.options.map((o) => `"${o}"`).join(" | ");
      if (f.required === false) t += " | null | undefined";
      return `  ${f.name}${f.required === false ? "?" : ""}: ${t};`;
    })
    .join("\n");

  const relationTypes = fields
    .filter((f) => f.type === "async-select" && f.relatedTable)
    .map((f) => `  ${f.name}Rel?: any;`)
    .join("\n");

  return `import { z } from "zod";

export const ${toCamelCase(moduleName)}Schema = z.object({
${fieldDefs}
});

export type ${moduleName}FormData = z.infer<typeof ${toCamelCase(
    moduleName
  )}Schema>;

export type ${moduleName} = {
  id: number;
${tsTypes}
${relationTypes}
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
    (f) => f.type === "async-select" && f.relatedTable
  );
  const includeStr =
    asyncSelectFields.length > 0
      ? `\n        include: {\n${asyncSelectFields
          .map((f) => `          ${f.name}Rel: true`)
          .join(",\n")}\n        },`
      : "";

  // Try to use @/lib/prisma, fallback to manual fix if needed
  return `import { prisma } from "@/lib/prisma";
import { ${moduleName}FormData } from "../types/${resourceName}.schema";

export const ${toCamelCase(moduleName)}Server = {
  async getPaginated(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        // Add other search fields if needed
      ];
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
      where: { id },${includeStr}
    });
  },

  async create(data: ${moduleName}FormData) {
    return prisma.${toCamelCase(tableName)}.create({
      data: {
        ...data,
      },${includeStr}
    });
  },

  async update(id: number, data: ${moduleName}FormData) {
    return prisma.${toCamelCase(tableName)}.update({
      where: { id },
      data,${includeStr}
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
      let input = ``;
      if (f.type === "select") {
        input = `
          <FormSelect
            name="${f.name}"
            label="${f.label}"
            placeholder="Select ${f.label}"
            options={[
              ${f.options
                ?.map((opt) => `{ label: "${opt}", value: "${opt}" }`)
                .join(",\n              ")}
            ]}
            disabled={isLoading}
          />`;
      } else if (f.type === "async-select") {
        input = `
          <FormAsyncSelect
            name="${f.name}"
            label="${f.label}"
            placeholder="Select ${f.label}"
            endpoint="${f.endpoint || ""}"
            ${f.labelField ? `labelField="${f.labelField}"` : ""}
            ${f.valueField ? `valueField="${f.valueField}"` : ""}
            disabled={isLoading}
          />`;
      } else if (f.type === "boolean") {
        input = `
          <FormCheckbox
            name="${f.name}"
            label="${f.label}"
            disabled={isLoading}
          />`;
      } else if (f.type === "currency" || f.type === "rupiah") {
        // Determine readonly prop
        let readOnlyProp = "";
        if (f.readOnly) {
          readOnlyProp = "readOnly";
        } else if (f.readOnlyOnEdit) {
          readOnlyProp = "readOnly={!!initialData}";
        }

        // Determine className prop
        let classNameProp = "";
        if (f.readOnly) {
          classNameProp = 'className="bg-muted"';
        } else if (f.readOnlyOnEdit) {
          classNameProp = 'className={initialData ? "bg-muted" : ""}';
        }

        input = `
          <FormCurrency
            name="${f.name}"
            label="${f.label}"
            placeholder="${f.label}"
            disabled={isLoading}
            ${readOnlyProp}
            ${classNameProp}
          />`;
      } else {
        // Determine readonly prop
        let readOnlyProp = "";
        if (f.readOnly) {
          readOnlyProp = "readOnly";
        } else if (f.readOnlyOnEdit) {
          readOnlyProp = "readOnly={!!initialData}";
        }

        // Determine className prop
        let classNameProp = "";
        if (f.readOnly) {
          classNameProp = 'className="bg-muted"';
        } else if (f.readOnlyOnEdit) {
          classNameProp = 'className={initialData ? "bg-muted" : ""}';
        }

        input = `
          <FormInput
            name="${f.name}"
            label="${f.label}"
            placeholder="${f.label}"
            type="${f.type === "number" ? "number" : "text"}"
            disabled={isLoading}
            ${readOnlyProp}
            ${classNameProp}
          />`;
      }
      return input;
    })
    .join("\n");

  return `import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ${toCamelCase(
    moduleName
  )}Schema, ${moduleName}FormData, ${moduleName} } from "../types/${resourceName}.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect } from "@/components/form";
import { ${toCamelCase(
    moduleName
  )}Service } from "../services/${resourceName}.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";

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
        .map((f) => `${f.name}: initialData.${f.name} ?? undefined`)
        .join(",\n      ")}
    } : {
      ${fields
        .map(
          (f) =>
            `${f.name}: ${
              f.defaultValue !== undefined
                ? JSON.stringify(f.defaultValue)
                : f.type === "boolean"
                ? "false"
                : f.type === "number"
                ? "0"
                : f.type === "select"
                ? "undefined"
                : '""'
            }`
        )
        .join(",\n      ")}
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  ${calculationHook}

  const onSubmit = async (data: ${moduleName}FormData) => {
    try {
      if (initialData) {
        await ${toCamelCase(moduleName)}Service.update(initialData.id, data);
      } else {
        await ${toCamelCase(moduleName)}Service.create(data);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="${classForm || "space-y-4"}">
${formFields}
        </div>
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
  const columns = fields
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

  return `import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
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
    (type: "create" | "update" | "delete" | "view", row?: ${moduleName}) => {
      switch (type) {
        case "create":
          onOpen("form", {
            title: "Add ${title}",
            size: "lg",
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
              size: "lg",
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
    ],
    [handleAction]
  );

  const columns: ColumnDef<${moduleName}>[] = useMemo(
    () => [
${columns}
    ],
    []
  );

  return (
    <ServerDataTable
      ref={tableRef}
      endpoint="/api/${resourceName}"
      dataPath="${resourceName}"
      columns={columns}
      actions={tableActions}
      searchPlaceholder="Search ${moduleName.toLowerCase()}s..."
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
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = (req.query.search as string) || undefined;
        const result = await ${toCamelCase(
          moduleName
        )}Server.getPaginated(page, limit, search);
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
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Delete failed:", error);
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
  fields.forEach((f) => {
    if (f.type === "string" || f.type === "text") {
      if (f.name.toLowerCase().includes("nama"))
        sampleData[f.name] = `Sample ${moduleName}`;
      else if (f.name.toLowerCase().includes("kode"))
        sampleData[f.name] = `${moduleName.toUpperCase()}-01`;
      else sampleData[f.name] = "Sample data";
    } else if (
      f.type === "number" ||
      f.type === "currency" ||
      f.type === "rupiah"
    ) {
      sampleData[f.name] = 1000;
    } else if (f.type === "boolean") {
      sampleData[f.name] = true;
    } else if (f.type === "select" && f.options) {
      sampleData[f.name] = f.options[0];
    } else if (f.type === "async-select") {
      sampleData[f.name] = 1; // Assuming ID 1 exists
    } else if (f.type === "email") {
      sampleData[f.name] = "sample@example.com";
    }
  });

  return `import { PrismaClient } from "@prisma/client";

export async function seed${toPascalCase(moduleName)}(prisma: PrismaClient) {
  console.log("🌱 Seeding ${moduleName}...");

  const data = ${JSON.stringify(sampleData, null, 2)};

  await prisma.${toCamelCase(tableName)}.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      ...data
    },
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

// Update schema.prisma
const prismaSchemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
if (fs.existsSync(prismaSchemaPath)) {
  let schemaContent = fs.readFileSync(prismaSchemaPath, "utf-8");

  // Check if model already exists
  if (!schemaContent.includes(`model ${tableName} {`)) {
    const modelDefinition = `
model ${tableName} {
  id        Int      @id @default(autoincrement())
${fields
  .map((f) => {
    if (f.type === "async-select" && f.relatedTable) {
      return `  ${f.name}      Int?
  ${f.name}Rel   ${f.relatedTable}? @relation(fields: [${f.name}], references: [id])`;
    }
    const prismaType =
      f.type === "number" || f.type === "currency" || f.type === "rupiah"
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
`;
    fs.appendFileSync(prismaSchemaPath, modelDefinition);
    console.log(`\n✅ Added model ${tableName} to prisma/schema.prisma`);
    console.log(
      "⚠️  Running 'npx prisma db push' and 'npx prisma generate'..."
    );
    try {
      require("child_process").execSync(
        "npx prisma format && npx prisma db push && npx prisma generate",
        {
          stdio: "inherit",
        }
      );
    } catch (e) {
      console.error(
        "❌ Failed to run prisma commands. Please run them manually."
      );
    }
  } else {
    console.log(
      `\nℹ️  Model ${tableName} already exists in schema.prisma. Skipping...`
    );
  }
} else {
  console.log(
    "\n⚠️  prisma/schema.prisma not found. Please add the model manually."
  );
}

// Try to trigger Next.js hot reload by touching prisma.ts
const prismaLibPath = path.resolve(process.cwd(), "src/lib/prisma.ts");
if (fs.existsSync(prismaLibPath)) {
  console.log("\n🔄 Mencoba trigger hot-reload Next.js...");
  try {
    const now = new Date();
    fs.utimesSync(prismaLibPath, now, now);
    console.log("✓ File prisma.ts di-touch. Dev server mungkin auto-reload.");
  } catch (e) {
    // Silently fail
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
