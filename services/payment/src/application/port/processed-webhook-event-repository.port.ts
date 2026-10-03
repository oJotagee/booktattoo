export const PROCESSED_WEBHOOK_EVENT_REPOSITORY = Symbol('PROCESSED_WEBHOOK_EVENT_REPOSITORY');

export interface ProcessedWebhookEventRepository {
  exists(eventId: string): Promise<boolean>;
  save(eventId: string, type: string): Promise<void>;
}
