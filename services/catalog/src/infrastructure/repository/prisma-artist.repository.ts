import { Injectable } from '@nestjs/common';

import type { ArtistRepository } from '@/application/port/artist-repository.port';
import { type ArtistEntity, ArtistStatus } from '@/domain/entities/artist.entity';
import { ArtistMapper } from '../persistence/artist.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaArtistRepository implements ArtistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ArtistEntity | null> {
    const artist = await this.prisma.artist.findUnique({ where: { id } });

    return artist ? ArtistMapper.toDomain(artist) : null;
  }

  async findByIds(ids: string[]): Promise<ArtistEntity[]> {
    if (ids.length === 0) return [];

    const artists = await this.prisma.artist.findMany({ where: { id: { in: ids } } });

    return artists.map(ArtistMapper.toDomain);
  }

  async findInactiveIds(): Promise<string[]> {
    const artists = await this.prisma.artist.findMany({
      where: { status: ArtistStatus.INACTIVE },
      select: { id: true },
    });

    return artists.map(({ id }) => id);
  }

  async save(artist: ArtistEntity): Promise<void> {
    const { id, createdAt, ...changes } = ArtistMapper.toPersistence(artist);

    await this.prisma.artist.upsert({
      where: { id },
      create: { id, createdAt, ...changes },
      update: changes,
    });
  }
}
