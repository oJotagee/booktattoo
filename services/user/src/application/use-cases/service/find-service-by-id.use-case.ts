import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { ServiceNotFoundError } from '@/domain/errors/service.error';

type FindServiceByIdOutput = {
  id: string;
  name: string;
  duration: number;
  depositAmount: number;
  status: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindServiceByIdUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
  ) {}

  async execute({ id, userId }: { id: string; userId: string }): Promise<FindServiceByIdOutput> {
    const service = await this.services.findById(id);

    if (!service) throw new ServiceNotFoundError(id);

    if (service.userId !== userId) throw new Error('Usuario não autorizado');

    return {
      id: service.id,
      name: service.name,
      duration: service.duration,
      depositAmount: service.depositAmount,
      status: service.status,
      userId: service.userId,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}
