import { beforeEach, describe, expect, it } from 'bun:test';

import { FindPublicGaleryByIdUseCase } from '@/application/use-cases/galery/find-public-galery-by-id.use-case';
import { ArtistStatus } from '@/domain/entities/artist.entity';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { buildArtist, buildGalery, buildService } from '@tests/unit/support/builders';
import {
  createArtistRepositoryMock,
  createCacheMock,
  createGaleryRepositoryMock,
  createServiceRepositoryMock,
} from '@tests/unit/support/mocks';

describe('FindPublicGaleryByIdUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let services: ReturnType<typeof createServiceRepositoryMock>;
  let artists: ReturnType<typeof createArtistRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: FindPublicGaleryByIdUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    services = createServiceRepositoryMock();
    artists = createArtistRepositoryMock();
    cache = createCacheMock();
    useCase = new FindPublicGaleryByIdUseCase(galeries, services, artists, cache);
  });

  it('returns the galery with the service duration and deposit', async () => {
    galeries.findById = async () => buildGalery();
    services.findById = async () => buildService({ duration: 90, depositAmount: 8000 });
    artists.findById = async () => buildArtist({ name: 'Ana Lima' });

    const result = await useCase.execute({ id: 'galery-1' });

    expect(result).toMatchObject({
      id: 'galery-1',
      available: true,
      artistName: 'Ana Lima',
      service: { duration: 90, depositAmount: 8000 },
    });
  });

  it('throws when the galery does not exist', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(GaleryNotFoundError);
  });

  it('hides galeries of inactive artists', async () => {
    galeries.findById = async () => buildGalery();
    services.findById = async () => buildService();
    artists.findById = async () => buildArtist({ status: ArtistStatus.INACTIVE });

    await expect(useCase.execute({ id: 'galery-1' })).rejects.toBeInstanceOf(GaleryNotFoundError);
  });
});

describe('FindPublicGaleryByIdUseCase cache', () => {
  it('caches the galery in the public galeries namespace by id', async () => {
    const galeries = createGaleryRepositoryMock();
    const services = createServiceRepositoryMock();
    const cache = createCacheMock();
    galeries.findById = async () => buildGalery();
    services.findById = async () => buildService();

    await new FindPublicGaleryByIdUseCase(
      galeries,
      services,
      createArtistRepositoryMock(),
      cache,
    ).execute({ id: 'galery-1' });

    expect(cache.getOrLoad).toHaveBeenCalledWith(
      'catalog:public:galeries',
      'id=galery-1',
      expect.any(Function),
    );
  });
});
