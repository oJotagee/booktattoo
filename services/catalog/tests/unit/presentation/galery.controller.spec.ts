import { describe, expect, it, mock } from 'bun:test';

import { UnsupportedGaleryImageTypeError } from '@/domain/errors/galery.error';
import { GaleryController } from '@/presentation/controllers/galery.controller';
import { GaleryStyle } from '@/domain/entities/galery.entity';
import type { SessionPayload } from '@bookink/shared/auth';

function buildController() {
  const createGalery = { execute: mock(async () => ({ id: 'galery-1' })) };
  const findGaleryById = { execute: mock(async () => ({ id: 'galery-1' })) };
  const findGaleriesByUser = {
    execute: mock(async () => ({
      list: [{ id: 'galery-1' }],
      pagination: { total: 1, page: 1, perPage: 10, totalPages: 1 },
    })),
  };
  const updateGaleryInfo = { execute: mock(async () => ({ id: 'galery-1' })) };
  const updateGaleryImage = { execute: mock(async () => ({ id: 'galery-1' })) };
  const updateGaleryAvailability = {
    execute: mock(async () => ({ id: 'galery-1', available: true })),
  };
  const deleteGalery = { execute: mock(async () => undefined) };

  const controller = new GaleryController(
    createGalery as never,
    findGaleryById as never,
    findGaleriesByUser as never,
    updateGaleryInfo as never,
    updateGaleryImage as never,
    updateGaleryAvailability as never,
    deleteGalery as never,
  );

  return {
    controller,
    createGalery,
    findGaleryById,
    findGaleriesByUser,
    updateGaleryInfo,
    updateGaleryImage,
    updateGaleryAvailability,
    deleteGalery,
  };
}

function buildFile(mimetype = 'image/png') {
  return {
    originalname: 'rosa.png',
    mimetype,
    buffer: Buffer.from('image'),
  } as Express.Multer.File;
}

const payload: SessionPayload = { sub: 'user-1', email: 'john.doe@example.com' };

describe('GaleryController', () => {
  it('delegates listing the user galeries to FindGaleriesByUserUseCase', async () => {
    const { controller, findGaleriesByUser } = buildController();

    await controller.findMine(payload, { limit: 5, offset: 10 });

    expect(findGaleriesByUser.execute).toHaveBeenCalledWith({
      userId: payload.sub,
      limit: 5,
      offset: 10,
    });
  });

  it('forwards the style filter when listing the user galeries', async () => {
    const { controller, findGaleriesByUser } = buildController();

    await controller.findMine(payload, { limit: 5, offset: 0, style: GaleryStyle.JAPONES });

    expect(findGaleriesByUser.execute).toHaveBeenCalledWith({
      userId: payload.sub,
      limit: 5,
      offset: 0,
      style: GaleryStyle.JAPONES,
    });
  });

  it('delegates fetching a galery by id to FindGaleryByIdUseCase', async () => {
    const { controller, findGaleryById } = buildController();

    await controller.findById('galery-1', payload);

    expect(findGaleryById.execute).toHaveBeenCalledWith({ id: 'galery-1', userId: payload.sub });
  });

  it('delegates creating a galery with its image to CreateGaleryUseCase', async () => {
    const { controller, createGalery } = buildController();
    const body = {
      title: 'Rosa fineline',
      size: '10x15cm',
      price: 35000,
      style: GaleryStyle.FINELINE,
      serviceId: 'service-1',
      file: undefined,
    };
    const file = buildFile();

    await controller.create(payload, body, file, 'Bearer access-token');

    expect(createGalery.execute).toHaveBeenCalledWith({
      userId: payload.sub,
      authorization: 'Bearer access-token',
      serviceId: 'service-1',
      title: 'Rosa fineline',
      size: '10x15cm',
      price: 35000,
      style: GaleryStyle.FINELINE,
      image: {
        filename: file.originalname,
        contentType: file.mimetype,
        body: file.buffer,
      },
    });
  });

  it('rejects creating a galery with an unsupported image type', () => {
    const { controller, createGalery } = buildController();
    const body = {
      title: 'Rosa fineline',
      size: '10x15cm',
      price: 35000,
      style: GaleryStyle.FINELINE,
      serviceId: 'service-1',
      file: undefined,
    };

    expect(() =>
      controller.create(payload, body, buildFile('application/pdf'), 'Bearer access-token'),
    ).toThrow(UnsupportedGaleryImageTypeError);
    expect(createGalery.execute).not.toHaveBeenCalled();
  });

  it('delegates updating a galery to UpdateGaleryInfoUseCase', async () => {
    const { controller, updateGaleryInfo } = buildController();
    const body = { title: 'Caveira' };

    await controller.update(payload, 'galery-1', body);

    expect(updateGaleryInfo.execute).toHaveBeenCalledWith({
      galeryId: 'galery-1',
      userId: payload.sub,
      ...body,
    });
  });

  it('delegates updating the image to UpdateGaleryImageUseCase', async () => {
    const { controller, updateGaleryImage } = buildController();
    const file = buildFile('image/webp');

    await controller.updateImage(payload, 'galery-1', file);

    expect(updateGaleryImage.execute).toHaveBeenCalledWith({
      galeryId: 'galery-1',
      userId: payload.sub,
      filename: file.originalname,
      contentType: file.mimetype,
      body: file.buffer,
    });
  });

  it('rejects updating the image with an unsupported type', () => {
    const { controller, updateGaleryImage } = buildController();

    expect(() => controller.updateImage(payload, 'galery-1', buildFile('image/gif'))).toThrow(
      UnsupportedGaleryImageTypeError,
    );
    expect(updateGaleryImage.execute).not.toHaveBeenCalled();
  });

  it('delegates updating the availability to UpdateGaleryAvailabilityUseCase', async () => {
    const { controller, updateGaleryAvailability } = buildController();
    const body = { available: false };

    await controller.updateAvailability('galery-1', body, payload);

    expect(updateGaleryAvailability.execute).toHaveBeenCalledWith({
      galeryId: 'galery-1',
      available: body.available,
      userId: payload.sub,
    });
  });

  it('delegates deleting a galery to DeleteGaleryUseCase', async () => {
    const { controller, deleteGalery } = buildController();

    await controller.delete('galery-1', payload);

    expect(deleteGalery.execute).toHaveBeenCalledWith({ id: 'galery-1', userId: payload.sub });
  });
});
