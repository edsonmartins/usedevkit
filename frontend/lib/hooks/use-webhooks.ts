"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { webhooksApi } from "@/lib/api/webhooks";
import type {
  Webhook,
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookDelivery,
} from "@/lib/types/webhook";
import { toast } from "sonner";

export function useWebhooks(applicationId?: string) {
  const queryClient = useQueryClient();

  const { data: webhooks = [], isLoading, error } = useQuery({
    queryKey: ["webhooks", applicationId],
    queryFn: () => applicationId
      ? webhooksApi.getByApplication(applicationId)
      : webhooksApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateWebhookDto) => webhooksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create webhook");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookDto }) =>
      webhooksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update webhook");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete webhook");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook activated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to activate webhook");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => webhooksApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Webhook deactivated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate webhook");
    },
  });

  return {
    webhooks,
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

export function useWebhook(id: string) {
  return useQuery({
    queryKey: ["webhooks", id],
    queryFn: () => webhooksApi.getById(id),
    enabled: !!id,
  });
}

export function useWebhookDeliveries(webhookId: string) {
  const { data: deliveries = [], isLoading, refetch } = useQuery({
    queryKey: ["webhooks", webhookId, "deliveries"],
    queryFn: () => webhooksApi.getDeliveries(webhookId),
    enabled: !!webhookId,
  });

  const retryMutation = useMutation({
    mutationFn: (deliveryId: string) => webhooksApi.retryDelivery(deliveryId),
    onSuccess: () => {
      refetch();
      toast.success("Delivery retry queued");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to retry delivery");
    },
  });

  return {
    deliveries,
    isLoading,
    refetch,
    retry: retryMutation.mutate,
    isRetrying: retryMutation.isPending,
  };
}

export function useWebhookTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhooksApi.test(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      if (data.success) {
        toast.success("Webhook test successful");
      } else {
        toast.error(data.message || "Webhook test failed");
      }
    },
  });
}

export function useWebhookStats() {
  return useQuery({
    queryKey: ["webhooks", "stats"],
    queryFn: () => webhooksApi.getStats(),
  });
}
