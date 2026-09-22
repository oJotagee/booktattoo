import { describe, expect, it, mock } from 'bun:test';

import type { PayloadSession } from '@/application/port/session-token-issuer.port';
import { ServiceController } from '@/presentation/controllers/service.controller';

function buildController() {
  const createService = { execute: mock(async () => ({ id: 'service-1' })) };
  const findServiceById = { execute: mock(async () => ({ id: 'service-1' })) };
  const findServicesByUser = {
    execute: mock(async () => ({
      list: [{ id: 'service-1' }],
      pagination: { total: 1, page: 1, perPage: 10, totalPages: 1 },
    })),
  };
  const updateServiceInfo = { execute: mock(async () => ({ id: 'service-1' })) };
  const updateServiceStatus = { execute: mock(async () => ({ id: 'service-1', status: true })) };

  const controller = new ServiceController(
    createService as never,
    findServiceById as never,
    findServicesByUser as never,
    updateServiceInfo as never,
    updateServiceStatus as never,
  );

  return {
    controller,
    createService,
    findServiceById,
    findServicesByUser,
    updateServiceInfo,
    updateServiceStatus,
  };
}

const payload: PayloadSession = { sub: 'user-1', email: 'john.doe@example.com' };

describe('ServiceController', () => {
  it('delegates listing the user services to FindServicesByUserUseCase', async () => {
    const { controller, findServicesByUser } = buildController();

    await controller.findMine(payload, { limit: 5, offset: 10 });

    expect(findServicesByUser.execute).toHaveBeenCalledWith({
      userId: payload.sub,
      limit: 5,
      offset: 10,
    });
  });

  it('delegates fetching a service by id to FindServiceByIdUseCase', async () => {
    const { controller, findServiceById } = buildController();

    await controller.findById('service-1');

    expect(findServiceById.execute).toHaveBeenCalledWith({ id: 'service-1' });
  });

  it('delegates creating a service to CreateServiceUseCase', async () => {
    const { controller, createService } = buildController();
    const body = { name: 'Tatuagem Fineline', duration: 60, depositAmount: 5000 };

    await controller.create(payload, body);

    expect(createService.execute).toHaveBeenCalledWith({ userId: payload.sub, ...body });
  });

  it('delegates updating a service to UpdateServiceInfoUseCase', async () => {
    const { controller, updateServiceInfo } = buildController();
    const body = { name: 'Blackwork' };

    await controller.update(payload, 'service-1', body);

    expect(updateServiceInfo.execute).toHaveBeenCalledWith({
      serviceId: 'service-1',
      userId: payload.sub,
      ...body,
    });
  });

  it('delegates updating the status to UpdateServiceStatusUseCase', async () => {
    const { controller, updateServiceStatus } = buildController();
    const body = { status: false };

    await controller.updateStatus('service-1', body);

    expect(updateServiceStatus.execute).toHaveBeenCalledWith({
      serviceId: 'service-1',
      status: body.status,
    });
  });
});
