import type { SubscriptionEntity } from '@/domain/entities/subscription.entity';

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface SubscriptionRepository {
  findByUserId(userId: string): Promise<SubscriptionEntity | null>;
  save(subscription: SubscriptionEntity): Promise<void>;
}
