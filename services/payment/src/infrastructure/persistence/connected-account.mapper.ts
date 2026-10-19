import type { ConnectedAccountModel as PrismaConnectedAccount } from '@generated/prisma/models';

import { ConnectedAccountEntity } from '@/domain/entities/connected-account.entity';

export class ConnectedAccountMapper {
  static toDomain(account: PrismaConnectedAccount): ConnectedAccountEntity {
    return ConnectedAccountEntity.restore({
      userId: account.userId,
      stripeAccountId: account.stripeAccountId,
      chargesEnabled: account.chargesEnabled,
      payoutsEnabled: account.payoutsEnabled,
      detailsSubmitted: account.detailsSubmitted,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    });
  }

  static toPersistence(account: ConnectedAccountEntity): PrismaConnectedAccount {
    return {
      userId: account.userId,
      stripeAccountId: account.stripeAccountId,
      chargesEnabled: account.chargesEnabled,
      payoutsEnabled: account.payoutsEnabled,
      detailsSubmitted: account.detailsSubmitted,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
