export type PromotionStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "EXECUTING"
  | "COMPLETED"
  | "FAILED"
  | "ROLLBACK"
  | "CANCELLED";

export interface PromotionDiff {
  key: string;
  type: "ADDED" | "MODIFIED" | "DELETED";
  oldValue?: string;
  newValue?: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  sourceEnvironmentId: string;
  sourceEnvironmentName?: string;
  targetEnvironmentId: string;
  targetEnvironmentName?: string;
  applicationId: string;
  applicationName?: string;
  status: PromotionStatus;
  diffs?: PromotionDiff[];
  createdBy?: string;
  approvedBy?: string;
  executedBy?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  executedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface CreatePromotionDto {
  name: string;
  description?: string;
  sourceEnvironmentId: string;
  targetEnvironmentId: string;
  applicationId: string;
}

export interface PromotionApproval {
  promotionId: string;
  approved: boolean;
  comment?: string;
  approvedBy: string;
  approvedAt: string;
}

export interface PromotionExecution {
  promotionId: string;
  executedBy: string;
  executedAt: string;
  status: PromotionStatus;
}

export interface PromotionStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
  failed: number;
}
