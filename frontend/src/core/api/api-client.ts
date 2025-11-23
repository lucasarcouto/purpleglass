import { ApiEndpoint } from "@/core/api/api-endpoint";

interface ApiError {
  error: string;
  message: string;
}

class ApiClient {
  private readonly baseUrl: string;

  constructor() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!backendUrl) {
      throw new Error("VITE_BACKEND_URL is not set");
    }

    this.baseUrl = backendUrl;
  }

  async get<T>(endpoint: ApiEndpoint): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: ApiEndpoint, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: ApiEndpoint, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint as ApiEndpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: ApiEndpoint, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async upload<T>(endpoint: ApiEndpoint, file: File): Promise<T> {
    const token = this.getAuthToken();
    const formData = new FormData();

    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: "Unknown Error",
        message: "An unknown error occurred",
      }));
      throw new Error(error.message || "Upload failed");
    }

    return response.json();
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private async request<T>(
    endpoint: ApiEndpoint,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: "Unknown Error",
        message: "An unknown error occurred",
      }));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
