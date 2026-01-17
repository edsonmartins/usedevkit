"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantsApi } from "@/lib/api/tenants";
import type {
  Tenant,
  CreateTenantDto,
  UpdateTenantDto,
  UpgradeTenantDto,
  TenantStats,
  TenantUser,
  InviteUserDto,
} from "@/lib/types/tenant";
import { toast } from "sonner";

export function useTenants() {
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => tenantsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTenantDto) => tenantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });
      toast.success("Tenant created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create tenant");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenantDto }) =>
      tenantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update tenant");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });
      toast.success("Tenant deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tenant");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => tenantsApi.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant suspended");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to suspend tenant");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => tenantsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant activated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to activate tenant");
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpgradeTenantDto }) =>
      tenantsApi.upgrade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "stats"] });
      toast.success("Tenant upgraded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upgrade tenant");
    },
  });

  return {
    tenants,
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    suspend: suspendMutation.mutate,
    isSuspending: suspendMutation.isPending,
    activate: activateMutation.mutate,
    isActivating: activateMutation.isPending,
    upgrade: upgradeMutation.mutate,
    isUpgrading: upgradeMutation.isPending,
  };
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ["tenants", id],
    queryFn: () => tenantsApi.getById(id),
    enabled: !!id,
  });
}

export function useTenantStats() {
  return useQuery({
    queryKey: ["tenants", "stats"],
    queryFn: () => tenantsApi.getStats(),
  });
}

export function useTenantUsers(tenantId: string) {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["tenants", tenantId, "users"],
    queryFn: () => tenantsApi.getUsers(tenantId),
    enabled: !!tenantId,
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteUserDto) => tenantsApi.inviteUser(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants", tenantId, "users"] });
      toast.success("User invited successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to invite user");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => tenantsApi.removeUser(tenantId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants", tenantId, "users"] });
      toast.success("User removed from tenant");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove user");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      tenantsApi.updateUserRole(tenantId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants", tenantId, "users"] });
      toast.success("User role updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  return {
    users,
    isLoading,
    refetch,
    invite: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
    remove: removeMutation.mutate,
    isRemoving: removeMutation.isPending,
    updateRole: updateRoleMutation.mutate,
    isUpdatingRole: updateRoleMutation.isPending,
  };
}
