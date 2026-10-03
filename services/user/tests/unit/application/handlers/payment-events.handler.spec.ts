import { createEventEnvelope, type SubscriptionChangedPayload } from '@bookink/shared/events';
import { describe, expect, it, mock } from 'bun:test';

import { PaymentEventsHandler } from '@/application/handlers/payment-events.handler';
import { SubscriptionPlan } from '@/domain/entities/subscription.entity';

const payload: SubscriptionChangedPayload = {
  userId: 'user-1',
  stripeSubscriptionId: 'sub_123',
  status: 'active',
  plan: 'PROFESSIONAL',
  priceId: 'price_professional',
  currentPeriodEnd: '2026-11-01T00:00:00.000Z',
  cancelAtPeriodEnd: false,
};

describe('PaymentEventsHandler', () => {
  it('syncs the subscription with the event payload and occurredAt', async () => {
    const syncSubscription = { execute: mock(async () => undefined) };
    const handler = new PaymentEventsHandler(syncSubscription as never);
    const occurredAt = new Date('2026-10-03T18:00:00.000Z');

    await handler.handle(
      createEventEnvelope('payment.subscription.updated', payload, { occurredAt }),
    );

    expect(syncSubscription.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      stripeSubscriptionId: 'sub_123',
      status: 'active',
      plan: SubscriptionPlan.PROFESSIONAL,
      priceId: 'price_professional',
      currentPeriodEnd: new Date('2026-11-01T00:00:00.000Z'),
      cancelAtPeriodEnd: false,
      occurredAt,
    });
  });
});
