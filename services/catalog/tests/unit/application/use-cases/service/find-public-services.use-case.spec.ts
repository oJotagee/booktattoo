import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { FindPublicServicesUseCase } from '@/application/use-cases/service/find-public-services.use-case';
import { buildService } from '@tests/unit/support/builders';
import { createServiceRepositoryMock } from '@tests/unit/support/mocks';

describe('FindPublicServicesUseCase', () => {
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let useCase: FindPublicServicesUseCase;

  beforeEach(() => {
    services = createServiceRepositoryMock();
    useCase = new FindPublicServicesUseCase(services);
  });

  it('returns only the public fields of each service', async () => {
    const service = buildService({ id: 'service-1', userId: 'user-1' });
    services.findPublic = async () => ({ items: [service], total: 1 });

    const result = await useCase.execute({});

    expect(result.list).toEqual([
      {
        id: 'service-1',
        name: 'Tatuagem Fineline',
        duration: 60,
        depositAmount: 5000,
        userId: 'user-1',
      },
    ]);
  });

  it('returns an empty page when there are no services', async () => {
    const result = await useCase.execute({});

    expect(result.list).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('defaults limit and offset when not provided', async () => {
    const findPublic = mock(async () => ({ items: [], total: 0 }));
    services.findPublic = findPublic;

    await useCase.execute({});

    expect(findPublic).toHaveBeenCalledWith({ limit: 10, offset: 0 });
  });

  it('forwards the userId filter, limit and offset', async () => {
    const findPublic = mock(async () => ({ items: [], total: 0 }));
    services.findPublic = findPublic;

    await useCase.execute({ userId: 'user-1', limit: 5, offset: 15 });

    expect(findPublic).toHaveBeenCalledWith({ userId: 'user-1', limit: 5, offset: 15 });
  });

  it('caps the limit at 50', async () => {
    const findPublic = mock(async () => ({ items: [], total: 0 }));
    services.findPublic = findPublic;

    const result = await useCase.execute({ limit: 1000 });

    expect(findPublic).toHaveBeenCalledWith({ limit: 50, offset: 0 });
    expect(result.pagination.perPage).toBe(50);
  });

  it('computes page and totalPages from limit, offset and total', async () => {
    services.findPublic = async () => ({ items: [buildService()], total: 23 });

    const result = await useCase.execute({ limit: 10, offset: 20 });

    expect(result.pagination).toEqual({ total: 23, page: 3, perPage: 10, totalPages: 3 });
  });
});
