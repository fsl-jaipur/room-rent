/**
 * SIMPLIFIED API CLIENT
 * Clean, easy-to-understand API layer for frontend
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

interface QueryParams {
  [key: string]: string | number | boolean | null | undefined;
}

interface ApiRequestOptions extends RequestInit {
  params?: QueryParams;
}

/**
 * Simple API error class
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Simple token management
 */
export const TokenManager = {
  get: (): string | null => localStorage.getItem("auth_token"),
  set: (token: string): void => localStorage.setItem("auth_token", token),
  clear: (): void => localStorage.removeItem("auth_token"),
};

/**
 * SIMPLE API FETCH FUNCTION
 * Much cleaner than the original complex version
 */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Prepare headers
  const headers = new Headers(fetchOptions.headers || {});
  
  // Add auth token if available
  const token = TokenManager.get();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  // Add content-type for JSON (unless it's FormData)
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const requestUrl = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        requestUrl.searchParams.set(key, String(value));
      }
    });
  }

  // Make the request
  const response = await fetch(requestUrl.toString(), {
    ...fetchOptions,
    credentials: "include", // Important for cookies
    headers,
  });

  // Handle response
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new ApiError(response.status, errorMessage);
  }

  // Return JSON response
  try {
    return await response.json();
  } catch {
    // If response is not JSON, return empty object
    return {} as T;
  }
}

/**
 * CONVENIENCE METHODS
 * Simple shortcuts for common HTTP methods
 */
export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  
  post: <T>(path: string, data?: any) => 
    apiFetch<T>(path, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: <T>(path: string, data?: any) => 
    apiFetch<T>(path, {
      method: "PUT", 
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  patch: <T>(path: string, data?: any) => 
    apiFetch<T>(path, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
  
  // For file uploads
  upload: <T>(path: string, formData: FormData) =>
    apiFetch<T>(path, {
      method: "POST",
      body: formData,
    }),
};

// Backward-compatible alias for screens that still import `simpleApi`.
export const simpleApi = api;
