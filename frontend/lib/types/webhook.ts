export type WebhookEvent =
  | "CONFIGURATION_CREATED"
  | "CONFIGURATION_UPDATED"
  | "CONFIGURATION_DELETED"
  | "SECRET_ROTATED"
  | "SECRET_ROTATION_FAILED"
  | "SECRET_EXPIRED"
  | "PROMOTION_COMPLETED"
  | "PROMOTION_FAILED";

export type WebhookStatus = "ACTIVE" | "INACTIVE" | "FAILED";

export interface WebhookHeaders {
  [key: string]: string;
}

export interface Webhook {
  id: string;
  name: string;
  description?: string;
  url: string;
  events: WebhookEvent[];
  headers?: WebhookHeaders;
  applicationId?: string;
  status: WebhookStatus;
  lastTriggeredAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount: number;
  successCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookDto {
  name: string;
  description?: string;
  url: string;
  events: WebhookEvent[];
  headers?: WebhookHeaders;
  applicationId?: string;
}

export interface UpdateWebhookDto {
  name?: string;
  description?: string;
  url?: string;
  events?: WebhookEvent[];
  headers?: WebhookHeaders;
  status?: WebhookStatus;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: WebhookEvent;
  url: string;
  statusCode?: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "RETRYING";
  requestBody?: string;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  attempt: number;
  maxAttempts: number;
  nextRetryAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface WebhookStats {
  total: number;
  active: number;
  inactive: number;
  failed: number;
}
