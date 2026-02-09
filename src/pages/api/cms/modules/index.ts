import { NextApiRequest, NextApiResponse } from "next";
import { ModuleService } from "@/modules/cms-builder/services/module-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { method } = req;

    switch (method) {
      case "GET":
        const { published, moduleType } = req.query;
        const filters: any = {};
        if (published) filters.published = published === "true";
        if (moduleType) filters.moduleType = moduleType as string;

        const modules = await ModuleService.getModules(filters);
        return res.status(200).json(modules);

      case "POST":
        const module = await ModuleService.createModule(req.body);
        return res.status(201).json(module);

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("CMS Module API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
