import { Inject, Injectable } from '@nestjs/common';

import type { SubscriptionRepository } from '../../port/subscription-repository.port';
import { SUBSCRIPTION_REPOSITORY } from '../../port/subscription-repository.port';
import type { SubscriptionPlan } from '@/domain/entities/subscription.entity';
import { SubscriptionNotFoundError } from '@/domain/errors/subscription.error';

type FindUserSubscriptionInput = {
  userId: string;
};

type FindUserSubscriptionOutput = {
  status: string;
  plan: SubscriptionPlan;
  active: boolean;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

@Injectable()
export class FindUserSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptions: SubscriptionRepository,
  ) {}

  async execute({ userId }: FindUserSubscriptionInput): Promise<FindUserSubscriptionOutput> {
    const subscription = await this.subscriptions.findByUserId(userId);
    if (!subscription) throw new SubscriptionNotFoundError();

    return {
      status: subscription.status,
      plan: subscription.plan,
      active: subscription.isActive,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }
}
