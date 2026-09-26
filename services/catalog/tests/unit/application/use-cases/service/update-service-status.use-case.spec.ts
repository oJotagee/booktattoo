import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateServiceStatusUseCase } from '@/application/use-cases/service/update-service-status.use-case';
import { ServiceAlreadyInStatusError, ServiceNotFoundError } from '@/domain/errors/service.error';
import { buildService } from '@tests/unit/support/builders';
import { createServiceRepositoryMock } from '@tests/unit/support/mocks';

describe('UpdateServiceStatusUseCase', () => {
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let useCase: UpdateServiceStatusUseCase;

  beforeEach(() => {
    services = createServiceRepositoryMock();
    useCase = new UpdateServiceStatusUseCase(services);
  });

  it('activates an inactive service', async () => {
    const service = buildService().deactivate();
    services.findById = async () => service;

    const result = await useCase.execute({ serviceId: service.id, status: true, userId: 'user-1' });

    expect(result.status).toBe(true);
  });

  it('deactivates an active service', async () => {
    const service = buildService();
    services.findById = async () => service;

    const result = await useCase.execute({
      serviceId: service.id,
      status: false,
      userId: 'user-1',
    });

    expect(result.status).toBe(false);
  });

  it('throws ServiceAlreadyInStatusError when the service is already in the target status', async () => {
    const service = buildService();
    services.findById = async () => service;

    await expect(
      useCase.execute({ serviceId: service.id, status: true, userId: 'user-1' }),
    ).rejects.toThrow(ServiceAlreadyInStatusError);
  });

  it('throws ServiceNotFoundError when the service does not exist', async () => {
    services.findById = async () => null;

    await expect(
      useCase.execute({ serviceId: 'missing-service', status: true, userId: 'user-1' }),
    ).rejects.toThrow(ServiceNotFoundError);
  });

  it('throws when the service belongs to another user', async () => {
    const service = buildService({ userId: 'user-1' });
    services.findById = async () => service;

    await expect(
      useCase.execute({ serviceId: service.id, status: false, userId: 'user-2' }),
    ).rejects.toThrow('Usuario não autorizado');
    expect(services.update).not.toHaveBeenCalled();
  });
});
