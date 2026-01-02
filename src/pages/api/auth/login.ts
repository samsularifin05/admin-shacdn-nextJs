import type { NextApiRequest, NextApiResponse } from "next";
import { userServerLogic } from "@/modules/users/server/user.server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "r4h4s14_su93r_s3kr3t";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await userServerLogic.verifyUser(email, password);

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie
    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      })
    );

    return res.status(200).json({
      message: "Login successful",
      token, // Keep token in response for the auth store and signature headers
      user,
    });
  } catch (error: any) {
    const message = error.message;
    const field = message.toLowerCase().includes("email")
      ? "email"
      : "password";

    return res.status(401).json({
      message,
      field,
    });
  }
}
