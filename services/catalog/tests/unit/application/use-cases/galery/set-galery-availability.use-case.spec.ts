import { beforeEach, describe, expect, it, type Mock } from 'bun:test';

import { SetGaleryAvailabilityUseCase } from '@/application/use-cases/galery/set-galery-availability.use-case';
import { PUBLIC_GALERIES_CACHE } from '@/application/cache/public-cache';
import type { GaleryRepository } from '@/application/port/galery-repository.port';
import { buildGalery } from '@tests/unit/support/builders';
import { createCacheMock, createGaleryRepositoryMock } from '@tests/unit/support/mocks';

describe('SetGaleryAvailabilityUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: SetGaleryAvailabilityUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    cache = createCacheMock();
    useCase = new SetGaleryAvailabilityUseCase(galeries, cache);
  });

  it('marks an available galery as reserved and invalidates the public cache', async () => {
    galeries.findById = async () => buildGalery();

    await useCase.execute({ galeryId: 'galery-1', available: false });

    expect(galeries.update).toHaveBeenCalledTimes(1);
    const [updated] = (galeries.update as Mock<GaleryRepository['update']>).mock.calls[0] ?? [];
    expect(updated?.available).toBe(false);
    expect(cache.invalidate).toHaveBeenCalledWith(PUBLIC_GALERIES_CACHE);
  });

  it('does nothing when the galery is already in the requested state', async () => {
    galeries.findById = async () => buildGalery();

    await useCase.execute({ galeryId: 'galery-1', available: true });

    expect(galeries.update).not.toHaveBeenCalled();
    expect(cache.invalidate).not.toHaveBeenCalled();
  });

  it('ignores unknown galeries', async () => {
    await useCase.execute({ galeryId: 'missing', available: false });

    expect(galeries.update).not.toHaveBeenCalled();
  });
});
