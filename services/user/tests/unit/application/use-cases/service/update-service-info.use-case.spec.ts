import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateServiceInfoUseCase } from '@/application/use-cases/service/update-service-info.use-case';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import { buildService } from '@tests/unit/support/builders';
import { createServiceRepositoryMock } from '@tests/unit/support/mocks';

describe('UpdateServiceInfoUseCase', () => {
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let useCase: UpdateServiceInfoUseCase;

  beforeEach(() => {
    services = createServiceRepositoryMock();
    useCase = new UpdateServiceInfoUseCase(services);
  });

  it('updates the info of an existing service', async () => {
    const service = buildService({ id: 'service-1', name: 'Fineline' });
    services.findById = async () => service;
    services.update = async () => undefined;

    const result = await useCase.execute({
      serviceId: 'service-1',
      userId: 'user-1',
      name: 'Blackwork',
      duration: 90,
    });

    expect(result).toMatchObject({
      id: 'service-1',
      name: 'Blackwork',
      duration: 90,
      depositAmount: service.depositAmount,
    });
  });

  it('keeps existing fields untouched when not provided', async () => {
    const service = buildService({ id: 'service-1', name: 'Fineline', depositAmount: 5000 });
    services.findById = async () => service;

    const result = await useCase.execute({
      serviceId: 'service-1',
      userId: 'user-1',
      duration: 120,
    });

    expect(result.name).toBe('Fineline');
    expect(result.depositAmount).toBe(5000);
    expect(result.duration).toBe(120);
  });

  it('allows updating to a name already used by another service', async () => {
    const service = buildService({ id: 'service-1', name: 'Fineline' });
    services.findById = async () => service;

    const result = await useCase.execute({
      serviceId: 'service-1',
      userId: 'user-1',
      name: 'Blackwork',
    });

    expect(result.name).toBe('Blackwork');
  });

  it('throws ServiceNotFoundError when the service does not exist', async () => {
    services.findById = async () => null;

    await expect(
      useCase.execute({ serviceId: 'missing-service', userId: 'user-1', name: 'Blackwork' }),
    ).rejects.toThrow(ServiceNotFoundError);
  });

  it('throws when the service belongs to another user', async () => {
    services.findById = async () => buildService({ id: 'service-1', userId: 'user-1' });

    await expect(
      useCase.execute({ serviceId: 'service-1', userId: 'user-2', name: 'Blackwork' }),
    ).rejects.toThrow('Usuario não autorizado');
    expect(services.update).not.toHaveBeenCalled();
  });
});
