import { addSignatureHeaders } from "./signature";

const API_BASE_URL = "";

/**
 * Custom Fetch Wrapper
 * NOW SECURE: Uses Cookies for authentication.
 * X-Signature is temporarily disabled for Client-Side requests to keep localStorage clean,
 * as HTTP-Only cookies provide a stronger and cleaner security layer.
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  // 1. Prepare Base Headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 2. Merge headers safely
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

  // NOTE: Auth Token is now handled automatically by the browser via HTTP-Only Cookies.
  // We don't need to manually inject the Authorization header anymore for browser requests.

  // 3. Debug logging
  if (typeof window !== "undefined") {
    console.group(`HTTP ${options.method || "GET"} ${endpoint}`);
    console.log("Headers:", mergedHeaders);
    console.groupEnd();
  }

  // 4. Execute Fetch
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // Ensure cookies are always sent
    headers: mergedHeaders,
  });

  // 5. Handle Global Response
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

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
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
