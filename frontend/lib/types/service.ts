export type ServiceType = "API" | "WORKER" | "DATABASE" | "CACHE" | "QUEUE" | "OTHER";
export type ServiceStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "UNKNOWN";
export type HealthCheckType = "HTTP" | "TCP" | "COMMAND";

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  description?: string;
  status: ServiceStatus;
  url?: string;
  healthCheckUrl?: string;
  healthCheckType?: HealthCheckType;
  healthCheckInterval?: number; // seconds
  lastHealthCheck?: string;
  responseTime?: number; // milliseconds
  version?: string;
  environment?: string;
  team?: string;
  tags?: string[];
  dependencies: string[]; // service IDs this service depends on
  dependents: string[]; // service IDs that depend on this service
  metadata?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface CreateServiceDto {
  name: string;
  type: ServiceType;
  description?: string;
  url?: string;
  healthCheckUrl?: string;
  healthCheckType?: HealthCheckType;
  healthCheckInterval?: number;
  version?: string;
  environment?: string;
  team?: string;
  tags?: string[];
  dependencies?: string[];
  metadata?: Record<string, string>;
}

export interface UpdateServiceDto {
  name?: string;
  type?: ServiceType;
  description?: string;
  url?: string;
  healthCheckUrl?: string;
  healthCheckType?: HealthCheckType;
  healthCheckInterval?: number;
  version?: string;
  environment?: string;
  team?: string;
  tags?: string[];
  dependencies?: string[];
  metadata?: Record<string, string>;
}

export interface HealthCheckResult {
  serviceId: string;
  status: "UP" | "DOWN" | "DEGRADED";
  timestamp: string;
  responseTime?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface ServiceHealthStats {
  total: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  unknown: number;
  averageResponseTime: number;
}

export interface ServiceDependencyNode {
  id: string;
  name: string;
  type: ServiceType;
  status: ServiceStatus;
}

export interface ServiceDependencyEdge {
  from: string;
  to: string;
  type: "depends_on" | "provides_to";
}

export interface DependencyGraph {
  nodes: ServiceDependencyNode[];
  edges: ServiceDependencyEdge[];
}
