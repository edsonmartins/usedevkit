import { apiClient } from "./client";
import type {
  FeatureFlag,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
} from "@/lib/types/feature-flag";

type FeatureFlagResponse = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  status: string;
  rolloutStrategy?: string | null;
  rolloutPercentage?: number | null;
  targetingRules?: string | null;
  applicationId: string;
  isActive: boolean;
  variants: Array<{
    id: string;
    key: string;
    name: string;
    description?: string | null;
    rolloutPercentage?: number | null;
    payload?: string | null;
    isControl?: boolean | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

const mapFeatureFlag = (flag: FeatureFlagResponse): FeatureFlag => ({
  id: flag.id,
  key: flag.key,
  name: flag.name,
  description: flag.description || undefined,
  type: "BOOLEAN",
  status: flag.isActive ? "ACTIVE" : "INACTIVE",
  enabled: flag.status === "ENABLED" || flag.status === "CONDITIONAL",
  defaultValue: flag.status === "ENABLED" ? "true" : "false",
  applicationId: flag.applicationId,
  variants: flag.variants?.map((v) => ({
    id: v.id,
    name: v.name,
    value: v.payload || v.key,
    description: v.description || undefined,
    rolloutPercentage: v.rolloutPercentage || 0,
  })),
  targetingRules: [],
  rolloutPercentage: flag.rolloutPercentage || undefined,
  createdAt: flag.createdAt,
  updatedAt: flag.updatedAt,
});

export const featureFlagsApi = {
  /**
   * Get flags by application
   * GET /api/v1/feature-flags/application/{id}
   */
  getByApplication: async (applicationId: string): Promise<FeatureFlag[]> => {
    const flags = await apiClient.get<FeatureFlagResponse[]>(`/feature-flags/application/${applicationId}`);
    return flags.map(mapFeatureFlag);
  },

  /**
   * Get flag by ID
   * GET /api/v1/feature-flags/{id}
   */
  getById: async (id: string): Promise<FeatureFlag> => {
    const flag = await apiClient.get<FeatureFlagResponse>(`/feature-flags/${id}`);
    return mapFeatureFlag(flag);
  },

  /**
   * Get flag by key for application
   * GET /api/v1/feature-flags/application/{applicationId}/key/{key}
   */
  getByKey: async (applicationId: string, key: string): Promise<FeatureFlag> => {
    const flag = await apiClient.get<FeatureFlagResponse>(`/feature-flags/application/${applicationId}/key/${key}`);
    return mapFeatureFlag(flag);
  },

  /**
   * Create new feature flag
   * POST /api/v1/feature-flags
   */
  create: async (data: CreateFeatureFlagDto): Promise<FeatureFlag> => {
    const flag = await apiClient.post<FeatureFlagResponse>("/feature-flags", {
      applicationId: data.applicationId,
      key: data.key,
      name: data.name,
      description: data.description,
      status: data.enabled ? "ENABLED" : "DISABLED",
      rolloutStrategy: data.rolloutPercentage ? "PERCENTAGE" : "ALL",
      rolloutPercentage: data.rolloutPercentage,
      targetingRules: data.targetingRules ? JSON.stringify(data.targetingRules) : null,
    });
    return mapFeatureFlag(flag);
  },

  /**
   * Update feature flag
   * PUT /api/v1/feature-flags/{id}
   */
  update: async (id: string, data: UpdateFeatureFlagDto): Promise<FeatureFlag> => {
    const flag = await apiClient.put<FeatureFlagResponse>(`/feature-flags/${id}`, {
      name: data.name,
      description: data.description,
      status: data.enabled === undefined ? null : data.enabled ? "ENABLED" : "DISABLED",
      rolloutPercentage: data.rolloutPercentage,
      targetingRules: data.targetingRules ? JSON.stringify(data.targetingRules) : null,
    });
    return mapFeatureFlag(flag);
  },

  /**
   * Enable feature flag
   * POST /api/v1/feature-flags/{id}/enable
   */
  enable: (id: string): Promise<void> =>
    apiClient.post<void>(`/feature-flags/${id}/enable`),

  /**
   * Disable feature flag
   * POST /api/v1/feature-flags/{id}/disable
   */
  disable: (id: string): Promise<void> =>
    apiClient.post<void>(`/feature-flags/${id}/disable`),

  /**
   * Delete feature flag
   * DELETE /api/v1/feature-flags/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/feature-flags/${id}`),

  /**
   * Archive feature flag
   * POST /api/v1/feature-flags/{id}/archive
   */
  archive: (id: string): Promise<void> =>
    apiClient.post<void>(`/feature-flags/${id}/archive`),
};
