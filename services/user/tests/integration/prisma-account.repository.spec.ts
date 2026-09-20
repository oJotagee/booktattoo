import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { AccountEntity } from '@/domain/entities/account.entity';
import { AccountAlreadyLinkedError } from '@/domain/errors/account.error';
import { UserEntity, UserStatus } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';
import { PrismaAccountRepository } from '@/infrastructure/repository/prisma-account.repository';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

describe('PrismaAccountRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new PrismaAccountRepository(prismaService);
  const createdUserIds: string[] = [];

  async function createUser(): Promise<string> {
    const user = UserEntity.create({
      id: crypto.randomUUID(),
      name: 'Joao',
      email: Email.create({ value: `joao-${crypto.randomUUID()}@example.com` }),
      image: null,
      address: null,
      phone: null,
      bio: null,
      role: null,
      status: UserStatus.ACTIVE,
      times: [],
      stripeCustomerId: null,
    });

    await prismaService.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email.toString(),
        status: user.status,
      },
    });
    createdUserIds.push(user.id);

    return user.id;
  }

  function buildAccount(userId: string, overrides: Partial<{ providerAccountId: string }> = {}) {
    return AccountEntity.create({
      userId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: overrides.providerAccountId ?? `google-${crypto.randomUUID()}`,
      accessToken: 'access-token',
    });
  }

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdUserIds.length > 0) {
      await prismaService.user.deleteMany({ where: { id: { in: createdUserIds } } });
      createdUserIds.length = 0;
    }
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('create + findByProvider', () => {
    it('persists an account and rehydrates it from the database', async () => {
      const userId = await createUser();
      const account = buildAccount(userId);

      await repository.create(account);

      const found = await repository.findByProvider(account.provider, account.providerAccountId);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(AccountEntity);
      expect(found?.userId).toBe(userId);
      expect(found?.accessToken).toBe('access-token');
    });

    it('returns null when the account does not exist', async () => {
      const found = await repository.findByProvider('google', 'unknown-account');

      expect(found).toBeNull();
    });

    it('throws AccountAlreadyLinkedError when the provider account is already linked', async () => {
      const userId = await createUser();
      const account = buildAccount(userId, { providerAccountId: 'duplicate-account' });
      await repository.create(account);

      const duplicate = buildAccount(userId, { providerAccountId: 'duplicate-account' });

      await expect(repository.create(duplicate)).rejects.toThrow(AccountAlreadyLinkedError);
    });
  });

  describe('findByUserId', () => {
    it('lists every account linked to a user', async () => {
      const userId = await createUser();
      await repository.create(buildAccount(userId, { providerAccountId: 'account-1' }));
      await repository.create(buildAccount(userId, { providerAccountId: 'account-2' }));

      const found = await repository.findByUserId(userId);

      expect(found).toHaveLength(2);
    });

    it('returns an empty array when the user has no accounts', async () => {
      const userId = await createUser();

      const found = await repository.findByUserId(userId);

      expect(found).toEqual([]);
    });
  });

  describe('update', () => {
    it('persists refreshed tokens', async () => {
      const userId = await createUser();
      const account = buildAccount(userId);
      await repository.create(account);

      const refreshed = account.refreshTokens({ accessToken: 'new-access-token' });
      await repository.update(refreshed);

      const found = await repository.findByProvider(account.provider, account.providerAccountId);

      expect(found?.accessToken).toBe('new-access-token');
    });
  });
});
