export const BOOKINK_EVENTS_EXCHANGE = 'bookink.events';

export type EventEnvelope<TType extends string, TPayload> = {
  eventId: string;
  type: TType;
  version: 1;
  payload: TPayload;
  occurredAt: string;
  correlationId?: string;
  causationId?: string;
};

export type AnyEventEnvelope = EventEnvelope<string, unknown>;

export type EventMetadata = {
  eventId?: string;
  occurredAt?: Date;
  correlationId?: string;
  causationId?: string;
};

export function createEventEnvelope<TType extends string, TPayload>(
  type: TType,
  payload: TPayload,
  metadata: EventMetadata = {},
): EventEnvelope<TType, TPayload> {
  return {
    eventId: metadata.eventId ?? crypto.randomUUID(),
    type,
    version: 1,
    payload,
    occurredAt: (metadata.occurredAt ?? new Date()).toISOString(),
    correlationId: metadata.correlationId,
    causationId: metadata.causationId,
  };
}
