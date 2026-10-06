import type { ArtistModel as PrismaArtist } from '@generated/prisma/models';

import { ArtistEntity, type ArtistStatus } from '@/domain/entities/artist.entity';

export class ArtistMapper {
  static toDomain(artist: PrismaArtist): ArtistEntity {
    return ArtistEntity.restore({
      id: artist.id,
      name: artist.name,
      image: artist.image,
      status: artist.status as ArtistStatus,
      lastEventAt: artist.lastEventAt,
      createdAt: artist.createdAt,
      updatedAt: artist.updatedAt,
    });
  }

  static toPersistence(artist: ArtistEntity): PrismaArtist {
    return {
      id: artist.id,
      name: artist.name,
      image: artist.image,
      status: artist.status,
      lastEventAt: artist.lastEventAt,
      createdAt: artist.createdAt,
      updatedAt: artist.updatedAt,
    };
  }
}
