import type { BackendPropertyRecord, PropertyDraft, PropertyMeta } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID as string | undefined;

type ApiErrorPayload = {
  message?: string;
  issues?: Array<{ message?: string }>;
};

type UserPayload = {
  userName: string;
  phone: string;
  localAddress: string;
};

type UserResponse = {
  userId: string;
  userName: string;
  phone: string;
  userEmail: string;
  aadhaarNumber: string;
  localAddress: string;
  hometownAddress: string;
  profilePhotoUrl: string;
  isActive: boolean | null;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? ((await response.json()) as ApiErrorPayload & T) : undefined;

  if (!response.ok) {
    const issueText = payload?.issues?.map((issue) => issue?.message).filter(Boolean).join(", ");
    const message = issueText || payload?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return (payload ?? ({} as T)) as T;
}

export async function getHealth() {
  return apiRequest<{ status: "ok"; service: string }>("/health");
}

export async function getPropertyMeta() {
  const response = await apiRequest<{ message: string; metadata: PropertyMeta }>("/properties/meta");
  return response.metadata;
}

export async function listProperties(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const response = await apiRequest<{ message: string; properties: BackendPropertyRecord[] }>(`/properties${query}`);
  return response.properties;
}

export async function getProperty(propertyId: string) {
  const response = await apiRequest<{ message: string; property: BackendPropertyRecord }>(`/properties/${propertyId}`);
  return response.property;
}

export async function createProperty(input: PropertyDraft & { userId: string }) {
  return apiRequest<{ message: string }>("/properties", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateProperty(propertyId: string, input: PropertyDraft & { userId: string }) {
  return apiRequest<{ message: string }>(`/properties/${propertyId}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}

export async function deleteProperty(propertyId: string) {
  return apiRequest<{ message: string }>(`/properties/${propertyId}`, {
    method: "DELETE"
  });
}

export async function createUser(input: UserPayload) {
  return apiRequest<{ message: string }>("/users", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function getUser(userId: string) {
  const response = await apiRequest<{ message: string; user: UserResponse }>(`/users/${userId}`);
  return response.user;
}

export async function updateUser(userId: string, input: UserPayload) {
  return apiRequest<{ message: string }>(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(input)
  });
}
