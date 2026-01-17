"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { featureFlagsApi } from "@/lib/api/feature-flags";
import type {
  FeatureFlag,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
} from "@/lib/types/feature-flag";
import { toast } from "sonner";

export function useFeatureFlags(applicationId: string) {
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading, error } = useQuery({
    queryKey: ["feature-flags", applicationId],
    queryFn: () => featureFlagsApi.getByApplication(applicationId),
    enabled: !!applicationId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateFeatureFlagDto) => featureFlagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags", applicationId] });
      toast.success("Feature flag created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create feature flag");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeatureFlagDto }) =>
      featureFlagsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags", applicationId] });
      toast.success("Feature flag updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update feature flag");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => featureFlagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags", applicationId] });
      toast.success("Feature flag deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete feature flag");
    },
  });

  const enableMutation = useMutation({
    mutationFn: (id: string) => featureFlagsApi.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags", applicationId] });
      toast.success("Feature flag enabled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enable feature flag");
    },
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => featureFlagsApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags", applicationId] });
      toast.success("Feature flag disabled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disable feature flag");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => featureFlagsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags", applicationId] });
      toast.success("Feature flag archived");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to archive feature flag");
    },
  });

  return {
    flags,
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    enable: enableMutation.mutate,
    isEnabling: enableMutation.isPending,
    disable: disableMutation.mutate,
    isDisabling: disableMutation.isPending,
    archive: archiveMutation.mutate,
    isArchiving: archiveMutation.isPending,
  };
}

export function useFeatureFlag(id: string) {
  return useQuery({
    queryKey: ["feature-flags", id],
    queryFn: () => featureFlagsApi.getById(id),
    enabled: !!id,
  });
}
