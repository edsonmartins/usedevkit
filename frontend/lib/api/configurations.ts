import { apiClient } from "./client";
import type {
  Configuration,
  CreateConfigurationDto,
  UpdateConfigurationDto,
  ConfigurationVersion,
  ConfigDiff,
} from "@/lib/types/configuration";

export const configurationsApi = {
  /**
   * Get configurations by environment
   * GET /api/v1/configurations/environment/{id}
   */
  getByEnvironment: (environmentId: string): Promise<Configuration[]> =>
    apiClient.get<Configuration[]>(`/configurations/environment/${environmentId}`),

  /**
   * Get configurations as key-value map
   * GET /api/v1/configurations/environment/{id}/map
   */
  getMap: (environmentId: string): Promise<Record<string, string>> =>
    apiClient.get<Record<string, string>>(`/configurations/environment/${environmentId}/map`),

  /**
   * Get configuration by ID
   * GET /api/v1/configurations/{id}
   */
  getById: (id: string): Promise<Configuration> =>
    apiClient.get<Configuration>(`/configurations/${id}`),

  /**
   * Get configuration by key for environment
   * GET /api/v1/configurations/environment/{environmentId}/key/{key}
   */
  getByKey: (environmentId: string, key: string): Promise<Configuration> =>
    apiClient.get<Configuration>(`/configurations/environment/${environmentId}/key/${key}`),

  /**
   * Create new configuration
   * POST /api/v1/configurations
   */
  create: (data: CreateConfigurationDto): Promise<Configuration> =>
    apiClient.post<Configuration>("/configurations", data),

  /**
   * Update configuration
   * PUT /api/v1/configurations/{id}
   */
  update: (id: string, data: UpdateConfigurationDto): Promise<Configuration> =>
    apiClient.put<Configuration>(`/configurations/${id}`, data),

  /**
   * Delete configuration
   * DELETE /api/v1/configurations/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/configurations/${id}`),

  /**
   * Get configuration history/versions
   * GET /api/v1/configurations/{id}/versions
   */
  getVersions: (id: string): Promise<ConfigurationVersion[]> =>
    apiClient.get<ConfigurationVersion[]>(`/configurations/${id}/versions`),

  /**
   * Rollback configuration to specific version
   * POST /api/v1/configurations/{id}/rollback
   */
  rollback: (id: string, version: number, reason?: string): Promise<Configuration> =>
    apiClient.post<Configuration>(`/configurations/${id}/rollback`, { version, reason }),

  /**
   * Get diffs between source and target environments
   * GET /api/v1/configurations/diff?source={sourceId}&target={targetId}
   */
  getDiff: (sourceEnvironmentId: string, targetEnvironmentId: string): Promise<ConfigDiff[]> =>
    apiClient.get<ConfigDiff[]>(
      `/configurations/diff?source=${sourceEnvironmentId}&target=${targetEnvironmentId}`
    ),

  /**
   * Bulk create/update configurations
   * POST /api/v1/configurations/bulk
   */
  bulkUpsert: (applicationId: string, environmentId: string, configs: Array<{
    key: string;
    value: string;
    type: string;
    sensitive?: boolean;
    description?: string;
  }>): Promise<Configuration[]> =>
    apiClient.post<Configuration[]>("/configurations/bulk", {
      applicationId,
      environmentId,
      configurations: configs,
    }),
};
