import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth";

interface AuthState {
  isAuthenticated: boolean;
  apiKey: string | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      apiKey: null,
      accessToken: null,
      isLoading: false,
      error: null,

      login: async (apiKey: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.authenticate({ apiKey });

          // Store tokens in localStorage via apiClient
          apiClient.setToken(response.accessToken);
          apiClient.setRefreshToken(response.refreshToken);
          apiClient.setApiKey(apiKey);

          set({
            isAuthenticated: true,
            apiKey,
            accessToken: response.accessToken,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Authentication failed";
          set({
            isAuthenticated: false,
            apiKey: null,
            accessToken: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        apiClient.clearAuth();
        set({
          isAuthenticated: false,
          apiKey: null,
          accessToken: null,
          error: null,
        });
      },

      checkAuth: () => {
        const isAuth = apiClient.isAuthenticated();
        const apiKey = apiClient.getApiKey();
        set({
          isAuthenticated: isAuth,
          apiKey: apiKey || null,
          accessToken: apiClient.getToken() || null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "devkit-auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        apiKey: state.apiKey,
        accessToken: state.accessToken,
      }),
    }
  )
);
