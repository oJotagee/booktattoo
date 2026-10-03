import { Injectable } from '@nestjs/common';

import type { SubscriptionRepository } from '@/application/port/subscription-repository.port';
import type { SubscriptionEntity } from '@/domain/entities/subscription.entity';
import { SubscriptionMapper } from '../persistence/subscription.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<SubscriptionEntity | null> {
    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });

    return subscription ? SubscriptionMapper.toDomain(subscription) : null;
  }

  async save(subscription: SubscriptionEntity): Promise<void> {
    const { id, userId, createdAt, ...changes } = SubscriptionMapper.toPersistence(subscription);

    await this.prisma.subscription.upsert({
      where: { userId },
      create: { id, userId, createdAt, ...changes },
      update: changes,
    });
  }
}
