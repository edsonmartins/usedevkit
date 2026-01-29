import { apiClient } from "./client";
import type {
  Application,
  CreateApplicationDto,
  UpdateApplicationDto,
  Environment,
  EnvironmentCreateDto,
  ApiKey,
  CreateApiKeyDto,
  ApplicationStats,
} from "@/lib/types/application";

const DEFAULT_OWNER_EMAIL = "system@devkit.local";

type ApplicationResponse = {
  id: string;
  name: string;
  description?: string | null;
  ownerEmail?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type EnvironmentResponse = {
  id: string;
  name: string;
  description?: string | null;
  applicationId: string;
  createdAt: string;
  createdBy?: string | null;
};

type ApplicationStatsResponse = {
  totalConfigurations: number;
  totalSecrets: number;
  totalFeatureFlags: number;
  environments: Array<{ name: string; configurations: number; secrets: number }>;
};

const mapApplication = (app: ApplicationResponse): Application => ({
  id: app.id,
  name: app.name,
  description: app.description || undefined,
  active: app.isActive,
  environments: [],
  createdAt: app.createdAt,
  updatedAt: app.updatedAt,
  createdBy: app.ownerEmail || undefined,
});

const mapEnvironment = (env: EnvironmentResponse): Environment => ({
  id: env.id,
  name: env.name,
  description: env.description || undefined,
  applicationId: env.applicationId,
  createdAt: env.createdAt,
  createdBy: env.createdBy || undefined,
});

export const applicationsApi = {
  /**
   * Get all applications
   * GET /api/v1/applications
   */
  getAll: async (): Promise<Application[]> => {
    const apps = await apiClient.get<ApplicationResponse[]>("/applications");
    return apps.map(mapApplication);
  },

  /**
   * Get active applications
   * GET /api/v1/applications/active
   */
  getActive: async (): Promise<Application[]> => {
    const apps = await apiClient.get<ApplicationResponse[]>("/applications/active");
    return apps.map(mapApplication);
  },

  /**
   * Get application by ID
   * GET /api/v1/applications/{id}
   */
  getById: async (id: string): Promise<Application> => {
    const app = await apiClient.get<ApplicationResponse>(`/applications/${id}`);
    return mapApplication(app);
  },

  /**
   * Get application by name
   * GET /api/v1/applications/name/{name}
   */
  getByName: async (name: string): Promise<Application> => {
    const app = await apiClient.get<ApplicationResponse>(`/applications/name/${name}`);
    return mapApplication(app);
  },

  /**
   * Create new application
   * POST /api/v1/applications
   */
  create: async (data: CreateApplicationDto): Promise<Application> => {
    const app = await apiClient.post<ApplicationResponse>("/applications", {
      name: data.name,
      description: data.description,
      ownerEmail: DEFAULT_OWNER_EMAIL,
    });

    if (data.environments?.length) {
      await Promise.all(
        data.environments.map((env) =>
          apiClient.post<EnvironmentResponse>("/environments", {
            name: env.name,
            description: env.description,
            applicationId: app.id,
          })
        )
      );
    }

    return mapApplication(app);
  },

  /**
   * Update application
   * PUT /api/v1/applications/{id}
   */
  update: async (id: string, data: UpdateApplicationDto): Promise<Application> => {
    const app = await apiClient.put<ApplicationResponse>(`/applications/${id}`, {
      name: data.name,
      description: data.description,
    });
    return mapApplication(app);
  },

  /**
   * Activate application
   * POST /api/v1/applications/{id}/activate
   */
  activate: (id: string): Promise<void> =>
    apiClient.post<void>(`/applications/${id}/activate`),

  /**
   * Deactivate application
   * POST /api/v1/applications/{id}/deactivate
   */
  deactivate: (id: string): Promise<void> =>
    apiClient.post<void>(`/applications/${id}/deactivate`),

  /**
   * Delete application
   * DELETE /api/v1/applications/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/applications/${id}`),

  // ========== Environments ==========

  /**
   * Get environments for application
   * GET /api/v1/environments/application/{applicationId}
   */
  getEnvironments: async (applicationId: string): Promise<Environment[]> => {
    const envs = await apiClient.get<EnvironmentResponse[]>(`/environments/application/${applicationId}`);
    return envs.map(mapEnvironment);
  },

  /**
   * Get environment by name for application
   * GET /api/v1/environments/application/{applicationId}/name/{name}
   */
  getEnvironmentByName: async (applicationId: string, name: string): Promise<Environment> => {
    const env = await apiClient.get<EnvironmentResponse>(`/environments/application/${applicationId}/name/${name}`);
    return mapEnvironment(env);
  },

  /**
   * Create environment
   * POST /api/v1/environments
   */
  createEnvironment: async (data: EnvironmentCreateDto & { applicationId: string }): Promise<Environment> => {
    const env = await apiClient.post<EnvironmentResponse>("/environments", data);
    return mapEnvironment(env);
  },

  // ========== API Keys ==========

  /**
   * Create API Key for application
   * POST /api/v1/applications/{id}/api-keys
   */
  createApiKey: async (applicationId: string, data: CreateApiKeyDto): Promise<{ apiKey: string; prefix: string; id: string }> => {
    const response = await apiClient.post<{ apiKey: string }>(`/auth/api-keys`, {
      applicationId,
      name: data.name,
    });

    const prefixMatch = response.apiKey.match(/^dk_[^_]+_/);
    return {
      apiKey: response.apiKey,
      prefix: prefixMatch ? prefixMatch[0] : "",
      id: "",
    };
  },

  /**
   * Get application stats
   * GET /api/v1/applications/{id}/stats
   */
  getStats: async (id: string): Promise<ApplicationStats> => {
    const stats = await apiClient.get<ApplicationStatsResponse>(`/applications/${id}/stats`);
    return stats;
  },
};
