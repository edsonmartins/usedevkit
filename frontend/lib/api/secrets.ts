import { apiClient } from "./client";
import type {
  Secret,
  CreateSecretDto,
  UpdateSecretDto,
  SecretMetadata,
  SecretRotationHistory,
} from "@/lib/types/secret";

export const secretsApi = {
  /**
   * Get secrets by application
   * GET /api/v1/secrets/application/{id}
   */
  getByApplication: (applicationId: string): Promise<SecretMetadata[]> =>
    apiClient.get<SecretMetadata[]>(`/secrets/application/${applicationId}`),

  /**
   * Get secret metadata (without decrypted value)
   * GET /api/v1/secrets/{id}
   */
  getById: (id: string): Promise<SecretMetadata> =>
    apiClient.get<SecretMetadata>(`/secrets/${id}`),

  /**
   * Get secret with decrypted value
   * GET /api/v1/secrets/{id}/decrypt
   */
  getDecrypted: (id: string): Promise<{ value: string }> =>
    apiClient.get<{ value: string }>(`/secrets/${id}/decrypt`),

  /**
   * Create new secret
   * POST /api/v1/secrets
   */
  create: (data: CreateSecretDto): Promise<SecretMetadata> =>
    apiClient.post<SecretMetadata>("/secrets", data),

  /**
   * Update secret
   * PUT /api/v1/secrets/{id}
   */
  update: (id: string, data: UpdateSecretDto): Promise<SecretMetadata> =>
    apiClient.put<SecretMetadata>(`/secrets/${id}`, data),

  /**
   * Rotate secret
   * POST /api/v1/secrets/{id}/rotate
   */
  rotate: (id: string, reason?: string): Promise<SecretMetadata> =>
    apiClient.post<SecretMetadata>(`/secrets/${id}/rotate`, { reason }),

  /**
   * Deactivate secret
   * POST /api/v1/secrets/{id}/deactivate
   */
  deactivate: (id: string): Promise<void> =>
    apiClient.post<void>(`/secrets/${id}/deactivate`),

  /**
   * Delete secret
   * DELETE /api/v1/secrets/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/secrets/${id}`),

  /**
   * Get rotation history
   * GET /api/v1/secrets/{id}/history
   */
  getHistory: (id: string): Promise<SecretRotationHistory[]> =>
    apiClient.get<SecretRotationHistory[]>(`/secrets/${id}/history`),

  /**
   * Get secrets stats
   * GET /api/v1/secrets/stats
   */
  getStats: (): Promise<{ total: number; active: number; rotationPending: number; expired: number }> =>
    apiClient.get<{ total: number; active: number; rotationPending: number; expired: number }>("/secrets/stats"),
};
