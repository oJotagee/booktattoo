import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { FindServicesByUserUseCase } from '@/application/use-cases/service/find-services-by-user.use-case';
import { buildService } from '@tests/unit/support/builders';
import { createServiceRepositoryMock } from '@tests/unit/support/mocks';

describe('FindServicesByUserUseCase', () => {
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let useCase: FindServicesByUserUseCase;

  beforeEach(() => {
    services = createServiceRepositoryMock();
    useCase = new FindServicesByUserUseCase(services);
  });

  it('returns the paginated services belonging to the user', async () => {
    const serviceA = buildService({ id: 'service-1', userId: 'user-1', name: 'Fineline' });
    const serviceB = buildService({ id: 'service-2', userId: 'user-1', name: 'Blackwork' });
    services.findByUserId = async () => ({ items: [serviceA, serviceB], total: 2 });

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.list).toHaveLength(2);
    expect(result.list.map((service) => service.id)).toEqual(['service-1', 'service-2']);
    expect(result.pagination.total).toBe(2);
  });

  it('returns an empty page when the user has no services', async () => {
    services.findByUserId = async () => ({ items: [], total: 0 });

    const result = await useCase.execute({ userId: 'user-without-services' });

    expect(result.list).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('defaults limit and offset when not provided', async () => {
    const findByUserId = mock(async () => ({ items: [], total: 0 }));
    services.findByUserId = findByUserId;

    await useCase.execute({ userId: 'user-1' });

    expect(findByUserId).toHaveBeenCalledWith({ userId: 'user-1', limit: 10, offset: 0 });
  });

  it('forwards the given limit and offset', async () => {
    const findByUserId = mock(async () => ({ items: [], total: 0 }));
    services.findByUserId = findByUserId;

    await useCase.execute({ userId: 'user-1', limit: 5, offset: 15 });

    expect(findByUserId).toHaveBeenCalledWith({ userId: 'user-1', limit: 5, offset: 15 });
  });

  it('computes page and totalPages from limit, offset and total', async () => {
    const service = buildService({ id: 'service-1', userId: 'user-1' });
    services.findByUserId = async () => ({ items: [service], total: 23 });

    const result = await useCase.execute({ userId: 'user-1', limit: 10, offset: 20 });

    expect(result.pagination.perPage).toBe(10);
    expect(result.pagination.page).toBe(3);
    expect(result.pagination.totalPages).toBe(3);
  });
});
