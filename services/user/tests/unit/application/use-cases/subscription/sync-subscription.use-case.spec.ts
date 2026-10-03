import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { SyncSubscriptionUseCase } from '@/application/use-cases/subscription/sync-subscription.use-case';
import { type SubscriptionEntity, SubscriptionPlan } from '@/domain/entities/subscription.entity';
import { createSubscriptionRepositoryMock } from '@tests/unit/support/mocks';
import { buildSubscription } from '@tests/unit/support/builders';

const change = {
  userId: 'user-1',
  stripeSubscriptionId: 'sub_123',
  status: 'active',
  plan: SubscriptionPlan.PROFESSIONAL,
  priceId: 'price_professional',
  currentPeriodEnd: new Date('2026-11-01T00:00:00.000Z'),
  cancelAtPeriodEnd: false,
  occurredAt: new Date('2026-10-02T00:00:00.000Z'),
};

describe('SyncSubscriptionUseCase', () => {
  let subscriptions: ReturnType<typeof createSubscriptionRepositoryMock>;
  let useCase: SyncSubscriptionUseCase;

  beforeEach(() => {
    subscriptions = createSubscriptionRepositoryMock();
    useCase = new SyncSubscriptionUseCase(subscriptions);
  });

  it('creates the subscription when the user has none', async () => {
    const save = mock(async (_subscription: SubscriptionEntity) => undefined);
    subscriptions.save = save;

    await useCase.execute(change);

    const saved = save.mock.calls[0][0];
    expect(saved.userId).toBe('user-1');
    expect(saved.plan).toBe(SubscriptionPlan.PROFESSIONAL);
    expect(saved.lastEventAt).toEqual(change.occurredAt);
  });

  it('applies a newer change to the existing subscription', async () => {
    subscriptions.findByUserId = async () =>
      buildSubscription({ lastEventAt: new Date('2026-10-01T00:00:00.000Z') });
    const save = mock(async (_subscription: SubscriptionEntity) => undefined);
    subscriptions.save = save;

    await useCase.execute({ ...change, status: 'canceled' });

    const saved = save.mock.calls[0][0];
    expect(saved.id).toBe('subscription-1');
    expect(saved.status).toBe('canceled');
    expect(saved.isActive).toBe(false);
  });

  it('ignores a change older than the stored one', async () => {
    subscriptions.findByUserId = async () =>
      buildSubscription({ lastEventAt: new Date('2026-10-05T00:00:00.000Z') });

    await useCase.execute(change);

    expect(subscriptions.save).not.toHaveBeenCalled();
  });
});
