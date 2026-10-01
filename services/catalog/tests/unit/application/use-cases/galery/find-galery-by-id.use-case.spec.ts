import { beforeEach, describe, expect, it } from 'bun:test';

import { FindGaleryByIdUseCase } from '@/application/use-cases/galery/find-galery-by-id.use-case';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { createGaleryRepositoryMock } from '@tests/unit/support/mocks';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { buildGalery } from '@tests/unit/support/builders';

describe('FindGaleryByIdUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let useCase: FindGaleryByIdUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    useCase = new FindGaleryByIdUseCase(galeries);
  });

  it('returns the galery data when the galery exists', async () => {
    const galery = buildGalery({ id: 'galery-1' });
    galeries.findById = async () => galery;

    const result = await useCase.execute({ id: 'galery-1', userId: 'user-1' });

    expect(result).toEqual({
      id: galery.id,
      title: galery.title,
      imageUrl: galery.imageUrl,
      size: galery.size,
      price: galery.price,
      style: galery.style,
      available: galery.available,
      userId: galery.userId,
      serviceId: galery.serviceId,
      createdAt: galery.createdAt,
      updatedAt: galery.updatedAt,
    });
  });

  it('throws GaleryNotFoundError when the galery does not exist', async () => {
    galeries.findById = async () => null;

    await expect(useCase.execute({ id: 'missing-galery', userId: 'user-1' })).rejects.toThrow(
      GaleryNotFoundError,
    );
  });

  it('throws ForbiddenResourceAccessError when the galery belongs to another user', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1', userId: 'user-1' });

    await expect(useCase.execute({ id: 'galery-1', userId: 'user-2' })).rejects.toThrow(
      ForbiddenResourceAccessError,
    );
  });
});
