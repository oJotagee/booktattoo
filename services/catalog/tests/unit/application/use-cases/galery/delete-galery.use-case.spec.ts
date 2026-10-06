import { beforeEach, describe, expect, it } from 'bun:test';

import {
  createCacheMock,
  createGaleryRepositoryMock,
  createStorageMock,
} from '@tests/unit/support/mocks';
import { DeleteGaleryUseCase } from '@/application/use-cases/galery/delete-galery.use-case';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { buildGalery } from '@tests/unit/support/builders';

describe('DeleteGaleryUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let storage: ReturnType<typeof createStorageMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: DeleteGaleryUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    storage = createStorageMock();
    cache = createCacheMock();
    useCase = new DeleteGaleryUseCase(galeries, storage, cache);
  });

  it('deletes the galery and its image from storage', async () => {
    galeries.findById = async () =>
      buildGalery({
        id: 'galery-1',
        imageUrl: 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/rosa.png',
      });

    await useCase.execute({ id: 'galery-1', userId: 'user-1' });

    expect(galeries.delete).toHaveBeenCalledWith('galery-1');
    expect(storage.delete).toHaveBeenCalledWith('gallery/user-1/rosa.png');
    expect(cache.invalidate).toHaveBeenCalledWith('catalog:public:galeries');
  });

  it('still succeeds when deleting the image from storage fails', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1' });
    storage.delete = async () => {
      throw new Error('storage down');
    };

    await expect(useCase.execute({ id: 'galery-1', userId: 'user-1' })).resolves.toBeUndefined();
    expect(galeries.delete).toHaveBeenCalledWith('galery-1');
  });

  it('throws GaleryNotFoundError when the galery does not exist', async () => {
    galeries.findById = async () => null;

    await expect(useCase.execute({ id: 'missing-galery', userId: 'user-1' })).rejects.toThrow(
      GaleryNotFoundError,
    );
    expect(galeries.delete).not.toHaveBeenCalled();
  });

  it('throws ForbiddenResourceAccessError when the galery belongs to another user', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1', userId: 'user-1' });

    await expect(useCase.execute({ id: 'galery-1', userId: 'user-2' })).rejects.toThrow(
      ForbiddenResourceAccessError,
    );
    expect(galeries.delete).not.toHaveBeenCalled();
    expect(storage.delete).not.toHaveBeenCalled();
  });
});
