import { apiClient } from "./client";

export interface AuthenticateRequest {
  apiKey: string;
}

export interface AuthenticateResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export const authApi = {
  /**
   * Authenticate with API Key
   * POST /api/v1/auth/authenticate
   */
  authenticate: async (data: AuthenticateRequest): Promise<AuthenticateResponse> => {
    const response = await apiClient.post<AuthenticateResponse>("/auth/authenticate", data);
    return response;
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>("/auth/refresh", data);
    return response;
  },
};
