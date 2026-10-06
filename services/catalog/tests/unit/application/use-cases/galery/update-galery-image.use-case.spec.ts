import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateGaleryImageUseCase } from '@/application/use-cases/galery/update-galery-image.use-case';
import {
  createCacheMock,
  createGaleryRepositoryMock,
  createStorageMock,
} from '@tests/unit/support/mocks';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { buildGalery } from '@tests/unit/support/builders';

const image = {
  filename: 'caveira.png',
  contentType: 'image/png',
  body: Buffer.from('image'),
};

describe('UpdateGaleryImageUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let storage: ReturnType<typeof createStorageMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: UpdateGaleryImageUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    storage = createStorageMock();
    cache = createCacheMock();
    useCase = new UpdateGaleryImageUseCase(galeries, storage, cache);
  });

  it('uploads the new image and updates the galery image url', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1' });

    const result = await useCase.execute({ galeryId: 'galery-1', userId: 'user-1', ...image });

    expect(storage.upload).toHaveBeenCalledWith({
      assetType: 'gallery',
      ownerId: 'user-1',
      ...image,
    });
    expect(result).toMatchObject({
      id: 'galery-1',
      imageUrl: 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/new-image.png',
    });
    expect(galeries.update).toHaveBeenCalledTimes(1);
    expect(cache.invalidate).toHaveBeenCalledWith('catalog:public:galeries');
  });

  it('deletes the previous image from storage', async () => {
    galeries.findById = async () =>
      buildGalery({
        id: 'galery-1',
        imageUrl: 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/old.png',
      });

    await useCase.execute({ galeryId: 'galery-1', userId: 'user-1', ...image });

    expect(storage.delete).toHaveBeenCalledWith('gallery/user-1/old.png');
  });

  it('does not delete anything when the previous url is not a gallery asset', async () => {
    galeries.findById = async () =>
      buildGalery({ id: 'galery-1', imageUrl: 'https://cdn.example.com/other/old.png' });

    await useCase.execute({ galeryId: 'galery-1', userId: 'user-1', ...image });

    expect(storage.delete).not.toHaveBeenCalled();
  });

  it('still succeeds when deleting the previous image fails', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1' });
    storage.delete = async () => {
      throw new Error('storage down');
    };

    const result = await useCase.execute({ galeryId: 'galery-1', userId: 'user-1', ...image });

    expect(result.id).toBe('galery-1');
  });

  it('throws GaleryNotFoundError when the galery does not exist', async () => {
    galeries.findById = async () => null;

    await expect(
      useCase.execute({ galeryId: 'missing-galery', userId: 'user-1', ...image }),
    ).rejects.toThrow(GaleryNotFoundError);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('throws ForbiddenResourceAccessError when the galery belongs to another user', async () => {
    galeries.findById = async () => buildGalery({ id: 'galery-1', userId: 'user-1' });

    await expect(
      useCase.execute({ galeryId: 'galery-1', userId: 'user-2', ...image }),
    ).rejects.toThrow(ForbiddenResourceAccessError);
    expect(storage.upload).not.toHaveBeenCalled();
    expect(galeries.update).not.toHaveBeenCalled();
  });
});
