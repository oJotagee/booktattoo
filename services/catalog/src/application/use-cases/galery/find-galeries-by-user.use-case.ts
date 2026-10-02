import { Inject, Injectable } from '@nestjs/common';

import type { GaleryRepository } from '../../port/galery-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import type { GaleryStyle } from '@/domain/entities/galery.entity';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

type FindGaleriesByUserInput = {
  userId: string;
  limit?: number;
  offset?: number;
  style?: GaleryStyle;
};

type GaleryOutput = {
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

type FindGaleriesByUserOutput = {
  list: GaleryOutput[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

@Injectable()
export class FindGaleriesByUserUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
  ) {}

  async execute({
    userId,
    limit,
    offset,
    style,
  }: FindGaleriesByUserInput): Promise<FindGaleriesByUserOutput> {
    const perPage = limit ?? DEFAULT_LIMIT;
    const currentOffset = offset ?? DEFAULT_OFFSET;

    const { items, total } = await this.galeries.findByUserId({
      userId,
      limit: perPage,
      offset: currentOffset,
      ...(style && { style }),
    });

    return {
      list: items.map((galery) => ({
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
      })),
      pagination: {
        total,
        page: Math.floor(currentOffset / perPage) + 1,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }
}
