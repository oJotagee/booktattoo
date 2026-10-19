import { Injectable } from '@nestjs/common';

import type { ConnectedAccountRepository } from '@/application/port/connected-account-repository.port';
import type { ConnectedAccountEntity } from '@/domain/entities/connected-account.entity';
import { ConnectedAccountMapper } from '../persistence/connected-account.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaConnectedAccountRepository implements ConnectedAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<ConnectedAccountEntity | null> {
    const account = await this.prisma.connectedAccount.findUnique({ where: { userId } });

    return account ? ConnectedAccountMapper.toDomain(account) : null;
  }

  async findByStripeAccountId(stripeAccountId: string): Promise<ConnectedAccountEntity | null> {
    const account = await this.prisma.connectedAccount.findUnique({ where: { stripeAccountId } });

    return account ? ConnectedAccountMapper.toDomain(account) : null;
  }

  async save(account: ConnectedAccountEntity): Promise<void> {
    const { userId, ...data } = ConnectedAccountMapper.toPersistence(account);

    await this.prisma.connectedAccount.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
