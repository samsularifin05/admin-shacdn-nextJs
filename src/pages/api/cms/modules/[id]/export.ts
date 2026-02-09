import { NextApiRequest, NextApiResponse } from "next";
import { ModuleService } from "@/modules/cms-builder/services/module-service";

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

    if (method === "GET") {
      const json = await ModuleService.exportModuleToJSON(moduleId);
      if (!json) {
        return res.status(404).json({ message: "Module not found" });
      }
      return res.status(200).json(json);
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error("CMS Module Export API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
