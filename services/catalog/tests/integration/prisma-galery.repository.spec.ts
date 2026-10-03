import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { config } from 'dotenv';

config({ path: `${import.meta.dir}/../../.env` });

import { GaleryEntity, GaleryStyle } from '@/domain/entities/galery.entity';
import { ServiceEntity } from '@/domain/entities/service.entity';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { PrismaGaleryRepository } from '@/infrastructure/repository/prisma-galery.repository';
import { PrismaServiceRepository } from '@/infrastructure/repository/prisma-service.repository';

describe('PrismaGaleryRepository (integration)', () => {
  const prismaService = new PrismaService();
  const repository = new PrismaGaleryRepository(prismaService);
  const serviceRepository = new PrismaServiceRepository(prismaService);
  const createdGaleryIds: string[] = [];
  const createdServiceIds: string[] = [];

  async function createService(userId: string) {
    const service = ServiceEntity.create({
      id: crypto.randomUUID(),
      name: 'Tatuagem Fineline',
      duration: 60,
      depositAmount: 5000,
      userId,
    });
    createdServiceIds.push(service.id);
    await serviceRepository.create(service);

    return service;
  }

  function buildGalery(
    overrides: Partial<{
      id: string;
      title: string;
      imageUrl: string;
      size: string;
      price: number;
      style: GaleryStyle;
      userId: string;
      serviceId: string;
    }>,
  ) {
    const galery = GaleryEntity.create({
      id: overrides.id ?? crypto.randomUUID(),
      title: overrides.title ?? 'Rosa fineline',
      imageUrl:
        overrides.imageUrl ?? 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/rosa.png',
      size: overrides.size ?? '10x15cm',
      price: overrides.price ?? 35000,
      style: overrides.style ?? GaleryStyle.FINELINE,
      userId: overrides.userId!,
      serviceId: overrides.serviceId!,
    });
    createdGaleryIds.push(galery.id);

    return galery;
  }

  beforeAll(async () => {
    await prismaService.onModuleInit();
  });

  afterEach(async () => {
    if (createdGaleryIds.length > 0) {
      await prismaService.galery.deleteMany({ where: { id: { in: createdGaleryIds } } });
      createdGaleryIds.length = 0;
    }

    if (createdServiceIds.length > 0) {
      await prismaService.service.deleteMany({ where: { id: { in: createdServiceIds } } });
      createdServiceIds.length = 0;
    }
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
  });

  describe('create + findById', () => {
    it('persists a galery and rehydrates it from the database', async () => {
      const user = { id: crypto.randomUUID() };
      const service = await createService(user.id);
      const galery = buildGalery({ userId: user.id, serviceId: service.id });

      await repository.create(galery);

      const found = await repository.findById(galery.id);

      expect(found).not.toBeNull();
      expect(found).toBeInstanceOf(GaleryEntity);
      expect(found?.id).toBe(galery.id);
      expect(found?.title).toBe(galery.title);
      expect(found?.imageUrl).toBe(galery.imageUrl);
      expect(found?.size).toBe(galery.size);
      expect(found?.price).toBe(galery.price);
      expect(found?.style).toBe(GaleryStyle.FINELINE);
      expect(found?.userId).toBe(user.id);
      expect(found?.serviceId).toBe(service.id);
      expect(found?.available).toBe(true);
    });

    it('returns null when the id does not exist', async () => {
      const found = await repository.findById(crypto.randomUUID());

      expect(found).toBeNull();
    });
  });

  describe('countByUserId', () => {
    it('counts only the galeries of the user', async () => {
      const user = { id: crypto.randomUUID() };
      const service = await createService(user.id);
      await repository.create(buildGalery({ userId: user.id, serviceId: service.id }));
      await repository.create(buildGalery({ userId: user.id, serviceId: service.id }));

      expect(await repository.countByUserId(user.id)).toBe(2);
      expect(await repository.countByUserId(crypto.randomUUID())).toBe(0);
    });
  });

  describe('findByUserId', () => {
    it('finds all galeries belonging to a user', async () => {
      const user = { id: crypto.randomUUID() };
      const service = await createService(user.id);
      const galeryA = buildGalery({ userId: user.id, serviceId: service.id, title: 'Rosa' });
      const galeryB = buildGalery({ userId: user.id, serviceId: service.id, title: 'Caveira' });
      await repository.create(galeryA);
      await repository.create(galeryB);

      const found = await repository.findByUserId({ userId: user.id, limit: 10, offset: 0 });

      expect(found.items).toHaveLength(2);
      expect(found.total).toBe(2);
      expect(found.items.map((galery) => galery.id).sort()).toEqual(
        [galeryA.id, galeryB.id].sort(),
      );
    });

    it('returns an empty page when the user has no galeries', async () => {
      const user = { id: crypto.randomUUID() };

      const found = await repository.findByUserId({ userId: user.id, limit: 10, offset: 0 });

      expect(found.items).toEqual([]);
      expect(found.total).toBe(0);
    });

    it('respects limit and offset', async () => {
      const user = { id: crypto.randomUUID() };
      const service = await createService(user.id);
      await repository.create(buildGalery({ userId: user.id, serviceId: service.id }));
      await repository.create(buildGalery({ userId: user.id, serviceId: service.id }));

      const found = await repository.findByUserId({ userId: user.id, limit: 1, offset: 1 });

      expect(found.items).toHaveLength(1);
      expect(found.total).toBe(2);
    });

    it('filters by style', async () => {
      const user = { id: crypto.randomUUID() };
      const service = await createService(user.id);
      const blackwork = buildGalery({
        userId: user.id,
        serviceId: service.id,
        style: GaleryStyle.BLACKWORK,
      });
      await repository.create(blackwork);
      await repository.create(
        buildGalery({ userId: user.id, serviceId: service.id, style: GaleryStyle.FINELINE }),
      );

      const found = await repository.findByUserId({
        userId: user.id,
        limit: 10,
        offset: 0,
        style: GaleryStyle.BLACKWORK,
      });

      expect(found.items.map((galery) => galery.id)).toEqual([blackwork.id]);
      expect(found.total).toBe(1);
    });
  });

  describe('update', () => {
    it('persists changes made to the galery', async () => {
      const user = { id: crypto.randomUUID() };
      const service = await createService(user.id);
      const galery = buildGalery({ userId: user.id, serviceId: service.id });
      await repository.create(galery);

      const updated = galery
        .update({ title: 'Caveira', style: GaleryStyle.BLACKWORK })
        .updateImage('https://bookink-assets.s3.amazonaws.com/gallery/user-1/caveira.png');
      await repository.update(updated);

      const found = await repository.findById(galery.id);

      expect(found?.title).toBe('Caveira');
      expect(found?.style).toBe(GaleryStyle.BLACKWORK);
      expect(found?.imageUrl).toBe(
        'https://bookink-assets.s3.amazonaws.com/gallery/user-1/caveira.png',
      );
    });

    it('persists availability transitions', async () => {
      const user = { id: crypto.randomUUID() };
      const service = await createService(user.id);
      const galery = buildGalery({ userId: user.id, serviceId: service.id });
      await repository.create(galery);

      await repository.update(galery.deactivate());

      const found = await repository.findById(galery.id);

      expect(found?.available).toBe(false);
    });
  });

  describe('delete', () => {
    it('removes the galery from the database', async () => {
      const user = { id: crypto.randomUUID() };
      const service = await createService(user.id);
      const galery = buildGalery({ userId: user.id, serviceId: service.id });
      await repository.create(galery);

      await repository.delete(galery.id);

      const found = await repository.findById(galery.id);

      expect(found).toBeNull();
    });
  });
});
