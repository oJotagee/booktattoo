import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import type { ArtistRepository } from '../../port/artist-repository.port';
import { ARTIST_REPOSITORY } from '../../port/artist-repository.port';
import { type ArtistChange, ArtistEntity } from '@/domain/entities/artist.entity';
import { PUBLIC_GALERIES_CACHE } from '@/application/cache/public-cache';

type SyncArtistInput = ArtistChange & {
  artistId: string;
};

@Injectable()
export class SyncArtistUseCase {
  constructor(
    @Inject(ARTIST_REPOSITORY)
    private readonly artists: ArtistRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ artistId, ...change }: SyncArtistInput): Promise<void> {
    const current = await this.artists.findById(artistId);

    if (!current) {
      await this.artists.save(ArtistEntity.create({ id: artistId, ...change }));
      await this.cache.invalidate(PUBLIC_GALERIES_CACHE);
      return;
    }

    if (!current.isOutdatedBy(change.occurredAt)) return;

    await this.artists.save(current.applyChange(change));
    await this.cache.invalidate(PUBLIC_GALERIES_CACHE);
  }
}
