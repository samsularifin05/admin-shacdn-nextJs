import type { NextApiRequest, NextApiResponse } from "next";
import { jenisServer } from "@/modules/jenis/server/jenis.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        const { page: _page, limit: _limit, search: _search, ...filters } = req.query;
        const page = Number(_page) || 1;
        const limit = Number(_limit) || 10;
        const search = (_search as string) || undefined;
        const result = await jenisServer.getPaginated(page, limit, search, filters);
        return res.status(200).json(result);

      case "POST":
        const newItem = await jenisServer.create(req.body);
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
