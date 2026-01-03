import type { NextApiRequest, NextApiResponse } from "next";
import { barangServer } from "@/modules/barangs/server/barangs.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

  try {
    switch (req.method) {
      case "GET":
        const item = await barangServer.getById(id);
        if (!item) return res.status(404).json({ message: "Not Found" });
        return res.status(200).json(item);

      case "PUT":
        const updated = await barangServer.update(id, req.body);
        return res.status(200).json(updated);

      case "DELETE":
        await barangServer.delete(id);
        return res.status(204).end();

      default:
        res.setHeader("Allow", ["PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("API Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
