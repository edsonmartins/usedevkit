"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api/applications";
import type { Application, CreateApplicationDto, UpdateApplicationDto } from "@/lib/types/application";
import { toast } from "sonner";

const QUERY_KEY = ["applications"];

export function useApplications() {
  const queryClient = useQueryClient();

  const { data: applications, isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: applicationsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateApplicationDto) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Application created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create application");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationDto }) =>
      applicationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Application updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update application");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Application deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete application");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Application activated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to activate application");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Application deactivated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate application");
    },
  });

  return {
    applications: applications || [],
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    activate: activateMutation.mutate,
    isActivating: activateMutation.isPending,
    deactivate: deactivateMutation.mutate,
    isDeactivating: deactivateMutation.isPending,
  };
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ["applications", id],
    queryFn: () => applicationsApi.getById(id),
    enabled: !!id,
  });
}

export function useApplicationStats(id: string) {
  return useQuery({
    queryKey: ["applications", id, "stats"],
    queryFn: () => applicationsApi.getStats(id),
    enabled: !!id,
  });
}

export function useApplicationEnvironments(applicationId: string) {
  const queryClient = useQueryClient();

  const { data: environments, isLoading } = useQuery({
    queryKey: ["environments", applicationId],
    queryFn: () => applicationsApi.getEnvironments(applicationId),
    enabled: !!applicationId,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; applicationId: string }) =>
      applicationsApi.createEnvironment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments", applicationId] });
      toast.success("Environment created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create environment");
    },
  });

  return {
    environments: environments || [],
    isLoading,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
