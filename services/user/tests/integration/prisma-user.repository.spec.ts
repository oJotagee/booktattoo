import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { UserEntity, UserStatus } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';
import { PrismaUserRepository } from '@/infrastructure/repository/prisma-user.repository';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

describe('PrismaUserRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new PrismaUserRepository(prismaService);
  const createdIds: string[] = [];

  function buildUser(overrides: Partial<{ id: string; email: string; name: string }> = {}) {
    const user = UserEntity.create({
      id: overrides.id ?? crypto.randomUUID(),
      name: overrides.name ?? 'Joao',
      email: Email.create({ value: overrides.email ?? `joao-${crypto.randomUUID()}@example.com` }),
      image: null,
      address: null,
      phone: null,
      bio: null,
      role: null,
      status: UserStatus.ACTIVE,
      times: [],
      stripeCustomerId: null,
      password: 'hashed-password',
    });
    createdIds.push(user.id);

    return user;
  }

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdIds.length > 0) {
      await prismaService.user.deleteMany({ where: { id: { in: createdIds } } });
      createdIds.length = 0;
    }
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('create + findById', () => {
    it('persists a user and rehydrates it from the database', async () => {
      const user = buildUser();

      await repository.create(user);

      const found = await repository.findById(user.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(UserEntity);
      expect(found?.id).toBe(user.id);
      expect(found?.email.toString()).toBe(user.email.toString());
      expect(found?.status).toBe(UserStatus.ACTIVE);
    });

    it('returns null when the id does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('finds a persisted user by email', async () => {
      const user = buildUser({ email: `find-me-${crypto.randomUUID()}@example.com` });
      await repository.create(user);

      const found = await repository.findByEmail(user.email.toString());

      expect(found?.id).toBe(user.id);
    });

    it('returns null when the email does not exist', async () => {
      const found = await repository.findByEmail(`missing-${crypto.randomUUID()}@example.com`);

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('persists changes made to the user', async () => {
      const user = buildUser();
      await repository.create(user);

      const updated = user.updateContactInfo({ name: 'Joao Updated', phone: '+55 11 99999-0000' });
      await repository.update(updated);

      const found = await repository.findById(user.id);

      expect(found?.name).toBe('Joao Updated');
      expect(found?.phone).toBe('+55 11 99999-0000');
    });

    it('persists status transitions', async () => {
      const user = buildUser();
      await repository.create(user);

      await repository.update(user.deactivate());

      const found = await repository.findById(user.id);

      expect(found?.status).toBe(UserStatus.INACTIVE);
    });
  });
});
