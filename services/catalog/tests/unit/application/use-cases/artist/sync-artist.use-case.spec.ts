import { beforeEach, describe, expect, it, mock } from 'bun:test';

import { SyncArtistUseCase } from '@/application/use-cases/artist/sync-artist.use-case';
import { type ArtistEntity, ArtistStatus } from '@/domain/entities/artist.entity';
import { createArtistRepositoryMock, createCacheMock } from '@tests/unit/support/mocks';
import { buildArtist } from '@tests/unit/support/builders';

const change = {
  artistId: 'user-1',
  name: 'Joao Guilherme',
  image: 'https://bookink-assets.s3.amazonaws.com/avatars/user-1/joao.png',
  status: ArtistStatus.ACTIVE,
  occurredAt: new Date('2026-10-06T12:00:00.000Z'),
};

describe('SyncArtistUseCase', () => {
  let artists: ReturnType<typeof createArtistRepositoryMock>;
  let cache: ReturnType<typeof createCacheMock>;
  let useCase: SyncArtistUseCase;

  beforeEach(() => {
    artists = createArtistRepositoryMock();
    cache = createCacheMock();
    useCase = new SyncArtistUseCase(artists, cache);
  });

  it('creates the artist when it is not in the projection yet', async () => {
    const save = mock(async (_artist: ArtistEntity) => undefined);
    artists.save = save;

    await useCase.execute(change);

    const saved = save.mock.calls[0][0];
    expect(saved.id).toBe('user-1');
    expect(saved.name).toBe('Joao Guilherme');
    expect(saved.lastEventAt).toEqual(change.occurredAt);
    expect(cache.invalidate).toHaveBeenCalledWith('catalog:public:galeries');
  });

  it('applies a newer change to the existing artist', async () => {
    artists.findById = async () =>
      buildArtist({ name: 'Joao', occurredAt: new Date('2026-10-05T12:00:00.000Z') });
    const save = mock(async (_artist: ArtistEntity) => undefined);
    artists.save = save;

    await useCase.execute({ ...change, status: ArtistStatus.INACTIVE });

    const saved = save.mock.calls[0][0];
    expect(saved.name).toBe('Joao Guilherme');
    expect(saved.status).toBe(ArtistStatus.INACTIVE);
    expect(saved.lastEventAt).toEqual(change.occurredAt);
    expect(cache.invalidate).toHaveBeenCalledWith('catalog:public:galeries');
  });

  it('ignores an event older than the last one applied', async () => {
    artists.findById = async () =>
      buildArtist({ occurredAt: new Date('2026-10-07T12:00:00.000Z') });

    await useCase.execute(change);

    expect(artists.save).not.toHaveBeenCalled();
    expect(cache.invalidate).not.toHaveBeenCalled();
  });

  it('ignores a redelivered event', async () => {
    artists.findById = async () => buildArtist({ occurredAt: change.occurredAt });

    await useCase.execute(change);

    expect(artists.save).not.toHaveBeenCalled();
  });
});
