"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "@/lib/api/roles";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  UserRole,
  GrantRoleDto,
  UserPermissions,
  Permission,
} from "@/lib/types/role";
import { toast } from "sonner";

export function useRoles(tenantId?: string) {
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ["roles", tenantId],
    queryFn: () => rolesApi.getAll(tenantId),
  });

  const { data: systemRoles = [] } = useQuery({
    queryKey: ["roles", "system"],
    queryFn: () => rolesApi.getSystemRoles(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleDto & { tenantId?: string }) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create role");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      rolesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete role");
    },
  });

  const cloneMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => rolesApi.clone(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role cloned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clone role");
    },
  });

  return {
    roles: [...roles, ...systemRoles],
    customRoles: roles,
    systemRoles,
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    delete: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    clone: cloneMutation.mutate,
    isCloning: cloneMutation.isPending,
  };
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });
}

export function useUserRoles(tenantId: string, userId: string) {
  const queryClient = useQueryClient();

  const { data: userRoles = [], isLoading, refetch } = useQuery({
    queryKey: ["user-roles", tenantId, userId],
    queryFn: () => rolesApi.getUserRoles(tenantId, userId),
    enabled: !!tenantId && !!userId,
  });

  const grantMutation = useMutation({
    mutationFn: (data: GrantRoleDto) => rolesApi.grantRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role granted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to grant role");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (roleId: string) => rolesApi.revokeRole(tenantId, userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Role revoked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke role");
    },
  });

  return {
    userRoles,
    isLoading,
    refetch,
    grant: grantMutation.mutate,
    isGranting: grantMutation.isPending,
    revoke: revokeMutation.mutate,
    isRevoking: revokeMutation.isPending,
  };
}

export function useUserPermissions(tenantId: string, userId: string) {
  return useQuery({
    queryKey: ["user-permissions", tenantId, userId],
    queryFn: () => rolesApi.getUserPermissions(tenantId, userId),
    enabled: !!tenantId && !!userId,
  });
}

export function usePermissionCheck(userId: string, tenantId: string, permission: Permission) {
  return useQuery({
    queryKey: ["permission-check", userId, tenantId, permission],
    queryFn: () => rolesApi.checkPermission(userId, tenantId, permission),
    enabled: !!userId && !!tenantId && !!permission,
  });
}
