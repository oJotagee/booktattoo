import type {
  FindGaleriesByUserIdParams,
  FindPublicGaleriesParams,
  GaleryRepository,
} from '@/application/port/galery-repository.port';
import type { PaginatedResult } from '@/application/port/service-repository.port';
import { GaleryEntity } from '@/domain/entities/galery.entity';
import { Injectable } from '@nestjs/common';
import { GaleryMapper } from '../persistence/galery.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaGaleryRepository implements GaleryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<GaleryEntity | null> {
    const galery = await this.prisma.galery.findUnique({ where: { id } });

    return galery ? GaleryMapper.toDomain(galery) : null;
  }

  async findByUserId({
    userId,
    limit,
    offset,
    style,
  }: FindGaleriesByUserIdParams): Promise<PaginatedResult<GaleryEntity>> {
    const where = { userId, ...(style && { style }) };

    const [galeries, total] = await Promise.all([
      this.prisma.galery.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.galery.count({ where }),
    ]);

    return { items: galeries.map(GaleryMapper.toDomain), total };
  }

  async findPublic({
    userId,
    limit,
    offset,
    style,
  }: FindPublicGaleriesParams): Promise<PaginatedResult<GaleryEntity>> {
    const where = { available: true, ...(userId && { userId }), ...(style && { style }) };

    const [galeries, total] = await Promise.all([
      this.prisma.galery.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.galery.count({ where }),
    ]);

    return { items: galeries.map(GaleryMapper.toDomain), total };
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.galery.count({ where: { userId } });
  }

  async create(galery: GaleryEntity): Promise<void> {
    const data = GaleryMapper.toPersistence(galery);

    await this.prisma.galery.create({ data });
  }

  async update(galery: GaleryEntity): Promise<void> {
    const data = GaleryMapper.toPersistence(galery);

    await this.prisma.galery.update({ where: { id: galery.id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.galery.delete({ where: { id } });
  }
}
