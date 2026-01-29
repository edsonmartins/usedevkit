import { apiClient } from "./client";
import type {
  Promotion,
  CreatePromotionDto,
  PromotionDiff,
} from "@/lib/types/promotion";

type PromotionResponse = {
  id: string;
  applicationId: string;
  sourceEnvironment: string;
  targetEnvironment: string;
  status: string;
  requestedBy?: string | null;
  approvedBy?: string | null;
  approvalReason?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  approvedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
  diffs?: Array<{
    configKey: string;
    sourceValue?: string | null;
    targetValue?: string | null;
    changeType: "NEW" | "MODIFIED" | "DELETED" | "SAME";
  }>;
};

type PromotionStatsResponse = {
  pendingCount: number;
  approvedCount: number;
  completedCount: number;
  failedCount: number;
  rejectedCount: number;
};

type EnvironmentDiffResponse = {
  key: string;
  sourceValue?: string | null;
  targetValue?: string | null;
  changeType: "NEW" | "MODIFIED" | "DELETED" | "SAME";
};

const mapPromotionStatus = (status: string): Promotion["status"] => {
  switch (status) {
    case "PENDING_APPROVAL":
    case "APPROVED":
    case "COMPLETED":
    case "FAILED":
      return status as Promotion["status"];
    case "REJECTED":
      return "CANCELLED";
    case "IN_PROGRESS":
      return "EXECUTING";
    case "ROLLED_BACK":
      return "ROLLBACK";
    default:
      return "DRAFT";
  }
};

const mapPromotion = (promo: PromotionResponse): Promotion => ({
  id: promo.id,
  name: promo.id,
  description: promo.approvalReason || undefined,
  sourceEnvironmentId: promo.sourceEnvironment,
  targetEnvironmentId: promo.targetEnvironment,
  applicationId: promo.applicationId,
  status: mapPromotionStatus(promo.status),
  diffs: promo.diffs?.map((d) => ({
    key: d.configKey,
    type: d.changeType === "NEW" ? "ADDED" : d.changeType === "DELETED" ? "DELETED" : "MODIFIED",
    oldValue: d.targetValue || undefined,
    newValue: d.sourceValue || undefined,
  })),
  createdBy: promo.requestedBy || undefined,
  approvedBy: promo.approvedBy || undefined,
  createdAt: promo.createdAt,
  updatedAt: promo.completedAt || promo.createdAt,
  approvedAt: promo.approvedAt || undefined,
  completedAt: promo.completedAt || undefined,
  errorMessage: promo.errorMessage || undefined,
});

export const promotionsApi = {
  /**
   * Get all promotions
   * GET /api/v1/promotions
   */
  getAll: async (): Promise<Promotion[]> => {
    const promotions = await apiClient.get<PromotionResponse[]>("/promotions");
    return promotions.map(mapPromotion);
  },

  /**
   * Get promotion by ID
   * GET /api/v1/promotions/{id}
   */
  getById: async (id: string): Promise<Promotion> => {
    const promotion = await apiClient.get<PromotionResponse>(`/promotions/${id}`);
    return mapPromotion(promotion);
  },

  /**
   * Get promotions by application
   * GET /api/v1/promotions/application/{id}
   */
  getByApplication: async (applicationId: string): Promise<Promotion[]> => {
    const promotions = await apiClient.get<PromotionResponse[]>(`/promotions/application/${applicationId}`);
    return promotions.map(mapPromotion);
  },

  /**
   * Get diffs between environments
   * GET /api/v1/promotions/diff?source={sourceId}&target={targetId}
   */
  getDiff: async (sourceEnvironmentId: string, targetEnvironmentId: string): Promise<PromotionDiff[]> => {
    const diffs = await apiClient.get<EnvironmentDiffResponse[]>(
      `/promotions/diff?source=${sourceEnvironmentId}&target=${targetEnvironmentId}`
    );
    return diffs
      .filter((d) => d.changeType !== "SAME")
      .map((d) => ({
        key: d.key,
        type: d.changeType === "NEW" ? "ADDED" : d.changeType === "DELETED" ? "DELETED" : "MODIFIED",
        oldValue: d.targetValue || undefined,
        newValue: d.sourceValue || undefined,
      }));
  },

  /**
   * Create new promotion
   * POST /api/v1/promotions
   */
  create: async (data: CreatePromotionDto): Promise<Promotion> => {
    const promotion = await apiClient.post<PromotionResponse>("/promotions", {
      applicationId: data.applicationId,
      sourceEnvironment: data.sourceEnvironmentId,
      targetEnvironment: data.targetEnvironmentId,
      requestedBy: "system",
      includeAllConfigs: true,
      configKeys: [],
      smokeTestEnabled: false,
    });
    return mapPromotion(promotion);
  },

  /**
   * Approve promotion
   * POST /api/v1/promotions/{id}/approve
   */
  approve: async (id: string, comment?: string): Promise<Promotion> => {
    const promotion = await apiClient.post<PromotionResponse>(`/promotions/${id}/approve`, {
      approvedBy: "system",
      reason: comment,
    });
    return mapPromotion(promotion);
  },

  /**
   * Reject promotion
   * POST /api/v1/promotions/{id}/reject
   */
  reject: async (id: string, comment?: string): Promise<Promotion> => {
    const promotion = await apiClient.post<PromotionResponse>(`/promotions/${id}/reject`, {
      rejectedBy: "system",
      reason: comment,
    });
    return mapPromotion(promotion);
  },

  /**
   * Execute promotion
   * POST /api/v1/promotions/{id}/execute
   */
  execute: async (id: string): Promise<Promotion> => {
    const promotion = await apiClient.post<PromotionResponse>(`/promotions/${id}/execute`);
    return mapPromotion(promotion);
  },

  /**
   * Rollback promotion
   * POST /api/v1/promotions/{id}/rollback
   */
  rollback: async (id: string): Promise<Promotion> => {
    const promotion = await apiClient.post<PromotionResponse>(`/promotions/${id}/rollback`);
    return mapPromotion(promotion);
  },

  /**
   * Cancel promotion
   * POST /api/v1/promotions/{id}/cancel
   */
  cancel: async (id: string): Promise<Promotion> => {
    const promotion = await apiClient.post<PromotionResponse>(`/promotions/${id}/cancel`);
    return mapPromotion(promotion);
  },

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
  getStats: async (): Promise<{ total: number; pending: number; approved: number; completed: number; failed: number }> => {
    const stats = await apiClient.get<PromotionStatsResponse>("/promotions/stats");
    const total = stats.pendingCount + stats.approvedCount + stats.completedCount + stats.failedCount + stats.rejectedCount;
    return {
      total,
      pending: stats.pendingCount,
      approved: stats.approvedCount,
      completed: stats.completedCount,
      failed: stats.failedCount,
    };
  },
};
