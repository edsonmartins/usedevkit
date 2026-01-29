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

type PermissionResponse = {
  id: number;
  name: string;
  displayName: string;
  description?: string | null;
  resource: string;
  action: string;
  isSystem: boolean;
};

type RoleResponse = {
  id: number;
  name: string;
  description?: string | null;
  isSystemRole: boolean;
  tenantId?: number | null;
  permissions: PermissionResponse[];
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
};

type UserRoleResponse = {
  id: number;
  tenantId?: number | null;
  userId: string;
  roleId: number;
  roleName: string;
  grantedAt: string;
  grantedBy?: string | null;
  expiresAt?: string | null;
};

type PermissionCheckResponse = {
  hasPermission: boolean;
  userId: string;
  resource: string;
  action: string;
  permissions: string[];
  totalPermissions: number;
};

const normalizeAction = (action: string): string => {
  switch (action) {
    case "view":
      return "read";
    case "activate":
    case "deactivate":
    case "toggle":
    case "rollback":
    case "history":
    case "execute":
      return "manage";
    case "decrypt":
      return "read";
    default:
      return action;
  }
};

const mapPermissionName = (permission: Permission): string => {
  const [resource, action] = permission.split(".");
  if (!resource || !action) return permission;
  const normalizedAction = normalizeAction(action);
  switch (resource) {
    case "application":
      return "application:manage";
    case "configuration":
      return `config:${normalizedAction === "update" || normalizedAction === "create" || normalizedAction === "manage" ? "write" : normalizedAction}`;
    case "feature_flag":
      return `config:${normalizedAction === "update" || normalizedAction === "create" || normalizedAction === "manage" ? "write" : normalizedAction}`;
    case "promotion":
      return normalizedAction === "approve" ? "promotion:approve" : "promotion:execute";
    case "webhook":
      return "webhook:manage";
    case "service":
      return "application:manage";
    case "tenant":
      return "tenant:manage";
    case "role":
      return "role:manage";
    case "user":
      return "user:manage";
    case "admin":
      return "tenant:manage";
    default:
      return `${resource}:${normalizedAction}`;
  }
};

const mapPermissionToFrontend = (permissionName: string): Permission[] => {
  switch (permissionName) {
    case "config:read":
      return ["configuration.view"];
    case "config:write":
      return ["configuration.create", "configuration.update"];
    case "config:delete":
      return ["configuration.delete"];
    case "config:manage":
      return ["configuration.rollback", "configuration.history", "configuration.update", "configuration.create", "configuration.delete"];
    case "secret:read":
      return ["secret.view"];
    case "secret:write":
      return ["secret.create", "secret.update"];
    case "secret:delete":
      return ["secret.delete"];
    case "secret:rotate":
      return ["secret.rotate"];
    case "secret:manage":
      return ["secret.view", "secret.create", "secret.update", "secret.delete", "secret.rotate", "secret.decrypt"];
    case "application:read":
      return ["application.view"];
    case "application:create":
      return ["application.create"];
    case "application:update":
      return ["application.update"];
    case "application:delete":
      return ["application.delete"];
    case "application:manage":
      return ["application.view", "application.create", "application.update", "application.delete", "application.activate", "application.deactivate"];
    case "environment:manage":
      return ["application.update"];
    case "tenant:read":
      return ["tenant.view"];
    case "tenant:update":
      return ["tenant.update"];
    case "tenant:manage":
      return ["tenant.view", "tenant.update", "tenant.manage_users", "tenant.upgrade", "tenant.delete"];
    case "user:invite":
      return ["user.create"];
    case "user:manage":
      return ["user.view", "user.create", "user.update", "user.delete"];
    case "user:delete":
      return ["user.delete"];
    case "role:create":
      return ["role.create"];
    case "role:update":
      return ["role.update"];
    case "role:delete":
      return ["role.delete"];
    case "role:manage":
      return ["role.view", "role.create", "role.update", "role.delete", "role.assign"];
    case "featureflag:read":
      return ["feature_flag.view"];
    case "featureflag:write":
      return ["feature_flag.create", "feature_flag.update"];
    case "featureflag:delete":
      return ["feature_flag.delete"];
    case "featureflag:manage":
      return ["feature_flag.toggle"];
    case "promotion:execute":
      return ["promotion.execute", "promotion.view", "promotion.create", "promotion.rollback"];
    case "promotion:approve":
      return ["promotion.approve"];
    case "webhook:manage":
      return ["webhook.view", "webhook.create", "webhook.update", "webhook.delete", "webhook.test"];
    case "audit:read":
      return ["admin.audit"];
    case "billing:read":
    case "billing:manage":
      return ["admin.system"];
    case "template:manage":
      return ["admin.system"];
    default:
      return [];
  }
};

const mapRole = (role: RoleResponse): Role => ({
  id: String(role.id),
  tenantId: role.tenantId ? String(role.tenantId) : undefined,
  name: role.name,
  description: role.description || undefined,
  permissions: Array.from(new Set(role.permissions.flatMap((p) => mapPermissionToFrontend(p.name)))),
  isSystemRole: role.isSystemRole,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
});

const mapUserRole = (role: UserRoleResponse): UserRole => ({
  id: String(role.id),
  tenantId: role.tenantId ? String(role.tenantId) : "",
  userId: role.userId,
  roleId: String(role.roleId),
  roleName: role.roleName,
  grantedAt: role.grantedAt,
  grantedBy: role.grantedBy || undefined,
  expiresAt: role.expiresAt || undefined,
});

export const rolesApi = {
  /**
   * Get all roles
   * GET /api/v1/rbac/roles
   */
  getAll: async (_tenantId?: string): Promise<Role[]> => {
    const roles = await apiClient.get<RoleResponse[]>("/rbac/roles");
    return roles.map(mapRole);
  },

  /**
   * Get system roles
   * GET /api/v1/rbac/roles/system
   */
  getSystemRoles: async (): Promise<Role[]> => {
    const roles = await apiClient.get<RoleResponse[]>("/rbac/roles/system");
    return roles.map(mapRole);
  },

  /**
   * Get custom roles
   * GET /api/v1/rbac/roles/custom
   */
  getCustomRoles: async (tenantId: string): Promise<Role[]> => {
    const roles = await apiClient.get<RoleResponse[]>(`/rbac/roles/tenant/${tenantId}`);
    return roles.map(mapRole);
  },

  /**
   * Get role by ID
   * GET /api/v1/rbac/roles/{id}
   */
  getById: async (id: string): Promise<Role> => {
    const role = await apiClient.get<RoleResponse>(`/rbac/roles/${id}`);
    return mapRole(role);
  },

  /**
   * Create new role
   * POST /api/v1/rbac/roles
   */
  create: async (data: CreateRoleDto & { tenantId?: string }): Promise<Role> => {
    const permissions = await apiClient.get<PermissionResponse[]>("/rbac/permissions");
    const permissionIds = permissions
      .filter((p) => data.permissions.map(mapPermissionName).includes(p.name))
      .map((p) => p.id);

    const roleId = await apiClient.post<number>("/rbac/roles", {
      name: data.name,
      description: data.description,
      tenantId: data.tenantId ? Number(data.tenantId) : null,
      permissionIds,
    });

    const role = await apiClient.get<RoleResponse>(`/rbac/roles/${roleId}`);
    return mapRole(role);
  },

  /**
   * Update role
   * PUT /api/v1/rbac/roles/{id}
   */
  update: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    const permissions = await apiClient.get<PermissionResponse[]>("/rbac/permissions");
    const permissionIds = data.permissions
      ? permissions.filter((p) => data.permissions!.map(mapPermissionName).includes(p.name)).map((p) => p.id)
      : undefined;

    await apiClient.put<void>(`/rbac/roles/${id}`, {
      name: data.name,
      description: data.description,
      permissionIds,
    });

    const role = await apiClient.get<RoleResponse>(`/rbac/roles/${id}`);
    return mapRole(role);
  },

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
  clone: async (id: string, name: string): Promise<Role> => {
    const role = await apiClient.post<RoleResponse>(`/rbac/roles/${id}/clone`, { name });
    return mapRole(role);
  },

  /**
   * Grant role to user
   * POST /api/v1/rbac/user-roles/grant
   */
  grantRole: async (data: GrantRoleDto & { tenantId?: string; grantedBy?: string }): Promise<UserRole> => {
    const role = await apiClient.post<UserRoleResponse>("/rbac/user-roles/grant", {
      userId: data.userId,
      roleId: Number(data.roleId),
      grantedBy: data.grantedBy || "system",
      reason: "",
      expiresAt: data.expiresAt,
    });
    return mapUserRole(role);
  },

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
  getUserRoles: async (tenantId: string, userId: string): Promise<UserRole[]> => {
    const roles = await apiClient.get<RoleResponse[]>(`/rbac/user-roles/${tenantId}/${userId}`);
    return roles.map((role) => ({
      id: String(role.id),
      tenantId,
      userId,
      roleId: String(role.id),
      roleName: role.name,
      grantedAt: role.createdAt,
    }));
  },

  /**
   * Get user permissions
   * GET /api/v1/rbac/permissions/user/{tenantId}/{userId}
   */
  getUserPermissions: async (tenantId: string, userId: string): Promise<UserPermissions> => {
    const permissions = await apiClient.get<string[]>(`/rbac/permissions/user/${tenantId}/${userId}`);
    return {
      userId,
      permissions: permissions as Permission[],
      roles: [],
    };
  },

  /**
   * Check if user has permission
   * POST /api/v1/rbac/permissions/check
   */
  checkPermission: async (userId: string, tenantId: string, permission: Permission): Promise<{ hasPermission: boolean }> => {
    const response = await apiClient.post<PermissionCheckResponse>("/rbac/permissions/check", {
      userId,
      tenantId: Number(tenantId),
      permission,
    });
    return { hasPermission: response.hasPermission };
  },

  /**
   * Get all permissions for a tenant
   * GET /api/v1/rbac/permissions
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const permissions = await apiClient.get<PermissionResponse[]>("/rbac/permissions");
    return Array.from(new Set(permissions.flatMap((p) => mapPermissionToFrontend(p.name))));
  },
};
