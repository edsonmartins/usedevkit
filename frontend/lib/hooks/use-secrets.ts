"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { secretsApi } from "@/lib/api/secrets";
import type {
  SecretMetadata,
  CreateSecretDto,
  UpdateSecretDto,
  SecretRotationHistory,
} from "@/lib/types/secret";
import { toast } from "sonner";

export function useSecrets(applicationId: string) {
  const queryClient = useQueryClient();

  const { data: secrets = [], isLoading, error } = useQuery({
    queryKey: ["secrets", applicationId],
    queryFn: () => secretsApi.getByApplication(applicationId),
    enabled: !!applicationId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSecretDto) => secretsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["secrets", "stats"] });
      toast.success("Secret created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create secret");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSecretDto }) =>
      secretsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets", applicationId] });
      toast.success("Secret updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update secret");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => secretsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["secrets", "stats"] });
      toast.success("Secret deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete secret");
    },
  });

  const rotateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      secretsApi.rotate(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["secrets", "stats"] });
      toast.success("Secret rotated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to rotate secret");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => secretsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["secrets", "stats"] });
      toast.success("Secret deactivated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate secret");
    },
  });

  return {
    secrets,
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    rotate: rotateMutation.mutate,
    isRotating: rotateMutation.isPending,
    deactivate: deactivateMutation.mutate,
    isDeactivating: deactivateMutation.isPending,
  };
}

export function useSecret(id: string, enabled: boolean = true) {
  const [showValue, setShowValue] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);

  const { data: metadata, isLoading, error } = useQuery({
    queryKey: ["secrets", id],
    queryFn: () => secretsApi.getById(id),
    enabled: !!id && enabled,
  });

  const { data: decrypted, isLoading: isDecrypting } = useQuery({
    queryKey: ["secrets", id, "decrypted"],
    queryFn: () => secretsApi.getDecrypted(id),
    enabled: !!id && showValue,
  });

  useEffect(() => {
    if (decrypted) {
      setDecryptedValue(decrypted.value);
    }
  }, [decrypted]);

  const reveal = () => setShowValue(true);
  const conceal = () => {
    setShowValue(false);
    setDecryptedValue(null);
  };

  return {
    metadata,
    decryptedValue,
    isLoading,
    isDecrypting,
    error,
    showValue,
    reveal,
    conceal,
  };
}

export function useSecretHistory(id: string, enabled: boolean = true) {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ["secrets", id, "history"],
    queryFn: () => secretsApi.getHistory(id),
    enabled: !!id && enabled,
  });

  return {
    history: history || [],
    isLoading,
    error,
  };
}

export function useSecretStats() {
  return useQuery({
    queryKey: ["secrets", "stats"],
    queryFn: () => secretsApi.getStats(),
  });
}
