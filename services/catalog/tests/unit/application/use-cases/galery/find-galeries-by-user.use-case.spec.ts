import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { FindGaleriesByUserUseCase } from '@/application/use-cases/galery/find-galeries-by-user.use-case';
import { createGaleryRepositoryMock } from '@tests/unit/support/mocks';
import { buildGalery } from '@tests/unit/support/builders';

describe('FindGaleriesByUserUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let useCase: FindGaleriesByUserUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    useCase = new FindGaleriesByUserUseCase(galeries);
  });

  it('returns the paginated galeries belonging to the user', async () => {
    const galeryA = buildGalery({ id: 'galery-1', userId: 'user-1', title: 'Rosa' });
    const galeryB = buildGalery({ id: 'galery-2', userId: 'user-1', title: 'Caveira' });
    galeries.findByUserId = async () => ({ items: [galeryA, galeryB], total: 2 });

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result.list).toHaveLength(2);
    expect(result.list.map((galery) => galery.id)).toEqual(['galery-1', 'galery-2']);
    expect(result.pagination.total).toBe(2);
  });

  it('returns an empty page when the user has no galeries', async () => {
    galeries.findByUserId = async () => ({ items: [], total: 0 });

    const result = await useCase.execute({ userId: 'user-without-galeries' });

    expect(result.list).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('defaults limit and offset when not provided', async () => {
    const findByUserId = mock(async () => ({ items: [], total: 0 }));
    galeries.findByUserId = findByUserId;

    await useCase.execute({ userId: 'user-1' });

    expect(findByUserId).toHaveBeenCalledWith({ userId: 'user-1', limit: 10, offset: 0 });
  });

  it('forwards the given limit and offset', async () => {
    const findByUserId = mock(async () => ({ items: [], total: 0 }));
    galeries.findByUserId = findByUserId;

    await useCase.execute({ userId: 'user-1', limit: 5, offset: 15 });

    expect(findByUserId).toHaveBeenCalledWith({ userId: 'user-1', limit: 5, offset: 15 });
  });

  it('computes page and totalPages from limit, offset and total', async () => {
    const galery = buildGalery({ id: 'galery-1', userId: 'user-1' });
    galeries.findByUserId = async () => ({ items: [galery], total: 23 });

    const result = await useCase.execute({ userId: 'user-1', limit: 10, offset: 20 });

    expect(result.pagination.perPage).toBe(10);
    expect(result.pagination.page).toBe(3);
    expect(result.pagination.totalPages).toBe(3);
  });
});
