import type { GaleryModel as PrismaGalery } from '@generated/prisma/models';

import { GaleryEntity, type GaleryStyle } from '@/domain/entities/galery.entity';

export class GaleryMapper {
  static toDomain(galery: PrismaGalery): GaleryEntity {
    return GaleryEntity.restore({
      id: galery.id,
      title: galery.title,
      imageUrl: galery.imageUrl,
      size: galery.size ?? '',
      price: galery.price,
      style: galery.style as GaleryStyle,
      available: galery.available,
      userId: galery.userId,
      serviceId: galery.serviceId,
      createdAt: galery.createdAt,
      updatedAt: galery.updatedAt,
    });
  }

  static toPersistence(galery: GaleryEntity): PrismaGalery {
    return {
      id: galery.id,
      title: galery.title,
      imageUrl: galery.imageUrl,
      size: galery.size,
      price: galery.price,
      style: galery.style,
      available: galery.available,
      userId: galery.userId,
      serviceId: galery.serviceId,
      createdAt: galery.createdAt,
      updatedAt: galery.updatedAt,
    };
  }
}
