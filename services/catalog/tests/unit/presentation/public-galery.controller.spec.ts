import { describe, expect, it, mock } from 'bun:test';

import { PublicGaleryController } from '@/presentation/controllers/public-galery.controller';
import { GaleryStyle } from '@/domain/entities/galery.entity';

describe('PublicGaleryController', () => {
  it('delegates listing galeries to FindPublicGaleriesUseCase with the filter', async () => {
    const findPublicGaleries = { execute: mock(async () => ({ list: [], pagination: {} })) };
    const controller = new PublicGaleryController(findPublicGaleries as never);

    await controller.findAll({
      limit: 20,
      offset: 40,
      userId: 'user-1',
      style: GaleryStyle.CHICANO,
    });

    expect(findPublicGaleries.execute).toHaveBeenCalledWith({
      limit: 20,
      offset: 40,
      userId: 'user-1',
      style: GaleryStyle.CHICANO,
    });
  });

  it('omits userId and style when they are not provided', async () => {
    const findPublicGaleries = { execute: mock(async () => ({ list: [], pagination: {} })) };
    const controller = new PublicGaleryController(findPublicGaleries as never);

    await controller.findAll({ limit: 20, offset: 40 });

    expect(findPublicGaleries.execute).toHaveBeenCalledWith({ limit: 20, offset: 40 });
  });
});
