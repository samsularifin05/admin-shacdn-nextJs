import { NextApiRequest, NextApiResponse } from "next";
import { ModuleService } from "@/modules/cms-builder/services/module-service";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { method, query } = req;
    const { id } = query;
    const moduleId = parseInt(id as string);

    if (isNaN(moduleId)) {
      return res.status(400).json({ message: "Invalid module ID" });
    }

    switch (method) {
      case "GET":
        const module = await ModuleService.getModuleById(moduleId);
        if (!module) {
          return res.status(404).json({ message: "Module not found" });
        }
        return res.status(200).json(module);

      case "PUT":
        const updated = await ModuleService.updateModule(moduleId, req.body);

        // Auto-regenerate scaffold if module is published
        if (updated.published) {
          try {
            const moduleConfig =
              await ModuleService.exportModuleToJSON(moduleId);
            if (moduleConfig) {
              // Save to formJson
              const formJsonDir = path.resolve(process.cwd(), "formJson");
              if (!fs.existsSync(formJsonDir)) {
                fs.mkdirSync(formJsonDir, { recursive: true });
              }

              const configPath = path.join(
                formJsonDir,
                `${moduleConfig.resourceName}.json`,
              );
              fs.writeFileSync(
                configPath,
                JSON.stringify(moduleConfig, null, 2),
              );

              // Regenerate scaffold
              execSync(`npm run generate:module ${moduleConfig.resourceName}`, {
                cwd: process.cwd(),
                encoding: "utf-8",
              });

              console.log(
                `✅ Scaffold regenerated for: ${moduleConfig.resourceName}`,
              );
            }
          } catch (scaffoldError) {
            console.error("Failed to auto-regenerate scaffold:", scaffoldError);
            // Don't fail update if scaffold generation fails
          }
        }

        return res.status(200).json(updated);

      case "DELETE":
        await ModuleService.deleteModule(moduleId);
        return res.status(204).end();

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("CMS Module API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
