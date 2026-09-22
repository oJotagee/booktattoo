import { beforeEach, describe, expect, it } from 'bun:test';

import { FindServiceByIdUseCase } from '@/application/use-cases/service/find-service-by-id.use-case';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import { buildService } from '@tests/unit/support/builders';
import { createServiceRepositoryMock } from '@tests/unit/support/mocks';

describe('FindServiceByIdUseCase', () => {
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let useCase: FindServiceByIdUseCase;

  beforeEach(() => {
    services = createServiceRepositoryMock();
    useCase = new FindServiceByIdUseCase(services);
  });

  it('returns the service data when the service exists', async () => {
    const service = buildService({ id: 'service-1', name: 'Tatuagem Fineline' });
    services.findById = async () => service;

    const result = await useCase.execute({ id: 'service-1' });

    expect(result).toEqual({
      id: service.id,
      name: service.name,
      duration: service.duration,
      depositAmount: service.depositAmount,
      status: service.status,
      userId: service.userId,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    });
  });

  it('throws ServiceNotFoundError when the service does not exist', async () => {
    services.findById = async () => null;

    await expect(useCase.execute({ id: 'missing-service' })).rejects.toThrow(ServiceNotFoundError);
  });
});
