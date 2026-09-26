import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { ServiceEntity } from '@/domain/entities/service.entity';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { PrismaServiceRepository } from '@/infrastructure/repository/prisma-service.repository';

describe('PrismaServiceRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new PrismaServiceRepository(prismaService);
  const createdServiceIds: string[] = [];

  function buildService(
    overrides: Partial<{
      id: string;
      name: string;
      duration: number;
      depositAmount: number;
      userId: string;
    }>,
  ) {
    const service = ServiceEntity.create({
      id: overrides.id ?? crypto.randomUUID(),
      name: overrides.name ?? 'Tatuagem Fineline',
      duration: overrides.duration ?? 60,
      depositAmount: overrides.depositAmount ?? 5000,
      userId: overrides.userId!,
    });
    createdServiceIds.push(service.id);

    return service;
  }

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdServiceIds.length > 0) {
      await prismaService.service.deleteMany({ where: { id: { in: createdServiceIds } } });
      createdServiceIds.length = 0;
    }
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('create + findById', () => {
    it('persists a service and rehydrates it from the database', async () => {
      const user = { id: crypto.randomUUID() };
      const service = buildService({ userId: user.id });

      await repository.create(service);

      const found = await repository.findById(service.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(ServiceEntity);
      expect(found?.id).toBe(service.id);
      expect(found?.name).toBe(service.name);
      expect(found?.duration).toBe(service.duration);
      expect(found?.depositAmount).toBe(service.depositAmount);
      expect(found?.userId).toBe(user.id);
      expect(found?.status).toBe(true);
    });

    it('returns null when the id does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('finds all services belonging to a user', async () => {
      const user = { id: crypto.randomUUID() };
      const serviceA = buildService({ userId: user.id, name: 'Fineline' });
      const serviceB = buildService({ userId: user.id, name: 'Blackwork' });
      await repository.create(serviceA);
      await repository.create(serviceB);

      const found = await repository.findByUserId({ userId: user.id, limit: 10, offset: 0 });

      expect(found.items).toHaveLength(2);
      expect(found.total).toBe(2);
      expect(found.items.map((service) => service.id).sort()).toEqual(
        [serviceA.id, serviceB.id].sort(),
      );
    });

    it('returns an empty page when the user has no services', async () => {
      const user = { id: crypto.randomUUID() };

      const found = await repository.findByUserId({ userId: user.id, limit: 10, offset: 0 });

      expect(found.items).toEqual([]);
      expect(found.total).toBe(0);
    });

    it('respects limit and offset', async () => {
      const user = { id: crypto.randomUUID() };
      const serviceA = buildService({ userId: user.id, name: 'Fineline' });
      const serviceB = buildService({ userId: user.id, name: 'Blackwork' });
      await repository.create(serviceA);
      await repository.create(serviceB);

      const found = await repository.findByUserId({ userId: user.id, limit: 1, offset: 1 });

      expect(found.items).toHaveLength(1);
      expect(found.total).toBe(2);
    });
  });

  describe('update', () => {
    it('persists changes made to the service', async () => {
      const user = { id: crypto.randomUUID() };
      const service = buildService({ userId: user.id });
      await repository.create(service);

      const updated = service.updateInfo({ name: 'Blackwork', duration: 90 });
      await repository.update(updated);

      const found = await repository.findById(service.id);

      expect(found?.name).toBe('Blackwork');
      expect(found?.duration).toBe(90);
    });

    it('persists status transitions', async () => {
      const user = { id: crypto.randomUUID() };
      const service = buildService({ userId: user.id });
      await repository.create(service);

      await repository.update(service.deactivate());

      const found = await repository.findById(service.id);

      expect(found?.status).toBe(false);
    });
  });
});
