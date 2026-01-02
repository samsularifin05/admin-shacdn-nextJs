import type { NextApiRequest, NextApiResponse } from "next";
import { userServerLogic } from "@/modules/users/server/user.server";
import { User } from "@/modules/users/types/user.schema";
import { withSignature } from "@/lib/auth-middleware";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | { message: string }>
) {
  const { id } = req.query;
  const userId = parseInt(id as string);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    switch (req.method) {
      case "GET":
        const user = await userServerLogic.getUserById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);

      case "PUT":
        const updatedUser = await userServerLogic.updateUser(userId, req.body);
        return res.status(200).json(updatedUser);

      case "DELETE":
        await userServerLogic.deleteUser(userId);
        return res.status(204).end();

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res
          .status(405)
          .json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(`API Error (${req.method} /api/users/${id}):`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default withSignature(handler);
