import type { AnyEventEnvelope } from './event-envelope';

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export interface EventPublisher {
  publish(event: AnyEventEnvelope): Promise<void>;
}
