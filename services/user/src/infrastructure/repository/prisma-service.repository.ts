import type {
  FindByUserIdParams,
  PaginatedResult,
  ServiceRepository,
} from '@/application/port/service-repository.port';
import { ServiceEntity } from '@/domain/entities/service.entity';
import { Injectable } from '@nestjs/common';
import { ServiceMapper } from '../persistence/service.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<ServiceEntity | null> {
    const service = await this.prisma.service.findUnique({ where: { id } });

    return service ? ServiceMapper.toDomain(service) : null;
  }

  async findByUserId({
    userId,
    limit,
    offset,
  }: FindByUserIdParams): Promise<PaginatedResult<ServiceEntity>> {
    const [services, total] = await Promise.all([
      this.prisma.service.findMany({ where: { userId }, take: limit, skip: offset }),
      this.prisma.service.count({ where: { userId } }),
    ]);

    return { items: services.map(ServiceMapper.toDomain), total };
  }

  async create(service: ServiceEntity): Promise<void> {
    const data = ServiceMapper.toPersistence(service);

    await this.prisma.service.create({ data });
  }

  async update(service: ServiceEntity): Promise<void> {
    const data = ServiceMapper.toPersistence(service);

    await this.prisma.service.update({ where: { id: service.id }, data });
  }
}
