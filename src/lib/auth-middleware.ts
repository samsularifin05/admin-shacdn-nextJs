import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { sanitizeObject } from "./security";

/**
 * Middleware to verify request signature
 * Formula: HMAC_SHA256(token + email + timestamp, secret)
 */
export async function verifySignature(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  // 0. Prevent direct browser navigation (Address Bar Access)
  const fetchMode = req.headers["sec-fetch-mode"];
  if (fetchMode === "navigate") {
    res.redirect(307, "/");
    return false;
  }

  // 1. GLOBAL INPUT SANITIZATION (Proactive Security)
  // Clean all incoming body data to prevent "script-scriptan" (XSS)
  if (
    req.body &&
    (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")
  ) {
    req.body = sanitizeObject(req.body);
  }

  const signature = req.headers["x-signature"] as string;
  const timestamp = req.headers["x-timestamp"] as string;
  const authHeader = req.headers["authorization"] as string;

  if (!signature || !timestamp) {
    res.status(401).json({ message: "Missing security headers" });
    return false;
  }

  const token = authHeader ? authHeader.replace("Bearer ", "") : "";
  const secret = process.env.API_SECRET || "b3r4sput1h";

  try {
    // 2. Check timestamp (allow 5 minute window for clock drift)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    if (isNaN(requestTime) || Math.abs(now - requestTime) > 300) {
      res.status(401).json({ message: "Request expired or invalid timestamp" });
      return false;
    }

    // 3. Decode token to get email (default to guest if not a JWT)
    let email = "guest@system.local";
    const tokenParts = token.split(".");

    if (tokenParts.length === 3) {
      try {
        const payloadBase64 = tokenParts[1];
        const payload = JSON.parse(
          Buffer.from(payloadBase64, "base64").toString()
        );
        email = payload.email || email;
      } catch (e) {
        console.warn("Server: Could not decode token payload");
      }
    }

    // 4. Reconstruct signature
    const message = `${token}${email}${timestamp}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(message)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Signature mismatch!");
      res.status(401).json({ message: "Invalid signature" });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    res.status(401).json({ message: "Authentication failed" });
    return false;
  }
}

/**
 * Higher-order function to wrap API handlers with signature protection
 */
export function withSignature(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const isValid = await verifySignature(req, res);
    if (!isValid) return;
    return handler(req, res);
  };
}
