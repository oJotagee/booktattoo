import { Inject, Injectable } from '@nestjs/common';

import type { GaleryRepository } from '../../port/galery-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import type { GaleryStyle } from '@/domain/entities/galery.entity';
import { GaleryNotFoundError } from '@/domain/errors/galery.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';

type FindGaleryByIdOutput = {
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
export class FindGaleryByIdUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<FindGaleryByIdOutput> {
    const galery = await this.galeries.findById(id);

    if (!galery) throw new GaleryNotFoundError(id);

    if (galery.userId !== userId) throw new ForbiddenResourceAccessError();

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
