import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import type { GaleryRepository } from '../../port/galery-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import type { GaleryStyle } from '@/domain/entities/galery.entity';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';

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
  ) {}

  async execute({
    galeryId,
    userId,
    ...input
  }: UpdateGaleryInfoInput): Promise<UpdateGaleryInfoOutput> {
    const galery = await this.galeries.findById(galeryId);
    if (!galery) throw new GaleryNotFoundError(galeryId);

    if (galery.userId !== userId) throw new ForbiddenResourceAccessError();

    if (input.serviceId) {
      const service = await this.services.findById(input.serviceId);
      if (!service) throw new ServiceNotFoundError(input.serviceId);

      if (service.userId !== userId) throw new ForbiddenResourceAccessError();
    }

    const updatedGalery = galery.update(input);

    await this.galeries.update(updatedGalery);

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
