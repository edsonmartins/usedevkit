"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditApi } from "@/lib/api/audit";
import type {
  AuditLog,
  AuditLogFilter,
  AuditLogResponse,
  AuditStats,
} from "@/lib/types/audit";
import { toast } from "sonner";

export function useAuditLogs(filters?: AuditLogFilter) {
  const queryClient = useQueryClient();

  // Convert filters to a stable key
  const filterKey = JSON.stringify(filters);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["audit-logs", filterKey],
    queryFn: () => auditApi.getLogs(filters),
  });

  const exportMutation = useMutation({
    mutationFn: ({ format, filters }: { format: "csv" | "json"; filters?: AuditLogFilter }) =>
      auditApi.export(filters, format),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.${exportMutation.variables?.format || "csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Audit logs exported successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export audit logs");
    },
  });

  return {
    logs: data?.logs || [],
    total: data?.total || 0,
    page: data?.page || 0,
    limit: data?.limit || 50,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch,
    export: exportMutation.mutate,
    isExporting: exportMutation.isPending,
  };
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ["audit-logs", id],
    queryFn: () => auditApi.getById(id),
    enabled: !!id,
  });
}

export function useAuditStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["audit-stats", startDate, endDate],
    queryFn: () => auditApi.getStats(startDate, endDate),
  });
}

export function useEntityAuditLogs(entityType: string, entityId: string, limit?: number) {
  return useQuery({
    queryKey: ["audit-logs", "entity", entityType, entityId, limit],
    queryFn: () => auditApi.getByEntity(entityType, entityId, limit),
    enabled: !!entityType && !!entityId,
  });
}

export function useUserAuditLogs(userId: string, limit?: number) {
  return useQuery({
    queryKey: ["audit-logs", "user", userId, limit],
    queryFn: () => auditApi.getByUser(userId, limit),
    enabled: !!userId,
  });
}
