import { describe, expect, it, mock } from 'bun:test';

import { PublicServiceController } from '@/presentation/controllers/public-service.controller';

describe('PublicServiceController', () => {
  it('delegates listing services to FindPublicServicesUseCase with the filter', async () => {
    const findPublicServices = { execute: mock(async () => ({ list: [], pagination: {} })) };
    const controller = new PublicServiceController(findPublicServices as never);

    await controller.findAll({ limit: 20, offset: 40, userId: 'user-1' });

    expect(findPublicServices.execute).toHaveBeenCalledWith({
      limit: 20,
      offset: 40,
      userId: 'user-1',
    });
  });

  it('omits userId when it is not provided', async () => {
    const findPublicServices = { execute: mock(async () => ({ list: [], pagination: {} })) };
    const controller = new PublicServiceController(findPublicServices as never);

    await controller.findAll({ limit: 20, offset: 40 });

    expect(findPublicServices.execute).toHaveBeenCalledWith({ limit: 20, offset: 40 });
  });
});
