"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionsApi } from "@/lib/api/promotions";
import type {
  Promotion,
  CreatePromotionDto,
  PromotionDiff,
} from "@/lib/types/promotion";
import { toast } from "sonner";

export function usePromotions(applicationId?: string) {
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading, error } = useQuery({
    queryKey: ["promotions", applicationId],
    queryFn: () => applicationId
      ? promotionsApi.getByApplication(applicationId)
      : promotionsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePromotionDto) => promotionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create promotion");
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      promotionsApi.approve(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion approved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve promotion");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      promotionsApi.reject(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject promotion");
    },
  });

  const executeMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion execution started");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to execute promotion");
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.rollback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion rollback initiated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to rollback promotion");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion cancelled");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel promotion");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete promotion");
    },
  });

  return {
    promotions,
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    approve: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    reject: rejectMutation.mutate,
    isRejecting: rejectMutation.isPending,
    execute: executeMutation.mutate,
    isExecuting: executeMutation.isPending,
    rollback: rollbackMutation.mutate,
    isRollingBack: rollbackMutation.isPending,
    cancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePromotion(id: string) {
  return useQuery({
    queryKey: ["promotions", id],
    queryFn: () => promotionsApi.getById(id),
    enabled: !!id,
  });
}

export function usePromotionDiff(
  sourceEnvironmentId: string,
  targetEnvironmentId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["promotions", "diff", sourceEnvironmentId, targetEnvironmentId],
    queryFn: () => promotionsApi.getDiff(sourceEnvironmentId, targetEnvironmentId),
    enabled: !!sourceEnvironmentId && !!targetEnvironmentId && enabled,
  });
}

export function usePromotionStats() {
  return useQuery({
    queryKey: ["promotions", "stats"],
    queryFn: () => promotionsApi.getStats(),
  });
}
