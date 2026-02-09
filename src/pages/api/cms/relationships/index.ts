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
        const { moduleId } = req.query;
        if (!moduleId) {
          return res.status(400).json({ message: "Module ID required" });
        }
        const relationships = await ModuleService.getModuleRelationships(
          parseInt(moduleId as string),
        );
        return res.status(200).json(relationships);

      case "POST":
        const relationship = await ModuleService.createRelationship(req.body);
        return res.status(201).json(relationship);

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    console.error("CMS Relationship API Error:", error);
    return res.status(500).json({ message: error.message });
  }
}
