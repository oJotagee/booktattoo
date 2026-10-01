import type {
  FindByUserIdParams,
  PaginatedResult,
} from '@/application/port/service-repository.port';
import type { GaleryRepository } from '@/application/port/galery-repository.port';
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
  }: FindByUserIdParams): Promise<PaginatedResult<GaleryEntity>> {
    const [galeries, total] = await Promise.all([
      this.prisma.galery.findMany({
        where: { userId },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.galery.count({ where: { userId } }),
    ]);

    return { items: galeries.map(GaleryMapper.toDomain), total };
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
