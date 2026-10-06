import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { FindPublicGaleriesUseCase } from '@/application/use-cases/galery/find-public-galeries.use-case';
import { GaleryStyle } from '@/domain/entities/galery.entity';
import { buildArtist, buildGalery } from '@tests/unit/support/builders';
import {
  createArtistRepositoryMock,
  createCacheMock,
  createGaleryRepositoryMock,
} from '@tests/unit/support/mocks';

describe('FindPublicGaleriesUseCase', () => {
  let galeries: ReturnType<typeof createGaleryRepositoryMock>;
  let artists: ReturnType<typeof createArtistRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: FindPublicGaleriesUseCase;

  beforeEach(() => {
    galeries = createGaleryRepositoryMock();
    artists = createArtistRepositoryMock();
    cache = createCacheMock();
    useCase = new FindPublicGaleriesUseCase(galeries, artists, cache);
  });

  it('returns only the public fields of each galery', async () => {
    const galery = buildGalery({ id: 'galery-1', userId: 'user-1', serviceId: 'service-1' });
    galeries.findPublic = async () => ({ items: [galery], total: 1 });

    const result = await useCase.execute({});

    expect(result.list).toEqual([
      {
        id: 'galery-1',
        title: 'Rosa fineline',
        imageUrl: 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/rosa.png',
        size: '10x15cm',
        price: 35000,
        style: GaleryStyle.FINELINE,
        userId: 'user-1',
        artistName: null,
        serviceId: 'service-1',
      },
    ]);
  });

  it('returns an empty page when there are no galeries', async () => {
    const result = await useCase.execute({});

    expect(result.list).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('defaults limit and offset when not provided', async () => {
    const findPublic = mock(async () => ({ items: [], total: 0 }));
    galeries.findPublic = findPublic;

    await useCase.execute({});

    expect(findPublic).toHaveBeenCalledWith({ limit: 10, offset: 0 });
  });

  it('forwards the userId and style filters, limit and offset', async () => {
    const findPublic = mock(async () => ({ items: [], total: 0 }));
    galeries.findPublic = findPublic;

    await useCase.execute({
      userId: 'user-1',
      style: GaleryStyle.BLACKWORK,
      limit: 5,
      offset: 15,
    });

    expect(findPublic).toHaveBeenCalledWith({
      userId: 'user-1',
      style: GaleryStyle.BLACKWORK,
      limit: 5,
      offset: 15,
    });
  });

  it('caps the limit at 50', async () => {
    const findPublic = mock(async () => ({ items: [], total: 0 }));
    galeries.findPublic = findPublic;

    const result = await useCase.execute({ limit: 1000 });

    expect(findPublic).toHaveBeenCalledWith({ limit: 50, offset: 0 });
    expect(result.pagination.perPage).toBe(50);
  });

  it('computes page and totalPages from limit, offset and total', async () => {
    galeries.findPublic = async () => ({ items: [buildGalery()], total: 23 });

    const result = await useCase.execute({ limit: 10, offset: 20 });

    expect(result.pagination).toEqual({ total: 23, page: 3, perPage: 10, totalPages: 3 });
  });

  it('caches the result under a key built from the normalized filters', async () => {
    await useCase.execute({ userId: 'user-1', style: GaleryStyle.BLACKWORK, limit: 1000 });

    expect(cache.getOrLoad).toHaveBeenCalledWith(
      'catalog:public:galeries',
      'user=user-1:style=BLACKWORK:limit=50:offset=0',
      expect.any(Function),
    );
  });

  it('returns the cached result without querying the repository', async () => {
    const findPublic = mock(async () => ({ items: [], total: 0 }));
    galeries.findPublic = findPublic;
    const cached = { list: [], pagination: { total: 7, page: 1, perPage: 10, totalPages: 1 } };
    cache.getOrLoad = mock(async () => cached) as typeof cache.getOrLoad;

    const result = await useCase.execute({});

    expect(result).toBe(cached);
    expect(findPublic).not.toHaveBeenCalled();
  });

  it('returns the artist name from the local artist projection', async () => {
    galeries.findPublic = async () => ({
      items: [buildGalery({ id: 'galery-1', userId: 'user-1' })],
      total: 1,
    });
    const findByIds = mock(async () => [buildArtist({ id: 'user-1', name: 'Joao Guilherme' })]);
    artists.findByIds = findByIds;

    const result = await useCase.execute({});

    expect(findByIds).toHaveBeenCalledWith(['user-1']);
    expect(result.list[0]?.artistName).toBe('Joao Guilherme');
  });

  it('hides galeries of inactive artists', async () => {
    const findPublic = mock(async () => ({ items: [], total: 0 }));
    galeries.findPublic = findPublic;
    artists.findInactiveIds = async () => ['user-2'];

    await useCase.execute({});

    expect(findPublic).toHaveBeenCalledWith({ excludeUserIds: ['user-2'], limit: 10, offset: 0 });
  });
});
