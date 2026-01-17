export type AuditAction =
  // Authentication actions
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "AUTH_FAILED"
  // Application actions
  | "APPLICATION_CREATED"
  | "APPLICATION_UPDATED"
  | "APPLICATION_DELETED"
  | "APPLICATION_ACTIVATED"
  | "APPLICATION_DEACTIVATED"
  // Configuration actions
  | "CONFIGURATION_CREATED"
  | "CONFIGURATION_UPDATED"
  | "CONFIGURATION_DELETED"
  | "CONFIGURATION_VIEWED"
  | "CONFIGURATION_ROLLEDBACK"
  // Secret actions
  | "SECRET_CREATED"
  | "SECRET_UPDATED"
  | "SECRET_DELETED"
  | "SECRET_VIEWED"
  | "SECRET_ROTATED"
  // Feature Flag actions
  | "FEATURE_FLAG_CREATED"
  | "FEATURE_FLAG_UPDATED"
  | "FEATURE_FLAG_DELETED"
  | "FEATURE_FLAG_TOGGLED"
  // Promotion actions
  | "PROMOTION_CREATED"
  | "PROMOTION_APPROVED"
  | "PROMOTION_REJECTED"
  | "PROMOTION_EXECUTED"
  | "PROMOTION_ROLLEDBACK"
  // Webhook actions
  | "WEBHOOK_CREATED"
  | "WEBHOOK_UPDATED"
  | "WEBHOOK_DELETED"
  | "WEBHOOK_TRIGGERED"
  // Service actions
  | "SERVICE_REGISTERED"
  | "SERVICE_UPDATED"
  | "SERVICE_DELETED"
  | "HEALTH_CHECK_EXECUTED"
  // Tenant actions
  | "TENANT_CREATED"
  | "TENANT_UPDATED"
  | "TENANT_DELETED"
  | "TENANT_UPGRADED"
  | "TENANT_SUSPENDED"
  | "TENANT_ACTIVATED"
  // RBAC actions
  | "ROLE_CREATED"
  | "ROLE_UPDATED"
  | "ROLE_DELETED"
  | "ROLE_ASSIGNED"
  | "ROLE_REVOKED"
  | "PERMISSION_GRANTED"
  | "PERMISSION_REVOKED"
  // User actions
  | "USER_INVITED"
  | "USER_ACCEPTED_INVITE"
  | "USER_REMOVED"
  // Admin actions
  | "SYSTEM_SETTINGS_UPDATED"
  | "API_KEY_CREATED"
  | "API_KEY_DELETED"
  | "EXPORT_EXECUTED";

export type AuditEntityType =
  | "USER"
  | "APPLICATION"
  | "CONFIGURATION"
  | "SECRET"
  | "FEATURE_FLAG"
  | "PROMOTION"
  | "WEBHOOK"
  | "SERVICE"
  | "TENANT"
  | "ROLE"
  | "API_KEY"
  | "SYSTEM";

export interface AuditLog {
  id: string;
  tenantId?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityName?: string;

  // Who performed the action
  userId: string;
  userName: string;
  userEmail: string;

  // Details
  changes?: Record<string, { from?: unknown; to?: unknown }>;
  metadata?: Record<string, unknown>;

  // Request info
  ipAddress?: string;
  userAgent?: string;

  // Timestamps
  timestamp: string;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byAction: Record<AuditAction, number>;
  byUser: Array<{ userId: string; userName: string; count: number }>;
}

// Action categories for UI organization
export const ACTION_CATEGORIES: Record<string, { actions: AuditAction[]; label: string; color: string }> = {
  authentication: {
    label: "Authentication",
    color: "bg-blue-500/20 text-blue-400",
    actions: ["USER_LOGIN", "USER_LOGOUT", "AUTH_FAILED"],
  },
  applications: {
    label: "Applications",
    color: "bg-purple-500/20 text-purple-400",
    actions: ["APPLICATION_CREATED", "APPLICATION_UPDATED", "APPLICATION_DELETED", "APPLICATION_ACTIVATED", "APPLICATION_DEACTIVATED"],
  },
  configurations: {
    label: "Configurations",
    color: "bg-green-500/20 text-green-400",
    actions: ["CONFIGURATION_CREATED", "CONFIGURATION_UPDATED", "CONFIGURATION_DELETED", "CONFIGURATION_VIEWED", "CONFIGURATION_ROLLEDBACK"],
  },
  secrets: {
    label: "Secrets",
    color: "bg-yellow-500/20 text-yellow-400",
    actions: ["SECRET_CREATED", "SECRET_UPDATED", "SECRET_DELETED", "SECRET_VIEWED", "SECRET_ROTATED"],
  },
  feature_flags: {
    label: "Feature Flags",
    color: "bg-cyan-500/20 text-cyan-400",
    actions: ["FEATURE_FLAG_CREATED", "FEATURE_FLAG_UPDATED", "FEATURE_FLAG_DELETED", "FEATURE_FLAG_TOGGLED"],
  },
  promotions: {
    label: "Promotions",
    color: "bg-pink-500/20 text-pink-400",
    actions: ["PROMOTION_CREATED", "PROMOTION_APPROVED", "PROMOTION_REJECTED", "PROMOTION_EXECUTED", "PROMOTION_ROLLEDBACK"],
  },
  webhooks: {
    label: "Webhooks",
    color: "bg-indigo-500/20 text-indigo-400",
    actions: ["WEBHOOK_CREATED", "WEBHOOK_UPDATED", "WEBHOOK_DELETED", "WEBHOOK_TRIGGERED"],
  },
  services: {
    label: "Services",
    color: "bg-orange-500/20 text-orange-400",
    actions: ["SERVICE_REGISTERED", "SERVICE_UPDATED", "SERVICE_DELETED", "HEALTH_CHECK_EXECUTED"],
  },
  tenants: {
    label: "Tenants",
    color: "bg-teal-500/20 text-teal-400",
    actions: ["TENANT_CREATED", "TENANT_UPDATED", "TENANT_DELETED", "TENANT_UPGRADED", "TENANT_SUSPENDED", "TENANT_ACTIVATED"],
  },
  rbac: {
    label: "RBAC",
    color: "bg-rose-500/20 text-rose-400",
    actions: ["ROLE_CREATED", "ROLE_UPDATED", "ROLE_DELETED", "ROLE_ASSIGNED", "ROLE_REVOKED", "PERMISSION_GRANTED", "PERMISSION_REVOKED"],
  },
  users: {
    label: "Users",
    color: "bg-violet-500/20 text-violet-400",
    actions: ["USER_INVITED", "USER_ACCEPTED_INVITE", "USER_REMOVED"],
  },
  admin: {
    label: "Admin",
    color: "bg-red-500/20 text-red-400",
    actions: ["SYSTEM_SETTINGS_UPDATED", "API_KEY_CREATED", "API_KEY_DELETED", "EXPORT_EXECUTED"],
  },
};
