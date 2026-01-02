import type { NextApiRequest, NextApiResponse } from "next";
import { userServerLogic } from "@/modules/users/server/user.server";
import { withSignature } from "@/lib/auth-middleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = (req.query.search as string) || undefined;

        const result = await userServerLogic.getPaginatedUsers(
          page,
          limit,
          search
        );
        return res.status(200).json(result);

      case "POST":
        const newUser = await userServerLogic.createUser(req.body);
        return res.status(201).json(newUser);

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res
          .status(405)
          .json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(`API Error (${req.method} /api/users):`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default withSignature(handler);
