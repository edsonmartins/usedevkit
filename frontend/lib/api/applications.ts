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

export const applicationsApi = {
  /**
   * Get all applications
   * GET /api/v1/applications
   */
  getAll: (): Promise<Application[]> =>
    apiClient.get<Application[]>("/applications"),

  /**
   * Get active applications
   * GET /api/v1/applications/active
   */
  getActive: (): Promise<Application[]> =>
    apiClient.get<Application[]>("/applications/active"),

  /**
   * Get application by ID
   * GET /api/v1/applications/{id}
   */
  getById: (id: string): Promise<Application> =>
    apiClient.get<Application>(`/applications/${id}`),

  /**
   * Get application by name
   * GET /api/v1/applications/name/{name}
   */
  getByName: (name: string): Promise<Application> =>
    apiClient.get<Application>(`/applications/name/${name}`),

  /**
   * Create new application
   * POST /api/v1/applications
   */
  create: (data: CreateApplicationDto): Promise<Application> =>
    apiClient.post<Application>("/applications", data),

  /**
   * Update application
   * PUT /api/v1/applications/{id}
   */
  update: (id: string, data: UpdateApplicationDto): Promise<Application> =>
    apiClient.put<Application>(`/applications/${id}`, data),

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
  getEnvironments: (applicationId: string): Promise<Environment[]> =>
    apiClient.get<Environment[]>(`/environments/application/${applicationId}`),

  /**
   * Get environment by name for application
   * GET /api/v1/environments/application/{applicationId}/name/{name}
   */
  getEnvironmentByName: (applicationId: string, name: string): Promise<Environment> =>
    apiClient.get<Environment>(`/environments/application/${applicationId}/name/${name}`),

  /**
   * Create environment
   * POST /api/v1/environments
   */
  createEnvironment: (data: EnvironmentCreateDto & { applicationId: string }): Promise<Environment> =>
    apiClient.post<Environment>("/environments", data),

  // ========== API Keys ==========

  /**
   * Create API Key for application
   * POST /api/v1/applications/{id}/api-keys
   */
  createApiKey: (applicationId: string, data: CreateApiKeyDto): Promise<{ apiKey: string; prefix: string; id: string }> =>
    apiClient.post<{ apiKey: string; prefix: string; id: string }>(`/applications/${applicationId}/api-keys`, data),

  /**
   * Get application stats
   * GET /api/v1/applications/{id}/stats
   */
  getStats: (id: string): Promise<ApplicationStats> =>
    apiClient.get<ApplicationStats>(`/applications/${id}/stats`),
};
