"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/lib/api/services";
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  HealthCheckResult,
  ServiceHealthStats,
  DependencyGraph,
} from "@/lib/types/service";
import { toast } from "sonner";

export function useServices(type?: string, team?: string, environment?: string) {
  const queryClient = useQueryClient();

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ["services", type, team, environment],
    queryFn: () => {
      if (type) return servicesApi.getByType(type);
      if (team) return servicesApi.getByTeam(team);
      if (environment) return servicesApi.getByEnvironment(environment);
      return servicesApi.getAll();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateServiceDto) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service registered successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register service");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceDto }) =>
      servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update service");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete service");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => servicesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deactivated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate service");
    },
  });

  return {
    services,
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deactivate: deactivateMutation.mutate,
    isDeactivating: deactivateMutation.isPending,
  };
}

export function useService(id: string) {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
}

export function useServiceHealthCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesApi.triggerHealthCheck(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      if (data.status === "UP") {
        toast.success("Health check passed");
      } else if (data.status === "DEGRADED") {
        toast.warning(`Service is degraded: ${data.message || "Performance issues detected"}`);
      } else {
        toast.error(`Health check failed: ${data.message || "Service is down"}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Health check failed");
    },
  });
}

export function useServiceHealthResults(serviceId: string) {
  return useQuery({
    queryKey: ["services", serviceId, "health-results"],
    queryFn: () => servicesApi.getHealthResults(serviceId),
    enabled: !!serviceId,
  });
}

export function useServiceHealthStats() {
  return useQuery({
    queryKey: ["services", "health-stats"],
    queryFn: () => servicesApi.getHealthStats(),
  });
}

export function useDependencyGraph() {
  return useQuery({
    queryKey: ["services", "dependency-graph"],
    queryFn: () => servicesApi.getDependencyGraph(),
  });
}
