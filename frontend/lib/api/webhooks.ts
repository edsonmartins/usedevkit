import { apiClient } from "./client";
import type {
  Webhook,
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookDelivery,
} from "@/lib/types/webhook";

type WebhookResponse = {
  id: number;
  name: string;
  url: string;
  description?: string | null;
  applicationId: string;
  status: string;
  secretKey?: string | null;
  subscribedEvents?: string[];
  createdAt: string;
  updatedAt: string;
};

type WebhookStatsResponse = {
  activeWebhooks: number;
  inactiveWebhooks: number;
  disabledWebhooks: number;
  pendingDeliveries: number;
  retryingDeliveries: number;
  deliveredCount: number;
  failedCount: number;
};

const mapEventToBackend = (event: Webhook["events"][number]): string => {
  switch (event) {
    case "CONFIGURATION_CREATED":
      return "CONFIG_CREATED";
    case "CONFIGURATION_UPDATED":
      return "CONFIG_UPDATED";
    case "CONFIGURATION_DELETED":
      return "CONFIG_DELETED";
    case "SECRET_ROTATED":
      return "SECRET_ROTATED";
    case "SECRET_ROTATION_FAILED":
      return "SECRET_ROTATION_FAILED";
    case "PROMOTION_COMPLETED":
      return "PROMOTION_EXECUTED";
    case "PROMOTION_FAILED":
      return "PROMOTION_FAILED";
    case "SECRET_EXPIRED":
      return "SECRET_EXPIRED";
    default:
      return "CONFIG_UPDATED";
  }
};

const mapWebhook = (webhook: WebhookResponse): Webhook => ({
  id: String(webhook.id),
  name: webhook.name,
  description: webhook.description || undefined,
  url: webhook.url,
  events: (webhook.subscribedEvents || []) as Webhook["events"],
  headers: undefined,
  applicationId: webhook.applicationId,
  status: (webhook.status === "DISABLED" ? "FAILED" : webhook.status) as Webhook["status"],
  lastTriggeredAt: undefined,
  lastSuccessAt: undefined,
  lastFailureAt: undefined,
  failureCount: 0,
  successCount: 0,
  createdAt: webhook.createdAt,
  updatedAt: webhook.updatedAt,
});

export const webhooksApi = {
  /**
   * Get all webhooks
   * GET /api/v1/webhooks
   */
  getAll: async (): Promise<Webhook[]> => {
    const webhooks = await apiClient.get<WebhookResponse[]>("/webhooks");
    return webhooks.map(mapWebhook);
  },

  /**
   * Get webhooks by application
   * GET /api/v1/webhooks/application/{id}
   */
  getByApplication: async (applicationId: string): Promise<Webhook[]> => {
    const webhooks = await apiClient.get<WebhookResponse[]>(`/webhooks/application/${applicationId}`);
    return webhooks.map(mapWebhook);
  },

  /**
   * Get webhook by ID
   * GET /api/v1/webhooks/{id}
   */
  getById: async (id: string): Promise<Webhook> => {
    const webhook = await apiClient.get<WebhookResponse>(`/webhooks/${id}`);
    return mapWebhook(webhook);
  },

  /**
   * Create new webhook
   * POST /api/v1/webhooks
   */
  create: async (data: CreateWebhookDto): Promise<Webhook> => {
    const webhook = await apiClient.post<WebhookResponse>("/webhooks", {
      name: data.name,
      url: data.url,
      description: data.description,
      applicationId: data.applicationId,
      subscribedEvents: data.events.map(mapEventToBackend),
      secretKey: undefined,
    });
    return mapWebhook(webhook);
  },

  /**
   * Update webhook
   * PUT /api/v1/webhooks/{id}
   */
  update: async (id: string, data: UpdateWebhookDto): Promise<Webhook> => {
    const webhook = await apiClient.put<WebhookResponse>(`/webhooks/${id}`, {
      name: data.name,
      url: data.url,
      description: data.description,
      subscribedEvents: data.events ? data.events.map(mapEventToBackend) : undefined,
      secretKey: undefined,
    });
    return mapWebhook(webhook);
  },

  /**
   * Activate webhook
   * POST /api/v1/webhooks/{id}/activate
   */
  activate: (id: string): Promise<void> =>
    apiClient.post<void>(`/webhooks/${id}/activate`),

  /**
   * Deactivate webhook
   * POST /api/v1/webhooks/{id}/deactivate
   */
  deactivate: (id: string): Promise<void> =>
    apiClient.post<void>(`/webhooks/${id}/deactivate`),

  /**
   * Delete webhook
   * DELETE /api/v1/webhooks/{id}
   */
  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/webhooks/${id}`),

  /**
   * Get webhook deliveries
   * GET /api/v1/webhooks/{id}/deliveries
   */
  getDeliveries: async (id: string, limit: number = 50): Promise<WebhookDelivery[]> => {
    const deliveries = await apiClient.get<Array<{
      id: number;
      webhookId: number;
      eventType: string;
      payload?: string | null;
      responseStatusCode?: number | null;
      responseBody?: string | null;
      status: string;
      attemptNumber: number;
      nextRetryAt?: string | null;
      deliveredAt?: string | null;
      createdAt: string;
    }>>(`/webhooks/${id}/deliveries?limit=${limit}`);

    return deliveries.map((d) => ({
      id: String(d.id),
      webhookId: String(d.webhookId),
      eventType: d.eventType as WebhookDelivery["eventType"],
      url: "",
      statusCode: d.responseStatusCode || undefined,
      status: d.status === "DELIVERED" ? "SUCCESS" : d.status as WebhookDelivery["status"],
      requestBody: d.payload || undefined,
      responseBody: d.responseBody || undefined,
      attempt: d.attemptNumber,
      maxAttempts: 0,
      nextRetryAt: d.nextRetryAt || undefined,
      completedAt: d.deliveredAt || undefined,
      createdAt: d.createdAt,
    }));
  },

  /**
   * Test webhook
   * POST /api/v1/webhooks/{id}/test
   */
  test: (id: string): Promise<{ success: boolean; message: string }> =>
    apiClient.post<{ success: boolean; message: string }>(`/webhooks/${id}/test`),

  /**
   * Retry failed delivery
   * POST /api/v1/webhooks/deliveries/{id}/retry
   */
  retryDelivery: (deliveryId: string): Promise<void> =>
    apiClient.post<void>(`/webhooks/deliveries/${deliveryId}/retry`),

  /**
   * Get webhook stats
   * GET /api/v1/webhooks/stats
   */
  getStats: async (): Promise<{ total: number; active: number; inactive: number; failed: number }> => {
    const stats = await apiClient.get<WebhookStatsResponse>("/webhooks/stats");
    return {
      total: stats.activeWebhooks + stats.inactiveWebhooks + stats.disabledWebhooks,
      active: stats.activeWebhooks,
      inactive: stats.inactiveWebhooks + stats.disabledWebhooks,
      failed: stats.failedCount,
    };
  },
};
