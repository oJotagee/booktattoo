import { beforeEach, describe, expect, it } from 'bun:test';

import {
  createGaleryRepositoryMock,
  createServiceRepositoryMock,
  createStorageMock,
} from '@tests/unit/support/mocks';
import { CreateGaleryUseCase } from '@/application/use-cases/galery/create-galery.use-case';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import { InvalidGaleryError } from '@/domain/errors/galery.error';
import { GaleryStyle } from '@/domain/entities/galery.entity';
import { buildService } from '@tests/unit/support/builders';

const input = {
  userId: 'user-1',
  serviceId: 'service-1',
  title: 'Rosa fineline',
  size: '10x15cm',
  price: 35000,
  style: GaleryStyle.FINELINE,
  image: {
    filename: 'rosa.png',
    contentType: 'image/png',
    body: Buffer.from('image'),
  },
};

describe('CreateGaleryUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let storage: ReturnType<typeof createStorageMock>;
  let useCase: CreateGaleryUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    services = createServiceRepositoryMock();
    storage = createStorageMock();
    useCase = new CreateGaleryUseCase(galeries, services, storage);

    services.findById = async () => buildService({ id: 'service-1', userId: 'user-1' });
  });

  it('creates a galery available by default using the uploaded image url', async () => {
    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      userId: 'user-1',
      serviceId: 'service-1',
      title: 'Rosa fineline',
      size: '10x15cm',
      price: 35000,
      style: GaleryStyle.FINELINE,
      available: true,
      imageUrl: 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/new-image.png',
    });
  });

  it('uploads the image to the gallery folder of the user', async () => {
    await useCase.execute(input);

    expect(storage.upload).toHaveBeenCalledWith({
      assetType: 'gallery',
      ownerId: 'user-1',
      filename: 'rosa.png',
      contentType: 'image/png',
      body: input.image.body,
    });
  });

  it('persists the created galery', async () => {
    await useCase.execute(input);

    expect(galeries.create).toHaveBeenCalledTimes(1);
  });

  it('throws ServiceNotFoundError when the service does not exist', async () => {
    services.findById = async () => null;

    await expect(useCase.execute(input)).rejects.toThrow(ServiceNotFoundError);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('throws ForbiddenResourceAccessError when the service belongs to another user', async () => {
    services.findById = async () => buildService({ id: 'service-1', userId: 'user-2' });

    await expect(useCase.execute(input)).rejects.toThrow(ForbiddenResourceAccessError);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('deletes the uploaded image when the galery is invalid', async () => {
    await expect(useCase.execute({ ...input, price: 0 })).rejects.toThrow(InvalidGaleryError);

    expect(storage.delete).toHaveBeenCalledWith('gallery/user-1/new-image.png');
    expect(galeries.create).not.toHaveBeenCalled();
  });

  it('deletes the uploaded image when persisting fails', async () => {
    galeries.create = async () => {
      throw new Error('database down');
    };

    await expect(useCase.execute(input)).rejects.toThrow('database down');

    expect(storage.delete).toHaveBeenCalledWith('gallery/user-1/new-image.png');
  });
});
