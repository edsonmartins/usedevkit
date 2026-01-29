import { apiClient } from "./client";
import type {
  Tenant,
  CreateTenantDto,
  UpdateTenantDto,
  UpgradeTenantDto,
  TenantStats,
  TenantUser,
  InviteUserDto,
} from "@/lib/types/tenant";

type TenantResponse = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  ownerEmail?: string | null;
  plan: string;
  isActive: boolean;
  logoUrl?: string | null;
  domain?: string | null;
  settings?: string | null;
  maxUsers?: number | null;
  maxApplications?: number | null;
  maxConfigsPerApplication?: number | null;
  unlimitedApps?: boolean | null;
  userCount?: number | null;
  applicationCount?: number | null;
  configCount?: number | null;
  trialEndsAt?: string | null;
  daysUntilTrialEnds?: number | null;
  createdAt: string;
  updatedAt: string;
  subscriptionRenewsAt?: string | null;
};

type TenantStatsResponse = {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  cancelledTenants: number;
  tenantsByPlan: Record<string, number>;
};

type TenantUserResponse = {
  id: string;
  tenantId: number;
  userId: string;
  email: string;
  name: string;
  role: string;
  isActive?: boolean;
  joinedAt?: string | null;
  invitedAt?: string | null;
  lastActiveAt?: string | null;
};

const mapTenantPlan = (plan: string): Tenant["plan"] => {
  switch (plan) {
    case "PROFESSIONAL":
      return "PRO";
    case "FREE":
    case "STARTER":
    case "PRO":
    case "ENTERPRISE":
      return plan as Tenant["plan"];
    default:
      return "FREE";
  }
};

const mapPlanToBackend = (plan?: Tenant["plan"]): string => {
  if (plan === "PRO") return "PROFESSIONAL";
  return plan || "FREE";
};

const mapTenantStatus = (tenant: TenantResponse): Tenant["status"] => {
  if (!tenant.isActive) return "SUSPENDED";
  if (tenant.trialEndsAt) return "TRIAL";
  return "ACTIVE";
};

const mapTenant = (tenant: TenantResponse): Tenant => ({
  id: String(tenant.id),
  name: tenant.name,
  slug: tenant.slug,
  plan: mapTenantPlan(tenant.plan),
  status: mapTenantStatus(tenant),
  logo: tenant.logoUrl || undefined,
  description: tenant.description || undefined,
  billingEmail: tenant.ownerEmail || undefined,
  technicalEmail: tenant.ownerEmail || undefined,
  limits: {
    maxApplications: tenant.maxApplications ?? 0,
    maxConfigurations: tenant.maxConfigsPerApplication ?? 0,
    maxSecrets: 0,
    maxUsers: tenant.maxUsers ?? 0,
    maxWebhooks: 0,
    maxFeatureFlags: 0,
  },
  usage: {
    applications: tenant.applicationCount ?? 0,
    configurations: tenant.configCount ?? 0,
    secrets: 0,
    users: tenant.userCount ?? 0,
    webhooks: 0,
    featureFlags: 0,
  },
  trialEndsAt: tenant.trialEndsAt || undefined,
  subscriptionEndsAt: tenant.subscriptionRenewsAt || undefined,
  createdAt: tenant.createdAt,
  updatedAt: tenant.updatedAt,
});

const mapTenantStats = (stats: TenantStatsResponse): TenantStats => ({
  totalTenants: stats.totalTenants,
  activeTenants: stats.activeTenants,
  trialTenants: stats.trialTenants,
  suspendedTenants: stats.suspendedTenants,
  cancelledTenants: stats.cancelledTenants,
  tenantsByPlan: {
    FREE: stats.tenantsByPlan.FREE || 0,
    STARTER: stats.tenantsByPlan.STARTER || 0,
    PRO: stats.tenantsByPlan.PRO || stats.tenantsByPlan.PROFESSIONAL || 0,
    ENTERPRISE: stats.tenantsByPlan.ENTERPRISE || 0,
  },
});

const mapTenantUser = (user: TenantUserResponse): TenantUser => ({
  id: user.id,
  tenantId: String(user.tenantId),
  userId: user.userId,
  email: user.email,
  name: user.name,
  role: user.role as TenantUser["role"],
  joinedAt: user.joinedAt || "",
  invitedBy: undefined,
});

export const tenantsApi = {
  /**
   * Get all tenants
   * GET /api/v1/tenants
   */
  getAll: async (): Promise<Tenant[]> => {
    const tenants = await apiClient.get<TenantResponse[]>("/tenants");
    return tenants.map(mapTenant);
  },

  /**
   * Get tenant by ID
   * GET /api/v1/tenants/{id}
   */
  getById: async (id: string): Promise<Tenant> => {
    const tenant = await apiClient.get<TenantResponse>(`/tenants/${id}`);
    return mapTenant(tenant);
  },

  /**
   * Get tenant by slug
   * GET /api/v1/tenants/slug/{slug}
   */
  getBySlug: async (slug: string): Promise<Tenant> => {
    const tenant = await apiClient.get<TenantResponse>(`/tenants/slug/${slug}`);
    return mapTenant(tenant);
  },

  /**
   * Create new tenant
   * POST /api/v1/tenants
   */
  create: async (data: CreateTenantDto): Promise<Tenant> => {
    const tenant = await apiClient.post<TenantResponse>("/tenants", {
      name: data.name,
      slug: data.slug,
      description: data.description,
      ownerEmail: data.billingEmail || data.technicalEmail || "system@devkit.local",
      plan: mapPlanToBackend(data.plan),
    });
    return mapTenant(tenant);
  },

  /**
   * Update tenant
   * PUT /api/v1/tenants/{id}
   */
  update: async (id: string, data: UpdateTenantDto): Promise<Tenant> => {
    const tenant = await apiClient.put<TenantResponse>(`/tenants/${id}`, {
      name: data.name,
      description: data.description,
      billingEmail: data.billingEmail || data.technicalEmail,
      logoUrl: data.logo,
    });
    return mapTenant(tenant);
  },

  /**
   * Upgrade tenant plan
   * POST /api/v1/tenants/{id}/upgrade
   */
  upgrade: async (id: string, data: UpgradeTenantDto): Promise<Tenant> => {
    const tenant = await apiClient.post<TenantResponse>(`/tenants/${id}/upgrade?plan=${mapPlanToBackend(data.plan as Tenant["plan"])}`, {});
    return mapTenant(tenant);
  },

  /**
   * Suspend tenant
   * POST /api/v1/tenants/{id}/suspend
   */
  suspend: (id: string): Promise<void> =>
    apiClient.post<void>(`/tenants/${id}/suspend`),

  /**
   * Activate tenant
   * POST /api/v1/tenants/{id}/activate
   */
  activate: (id: string): Promise<void> =>
    apiClient.post<void>(`/tenants/${id}/activate`),

  /**
   * Delete tenant
   * DELETE /api/v1/tenants/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/tenants/${id}`),

  /**
   * Get tenant stats
   * GET /api/v1/tenants/stats
   */
  getStats: async (): Promise<TenantStats> => {
    const stats = await apiClient.get<TenantStatsResponse>("/tenants/stats");
    return mapTenantStats(stats);
  },

  /**
   * Get tenant users
   * GET /api/v1/tenants/{id}/users
   */
  getUsers: async (id: string): Promise<TenantUser[]> => {
    const users = await apiClient.get<TenantUserResponse[]>(`/tenants/${id}/users`);
    return users.map(mapTenantUser);
  },

  /**
   * Invite user to tenant
   * POST /api/v1/tenants/{id}/users/invite
   */
  inviteUser: async (id: string, data: InviteUserDto): Promise<TenantUser> => {
    const user = await apiClient.post<TenantUserResponse>(`/tenants/${id}/users/invite`, data);
    return mapTenantUser(user);
  },

  /**
   * Remove user from tenant
   * DELETE /api/v1/tenants/{id}/users/{userId}
   */
  removeUser: (id: string, userId: string): Promise<void> =>
    apiClient.delete<void>(`/tenants/${id}/users/${userId}`),

  /**
   * Update user role in tenant
   * PUT /api/v1/tenants/{id}/users/{userId}/role
   */
  updateUserRole: async (id: string, userId: string, role: string): Promise<TenantUser> => {
    const user = await apiClient.put<TenantUserResponse>(`/tenants/${id}/users/${userId}/role`, { role });
    return mapTenantUser(user);
  },

  /**
   * Get tenant applications
   * GET /api/v1/tenants/{id}/applications
   */
  getApplications: async (id: string): Promise<Tenant> => {
    const tenant = await apiClient.get<TenantResponse>(`/tenants/${id}/applications`);
    return mapTenant(tenant);
  },
};
