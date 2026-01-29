import { apiClient } from "./client";
import type {
  Configuration,
  CreateConfigurationDto,
  UpdateConfigurationDto,
  ConfigurationVersion,
  ConfigDiff,
} from "@/lib/types/configuration";

type ConfigurationResponse = {
  id: string;
  key: string;
  value?: string | null;
  encryptedValue?: string | null;
  type: string;
  description?: string | null;
  isSecret: boolean;
  environmentId: string;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
};

type ConfigurationVersionResponse = {
  id: string;
  configurationId: string;
  versionNumber: number;
  value: string;
  type: string;
  changeReason?: string | null;
  createdBy?: string | null;
  createdAt: string;
};

const mapConfiguration = (config: ConfigurationResponse): Configuration => ({
  id: config.id,
  key: config.key,
  value: config.value || config.encryptedValue || "",
  type: config.type as Configuration["type"],
  sensitive: config.isSecret,
  description: config.description || undefined,
  applicationId: "",
  environmentId: config.environmentId,
  createdAt: config.createdAt,
  updatedAt: config.updatedAt,
  version: config.versionNumber,
});

const mapVersion = (version: ConfigurationVersionResponse): ConfigurationVersion => ({
  id: version.id,
  configurationId: version.configurationId,
  version: version.versionNumber,
  value: version.value,
  type: version.type as ConfigurationVersion["type"],
  description: undefined,
  createdAt: version.createdAt,
  createdBy: version.createdBy || undefined,
  changeReason: version.changeReason || undefined,
});

export const configurationsApi = {
  /**
   * Get configurations by environment
   * GET /api/v1/configurations/environment/{id}
   */
  getByEnvironment: async (environmentId: string): Promise<Configuration[]> => {
    const configs = await apiClient.get<ConfigurationResponse[]>(`/configurations/environment/${environmentId}`);
    return configs.map(mapConfiguration);
  },

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
  getById: async (id: string): Promise<Configuration> => {
    const config = await apiClient.get<ConfigurationResponse>(`/configurations/${id}`);
    return mapConfiguration(config);
  },

  /**
   * Get configuration by key for environment
   * GET /api/v1/configurations/environment/{environmentId}/key/{key}
   */
  getByKey: async (environmentId: string, key: string): Promise<Configuration> => {
    const config = await apiClient.get<ConfigurationResponse>(`/configurations/environment/${environmentId}/key/${key}`);
    return mapConfiguration(config);
  },

  /**
   * Create new configuration
   * POST /api/v1/configurations
   */
  create: async (data: CreateConfigurationDto): Promise<Configuration> => {
    const config = await apiClient.post<ConfigurationResponse>("/configurations", {
      key: data.key,
      value: data.value,
      type: data.type,
      description: data.description,
      isSecret: data.sensitive,
      environmentId: data.environmentId,
    });
    return mapConfiguration(config);
  },

  /**
   * Update configuration
   * PUT /api/v1/configurations/{id}
   */
  update: async (id: string, data: UpdateConfigurationDto): Promise<Configuration> => {
    const config = await apiClient.put<ConfigurationResponse>(`/configurations/${id}`, {
      value: data.value,
      type: data.type,
      description: data.description,
      isSecret: data.sensitive,
    });
    return mapConfiguration(config);
  },

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
  getVersions: async (id: string): Promise<ConfigurationVersion[]> => {
    const versions = await apiClient.get<ConfigurationVersionResponse[]>(`/configurations/${id}/versions`);
    return versions.map(mapVersion);
  },

  /**
   * Rollback configuration to specific version
   * POST /api/v1/configurations/{id}/rollback
   */
  rollback: async (id: string, version: number, reason?: string): Promise<Configuration> => {
    const config = await apiClient.post<ConfigurationResponse>(`/configurations/${id}/rollback`, { version, reason });
    return mapConfiguration(config);
  },

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
    apiClient.post<ConfigurationResponse[]>("/configurations/bulk", {
      applicationId,
      environmentId,
      configurations: configs,
    }).then((configs) => configs.map(mapConfiguration)),
};
