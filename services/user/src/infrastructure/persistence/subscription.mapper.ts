import type { SubscriptionModel as PrismaSubscription } from '@generated/prisma/models';

import { SubscriptionEntity, type SubscriptionPlan } from '@/domain/entities/subscription.entity';

export class SubscriptionMapper {
  static toDomain(subscription: PrismaSubscription): SubscriptionEntity {
    return SubscriptionEntity.restore({
      id: subscription.id,
      userId: subscription.userId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
      plan: subscription.plan as SubscriptionPlan,
      priceId: subscription.priceId,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      lastEventAt: subscription.lastEventAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    });
  }

  static toPersistence(subscription: SubscriptionEntity): PrismaSubscription {
    return {
      id: subscription.id,
      userId: subscription.userId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      status: subscription.status,
      plan: subscription.plan,
      priceId: subscription.priceId,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      lastEventAt: subscription.lastEventAt,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
