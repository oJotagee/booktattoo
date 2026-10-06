import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateGaleryInfoUseCase } from '@/application/use-cases/galery/update-galery-info.use-case';
import {
  createCacheMock,
  createGaleryRepositoryMock,
  createServiceRepositoryMock,
} from '@tests/unit/support/mocks';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { buildGalery, buildService } from '@tests/unit/support/builders';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { GaleryStyle } from '@/domain/entities/galery.entity';

describe('UpdateGaleryInfoUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: UpdateGaleryInfoUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    services = createServiceRepositoryMock();
    cache = createCacheMock();
    useCase = new UpdateGaleryInfoUseCase(galeries, services, cache);
  });

  it('updates the info of an existing galery', async () => {
    const galery = buildGalery({ id: 'galery-1', title: 'Rosa' });
    galeries.findById = async () => galery;

    const result = await useCase.execute({
      galeryId: 'galery-1',
      userId: 'user-1',
      title: 'Caveira',
      style: GaleryStyle.BLACKWORK,
    });

    expect(result).toMatchObject({
      id: 'galery-1',
      title: 'Caveira',
      style: GaleryStyle.BLACKWORK,
      price: galery.price,
    });
    expect(galeries.update).toHaveBeenCalledTimes(1);
    expect(cache.invalidate).toHaveBeenCalledWith('catalog:public:galeries');
  });

  it('keeps existing fields untouched when not provided', async () => {
    const galery = buildGalery({ id: 'galery-1', title: 'Rosa', price: 35000 });
    galeries.findById = async () => galery;

    const result = await useCase.execute({ galeryId: 'galery-1', userId: 'user-1', size: '5x5cm' });

    expect(result.title).toBe('Rosa');
    expect(result.price).toBe(35000);
    expect(result.size).toBe('5x5cm');
    expect(result.imageUrl).toBe(galery.imageUrl);
  });

  it('moves the galery to another service of the same user', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1', serviceId: 'service-1' });
    services.findById = async () => buildService({ id: 'service-2', userId: 'user-1' });

    const result = await useCase.execute({
      galeryId: 'galery-1',
      userId: 'user-1',
      serviceId: 'service-2',
    });

    expect(result.serviceId).toBe('service-2');
  });

  it('throws ServiceNotFoundError when the new service does not exist', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1' });
    services.findById = async () => null;

    await expect(
      useCase.execute({ galeryId: 'galery-1', userId: 'user-1', serviceId: 'missing-service' }),
    ).rejects.toThrow(ServiceNotFoundError);
    expect(galeries.update).not.toHaveBeenCalled();
  });

  it('throws ForbiddenResourceAccessError when the new service belongs to another user', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1' });
    services.findById = async () => buildService({ id: 'service-2', userId: 'user-2' });

    await expect(
      useCase.execute({ galeryId: 'galery-1', userId: 'user-1', serviceId: 'service-2' }),
    ).rejects.toThrow(ForbiddenResourceAccessError);
    expect(galeries.update).not.toHaveBeenCalled();
  });

  it('throws GaleryNotFoundError when the galery does not exist', async () => {
    galeries.findById = async () => null;

    await expect(
      useCase.execute({ galeryId: 'missing-galery', userId: 'user-1', title: 'Caveira' }),
    ).rejects.toThrow(GaleryNotFoundError);
  });

  it('throws ForbiddenResourceAccessError when the galery belongs to another user', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1', userId: 'user-1' });

    await expect(
      useCase.execute({ galeryId: 'galery-1', userId: 'user-2', title: 'Caveira' }),
    ).rejects.toThrow(ForbiddenResourceAccessError);
    expect(galeries.update).not.toHaveBeenCalled();
  });
});
