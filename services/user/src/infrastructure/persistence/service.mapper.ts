import type { ServiceModel as PrismaService } from '@generated/prisma/models';

import { ServiceEntity } from '@/domain/entities/service.entity';

export class ServiceMapper {
  static toDomain(service: PrismaService): ServiceEntity {
    return ServiceEntity.restore({
      id: service.id,
      name: service.name,
      duration: service.duration,
      depositAmount: service.depositAmount,
      status: service.status,
      userId: service.userId,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    });
  }

  static toPersistence(service: ServiceEntity): PrismaService {
    return {
      id: service.id,
      name: service.name,
      duration: service.duration,
      depositAmount: service.depositAmount,
      status: service.status,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      userId: service.userId,
    };
  }
}
