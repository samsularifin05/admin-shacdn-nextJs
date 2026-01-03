import type { NextApiRequest, NextApiResponse } from "next";
import { bakiServer } from "@/modules/bakis/server/bakis.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = (req.query.search as string) || undefined;
        const result = await bakiServer.getPaginated(page, limit, search);
        return res.status(200).json(result);

      case "POST":
        const newItem = await bakiServer.create(req.body);
        return res.status(201).json(newItem);

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("API Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
