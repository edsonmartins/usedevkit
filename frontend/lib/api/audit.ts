import { apiClient } from "./client";
import type {
  AuditLog,
  AuditLogFilter,
  AuditLogResponse,
  AuditStats,
} from "@/lib/types/audit";

export const auditApi = {
  /**
   * Get audit logs with filters
   * GET /api/v1/audit
   */
  getLogs: (filters?: AuditLogFilter): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.entityType) params.append("entityType", filters.entityType);
    if (filters?.entityId) params.append("entityId", filters.entityId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    params.append("page", String(filters?.page || 0));
    params.append("limit", String(filters?.limit || 50));

    return apiClient.get<AuditLogResponse>(`/audit?${params.toString()}`);
  },

  /**
   * Get audit log by ID
   * GET /api/v1/audit/{id}
   */
  getById: (id: string): Promise<AuditLog> =>
    apiClient.get<AuditLog>(`/audit/${id}`),

  /**
   * Get audit statistics
   * GET /api/v1/audit/stats
   */
  getStats: (startDate?: string, endDate?: string): Promise<AuditStats> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const queryString = params.toString();
    return apiClient.get<AuditStats>(`/audit/stats${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Export audit logs
   * GET /api/v1/audit/export
   */
  export: (filters?: AuditLogFilter, format: "csv" | "json" = "csv"): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.entityType) params.append("entityType", filters.entityType);
    if (filters?.entityId) params.append("entityId", filters.entityId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    params.append("format", format);

    return apiClient.get<Blob>(`/audit/export?${params.toString()}`, {
      responseType: "blob",
    });
  },

  /**
   * Get logs for a specific entity
   * GET /api/v1/audit/entity/{entityType}/{entityId}
   */
  getByEntity: (entityType: string, entityId: string, limit: number = 50): Promise<AuditLog[]> =>
    apiClient.get<AuditLog[]>(`/audit/entity/${entityType}/${entityId}?limit=${limit}`),

  /**
   * Get logs for a specific user
   * GET /api/v1/audit/user/{userId}
   */
  getByUser: (userId: string, limit: number = 50): Promise<AuditLog[]> =>
    apiClient.get<AuditLog[]>(`/audit/user/${userId}?limit=${limit}`),
};
