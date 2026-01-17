import { apiClient } from "./client";
import type {
  FeatureFlag,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
} from "@/lib/types/feature-flag";

export const featureFlagsApi = {
  /**
   * Get flags by application
   * GET /api/v1/feature-flags/application/{id}
   */
  getByApplication: (applicationId: string): Promise<FeatureFlag[]> =>
    apiClient.get<FeatureFlag[]>(`/feature-flags/application/${applicationId}`),

  /**
   * Get flag by ID
   * GET /api/v1/feature-flags/{id}
   */
  getById: (id: string): Promise<FeatureFlag> =>
    apiClient.get<FeatureFlag>(`/feature-flags/${id}`),

  /**
   * Get flag by key for application
   * GET /api/v1/feature-flags/application/{applicationId}/key/{key}
   */
  getByKey: (applicationId: string, key: string): Promise<FeatureFlag> =>
    apiClient.get<FeatureFlag>(`/feature-flags/application/${applicationId}/key/${key}`),

  /**
   * Create new feature flag
   * POST /api/v1/feature-flags
   */
  create: (data: CreateFeatureFlagDto): Promise<FeatureFlag> =>
    apiClient.post<FeatureFlag>("/feature-flags", data),

  /**
   * Update feature flag
   * PUT /api/v1/feature-flags/{id}
   */
  update: (id: string, data: UpdateFeatureFlagDto): Promise<FeatureFlag> =>
    apiClient.put<FeatureFlag>(`/feature-flags/${id}`, data),

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
