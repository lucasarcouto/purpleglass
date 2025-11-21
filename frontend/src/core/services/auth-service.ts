import { apiClient } from "@/core/api/api-client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/core/api/types";
import { ApiEndpoint } from "@/core/api/api-endpoint";

const AUTH_TOKEN_KEY = "auth_token";

class AuthService {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(ApiEndpoint.REGISTER, credentials);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      ApiEndpoint.LOGIN,
      credentials
    );

    localStorage.setItem(AUTH_TOKEN_KEY, response.token);

    return response;
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(ApiEndpoint.GET_CURRENT_USER);
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(ApiEndpoint.LOGOUT);
    } finally {
      // Since we are using a stateless JWT it's safe
      // to remove the token from the local storage even
      // if the API call fails
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }

  hasToken(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }
}

export const authService = new AuthService();
