import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate HMAC-SHA256 signature for request verification
 * Combines: token + email + timestamp
 */
export async function generateSignature(
  token: string
): Promise<{ signature: string; timestamp: number; email: string }> {
  try {
    let email = "guest@system.local";

    // 1. Try to decode JWT to get email if token is valid
    if (token && token.split(".").length === 3) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        email = decoded.email;
      } catch (e) {
        console.warn("Could not decode token, using fallback email");
      }
    }

    // 2. Get current timestamp in seconds
    const timestamp = Math.floor(Date.now() / 1000);

    // 3. Create message to sign: token + email + timestamp
    const message = `${token}${email}${timestamp}`;

    // 4. Get API_SECRET from env
    const secret = process.env.NEXT_PUBLIC_API_SECRET || "b3r4sput1h";

    // 5. Generate HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const cryptoApi =
      globalThis.crypto ||
      (typeof window !== "undefined" ? window.crypto : undefined);

    if (!cryptoApi || !cryptoApi.subtle) {
      return { signature: "crypto_unavailable", timestamp, email };
    }

    const cryptoKey = await cryptoApi.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await cryptoApi.subtle.sign(
      "HMAC",
      cryptoKey,
      messageData
    );

    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = signatureArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return { signature, timestamp, email };
  } catch (error) {
    console.error("Signature generation error:", error);
    return {
      signature: "generation_failed",
      timestamp: Math.floor(Date.now() / 1000),
      email: "unknown",
    };
  }
}

/**
 * Add signature headers to fetch options
 */
export async function addSignatureHeaders(
  token: string,
  headers: Record<string, string> = {}
): Promise<Record<string, string>> {
  const { signature, timestamp } = await generateSignature(token);

  return {
    ...headers,
    "X-Signature": signature,
    "X-Timestamp": timestamp.toString(),
  };
}
