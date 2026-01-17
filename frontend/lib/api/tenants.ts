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

export const tenantsApi = {
  /**
   * Get all tenants
   * GET /api/v1/tenants
   */
  getAll: (): Promise<Tenant[]> =>
    apiClient.get<Tenant[]>("/tenants"),

  /**
   * Get tenant by ID
   * GET /api/v1/tenants/{id}
   */
  getById: (id: string): Promise<Tenant> =>
    apiClient.get<Tenant>(`/tenants/${id}`),

  /**
   * Get tenant by slug
   * GET /api/v1/tenants/slug/{slug}
   */
  getBySlug: (slug: string): Promise<Tenant> =>
    apiClient.get<Tenant>(`/tenants/slug/${slug}`),

  /**
   * Create new tenant
   * POST /api/v1/tenants
   */
  create: (data: CreateTenantDto): Promise<Tenant> =>
    apiClient.post<Tenant>("/tenants", data),

  /**
   * Update tenant
   * PUT /api/v1/tenants/{id}
   */
  update: (id: string, data: UpdateTenantDto): Promise<Tenant> =>
    apiClient.put<Tenant>(`/tenants/${id}`, data),

  /**
   * Upgrade tenant plan
   * POST /api/v1/tenants/{id}/upgrade
   */
  upgrade: (id: string, data: UpgradeTenantDto): Promise<Tenant> =>
    apiClient.post<Tenant>(`/tenants/${id}/upgrade`, data),

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
  getStats: (): Promise<TenantStats> =>
    apiClient.get<TenantStats>("/tenants/stats"),

  /**
   * Get tenant users
   * GET /api/v1/tenants/{id}/users
   */
  getUsers: (id: string): Promise<TenantUser[]> =>
    apiClient.get<TenantUser[]>(`/tenants/${id}/users`),

  /**
   * Invite user to tenant
   * POST /api/v1/tenants/{id}/users/invite
   */
  inviteUser: (id: string, data: InviteUserDto): Promise<TenantUser> =>
    apiClient.post<TenantUser>(`/tenants/${id}/users/invite`, data),

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
  updateUserRole: (id: string, userId: string, role: string): Promise<TenantUser> =>
    apiClient.put<TenantUser>(`/tenants/${id}/users/${userId}/role`, { role }),

  /**
   * Get tenant applications
   * GET /api/v1/tenants/{id}/applications
   */
  getApplications: (id: string): Promise<Tenant> =>
    apiClient.get<Tenant>(`/tenants/${id}/applications`),
};
