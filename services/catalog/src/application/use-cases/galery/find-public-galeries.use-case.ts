import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import type { GaleryRepository } from '../../port/galery-repository.port';
import { GALERY_REPOSITORY } from '../../port/galery-repository.port';
import type { GaleryStyle } from '@/domain/entities/galery.entity';
import { PUBLIC_GALERIES_CACHE } from '@/application/cache/public-cache';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DEFAULT_OFFSET = 0;

type FindPublicGaleriesInput = {
  userId?: string;
  limit?: number;
  offset?: number;
  style?: GaleryStyle;
};

type PublicGaleryOutput = {
  id: string;
  title: string;
  imageUrl: string;
  size: string;
  price: number;
  style: GaleryStyle;
  userId: string;
  serviceId: string;
};

type FindPublicGaleriesOutput = {
  list: PublicGaleryOutput[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

@Injectable()
export class FindPublicGaleriesUseCase {
  constructor(
    @Inject(GALERY_REPOSITORY)
    private readonly galeries: GaleryRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({
    userId,
    limit,
    offset,
    style,
  }: FindPublicGaleriesInput): Promise<FindPublicGaleriesOutput> {
    const perPage = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const currentOffset = offset ?? DEFAULT_OFFSET;
    const key = `user=${userId ?? ''}:style=${style ?? ''}:limit=${perPage}:offset=${currentOffset}`;

    return this.cache.getOrLoad(PUBLIC_GALERIES_CACHE, key, async () => {
      const { items, total } = await this.galeries.findPublic({
        ...(userId && { userId }),
        ...(style && { style }),
        limit: perPage,
        offset: currentOffset,
      });

      return {
        list: items.map((galery) => ({
          id: galery.id,
          title: galery.title,
          imageUrl: galery.imageUrl,
          size: galery.size,
          price: galery.price,
          style: galery.style,
          userId: galery.userId,
          serviceId: galery.serviceId,
        })),
        pagination: {
          total,
          page: Math.floor(currentOffset / perPage) + 1,
          perPage,
          totalPages: Math.ceil(total / perPage),
        },
      };
    });
  }
}
