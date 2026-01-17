import { apiClient } from "./client";
import type {
  Webhook,
  CreateWebhookDto,
  UpdateWebhookDto,
  WebhookDelivery,
} from "@/lib/types/webhook";

export const webhooksApi = {
  /**
   * Get all webhooks
   * GET /api/v1/webhooks
   */
  getAll: (): Promise<Webhook[]> =>
    apiClient.get<Webhook[]>("/webhooks"),

  /**
   * Get webhooks by application
   * GET /api/v1/webhooks/application/{id}
   */
  getByApplication: (applicationId: string): Promise<Webhook[]> =>
    apiClient.get<Webhook[]>(`/webhooks/application/${applicationId}`),

  /**
   * Get webhook by ID
   * GET /api/v1/webhooks/{id}
   */
  getById: (id: string): Promise<Webhook> =>
    apiClient.get<Webhook>(`/webhooks/${id}`),

  /**
   * Create new webhook
   * POST /api/v1/webhooks
   */
  create: (data: CreateWebhookDto): Promise<Webhook> =>
    apiClient.post<Webhook>("/webhooks", data),

  /**
   * Update webhook
   * PUT /api/v1/webhooks/{id}
   */
  update: (id: string, data: UpdateWebhookDto): Promise<Webhook> =>
    apiClient.put<Webhook>(`/webhooks/${id}`, data),

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
  getDeliveries: (id: string, limit: number = 50): Promise<WebhookDelivery[]> =>
    apiClient.get<WebhookDelivery[]>(`/webhooks/${id}/deliveries?limit=${limit}`),

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
  getStats: (): Promise<{ total: number; active: number; inactive: number; failed: number }> =>
    apiClient.get<{ total: number; active: number; inactive: number; failed: number }>("/webhooks/stats"),
};
