import sanitizeHtml from "sanitize-html";

/**
 * Clean strings to prevent XSS (Cross-Site Scripting)
 */
export const sanitizeString = (str: string): string => {
  return sanitizeHtml(str, {
    allowedTags: [], // Don't allow any HTML tags
    allowedAttributes: {}, // Don't allow any HTML attributes
    disallowedTagsMode: "recursiveEscape",
  }).trim();
};

/**
 * Recursively sanitize an object
 */
export const sanitizeObject = <T>(obj: T): T => {
  if (typeof obj !== "object" || obj === null) {
    if (typeof obj === "string") {
      return sanitizeString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized as T;
};
