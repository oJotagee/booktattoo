import { beforeEach, describe, expect, it } from 'bun:test';

import { UpdateGaleryAvailabilityUseCase } from '@/application/use-cases/galery/update-galery-availability.use-case';
import { GaleryAlreadyInStatusError, GaleryNotFoundError } from '@/domain/errors/galery.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { createGaleryRepositoryMock } from '@tests/unit/support/mocks';
import { buildGalery } from '@tests/unit/support/builders';

describe('UpdateGaleryAvailabilityUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let useCase: UpdateGaleryAvailabilityUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    useCase = new UpdateGaleryAvailabilityUseCase(galeries);
  });

  it('activates an unavailable galery', async () => {
    const galery = buildGalery().deactivate();
    galeries.findById = async () => galery;

    const result = await useCase.execute({
      galeryId: galery.id,
      available: true,
      userId: 'user-1',
    });

    expect(result.available).toBe(true);
  });

  it('deactivates an available galery', async () => {
    const galery = buildGalery();
    galeries.findById = async () => galery;

    const result = await useCase.execute({
      galeryId: galery.id,
      available: false,
      userId: 'user-1',
    });

    expect(result.available).toBe(false);
  });

  it('throws GaleryAlreadyInStatusError when the galery is already in the target status', async () => {
    const galery = buildGalery();
    galeries.findById = async () => galery;

    await expect(
      useCase.execute({ galeryId: galery.id, available: true, userId: 'user-1' }),
    ).rejects.toThrow(GaleryAlreadyInStatusError);
  });

  it('throws GaleryNotFoundError when the galery does not exist', async () => {
    galeries.findById = async () => null;

    await expect(
      useCase.execute({ galeryId: 'missing-galery', available: true, userId: 'user-1' }),
    ).rejects.toThrow(GaleryNotFoundError);
  });

  it('throws ForbiddenResourceAccessError when the galery belongs to another user', async () => {
    const galery = buildGalery({ userId: 'user-1' });
    galeries.findById = async () => galery;

    await expect(
      useCase.execute({ galeryId: galery.id, available: false, userId: 'user-2' }),
    ).rejects.toThrow(ForbiddenResourceAccessError);
    expect(galeries.update).not.toHaveBeenCalled();
  });
});
