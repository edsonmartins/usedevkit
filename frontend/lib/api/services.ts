import { apiClient } from "./client";
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  HealthCheckResult,
  ServiceHealthStats,
  DependencyGraph,
} from "@/lib/types/service";

export const servicesApi = {
  /**
   * Get all services
   * GET /api/v1/services
   */
  getAll: (): Promise<Service[]> =>
    apiClient.get<Service[]>("/services"),

  /**
   * Get active services
   * GET /api/v1/services/active
   */
  getActive: (): Promise<Service[]> =>
    apiClient.get<Service[]>("/services/active"),

  /**
   * Get service by ID
   * GET /api/v1/services/{id}
   */
  getById: (id: string): Promise<Service> =>
    apiClient.get<Service>(`/services/${id}`),

  /**
   * Create new service
   * POST /api/v1/services
   */
  create: (data: CreateServiceDto): Promise<Service> =>
    apiClient.post<Service>("/services", data),

  /**
   * Update service
   * PUT /api/v1/services/{id}
   */
  update: (id: string, data: UpdateServiceDto): Promise<Service> =>
    apiClient.put<Service>(`/services/${id}`, data),

  /**
   * Deactivate service
   * POST /api/v1/services/{id}/deactivate
   */
  deactivate: (id: string): Promise<void> =>
    apiClient.post<void>(`/services/${id}/deactivate`),

  /**
   * Delete service
   * DELETE /api/v1/services/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/services/${id}`),

  /**
   * Trigger health check for a service
   * POST /api/v1/services/{id}/health/check
   */
  triggerHealthCheck: (id: string): Promise<HealthCheckResult> =>
    apiClient.post<HealthCheckResult>(`/services/${id}/health/check`),

  /**
   * Get health check results for a service
   * GET /api/v1/services/{id}/health/results
   */
  getHealthResults: (id: string, limit: number = 50): Promise<HealthCheckResult[]> =>
    apiClient.get<HealthCheckResult[]>(`/services/${id}/health/results?limit=${limit}`),

  /**
   * Get health stats for all services
   * GET /api/v1/services/health/stats
   */
  getHealthStats: (): Promise<ServiceHealthStats> =>
    apiClient.get<ServiceHealthStats>("/services/health/stats"),

  /**
   * Get dependency graph
   * GET /api/v1/services/dependency-graph
   */
  getDependencyGraph: (): Promise<DependencyGraph> =>
    apiClient.get<DependencyGraph>("/services/dependency-graph"),

  /**
   * Get services by type
   * GET /api/v1/services/type/{type}
   */
  getByType: (type: string): Promise<Service[]> =>
    apiClient.get<Service[]>(`/services/type/${type}`),

  /**
   * Get services by team
   * GET /api/v1/services/team/{team}
   */
  getByTeam: (team: string): Promise<Service[]> =>
    apiClient.get<Service[]>(`/services/team/${team}`),

  /**
   * Get services by environment
   * GET /api/v1/services/environment/{env}
   */
  getByEnvironment: (env: string): Promise<Service[]> =>
    apiClient.get<Service[]>(`/services/environment/${env}`),
};
