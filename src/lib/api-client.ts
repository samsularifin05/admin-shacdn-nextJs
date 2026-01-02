import { addSignatureHeaders } from "./signature";

const API_BASE_URL = "";

/**
 * Custom Fetch Wrapper to automatically add Security Signatures
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // 1. Get Token safely
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token") || "";
  }

  // 2. Prepare Base Headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // 3. Merge headers safely
  let inputHeaders: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        inputHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        inputHeaders[key] = value;
      });
    } else {
      inputHeaders = options.headers as Record<string, string>;
    }
  }

  let mergedHeaders = {
    ...defaultHeaders,
    ...inputHeaders,
  };

  // 4. Automatically Add Signature (ONLY for local /api/ endpoints)
  if (endpoint.startsWith("/api/") || endpoint.startsWith("api/")) {
    console.log(`[API REQUEST] Adding signature to: ${endpoint}`);
    mergedHeaders = await addSignatureHeaders(token, mergedHeaders);
  }

  // Debug: Log final headers to console (Browser)
  if (typeof window !== "undefined") {
    console.group(`HTTP ${options.method || "GET"} ${endpoint}`);
    console.log("Headers:", mergedHeaders);
    console.groupEnd();
  }

  // 5. Execute Fetch
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
  });

  // 6. Handle Global Response
  if (!response.ok) {
    let errorMessage = "Request failed";
    let field = undefined;

    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
      field = data.field;
    } catch (e) {
      // Fallback if not JSON
    }

    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.field = field;
    throw error;
  }

  return response;
}

export const apiClient = {
  get: (url: string, options?: RequestInit) =>
    apiRequest(url, { ...options, method: "GET" }),
  post: (url: string, data?: any, options?: RequestInit) =>
    apiRequest(url, { ...options, method: "POST", body: JSON.stringify(data) }),
  put: (url: string, data?: any, options?: RequestInit) =>
    apiRequest(url, { ...options, method: "PUT", body: JSON.stringify(data) }),
  delete: (url: string, options?: RequestInit) =>
    apiRequest(url, { ...options, method: "DELETE" }),
};
