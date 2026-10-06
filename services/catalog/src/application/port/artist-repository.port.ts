import type { ArtistEntity } from '@/domain/entities/artist.entity';

export const ARTIST_REPOSITORY = Symbol('ARTIST_REPOSITORY');

export interface ArtistRepository {
  findById(id: string): Promise<ArtistEntity | null>;
  findByIds(ids: string[]): Promise<ArtistEntity[]>;
  findInactiveIds(): Promise<string[]>;
  save(artist: ArtistEntity): Promise<void>;
}
