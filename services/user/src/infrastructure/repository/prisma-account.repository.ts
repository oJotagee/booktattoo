import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@generated/prisma/internal/prismaNamespace';

import { AccountEntity, AccountProvider } from '@/domain/entities/account.entity';
import { AccountAlreadyLinkedError } from '@/domain/errors/account.error';
import type { AccountRepository } from '@/application/port/account-repository.port';

import { PrismaService } from '../prisma/prisma.service';
import { AccountMapper } from '../persistence/account.mapper';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByProvider(
    provider: AccountProvider,
    providerAccountId: string,
  ): Promise<AccountEntity | null> {
    const account = await this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });

    return account ? AccountMapper.toDomain(account) : null;
  }

  async findByUserId(userId: string): Promise<AccountEntity[]> {
    const accounts = await this.prisma.account.findMany({ where: { userId } });

    return accounts.map(AccountMapper.toDomain);
  }

  async create(account: AccountEntity): Promise<void> {
    const data = AccountMapper.toPersistence(account);

    try {
      await this.prisma.account.create({ data });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new AccountAlreadyLinkedError(account.provider, account.providerAccountId);
      }
      throw error;
    }
  }

  async update(account: AccountEntity): Promise<void> {
    const data = AccountMapper.toPersistence(account);

    await this.prisma.account.update({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      data,
    });
  }
}
