import { apiClient } from "./client";
import type {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  UserRole,
  GrantRoleDto,
  UserPermissions,
  Permission,
} from "@/lib/types/role";

export const rolesApi = {
  /**
   * Get all roles
   * GET /api/v1/rbac/roles
   */
  getAll: (tenantId?: string): Promise<Role[]> =>
    apiClient.get<Role[]>(tenantId ? `/rbac/roles?tenantId=${tenantId}` : "/rbac/roles"),

  /**
   * Get system roles
   * GET /api/v1/rbac/roles/system
   */
  getSystemRoles: (): Promise<Role[]> =>
    apiClient.get<Role[]>("/rbac/roles/system"),

  /**
   * Get custom roles
   * GET /api/v1/rbac/roles/custom
   */
  getCustomRoles: (tenantId: string): Promise<Role[]> =>
    apiClient.get<Role[]>(`/rbac/roles/custom?tenantId=${tenantId}`),

  /**
   * Get role by ID
   * GET /api/v1/rbac/roles/{id}
   */
  getById: (id: string): Promise<Role> =>
    apiClient.get<Role>(`/rbac/roles/${id}`),

  /**
   * Create new role
   * POST /api/v1/rbac/roles
   */
  create: (data: CreateRoleDto & { tenantId?: string }): Promise<Role> =>
    apiClient.post<Role>("/rbac/roles", data),

  /**
   * Update role
   * PUT /api/v1/rbac/roles/{id}
   */
  update: (id: string, data: UpdateRoleDto): Promise<Role> =>
    apiClient.put<Role>(`/rbac/roles/${id}`, data),

  /**
   * Delete role
   * DELETE /api/v1/rbac/roles/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/rbac/roles/${id}`),

  /**
   * Clone role
   * POST /api/v1/rbac/roles/{id}/clone
   */
  clone: (id: string, name: string): Promise<Role> =>
    apiClient.post<Role>(`/rbac/roles/${id}/clone`, { name }),

  /**
   * Grant role to user
   * POST /api/v1/rbac/user-roles/grant
   */
  grantRole: (data: GrantRoleDto): Promise<UserRole> =>
    apiClient.post<UserRole>("/rbac/user-roles/grant", data),

  /**
   * Revoke role from user
   * DELETE /api/v1/rbac/user-roles/{tenantId}/{userId}/{roleId}
   */
  revokeRole: (tenantId: string, userId: string, roleId: string): Promise<void> =>
    apiClient.delete<void>(`/rbac/user-roles/${tenantId}/${userId}/${roleId}`),

  /**
   * Get user roles
   * GET /api/v1/rbac/user-roles/{tenantId}/{userId}
   */
  getUserRoles: (tenantId: string, userId: string): Promise<UserRole[]> =>
    apiClient.get<UserRole[]>(`/rbac/user-roles/${tenantId}/${userId}`),

  /**
   * Get user permissions
   * GET /api/v1/rbac/permissions/user/{tenantId}/{userId}
   */
  getUserPermissions: (tenantId: string, userId: string): Promise<UserPermissions> =>
    apiClient.get<UserPermissions>(`/rbac/permissions/user/${tenantId}/${userId}`),

  /**
   * Check if user has permission
   * POST /api/v1/rbac/permissions/check
   */
  checkPermission: (userId: string, tenantId: string, permission: Permission): Promise<{ hasPermission: boolean }> =>
    apiClient.post<{ hasPermission: boolean }>("/rbac/permissions/check", {
      userId,
      tenantId,
      permission,
    }),

  /**
   * Get all permissions for a tenant
   * GET /api/v1/rbac/permissions
   */
  getAllPermissions: (): Promise<Permission[]> =>
    apiClient.get<Permission[]>("/rbac/permissions"),
};
