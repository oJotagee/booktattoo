import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import type { ServiceRepository } from '../../port/service-repository.port';
import { SERVICE_REPOSITORY } from '../../port/service-repository.port';
import { ServiceNotFoundError } from '@/domain/errors/service.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import { PUBLIC_SERVICES_CACHE } from '@/application/cache/public-cache';

type UpdateServiceInfoInput = {
  serviceId: string;
  userId: string;
  name?: string;
  duration?: number;
  depositAmount?: number;
};

type UpdateServiceInfoOutput = {
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
export class UpdateServiceInfoUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY)
    private readonly services: ServiceRepository,
    @Inject(CACHE_PORT)
    private readonly cache: CachePort,
  ) {}

  async execute({ serviceId, ...input }: UpdateServiceInfoInput): Promise<UpdateServiceInfoOutput> {
    const service = await this.services.findById(serviceId);
    if (!service) throw new ServiceNotFoundError(serviceId);

    if (service.userId !== input.userId) throw new ForbiddenResourceAccessError();

    const updatedService = service.updateInfo({
      name: input.name,
      duration: input.duration,
      depositAmount: input.depositAmount,
    });

    await this.services.update(updatedService);
    await this.cache.invalidate(PUBLIC_SERVICES_CACHE);

    return {
      id: updatedService.id,
      name: updatedService.name,
      duration: updatedService.duration,
      depositAmount: updatedService.depositAmount,
      status: updatedService.status,
      userId: updatedService.userId,
      createdAt: updatedService.createdAt,
      updatedAt: updatedService.updatedAt,
    };
  }
}
