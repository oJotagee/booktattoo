import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

type FindServicesByUserInput = {
  userId: string;
  limit?: number;
  offset?: number;
};

type ServiceOutput = {
  id: string;
  name: string;
  duration: number;
  depositAmount: number;
  status: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type FindServicesByUserOutput = {
  list: ServiceOutput[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

@Injectable()
export class FindServicesByUserUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
  ) {}

  async execute({
    userId,
    limit,
    offset,
  }: FindServicesByUserInput): Promise<FindServicesByUserOutput> {
    const perPage = limit ?? DEFAULT_LIMIT;
    const currentOffset = offset ?? DEFAULT_OFFSET;

    const { items, total } = await this.services.findByUserId({
      userId,
      limit: perPage,
      offset: currentOffset,
    });

    return {
      list: items.map((service) => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        depositAmount: service.depositAmount,
        status: service.status,
        userId: service.userId,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
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
