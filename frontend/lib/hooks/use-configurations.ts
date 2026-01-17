"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configurationsApi } from "@/lib/api/configurations";
import type {
  Configuration,
  CreateConfigurationDto,
  UpdateConfigurationDto,
  ConfigurationVersion,
} from "@/lib/types/configuration";
import { toast } from "sonner";

export function useConfigurations(environmentId: string) {
  const queryClient = useQueryClient();

  const { data: configurations, isLoading, error } = useQuery({
    queryKey: ["configurations", environmentId],
    queryFn: () => configurationsApi.getByEnvironment(environmentId),
    enabled: !!environmentId,
  });

  const { data: configMap } = useQuery({
    queryKey: ["configurations", "map", environmentId],
    queryFn: () => configurationsApi.getMap(environmentId),
    enabled: !!environmentId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateConfigurationDto) => configurationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations", environmentId] });
      queryClient.invalidateQueries({ queryKey: ["configurations", "map", environmentId] });
      toast.success("Configuration created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create configuration");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateConfigurationDto }) =>
      configurationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations", environmentId] });
      queryClient.invalidateQueries({ queryKey: ["configurations", "map", environmentId] });
      toast.success("Configuration updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update configuration");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => configurationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations", environmentId] });
      queryClient.invalidateQueries({ queryKey: ["configurations", "map", environmentId] });
      toast.success("Configuration deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete configuration");
    },
  });

  const bulkUpsertMutation = useMutation({
    mutationFn: (configs: Array<{
      key: string;
      value: string;
      type: string;
      sensitive?: boolean;
      description?: string;
    }>) => configurationsApi.bulkUpsert("", environmentId, configs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations", environmentId] });
      queryClient.invalidateQueries({ queryKey: ["configurations", "map", environmentId] });
      toast.success("Configurations updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update configurations");
    },
  });

  return {
    configurations: configurations || [],
    configMap: configMap || {},
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    bulkUpsert: bulkUpsertMutation.mutate,
    isBulkUpserting: bulkUpsertMutation.isPending,
  };
}

export function useConfiguration(id: string) {
  return useQuery({
    queryKey: ["configurations", id],
    queryFn: () => configurationsApi.getById(id),
    enabled: !!id,
  });
}

export function useConfigurationVersions(configId: string, enabled: boolean = true) {
  const { data: versions, isLoading, error } = useQuery({
    queryKey: ["configurations", configId, "versions"],
    queryFn: () => configurationsApi.getVersions(configId),
    enabled: !!configId && enabled,
  });

  const queryClient = useQueryClient();

  const rollbackMutation = useMutation({
    mutationFn: ({ version, reason }: { version: number; reason?: string }) =>
      configurationsApi.rollback(configId, version, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] });
      toast.success("Configuration rolled back successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to rollback configuration");
    },
  });

  return {
    versions: versions || [],
    isLoading,
    error,
    rollback: rollbackMutation.mutate,
    isRollingBack: rollbackMutation.isPending,
  };
}

export function useConfigurationDiff(
  sourceEnvironmentId: string,
  targetEnvironmentId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["configurations", "diff", sourceEnvironmentId, targetEnvironmentId],
    queryFn: () => configurationsApi.getDiff(sourceEnvironmentId, targetEnvironmentId),
    enabled: !!sourceEnvironmentId && !!targetEnvironmentId && enabled,
  });
}
