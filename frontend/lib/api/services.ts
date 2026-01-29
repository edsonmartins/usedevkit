import { apiClient } from "./client";
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  HealthCheckResult,
  ServiceHealthStats,
  DependencyGraph,
} from "@/lib/types/service";

type ServiceResponse = {
  id: string;
  name: string;
  version?: string | null;
  description?: string | null;
  repositoryUrl?: string | null;
  documentationUrl?: string | null;
  type: string;
  status: string;
  owner?: string | null;
  team?: string | null;
  language?: string | null;
  environment?: string | null;
  port?: number | null;
  healthCheckUrl?: string | null;
  lastHealthCheck?: string | null;
  isActive: boolean;
};

const mapServiceStatus = (status: string): Service["status"] => {
  switch (status) {
    case "HEALTHY":
      return "HEALTHY";
    case "DEGRADED":
      return "DEGRADED";
    case "DOWN":
      return "UNHEALTHY";
    default:
      return "UNKNOWN";
  }
};

const mapService = (service: ServiceResponse): Service => ({
  id: service.id,
  name: service.name,
  type: service.type as Service["type"],
  description: service.description || undefined,
  status: mapServiceStatus(service.status),
  url: service.repositoryUrl || undefined,
  healthCheckUrl: service.healthCheckUrl || undefined,
  version: service.version || undefined,
  environment: service.environment || undefined,
  team: service.team || undefined,
  dependencies: [],
  dependents: [],
  createdAt: service.lastHealthCheck || new Date().toISOString(),
  updatedAt: service.lastHealthCheck || new Date().toISOString(),
  active: service.isActive,
});

export const servicesApi = {
  /**
   * Get all services
   * GET /api/v1/services
   */
  getAll: async (): Promise<Service[]> => {
    const services = await apiClient.get<ServiceResponse[]>("/services");
    return services.map(mapService);
  },

  /**
   * Get active services
   * GET /api/v1/services/active
   */
  getActive: async (): Promise<Service[]> => {
    const services = await apiClient.get<ServiceResponse[]>("/services");
    return services.map(mapService);
  },

  /**
   * Get service by ID
   * GET /api/v1/services/{id}
   */
  getById: async (id: string): Promise<Service> => {
    const service = await apiClient.get<ServiceResponse>(`/services/${id}`);
    return mapService(service);
  },

  /**
   * Create new service
   * POST /api/v1/services
   */
  create: async (data: CreateServiceDto): Promise<Service> => {
    const service = await apiClient.post<ServiceResponse>("/services", {
      name: data.name,
      version: data.version || "1.0.0",
      description: data.description,
      repositoryUrl: data.url,
      documentationUrl: undefined,
      type: data.type,
      owner: undefined,
      team: data.team,
      language: undefined,
      environment: data.environment,
      port: 80,
    });
    return mapService(service);
  },

  /**
   * Update service
   * PUT /api/v1/services/{id}
   */
  update: async (id: string, data: UpdateServiceDto): Promise<Service> => {
    const service = await apiClient.put<ServiceResponse>(`/services/${id}`, {
      name: data.name,
      description: data.description,
      team: data.team,
      environment: data.environment,
      healthCheckUrl: data.healthCheckUrl,
    });
    return mapService(service);
  },

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
  triggerHealthCheck: async (id: string): Promise<HealthCheckResult> => {
    const status = await apiClient.post<string>(`/services/${id}/health/check`);
    return {
      serviceId: id,
      status: status === "HEALTHY" ? "UP" : status === "DEGRADED" ? "DEGRADED" : "DOWN",
      timestamp: new Date().toISOString(),
    };
  },

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
  getHealthStats: async (): Promise<ServiceHealthStats> => {
    const stats = await apiClient.get<{ total: number; healthy: number; degraded: number; down: number; unknown: number }>("/services/health/stats");
    return {
      total: stats.total,
      healthy: stats.healthy,
      degraded: stats.degraded,
      unhealthy: stats.down,
      unknown: stats.unknown,
      averageResponseTime: 0,
    };
  },

  /**
   * Get dependency graph
   * GET /api/v1/services/dependency-graph
   */
  getDependencyGraph: async (): Promise<DependencyGraph> => {
    const graph = await apiClient.get<Record<string, Array<{ serviceName: string; status: string; type: string }>>>("/services/dependency-graph");
    const nodes = Object.keys(graph).map((id) => ({
      id,
      name: id,
      type: "OTHER" as Service["type"],
      status: "UNKNOWN" as Service["status"],
    }));
    const edges = Object.entries(graph).flatMap(([from, deps]) =>
      deps.map((dep) => ({ from, to: dep.serviceName, type: "depends_on" as const }))
    );
    return { nodes, edges };
  },

  /**
   * Get services by type
   * GET /api/v1/services/type/{type}
   */
  getByType: (type: string): Promise<Service[]> =>
    apiClient.get<Service[]>(`/services?type=${type}`),

  /**
   * Get services by team
   * GET /api/v1/services/team/{team}
   */
  getByTeam: (team: string): Promise<Service[]> =>
    apiClient.get<Service[]>(`/services?team=${team}`),

  /**
   * Get services by environment
   * GET /api/v1/services/environment/{env}
   */
  getByEnvironment: (env: string): Promise<Service[]> =>
    apiClient.get<Service[]>(`/services?environment=${env}`),
};
