import { describe, expect, it } from 'bun:test';

import { SubscriptionPlan } from '@/domain/entities/subscription.entity';
import { PlanAccessStatus, resolvePlanAccess } from '@/domain/plan/plan-access';
import { buildSubscription } from '@tests/unit/support/builders';

const userCreatedAt = new Date('2026-10-01T12:00:00.000Z');

describe('resolvePlanAccess', () => {
  it('grants the trial with professional limits during the first 7 days', () => {
    const access = resolvePlanAccess({
      userCreatedAt,
      subscription: null,
      now: new Date('2026-10-03T12:00:00.000Z'),
    });

    expect(access.status).toBe(PlanAccessStatus.TRIAL);
    expect(access.plan).toBeNull();
    expect(access.limits).toEqual({ services: 20, galeries: 50 });
    expect(access.trialEndsAt).toEqual(new Date('2026-10-08T12:00:00.000Z'));
    expect(access.trialDaysLeft).toBe(5);
  });

  it('expires the access after the trial without a subscription', () => {
    const access = resolvePlanAccess({
      userCreatedAt,
      subscription: null,
      now: new Date('2026-10-08T12:00:01.000Z'),
    });

    expect(access.status).toBe(PlanAccessStatus.EXPIRED);
    expect(access.limits).toBeNull();
    expect(access.trialDaysLeft).toBe(0);
  });

  it('uses the basic limits for an active basic subscription', () => {
    const access = resolvePlanAccess({
      userCreatedAt,
      subscription: buildSubscription({ plan: SubscriptionPlan.BASIC }),
      now: new Date('2026-12-01T00:00:00.000Z'),
    });

    expect(access.status).toBe(PlanAccessStatus.ACTIVE);
    expect(access.plan).toBe(SubscriptionPlan.BASIC);
    expect(access.limits).toEqual({ services: 3, galeries: 5 });
  });

  it('uses the professional limits for an active professional subscription', () => {
    const access = resolvePlanAccess({
      userCreatedAt,
      subscription: buildSubscription({ plan: SubscriptionPlan.PROFESSIONAL }),
    });

    expect(access.limits).toEqual({ services: 20, galeries: 50 });
  });

  it('falls back to the trial rules when the subscription is canceled', () => {
    const access = resolvePlanAccess({
      userCreatedAt,
      subscription: buildSubscription({ status: 'canceled' }),
      now: new Date('2026-12-01T00:00:00.000Z'),
    });

    expect(access.status).toBe(PlanAccessStatus.EXPIRED);
  });
});
