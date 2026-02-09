import { prisma } from "@/lib/prisma";
import { ModuleConfig, FieldConfig, RelationshipConfig } from "../types";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export class ModuleService {
  // Create a new module
  static async createModule(data: ModuleConfig) {
    const { fields, ...moduleData } = data;

    return await prisma.cmsModule.create({
      data: {
        ...moduleData,
        fields: {
          create: fields.map((field, index) => {
            const fieldData: any = {
              ...field,
              sortOrder: field.sortOrder ?? index,
            };
            if (field.options)
              fieldData.options = JSON.stringify(field.options);
            if (field.validation)
              fieldData.validation = JSON.stringify(field.validation);
            if (field.autoFill)
              fieldData.autoFill = JSON.stringify(field.autoFill);
            if (field.dependency)
              fieldData.dependency = JSON.stringify(field.dependency);
            if (field.detailFields)
              fieldData.detailFields = JSON.stringify(field.detailFields);
            return fieldData;
          }),
        },
      },
      include: {
        fields: true,
        relationships: true,
      },
    });
  }

  // Get all modules
  static async getModules(filters?: {
    published?: boolean;
    moduleType?: string;
  }) {
    return await prisma.cmsModule.findMany({
      where: filters,
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            fields: true,
            pages: true,
            relationships: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  // Get module by ID
  static async getModuleById(id: number) {
    return await prisma.cmsModule.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
        },
        relationships: {
          include: {
            targetModule: true,
          },
        },
        pages: true,
      },
    });
  }

  // Get module by resource name
  static async getModuleByResourceName(resourceName: string) {
    return await prisma.cmsModule.findUnique({
      where: { resourceName },
      include: {
        fields: {
          orderBy: { sortOrder: "asc" },
        },
        relationships: {
          include: {
            targetModule: true,
          },
        },
      },
    });
  }

  // Update module
  static async updateModule(id: number, data: Partial<ModuleConfig>) {
    const {
      fields,
      relationships,
      pages,
      createdAt,
      updatedAt,
      id: _id,
      ...moduleData
    } = data as any;

    // If fields are provided, delete old ones and create new ones
    if (fields) {
      await prisma.cmsField.deleteMany({
        where: { moduleId: id },
      });
    }

    return await prisma.cmsModule.update({
      where: { id },
      data: {
        ...moduleData,
        ...(fields && {
          fields: {
            create: fields.map((field: any, index: number) => {
              // Remove fields that shouldn't be in create data
              const {
                id: _fieldId,
                moduleId: _moduleId,
                createdAt: _createdAt,
                updatedAt: _updatedAt,
                ...cleanField
              } = field;

              const fieldData: any = {
                ...cleanField,
                sortOrder: cleanField.sortOrder ?? index,
              };
              if (cleanField.options)
                fieldData.options = JSON.stringify(cleanField.options);
              if (cleanField.validation)
                fieldData.validation = JSON.stringify(cleanField.validation);
              if (cleanField.autoFill)
                fieldData.autoFill = JSON.stringify(cleanField.autoFill);
              if (cleanField.dependency)
                fieldData.dependency = JSON.stringify(cleanField.dependency);
              if (cleanField.detailFields)
                fieldData.detailFields = JSON.stringify(
                  cleanField.detailFields,
                );
              return fieldData;
            }),
          },
        }),
      },
      include: {
        fields: true,
        relationships: true,
      },
    });
  }

  // Publish module
  static async publishModule(id: number) {
    return await prisma.cmsModule.update({
      where: { id },
      data: {
        published: true,
        publishedAt: new Date(),
      },
    });
  }

  // Unpublish module
  static async unpublishModule(id: number) {
    return await prisma.cmsModule.update({
      where: { id },
      data: {
        published: false,
        publishedAt: null,
      },
    });
  }

  // Delete module
  static async deleteModule(id: number) {
    // Get module info before deleting
    const module = await prisma.cmsModule.findUnique({
      where: { id },
      select: { resourceName: true, name: true, published: true },
    });

    if (!module) {
      throw new Error("Module not found");
    }

    // Check if module is published
    if (module.published) {
      throw new Error(
        "Cannot delete published module. Please unpublish first.",
      );
    }

    // Export module to formJson first (needed by delete script)
    const moduleConfig = await this.exportModuleToJSON(id);
    if (moduleConfig) {
      const formJsonDir = path.resolve(process.cwd(), "formJson");
      if (!fs.existsSync(formJsonDir)) {
        fs.mkdirSync(formJsonDir, { recursive: true });
      }

      const configPath = path.join(formJsonDir, `${module.resourceName}.json`);
      fs.writeFileSync(configPath, JSON.stringify(moduleConfig, null, 2));
      console.log(`📝 Exported module config to: ${configPath}`);
    }

    // Delete from database (fields will be cascade deleted)
    await prisma.cmsModule.delete({
      where: { id },
    });
    console.log(`🗑️  Deleted module from database: ${module.name}`);

    // Run delete-module.ts script to clean up files, schema, menus, etc.
    try {
      console.log(`🚀 Running delete script for: ${module.resourceName}`);
      execSync(
        `npm run delete:module ${module.resourceName} -- --skip-db-push`,
        {
          cwd: process.cwd(),
          stdio: "inherit",
        },
      );
      console.log(`✅ Module cleanup completed: ${module.resourceName}`);
    } catch (error) {
      console.error("Failed to run delete script:", error);
      // Continue anyway, database record is already deleted
    }

    return { success: true, resourceName: module.resourceName };
  }

  // Create relationship
  static async createRelationship(data: RelationshipConfig) {
    return await prisma.cmsRelationship.create({
      data,
      include: {
        sourceModule: true,
        targetModule: true,
      },
    });
  }

  // Get relationships for a module
  static async getModuleRelationships(moduleId: number) {
    return await prisma.cmsRelationship.findMany({
      where: {
        OR: [{ sourceModuleId: moduleId }, { targetModuleId: moduleId }],
      },
      include: {
        sourceModule: true,
        targetModule: true,
      },
    });
  }

  // Export module as JSON (compatible with formJson format)
  static async exportModuleToJSON(id: number) {
    const module = await this.getModuleById(id);
    if (!module) return null;

    const fields = module.fields.map((field) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      readOnly: field.readOnly,
      readOnlyOnEdit: field.readOnlyOnEdit,
      defaultValue: field.defaultValue,
      placeholder: field.placeholder ?? undefined,
      ...(field.options && { options: JSON.parse(field.options as string) }),
      ...(field.endpoint && { endpoint: field.endpoint }),
      ...(field.labelField && { labelField: field.labelField }),
      ...(field.valueField && { valueField: field.valueField }),
      ...(field.relatedTable && { relatedTable: field.relatedTable }),
      ...(field.relatedDisplayField && {
        relatedDisplayField: field.relatedDisplayField,
      }),
      ...(field.autoCode && {
        autoCode: Boolean(field.autoCode),
      }),
      ...(field.autoFill && { autoFill: JSON.parse(field.autoFill as string) }),
      ...(field.dependency && {
        dependency: JSON.parse(field.dependency as string),
      }),
      ...(field.formula && { formula: field.formula }),
      ...(field.uploadDir && { uploadDir: field.uploadDir }),
      ...(field.detailFields && {
        detailFields: JSON.parse(field.detailFields as string),
      }),
      ...(field.validation && {
        validation: JSON.parse(field.validation as string),
      }),
    }));

    const exportedModule: {
      moduleName: string;
      resourceName: string;
      tableName: string;
      title: string;
      route: string;
      classForm: string;
      printable: boolean;
      [key: string]: any;
      fields: Array<{
        name: string;
        label: string;
        type: string;
        required: boolean;
        readOnly: boolean;
        readOnlyOnEdit: boolean;
        defaultValue?: any;
        placeholder?: string;
        options?: any;
        endpoint?: string;
        labelField?: string;
        valueField?: string;
        relatedTable?: string;
        relatedDisplayField?: string;
        autoCode?: boolean;
        autoFill?: any;
        dependency?: any;
        formula?: string;
        uploadDir?: string;
        detailFields?: any;
        validation?: any;
      }>;
    } = {
      moduleName: module.name,
      resourceName: module.resourceName,
      tableName: module.tableName,
      title: module.title,
      route: module.route ?? "",
      classForm: module.classForm ?? "",
      printable: module.printable,
      ...(module.metadata && typeof module.metadata === "object"
        ? module.metadata
        : {}),
      fields,
    };

    return exportedModule;
  }

  // Import module from JSON (formJson format)
  static async importModuleFromJSON(jsonData: any) {
    const moduleData: ModuleConfig = {
      name: jsonData.moduleName,
      resourceName: jsonData.resourceName,
      tableName: jsonData.tableName,
      title: jsonData.title,
      description: jsonData.description,
      icon: jsonData.icon,
      moduleType: jsonData.moduleType || "master",
      route: jsonData.route,
      classForm: jsonData.classForm,
      printable: jsonData.printable || false,
      metadata: {
        ...(jsonData.stockLogic && { stockLogic: jsonData.stockLogic }),
      },
      fields: jsonData.fields || [],
    };

    return await this.createModule(moduleData);
  }
}
