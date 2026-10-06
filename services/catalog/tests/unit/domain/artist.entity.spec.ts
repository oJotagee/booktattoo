import { describe, expect, it } from 'bun:test';

import { ArtistEntity, ArtistStatus } from '@/domain/entities/artist.entity';
import { InvalidArtistError } from '@/domain/errors/artist.error';
import { buildArtist } from '@tests/unit/support/builders';

describe('ArtistEntity', () => {
  it('uses the event time as lastEventAt on create', () => {
    const occurredAt = new Date('2026-10-06T12:00:00.000Z');

    const artist = buildArtist({ occurredAt });

    expect(artist.lastEventAt).toEqual(occurredAt);
  });

  it('is outdated only by strictly newer events', () => {
    const artist = buildArtist({ occurredAt: new Date('2026-10-06T12:00:00.000Z') });

    expect(artist.isOutdatedBy(new Date('2026-10-06T12:00:01.000Z'))).toBe(true);
    expect(artist.isOutdatedBy(new Date('2026-10-06T12:00:00.000Z'))).toBe(false);
    expect(artist.isOutdatedBy(new Date('2026-10-06T11:59:59.000Z'))).toBe(false);
  });

  it('reports inactive artists', () => {
    expect(buildArtist({ status: ArtistStatus.INACTIVE }).isInactive).toBe(true);
    expect(buildArtist({ status: ArtistStatus.VACATION }).isInactive).toBe(false);
  });

  it('rejects an unknown status', () => {
    expect(() =>
      ArtistEntity.create({
        id: 'user-1',
        name: 'John Doe',
        image: null,
        status: 'BANNED' as ArtistStatus,
        occurredAt: new Date(),
      }),
    ).toThrow(InvalidArtistError);
  });

  it('rejects an empty name', () => {
    expect(() => buildArtist({ name: ' ' })).toThrow(InvalidArtistError);
  });
});
