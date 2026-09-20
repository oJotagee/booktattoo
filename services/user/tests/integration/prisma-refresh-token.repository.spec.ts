import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { RefreshTokenEntity } from '@/domain/entities/refresh-token.entity';
import { UserEntity, UserStatus } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';
import { PrismaRefreshTokenRepository } from '@/infrastructure/repository/prisma-refresh-token.repository';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

describe('PrismaRefreshTokenRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new PrismaRefreshTokenRepository(prismaService);
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

  function buildRefreshToken(userId: string, overrides: Partial<{ tokenHash: string }> = {}) {
    return RefreshTokenEntity.create({
      id: crypto.randomUUID(),
      userId,
      tokenHash: overrides.tokenHash ?? `hash:${crypto.randomUUID()}`,
      expiresAt: new Date(Date.now() + 60_000),
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

  describe('create + findByTokenHash', () => {
    it('persists a refresh token and rehydrates it from the database', async () => {
      const userId = await createUser();
      const token = buildRefreshToken(userId, { tokenHash: 'hash:token-1' });

      await repository.create(token);

      const found = await repository.findByTokenHash('hash:token-1');

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(RefreshTokenEntity);
      expect(found?.id).toBe(token.id);
      expect(found?.userId).toBe(userId);
      expect(found?.revokedAt).toBeNull();
    });

    it('returns null when the token hash does not exist', async () => {
      const found = await repository.findByTokenHash('unknown-hash');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('persists the revoked timestamp', async () => {
      const userId = await createUser();
      const token = buildRefreshToken(userId, { tokenHash: 'hash:token-revoke' });
      await repository.create(token);

      await repository.update(token.revoke());

      const found = await repository.findByTokenHash('hash:token-revoke');

      expect(found?.revokedAt).toBeInstanceOf(Date);
      expect(found?.isRevoked).toBe(true);
    });
  });
});
