import { Inject, Injectable } from '@nestjs/common';

import type { SubscriptionRepository } from '../../port/subscription-repository.port';
import { SUBSCRIPTION_REPOSITORY } from '../../port/subscription-repository.port';
import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import type { SubscriptionPlan } from '@/domain/entities/subscription.entity';
import { UserNotFoundError } from '@/domain/errors/user.error';
import {
  type PlanAccessStatus,
  type PlanLimits,
  resolvePlanAccess,
} from '@/domain/plan/plan-access';

type GetUserPlanAccessInput = {
  userId: string;
};

type GetUserPlanAccessOutput = {
  status: PlanAccessStatus;
  plan: SubscriptionPlan | null;
  limits: PlanLimits | null;
  trialEndsAt: Date;
  trialDaysLeft: number;
  subscription: {
    status: string;
    plan: SubscriptionPlan;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  } | null;
};

@Injectable()
export class GetUserPlanAccessUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptions: SubscriptionRepository,
  ) {}

  async execute({ userId }: GetUserPlanAccessInput): Promise<GetUserPlanAccessOutput> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const subscription = await this.subscriptions.findByUserId(userId);
    const access = resolvePlanAccess({ userCreatedAt: user.createdAt, subscription });

    return {
      ...access,
      subscription: subscription
        ? {
            status: subscription.status,
            plan: subscription.plan,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
    };
  }
}
