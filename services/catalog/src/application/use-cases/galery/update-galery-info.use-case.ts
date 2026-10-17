import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import { GaleryNotFoundError, GaleryPriceBelowDepositError } from '@/domain/errors/galery.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import type { ServiceRepository } from '../../port/service-repository.port';
import type { GaleryRepository } from '../../port/galery-repository.port';
import { PUBLIC_GALERIES_CACHE } from '@/application/cache/public-cache';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import type { GaleryStyle } from '@/domain/entities/galery.entity';

type UpdateGaleryInfoInput = {
  galeryId: string;
  userId: string;
  title?: string;
  size?: string;
  price?: number;
  style?: GaleryStyle;
  serviceId?: string;
};

type UpdateGaleryInfoOutput = {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  available: boolean;
  userId: string;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UpdateGaleryInfoUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({
    galeryId,
    userId,
    ...input
  }: UpdateGaleryInfoInput): Promise<UpdateGaleryInfoOutput> {
    const galery = await this.galeries.findById(galeryId);
    if (!galery) throw new GaleryNotFoundError(galeryId);

    if (galery.userId !== userId) throw new ForbiddenResourceAccessError();

    if (input.serviceId !== undefined || input.price !== undefined) {
      const serviceId = input.serviceId ?? galery.serviceId;
      const service = await this.services.findById(serviceId);
      if (!service) throw new ServiceNotFoundError(serviceId);

      if (service.userId !== userId) throw new ForbiddenResourceAccessError();

      if ((input.price ?? galery.price) < service.depositAmount) {
        throw new GaleryPriceBelowDepositError();
      }
    }

    const updatedGalery = galery.update(input);

    await this.galeries.update(updatedGalery);
    await this.cache.invalidate(PUBLIC_GALERIES_CACHE);

    return {
      id: updatedGalery.id,
      title: updatedGalery.title,
      imageUrl: updatedGalery.imageUrl,
      size: updatedGalery.size,
      price: updatedGalery.price,
      style: updatedGalery.style,
      available: updatedGalery.available,
      userId: updatedGalery.userId,
      serviceId: updatedGalery.serviceId,
      createdAt: updatedGalery.createdAt,
      updatedAt: updatedGalery.updatedAt,
    };
  }
}
