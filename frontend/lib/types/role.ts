// Resource types in the system
export type ResourceType =
  | "APPLICATION"
  | "CONFIGURATION"
  | "SECRET"
  | "FEATURE_FLAG"
  | "PROMOTION"
  | "WEBHOOK"
  | "SERVICE"
  | "TENANT"
  | "ROLE"
  | "USER"
  | "AUDIT_LOG";

// Available permissions
export type Permission =
  // Application permissions
  | "application.view"
  | "application.create"
  | "application.update"
  | "application.delete"
  | "application.activate"
  | "application.deactivate"
  // Configuration permissions
  | "configuration.view"
  | "configuration.create"
  | "configuration.update"
  | "configuration.delete"
  | "configuration.rollback"
  | "configuration.history"
  // Secret permissions
  | "secret.view"
  | "secret.create"
  | "secret.update"
  | "secret.delete"
  | "secret.rotate"
  | "secret.decrypt"
  // Feature Flag permissions
  | "feature_flag.view"
  | "feature_flag.create"
  | "feature_flag.update"
  | "feature_flag.delete"
  | "feature_flag.toggle"
  // Promotion permissions
  | "promotion.view"
  | "promotion.create"
  | "promotion.execute"
  | "promotion.approve"
  | "promotion.rollback"
  // Webhook permissions
  | "webhook.view"
  | "webhook.create"
  | "webhook.update"
  | "webhook.delete"
  | "webhook.test"
  // Service permissions
  | "service.view"
  | "service.register"
  | "service.update"
  | "service.delete"
  // Tenant permissions
  | "tenant.view"
  | "tenant.update"
  | "tenant.manage_users"
  | "tenant.upgrade"
  | "tenant.delete"
  // RBAC permissions
  | "role.view"
  | "role.create"
  | "role.update"
  | "role.delete"
  | "role.assign"
  // User permissions
  | "user.view"
  | "user.create"
  | "user.update"
  | "user.delete"
  // Admin permissions
  | "admin.system"
  | "admin.audit";

// Permission categories for UI organization
export const PERMISSION_CATEGORIES: Record<string, { permissions: Permission[]; label: string; icon: string }> = {
  applications: {
    label: "Applications",
    icon: "App",
    permissions: ["application.view", "application.create", "application.update", "application.delete", "application.activate", "application.deactivate"],
  },
  configurations: {
    label: "Configurations",
    icon: "Config",
    permissions: ["configuration.view", "configuration.create", "configuration.update", "configuration.delete", "configuration.rollback", "configuration.history"],
  },
  secrets: {
    label: "Secrets",
    icon: "Key",
    permissions: ["secret.view", "secret.create", "secret.update", "secret.delete", "secret.rotate", "secret.decrypt"],
  },
  feature_flags: {
    label: "Feature Flags",
    icon: "Flag",
    permissions: ["feature_flag.view", "feature_flag.create", "feature_flag.update", "feature_flag.delete", "feature_flag.toggle"],
  },
  promotions: {
    label: "Promotions",
    icon: "Promote",
    permissions: ["promotion.view", "promotion.create", "promotion.execute", "promotion.approve", "promotion.rollback"],
  },
  webhooks: {
    label: "Webhooks",
    icon: "Webhook",
    permissions: ["webhook.view", "webhook.create", "webhook.update", "webhook.delete", "webhook.test"],
  },
  services: {
    label: "Services",
    icon: "Server",
    permissions: ["service.view", "service.register", "service.update", "service.delete"],
  },
  tenants: {
    label: "Tenants",
    icon: "Building",
    permissions: ["tenant.view", "tenant.update", "tenant.manage_users", "tenant.upgrade", "tenant.delete"],
  },
  rbac: {
    label: "Roles & Permissions",
    icon: "Shield",
    permissions: ["role.view", "role.create", "role.update", "role.delete", "role.assign"],
  },
  users: {
    label: "Users",
    icon: "Users",
    permissions: ["user.view", "user.create", "user.update", "user.delete"],
  },
  admin: {
    label: "Administration",
    icon: "Admin",
    permissions: ["admin.system", "admin.audit"],
  },
};

export interface Role {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: Permission[];
}

export interface UserRole {
  id: string;
  tenantId: string;
  userId: string;
  roleId: string;
  roleName: string;
  grantedAt: string;
  grantedBy?: string;
  expiresAt?: string;
}

export interface GrantRoleDto {
  userId: string;
  roleId: string;
  expiresAt?: string;
}

export interface UserPermissions {
  userId: string;
  permissions: Permission[];
  roles: string[];
}

// System default roles
export const SYSTEM_ROLES: Record<string, { name: string; description: string; permissions: Permission[] }> = {
  OWNER: {
    name: "Owner",
    description: "Full access to all resources",
    permissions: Object.values(PERMISSION_CATEGORIES).flatMap((c) => c.permissions),
  },
  ADMIN: {
    name: "Admin",
    description: "Administrative access except tenant deletion",
    permissions: Object.values(PERMISSION_CATEGORIES).flatMap((c) => c.permissions).filter((p) => p !== "tenant.delete"),
  },
  MEMBER: {
    name: "Member",
    description: "Standard access to create and manage resources",
    permissions: [
      "application.view", "application.create", "application.update",
      "configuration.view", "configuration.create", "configuration.update", "configuration.history",
      "secret.view", "secret.create", "secret.update",
      "feature_flag.view", "feature_flag.create", "feature_flag.update", "feature_flag.toggle",
      "promotion.view", "promotion.create",
      "webhook.view", "webhook.create", "webhook.update", "webhook.test",
      "service.view", "service.register", "service.update",
      "tenant.view",
      "role.view",
      "user.view",
    ],
  },
  VIEWER: {
    name: "Viewer",
    description: "Read-only access to most resources",
    permissions: [
      "application.view",
      "configuration.view", "configuration.history",
      "secret.view",
      "feature_flag.view",
      "promotion.view",
      "webhook.view",
      "service.view",
      "tenant.view",
      "role.view",
      "user.view",
    ],
  },
};
