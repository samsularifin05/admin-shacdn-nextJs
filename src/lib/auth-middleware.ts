import type { NextApiRequest, NextApiResponse } from "next";
import { sanitizeObject } from "./security";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "r4h4s14_su93r_s3kr3t";

/**
 * Middleware to verify request authentication via Cookies
 */
export async function verifyAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  // 0. Prevent direct browser navigation (Address Bar Access)
  // REMOVED: This was causing issues with page refreshes if this middleware is used in getServerSideProps
  const fetchMode = req.headers["sec-fetch-mode"];
  if (fetchMode === "navigate") {
    res.redirect(307, "/");
    return false;
  }

  // 1. GLOBAL INPUT SANITIZATION
  if (
    req.body &&
    (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")
  ) {
    req.body = sanitizeObject(req.body);
  }

  // 2. COOKIE-BASED AUTHENTICATION
  // We now use secure HttpOnly cookies instead of X-Signature for better security and clean localStorage
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded; // Attach user info to request
    return true;
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired session" });
    return false;
  }
}

/**
 * Higher-order function to wrap API handlers with authentication protection
 */
export function withSignature(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isValid = await verifyAuth(req, res);
    if (!isValid) return;
    return handler(req, res);
  };
}
