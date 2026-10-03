import { beforeEach, describe, expect, it } from 'bun:test';

import { GetUserPlanAccessUseCase } from '@/application/use-cases/subscription/get-user-plan-access.use-case';
import {
  createSubscriptionRepositoryMock,
  createUserRepositoryMock,
} from '@tests/unit/support/mocks';
import { buildSubscription, buildUser } from '@tests/unit/support/builders';
import { SubscriptionPlan } from '@/domain/entities/subscription.entity';
import { PlanAccessStatus } from '@/domain/plan/plan-access';
import { UserNotFoundError } from '@/domain/errors/user.error';

describe('GetUserPlanAccessUseCase', () => {
  let users: ReturnType<typeof createUserRepositoryMock>;
  let subscriptions: ReturnType<typeof createSubscriptionRepositoryMock>;
  let useCase: GetUserPlanAccessUseCase;

  beforeEach(() => {
    users = createUserRepositoryMock();
    subscriptions = createSubscriptionRepositoryMock();
    useCase = new GetUserPlanAccessUseCase(users, subscriptions);
  });

  it('returns the trial access for a new user without subscription', async () => {
    users.findById = async () => buildUser();

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.status).toBe(PlanAccessStatus.TRIAL);
    expect(result.subscription).toBeNull();
  });

  it('returns the active plan with the subscription summary', async () => {
    users.findById = async () => buildUser();
    subscriptions.findByUserId = async () =>
      buildSubscription({ plan: SubscriptionPlan.PROFESSIONAL });

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.status).toBe(PlanAccessStatus.ACTIVE);
    expect(result.plan).toBe(SubscriptionPlan.PROFESSIONAL);
    expect(result.subscription).toEqual({
      status: 'active',
      plan: SubscriptionPlan.PROFESSIONAL,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });
  });

  it('throws UserNotFoundError when the user does not exist', async () => {
    await expect(useCase.execute({ userId: 'missing' })).rejects.toThrow(UserNotFoundError);
  });
});
