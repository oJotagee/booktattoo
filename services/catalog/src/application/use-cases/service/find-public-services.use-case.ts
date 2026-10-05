import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DEFAULT_OFFSET = 0;

type FindPublicServicesInput = {
  userId?: string;
  limit?: number;
  offset?: number;
};

type PublicServiceOutput = {
  id: string;
  name: string;
  duration: number;
  depositAmount: number;
  userId: string;
};

type FindPublicServicesOutput = {
  list: PublicServiceOutput[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

@Injectable()
export class FindPublicServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({
    userId,
    limit,
    offset,
  }: FindPublicServicesInput): Promise<FindPublicServicesOutput> {
    const perPage = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const currentOffset = offset ?? DEFAULT_OFFSET;
    const key = `catalog:public:services:user=${userId ?? ''}:limit=${perPage}:offset=${currentOffset}`;

    return this.cache.getOrLoad(key, async () => {
      const { items, total } = await this.services.findPublic({
        ...(userId && { userId }),
        limit: perPage,
        offset: currentOffset,
      });

      return {
        list: items.map((service) => ({
          id: service.id,
          name: service.name,
          duration: service.duration,
          depositAmount: service.depositAmount,
          userId: service.userId,
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
