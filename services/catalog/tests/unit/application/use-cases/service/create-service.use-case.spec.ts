import { beforeEach, describe, expect, it } from 'bun:test';

import { CreateServiceUseCase } from '@/application/use-cases/service/create-service.use-case';
import { createServiceRepositoryMock } from '@tests/unit/support/mocks';

describe('CreateServiceUseCase', () => {
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let useCase: CreateServiceUseCase;

  beforeEach(() => {
    services = createServiceRepositoryMock();
    useCase = new CreateServiceUseCase(services);
  });

  it('creates a service active by default for the given user', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      name: 'Tatuagem Fineline',
      duration: 60,
      depositAmount: 5000,
    });

    expect(result).toMatchObject({
      userId: 'user-1',
      name: 'Tatuagem Fineline',
      duration: 60,
      depositAmount: 5000,
      status: true,
    });
  });

  it('persists the created service', async () => {
    await useCase.execute({
      userId: 'user-1',
      name: 'Tatuagem Fineline',
      duration: 60,
      depositAmount: 5000,
    });

    expect(services.create).toHaveBeenCalledTimes(1);
  });

  it('allows creating a service with the same name as an existing one', async () => {
    const first = await useCase.execute({
      userId: 'user-1',
      name: 'Tatuagem Fineline',
      duration: 60,
      depositAmount: 5000,
    });

    const second = await useCase.execute({
      userId: 'user-1',
      name: 'Tatuagem Fineline',
      duration: 90,
      depositAmount: 7000,
    });

    expect(first.name).toBe(second.name);
    expect(services.create).toHaveBeenCalledTimes(2);
  });
});
