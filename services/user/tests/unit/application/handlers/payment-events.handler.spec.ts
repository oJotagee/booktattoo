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

function createHandler() {
  const syncSubscription = { execute: mock(async () => undefined) };
  const syncPaymentsEnabled = { execute: mock(async () => undefined) };
  const handler = new PaymentEventsHandler(syncSubscription as never, syncPaymentsEnabled as never);

  return { handler, syncSubscription, syncPaymentsEnabled };
}

describe('PaymentEventsHandler', () => {
  it('syncs the subscription with the event payload and occurredAt', async () => {
    const { handler, syncSubscription } = createHandler();
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

  it('syncs paymentsEnabled when the connected account changes', async () => {
    const { handler, syncPaymentsEnabled, syncSubscription } = createHandler();

    await handler.handle(
      createEventEnvelope('payment.connect.account.updated', {
        userId: 'user-1',
        stripeAccountId: 'acct_123',
        chargesEnabled: true,
        payoutsEnabled: true,
        paymentsEnabled: true,
      }),
    );

    expect(syncPaymentsEnabled.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      paymentsEnabled: true,
    });
    expect(syncSubscription.execute).not.toHaveBeenCalled();
  });
});
