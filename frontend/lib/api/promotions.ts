import { apiClient } from "./client";
import type {
  Promotion,
  CreatePromotionDto,
  PromotionDiff,
} from "@/lib/types/promotion";

export const promotionsApi = {
  /**
   * Get all promotions
   * GET /api/v1/promotions
   */
  getAll: (): Promise<Promotion[]> =>
    apiClient.get<Promotion[]>("/promotions"),

  /**
   * Get promotion by ID
   * GET /api/v1/promotions/{id}
   */
  getById: (id: string): Promise<Promotion> =>
    apiClient.get<Promotion>(`/promotions/${id}`),

  /**
   * Get promotions by application
   * GET /api/v1/promotions/application/{id}
   */
  getByApplication: (applicationId: string): Promise<Promotion[]> =>
    apiClient.get<Promotion[]>(`/promotions/application/${applicationId}`),

  /**
   * Get diffs between environments
   * GET /api/v1/promotions/diff?source={sourceId}&target={targetId}
   */
  getDiff: (sourceEnvironmentId: string, targetEnvironmentId: string): Promise<PromotionDiff[]> =>
    apiClient.get<PromotionDiff[]>(
      `/promotions/diff?source=${sourceEnvironmentId}&target=${targetEnvironmentId}`
    ),

  /**
   * Create new promotion
   * POST /api/v1/promotions
   */
  create: (data: CreatePromotionDto): Promise<Promotion> =>
    apiClient.post<Promotion>("/promotions", data),

  /**
   * Approve promotion
   * POST /api/v1/promotions/{id}/approve
   */
  approve: (id: string, comment?: string): Promise<Promotion> =>
    apiClient.post<Promotion>(`/promotions/${id}/approve`, { comment }),

  /**
   * Reject promotion
   * POST /api/v1/promotions/{id}/reject
   */
  reject: (id: string, comment?: string): Promise<Promotion> =>
    apiClient.post<Promotion>(`/promotions/${id}/reject`, { comment }),

  /**
   * Execute promotion
   * POST /api/v1/promotions/{id}/execute
   */
  execute: (id: string): Promise<Promotion> =>
    apiClient.post<Promotion>(`/promotions/${id}/execute`),

  /**
   * Rollback promotion
   * POST /api/v1/promotions/{id}/rollback
   */
  rollback: (id: string): Promise<Promotion> =>
    apiClient.post<Promotion>(`/promotions/${id}/rollback`),

  /**
   * Cancel promotion
   * POST /api/v1/promotions/{id}/cancel
   */
  cancel: (id: string): Promise<Promotion> =>
    apiClient.post<Promotion>(`/promotions/${id}/cancel`),

  /**
   * Delete promotion
   * DELETE /api/v1/promotions/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/promotions/${id}`),

  /**
   * Get promotion stats
   * GET /api/v1/promotions/stats
   */
  getStats: (): Promise<{ total: number; pending: number; approved: number; completed: number; failed: number }> =>
    apiClient.get<{ total: number; pending: number; approved: number; completed: number; failed: number }>("/promotions/stats"),
};
