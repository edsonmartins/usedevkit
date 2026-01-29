import { apiClient } from "./client";
import type {
  Secret,
  CreateSecretDto,
  UpdateSecretDto,
  SecretMetadata,
  SecretRotationHistory,
} from "@/lib/types/secret";

type SecretResponse = {
  id: string;
  key: string;
  description?: string | null;
  applicationId: string;
  environmentId?: string | null;
  externalProvider?: string | null;
  externalSecretName?: string | null;
  rotationPolicy?: string | null;
  lastRotationDate?: string | null;
  nextRotationDate?: string | null;
  isActive: boolean;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
};

type SecretResponseWithDecrypted = SecretResponse & {
  decryptedValue: string;
};

type SecretRotationResponse = {
  id: string;
  secretId: string;
  rotatedBy?: string | null;
  status: string;
  reason?: string | null;
  rotationDate: string;
};

type SecretStatsResponse = {
  total: number;
  active: number;
  rotationPending: number;
  expired: number;
};

const mapRotationPolicy = (rotationDays?: number): string => {
  switch (rotationDays) {
    case 30:
      return "AUTOMATIC_30_DAYS";
    case 60:
      return "AUTOMATIC_60_DAYS";
    case 90:
      return "AUTOMATIC_90_DAYS";
    default:
      return "MANUAL";
  }
};

const mapSecretStatus = (secret: SecretResponse): SecretMetadata["status"] => {
  if (!secret.isActive) return "DEACTIVATED";
  if (secret.nextRotationDate && new Date(secret.nextRotationDate) <= new Date()) {
    return "ROTATION_PENDING";
  }
  return "ACTIVE";
};

const mapSecretMetadata = (secret: SecretResponse): SecretMetadata => ({
  id: secret.id,
  key: secret.key,
  type: "OTHER",
  status: mapSecretStatus(secret),
  description: secret.description || undefined,
  rotationDays: secret.rotationPolicy?.includes("30") ? 30 : secret.rotationPolicy?.includes("60") ? 60 : secret.rotationPolicy?.includes("90") ? 90 : undefined,
  externalProvider: secret.externalProvider as SecretMetadata["externalProvider"],
  externalSecretName: secret.externalSecretName || undefined,
  lastRotatedAt: secret.lastRotationDate || undefined,
  expiresAt: undefined,
  daysUntilExpiration: undefined,
  createdAt: secret.createdAt,
  updatedAt: secret.updatedAt,
});

export const secretsApi = {
  /**
   * Get all active secrets
   * GET /api/v1/secrets
   */
  getAll: async (): Promise<SecretMetadata[]> => {
    const secrets = await apiClient.get<SecretResponse[]>("/secrets");
    return secrets.map(mapSecretMetadata);
  },

  /**
   * Get secrets by application
   * GET /api/v1/secrets/application/{id}
   */
  getByApplication: async (applicationId: string): Promise<SecretMetadata[]> => {
    const secrets = await apiClient.get<SecretResponse[]>(`/secrets/application/${applicationId}`);
    return secrets.map(mapSecretMetadata);
  },

  /**
   * Get secret metadata (without decrypted value)
   * GET /api/v1/secrets/{id}
   */
  getById: async (id: string): Promise<SecretMetadata> => {
    const secret = await apiClient.get<SecretResponse>(`/secrets/${id}`);
    return mapSecretMetadata(secret);
  },

  /**
   * Get secret with decrypted value
   * GET /api/v1/secrets/{id}/decrypt
   */
  getDecrypted: async (id: string): Promise<{ value: string }> => {
    const secret = await apiClient.get<SecretResponseWithDecrypted>(`/secrets/${id}/decrypt`);
    return { value: secret.decryptedValue };
  },

  /**
   * Create new secret
   * POST /api/v1/secrets
   */
  create: async (data: CreateSecretDto): Promise<SecretMetadata> => {
    const secret = await apiClient.post<SecretResponse>("/secrets", {
      key: data.key,
      value: data.value,
      description: data.description,
      applicationId: data.applicationId,
      environmentId: null,
      rotationPolicy: mapRotationPolicy(data.rotationDays),
      externalProvider: data.externalProvider,
      externalSecretName: data.externalSecretName,
    });
    return mapSecretMetadata(secret);
  },

  /**
   * Update secret
   * PUT /api/v1/secrets/{id}
   */
  update: async (id: string, data: UpdateSecretDto): Promise<SecretMetadata> => {
    const secret = await apiClient.put<SecretResponse>(`/secrets/${id}`, {
      value: data.value,
      description: data.description,
      rotationPolicy: mapRotationPolicy(data.rotationDays),
      externalProvider: data.externalProvider,
      externalSecretName: data.externalSecretName,
    });
    return mapSecretMetadata(secret);
  },

  /**
   * Rotate secret
   * POST /api/v1/secrets/{id}/rotate
   */
  rotate: async (id: string, newValue: string): Promise<SecretMetadata> => {
    const secret = await apiClient.post<SecretResponse>(`/secrets/${id}/rotate`, {
      newValue,
      rotatedBy: "system",
    });
    return mapSecretMetadata(secret);
  },

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
  getHistory: async (id: string): Promise<SecretRotationHistory[]> => {
    const history = await apiClient.get<SecretRotationResponse[]>(`/secrets/${id}/history`);
    return history.map((entry) => ({
      id: entry.id,
      secretId: entry.secretId,
      rotatedAt: entry.rotationDate,
      rotatedBy: entry.rotatedBy || undefined,
      previousValuePrefix: "",
      reason: entry.reason || undefined,
    }));
  },

  /**
   * Get secrets stats
   * GET /api/v1/secrets/stats
   */
  getStats: async (): Promise<{ total: number; active: number; rotationPending: number; expired: number }> => {
    const stats = await apiClient.get<SecretStatsResponse>("/secrets/stats");
    return stats;
  },
};
