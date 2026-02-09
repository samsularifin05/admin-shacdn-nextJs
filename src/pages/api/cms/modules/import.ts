import { NextApiRequest, NextApiResponse } from "next";
import { ModuleService } from "@/modules/cms-builder/services/module-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { method } = req;

    if (method === "POST") {
      const module = await ModuleService.importModuleFromJSON(req.body);
      return res.status(201).json(module);
    }

    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error: any) {
    console.error("CMS Module Import API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
