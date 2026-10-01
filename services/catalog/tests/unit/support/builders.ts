import { GaleryEntity, GaleryStyle } from '@/domain/entities/galery.entity';
import { ServiceEntity } from '@/domain/entities/service.entity';

export function buildService(
  overrides: Partial<{
    id: string;
    name: string;
    duration: number;
    depositAmount: number;
    userId: string;
  }> = {},
): ServiceEntity {
  return ServiceEntity.create({
    id: overrides.id ?? 'service-1',
    name: overrides.name ?? 'Tatuagem Fineline',
    duration: overrides.duration ?? 60,
    depositAmount: overrides.depositAmount ?? 5000,
    userId: overrides.userId ?? 'user-1',
  });
}

export function buildGalery(
  overrides: Partial<{
    id: string;
    title: string;
    imageUrl: string;
    size: string;
    price: number;
    style: GaleryStyle;
    userId: string;
    serviceId: string;
  }> = {},
): GaleryEntity {
  return GaleryEntity.create({
    id: overrides.id ?? 'galery-1',
    title: overrides.title ?? 'Rosa fineline',
    imageUrl:
      overrides.imageUrl ?? 'https://bookink-assets.s3.amazonaws.com/gallery/user-1/rosa.png',
    size: overrides.size ?? '10x15cm',
    price: overrides.price ?? 35000,
    style: overrides.style ?? GaleryStyle.FINELINE,
    userId: overrides.userId ?? 'user-1',
    serviceId: overrides.serviceId ?? 'service-1',
  });
}
