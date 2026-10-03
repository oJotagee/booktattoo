import { Inject, Injectable } from '@nestjs/common';

import type { SubscriptionRepository } from '../../port/subscription-repository.port';
import { SUBSCRIPTION_REPOSITORY } from '../../port/subscription-repository.port';
import { type SubscriptionChange, SubscriptionEntity } from '@/domain/entities/subscription.entity';

type SyncSubscriptionInput = SubscriptionChange & {
  userId: string;
};

@Injectable()
export class SyncSubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptions: SubscriptionRepository,
  ) {}

  async execute({ userId, ...change }: SyncSubscriptionInput): Promise<void> {
    const current = await this.subscriptions.findByUserId(userId);

    if (!current) {
      await this.subscriptions.save(
        SubscriptionEntity.create({ id: crypto.randomUUID(), userId, ...change }),
      );
      return;
    }

    if (!current.isOutdatedBy(change.occurredAt)) return;

    await this.subscriptions.save(current.applyChange(change));
  }
}
