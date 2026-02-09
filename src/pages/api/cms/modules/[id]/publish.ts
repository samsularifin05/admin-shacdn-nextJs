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

    if (method === "POST") {
      const published = await ModuleService.publishModule(moduleId);

      // Auto-generate scaffold after publish
      try {
        const moduleConfig = await ModuleService.exportModuleToJSON(moduleId);
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
          fs.writeFileSync(configPath, JSON.stringify(moduleConfig, null, 2));

          // Generate scaffold
          execSync(`npm run generate:module ${moduleConfig.resourceName}`, {
            cwd: process.cwd(),
            encoding: "utf-8",
          });

          console.log(
            `✅ Scaffold generated for: ${moduleConfig.resourceName}`,
          );
        }
      } catch (scaffoldError) {
        console.error("Failed to auto-generate scaffold:", scaffoldError);
        // Don't fail publish if scaffold generation fails
      }

      return res.status(200).json(published);
    }

    if (method === "DELETE") {
      const unpublished = await ModuleService.unpublishModule(moduleId);
      return res.status(200).json(unpublished);
    }

    res.setHeader("Allow", ["POST", "DELETE"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error("CMS Module Publish API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
